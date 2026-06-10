const adminService = require('../services/admin.service');

const getDashboard = async (req, res, next) => {
  try {
    const dashboard = await adminService.getAdminDashboard();
    res.status(200).json(dashboard);
  } catch (error) {
    next(error);
  }
};

const getUsers = async (req, res, next) => {
  try {
    const result = await adminService.getAdminUsers(req.query);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

const updateUserStatus = async (req, res, next) => {
  try {
    const user = await adminService.updateAdminUserStatus(req.user.id, req.params.userId, req.body);
    res.status(200).json({
      message: 'User status updated successfully',
      user,
    });
  } catch (error) {
    next(error);
  }
};

const getCompanies = async (req, res, next) => {
  try {
    const result = await adminService.getAdminCompanies(req.query);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

const updateCompanyStatus = async (req, res, next) => {
  try {
    const company = await adminService.updateAdminCompanyStatus(req.params.companyId, req.body);
    res.status(200).json({
      message: 'Company status updated successfully',
      company,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboard,
  getUsers,
  updateUserStatus,
  getCompanies,
  updateCompanyStatus,
};
