const axios = require('axios');

const { getRequestId } = require('../core/requestContext');

const DEFAULT_TIMEOUT_MS = 15000;
const DEFAULT_HEALTH_TIMEOUT_MS = 2500;
const RETRY_DELAY_MS = 150;

const publicMessages = {
  AI_SERVICE_TIMEOUT: "L'analyse prend plus de temps que prevu. Reessayez dans quelques instants.",
  AI_SERVICE_UNAVAILABLE: 'Le service IA est temporairement indisponible.',
  AI_INVALID_RESPONSE: 'Le service IA a retourne une reponse inexploitable.',
  AI_VALIDATION_ERROR: "Les donnees transmises au service d'analyse sont invalides.",
  AI_RATE_LIMITED: 'Trop de demandes IA ont ete envoyees. Reessayez dans quelques instants.',
  AI_INTERNAL_ERROR: "Le service d'analyse a rencontre une erreur interne.",
};

const readPositiveInteger = (value, fallback) => {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

const getAiServiceUrl = () => process.env.AI_SERVICE_URL || 'http://localhost:8000';

const timeoutByWorkflow = {
  health: () => readPositiveInteger(process.env.AI_SERVICE_HEALTH_TIMEOUT_MS, DEFAULT_HEALTH_TIMEOUT_MS),
  matching: () => readPositiveInteger(process.env.AI_MATCHING_TIMEOUT_MS, readPositiveInteger(process.env.AI_SERVICE_TIMEOUT_MS, DEFAULT_TIMEOUT_MS)),
  skillGap: () => readPositiveInteger(process.env.AI_SKILL_GAP_TIMEOUT_MS, 20000),
  careerAssistant: () => readPositiveInteger(process.env.AI_GENERATION_TIMEOUT_MS, 30000),
  motivationLetter: () => readPositiveInteger(process.env.AI_GENERATION_TIMEOUT_MS, 30000),
  orchestrator: () => readPositiveInteger(process.env.AI_GENERATION_TIMEOUT_MS, 30000),
  rag: () => readPositiveInteger(process.env.AI_RAG_TIMEOUT_MS, 15000),
};

class AiServiceError extends Error {
  constructor({ code, statusCode, message, workflow, cause }) {
    super(message || publicMessages[code] || publicMessages.AI_INTERNAL_ERROR);
    this.name = 'AiServiceError';
    this.code = code || 'AI_INTERNAL_ERROR';
    this.statusCode = statusCode || 502;
    this.workflow = workflow || 'unknown';
    this.cause = cause;
  }
}

const isTransientError = (error) => {
  if (!error?.response) return true;
  return [502, 503, 504].includes(error.response.status);
};

const mapAiError = (error, workflow) => {
  if (error instanceof AiServiceError) return error;

  if (error?.code === 'ECONNABORTED' || error?.code === 'ETIMEDOUT') {
    return new AiServiceError({
      code: 'AI_SERVICE_TIMEOUT',
      statusCode: 504,
      workflow,
      cause: error,
    });
  }

  if (!error?.response) {
    return new AiServiceError({
      code: 'AI_SERVICE_UNAVAILABLE',
      statusCode: 503,
      workflow,
      cause: error,
    });
  }

  const upstreamStatus = error.response.status;
  if (upstreamStatus === 400 || upstreamStatus === 422) {
    return new AiServiceError({
      code: 'AI_VALIDATION_ERROR',
      statusCode: 422,
      workflow,
      cause: error,
    });
  }

  if (upstreamStatus === 429) {
    return new AiServiceError({
      code: 'AI_RATE_LIMITED',
      statusCode: 429,
      workflow,
      cause: error,
    });
  }

  if ([502, 503, 504].includes(upstreamStatus)) {
    return new AiServiceError({
      code: upstreamStatus === 504 ? 'AI_SERVICE_TIMEOUT' : 'AI_SERVICE_UNAVAILABLE',
      statusCode: upstreamStatus === 504 ? 504 : 503,
      workflow,
      cause: error,
    });
  }

  return new AiServiceError({
    code: 'AI_INTERNAL_ERROR',
    statusCode: 502,
    workflow,
    cause: error,
  });
};

const wait = (durationMs) => new Promise((resolve) => setTimeout(resolve, durationMs));

const requestAi = async ({
  method = 'post',
  path,
  data,
  workflow = 'ai',
  timeoutMs,
  allowRetry = false,
  validate,
}) => {
  const requestId = getRequestId();
  const timeout = timeoutMs || timeoutByWorkflow[workflow]?.() || readPositiveInteger(process.env.AI_SERVICE_TIMEOUT_MS, DEFAULT_TIMEOUT_MS);
  const maxAttempts = allowRetry ? 2 : 1;
  const startedAt = Date.now();

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      const response = await axios.request({
        baseURL: getAiServiceUrl(),
        method,
        url: path,
        data,
        timeout,
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          ...(requestId ? { 'X-Request-ID': requestId } : {}),
        },
      });

      if (validate && !validate(response.data)) {
        throw new AiServiceError({
          code: 'AI_INVALID_RESPONSE',
          statusCode: 502,
          workflow,
        });
      }

      if (process.env.NODE_ENV !== 'test') {
        console.info('[ai-client]', {
          requestId,
          workflow,
          durationMs: Date.now() - startedAt,
          status: response.status,
          attempt,
        });
      }

      return response.data;
    } catch (error) {
      const mappedError = mapAiError(error, workflow);
      const shouldRetry = attempt < maxAttempts && isTransientError(error);

      if (shouldRetry) {
        await wait(RETRY_DELAY_MS);
        continue;
      }

      if (process.env.NODE_ENV !== 'test') {
        console.error('[ai-client]', {
          requestId,
          workflow,
          durationMs: Date.now() - startedAt,
          status: mappedError.statusCode,
          code: mappedError.code,
          attempt,
        });
      }

      throw mappedError;
    }
  }

  throw new AiServiceError({ code: 'AI_INTERNAL_ERROR', statusCode: 502, workflow });
};

const isObjectResponse = (value) => Boolean(value) && typeof value === 'object' && !Array.isArray(value);

const getAiServiceHealth = () => requestAi({
  method: 'get',
  path: '/health',
  workflow: 'health',
  validate: (value) => isObjectResponse(value) && value.status === 'ok',
});

const toAiHttpError = (result, fallbackMessage) => {
  const error = new Error(result?.error || fallbackMessage || publicMessages.AI_SERVICE_UNAVAILABLE);
  error.statusCode = result?.statusCode || 503;
  error.code = result?.code || 'AI_SERVICE_UNAVAILABLE';
  return error;
};

module.exports = {
  AiServiceError,
  getAiServiceHealth,
  isObjectResponse,
  mapAiError,
  publicMessages,
  requestAi,
  toAiHttpError,
};
