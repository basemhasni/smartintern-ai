const offerService = require('../services/offer.service');

const createCompanyOffer = async (req, res, next) => {
  try {
    const offer = await offerService.createCompanyOffer(req.user.id, req.body);

    res.status(201).json({
      message: 'Offer created successfully',
      offer,
    });
  } catch (error) {
    next(error);
  }
};

const getCompanyOffers = async (req, res, next) => {
  try {
    const offers = await offerService.getCompanyOffers(req.user.id);

    res.status(200).json({
      offers,
    });
  } catch (error) {
    next(error);
  }
};

const getCompanyOfferById = async (req, res, next) => {
  try {
    const offer = await offerService.getCompanyOfferById(req.user.id, req.params.id);

    res.status(200).json({
      offer,
    });
  } catch (error) {
    next(error);
  }
};

const updateCompanyOffer = async (req, res, next) => {
  try {
    const offer = await offerService.updateCompanyOffer(req.user.id, req.params.id, req.body);

    res.status(200).json({
      message: 'Offer updated successfully',
      offer,
    });
  } catch (error) {
    next(error);
  }
};

const archiveCompanyOffer = async (req, res, next) => {
  try {
    await offerService.archiveCompanyOffer(req.user.id, req.params.id);

    res.status(200).json({
      message: 'Offer archived successfully',
    });
  } catch (error) {
    next(error);
  }
};

const getPublishedOffers = async (req, res, next) => {
  try {
    const offers = await offerService.getPublishedOffers();

    res.status(200).json({
      offers,
    });
  } catch (error) {
    next(error);
  }
};

const getPublishedOfferById = async (req, res, next) => {
  try {
    const offer = await offerService.getPublishedOfferById(req.params.id);

    res.status(200).json({
      offer,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createCompanyOffer,
  getCompanyOffers,
  getCompanyOfferById,
  updateCompanyOffer,
  archiveCompanyOffer,
  getPublishedOffers,
  getPublishedOfferById,
};

