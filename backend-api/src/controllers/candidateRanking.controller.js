const candidateRankingService = require('../services/candidateRanking.service');

const getCandidateRanking = async (req, res, next) => {
  try {
    const ranking = await candidateRankingService.getCandidateRanking(
      req.user.id,
      req.params.offerId,
      req.query
    );

    res.status(200).json({
      message: 'Candidates ranked successfully',
      offer: ranking.offer,
      count: ranking.candidates.length,
      candidates: ranking.candidates,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCandidateRanking,
};
