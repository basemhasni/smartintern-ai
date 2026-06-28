const jwt = require('jsonwebtoken');

const { getAuthTokenFromCookie } = require('../utils/authCookie');

const protect = (req, res, next) => {
  const authorizationHeader = req.headers.authorization;
  const cookieToken = getAuthTokenFromCookie(req);
  let token = cookieToken;

  if (!token && authorizationHeader) {
    const [scheme, bearerToken] = authorizationHeader.split(' ');

    if (scheme === 'Bearer' && bearerToken) {
      token = bearerToken;
    }
  }

  if (!token) {
    return res.status(401).json({
      status: 'error',
      message: 'Authorization token is required',
    });
  }

  if (!process.env.JWT_SECRET) {
    return res.status(500).json({
      status: 'error',
      message: 'JWT_SECRET is not configured',
    });
  }

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    return next();
  } catch (error) {
    return res.status(401).json({
      status: 'error',
      message: 'Invalid or expired token',
    });
  }
};

module.exports = {
  protect,
};

