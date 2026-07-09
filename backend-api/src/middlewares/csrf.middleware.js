const crypto = require('crypto');

const { appendSetCookie, parseCookies, serializeCookie } = require('../utils/authCookie');

const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);

const getCsrfCookieName = () => process.env.CSRF_COOKIE_NAME || 'smartintern_csrf';
const getCsrfHeaderName = () => (process.env.CSRF_HEADER_NAME || 'x-csrf-token').toLowerCase();

const getCsrfCookieOptions = () => ({
  httpOnly: false,
  secure: process.env.CSRF_COOKIE_SECURE === 'true' || process.env.NODE_ENV === 'production',
  sameSite: (process.env.CSRF_COOKIE_SAME_SITE || process.env.AUTH_COOKIE_SAME_SITE || 'lax').toLowerCase(),
  maxAge: Number(process.env.CSRF_COOKIE_MAX_AGE_MS || process.env.AUTH_COOKIE_MAX_AGE_MS || 24 * 60 * 60 * 1000),
  path: '/',
});

const generateCsrfToken = () => crypto.randomBytes(32).toString('hex');

const isMobileClient = (req) => String(req.headers['x-client-type'] || '').toLowerCase() === 'mobile';

const setCsrfCookie = (res, token) => {
  appendSetCookie(res, serializeCookie(getCsrfCookieName(), token, getCsrfCookieOptions()));
};

const clearCsrfCookie = (res) => {
  appendSetCookie(res, serializeCookie(getCsrfCookieName(), '', {
    ...getCsrfCookieOptions(),
    maxAge: 0,
  }));
};

const tokensMatch = (left, right) => {
  if (!left || !right) {
    return false;
  }

  const leftBuffer = Buffer.from(String(left));
  const rightBuffer = Buffer.from(String(right));

  return leftBuffer.length === rightBuffer.length && crypto.timingSafeEqual(leftBuffer, rightBuffer);
};

const csrfProtection = (req, res, next) => {
  if (SAFE_METHODS.has(req.method)) {
    return next();
  }

  if (isMobileClient(req)) {
    return next();
  }

  const cookies = parseCookies(req.headers.cookie || '');
  const cookieToken = cookies[getCsrfCookieName()];
  const headerToken = req.headers[getCsrfHeaderName()];

  if (tokensMatch(cookieToken, headerToken)) {
    return next();
  }

  if (process.env.NODE_ENV !== 'production') {
    console.warn(`CSRF validation failed for ${req.method} ${req.originalUrl}`);
  }

  return res.status(403).json({
    status: 'error',
    message: 'Token CSRF invalide ou manquant.',
  });
};

module.exports = {
  clearCsrfCookie,
  csrfProtection,
  generateCsrfToken,
  getCsrfCookieName,
  getCsrfHeaderName,
  setCsrfCookie,
};

