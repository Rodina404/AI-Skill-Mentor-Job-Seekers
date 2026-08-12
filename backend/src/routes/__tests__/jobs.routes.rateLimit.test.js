process.env.SUPABASE_URL = process.env.SUPABASE_URL || 'http://localhost:54321';
process.env.SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || 'test-anon-key';
process.env.SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || 'test-service-key';

const request = require('supertest');
const express = require('express');

// Mock auth middleware
jest.mock('../../middlewares/auth.middleware', () => ({
  protect: (req, res, next) => {
    req.user = { id: 'recruiter-9999', role: 'recruiter' };
    next();
  },
}));

// Mock matching service
jest.mock('../../services/recruiterMatching.service', () => ({
  runRecruiterJobMatching: jest.fn(async () => ({
    success: true,
    data: { jobId: 'job-111', candidatesConsidered: 1, rankedCandidates: [] },
  })),
  RecruiterMatchingError: class RecruiterMatchingError extends Error {
    constructor(code, message, statusCode = 500) {
      super(message);
      this.code = code;
      this.statusCode = statusCode;
    }
  },
}));

// Mock recruiter matches repository
jest.mock('../../repositories/recruiterMatches.repository', () => ({
  persistRecruiterMatches: jest.fn(async () => ({ success: true, persisted: true })),
  getPersistedCandidateMatches: jest.fn(async () => ({ success: true, matches: [] })),
}));

// Mock Supabase admin
jest.mock('../../config/supabase', () => ({
  supabaseAdmin: {
    from: jest.fn((table) => {
      if (table === 'job_postings') {
        return {
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          single: jest.fn().mockResolvedValue({
            data: { id: 'job-111', recruiter_id: 'recruiter-9999' },
            error: null,
          }),
        };
      }
      if (table === 'job_seeker_profiles') {
        return {
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          single: jest.fn().mockResolvedValue({
            data: { id: 'profile-111', user_id: 'user-111', is_discoverable: true },
            error: null,
          }),
        };
      }
      if (table === 'job_applications') {
        return {
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          or: jest.fn().mockReturnThis(),
          limit: jest.fn().mockResolvedValue({
            data: [{ id: 'app-1', resume_id: 'res-1', user_id: 'user-111' }],
          }),
        };
      }
      if (table === 'candidate_matches') {
        return {
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          limit: jest.fn().mockResolvedValue({ data: [] }),
        };
      }
      if (table === 'resumes') {
        return {
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          single: jest.fn().mockResolvedValue({
            data: { id: 'res-1', user_id: 'user-111', file_path: 'user-111/cv.pdf' },
            error: null,
          }),
        };
      }
      return { select: jest.fn().mockReturnThis() };
    }),
    storage: {
      from: jest.fn().mockReturnValue({
        createSignedUrl: jest.fn().mockResolvedValue({
          data: { signedUrl: 'https://example.com/signed.pdf' },
          error: null,
        }),
      }),
    },
  },
}));

const jobsRouter = require('../jobs.routes');

const buildApp = () => {
  const app = express();
  app.use(express.json());
  app.use('/api/jobs', jobsRouter);
  return app;
};

describe('Recruiter Endpoint Rate Limiting Tests', () => {
  let app;

  beforeEach(() => {
    jest.clearAllMocks();
    app = buildApp();
  });

  test('POST /api/jobs/:jobId/match-candidates allows normal requests within threshold', async () => {
    const res = await request(app)
      .post('/api/jobs/job-111/match-candidates')
      .set('Authorization', 'Bearer valid-token');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  test('GET /api/jobs/:jobId/candidates/:candidateId/resume-url allows normal requests within threshold', async () => {
    const res = await request(app)
      .get('/api/jobs/job-111/candidates/profile-111/resume-url')
      .set('Authorization', 'Bearer valid-token');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.url).toBe('https://example.com/signed.pdf');
  });

  test('POST /api/jobs/:jobId/match-candidates returns 429 when threshold exceeded', async () => {
    // Fire requests up to threshold limit (10)
    for (let i = 0; i < 10; i++) {
      await request(app)
        .post('/api/jobs/job-111/match-candidates')
        .set('Authorization', 'Bearer valid-token');
    }

    // 11th request should be rate-limited (HTTP 429)
    const limitedRes = await request(app)
      .post('/api/jobs/job-111/match-candidates')
      .set('Authorization', 'Bearer valid-token');

    expect(limitedRes.status).toBe(429);
    expect(limitedRes.body.success).toBe(false);
    expect(limitedRes.body.error.code).toBe('TOO_MANY_REQUESTS');
    expect(limitedRes.body.error.message).toContain('Too many candidate matching requests');
  });

  test('GET /api/jobs/:jobId/candidates/:candidateId/resume-url returns 429 when threshold exceeded', async () => {
    // Fire requests up to threshold limit (30)
    for (let i = 0; i < 30; i++) {
      await request(app)
        .get('/api/jobs/job-111/candidates/profile-111/resume-url')
        .set('Authorization', 'Bearer valid-token');
    }

    // 31st request should be rate-limited (HTTP 429)
    const limitedRes = await request(app)
      .get('/api/jobs/job-111/candidates/profile-111/resume-url')
      .set('Authorization', 'Bearer valid-token');

    expect(limitedRes.status).toBe(429);
    expect(limitedRes.body.success).toBe(false);
    expect(limitedRes.body.error.code).toBe('TOO_MANY_REQUESTS');
    expect(limitedRes.body.error.message).toContain('Too many resume URL requests');
  });
});
