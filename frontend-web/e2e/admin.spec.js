import { expect, test } from '@playwright/test';

test('administrateur : connexion, dashboard, utilisateurs, entreprises, logout', async ({ page }) => {
  const id = process.env.E2E_RUN_ID;
  test.skip(!id, 'The Kubernetes runner provisions and removes a unique administrator fixture.');
  await page.goto('/login');
  await page.getByLabel('Email').fill(`admin-${id}@example.invalid`);
  await page.getByLabel('Mot de passe', { exact: true }).fill(`E2E-${id}-Password123`);
  await page.getByRole('button', { name: 'Se connecter', exact: true }).click();
  await expect(page).toHaveURL(/\/admin\/dashboard$/);
  expect((await page.request.get('/api/admin/dashboard')).status()).toBe(200);
  for (const section of ['users', 'companies']) {
    const loaded = page.waitForResponse((response) => new URL(response.url()).pathname === `/api/admin/${section}`);
    await page.goto(`/admin/${section}`);
    expect((await loaded).status()).toBe(200);
    await expect(page.getByText('Administration', { exact: true }).first()).toBeVisible();
  }
  await page.getByRole('button', { name: 'Logout' }).click();
  await expect(page).toHaveURL(/\/login$/);
});
