import assert from 'node:assert/strict';
import { beforeEach, test } from 'node:test';
import { clearSession, getDashboardPathByRole, readStoredUser, saveSession, USER_STORAGE_KEY } from '../src/utils/auth.js';

beforeEach(() => {
  const values = new Map();
  globalThis.localStorage = {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, String(value)),
    removeItem: (key) => values.delete(key),
  };
});

test('role routing defaults to login for unsupported roles', () => {
  for (const [role, path] of [['STUDENT', '/student/dashboard'], ['COMPANY', '/company/dashboard'], ['ADMIN', '/admin/dashboard'], ['UNKNOWN', '/login'], [undefined, '/login']]) {
    assert.equal(getDashboardPathByRole(role), path);
  }
});

test('saving a session retains user information and removes legacy bearer tokens', () => {
  for (const key of ['smartintern_token', 'token', 'authToken']) localStorage.setItem(key, 'synthetic-token');
  const user = { id: 'synthetic', role: 'STUDENT' };
  saveSession({ user, token: 'must-not-be-stored' });
  assert.deepEqual(readStoredUser(), user);
  for (const key of ['smartintern_token', 'token', 'authToken']) assert.equal(localStorage.getItem(key), null);
});

test('corrupt stored sessions are cleared without breaking application startup', () => {
  localStorage.setItem(USER_STORAGE_KEY, '{invalid');
  localStorage.setItem('authToken', 'synthetic-token');
  assert.equal(readStoredUser(), null);
  assert.equal(localStorage.getItem(USER_STORAGE_KEY), null);
  assert.equal(localStorage.getItem('authToken'), null);
});

test('logout clears stored account and every legacy token key', () => {
  saveSession({ user: { id: 'synthetic' } });
  localStorage.setItem('token', 'synthetic-token');
  clearSession();
  assert.equal(readStoredUser(), null);
  assert.equal(localStorage.getItem('token'), null);
});
