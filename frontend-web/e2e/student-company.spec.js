import { randomUUID } from 'node:crypto';

import { expect, test } from '@playwright/test';

const suffix = randomUUID().slice(0, 12);
const offerTitle = `Stage QA Step10 ${suffix}`;
let offerId;

async function register(page, role, email) {
  await page.goto('/register');
  await page.getByLabel('Prenom').fill('Test');
  await page.getByLabel('Nom', { exact: true }).fill('Step10');
  await page.getByLabel('Email').fill(email);
  await page.getByLabel('Mot de passe', { exact: true }).fill('Step10Password123');
  await page.getByLabel('Confirmer le mot de passe').fill('Step10Password123');
  if (role === 'COMPANY') {
    await page.getByText('Entreprise', { exact: true }).click();
  }
  await page.getByRole('button', { name: 'Creer mon compte' }).click();
  await expect(page).toHaveURL(new RegExp(`/${role === 'COMPANY' ? 'company' : 'student'}/dashboard`));
}

test.describe.serial('Parcours entreprise et etudiant', () => {
  test('entreprise : inscription, profil, publication, candidatures, logout', async ({ page }) => {
    await register(page, 'COMPANY', `company-${suffix}@example.invalid`);
    await page.goto('/company/profile');
    await expect(page.getByText('Espace entreprise')).toBeVisible();
    await page.goto('/company/offers/new');
    await page.getByLabel('Titre de l offre').fill(offerTitle);
    await page.getByLabel('Description').fill('Stage de validation fonctionnelle du parcours SmartIntern.');
    await page.getByLabel('Localisation').fill('Tunis');
    await page.getByLabel('Duree').fill('6 mois');
    await page.getByRole('button', { name: 'Publier l offre' }).click();
    await expect(page).toHaveURL(/\/company\/offers\/[a-f0-9-]{36}$/);
    offerId = new URL(page.url()).pathname.split('/').at(-1);
    await expect(page.getByText(offerTitle)).toBeVisible();
    await page.goto('/company/applications');
    await expect(page.getByText('Espace entreprise')).toBeVisible();
    await page.getByRole('button', { name: 'Logout' }).first().click();
    await expect(page).toHaveURL(/\/login$/);
  });

  test('etudiant : inscription, profil, offre, candidature, suivi, logout', async ({ page }) => {
    expect(offerId).toBeTruthy();
    await register(page, 'STUDENT', `student-${suffix}@example.invalid`);
    await page.goto('/student/profile');
    await expect(page.getByText('Espace etudiant')).toBeVisible();
    await page.goto('/student/offers');
    await expect(page.getByText(offerTitle).first()).toBeVisible();
    await page.goto(`/student/offers/${offerId}`);
    await expect(page.getByText(offerTitle).first()).toBeVisible();
    await page.getByRole('button', { name: 'Postuler', exact: true }).last().click();
    await page.getByRole('dialog').getByRole('button', { name: 'Envoyer ma candidature' }).click();
    await expect(page.getByText('Votre candidature a ete envoyee.')).toBeVisible();
    await page.reload();
    await expect(page.getByRole('button', { name: 'Candidature envoyee' }).last()).toBeDisabled();
    await page.goto('/student/applications');
    await expect(page.getByText(offerTitle).first()).toBeVisible();
    await page.getByRole('button', { name: 'Logout' }).first().click();
    await expect(page).toHaveURL(/\/login$/);
  });
});
