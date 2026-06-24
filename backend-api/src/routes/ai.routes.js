const express = require('express');

const aiController = require('../controllers/ai.controller');
const { protect } = require('../middlewares/auth.middleware');
const { authorizeRoles } = require('../middlewares/role.middleware');

const router = express.Router();

router.post('/analyze-offer-quality', protect, authorizeRoles('COMPANY', 'ADMIN'), aiController.analyzeOfferQualityEndpoint);
router.post('/skill-gap-simulator', protect, authorizeRoles('STUDENT', 'ADMIN'), aiController.simulateSkillGapsEndpoint);
router.post('/orchestrate', protect, authorizeRoles('STUDENT', 'COMPANY', 'ADMIN'), aiController.orchestrateAiEndpoint);

module.exports = router;
