const express = require('express');

const aiController = require('../controllers/ai.controller');
const { protect } = require('../middlewares/auth.middleware');
const { authorizeRoles } = require('../middlewares/role.middleware');

const router = express.Router();

router.use(protect, authorizeRoles('COMPANY', 'ADMIN'));
router.post('/analyze-offer-quality', aiController.analyzeOfferQualityEndpoint);

module.exports = router;
