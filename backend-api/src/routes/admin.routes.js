const express = require('express');

const adminController = require('../controllers/admin.controller');
const { protect } = require('../middlewares/auth.middleware');
const { authorizeRoles } = require('../middlewares/role.middleware');

const router = express.Router();

router.use(protect, authorizeRoles('ADMIN'));

router.get('/dashboard', adminController.getDashboard);
router.get('/users', adminController.getUsers);
router.patch('/users/:userId/status', adminController.updateUserStatus);
router.get('/companies', adminController.getCompanies);
router.patch('/companies/:companyId/status', adminController.updateCompanyStatus);

module.exports = router;
