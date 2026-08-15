const crypto = require('crypto');

const { runWithRequestContext } = require('../core/requestContext');

const REQUEST_ID_PATTERN = /^[a-zA-Z0-9._:-]{8,128}$/;

const requestContextMiddleware = (req, res, next) => {
  const providedRequestId = String(req.headers['x-request-id'] || '').trim();
  const requestId = REQUEST_ID_PATTERN.test(providedRequestId)
    ? providedRequestId
    : crypto.randomUUID();

  req.requestId = requestId;
  res.setHeader('X-Request-ID', requestId);

  runWithRequestContext({ requestId }, next);
};

module.exports = {
  requestContextMiddleware,
};
