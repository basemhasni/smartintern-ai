const { analyzeOfferQuality } = require('../services/ai.service');

const createHttpError = (statusCode, message) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const analyzeOfferQualityEndpoint = async (req, res, next) => {
  try {
    if (!req.body || typeof req.body !== 'object' || Array.isArray(req.body)) {
      throw createHttpError(400, 'Offer payload must be an object');
    }

    const result = await analyzeOfferQuality(req.body);
    if (!result.success) {
      throw createHttpError(503, result.error);
    }

    res.status(200).json(result.data);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  analyzeOfferQualityEndpoint,
};
