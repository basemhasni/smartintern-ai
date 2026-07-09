const parseList = (value) => String(value || '')
  .split(',')
  .map((item) => item.trim())
  .filter(Boolean);

const getAllowedOrigins = () => {
  const configuredOrigins = parseList(process.env.CORS_ORIGIN);
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  const defaults = [
    frontendUrl,
    'http://127.0.0.1:5173',
    'http://localhost:8081',
    'http://127.0.0.1:8081',
    'http://localhost:8082',
    'http://127.0.0.1:8082',
    'http://localhost:8083',
    'http://127.0.0.1:8083',
    'http://localhost:19006',
    'http://127.0.0.1:19006',
  ];

  return Array.from(new Set([...configuredOrigins, ...defaults]));
};

const validateEnvironment = () => {
  const missing = [];

  if (!process.env.DATABASE_URL) missing.push('DATABASE_URL');
  if (!process.env.JWT_SECRET) missing.push('JWT_SECRET');

  if (missing.length > 0) {
    throw new Error(`Missing required environment variable(s): ${missing.join(', ')}`);
  }

  if (
    process.env.NODE_ENV === 'production'
    && ['change_me_later', 'secret', 'dev_secret'].includes(process.env.JWT_SECRET)
  ) {
    throw new Error('JWT_SECRET must be changed before running in production.');
  }
};

module.exports = {
  getAllowedOrigins,
  validateEnvironment,
};

