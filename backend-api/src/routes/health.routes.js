const express = require('express');

const { getAiHealth, getHealth } = require('../controllers/health.controller');

const router = express.Router();

router.get('/', getHealth);
router.get('/ai', getAiHealth);

module.exports = router;

