process.env.SUPABASE_URL = process.env.SUPABASE_URL || 'http://localhost:54321';
process.env.SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || 'test-anon-key';
process.env.SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || 'test-service-key';

const request = require('supertest');
const express = require('express');

const jobs = [
  { id: 'job-a', title: 'R1 Job A', recruiter_id: 'recruiter-r1', status: 'open', created_at: '2026-08-01T00:00:00Z' },
  { id: 'job-b', title: 'R2 Job B', recruiter_id: 'recruiter-r2', status: 'open', created_at: '2026-08-02T00:00:00Z' },
];

const eqCalls = [];

jest.mock('../../middlewares/auth.middleware', () => ({
  protect: (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (authHeader === 'Bearer recruiter-r1-token') {
      req.user = { id: 'recruiter-r1', role: 'recruiter' };
      return next();
    }
    if (authHeader === 'Bearer recruiter-r2-token') {
      req.user = { id: 'recruiter-r2', role: 'recruiter' };
      return next();
    }
    if (authHeader === 'Bearer job-seeker-token') {
      req.user = { id: 'job-seeker-1', role: 'job_seeker' };
      return next();
    }
    return res.status(401).json({ error: 'Unauthorized' });
  },
}));

jest.mock('../../config/supabase', () => ({
  supabaseAdmin: {
    from: jest.fn(() => {
      const filters = [];
      return {
        select: jest.fn(function select() { return this; }),
        eq: jest.fn(function eq(column, value) {
          eqCalls.push([column, value]);
          filters.push([column, value]);
          return this;
        }),
        order: jest.fn(async () => {
          const filtered = jobs.filter((job) => (
            filters.every(([column, value]) => job[column] === value)
          ));
          return { data: filtered, error: null };
        }),
      };
    }),
  },
  supabase: {},
}));

const jobsRoutes = require('../jobs.routes');

const app = express();
app.use(express.json());
app.use('/api/jobs', jobsRoutes);

describe('GET /api/jobs/recruiter/my-jobs', () => {
  beforeEach(() => {
    eqCalls.length = 0;
  });

  test('returns only jobs owned by recruiter R1', async () => {
    const res = await request(app)
      .get('/api/jobs/recruiter/my-jobs?status=open')
      .set('Authorization', 'Bearer recruiter-r1-token');

    expect(res.status).toBe(200);
    expect(res.body.data.jobs).toEqual([jobs[0]]);
    expect(eqCalls).toContainEqual(['recruiter_id', 'recruiter-r1']);
  });

  test('returns only jobs owned by recruiter R2', async () => {
    const res = await request(app)
      .get('/api/jobs/recruiter/my-jobs?status=open')
      .set('Authorization', 'Bearer recruiter-r2-token');

    expect(res.status).toBe(200);
    expect(res.body.data.jobs).toEqual([jobs[1]]);
    expect(eqCalls).toContainEqual(['recruiter_id', 'recruiter-r2']);
  });

  test('rejects job seekers', async () => {
    const res = await request(app)
      .get('/api/jobs/recruiter/my-jobs')
      .set('Authorization', 'Bearer job-seeker-token');

    expect(res.status).toBe(403);
  });
});
