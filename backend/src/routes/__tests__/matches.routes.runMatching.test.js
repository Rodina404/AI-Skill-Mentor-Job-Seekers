const request = require('supertest');
const express = require('express');
const axios = require('axios');

// Mock supabaseAdmin
jest.mock('../../config/supabase', () => ({
  supabaseAdmin: {
    from: jest.fn(),
  },
}));

// Mock auth middleware
jest.mock('../../middlewares/auth.middleware', () => ({
  protect: (req, res, next) => {
    req.user = { id: 'user-1234', role: 'job_seeker' };
    next();
  },
  authenticate: (req, res, next) => {
    req.user = { id: 'user-1234', role: 'job_seeker' };
    next();
  },
}));

// Mock axios
jest.mock('axios');

const { supabaseAdmin } = require('../../config/supabase');
const matchesRouter = require('../matches.routes');

const app = express();
app.use(express.json());
app.use('/api/matches', matchesRouter);

describe('Job Seeker Flow - POST /api/matches/run Contract Tests', () => {
  const sampleUser = { first_name: 'Jane', last_name: 'Seeker' };
  const sampleProfile = { id: 'profile-5555', years_of_experience: 3.0, location: 'Remote' };
  const sampleResume = { normalized_skills: ['Python', 'FastAPI'], extracted_data: { education: [{ degree: 'BSc' }] } };
  const sampleJob = { id: 'job-9999', title: 'Python Dev', job_description: 'FastAPI engineer needed', required_skills: ['Python'] };

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock Supabase chained calls
    supabaseAdmin.from.mockImplementation((table) => {
      if (table === 'users') {
        return {
          select: () => ({ eq: () => ({ single: async () => ({ data: sampleUser, error: null }) }) }),
        };
      }
      if (table === 'job_seeker_profiles') {
        return {
          select: () => ({ eq: () => ({ single: async () => ({ data: sampleProfile, error: null }) }) }),
        };
      }
      if (table === 'resumes') {
        return {
          select: () => ({ eq: () => ({ eq: () => ({ single: async () => ({ data: sampleResume, error: null }) }) }) }),
        };
      }
      if (table === 'job_postings') {
        return {
          select: () => ({ eq: () => ({ single: async () => ({ data: sampleJob, error: null }) }) }),
        };
      }
      if (table === 'candidate_matches') {
        return {
          upsert: () => ({ select: () => ({ single: async () => ({ data: { id: 'match-111' }, error: null }) }) }),
        };
      }
      if (table === 'readiness_scores') {
        return {
          select: () => ({ eq: () => ({ eq: () => ({ order: () => ({ limit: () => ({ maybeSingle: async () => ({ data: null }) }) }) }) }) }),
          insert: async () => ({ error: null }),
        };
      }
      if (table === 'skill_gaps') {
        return {
          select: () => ({ eq: () => ({ eq: () => ({ maybeSingle: async () => ({ data: null }) }) }) }),
          insert: async () => ({ error: null }),
        };
      }
      return {
        select: () => ({ eq: () => ({ single: async () => ({ data: {}, error: null }) }) }),
      };
    });
  });

  // Helper for mock AI response
  const mockAiResponse = (rankedCandidates, success = true) => {
    axios.post.mockImplementation((url) => {
      if (url.includes(':8003/match') || url.includes('/match')) {
        return Promise.resolve({
          data: {
            success,
            data: {
              jobId: 'job-9999',
              rankedCandidates,
            },
          },
        });
      }
      if (url.includes(':8004/analyze-role-gap')) {
        return Promise.resolve({
          data: {
            success: true,
            data: { readiness: 0.8, required_skills: ['Python'], matched_skills: ['Python'], missing_skills: [] },
          },
        });
      }
      return Promise.resolve({ data: { success: true, data: [] } });
    });
  };

  test('1. accepts valid score 0.0 without fallback', async () => {
    mockAiResponse([{ candidateId: 'resume-1111', name: 'Jane Seeker', score: 0.0 }]);

    const res = await request(app)
      .post('/api/matches/run')
      .send({ resume_id: 'resume-1111', job_id: 'job-9999' });

    expect(res.status).toBe(200);
    expect(res.body.match_score).toBe(0);
  });

  test('2. interprets valid score 50.4 as rounded 50', async () => {
    mockAiResponse([{ candidateId: 'resume-1111', name: 'Jane Seeker', score: 50.4 }]);

    const res = await request(app)
      .post('/api/matches/run')
      .send({ resume_id: 'resume-1111', job_id: 'job-9999' });

    expect(res.status).toBe(200);
    expect(res.body.match_score).toBe(50);
  });

  test('3. accepts valid score 100.0', async () => {
    mockAiResponse([{ candidateId: 'resume-1111', name: 'Jane Seeker', score: 100.0 }]);

    const res = await request(app)
      .post('/api/matches/run')
      .send({ resume_id: 'resume-1111', job_id: 'job-9999' });

    expect(res.status).toBe(200);
    expect(res.body.match_score).toBe(100);
  });

  test('4. rejects null score with 502 and does NOT use fallback score 75', async () => {
    mockAiResponse([{ candidateId: 'resume-1111', name: 'Jane Seeker', score: null }]);

    const res = await request(app)
      .post('/api/matches/run')
      .send({ resume_id: 'resume-1111', job_id: 'job-9999' });

    expect(res.status).toBe(502);
    expect(res.body.error).toBe('CV Matching Service failure');
    expect(res.body.detail).toContain('null or undefined score');
  });

  test('5. rejects missing score property with 502', async () => {
    mockAiResponse([{ candidateId: 'resume-1111', name: 'Jane Seeker' }]);

    const res = await request(app)
      .post('/api/matches/run')
      .send({ resume_id: 'resume-1111', job_id: 'job-9999' });

    expect(res.status).toBe(502);
    expect(res.body.error).toBe('CV Matching Service failure');
  });

  test('6. rejects NaN score with 502', async () => {
    mockAiResponse([{ candidateId: 'resume-1111', name: 'Jane Seeker', score: 'NaN' }]);

    const res = await request(app)
      .post('/api/matches/run')
      .send({ resume_id: 'resume-1111', job_id: 'job-9999' });

    expect(res.status).toBe(502);
    expect(res.body.error).toBe('CV Matching Service failure');
  });

  test('7. rejects Infinity score with 502', async () => {
    mockAiResponse([{ candidateId: 'resume-1111', name: 'Jane Seeker', score: Infinity }]);

    const res = await request(app)
      .post('/api/matches/run')
      .send({ resume_id: 'resume-1111', job_id: 'job-9999' });

    expect(res.status).toBe(502);
    expect(res.body.error).toBe('CV Matching Service failure');
  });

  test('8. rejects negative score (-10) with 502', async () => {
    mockAiResponse([{ candidateId: 'resume-1111', name: 'Jane Seeker', score: -10.0 }]);

    const res = await request(app)
      .post('/api/matches/run')
      .send({ resume_id: 'resume-1111', job_id: 'job-9999' });

    expect(res.status).toBe(502);
    expect(res.body.error).toBe('CV Matching Service failure');
  });

  test('9. rejects score > 100 (120) with 502', async () => {
    mockAiResponse([{ candidateId: 'resume-1111', name: 'Jane Seeker', score: 120.0 }]);

    const res = await request(app)
      .post('/api/matches/run')
      .send({ resume_id: 'resume-1111', job_id: 'job-9999' });

    expect(res.status).toBe(502);
    expect(res.body.error).toBe('CV Matching Service failure');
  });

  test('10. verifies candidateId mismatch is rejected with 502', async () => {
    mockAiResponse([{ candidateId: 'mismatched-resume-id', name: 'Jane Seeker', score: 85.0 }]);

    const res = await request(app)
      .post('/api/matches/run')
      .send({ resume_id: 'resume-1111', job_id: 'job-9999' });

    expect(res.status).toBe(502);
    expect(res.body.detail).toContain('mismatched or missing candidateId');
  });

  test('11. verifies downstream services (Gap Engine) are NOT called when CV Matching fails', async () => {
    axios.post.mockImplementation((url) => {
      if (url.includes('/match')) {
        return Promise.reject(new Error('Connection refused'));
      }
      return Promise.resolve({ data: { success: true } });
    });

    const res = await request(app)
      .post('/api/matches/run')
      .send({ resume_id: 'resume-1111', job_id: 'job-9999' });

    expect(res.status).toBe(502);
    // Verify gap engine endpoint was NEVER called
    const gapCalls = axios.post.mock.calls.filter(call => call[0].includes('analyze-role-gap'));
    expect(gapCalls).toHaveLength(0);
  });
});
