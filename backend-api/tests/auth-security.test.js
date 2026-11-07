const assert = require('node:assert/strict');
const { after, before, test } = require('node:test');
const jwt = require('jsonwebtoken');

process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'synthetic-security-suite-secret-at-least-32';
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test';
const app = require('../src/app');
const { validateEnvironment } = require('../src/config/env');
const { getCookieName } = require('../src/utils/authCookie');
let server;
let base;
before(async () => {
  server = app.listen(0, '127.0.0.1');
  await new Promise((resolve) => server.once('listening', resolve));
  base = `http://127.0.0.1:${server.address().port}`;
});
after(async () => new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve())));

test('protected student/company/admin routes reject missing and malformed JWTs', async () => {
  for (const path of ['/api/auth/me', '/api/students/profile', '/api/companies/profile', '/api/admin/users']) {
    for (const token of ['', 'invalid', jwt.sign({ id: 'synthetic', role: 'STUDENT' }, 'wrong-key')]) {
      const response = await fetch(base + path, { headers: token ? { authorization: `Bearer ${token}` } : {} });
      assert.equal(response.status, 401, path);
    }
  }
});

test('expired and tampered tokens are refused before reaching a business service', async () => {
  const token = jwt.sign({ id: 'synthetic', role: 'STUDENT' }, process.env.JWT_SECRET, { expiresIn: -1 });
  assert.equal((await fetch(`${base}/api/students/profile`, { headers: { authorization: `Bearer ${token}` } })).status, 401);
});

test('roles cannot cross student/company/admin boundaries', async () => {
  for (const [role, path] of [
    ['STUDENT', '/api/companies/profile'], ['COMPANY', '/api/students/profile'],
    ['STUDENT', '/api/admin/users'], ['COMPANY', '/api/admin/users'],
  ]) {
    const token = jwt.sign({ id: 'synthetic', role }, process.env.JWT_SECRET);
    assert.equal((await fetch(base + path, { headers: { authorization: `Bearer ${token}` } })).status, 403);
  }
});

test('mobile header cannot bypass CSRF on a cookie session', async () => {
  const token = jwt.sign({ id: 'synthetic', role: 'STUDENT' }, process.env.JWT_SECRET);
  const response = await fetch(`${base}/api/students/profile`, {
    method: 'PUT', headers: { 'content-type': 'application/json', 'x-client-type': 'mobile', cookie: `${getCookieName()}=${token}` },
    body: JSON.stringify({ role: 'ADMIN' }),
  });
  assert.equal(response.status, 403);
  assert.match((await response.json()).message, /CSRF/);
});

test('native bearer client still reaches role checks without a CSRF cookie', async () => {
  const token = jwt.sign({ id: 'synthetic', role: 'STUDENT' }, process.env.JWT_SECRET);
  const response = await fetch(`${base}/api/companies/profile`, {
    method: 'PUT', headers: { 'content-type': 'application/json', 'x-client-type': 'mobile', authorization: `Bearer ${token}` }, body: '{}',
  });
  assert.equal(response.status, 403);
  assert.doesNotMatch((await response.json()).message, /CSRF/);
});

test('production requires a strong non-default JWT secret', () => {
  const previous = { ...process.env };
  try {
    Object.assign(process.env, { NODE_ENV: 'production', FRONTEND_URL: 'https://smartintern.local', CORS_ORIGIN: 'https://smartintern.local' });
    for (const secret of ['secret', 'change_me_later', 'replace_with_a_long_random_secret', 'ci_only_jwt_secret_not_for_production_32_chars', 'a'.repeat(64)]) {
      process.env.JWT_SECRET = secret;
      assert.throws(validateEnvironment, /JWT_SECRET/);
    }
    process.env.JWT_SECRET = previous.JWT_SECRET;
    assert.doesNotThrow(validateEnvironment);
  } finally {
    for (const key of Object.keys(process.env)) if (!(key in previous)) delete process.env[key];
    Object.assign(process.env, previous);
  }
});
