const express = require('express');

const studentController = require('../controllers/student.controller');
const { protect } = require('../middlewares/auth.middleware');
const { authorizeRoles } = require('../middlewares/role.middleware');

const router = express.Router();

router.get('/profile', protect, authorizeRoles('STUDENT'), studentController.getProfile);
router.put('/profile', protect, authorizeRoles('STUDENT'), studentController.updateProfile);

module.exports = router;

