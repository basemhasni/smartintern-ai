const matchingService = require('../services/matching.service');

const matchOffer = async (req, res, next) => {
  try {
    const matching = await matchingService.calculateOfferMatch(req.user.id, req.params.id);

    res.status(200).json({
      message: 'Matching calculated successfully',
      matching,
    });
  } catch (error) {
    next(error);
  }
};

const simulateOfferSkillGap = async (req, res, next) => {
  try {
    const mode = req.body?.mode || 'REALISTIC';
    if (!['CONSERVATIVE', 'REALISTIC', 'OPTIMISTIC'].includes(mode)) {
      const error = new Error('mode must be CONSERVATIVE, REALISTIC, or OPTIMISTIC');
      error.statusCode = 400;
      throw error;
    }

    const simulation = await matchingService.simulateOfferSkillGap(req.user.id, req.params.id, mode);
    res.status(200).json({ simulation });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  matchOffer,
  simulateOfferSkillGap,
};
