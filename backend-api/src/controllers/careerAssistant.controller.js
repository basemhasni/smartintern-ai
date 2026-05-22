const careerAssistantService = require('../services/careerAssistant.service');

const generateCareerAdvice = async (req, res, next) => {
  try {
    const careerAdvice = await careerAssistantService.generateAdvice(req.user.id, req.body);

    res.status(200).json({
      message: 'Career advice generated successfully',
      careerAdvice,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  generateCareerAdvice,
};
