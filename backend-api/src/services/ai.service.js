const { isObjectResponse, requestAi, toAiHttpError } = require('./aiClient');

const invokeAi = async ({ path, payload, workflow, allowRetry = false }) => {
  try {
    const data = await requestAi({
      path,
      data: payload,
      workflow,
      allowRetry,
      validate: isObjectResponse,
    });

    return { success: true, data };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      code: error.code,
      statusCode: error.statusCode,
    };
  }
};

const analyzeCV = async (text) => {
  if (!text || typeof text !== 'string' || text.trim().length === 0) {
    return {
      success: false,
      error: 'Le texte du CV est vide.',
      code: 'AI_VALIDATION_ERROR',
      statusCode: 422,
    };
  }

  return invokeAi({
    path: '/ai/analyze-cv',
    payload: { text },
    workflow: 'matching',
  });
};

const matchCandidateWithOffer = (payload) => invokeAi({
  path: '/ai/match',
  payload,
  workflow: 'matching',
});

const generateMotivationLetter = (payload) => invokeAi({
  path: '/ai/generate-letter',
  payload,
  workflow: 'motivationLetter',
});

const generateCareerAdvice = (payload) => invokeAi({
  path: '/ai/career-advice',
  payload,
  workflow: 'careerAssistant',
});

const analyzeOfferQuality = (payload) => invokeAi({
  path: '/ai/analyze-offer-quality',
  payload,
  workflow: 'matching',
});

const simulateSkillGaps = (payload) => invokeAi({
  path: '/ai/skill-gap-simulator',
  payload,
  workflow: 'skillGap',
});

const orchestrateAi = (payload) => invokeAi({
  path: '/ai/orchestrate/v2',
  payload,
  workflow: 'orchestrator',
});

module.exports = {
  analyzeOfferQuality,
  analyzeCV,
  generateCareerAdvice,
  generateMotivationLetter,
  matchCandidateWithOffer,
  orchestrateAi,
  simulateSkillGaps,
  toAiHttpError,
};
