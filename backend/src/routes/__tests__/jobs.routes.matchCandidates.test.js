process.env.SUPABASE_URL = process.env.SUPABASE_URL || 'http://localhost:54321';
process.env.SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || 'test-anon-key';
process.env.SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || 'test-service-key';

const request = require('supertest');
const express = require('express');

// Mock auth middleware and services before requiring routes
jest.mock('../../middlewares/auth.middleware', () => ({
  protect: (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'Unauthorized: No token provided' });
    }
    if (authHeader === 'Bearer invalid-token') {
      return res.status(401).json({ error: 'Unauthorized: Invalid token' });
    }
    if (authHeader === 'Bearer job-seeker-token') {
      req.user = { id: 'job-seeker-111', role: 'job_seeker' };
      return next();
    }
    if (authHeader === 'Bearer recruiter-owner-token') {
      req.user = { id: 'recruiter-9999', role: 'recruiter' };
      return next();
    }
    if (authHeader === 'Bearer recruiter-other-token') {
      req.user = { id: 'recruiter-8888', role: 'recruiter' };
      return next();
    }
    return res.status(401).json({ error: 'Unauthorized' });
  },
}));

// Mock recruiterMatching.service
jest.mock('../../services/recruiterMatching.service', () => {
  const original = jest.requireActual('../../services/recruiterMatching.service');
  return {
    ...original,
    runRecruiterJobMatching: jest.fn(async ({ jobId, recruiterId, userRole }) => {
      if (userRole === 'job_seeker') {
        throw new original.RecruiterMatchingError('FORBIDDEN_ROLE', 'Forbidden: Recruiter or admin role required', 403);
      }
      if (jobId === 'job-missing') {
        throw new original.RecruiterMatchingError('JOB_NOT_FOUND', 'Job posting not found', 404);
      }
      if (jobId === 'job-owned' && recruiterId !== 'recruiter-9999' && userRole !== 'admin') {
        throw new original.RecruiterMatchingError('FORBIDDEN_OWNERSHIP', 'Forbidden: You do not own this job posting', 403);
      }

      return {
        success: true,
        data: {
          jobId,
          candidatesConsidered: 10,
          candidatesSuccessfullyEvaluated: 10,
          completionStatus: 'complete',
          rankedCandidates: [],
        },
      };
    }),
  };
});

const jobsRoutes = require('../jobs.routes');

const app = express();
app.use(express.json());
app.use('/api/jobs', jobsRoutes);

describe('POST /api/jobs/:jobId/match-candidates Route Integration', () => {
  beforeEach(() => jest.spyOn(console, 'error').mockImplementation(() => {}));
  afterEach(() => jest.restoreAllMocks());

  // ── 1. No authentication token -> 401 ──────────────────────────────
  test('1. returns 401 Unauthorized when authorization header is missing', async () => {
    const res = await request(app).post('/api/jobs/job-owned/match-candidates');
    expect(res.status).toBe(401);
  });

  // ── 2. Invalid authentication -> 401 ───────────────────────────────
  test('2. returns 401 Unauthorized when invalid token is supplied', async () => {
    const res = await request(app)
      .post('/api/jobs/job-owned/match-candidates')
      .set('Authorization', 'Bearer invalid-token');
    expect(res.status).toBe(401);
  });

  // ── 3. Job Seeker token/identity -> 403 ────────────────────────────
  test('3. returns 403 Forbidden when user role is job_seeker', async () => {
    const res = await request(app)
      .post('/api/jobs/job-owned/match-candidates')
      .set('Authorization', 'Bearer job-seeker-token');
    expect(res.status).toBe(403);
  });

  // ── 4. Recruiter matching own job -> 200 Success ────────────────────
  test('4. returns 200 Success when recruiter matches their own job posting', async () => {
    const res = await request(app)
      .post('/api/jobs/job-owned/match-candidates')
      .set('Authorization', 'Bearer recruiter-owner-token');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  // ── 5. Recruiter matching another recruiter job -> 403 ─────────────
  test("5. returns 403 Forbidden when recruiter attempts to match another recruiter's job", async () => {
    const res = await request(app)
      .post('/api/jobs/job-owned/match-candidates')
      .set('Authorization', 'Bearer recruiter-other-token');
    expect(res.status).toBe(403);
  });

  // ── 6. Missing job -> 404 ──────────────────────────────────────────
  test('6. returns 404 Not Found when job posting does not exist', async () => {
    const res = await request(app)
      .post('/api/jobs/job-missing/match-candidates')
      .set('Authorization', 'Bearer recruiter-owner-token');
    expect(res.status).toBe(404);
  });
});
