process.env.SUPABASE_URL = process.env.SUPABASE_URL || 'http://localhost:54321';
process.env.SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || 'test-anon-key';
process.env.SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || 'test-service-key';

const { getCompanyProfile, updateCompanyProfile } = require('../companyProfile.controller');
const { supabaseAdmin } = require('../../config/supabase');

jest.mock('../../config/supabase', () => {
  const mockSingle = jest.fn();
  const mockSelect = jest.fn(() => ({ single: mockSingle }));
  const mockUpsert = jest.fn(() => ({ select: mockSelect }));
  const mockMaybeSingle = jest.fn();
  const mockEq = jest.fn(() => ({ maybeSingle: mockMaybeSingle }));
  const mockFromSelect = jest.fn(() => ({ eq: mockEq }));

  const mockFrom = jest.fn((table) => {
    if (table === 'company_profiles') {
      return {
        select: mockFromSelect,
        upsert: mockUpsert
      };
    }
    return {};
  });

  return {
    supabaseAdmin: {
      from: mockFrom,
      _mockMaybeSingle: mockMaybeSingle,
      _mockUpsert: mockUpsert,
      _mockSingle: mockSingle
    }
  };
});

describe('companyProfile.controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getCompanyProfile', () => {
    test('returns 403 for job_seeker role', async () => {
      const req = { user: { id: 'u1', role: 'job_seeker' } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

      await getCompanyProfile(req, res);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({ error: 'Forbidden: Recruiter access required' });
    });

    test('returns data: null when no company profile exists for recruiter', async () => {
      supabaseAdmin._mockMaybeSingle.mockResolvedValueOnce({ data: null, error: null });

      const req = { user: { id: 'r1', role: 'recruiter' } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

      await getCompanyProfile(req, res);

      expect(res.json).toHaveBeenCalledWith({ success: true, data: null });
    });

    test('returns company profile when row exists', async () => {
      const fakeProfile = {
        id: 'cp-1',
        recruiter_id: 'r1',
        name: 'Acme Corp',
        description: 'Tech firm',
        email: 'recruiter@acme.com',
        phone: '1234567890',
        location: 'NYC'
      };
      supabaseAdmin._mockMaybeSingle.mockResolvedValueOnce({ data: fakeProfile, error: null });

      const req = { user: { id: 'r1', role: 'recruiter' } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

      await getCompanyProfile(req, res);

      expect(res.json).toHaveBeenCalledWith({ success: true, data: fakeProfile });
    });
  });

  describe('updateCompanyProfile', () => {
    test('returns 403 for job_seeker role', async () => {
      const req = { user: { id: 'u1', role: 'job_seeker' }, body: {} };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

      await updateCompanyProfile(req, res);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({ error: 'Forbidden: Recruiter access required' });
    });

    test('upserts payload and returns saved row for recruiter', async () => {
      const payload = {
        name: 'Acme Corp',
        description: 'Leading innovator',
        email: 'hr@acme.com',
        phone: '+1-555-0199',
        location: 'Austin, TX'
      };

      const savedRow = {
        id: 'cp-100',
        recruiter_id: 'r-100',
        ...payload,
        created_at: '2026-08-04T00:00:00Z',
        updated_at: '2026-08-04T00:00:00Z'
      };

      supabaseAdmin._mockSingle.mockResolvedValueOnce({ data: savedRow, error: null });

      const req = {
        user: { id: 'r-100', role: 'recruiter' },
        body: payload
      };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

      await updateCompanyProfile(req, res);

      expect(res.json).toHaveBeenCalledWith({ success: true, data: savedRow });
    });
  });
});
