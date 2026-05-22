const express = require('express');

const candidateRankingController = require('../controllers/candidateRanking.controller');
const { protect } = require('../middlewares/auth.middleware');
const { authorizeRoles } = require('../middlewares/role.middleware');

const router = express.Router();

router.get(
  '/:offerId/candidates/ranking',
  protect,
  authorizeRoles('COMPANY'),
  candidateRankingController.getCandidateRanking
);

module.exports = router;
