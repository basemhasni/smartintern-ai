const express = require('express');

const { protect } = require('../middlewares/auth.middleware');
const { authorizeRoles } = require('../middlewares/role.middleware');

const router = express.Router();

router.get('/student', protect, authorizeRoles('STUDENT'), (req, res) => {
  res.status(200).json({
    message: 'Student access granted',
  });
});

router.get('/company', protect, authorizeRoles('COMPANY'), (req, res) => {
  res.status(200).json({
    message: 'Company access granted',
  });
});

router.get('/admin', protect, authorizeRoles('ADMIN'), (req, res) => {
  res.status(200).json({
    message: 'Admin access granted',
  });
});

router.get('/all', protect, authorizeRoles('STUDENT', 'COMPANY', 'ADMIN'), (req, res) => {
  res.status(200).json({
    message: 'Authenticated access granted',
  });
});

module.exports = router;

