const authService = require('../services/auth.service');
const { clearAuthCookie, setAuthCookie } = require('../utils/authCookie');

const register = async (req, res, next) => {
  try {
    const result = await authService.register(req.body);

    setAuthCookie(res, result.token);

    res.status(201).json({
      message: 'User registered successfully',
      user: result.user,
    });
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const result = await authService.login(req.body);

    setAuthCookie(res, result.token);

    res.status(200).json({
      message: 'User logged in successfully',
      user: result.user,
    });
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

const logout = async (req, res, next) => {
  try {
    clearAuthCookie(res);

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
  logout,
};

