const axios = require('axios');

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';

const analyzeCV = async (text) => {
  if (!text || typeof text !== 'string' || text.trim().length === 0) {
    return {
      success: false,
      error: 'CV text is empty',
    };
  }

  try {
    const response = await axios.post(
      `${AI_SERVICE_URL}/ai/analyze-cv`,
      { text },
      { timeout: 5000 }
    );

    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    return {
      success: false,
      error: 'AI analysis failed',
      details: error.response?.data?.detail || error.message,
    };
  }
};

module.exports = {
  analyzeCV,
};
