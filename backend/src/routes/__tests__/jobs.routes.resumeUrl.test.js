process.env.SUPABASE_URL = process.env.SUPABASE_URL || 'http://localhost:54321';
process.env.SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || 'test-anon-key';
process.env.SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || 'test-service-key';

const express = require('express');
const request = require('supertest');

// ── Mock Auth Middleware ───────────────────────────────────────────
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
      req.user = { id: 'user-1111', role: 'job_seeker' };
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
    req.user = { id: 'recruiter-9999', role: 'recruiter' };
    next();
  },
}));

// ── Mock Dependencies ─────────────────────────────────────────────
const { supabaseAdmin } = require('../../config/supabase');
const jobsRoutes = require('../jobs.routes');

const app = express();
app.use(express.json());
app.use('/api/jobs', jobsRoutes);

describe('GET /api/jobs/:jobId/candidates/:candidateId/resume-url Security & BOLA Integration Tests', () => {
  const recruiterId = 'recruiter-9999';
  const jobSeekerUserId = 'user-1111';
  const candidateProfileId = 'profile-1111';
  const jobId = 'job-7777';

  const recruiterToken = 'recruiter-owner-token';
  const otherRecruiterToken = 'recruiter-other-token';
  const jobSeekerToken = 'job-seeker-token';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('1. returns 401 when no auth token is provided', async () => {
    const res = await request(app).get(`/api/jobs/${jobId}/candidates/${candidateProfileId}/resume-url`);
    expect(res.status).toBe(401);
  });

  test('2. returns 401 when invalid token is provided', async () => {
    const res = await request(app)
      .get(`/api/jobs/${jobId}/candidates/${candidateProfileId}/resume-url`)
      .set('Authorization', 'Bearer invalid-token');

    expect(res.status).toBe(401);
  });

  test('3. returns 403 when authenticated user is a job seeker', async () => {
    const res = await request(app)
      .get(`/api/jobs/${jobId}/candidates/${candidateProfileId}/resume-url`)
      .set('Authorization', `Bearer ${jobSeekerToken}`);

    expect(res.status).toBe(403);
    expect(res.body.error).toMatch(/Recruiter or Admin role required/i);
  });

  test('4. BOLA Check: returns 403 when recruiter does NOT own the job posting', async () => {
    supabaseAdmin.from = jest.fn((table) => {
      if (table === 'job_postings') {
        return {
          select: () => ({
            eq: () => ({
              single: async () => ({
                data: { id: jobId, recruiter_id: recruiterId }, // owned by recruiterId, NOT recruiter-8888
                error: null,
              }),
            }),
          }),
        };
      }
      return {};
    });

    const res = await request(app)
      .get(`/api/jobs/${jobId}/candidates/${candidateProfileId}/resume-url`)
      .set('Authorization', `Bearer ${otherRecruiterToken}`);

    expect(res.status).toBe(403);
    expect(res.body.error).toMatch(/You do not own this job posting/i);
  });

  test('5. BOLA Check: returns 403 when candidate has NO application or AI match relationship with this job', async () => {
    supabaseAdmin.from = jest.fn((table) => {
      if (table === 'job_postings') {
        return {
          select: () => ({
            eq: () => ({
              single: async () => ({ data: { id: jobId, recruiter_id: recruiterId }, error: null }),
            }),
          }),
        };
      }
      if (table === 'job_seeker_profiles') {
        return {
          select: () => ({
            eq: () => ({
              single: async () => ({ data: { id: candidateProfileId, user_id: jobSeekerUserId, is_discoverable: true }, error: null }),
            }),
          }),
        };
      }
      if (table === 'job_applications') {
        return {
          select: () => ({
            eq: () => ({
              or: () => ({
                limit: async () => ({ data: [], error: null }), // No application
              }),
            }),
          }),
        };
      }
      if (table === 'candidate_matches') {
        return {
          select: () => ({
            eq: () => ({
              eq: () => ({
                limit: async () => ({ data: [], error: null }), // No AI Match
              }),
            }),
          }),
        };
      }
      return {};
    });

    const res = await request(app)
      .get(`/api/jobs/${jobId}/candidates/${candidateProfileId}/resume-url`)
      .set('Authorization', `Bearer ${recruiterToken}`);

    expect(res.status).toBe(403);
    expect(res.body.error).toMatch(/no application or AI match relationship/i);
  });

  test('6. Opt-Out Check: returns 403 when AI match exists but candidate opted out of discovery and has no active application', async () => {
    supabaseAdmin.from = jest.fn((table) => {
      if (table === 'job_postings') {
        return {
          select: () => ({
            eq: () => ({
              single: async () => ({ data: { id: jobId, recruiter_id: recruiterId }, error: null }),
            }),
          }),
        };
      }
      if (table === 'job_seeker_profiles') {
        return {
          select: () => ({
            eq: () => ({
              single: async () => ({ data: { id: candidateProfileId, user_id: jobSeekerUserId, is_discoverable: false }, error: null }),
            }),
          }),
        };
      }
      if (table === 'job_applications') {
        return {
          select: () => ({
            eq: () => ({
              or: () => ({
                limit: async () => ({ data: [], error: null }),
              }),
            }),
          }),
        };
      }
      if (table === 'candidate_matches') {
        return {
          select: () => ({
            eq: () => ({
              eq: () => ({
                limit: async () => ({ data: [{ id: 'cm-1' }], error: null }), // AI Match exists
              }),
            }),
          }),
        };
      }
      return {};
    });

    const res = await request(app)
      .get(`/api/jobs/${jobId}/candidates/${candidateProfileId}/resume-url`)
      .set('Authorization', `Bearer ${recruiterToken}`);

    expect(res.status).toBe(403);
    expect(res.body.error).toMatch(/opted out of discovery/i);
  });

  test('7. Authoritative Success: generates 15-min signed URL for valid AI Match candidate', async () => {
    const mockSignedUrl = 'https://zbjtfyaglkugzhiymros.supabase.co/storage/v1/object/sign/resumes/user-1111/123_cv.pdf?token=abc123xyz';

    supabaseAdmin.from = jest.fn((table) => {
      if (table === 'job_postings') {
        return {
          select: () => ({
            eq: () => ({
              single: async () => ({ data: { id: jobId, recruiter_id: recruiterId }, error: null }),
            }),
          }),
        };
      }
      if (table === 'job_seeker_profiles') {
        return {
          select: () => ({
            eq: () => ({
              single: async () => ({ data: { id: candidateProfileId, user_id: jobSeekerUserId, is_discoverable: true }, error: null }),
            }),
          }),
        };
      }
      if (table === 'job_applications') {
        return {
          select: () => ({
            eq: () => ({
              or: () => ({
                limit: async () => ({ data: [], error: null }),
              }),
            }),
          }),
        };
      }
      if (table === 'candidate_matches') {
        return {
          select: () => ({
            eq: () => ({
              eq: () => ({
                limit: async () => ({ data: [{ id: 'cm-1' }], error: null }),
              }),
            }),
          }),
        };
      }
      if (table === 'resumes') {
        return {
          select: () => ({
            eq: () => ({
              eq: () => ({
                order: () => ({
                  limit: async () => ({
                    data: [{ id: 'res-1', user_id: jobSeekerUserId, file_path: 'user-1111/123_cv.pdf', original_name: 'resume.pdf', status: 'processed' }],
                    error: null,
                  }),
                }),
              }),
            }),
          }),
        };
      }
      return {};
    });

    supabaseAdmin.storage = {
      from: jest.fn().mockReturnValue({
        createSignedUrl: jest.fn().mockResolvedValue({
          data: { signedUrl: mockSignedUrl },
          error: null,
        }),
      }),
    };

    const res = await request(app)
      .get(`/api/jobs/${jobId}/candidates/${candidateProfileId}/resume-url`)
      .set('Authorization', `Bearer ${recruiterToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.url).toBe(mockSignedUrl);
    expect(res.body.data.expiresIn).toBe(900);
    expect(res.body.data.originalName).toBe('resume.pdf');
    // Ensure service key is NOT returned
    expect(res.body.serviceKey).toBeUndefined();
  });

  test('8. Authoritative Success: generates signed URL for Applicant candidate', async () => {
    const mockSignedUrl = 'https://zbjtfyaglkugzhiymros.supabase.co/storage/v1/object/sign/resumes/user-1111/app_cv.pdf?token=xyz789';

    supabaseAdmin.from = jest.fn((table) => {
      if (table === 'job_postings') {
        return {
          select: () => ({
            eq: () => ({
              single: async () => ({ data: { id: jobId, recruiter_id: recruiterId }, error: null }),
            }),
          }),
        };
      }
      if (table === 'job_seeker_profiles') {
        return {
          select: () => ({
            eq: () => ({
              single: async () => ({ data: { id: candidateProfileId, user_id: jobSeekerUserId, is_discoverable: false }, error: null }),
            }),
          }),
        };
      }
      if (table === 'job_applications') {
        return {
          select: () => ({
            eq: () => ({
              or: () => ({
                limit: async () => ({ data: [{ id: 'app-1', resume_id: 'res-app-1', user_id: jobSeekerUserId }], error: null }), // Applicant!
              }),
            }),
          }),
        };
      }
      if (table === 'candidate_matches') {
        return {
          select: () => ({
            eq: () => ({
              eq: () => ({
                limit: async () => ({ data: [], error: null }),
              }),
            }),
          }),
        };
      }
      if (table === 'resumes') {
        return {
          select: () => ({
            eq: () => ({
              single: async () => ({ data: { id: 'res-app-1', user_id: jobSeekerUserId, file_path: 'user-1111/app_cv.pdf', original_name: 'applied_cv.pdf', status: 'processed' }, error: null }),
            }),
          }),
        };
      }
      return {};
    });

    supabaseAdmin.storage = {
      from: jest.fn().mockReturnValue({
        createSignedUrl: jest.fn().mockResolvedValue({
          data: { signedUrl: mockSignedUrl },
          error: null,
        }),
      }),
    };

    const res = await request(app)
      .get(`/api/jobs/${jobId}/candidates/${candidateProfileId}/resume-url`)
      .set('Authorization', `Bearer ${recruiterToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.url).toBe(mockSignedUrl);
    expect(res.body.data.originalName).toBe('applied_cv.pdf');
  });

  test('9. returns 404 when candidate has no resume file in database', async () => {
    supabaseAdmin.from = jest.fn((table) => {
      if (table === 'job_postings') {
        return {
          select: () => ({
            eq: () => ({
              single: async () => ({ data: { id: jobId, recruiter_id: recruiterId }, error: null }),
            }),
          }),
        };
      }
      if (table === 'job_seeker_profiles') {
        return {
          select: () => ({
            eq: () => ({
              single: async () => ({ data: { id: candidateProfileId, user_id: jobSeekerUserId, is_discoverable: true }, error: null }),
            }),
          }),
        };
      }
      if (table === 'job_applications') {
        return {
          select: () => ({
            eq: () => ({
              or: () => ({
                limit: async () => ({ data: [], error: null }),
              }),
            }),
          }),
        };
      }
      if (table === 'candidate_matches') {
        return {
          select: () => ({
            eq: () => ({
              eq: () => ({
                limit: async () => ({ data: [{ id: 'cm-1' }], error: null }),
              }),
            }),
          }),
        };
      }
      if (table === 'resumes') {
        return {
          select: () => ({
            eq: () => ({
              eq: () => ({
                order: () => ({
                  limit: async () => ({ data: [], error: null }), // No resume
                }),
              }),
              order: () => ({
                limit: async () => ({ data: [], error: null }),
              }),
            }),
          }),
        };
      }
      return {};
    });

    const res = await request(app)
      .get(`/api/jobs/${jobId}/candidates/${candidateProfileId}/resume-url`)
      .set('Authorization', `Bearer ${recruiterToken}`);

    expect(res.status).toBe(404);
    expect(res.body.error).toMatch(/No resume file found/i);
  });
});
