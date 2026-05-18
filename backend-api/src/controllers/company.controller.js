const companyService = require('../services/company.service');

const getProfile = async (req, res, next) => {
  try {
    const company = await companyService.getCompanyProfile(req.user.id);

    res.status(200).json({
      company,
    });
  } catch (error) {
    next(error);
  }
};

const updateProfile = async (req, res, next) => {
  try {
    const company = await companyService.updateCompanyProfile(req.user.id, req.body);

    res.status(200).json({
      company,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProfile,
  updateProfile,
};

