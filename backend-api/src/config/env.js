const parseList = (value) => String(value || '')
  .split(',')
  .map((item) => item.trim())
  .filter(Boolean);

const getAllowedOrigins = () => {
  const configuredOrigins = parseList(process.env.CORS_ORIGIN);
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

  if (process.env.NODE_ENV === 'production') {
    return Array.from(new Set([...configuredOrigins, frontendUrl]));
  }

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
  if (process.env.NODE_ENV === 'production' && !process.env.FRONTEND_URL) missing.push('FRONTEND_URL');
  if (process.env.NODE_ENV === 'production' && !process.env.CORS_ORIGIN) missing.push('CORS_ORIGIN');

  if (missing.length > 0) {
    throw new Error(`Missing required environment variable(s): ${missing.join(', ')}`);
  }

  if (process.env.NODE_ENV === 'production') {
    const weakSecrets = new Set([
      'change_me_later',
      'secret',
      'dev_secret',
      'replace_with_a_long_random_secret',
    ]);

    if (process.env.JWT_SECRET.length < 32 || weakSecrets.has(process.env.JWT_SECRET)) {
      throw new Error('JWT_SECRET must be a non-default secret of at least 32 characters in production.');
    }
  }
};

module.exports = {
  getAllowedOrigins,
  validateEnvironment,
};

