export const apiErrorCodes = {
  NETWORK_ERROR: 'NETWORK_ERROR',
  TIMEOUT: 'TIMEOUT',
  AUTH_EXPIRED: 'AUTH_EXPIRED',
  FORBIDDEN: 'FORBIDDEN',
  NOT_FOUND: 'NOT_FOUND',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  RATE_LIMIT: 'RATE_LIMIT',
  SERVER_ERROR: 'SERVER_ERROR',
  AI_SERVICE_UNAVAILABLE: 'AI_SERVICE_UNAVAILABLE',
  AI_SERVICE_TIMEOUT: 'AI_SERVICE_TIMEOUT',
  AI_INVALID_RESPONSE: 'AI_INVALID_RESPONSE',
  AI_CV_REQUIRED: 'AI_CV_REQUIRED',
  AI_INSUFFICIENT_PROFILE: 'AI_INSUFFICIENT_PROFILE',
  CANCELLED: 'CANCELLED',
  UNKNOWN: 'UNKNOWN',
};

const messages = {
  NETWORK_ERROR: 'Le serveur est inaccessible. Verifiez votre connexion et que le backend est lance.',
  TIMEOUT: 'La requete prend plus de temps que prevu. Reessayez.',
  AUTH_EXPIRED: 'Votre session a expire. Reconnectez-vous.',
  FORBIDDEN: 'Vous n etes pas autorise a effectuer cette action.',
  NOT_FOUND: 'La ressource demandee est introuvable.',
  VALIDATION_ERROR: 'Certaines donnees transmises sont invalides.',
  RATE_LIMIT: 'Trop de demandes ont ete envoyees. Reessayez dans quelques instants.',
  SERVER_ERROR: 'Le serveur a rencontre une erreur. Reessayez dans quelques instants.',
  AI_SERVICE_UNAVAILABLE: 'Le service IA est temporairement indisponible.',
  AI_SERVICE_TIMEOUT: "L'analyse prend plus de temps que prevu. Reessayez.",
  AI_INVALID_RESPONSE: "Le service IA a retourne une reponse inexploitable. Reessayez.",
  AI_CV_REQUIRED: 'Ajoutez votre CV pour utiliser cette analyse.',
  AI_INSUFFICIENT_PROFILE: 'Completez votre profil pour obtenir une analyse pertinente.',
  CANCELLED: 'La requete a ete annulee.',
  UNKNOWN: 'Une erreur inattendue est survenue.',
};

const backendCodeMap = {
  AI_SERVICE_UNAVAILABLE: apiErrorCodes.AI_SERVICE_UNAVAILABLE,
  AI_SERVICE_TIMEOUT: apiErrorCodes.AI_SERVICE_TIMEOUT,
  AI_INVALID_RESPONSE: apiErrorCodes.AI_INVALID_RESPONSE,
  AI_RATE_LIMITED: apiErrorCodes.RATE_LIMIT,
  AI_CV_REQUIRED: apiErrorCodes.AI_CV_REQUIRED,
  AI_INSUFFICIENT_PROFILE: apiErrorCodes.AI_INSUFFICIENT_PROFILE,
};

const resolveCode = (error) => {
  if (error?.code === 'ERR_CANCELED') return apiErrorCodes.CANCELLED;
  if (error?.code === 'ECONNABORTED' || error?.code === 'ETIMEDOUT') return apiErrorCodes.TIMEOUT;

  const backendCode = error?.response?.data?.error?.code;
  if (backendCodeMap[backendCode]) return backendCodeMap[backendCode];

  if (!error?.response) return apiErrorCodes.NETWORK_ERROR;

  const status = error.response.status;
  if (status === 401) return apiErrorCodes.AUTH_EXPIRED;
  if (status === 403) return apiErrorCodes.FORBIDDEN;
  if (status === 404) return apiErrorCodes.NOT_FOUND;
  if (status === 400 || status === 409 || status === 422) return apiErrorCodes.VALIDATION_ERROR;
  if (status === 429) return apiErrorCodes.RATE_LIMIT;
  if (status >= 500) return apiErrorCodes.SERVER_ERROR;
  return apiErrorCodes.UNKNOWN;
};

export const normalizeApiError = (error, fallbackMessage) => {
  if (error?.normalized) return error.normalized;

  const code = resolveCode(error);
  const backendMessage = error?.response?.data?.error?.message || error?.response?.data?.message;
  const allowBackendMessage = error?.response?.status < 500 && typeof backendMessage === 'string';

  return {
    code,
    message: allowBackendMessage ? backendMessage : fallbackMessage || messages[code] || messages.UNKNOWN,
    status: error?.response?.status || null,
    requestId: error?.response?.data?.requestId || error?.response?.headers?.['x-request-id'] || null,
    isCancelled: code === apiErrorCodes.CANCELLED,
  };
};

export const getApiErrorMessage = (error, fallbackMessage) => normalizeApiError(error, fallbackMessage).message;
