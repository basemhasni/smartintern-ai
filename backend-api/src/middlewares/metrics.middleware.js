const client = require('prom-client');

client.collectDefaultMetrics({ prefix: 'smartintern_backend_' });

const httpRequests = new client.Counter({
  name: 'smartintern_backend_http_requests_total',
  help: 'Completed backend HTTP requests',
  labelNames: ['method', 'route', 'status_code'],
});

const httpDuration = new client.Histogram({
  name: 'smartintern_backend_http_request_duration_seconds',
  help: 'Backend HTTP request duration in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10],
});

function metricsMiddleware(req, res, next) {
  if (req.path === '/metrics') return next();

  const started = process.hrtime.bigint();
  res.once('finish', () => {
    const routePath = typeof req.route?.path === 'string'
      ? (`${req.baseUrl}${req.route.path}`.replace(/\/$/, '') || '/')
      : 'unmatched';
    const labels = {
      method: req.method,
      route: routePath,
      status_code: String(res.statusCode),
    };
    httpRequests.inc(labels);
    httpDuration.observe(labels, Number(process.hrtime.bigint() - started) / 1e9);
  });
  next();
}

async function metricsEndpoint(req, res, next) {
  try {
    res.set('Content-Type', client.register.contentType);
    res.end(await client.register.metrics());
  } catch (error) {
    next(error);
  }
}

module.exports = { metricsMiddleware, metricsEndpoint };
