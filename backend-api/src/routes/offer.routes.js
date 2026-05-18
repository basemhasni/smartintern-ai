const express = require('express');

const offerController = require('../controllers/offer.controller');
const { protect } = require('../middlewares/auth.middleware');
const { authorizeRoles } = require('../middlewares/role.middleware');

const companyOfferRouter = express.Router();
const publicOfferRouter = express.Router();

companyOfferRouter.use(protect, authorizeRoles('COMPANY'));

companyOfferRouter.post('/', offerController.createCompanyOffer);
companyOfferRouter.get('/', offerController.getCompanyOffers);
companyOfferRouter.get('/:id', offerController.getCompanyOfferById);
companyOfferRouter.put('/:id', offerController.updateCompanyOffer);
companyOfferRouter.delete('/:id', offerController.archiveCompanyOffer);

publicOfferRouter.get('/', offerController.getPublishedOffers);
publicOfferRouter.get('/:id', offerController.getPublishedOfferById);

module.exports = {
  companyOfferRouter,
  publicOfferRouter,
};

