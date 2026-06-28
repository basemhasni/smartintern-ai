const express = require('express');

const authController = require('../controllers/auth.controller');
const { protect } = require('../middlewares/auth.middleware');
const { createRateLimiter } = require('../middlewares/rateLimit.middleware');

const router = express.Router();
const authRateLimiter = createRateLimiter({
  windowMs: Number(process.env.AUTH_RATE_LIMIT_WINDOW_MS || 15 * 60 * 1000),
  max: Number(process.env.AUTH_RATE_LIMIT_MAX || 20),
  keyGenerator: (req) => `${req.ip}:${req.path}:${String(req.body?.email || '').toLowerCase()}`,
  message: 'Trop de tentatives. Veuillez reessayer plus tard.',
});

router.post('/register', authRateLimiter, authController.register);
router.post('/login', authRateLimiter, authController.login);
router.post('/forgot-password', authRateLimiter, authController.forgotPassword);
router.post('/reset-password', authRateLimiter, authController.resetPassword);
router.post('/logout', authController.logout);
router.get('/me', protect, authController.me);

module.exports = router;

