const careerAssistantService = require('../services/careerAssistant.service');

const generateCareerAdvice = async (req, res, next) => {
  try {
    const { careerAdvice, ragContext } = await careerAssistantService.generateAdvice(req.user.id, req.body);

    res.status(200).json({
      message: 'Career advice generated successfully',
      careerAdvice,
      ragContext,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  generateCareerAdvice,
};
