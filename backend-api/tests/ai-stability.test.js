const assert = require('node:assert/strict');
const http = require('node:http');
const { after, before, test } = require('node:test');

process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret-with-sufficient-length';
process.env.DATABASE_URL = process.env.DATABASE_URL || 'postgresql://test:test@localhost:5432/test';

const app = require('../src/app');
const { requestAi } = require('../src/services/aiClient');

let fakeAiServer;
let backendServer;

const listen = (server) => new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
const close = (server) => new Promise((resolve, reject) => server.close((error) => (error ? reject(error) : resolve())));
const getUrl = (server) => `http://127.0.0.1:${server.address().port}`;

before(async () => {
  fakeAiServer = http.createServer((req, res) => {
    res.setHeader('Content-Type', 'application/json');

    if (req.url === '/slow') {
      setTimeout(() => res.end(JSON.stringify({ status: 'ok' })), 100);
      return;
    }

    if (req.url === '/unavailable') {
      res.statusCode = 503;
      res.end(JSON.stringify({ detail: 'provider unavailable' }));
      return;
    }

    if (req.url === '/validation') {
      res.statusCode = 400;
      res.end(JSON.stringify({ detail: 'invalid payload' }));
      return;
    }

    if (req.url === '/invalid-response') {
      res.end(JSON.stringify({ unexpected: true }));
      return;
    }

    res.end(JSON.stringify({ status: 'ok' }));
  });

  await listen(fakeAiServer);
  process.env.AI_SERVICE_URL = getUrl(fakeAiServer);

  backendServer = app.listen(0, '127.0.0.1');
  await new Promise((resolve) => backendServer.once('listening', resolve));
});

after(async () => {
  await Promise.all([close(fakeAiServer), close(backendServer)]);
});

test('maps an AI timeout to a stable public error', async () => {
  await assert.rejects(
    requestAi({ method: 'get', path: '/slow', workflow: 'matching', timeoutMs: 20 }),
    (error) => error.code === 'AI_SERVICE_TIMEOUT' && error.statusCode === 504,
  );
});

test('maps an upstream 503 without exposing its payload', async () => {
  await assert.rejects(
    requestAi({ method: 'get', path: '/unavailable', workflow: 'matching' }),
    (error) => error.code === 'AI_SERVICE_UNAVAILABLE'
      && error.statusCode === 503
      && !error.message.includes('provider unavailable'),
  );
});

test('maps AI validation errors to 422', async () => {
  await assert.rejects(
    requestAi({ method: 'get', path: '/validation', workflow: 'matching' }),
    (error) => error.code === 'AI_VALIDATION_ERROR' && error.statusCode === 422,
  );
});

test('rejects an invalid AI response shape', async () => {
  await assert.rejects(
    requestAi({
      method: 'get',
      path: '/invalid-response',
      workflow: 'matching',
      validate: (value) => value?.score !== undefined,
    }),
    (error) => error.code === 'AI_INVALID_RESPONSE' && error.statusCode === 502,
  );
});

test('keeps protected backend routes protected', async () => {
  const response = await fetch(`${getUrl(backendServer)}/api/test/student`);
  assert.equal(response.status, 401);
  const body = await response.json();
  assert.equal(body.status, 'error');
});
