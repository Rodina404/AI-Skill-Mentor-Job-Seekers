import { test, expect } from '@playwright/test';

const baseURL = 'http://localhost:8080';
const password = 'Test1234!';

test('recruiter can edit an owned job without duplication and delete with cancel/confirm behavior', async ({ page, request }) => {
  const stamp = Date.now();
  const email = `codex-phase3-${stamp}@example.com`;
  const originalTitle = `Codex Phase3 Original ${stamp}`;
  const updatedTitle = `Codex Phase3 Updated ${stamp}`;

  const signup = await request.post(`${baseURL}/api/auth/signup`, {
    data: {
      email,
      password,
      full_name: 'Codex Phase3 Recruiter',
      role: 'recruiter',
    },
  });
  expect(signup.status()).toBe(201);
  const session = await signup.json();

  const created = await request.post(`${baseURL}/api/jobs`, {
    headers: { Authorization: `Bearer ${session.access_token}` },
    data: {
      title: originalTitle,
      job_description: 'Original description for the Phase 3 edit flow.',
      location: 'Remote',
      company: 'Phase3 Co',
      required_skills: ['React', 'Node.js'],
      job_type: 'full_time',
    },
  });
  expect(created.status()).toBe(201);
  const createdBody = await created.json();
  const jobId = createdBody.data.job.id;

  await page.goto(`${baseURL}/signin`);
  await page.getByPlaceholder('you@example.com').fill(email);
  await page.getByPlaceholder('Enter your password').fill(password);
  await page.locator('form').getByRole('button', { name: /^sign in$/i }).click();
  await expect(page).toHaveURL(`${baseURL}/recruiter/profile`);
  await expect(page.getByText(originalTitle)).toBeVisible();

  const originalCard = page.locator('div').filter({ hasText: originalTitle }).filter({ has: page.getByRole('button', { name: 'Manage', exact: true }) }).first();
  await originalCard.getByRole('button', { name: 'Manage', exact: true }).click();
  await page.getByRole('button', { name: 'Edit Job' }).click();

  const editModal = page.locator('div.fixed').filter({ hasText: `Edit Job: ${originalTitle}` }).last();
  await expect(editModal.getByText(`Edit Job: ${originalTitle}`)).toBeVisible();
  await editModal.locator('input').nth(0).fill(updatedTitle);
  await editModal.locator('input').nth(1).fill('Phase3 Updated Co');
  await editModal.locator('input').nth(2).fill('Hybrid');
  await editModal.locator('input').nth(3).fill('React, TypeScript, SQL');
  await editModal.locator('textarea').fill('Updated description for the same Phase 3 job record.');
  await editModal.getByRole('button', { name: /save changes/i }).click();

  await expect(page.getByText('Job updated successfully!')).toBeVisible();
  await expect(page.getByText(updatedTitle)).toBeVisible();
  await expect(page.getByText(originalTitle)).toHaveCount(0);

  const updated = await request.get(`${baseURL}/api/jobs/${jobId}`);
  expect(updated.status()).toBe(200);
  const updatedBody = await updated.json();
  expect(updatedBody.data.id).toBe(jobId);
  expect(updatedBody.data.title).toBe(updatedTitle);
  expect(updatedBody.data.required_skills).toEqual(['React', 'TypeScript', 'SQL']);

  await page.reload();
  await expect(page.getByText(updatedTitle)).toBeVisible({ timeout: 15000 });

  const updatedCard = page.locator('div').filter({ hasText: updatedTitle }).filter({ has: page.getByRole('button', { name: 'Manage', exact: true }) }).first();
  await updatedCard.getByRole('button', { name: 'Manage', exact: true }).click();
  page.once('dialog', async (dialog) => {
    expect(dialog.message()).toContain('delete this job posting');
    await dialog.dismiss();
  });
  await page.getByRole('button', { name: 'Delete Job Post' }).click();
  await expect(page.getByRole('heading', { name: updatedTitle, exact: true })).toBeVisible();

  page.once('dialog', async (dialog) => {
    expect(dialog.message()).toContain('delete this job posting');
    await dialog.accept();
  });
  await page.getByRole('button', { name: 'Delete Job Post' }).click();
  await expect(page.getByText('Job deleted successfully!')).toBeVisible();
  await expect(page.getByText(updatedTitle)).toHaveCount(0);

  const deleted = await request.get(`${baseURL}/api/jobs/${jobId}`);
  expect(deleted.status()).toBe(404);
});
