const express = require('express');

const recommendationController = require('../controllers/recommendation.controller');
const { protect } = require('../middlewares/auth.middleware');
const { authorizeRoles } = require('../middlewares/role.middleware');

const router = express.Router();

router.get(
  '/recommendations',
  protect,
  authorizeRoles('STUDENT'),
  recommendationController.getRecommendations
);

module.exports = router;
