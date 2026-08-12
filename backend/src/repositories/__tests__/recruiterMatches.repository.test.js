process.env.SUPABASE_URL = process.env.SUPABASE_URL || 'http://localhost:54321';
process.env.SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || 'test-anon-key';
process.env.SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || 'test-service-key';

const {
  persistRecruiterMatches,
  getPersistedCandidateMatches,
  RecruiterMatchPersistenceError,
} = require('../recruiterMatches.repository');

describe('Recruiter Candidate Matches Repository Unit Tests', () => {
  const sampleJobId = 'job-1111';
  const sampleRecruiterId = 'recruiter-9999';

  const candidate1 = {
    candidateId: 'profile-001',
    userId: 'user-001',
    name: 'Alice Developer',
    score: 88,
    matchScore: 88,
    matchingSkills: ['Node.js', 'Python'],
    missingSkills: ['FastAPI'],
  };

  const candidate2 = {
    candidateId: 'profile-002',
    userId: 'user-002',
    name: 'Bob Engineer',
    score: 95,
    matchScore: 95,
    matchingSkills: ['Python', 'Docker'],
    missingSkills: [],
  };

  const createMockClient = ({ upsertErr = null, rpcErr = null, rpcData = { success: true, upserted_count: 2, deleted_count: 0 }, selectData = [], jobData = null, count = 2 } = {}) => {
    return {
      rpc: jest.fn().mockImplementation(async (fnName, params) => {
        if (rpcErr) return { data: null, error: rpcErr };
        return { data: rpcData, error: null };
      }),
      from: jest.fn().mockImplementation((table) => {
        if (table === 'job_postings') {
          return {
            select: () => ({
              eq: () => ({
                single: async () => ({
                  data: jobData || { id: sampleJobId, title: 'Backend Dev', recruiter_id: sampleRecruiterId, updated_at: '2026-08-01T00:00:00Z' },
                  error: null,
                }),
              }),
            }),
          };
        }

        if (table === 'candidate_matches') {
          return {
            upsert: jest.fn().mockReturnValue({
              select: async () => (upsertErr ? { data: null, error: upsertErr } : { data: [{ id: 'cm-1' }, { id: 'cm-2' }], error: null }),
            }),
            delete: jest.fn().mockReturnValue({
              eq: async () => ({ error: null }),
              in: async () => ({ error: null }),
            }),
            select: jest.fn().mockImplementation(() => ({
              eq: () => ({
                order: () => ({
                  range: async () => ({
                    data: selectData,
                    error: null,
                    count,
                  }),
                }),
                // for sync fetch:
                then: (resolve) => resolve({ data: selectData, error: null }),
              }),
            })),
          };
        }

        return {};
      }),
    };
  };

  // ── 1-5. Schema & Persistence Insertion ──────────────────────────
  test('1. persists valid recruiter match payloads into candidate_matches table via RPC', async () => {
    const client = createMockClient();

    const result = await persistRecruiterMatches({
      jobId: sampleJobId,
      rankedCandidates: [candidate1, candidate2],
      completionStatus: 'complete',
      client,
    });

    expect(client.rpc).toHaveBeenCalledWith('sync_recruiter_candidate_matches', expect.objectContaining({
      p_job_id: sampleJobId,
      p_matches: expect.any(Array),
    }));
    expect(result.success).toBe(true);
    expect(result.persisted).toBe(true);
    expect(result.persistedCount).toBe(2);
  });

  test('2. rejects missing jobId with RecruiterMatchPersistenceError', async () => {
    await expect(
      persistRecruiterMatches({
        jobId: null,
        rankedCandidates: [candidate1],
        completionStatus: 'complete',
      })
    ).rejects.toThrow(RecruiterMatchPersistenceError);
  });

  test('3. fails closed when RPC execution returns a database error (no non-atomic fallback executed)', async () => {
    const client = createMockClient({ rpcErr: { message: 'Database connection failed' } });

    await expect(
      persistRecruiterMatches({
        jobId: sampleJobId,
        rankedCandidates: [candidate1],
        completionStatus: 'complete',
        client,
      })
    ).rejects.toThrow('Complete-run match synchronization transaction failed: Database connection failed');
  });

  test('4. fails closed when client.rpc is missing from database client', async () => {
    const clientWithoutRpc = { from: jest.fn() };

    await expect(
      persistRecruiterMatches({
        jobId: sampleJobId,
        rankedCandidates: [candidate1],
        completionStatus: 'complete',
        client: clientWithoutRpc,
      })
    ).rejects.toThrow('Transactional match synchronization RPC (sync_recruiter_candidate_matches) is missing from database client');
  });

  // ── 6. Idempotency & Upsert ──────────────────────────────────────
  test('5. idempotently passes matches payload to transactional RPC', async () => {
    const client = createMockClient();

    const res1 = await persistRecruiterMatches({
      jobId: sampleJobId,
      rankedCandidates: [candidate1],
      completionStatus: 'complete',
      client,
    });

    const res2 = await persistRecruiterMatches({
      jobId: sampleJobId,
      rankedCandidates: [{ ...candidate1, score: 92 }],
      completionStatus: 'complete',
      client,
    });

    expect(res1.persisted).toBe(true);
    expect(res2.persisted).toBe(true);
  });

  // ── 7 & 8. Complete vs Partial Run Policy ────────────────────────
  test('5. skips persistence for PARTIAL runs (does not overwrite stored complete rankings)', async () => {
    const client = createMockClient();

    const result = await persistRecruiterMatches({
      jobId: sampleJobId,
      rankedCandidates: [candidate1],
      completionStatus: 'partial',
      client,
    });

    expect(result.success).toBe(true);
    expect(result.persisted).toBe(false);
    expect(result.reason).toBe('partial_run');
  });

  // ── 10 & 11. Staleness Calculation ──────────────────────────────
  test('6. calculates isStale = false for fresh matches', async () => {
    const freshMatchRow = {
      id: 'cm-1',
      job_posting_id: sampleJobId,
      job_seeker_profile_id: 'profile-001',
      user_id: 'user-001',
      match_score: 88,
      calculated_at: '2026-08-05T00:00:00Z',
      job_seeker_profiles: {
        id: 'profile-001',
        years_of_experience: 4,
        is_discoverable: true,
        updated_at: '2026-08-01T00:00:00Z', // older than calculated_at
        users: { first_name: 'Alice', last_name: 'Dev' },
      },
    };

    const client = createMockClient({ selectData: [freshMatchRow] });

    const result = await getPersistedCandidateMatches({
      jobId: sampleJobId,
      recruiterId: sampleRecruiterId,
      userRole: 'recruiter',
      client,
    });

    expect(result.data.matches[0].isStale).toBe(false);
  });

  test('7. calculates isStale = true if profile updated after calculated_at', async () => {
    const staleMatchRow = {
      id: 'cm-1',
      job_posting_id: sampleJobId,
      job_seeker_profile_id: 'profile-001',
      user_id: 'user-001',
      match_score: 88,
      calculated_at: '2026-08-01T00:00:00Z',
      job_seeker_profiles: {
        id: 'profile-001',
        years_of_experience: 4,
        is_discoverable: true,
        updated_at: '2026-08-06T00:00:00Z', // newer than calculated_at!
        users: { first_name: 'Alice', last_name: 'Dev' },
      },
    };

    const client = createMockClient({ selectData: [staleMatchRow] });

    const result = await getPersistedCandidateMatches({
      jobId: sampleJobId,
      recruiterId: sampleRecruiterId,
      userRole: 'recruiter',
      client,
    });

    expect(result.data.matches[0].isStale).toBe(true);
  });

  test('8. calculates isStale = true if candidate becomes non-discoverable', async () => {
    const nonDiscoverableMatchRow = {
      id: 'cm-1',
      job_posting_id: sampleJobId,
      job_seeker_profile_id: 'profile-001',
      user_id: 'user-001',
      match_score: 88,
      calculated_at: '2026-08-05T00:00:00Z',
      job_seeker_profiles: {
        id: 'profile-001',
        years_of_experience: 4,
        is_discoverable: false, // non-discoverable!
        updated_at: '2026-08-01T00:00:00Z',
        users: { first_name: 'Alice', last_name: 'Dev' },
      },
    };

    const client = createMockClient({ selectData: [nonDiscoverableMatchRow] });

    const result = await getPersistedCandidateMatches({
      jobId: sampleJobId,
      recruiterId: sampleRecruiterId,
      userRole: 'recruiter',
      client,
    });

    expect(result.data.matches[0].isStale).toBe(true);
  });

  // ── 12. RPC Transactional Synchronization Test ────────────────────
  test('9. uses sync_recruiter_candidate_matches RPC for complete-run match synchronization', async () => {
    const rpcFn = jest.fn().mockResolvedValue({
      data: { success: true, upserted_count: 2, deleted_count: 1 },
      error: null,
    });
    const client = { ...createMockClient(), rpc: rpcFn };

    const result = await persistRecruiterMatches({
      jobId: sampleJobId,
      rankedCandidates: [candidate1, candidate2],
      completionStatus: 'complete',
      client,
    });

    expect(rpcFn).toHaveBeenCalledWith('sync_recruiter_candidate_matches', expect.objectContaining({
      p_job_id: sampleJobId,
      p_matches: expect.any(Array),
    }));
    expect(result.success).toBe(true);
    expect(result.persistedCount).toBe(2);
    expect(result.clearedObsoleteCount).toBe(1);
  });

  // ── 13. Resume Staleness Test ─────────────────────────────────────
  test('10. calculates isStale = true if candidate uploaded/processed a resume after match calculated_at', async () => {
    const matchRow = {
      id: 'cm-1',
      job_posting_id: sampleJobId,
      job_seeker_profile_id: 'profile-001',
      user_id: 'user-001',
      match_score: 88,
      calculated_at: '2026-08-01T00:00:00Z',
      job_seeker_profiles: {
        id: 'profile-001',
        years_of_experience: 4,
        is_discoverable: true,
        updated_at: '2026-07-25T00:00:00Z',
        users: { first_name: 'Alice', last_name: 'Dev' },
      },
    };

    const client = createMockClient({ selectData: [matchRow] });
    // Override .from() to return a resume created after calculated_at
    const originalFrom = client.from;
    client.from = jest.fn((table) => {
      if (table === 'resumes') {
        return {
          select: () => ({
            in: () => ({
              eq: () => ({
                order: async () => ({
                  data: [{ user_id: 'user-001', created_at: '2026-08-06T00:00:00Z', status: 'processed' }],
                }),
              }),
            }),
          }),
        };
      }
      return originalFrom(table);
    });

    const result = await getPersistedCandidateMatches({
      jobId: sampleJobId,
      recruiterId: sampleRecruiterId,
      userRole: 'recruiter',
      client,
    });

    expect(result.data.matches[0].isStale).toBe(true);
  });

  // ── 14. Empty Complete Pool Synchronization ───────────────────────
  test('11. clears previous candidate matches when complete run evaluates 0 candidates', async () => {
    const client = createMockClient({ rpcData: { success: true, upserted_count: 0, deleted_count: 2 } });

    const result = await persistRecruiterMatches({
      jobId: sampleJobId,
      rankedCandidates: [],
      completionStatus: 'complete',
      client,
    });

    expect(result.success).toBe(true);
    expect(result.persistedCount).toBe(0);
    expect(result.clearedObsoleteCount).toBe(2);
  });
});
