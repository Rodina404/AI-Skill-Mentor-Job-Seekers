process.env.SUPABASE_URL = process.env.SUPABASE_URL || 'http://localhost:54321';
process.env.SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || 'test-anon-key';
process.env.SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || 'test-service-key';

const {
  getCandidatePool,
  extractSkillNames,
  extractEducation,
  CandidatePoolError,
  DEFAULT_BATCH_SIZE,
  MAX_BATCH_SIZE,
} = require('../candidatePool.repository');

// ── Helper: build a mock Supabase client ──────────────────────────────────
// Simulates chained Supabase query builder pattern.
// `profiles` and `resumes` are the datasets returned by each .from() call.
const createMockClient = ({
  countResult = { count: 0, error: null },
  profiles = [],
  profileError = null,
  resumes = [],
  resumeError = null,
} = {}) => {
  // Track .from() call order: 1st = count, 2nd = profiles, 3rd = resumes
  let fromCallIndex = 0;

  const buildCountChain = () => {
    const chain = {};
    chain.select = jest.fn(() => chain);
    chain.eq = jest.fn(() => chain);
    chain.then = (onFulfilled, onRejected) =>
      Promise.resolve({ count: countResult.count, error: countResult.error }).then(onFulfilled, onRejected);
    return chain;
  };

  const buildProfileChain = () => {
    const chain = {};
    chain.select = jest.fn(() => chain);
    chain.eq = jest.fn(() => chain);
    chain.order = jest.fn(() => chain);
    chain.range = jest.fn().mockResolvedValue({ data: profiles, error: profileError });
    return chain;
  };

  const buildResumeChain = () => {
    const chain = {};
    chain.select = jest.fn(() => chain);
    chain.in = jest.fn(() => chain);
    chain.eq = jest.fn(() => chain);
    chain.order = jest.fn().mockResolvedValue({ data: resumes, error: resumeError });
    return chain;
  };

  return {
    from: jest.fn(() => {
      fromCallIndex++;
      if (fromCallIndex === 1) return buildCountChain();
      if (fromCallIndex === 2) return buildProfileChain();
      if (fromCallIndex === 3) return buildResumeChain();
      // Safety fallback
      return buildCountChain();
    }),
  };
};

// ── Test fixtures ─────────────────────────────────────────────────────────
const makeProfile = (overrides = {}) => ({
  id: 'profile-001',
  user_id: 'user-001',
  years_of_experience: 3.0,
  is_discoverable: true,
  users: {
    id: 'user-001',
    first_name: 'Alice',
    last_name: 'Smith',
    role: 'job_seeker',
  },
  ...overrides,
});

const makeResume = (overrides = {}) => ({
  user_id: 'user-001',
  normalized_skills: ['Python', 'SQL', 'FastAPI'],
  extracted_data: {
    education: [{ degree: 'BS Computer Science' }],
  },
  ...overrides,
});

// ── Tests ─────────────────────────────────────────────────────────────────
describe('candidatePool.repository', () => {
  beforeEach(() => jest.spyOn(console, 'log').mockImplementation(() => {}));
  afterEach(() => jest.restoreAllMocks());

  // ── 1. Active job seeker included ───────────────────────────────────
  test('includes active job seeker with processed resume', async () => {
    const client = createMockClient({
      countResult: { count: 1, error: null },
      profiles: [makeProfile()],
      resumes: [makeResume()],
    });

    const result = await getCandidatePool({ client });

    expect(result.candidates).toHaveLength(1);
    expect(result.candidates[0]).toEqual({
      candidateId: 'profile-001',
      userId: 'user-001',
      name: 'Alice Smith',
      skills: ['Python', 'SQL', 'FastAPI'],
      experience: 3.0,
      education: 'BS Computer Science',
    });
    expect(result.total).toBe(1);
    expect(result.hasMore).toBe(false);
  });

  // ── 2. Recruiter excluded ──────────────────────────────────────────
  test('excludes recruiter profiles (role filter)', async () => {
    const recruiterProfile = makeProfile({
      users: { id: 'user-recruiter', first_name: 'Bob', last_name: 'R', role: 'recruiter' },
    });
    const client = createMockClient({
      countResult: { count: 1, error: null },
      profiles: [recruiterProfile],
      resumes: [],
    });

    const result = await getCandidatePool({ client });

    expect(result.candidates).toHaveLength(0);
  });

  // ── 3. Admin excluded ─────────────────────────────────────────────
  test('excludes admin profiles (role filter)', async () => {
    const adminProfile = makeProfile({
      users: { id: 'user-admin', first_name: 'Carol', last_name: 'A', role: 'admin' },
    });
    const client = createMockClient({
      countResult: { count: 1, error: null },
      profiles: [adminProfile],
      resumes: [],
    });

    const result = await getCandidatePool({ client });

    expect(result.candidates).toHaveLength(0);
  });

  // ── 4. Non-discoverable user excluded (is_discoverable = false) ───
  test('excludes non-discoverable profiles where is_discoverable = false', async () => {
    const client = createMockClient({
      countResult: { count: 0, error: null },
      profiles: [],
      resumes: [],
    });

    const result = await getCandidatePool({ client });

    expect(result.candidates).toHaveLength(0);
    expect(result.total).toBe(0);
  });

  // ── 5. Inactive / Deleted user behavior ───────────────────────────
  // SCHEMA VERIFICATION: public.users and public.job_seeker_profiles do not
  // contain is_active or deleted_at columns in the database schema.
  // Deletion is handled via ON DELETE CASCADE from auth.users.
  // If a deleted/inactive user has no profile/user record returned, candidate pool safely excludes them.
  test('handles missing or deleted user profile gracefully (no candidate returned)', async () => {
    const orphanProfile = makeProfile({ users: null });
    const client = createMockClient({
      countResult: { count: 1, error: null },
      profiles: [orphanProfile],
      resumes: [],
    });

    const result = await getCandidatePool({ client });

    expect(result.candidates).toHaveLength(0);
  });

  // ── 6. Duplicate candidate excluded ───────────────────────────────
  test('deduplicates candidates with the same user_id', async () => {
    const dup1 = makeProfile({ id: 'profile-001', user_id: 'user-001' });
    const dup2 = makeProfile({ id: 'profile-002', user_id: 'user-001' });
    const client = createMockClient({
      countResult: { count: 2, error: null },
      profiles: [dup1, dup2],
      resumes: [makeResume({ user_id: 'user-001' })],
    });

    const result = await getCandidatePool({ client });

    expect(result.candidates).toHaveLength(1);
    expect(result.candidates[0].userId).toBe('user-001');
  });

  // ── 7. Missing profile handled ────────────────────────────────────
  test('returns empty candidates when profiles query returns empty', async () => {
    const client = createMockClient({
      countResult: { count: 0, error: null },
      profiles: [],
      resumes: [],
    });

    const result = await getCandidatePool({ client });

    expect(result.candidates).toHaveLength(0);
    expect(result.total).toBe(0);
  });

  // ── 8. Missing resume handled ─────────────────────────────────────
  test('includes candidate with missing resume but with empty skills', async () => {
    const client = createMockClient({
      countResult: { count: 1, error: null },
      profiles: [makeProfile()],
      resumes: [], // No resumes for this user
    });

    const result = await getCandidatePool({ client });

    expect(result.candidates).toHaveLength(1);
    expect(result.candidates[0].skills).toEqual([]);
    expect(result.candidates[0].education).toBeNull();
  });

  // ── 9. Pagination works ───────────────────────────────────────────
  test('pagination returns hasMore when more records exist', async () => {
    const client = createMockClient({
      countResult: { count: 100, error: null },
      profiles: [makeProfile()],
      resumes: [makeResume()],
    });

    const result = await getCandidatePool({ batchSize: 10, offset: 0, client });

    expect(result.hasMore).toBe(true);
    expect(result.total).toBe(100);
  });

  test('pagination returns hasMore=false on last page', async () => {
    const client = createMockClient({
      countResult: { count: 5, error: null },
      profiles: [makeProfile()],
      resumes: [makeResume()],
    });

    const result = await getCandidatePool({ batchSize: 50, offset: 0, client });

    expect(result.hasMore).toBe(false);
  });

  // ── 10. Empty candidate pool works ────────────────────────────────
  test('empty candidate pool returns valid empty structure', async () => {
    const client = createMockClient({
      countResult: { count: 0, error: null },
      profiles: [],
      resumes: [],
    });

    const result = await getCandidatePool({ client });

    expect(result).toEqual({
      candidates: [],
      total: 0,
      hasMore: false,
    });
  });

  // ── 11. Does not require job_application ──────────────────────────
  test('candidate pool does not query job_applications table', async () => {
    const client = createMockClient({
      countResult: { count: 1, error: null },
      profiles: [makeProfile()],
      resumes: [makeResume()],
    });

    const result = await getCandidatePool({ client });

    // Verify from() was called with 'job_seeker_profiles' and 'resumes',
    // but never 'job_applications'
    const fromCalls = client.from.mock.calls.map(c => c[0]);
    expect(fromCalls).not.toContain('job_applications');
    expect(result.candidates).toHaveLength(1);
  });

  // ── 12. Sensitive fields excluded ─────────────────────────────────
  test('candidate entry does not contain email, phone, or file_path', async () => {
    const client = createMockClient({
      countResult: { count: 1, error: null },
      profiles: [makeProfile()],
      resumes: [makeResume()],
    });

    const result = await getCandidatePool({ client });

    const candidate = result.candidates[0];
    expect(candidate).not.toHaveProperty('email');
    expect(candidate).not.toHaveProperty('phone');
    expect(candidate).not.toHaveProperty('file_path');
    expect(candidate).not.toHaveProperty('resume_url');
    expect(candidate).not.toHaveProperty('extracted_data');
    expect(candidate).not.toHaveProperty('normalized_skills');
  });

  // ── Batch size clamping ───────────────────────────────────────────
  test('clamps batch size to MAX_BATCH_SIZE', async () => {
    const client = createMockClient({
      countResult: { count: 1, error: null },
      profiles: [makeProfile()],
      resumes: [makeResume()],
    });

    await getCandidatePool({ batchSize: 9999, client });

    // The range call should use MAX_BATCH_SIZE - 1 as end
    const profileChain = client.from.mock.results[1].value;
    expect(profileChain.range).toHaveBeenCalledWith(0, MAX_BATCH_SIZE - 1);
  });

  // ── Error handling ────────────────────────────────────────────────
  test('throws CandidatePoolError on count failure', async () => {
    const client = createMockClient({
      countResult: { count: null, error: { message: 'DB down' } },
    });

    await expect(getCandidatePool({ client }))
      .rejects.toThrow(CandidatePoolError);
  });

  test('throws CandidatePoolError on profile fetch failure', async () => {
    const client = createMockClient({
      countResult: { count: 1, error: null },
      profileError: { message: 'timeout' },
    });

    await expect(getCandidatePool({ client }))
      .rejects.toThrow(CandidatePoolError);
  });

  test('throws CandidatePoolError on resume fetch failure', async () => {
    const client = createMockClient({
      countResult: { count: 1, error: null },
      profiles: [makeProfile()],
      resumeError: { message: 'connection reset' },
    });

    await expect(getCandidatePool({ client }))
      .rejects.toThrow(CandidatePoolError);
  });
});

// ── Unit tests for helper functions ───────────────────────────────────────
describe('extractSkillNames', () => {
  test('handles string array', () => {
    expect(extractSkillNames(['Python', 'SQL'])).toEqual(['Python', 'SQL']);
  });

  test('handles object array with skill field', () => {
    expect(extractSkillNames([{ skill: 'React' }, { name: 'Node.js' }]))
      .toEqual(['React', 'Node.js']);
  });

  test('handles null', () => {
    expect(extractSkillNames(null)).toEqual([]);
  });

  test('handles empty array', () => {
    expect(extractSkillNames([])).toEqual([]);
  });

  test('filters empty strings', () => {
    expect(extractSkillNames(['Python', '', 'SQL'])).toEqual(['Python', 'SQL']);
  });
});

describe('extractEducation', () => {
  test('returns degree from first education entry', () => {
    expect(extractEducation({ education: [{ degree: 'MS CS' }] })).toBe('MS CS');
  });

  test('returns null for null input', () => {
    expect(extractEducation(null)).toBeNull();
  });

  test('returns null for empty education array', () => {
    expect(extractEducation({ education: [] })).toBeNull();
  });

  test('returns null when education key missing', () => {
    expect(extractEducation({ skills: [] })).toBeNull();
  });
});
