const express = require('express');

const motivationLetterController = require('../controllers/motivationLetter.controller');
const { protect } = require('../middlewares/auth.middleware');
const { authorizeRoles } = require('../middlewares/role.middleware');

const router = express.Router();

router.get(
  '/motivation-letters',
  protect,
  authorizeRoles('STUDENT'),
  motivationLetterController.listLetters
);

router.post(
  '/:applicationId/generate-letter',
  protect,
  authorizeRoles('STUDENT'),
  motivationLetterController.generateLetter
);

router.get(
  '/:applicationId/motivation-letter',
  protect,
  authorizeRoles('STUDENT'),
  motivationLetterController.getLetter
);

router.put(
  '/:applicationId/motivation-letter',
  protect,
  authorizeRoles('STUDENT'),
  motivationLetterController.updateLetter
);

module.exports = router;
