const express = require('express');

const cvController = require('../controllers/cv.controller');
const { protect } = require('../middlewares/auth.middleware');
const { authorizeRoles } = require('../middlewares/role.middleware');
const { uploadCV, handleMulterError } = require('../middlewares/upload.middleware');

const router = express.Router();

router.use(protect, authorizeRoles('STUDENT'));

router.post('/upload', uploadCV.single('cv'), handleMulterError, cvController.uploadCV);
router.get('/', cvController.getCVs);
router.get('/:id', cvController.getCVById);
router.delete('/:id', cvController.deleteCV);

module.exports = router;

