const express = require('express');

const applicationController = require('../controllers/application.controller');
const { protect } = require('../middlewares/auth.middleware');
const { authorizeRoles } = require('../middlewares/role.middleware');

const offerApplicationRouter = express.Router();
const studentApplicationRouter = express.Router();
const companyOfferApplicationRouter = express.Router();
const applicationStatusRouter = express.Router();

offerApplicationRouter.post('/:offerId/apply', protect, authorizeRoles('STUDENT'), applicationController.submitApplication);

studentApplicationRouter.get(
  '/',
  protect,
  authorizeRoles('STUDENT'),
  applicationController.getStudentApplications
);

companyOfferApplicationRouter.get(
  '/:offerId/applications',
  protect,
  authorizeRoles('COMPANY'),
  applicationController.getCompanyOfferApplications
);

applicationStatusRouter.put(
  '/:id/status',
  protect,
  authorizeRoles('COMPANY'),
  applicationController.updateApplicationStatus
);

module.exports = {
  offerApplicationRouter,
  studentApplicationRouter,
  companyOfferApplicationRouter,
  applicationStatusRouter,
};

