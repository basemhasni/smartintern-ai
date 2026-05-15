const jwt = require('jsonwebtoken');

const protect = (req, res, next) => {
  const authorizationHeader = req.headers.authorization;

  if (!authorizationHeader) {
    return res.status(401).json({
      status: 'error',
      message: 'Authorization token is required',
    });
  }

  const [scheme, token] = authorizationHeader.split(' ');

  if (scheme !== 'Bearer' || !token) {
    return res.status(401).json({
      status: 'error',
      message: 'Authorization header must use Bearer token format',
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

