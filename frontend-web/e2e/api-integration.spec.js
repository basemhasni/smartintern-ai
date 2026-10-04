import { randomUUID } from 'node:crypto';

import { expect, test } from '@playwright/test';

const baseURL = process.env.E2E_BASE_URL || 'http://localhost:8088';
const mobileHeaders = { 'X-Client-Type': 'mobile' };

test('authentification, roles, offres et unicite des candidatures', async ({ request }) => {
  const suffix = randomUUID().slice(0, 12);
  const register = async (role) => {
    const response = await request.post(`${baseURL}/api/auth/register`, {
      headers: mobileHeaders,
      data: {
        firstName: 'Test', lastName: 'Integration',
        email: `${role.toLowerCase()}-${suffix}@example.invalid`,
        password: 'Step10Password123', role,
      },
    });
    expect(response.status()).toBe(201);
    const body = await response.json();
    expect(body.user.role).toBe(role);
    expect(body.user.passwordHash).toBeUndefined();
    expect(body.accessToken).toBeTruthy();
    return { token: body.accessToken, email: body.user.email };
  };

  const company = await register('COMPANY');
  const student = await register('STUDENT');
  const auth = (token) => ({ ...mobileHeaders, Authorization: `Bearer ${token}` });

  expect((await request.get(`${baseURL}/api/auth/me`)).status()).toBe(401);
  expect((await request.get(`${baseURL}/api/auth/me`, { headers: auth('invalid') })).status()).toBe(401);
  expect((await request.get(`${baseURL}/api/auth/me`, { headers: auth(student.token) })).status()).toBe(200);
  expect((await request.get(`${baseURL}/api/students/profile`, { headers: auth(company.token) })).status()).toBe(403);
  expect((await request.get(`${baseURL}/api/companies/profile`, { headers: auth(student.token) })).status()).toBe(403);

  const invalidOffer = await request.post(`${baseURL}/api/companies/offers`, {
    headers: auth(company.token), data: { status: 'PUBLISHED' },
  });
  expect(invalidOffer.status()).toBe(400);
  const createOffer = await request.post(`${baseURL}/api/companies/offers`, {
    headers: auth(company.token),
    data: { title: `Integration ${suffix}`, description: 'Offre de test reproductible.', status: 'PUBLISHED' },
  });
  expect(createOffer.status()).toBe(201);
  const offerId = (await createOffer.json()).offer.id;
  expect((await request.get(`${baseURL}/api/offers/${offerId}`)).status()).toBe(200);
  expect((await request.post(`${baseURL}/api/offers/${offerId}/apply`, { headers: auth(company.token), data: {} })).status()).toBe(403);
  expect((await request.post(`${baseURL}/api/offers/${offerId}/apply`, { headers: auth(student.token), data: {} })).status()).toBe(201);
  expect((await request.post(`${baseURL}/api/offers/${offerId}/apply`, { headers: auth(student.token), data: {} })).status()).toBe(409);
  const applications = await request.get(`${baseURL}/api/students/applications`, { headers: auth(student.token) });
  expect(applications.status()).toBe(200);
  expect((await applications.json()).applications.some((item) => item.offerId === offerId)).toBe(true);
  expect((await request.get(`${baseURL}/api/companies/offers/${offerId}/applications`, { headers: auth(company.token) })).status()).toBe(200);
  expect((await request.get(`${baseURL}/api/offers/nonexistent`)).status()).toBe(404);

  const login = await request.post(`${baseURL}/api/auth/login`, {
    headers: mobileHeaders, data: { email: student.email, password: 'Step10Password123' },
  });
  expect(login.status()).toBe(200);
  expect((await login.json()).accessToken).toBeTruthy();
  expect((await request.post(`${baseURL}/api/auth/login`, {
    headers: mobileHeaders, data: { email: student.email, password: 'wrong' },
  })).status()).toBe(401);
});

test('cookie web exige le jeton CSRF', async ({ request }) => {
  const response = await request.post(`${baseURL}/api/auth/login`, {
    data: { email: 'nobody@example.invalid', password: 'invalid' },
  });
  expect(response.status()).toBe(403);
});
