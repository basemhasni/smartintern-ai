const express = require('express');

const matchingController = require('../controllers/matching.controller');
const { protect } = require('../middlewares/auth.middleware');
const { authorizeRoles } = require('../middlewares/role.middleware');

const matchingRouter = express.Router();

matchingRouter.get('/:id/match', protect, authorizeRoles('STUDENT'), matchingController.matchOffer);

module.exports = matchingRouter;
