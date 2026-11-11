import { randomUUID } from 'node:crypto';

import { expect, test } from '@playwright/test';
import { syntheticCv } from './fixtures.js';

const baseURL = process.env.E2E_BASE_URL || 'http://localhost:8088';
const mobileHeaders = { 'X-Client-Type': 'mobile' };

test('authentification, roles, offres et unicite des candidatures', async ({ request }) => {
  const suffix = process.env.E2E_RUN_ID ? `api-${process.env.E2E_RUN_ID}` : randomUUID().slice(0, 12);
  const register = async (role, label = role.toLowerCase()) => {
    const response = await request.post(`${baseURL}/api/auth/register`, {
      headers: mobileHeaders,
      data: {
        firstName: 'Test', lastName: 'Integration',
        email: `${label}-${suffix}@example.invalid`,
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
  const otherCompany = await register('COMPANY', 'other-company');
  const otherStudent = await register('STUDENT', 'other-student');
  const auth = (token) => ({ ...mobileHeaders, Authorization: `Bearer ${token}` });

  expect((await request.get(`${baseURL}/api/auth/me`)).status()).toBe(401);
  expect((await request.get(`${baseURL}/api/auth/me`, { headers: auth('invalid') })).status()).toBe(401);
  expect((await request.get(`${baseURL}/api/auth/me`, { headers: auth(student.token) })).status()).toBe(200);
  expect((await request.get(`${baseURL}/api/students/profile`, { headers: auth(company.token) })).status()).toBe(403);
  expect((await request.get(`${baseURL}/api/companies/profile`, { headers: auth(student.token) })).status()).toBe(403);
  expect((await request.get(`${baseURL}/api/admin/users`, { headers: auth(student.token) })).status()).toBe(403);
  expect((await request.post(`${baseURL}/api/auth/register`, { headers: mobileHeaders, data: { firstName: 'Test', lastName: 'Role', email: `admin-${suffix}@example.invalid`, password: 'Step10Password123', role: 'ADMIN' } })).status()).toBe(400);

  for (const [path, token, data, field, value] of [
    ['/api/students/profile', student.token, { targetJob: 'QA engineer' }, 'student', 'QA engineer'],
    ['/api/companies/profile', company.token, { companyName: `Synthetic ${suffix}` }, 'company', `Synthetic ${suffix}`],
  ]) {
    expect((await request.put(baseURL + path, { headers: auth(token), data })).status()).toBe(200);
    const profile = (await (await request.get(baseURL + path, { headers: auth(token) })).json())[field];
    expect(profile[Object.keys(data)[0]]).toBe(value);
    expect(profile.user.passwordHash).toBeUndefined();
    expect((await request.put(baseURL + path, { headers: auth(token), data: { role: 'ADMIN' } })).status()).toBe(400);
  }
  expect((await request.put(`${baseURL}/api/students/profile`, { headers: auth(student.token), data: { availabilityDate: 'invalid-date' } })).status()).toBe(400);

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
  expect((await request.get(`${baseURL}/api/companies/offers/${offerId}`, { headers: auth(otherCompany.token) })).status()).toBe(404);
  expect((await request.put(`${baseURL}/api/companies/offers/${offerId}`, { headers: auth(otherCompany.token), data: { title: 'stolen' } })).status()).toBe(404);
  expect((await request.get(`${baseURL}/api/offers/${offerId}`)).status()).toBe(200);
  expect((await request.post(`${baseURL}/api/offers/${offerId}/apply`, { headers: auth(company.token), data: {} })).status()).toBe(403);
  expect((await request.post(`${baseURL}/api/offers/${offerId}/apply`, { headers: auth(student.token), data: { message: 123 } })).status()).toBe(400);
  const applied = await request.post(`${baseURL}/api/offers/${offerId}/apply`, { headers: auth(student.token), data: {} });
  expect(applied.status()).toBe(201);
  const applicationId = (await applied.json()).application.id;
  expect((await request.post(`${baseURL}/api/offers/${offerId}/apply`, { headers: auth(student.token), data: {} })).status()).toBe(409);
  const applications = await request.get(`${baseURL}/api/students/applications`, { headers: auth(student.token) });
  expect(applications.status()).toBe(200);
  expect((await applications.json()).applications.some((item) => item.offerId === offerId)).toBe(true);
  expect((await request.get(`${baseURL}/api/companies/offers/${offerId}/applications`, { headers: auth(company.token) })).status()).toBe(200);
  expect((await request.get(`${baseURL}/api/companies/offers/${offerId}/applications`, { headers: auth(otherCompany.token) })).status()).toBe(404);
  expect((await request.put(`${baseURL}/api/applications/${applicationId}/status`, { headers: auth(otherCompany.token), data: { status: 'ACCEPTED' } })).status()).toBe(403);
  expect((await request.put(`${baseURL}/api/applications/${applicationId}/status`, { headers: auth(company.token), data: { status: 'INVALID' } })).status()).toBe(400);
  const updated = await request.put(`${baseURL}/api/applications/${applicationId}/status`, { headers: auth(company.token), data: { status: 'ACCEPTED' } });
  expect(updated.status()).toBe(200);
  expect((await updated.json()).application.status).toBe('ACCEPTED');
  expect((await request.get(`${baseURL}/api/applications/${applicationId}/motivation-letter`, { headers: auth(otherStudent.token) })).status()).toBe(403);
  expect((await request.get(`${baseURL}/api/offers/nonexistent`)).status()).toBe(404);

  // Real persistence and retrieval of a synthetic CV, with tenant isolation.
  const invalidCv = await request.post(`${baseURL}/api/students/cv/upload`, { headers: auth(student.token), multipart: { cv: { name: 'React-expert.pdf', mimeType: 'application/pdf', buffer: Buffer.from('not a PDF') } } });
  expect(invalidCv.status()).toBe(400);
  const uploaded = await request.post(`${baseURL}/api/students/cv/upload`, { headers: auth(student.token), multipart: { cv: syntheticCv() } });
  expect(uploaded.status()).toBe(201);
  const cv = (await uploaded.json()).cv;
  expect(cv.parsedText).toContain('React');
  expect((await request.get(`${baseURL}/api/students/cv/${cv.id}`, { headers: auth(otherStudent.token) })).status()).toBe(404);
  const search = async (token, filters = {}) => request.post(`${baseURL}/api/rag/search`, { headers: auth(token), data: { query: 'React PostgreSQL', topK: 1, ownerType: 'CV', filters } });
  const ownSearch = await search(student.token);
  expect(ownSearch.status()).toBe(200);
  const own = await ownSearch.json();
  expect(own.count).toBe(1);
  expect(own.results[0].ownerId).toBe(cv.id);
  expect(own.results[0].embeddingJson).toBeUndefined();
  expect((await (await search(otherStudent.token)).json()).results).toEqual([]);
  expect((await (await search(student.token, { studentId: 'not-owned' })).json()).results).toEqual([]);
  expect((await request.post(`${baseURL}/api/rag/search`, { headers: auth(student.token), data: { query: '' } })).status()).toBe(400);

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
