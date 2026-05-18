const express = require('express');

const companyController = require('../controllers/company.controller');
const { protect } = require('../middlewares/auth.middleware');
const { authorizeRoles } = require('../middlewares/role.middleware');

const router = express.Router();

router.get('/profile', protect, authorizeRoles('COMPANY'), companyController.getProfile);
router.put('/profile', protect, authorizeRoles('COMPANY'), companyController.updateProfile);

module.exports = router;

