import { test, expect, type Page } from '@playwright/test';

const baseURL = 'http://localhost:8080';
const expectRecruiterProfile = async (page: Page) => {
  await expect(page.getByRole('button', { name: /post new job/i }).first()).toBeVisible();
};

test('logged-out protected recruiter route redirects to signin with matching UI', async ({ page }) => {
  await page.goto(`${baseURL}/recruiter/profile`);
  await expect(page).toHaveURL(`${baseURL}/signin`);
  await expect(page.getByRole('heading', { name: /welcome back/i })).toBeVisible();
});

test('invalid stored session is cleared and does not keep recruiter UI mounted', async ({ page }) => {
  await page.goto(baseURL);
  await page.evaluate(() => {
    localStorage.setItem('token', 'expired-access-token');
    localStorage.setItem('refresh_token', 'expired-refresh-token');
    localStorage.setItem('currentUser', JSON.stringify({
      id: 'stale-recruiter',
      name: 'Recruiter R1 UI',
      email: 'stale@example.com',
      role: 'recruiter',
    }));
  });

  const api401s: string[] = [];
  page.on('response', (response) => {
    if (response.url().includes('/api/') && response.status() === 401) {
      api401s.push(response.url());
    }
  });

  await page.goto(`${baseURL}/recruiter/profile`);
  await expect(page).toHaveURL(`${baseURL}/signin`);
  await expect(page.getByRole('heading', { name: /welcome back/i })).toBeVisible();
  await expect(page.getByText('Recruiter R1 UI')).toHaveCount(0);

  const storage = await page.evaluate(() => ({
    token: localStorage.getItem('token'),
    refresh: localStorage.getItem('refresh_token'),
    currentUser: localStorage.getItem('currentUser'),
  }));
  expect(storage).toEqual({ token: null, refresh: null, currentUser: null });

  await page.waitForTimeout(1200);
  expect(api401s.filter((url) => url.includes('/notifications')).length).toBe(0);
});

test('login page keeps signin URL after failed login', async ({ page }) => {
  await page.goto(`${baseURL}/signin`);
  await page.getByPlaceholder('you@example.com').fill('not-a-real-user@example.com');
  await page.getByPlaceholder('Enter your password').fill('WrongPassword123!');
  await page.locator('form').getByRole('button', { name: /^sign in$/i }).click();

  await expect(page).toHaveURL(`${baseURL}/signin`);
  await expect(page.getByText(/incorrect email or password|invalid credentials/i)).toBeVisible();
});

test('recruiter login, refresh restoration, logout, back, and login again keep URL and UI aligned', async ({ page, request }) => {
  const email = `codex-recruiter-${Date.now()}@example.com`;
  const password = 'Test1234!';

  const signup = await request.post(`${baseURL}/api/auth/signup`, {
    data: {
      email,
      password,
      full_name: 'Codex Recruiter Phase1',
      role: 'recruiter',
    },
  });
  expect(signup.status()).toBe(201);

  await page.goto(`${baseURL}/signin`);
  await page.getByPlaceholder('you@example.com').fill(email);
  await page.getByPlaceholder('Enter your password').fill(password);
  await page.locator('form').getByRole('button', { name: /^sign in$/i }).click();

  await expect(page).toHaveURL(`${baseURL}/recruiter/profile`);
  await expectRecruiterProfile(page);

  await page.reload();
  await expect(page).toHaveURL(`${baseURL}/recruiter/profile`);
  await expectRecruiterProfile(page);

  await page.goto(`${baseURL}/recruiter/profile`);
  await expectRecruiterProfile(page);

  await page.getByRole('button', { name: /codex recruiter phase1/i }).click();
  await page.getByRole('button', { name: /logout/i }).click();
  await expect(page).toHaveURL(`${baseURL}/signin`);
  await expect(page.getByRole('heading', { name: /welcome back/i })).toBeVisible();

  await page.goBack();
  await expect(page).toHaveURL(`${baseURL}/signin`);
  await expect(page.getByRole('heading', { name: /welcome back/i })).toBeVisible();

  await page.getByPlaceholder('you@example.com').fill(email);
  await page.getByPlaceholder('Enter your password').fill(password);
  await page.locator('form').getByRole('button', { name: /^sign in$/i }).click();
  await expect(page).toHaveURL(`${baseURL}/recruiter/profile`);
  await expectRecruiterProfile(page);
});
