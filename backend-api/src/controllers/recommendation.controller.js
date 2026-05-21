const recommendationService = require('../services/recommendation.service');

const getRecommendations = async (req, res, next) => {
  try {
    const recommendations = await recommendationService.getStudentRecommendations(
      req.user.id,
      req.query
    );

    res.status(200).json({
      message: 'Recommendations generated successfully',
      count: recommendations.length,
      recommendations,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getRecommendations,
};
