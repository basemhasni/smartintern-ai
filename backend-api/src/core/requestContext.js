const { AsyncLocalStorage } = require('async_hooks');

const requestContext = new AsyncLocalStorage();

const runWithRequestContext = (context, callback) => requestContext.run(context, callback);

const getRequestContext = () => requestContext.getStore() || {};

const getRequestId = () => getRequestContext().requestId || null;

module.exports = {
  getRequestContext,
  getRequestId,
  runWithRequestContext,
};
