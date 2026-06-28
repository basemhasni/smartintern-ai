const buckets = new Map();

const createRateLimiter = ({
  windowMs = 15 * 60 * 1000,
  max = 20,
  keyGenerator = (req) => req.ip,
  message = 'Too many requests. Please try again later.',
} = {}) => (req, res, next) => {
  const now = Date.now();
  const key = keyGenerator(req);
  const current = buckets.get(key);

  if (!current || current.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return next();
  }

  current.count += 1;

  if (current.count > max) {
    const retryAfter = Math.ceil((current.resetAt - now) / 1000);
    res.set('Retry-After', String(retryAfter));
    return res.status(429).json({
      status: 'error',
      message,
    });
  }

  return next();
};

module.exports = {
  createRateLimiter,
};

