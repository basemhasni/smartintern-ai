const { analyzeOfferQuality, orchestrateAi, simulateSkillGaps } = require('../services/ai.service');

const createHttpError = (statusCode, message, code) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  error.code = code;
  return error;
};

const analyzeOfferQualityEndpoint = async (req, res, next) => {
  try {
    if (!req.body || typeof req.body !== 'object' || Array.isArray(req.body)) {
      throw createHttpError(400, 'Offer payload must be an object');
    }

    const result = await analyzeOfferQuality(req.body);
    if (!result.success) {
      throw createHttpError(result.statusCode || 503, result.error, result.code);
    }

    res.status(200).json(result.data);
  } catch (error) {
    next(error);
  }
};

const forwardAiRequest = (service, unavailableMessage) => async (req, res, next) => {
  try {
    if (!req.body || typeof req.body !== 'object' || Array.isArray(req.body)) {
      throw createHttpError(400, 'AI payload must be an object');
    }

    const result = await service(req.body);
    if (!result.success) {
      throw createHttpError(result.statusCode || 503, result.error || unavailableMessage, result.code);
    }

    res.status(200).json(result.data);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  analyzeOfferQualityEndpoint,
  orchestrateAiEndpoint: forwardAiRequest(orchestrateAi, 'AI orchestration is temporarily unavailable'),
  simulateSkillGapsEndpoint: forwardAiRequest(simulateSkillGaps, 'Skill gap simulation is temporarily unavailable'),
};
