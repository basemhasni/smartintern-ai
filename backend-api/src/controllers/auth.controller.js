const authService = require('../services/auth.service');
const { clearAuthCookie, setAuthCookie } = require('../utils/authCookie');
const { clearCsrfCookie, generateCsrfToken, setCsrfCookie } = require('../middlewares/csrf.middleware');

const isMobileClient = (req) => String(req.headers['x-client-type'] || '').toLowerCase() === 'mobile';

const buildAuthResponse = (req, result, message) => {
  const response = {
    message,
    user: result.user,
  };

  if (isMobileClient(req)) {
    response.accessToken = result.token;
  }

  return response;
};

const register = async (req, res, next) => {
  try {
    const result = await authService.register(req.body);

    setAuthCookie(res, result.token);

    res.status(201).json(buildAuthResponse(req, result, 'User registered successfully'));
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const result = await authService.login(req.body);

    setAuthCookie(res, result.token);

    res.status(200).json(buildAuthResponse(req, result, 'User logged in successfully'));
  } catch (error) {
    next(error);
  }
};

const me = async (req, res, next) => {
  try {
    const user = await authService.getAuthenticatedUser(req.user.id);

    res.status(200).json({
      user,
    });
  } catch (error) {
    next(error);
  }
};

const forgotPassword = async (req, res, next) => {
  try {
    const result = await authService.requestPasswordReset(req.body);

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

const resetPassword = async (req, res, next) => {
  try {
    const result = await authService.resetPassword(req.body);

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

const getCsrfToken = async (req, res, next) => {
  try {
    const csrfToken = generateCsrfToken();
    setCsrfCookie(res, csrfToken);

    res.status(200).json({
      csrfToken,
    });
  } catch (error) {
    next(error);
  }
};

const logout = async (req, res, next) => {
  try {
    clearAuthCookie(res);
    clearCsrfCookie(res);

    res.status(200).json({
      message: 'Deconnexion reussie.',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  me,
  forgotPassword,
  resetPassword,
  getCsrfToken,
  logout,
};

