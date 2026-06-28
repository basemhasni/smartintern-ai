const DEFAULT_COOKIE_NAME = 'smartintern_token';
const DEFAULT_MAX_AGE_MS = 24 * 60 * 60 * 1000;

const getCookieName = () => process.env.AUTH_COOKIE_NAME || DEFAULT_COOKIE_NAME;

const getCookieOptions = () => {
  const sameSite = (process.env.AUTH_COOKIE_SAME_SITE || 'lax').toLowerCase();
  const secure = process.env.AUTH_COOKIE_SECURE === 'true' || process.env.NODE_ENV === 'production';
  const maxAge = Number(process.env.AUTH_COOKIE_MAX_AGE_MS || DEFAULT_MAX_AGE_MS);

  return {
    httpOnly: true,
    secure,
    sameSite,
    maxAge,
    path: '/',
  };
};

const serializeCookie = (name, value, options = {}) => {
  const segments = [`${name}=${encodeURIComponent(value)}`];

  if (options.maxAge !== undefined) segments.push(`Max-Age=${Math.floor(options.maxAge / 1000)}`);
  if (options.path) segments.push(`Path=${options.path}`);
  if (options.httpOnly) segments.push('HttpOnly');
  if (options.secure) segments.push('Secure');
  if (options.sameSite) {
    const normalizedSameSite = String(options.sameSite).toLowerCase();
    const sameSiteValue = normalizedSameSite === 'strict'
      ? 'Strict'
      : normalizedSameSite === 'none'
        ? 'None'
        : 'Lax';
    segments.push(`SameSite=${sameSiteValue}`);
  }

  return segments.join('; ');
};

const parseCookies = (cookieHeader = '') => cookieHeader
  .split(';')
  .map((part) => part.trim())
  .filter(Boolean)
  .reduce((cookies, part) => {
    const separatorIndex = part.indexOf('=');

    if (separatorIndex === -1) {
      return cookies;
    }

    const name = part.slice(0, separatorIndex);
    const value = part.slice(separatorIndex + 1);
    cookies[name] = decodeURIComponent(value);
    return cookies;
  }, {});

const getAuthTokenFromCookie = (req) => {
  const cookies = parseCookies(req.headers.cookie || '');
  return cookies[getCookieName()] || null;
};

const setAuthCookie = (res, token) => {
  res.setHeader('Set-Cookie', serializeCookie(getCookieName(), token, getCookieOptions()));
};

const clearAuthCookie = (res) => {
  res.setHeader('Set-Cookie', serializeCookie(getCookieName(), '', {
    ...getCookieOptions(),
    maxAge: 0,
  }));
};

module.exports = {
  clearAuthCookie,
  getAuthTokenFromCookie,
  getCookieName,
  getCookieOptions,
  setAuthCookie,
};

