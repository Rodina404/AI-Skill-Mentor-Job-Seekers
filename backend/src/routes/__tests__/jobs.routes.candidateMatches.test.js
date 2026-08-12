const request = require('supertest');
const express = require('express');

// Mock supabaseAdmin
jest.mock('../../config/supabase', () => ({
  supabaseAdmin: {
    from: jest.fn(),
  },
}));

// Variable to control mock auth user per test
let mockUser = { id: 'recruiter-9999', role: 'recruiter' };

jest.mock('../../middlewares/auth.middleware', () => ({
  protect: (req, res, next) => {
    if (!mockUser) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    req.user = mockUser;
    next();
  },
}));

const { supabaseAdmin } = require('../../config/supabase');
const jobsRouter = require('../jobs.routes');

const app = express();
app.use(express.json());
app.use('/api/jobs', jobsRouter);

describe('GET /api/jobs/:jobId/candidate-matches Endpoint Tests', () => {
  const sampleJob = { id: 'job-1111', title: 'Backend Lead', recruiter_id: 'recruiter-9999', updated_at: '2026-08-01T00:00:00Z' };

  const sampleMatch1 = {
    id: 'cm-1',
    job_posting_id: 'job-1111',
    job_seeker_profile_id: 'profile-001',
    user_id: 'user-001',
    match_score: 95,
    matched_skills: ['Node.js', 'Python'],
    missing_skills: [],
    calculated_at: '2026-08-05T00:00:00Z',
    job_seeker_profiles: {
      id: 'profile-001',
      years_of_experience: 5,
      is_discoverable: true,
      updated_at: '2026-08-01T00:00:00Z',
      users: { first_name: 'Bob', last_name: 'Architect' },
    },
  };

  const sampleMatch2 = {
    id: 'cm-2',
    job_posting_id: 'job-1111',
    job_seeker_profile_id: 'profile-002',
    user_id: 'user-002',
    match_score: 75,
    matched_skills: ['Python'],
    missing_skills: ['FastAPI'],
    calculated_at: '2026-08-05T00:00:00Z',
    job_seeker_profiles: {
      id: 'profile-002',
      years_of_experience: 2,
      is_discoverable: true,
      updated_at: '2026-08-01T00:00:00Z',
      users: { first_name: 'Alice', last_name: 'Junior' },
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockUser = { id: 'recruiter-9999', role: 'recruiter' };

    supabaseAdmin.from.mockImplementation((table) => {
      if (table === 'job_postings') {
        return {
          select: () => ({
            eq: (col, val) => ({
              single: async () => {
                if (val === 'job-1111') return { data: sampleJob, error: null };
                if (val === 'other-recruiter-job') return { data: { ...sampleJob, id: 'other-recruiter-job', recruiter_id: 'other-recruiter-8888' }, error: null };
                return { data: null, error: { message: 'Not found' } };
              },
            }),
          }),
        };
      }

      if (table === 'candidate_matches') {
        return {
          select: () => ({
            eq: () => ({
              order: () => ({
                range: async () => ({
                  data: [sampleMatch1, sampleMatch2],
                  error: null,
                  count: 2,
                }),
              }),
            }),
          }),
        };
      }

      return {};
    });
  });

  test('1. returns 401 if user is unauthenticated', async () => {
    mockUser = null;

    const res = await request(app).get('/api/jobs/job-1111/candidate-matches');
    expect(res.status).toBe(401);
  });

  test('2. returns 403 if user is a Job Seeker', async () => {
    mockUser = { id: 'user-001', role: 'job_seeker' };

    const res = await request(app).get('/api/jobs/job-1111/candidate-matches');
    expect(res.status).toBe(403);
    expect(res.body.error).toContain('Forbidden');
  });

  test('3. returns 404 if job posting does not exist', async () => {
    const res = await request(app).get('/api/jobs/missing-job/candidate-matches');
    expect(res.status).toBe(404);
  });

  test('4. returns 403 if recruiter does not own the job posting', async () => {
    const res = await request(app).get('/api/jobs/other-recruiter-job/candidate-matches');
    expect(res.status).toBe(403);
    expect(res.body.error.message).toContain('You do not own this job posting');
  });

  test('5. returns 200 with persisted candidate matches sorted by match_score DESC for job owner', async () => {
    const res = await request(app).get('/api/jobs/job-1111/candidate-matches');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.totalMatches).toBe(2);
    expect(res.body.data.matches).toHaveLength(2);

    // Sorted DESC: Bob (95) then Alice (75)
    expect(res.body.data.matches[0].name).toBe('Bob Architect');
    expect(res.body.data.matches[0].score).toBe(95);
    expect(res.body.data.matches[0].isStale).toBe(false);

    expect(res.body.data.matches[1].name).toBe('Alice Junior');
    expect(res.body.data.matches[1].score).toBe(75);
    expect(res.body.data.matches[1].isStale).toBe(false);
  });

  test('6. allows admin role to view matches for any job posting', async () => {
    mockUser = { id: 'admin-1234', role: 'admin' };

    const res = await request(app).get('/api/jobs/other-recruiter-job/candidate-matches');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});
