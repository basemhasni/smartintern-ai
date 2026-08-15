const { getAiServiceHealth } = require('../services/aiClient');

const getHealth = (req, res) => {
  res.status(200).json({
    status: 'ok',
    service: 'backend-api',
    message: 'SmartIntern AI backend is running',
  });
};

const getAiHealth = async (req, res) => {
  try {
    await getAiServiceHealth();
    res.status(200).json({ status: 'ok', service: 'ai-service', requestId: req.requestId });
  } catch (error) {
    res.status(error.statusCode || 503).json({
      status: 'degraded',
      service: 'ai-service',
      error: {
        code: error.code || 'AI_SERVICE_UNAVAILABLE',
        message: error.message,
      },
      requestId: req.requestId,
    });
  }
};

module.exports = {
  getAiHealth,
  getHealth,
};

