import { randomUUID } from 'node:crypto';

import { expect, test } from '@playwright/test';
import { syntheticCv } from './fixtures.js';

const suffix = process.env.E2E_RUN_ID ? `web-${process.env.E2E_RUN_ID}` : randomUUID().slice(0, 12);
const offerTitle = `Stage QA Step10 ${suffix}`;
let offerId;
const companyEmail = `company-${suffix}@example.invalid`;
const studentEmail = `student-${suffix}@example.invalid`;

async function logout(page) {
  await page.getByRole('button', { name: 'Logout' }).first().click();
  await expect(page).toHaveURL(/\/login$/);
}

async function login(page, email, role) {
  await page.goto('/login');
  await page.getByLabel('Email').fill(email);
  await page.getByLabel('Mot de passe', { exact: true }).fill('Step10Password123');
  await page.getByRole('button', { name: 'Se connecter', exact: true }).click();
  await expect(page).toHaveURL(new RegExp(`/${role}/dashboard`));
}

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
    await register(page, 'COMPANY', companyEmail);
    await page.goto('/company/profile');
    await expect(page.getByText('Espace entreprise')).toBeVisible();
    await page.getByLabel('Nom de l entreprise').fill(`Synthetic QA ${suffix}`);
    await page.getByRole('button', { name: 'Enregistrer les modifications' }).click();
    await expect(page.getByRole('button', { name: 'Enregistrer les modifications' })).toBeDisabled();
    await page.reload();
    await expect(page.getByLabel('Nom de l entreprise')).toHaveValue(`Synthetic QA ${suffix}`);
    await page.goto('/company/offers/new');
    await page.getByLabel('Titre de l offre').fill(offerTitle);
    await page.getByLabel('Description').fill('Stage de validation fonctionnelle du parcours SmartIntern.');
    await page.getByLabel('Localisation').fill('Tunis');
    await page.getByLabel('Duree').fill('6 mois');
    await page.getByLabel('Competences requises', { exact: true }).fill('React');
    await page.getByLabel('Competences requises', { exact: true }).press('Enter');
    await page.getByRole('button', { name: 'Publier l offre' }).click();
    await expect(page).toHaveURL(/\/company\/offers\/[a-f0-9-]{36}$/);
    offerId = new URL(page.url()).pathname.split('/').at(-1);
    await expect(page.getByText(offerTitle)).toBeVisible();
    await page.goto(`/company/offers/${offerId}/edit`);
    await page.getByLabel('Localisation').fill('Tunis QA');
    await page.getByRole('button', { name: 'Enregistrer et publier' }).click();
    await expect(page.getByRole('button', { name: 'Enregistrer et publier' })).toBeDisabled();
    await page.goto('/company/applications');
    await expect(page.getByText('Espace entreprise')).toBeVisible();
    await logout(page);
    await login(page, companyEmail, 'company');
    await logout(page);
  });

  test('etudiant : inscription, profil, offre, candidature, suivi, logout', async ({ page }) => {
    expect(offerId).toBeTruthy();
    await register(page, 'STUDENT', studentEmail);
    await page.goto('/student/profile');
    await expect(page.getByText('Espace etudiant')).toBeVisible();
    await page.getByLabel('Objectif metier').fill('React developer');
    await page.getByLabel("Niveau d'etudes").fill('Engineering');
    await page.getByLabel('Localisation').fill('Tunis');
    await page.getByRole('button', { name: 'Enregistrer', exact: true }).click();
    await expect(page.getByRole('button', { name: 'Enregistrer', exact: true })).toBeDisabled();
    await page.reload();
    await expect(page.getByLabel('Objectif metier')).toHaveValue('React developer');
    await page.goto('/student/cv');
    await page.locator('input[type=file]').setInputFiles(syntheticCv());
    const uploaded = page.waitForResponse((response) => response.url().endsWith('/api/students/cv/upload') && response.request().method() === 'POST');
    await page.getByRole('button', { name: 'Analyser mon CV' }).click();
    const upload = await uploaded;
    expect(upload.status()).toBe(201);
    const cv = (await upload.json()).cv;
    expect(cv.parsedText).toContain('React');
    expect(cv.analysisJson.error).toBeUndefined();
    await page.goto('/student/offers');
    await expect(page.getByText(offerTitle).first()).toBeVisible();
    const matching = await page.request.get(`/api/offers/${offerId}/match`);
    expect(matching.status()).toBe(200);
    await page.goto(`/student/offers/${offerId}`);
    await expect(page.getByText(offerTitle).first()).toBeVisible();
    await page.getByRole('button', { name: 'Postuler', exact: true }).last().click();
    await page.getByRole('dialog').getByRole('button', { name: 'Envoyer ma candidature' }).click();
    await expect(page.getByText('Votre candidature a ete envoyee.')).toBeVisible();
    await page.reload();
    await expect(page.getByRole('button', { name: 'Candidature envoyee' }).last()).toBeDisabled();
    await page.goto('/student/applications');
    await expect(page.getByText(offerTitle).first()).toBeVisible();
    await page.locator('article').filter({ has: page.getByRole('heading', { name: offerTitle, exact: true }) }).getByRole('button', { name: 'Lettre de motivation', exact: true }).click();
    const generated = page.waitForResponse((response) => response.url().endsWith('/generate-letter'));
    await page.getByRole('dialog').getByRole('button', { name: 'Generer une lettre' }).click();
    const letter = await generated;
    expect(letter.status()).toBe(200);
    expect((await letter.json()).motivationLetter.content.length).toBeGreaterThan(100);
    await page.getByRole('button', { name: 'Fermer la lettre' }).click();
    await logout(page);
    await login(page, studentEmail, 'student');
    await logout(page);
  });

  test('entreprise : retrouve la candidature de son offre apres connexion', async ({ page }) => {
    await login(page, companyEmail, 'company');
    await page.goto(`/company/applications?offerId=${offerId}`);
    await page.getByRole('button', { name: 'Voir le profil resume' }).click();
    await expect(page.getByText(studentEmail, { exact: true }).first()).toBeVisible();
    await page.getByRole('button', { name: 'Fermer', exact: true }).click();
    await page.goto(`/company/candidate-ranking?offerId=${offerId}`);
    await expect(page.getByText('Test Step10', { exact: true }).first()).toBeVisible();
    await logout(page);
  });
});
