const applicationService = require('../services/application.service');

const submitApplication = async (req, res, next) => {
  try {
    const application = await applicationService.submitApplication(req.user.id, req.params.offerId, req.body);

    res.status(201).json({
      message: 'Application submitted successfully',
      application,
    });
  } catch (error) {
    next(error);
  }
};

const getStudentApplications = async (req, res, next) => {
  try {
    const applications = await applicationService.getStudentApplications(req.user.id);

    res.status(200).json({
      applications,
    });
  } catch (error) {
    next(error);
  }
};

const getCompanyOfferApplications = async (req, res, next) => {
  try {
    const applications = await applicationService.getCompanyOfferApplications(req.user.id, req.params.offerId);

    res.status(200).json({
      applications,
    });
  } catch (error) {
    next(error);
  }
};

const updateApplicationStatus = async (req, res, next) => {
  try {
    const application = await applicationService.updateApplicationStatus(req.user.id, req.params.id, req.body.status);

    res.status(200).json({
      message: 'Application status updated successfully',
      application,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  submitApplication,
  getStudentApplications,
  getCompanyOfferApplications,
  updateApplicationStatus,
};

