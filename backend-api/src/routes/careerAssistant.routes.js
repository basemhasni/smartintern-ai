const express = require('express');

const careerAssistantController = require('../controllers/careerAssistant.controller');
const { protect } = require('../middlewares/auth.middleware');
const { authorizeRoles } = require('../middlewares/role.middleware');

const router = express.Router();

router.post(
  '/career-assistant',
  protect,
  authorizeRoles('STUDENT'),
  careerAssistantController.generateCareerAdvice
);

module.exports = router;
