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

module.exports = {
  matchOffer,
};
