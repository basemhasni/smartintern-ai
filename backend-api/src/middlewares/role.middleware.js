const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        status: 'error',
        message: 'Authentication is required',
      });
    }

    if (!req.user.role) {
      return res.status(401).json({
        status: 'error',
        message: 'Authenticated user role is missing',
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        status: 'error',
        message: 'Access denied for this role',
      });
    }

    return next();
  };
};

module.exports = {
  authorizeRoles,
};

