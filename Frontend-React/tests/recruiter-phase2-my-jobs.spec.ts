import { test, expect } from '@playwright/test';

const baseURL = 'http://localhost:8080';
const password = 'Test1234!';

const signupRecruiter = async (request, label: string) => {
  const email = `codex-${label}-${Date.now()}@example.com`;
  const response = await request.post(`${baseURL}/api/auth/signup`, {
    data: {
      email,
      password,
      full_name: `Codex ${label}`,
      role: 'recruiter',
    },
  });
  expect(response.status()).toBe(201);
  const body = await response.json();
  return { email, token: body.access_token };
};

const createJob = async (request, token: string, title: string) => {
  const response = await request.post(`${baseURL}/api/jobs`, {
    headers: { Authorization: `Bearer ${token}` },
    data: {
      title,
      job_description: `${title} created for recruiter ownership verification.`,
      location: 'Remote',
      company: `${title} Company`,
      required_skills: ['React', 'Node.js'],
      job_type: 'full_time',
    },
  });
  expect(response.status()).toBe(201);
  return response.json();
};

const login = async (page, email: string) => {
  await page.goto(`${baseURL}/signin`);
  await page.getByPlaceholder('you@example.com').fill(email);
  await page.getByPlaceholder('Enter your password').fill(password);
  await page.locator('form').getByRole('button', { name: /^sign in$/i }).click();
  await expect(page).toHaveURL(`${baseURL}/recruiter/profile`);
};

test('recruiter Jobs / My Jobs shows only owned postings and hides job seeker experience', async ({ page, request }) => {
  const stamp = Date.now();
  const r1 = await signupRecruiter(request, `r1-${stamp}`);
  const r2 = await signupRecruiter(request, `r2-${stamp}`);
  const jobATitle = `Codex R1 Browser Job A ${stamp}`;
  const jobBTitle = `Codex R2 Browser Job B ${stamp}`;

  await createJob(request, r1.token, jobATitle);
  await createJob(request, r2.token, jobBTitle);

  await login(page, r1.email);
  await page.getByRole('navigation').getByRole('button', { name: 'Jobs' }).click();

  await expect(page).toHaveURL(`${baseURL}/jobs`);
  await expect(page.getByRole('heading', { name: 'Jobs / My Jobs' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'My Posted Jobs' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Manage Jobs' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'AI Matches' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Applicants' })).toBeVisible();

  await expect(page.getByText(jobATitle)).toBeVisible();
  await expect(page.getByText(jobBTitle)).toHaveCount(0);
  await expect(page.getByText('Recommended for You')).toHaveCount(0);
  await expect(page.getByText('Discover opportunities matched to your skills')).toHaveCount(0);
  await expect(page.getByText('Avg. Match Score')).toHaveCount(0);
});
