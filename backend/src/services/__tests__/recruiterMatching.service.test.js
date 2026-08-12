process.env.SUPABASE_URL = process.env.SUPABASE_URL || 'http://localhost:54321';
process.env.SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || 'test-anon-key';
process.env.SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || 'test-service-key';

const {
  runRecruiterJobMatching,
  RecruiterMatchingError,
} = require('../recruiterMatching.service');

// ── Mock Supabase Client Builder ──────────────────────────────────────────
const createMockClient = ({ jobData = null, jobError = null } = {}) => {
  const query = {};
  query.select = jest.fn(() => query);
  query.eq = jest.fn(() => query);
  query.single = jest.fn().mockResolvedValue({ data: jobData, error: jobError });

  return {
    from: jest.fn().mockReturnValue(query),
  };
};

// ── Test Fixtures ─────────────────────────────────────────────────────────
const sampleJob = {
  id: 'job-1111',
  recruiter_id: 'recruiter-9999',
  title: 'Senior Backend Engineer',
  job_description: 'We are looking for a Node.js and Python expert to build AI microservices.',
  required_skills: ['Node.js', 'Python', 'FastAPI'],
  location: 'Remote',
  status: 'open',
};

const sampleCandidate1 = {
  candidateId: 'profile-001',
  userId: 'user-001',
  name: 'Alice Developer',
  skills: ['Node.js', 'Python', 'Docker'],
  experience: 4.0,
  education: 'BS Computer Science',
};

const sampleCandidate2 = {
  candidateId: 'profile-002',
  userId: 'user-002',
  name: 'Bob Engineer',
  skills: ['Python', 'FastAPI'],
  experience: 2.0,
  education: 'MS Software Engineering',
};

const sampleCandidateNoResume = {
  candidateId: 'profile-003',
  userId: 'user-003',
  name: 'Charlie Newbie',
  skills: [],
  experience: 0.0,
  education: null,
};

// Mock candidatePoolFn returning pagination or candidates
const createCandidatePoolFn = (pages = [[sampleCandidate1, sampleCandidate2]]) => {
  let callIndex = 0;
  return jest.fn(async () => {
    const candidates = pages[callIndex] || [];
    callIndex++;
    const hasMore = callIndex < pages.length;
    return { candidates, total: pages.flat().length, hasMore };
  });
};

describe('recruiterMatching.service', () => {
  beforeEach(() => jest.spyOn(console, 'error').mockImplementation(() => {}));
  afterEach(() => jest.restoreAllMocks());

  // ── 1. Unauthenticated / Invalid input ─────────────────────────────
  test('1. throws 400 if jobId is missing or empty', async () => {
    await expect(
      runRecruiterJobMatching({ jobId: '', recruiterId: 'rec-1', userRole: 'recruiter' })
    ).rejects.toThrow(RecruiterMatchingError);
  });

  // ── 2. Job Seeker role rejected ────────────────────────────────────
  test('2. throws 403 if user role is job_seeker', async () => {
    await expect(
      runRecruiterJobMatching({ jobId: 'job-1111', recruiterId: 'user-1', userRole: 'job_seeker' })
    ).rejects.toThrow(RecruiterMatchingError);
  });

  // ── 3. Recruiter can match their own job ───────────────────────────
  // ── 3. Recruiter can match their own job ───────────────────────────
  test('3. allows recruiter to match their own job', async () => {
    const client = createMockClient({ jobData: sampleJob });
    const candidatePoolFn = createCandidatePoolFn([[sampleCandidate1]]);
    const axiosPostFn = jest.fn().mockResolvedValue({
      data: {
        success: true,
        data: {
          jobId: 'job-1111',
          rankedCandidates: [
            {
              candidateId: 'profile-001',
              name: 'Alice Developer',
              score: 88.0,
              experience: 4.0,
              skills: ['Node.js', 'Python', 'Docker'],
              matching_skills: ['Node.js', 'Python'],
              missing_skills: ['FastAPI'],
              skill_match_count: 2,
              skill_total_required: 3,
            },
          ],
        },
      },
    });

    const result = await runRecruiterJobMatching({
      jobId: 'job-1111',
      recruiterId: 'recruiter-9999',
      userRole: 'recruiter',
      client,
      candidatePoolFn,
      axiosPostFn,
    });

    expect(result.success).toBe(true);
    expect(result.data.rankedCandidates).toHaveLength(1);
    expect(result.data.rankedCandidates[0].candidateId).toBe('profile-001');
    expect(result.data.rankedCandidates[0].score).toBe(88);
  });

  // ── 4. Recruiter cannot match another Recruiter's job ──────────────
  test("4. throws 403 if recruiter does not own the job posting", async () => {
    const client = createMockClient({ jobData: sampleJob }); // owned by recruiter-9999

    await expect(
      runRecruiterJobMatching({
        jobId: 'job-1111',
        recruiterId: 'other-recruiter-8888',
        userRole: 'recruiter',
        client,
      })
    ).rejects.toThrow(RecruiterMatchingError);
  });

  // ── 5. Missing job returns 404 ─────────────────────────────────────
  test('5. throws 404 if job posting does not exist', async () => {
    const client = createMockClient({ jobData: null, jobError: { message: 'Not found' } });

    await expect(
      runRecruiterJobMatching({
        jobId: 'missing-job',
        recruiterId: 'recruiter-9999',
        userRole: 'recruiter',
        client,
      })
    ).rejects.toThrow(RecruiterMatchingError);
  });

  // ── 6 & 7. Candidate Pool does NOT require job applications ────────
  test('6 & 7. sends non-applicant job seekers from Candidate Pool to AI', async () => {
    const client = createMockClient({ jobData: sampleJob });
    const candidatePoolFn = createCandidatePoolFn([[sampleCandidate1, sampleCandidate2]]);
    const axiosPostFn = jest.fn().mockResolvedValue({
      data: {
        success: true,
        data: {
          jobId: 'job-1111',
          rankedCandidates: [
            { candidateId: 'profile-001', name: 'Alice Developer', score: 90.0, experience: 4.0, skills: ['Node.js'] },
            { candidateId: 'profile-002', name: 'Bob Engineer', score: 70.0, experience: 2.0, skills: ['Python'] },
          ],
        },
      },
    });

    const result = await runRecruiterJobMatching({
      jobId: 'job-1111',
      recruiterId: 'recruiter-9999',
      userRole: 'recruiter',
      client,
      candidatePoolFn,
      axiosPostFn,
    });

    expect(result.data.candidatesConsidered).toBe(2);
    expect(axiosPostFn).toHaveBeenCalledTimes(1);
    const sentCandidates = axiosPostFn.mock.calls[0][1].candidates;
    expect(sentCandidates).toHaveLength(2);
    expect(sentCandidates[0].candidateId).toBe('profile-001');
    expect(sentCandidates[1].candidateId).toBe('profile-002');
  });

  // ── 8. Empty Candidate Pool returns safe result ────────────────────
  test('8. returns safe empty result structure when candidate pool is empty', async () => {
    const client = createMockClient({ jobData: sampleJob });
    const candidatePoolFn = createCandidatePoolFn([[]]);
    const axiosPostFn = jest.fn();

    const result = await runRecruiterJobMatching({
      jobId: 'job-1111',
      recruiterId: 'recruiter-9999',
      userRole: 'recruiter',
      client,
      candidatePoolFn,
      axiosPostFn,
    });

    expect(result).toEqual({
      success: true,
      data: {
        jobId: 'job-1111',
        jobTitle: 'Senior Backend Engineer',
        candidatesConsidered: 0,
        candidatesSuccessfullyEvaluated: 0,
        completionStatus: 'complete',
        calculatedAt: expect.any(String),
        rankedCandidates: [],
      },
    });
    expect(axiosPostFn).not.toHaveBeenCalled();
  });

  // ── 9. Candidate without resume does not crash matching ───────────
  test('9. handles candidate without resume data safely without crashing', async () => {
    const client = createMockClient({ jobData: sampleJob });
    const candidatePoolFn = createCandidatePoolFn([[sampleCandidateNoResume]]);
    const axiosPostFn = jest.fn().mockResolvedValue({
      data: {
        success: true,
        data: {
          jobId: 'job-1111',
          rankedCandidates: [
            {
              candidateId: 'profile-003',
              name: 'Charlie Newbie',
              score: 10.0,
              experience: 0.0,
              skills: [],
              matching_skills: [],
              missing_skills: ['Node.js', 'Python', 'FastAPI'],
            },
          ],
        },
      },
    });

    const result = await runRecruiterJobMatching({
      jobId: 'job-1111',
      recruiterId: 'recruiter-9999',
      userRole: 'recruiter',
      client,
      candidatePoolFn,
      axiosPostFn,
    });

    expect(result.data.rankedCandidates[0].candidateId).toBe('profile-003');
    expect(result.data.rankedCandidates[0].score).toBe(10);
  });

  // ── 10. Multiple Candidate Pool pages processed ────────────────────
  test('10. fetches multiple candidate pool pages until pool is exhausted', async () => {
    const client = createMockClient({ jobData: sampleJob });
    const candidatePoolFn = createCandidatePoolFn([
      [sampleCandidate1],
      [sampleCandidate2],
    ]);
    const axiosPostFn = jest.fn().mockResolvedValue({
      data: {
        success: true,
        data: {
          jobId: 'job-1111',
          rankedCandidates: [
            { candidateId: 'profile-001', name: 'Alice Developer', score: 95.0 },
            { candidateId: 'profile-002', name: 'Bob Engineer', score: 85.0 },
          ],
        },
      },
    });

    const result = await runRecruiterJobMatching({
      jobId: 'job-1111',
      recruiterId: 'recruiter-9999',
      userRole: 'recruiter',
      client,
      candidatePoolFn,
      axiosPostFn,
    });

    expect(candidatePoolFn).toHaveBeenCalledTimes(2);
    expect(result.data.candidatesConsidered).toBe(2);
  });

  // ── 11 & 12. Multiple AI batches processed & Global Ranking ───────
  test('11 & 12. processes multiple AI batches and sorts results globally DESC', async () => {
    const client = createMockClient({ jobData: sampleJob });
    const candidatePoolFn = createCandidatePoolFn([[sampleCandidate1, sampleCandidate2]]);

    // AI batch size = 1 -> 2 batches
    const axiosPostFn = jest.fn()
      .mockResolvedValueOnce({
        data: {
          success: true,
          data: {
            jobId: 'job-1111',
            rankedCandidates: [{ candidateId: 'profile-001', name: 'Alice Developer', score: 60.0 }], // lower score
          },
        },
      })
      .mockResolvedValueOnce({
        data: {
          success: true,
          data: {
            jobId: 'job-1111',
            rankedCandidates: [{ candidateId: 'profile-002', name: 'Bob Engineer', score: 95.0 }], // higher score
          },
        },
      });

    const result = await runRecruiterJobMatching({
      jobId: 'job-1111',
      recruiterId: 'recruiter-9999',
      userRole: 'recruiter',
      client,
      candidatePoolFn,
      axiosPostFn,
      aiBatchSize: 1,
    });

    expect(axiosPostFn).toHaveBeenCalledTimes(2);
    expect(result.data.rankedCandidates).toHaveLength(2);
    // Highest score (Bob 95) must be first globally
    expect(result.data.rankedCandidates[0].candidateId).toBe('profile-002');
    expect(result.data.rankedCandidates[0].score).toBe(95);
    expect(result.data.rankedCandidates[1].candidateId).toBe('profile-001');
    expect(result.data.rankedCandidates[1].score).toBe(60);
  });

  // ── 13. AI timeout handled ─────────────────────────────────────────
  test('13. throws 502 if all AI batches fail due to timeout', async () => {
    const client = createMockClient({ jobData: sampleJob });
    const candidatePoolFn = createCandidatePoolFn([[sampleCandidate1]]);
    const axiosPostFn = jest.fn().mockRejectedValue(new Error('timeout of 30000ms exceeded'));

    await expect(
      runRecruiterJobMatching({
        jobId: 'job-1111',
        recruiterId: 'recruiter-9999',
        userRole: 'recruiter',
        client,
        candidatePoolFn,
        axiosPostFn,
      })
    ).rejects.toThrow(RecruiterMatchingError);
  });

  // ── 14. AI HTTP 500 handled ────────────────────────────────────────
  test('14. handles AI HTTP 500 error gracefully', async () => {
    const client = createMockClient({ jobData: sampleJob });
    const candidatePoolFn = createCandidatePoolFn([[sampleCandidate1]]);
    const error500 = new Error('Request failed with status code 500');
    error500.response = { status: 500, data: { detail: 'Internal server error' } };
    const axiosPostFn = jest.fn().mockRejectedValue(error500);

    await expect(
      runRecruiterJobMatching({
        jobId: 'job-1111',
        recruiterId: 'recruiter-9999',
        userRole: 'recruiter',
        client,
        candidatePoolFn,
        axiosPostFn,
      })
    ).rejects.toThrow(RecruiterMatchingError);
  });

  // ── 15. AI HTTP 422 handled ────────────────────────────────────────
  test('15. handles AI HTTP 422 validation error gracefully', async () => {
    const client = createMockClient({ jobData: sampleJob });
    const candidatePoolFn = createCandidatePoolFn([[sampleCandidate1]]);
    const error422 = new Error('Unprocessable Entity');
    error422.response = { status: 422, data: { detail: 'Field required' } };
    const axiosPostFn = jest.fn().mockRejectedValue(error422);

    await expect(
      runRecruiterJobMatching({
        jobId: 'job-1111',
        recruiterId: 'recruiter-9999',
        userRole: 'recruiter',
        client,
        candidatePoolFn,
        axiosPostFn,
      })
    ).rejects.toThrow(RecruiterMatchingError);
  });

  // ── 16. Malformed AI response rejected ─────────────────────────────
  test('16. handles malformed AI response missing success flag', async () => {
    const client = createMockClient({ jobData: sampleJob });
    const candidatePoolFn = createCandidatePoolFn([[sampleCandidate1]]);
    const axiosPostFn = jest.fn().mockResolvedValue({
      data: { success: false, error: { message: 'Malformed body' } },
    });

    await expect(
      runRecruiterJobMatching({
        jobId: 'job-1111',
        recruiterId: 'recruiter-9999',
        userRole: 'recruiter',
        client,
        candidatePoolFn,
        axiosPostFn,
      })
    ).rejects.toThrow(RecruiterMatchingError);
  });

  // ── 17. Duplicate AI candidate removed ────────────────────────────
  test('17. deduplicates candidates returned across multiple batches', async () => {
    const client = createMockClient({ jobData: sampleJob });
    const candidatePoolFn = createCandidatePoolFn([[sampleCandidate1]]);
    const axiosPostFn = jest.fn().mockResolvedValue({
      data: {
        success: true,
        data: {
          jobId: 'job-1111',
          rankedCandidates: [
            { candidateId: 'profile-001', name: 'Alice Developer', score: 0.9 },
            { candidateId: 'profile-001', name: 'Alice Developer', score: 0.9 }, // dup
          ],
        },
      },
    });

    const result = await runRecruiterJobMatching({
      jobId: 'job-1111',
      recruiterId: 'recruiter-9999',
      userRole: 'recruiter',
      client,
      candidatePoolFn,
      axiosPostFn,
    });

    expect(result.data.rankedCandidates).toHaveLength(1);
  });

  // ── 18. AI candidate ID correlated correctly ─────────────────────
  test('18. correlates AI output back to valid input candidateId', async () => {
    const client = createMockClient({ jobData: sampleJob });
    const candidatePoolFn = createCandidatePoolFn([[sampleCandidate1]]);
    const axiosPostFn = jest.fn().mockResolvedValue({
      data: {
        success: true,
        data: {
          jobId: 'job-1111',
          rankedCandidates: [
            { candidateId: 'profile-001', name: 'Alice Developer', score: 85.0 },
          ],
        },
      },
    });

    const result = await runRecruiterJobMatching({
      jobId: 'job-1111',
      recruiterId: 'recruiter-9999',
      userRole: 'recruiter',
      client,
      candidatePoolFn,
      axiosPostFn,
    });

    expect(result.data.rankedCandidates[0].candidateId).toBe('profile-001');
    expect(result.data.rankedCandidates[0].userId).toBe('user-001');
  });

  // ── 19. Invalid score handled ─────────────────────────────────────
  test('19. clamps invalid or missing scores safely to integer in [0, 100]', async () => {
    const client = createMockClient({ jobData: sampleJob });
    const candidatePoolFn = createCandidatePoolFn([[sampleCandidate1, sampleCandidate2]]);
    const axiosPostFn = jest.fn().mockResolvedValue({
      data: {
        success: true,
        data: {
          jobId: 'job-1111',
          rankedCandidates: [
            { candidateId: 'profile-001', name: 'Alice Developer', score: NaN },
            { candidateId: 'profile-002', name: 'Bob Engineer', score: 85.0 },
          ],
        },
      },
    });

    const result = await runRecruiterJobMatching({
      jobId: 'job-1111',
      recruiterId: 'recruiter-9999',
      userRole: 'recruiter',
      client,
      candidatePoolFn,
      axiosPostFn,
    });

    expect(result.data.rankedCandidates[0].score).toBeLessThanOrEqual(100);
    expect(result.data.rankedCandidates[0].score).toBeGreaterThanOrEqual(0);
  });

  // ── 20. Sensitive candidate fields not sent to AI ────────────────
  test('20. does not send sensitive fields (email, phone, file_path) to AI microservice', async () => {
    const client = createMockClient({ jobData: sampleJob });
    const candidatePoolFn = createCandidatePoolFn([[sampleCandidate1]]);
    const axiosPostFn = jest.fn().mockResolvedValue({
      data: {
        success: true,
        data: {
          jobId: 'job-1111',
          rankedCandidates: [{ candidateId: 'profile-001', name: 'Alice Developer', score: 90.0 }],
        },
      },
    });

    await runRecruiterJobMatching({
      jobId: 'job-1111',
      recruiterId: 'recruiter-9999',
      userRole: 'recruiter',
      client,
      candidatePoolFn,
      axiosPostFn,
    });

    const sentPayload = axiosPostFn.mock.calls[0][1];
    const sentCand = sentPayload.candidates[0];
    expect(sentCand).not.toHaveProperty('email');
    expect(sentCand).not.toHaveProperty('phone');
    expect(sentCand).not.toHaveProperty('file_path');
    expect(sentCand).not.toHaveProperty('resume_url');
  });

  // ── 21. Partial Batch Failure ─────────────────────────────────────
  test('21. returns partial status when some batches succeed and some fail', async () => {
    const client = createMockClient({ jobData: sampleJob });
    const candidatePoolFn = createCandidatePoolFn([[sampleCandidate1, sampleCandidate2]]);

    const axiosPostFn = jest.fn()
      .mockResolvedValueOnce({
        data: {
          success: true,
          data: {
            jobId: 'job-1111',
            rankedCandidates: [{ candidateId: 'profile-001', name: 'Alice Developer', score: 80.0 }],
          },
        },
      })
      .mockRejectedValueOnce(new Error('AI Service timeout'));

    const result = await runRecruiterJobMatching({
      jobId: 'job-1111',
      recruiterId: 'recruiter-9999',
      userRole: 'recruiter',
      client,
      candidatePoolFn,
      axiosPostFn,
      aiBatchSize: 1,
    });

    expect(result.success).toBe(true);
    expect(result.data.completionStatus).toBe('partial');
    expect(result.data.candidatesSuccessfullyEvaluated).toBe(1);
    expect(result.data.batchErrors).toHaveLength(1);
  });

  // ── 22. TASK 8: >500 Candidate Exhaustion Test ──────────────────────
  test('22. processes >500 candidates completely without silent capping and ranks candidate from index 600 at top', async () => {
    const client = createMockClient({ jobData: sampleJob });

    // Generate 650 candidates across 13 pages of 50
    const pages = [];
    let count = 0;
    for (let p = 0; p < 13; p++) {
      const page = [];
      for (let i = 0; i < 50; i++) {
        count++;
        page.push({
          candidateId: `profile-${String(count).padStart(4, '0')}`,
          userId: `user-${String(count).padStart(4, '0')}`,
          name: `Candidate ${count}`,
          skills: ['Python'],
          experience: 2.0,
          education: 'BS CS',
        });
      }
      pages.push(page);
    }

    // Candidate 600 (at page 12) is the top candidate with score 99.0 (0-100 scale)
    let callIndex = 0;
    const candidatePoolFn = jest.fn(async ({ batchSize, offset }) => {
      const page = pages[callIndex] || [];
      callIndex++;
      const hasMore = callIndex < pages.length;
      return { candidates: page, total: 650, hasMore };
    });

    // Mock AI response: batch of 50 candidates returns match scores (all 50.0 except candidate 600 who gets 99.0)
    const axiosPostFn = jest.fn().mockImplementation(async (url, payload) => {
      const inputCands = payload.candidates;
      const rankedCandidates = inputCands.map(c => {
        const is600 = c.candidateId === 'profile-0600';
        return {
          candidateId: c.candidateId,
          name: c.name,
          score: is600 ? 99.0 : 50.0,
          experience: c.experience,
          skills: c.skills,
        };
      });
      return {
        data: {
          success: true,
          data: { jobId: 'job-1111', rankedCandidates },
        },
      };
    });

    const result = await runRecruiterJobMatching({
      jobId: 'job-1111',
      recruiterId: 'recruiter-9999',
      userRole: 'recruiter',
      client,
      candidatePoolFn,
      axiosPostFn,
      aiBatchSize: 50,
    });

    expect(candidatePoolFn).toHaveBeenCalledTimes(13); // All 13 pages requested
    expect(axiosPostFn).toHaveBeenCalledTimes(13); // All 13 AI batches requested
    expect(result.data.candidatesConsidered).toBe(650); // ALL 650 considered
    expect(result.data.candidatesSuccessfullyEvaluated).toBe(650);

    // Candidate 600 MUST appear at the top of the global ranking!
    expect(result.data.rankedCandidates[0].candidateId).toBe('profile-0600');
    expect(result.data.rankedCandidates[0].score).toBe(99);
  });

  // ── 23. Strict Score Rejection Test ────────────────────────────────
  test('23. rejects malformed AI candidate entries with NaN or null scores', async () => {
    const client = createMockClient({ jobData: sampleJob });
    const candidatePoolFn = createCandidatePoolFn([[sampleCandidate1, sampleCandidate2]]);
    const axiosPostFn = jest.fn().mockResolvedValue({
      data: {
        success: true,
        data: {
          jobId: 'job-1111',
          rankedCandidates: [
            { candidateId: 'profile-001', name: 'Alice', score: null }, // malformed
            { candidateId: 'profile-002', name: 'Bob', score: 85.0 },    // valid [0, 100]
          ],
        },
      },
    });

    const result = await runRecruiterJobMatching({
      jobId: 'job-1111',
      recruiterId: 'recruiter-9999',
      userRole: 'recruiter',
      client,
      candidatePoolFn,
      axiosPostFn,
    });

    expect(result.data.rankedCandidates).toHaveLength(1);
    expect(result.data.rankedCandidates[0].candidateId).toBe('profile-002');
  });

  // ── 24. Missing candidateId Rejection (No Index Fallback) ─────────
  test('24. rejects AI candidate result missing explicit candidateId without array-index fallback', async () => {
    const client = createMockClient({ jobData: sampleJob });
    const candidatePoolFn = createCandidatePoolFn([[sampleCandidate1]]);
    const axiosPostFn = jest.fn().mockResolvedValue({
      data: {
        success: true,
        data: {
          jobId: 'job-1111',
          rankedCandidates: [
            { name: 'Alice', score: 80.0 }, // missing candidateId!
          ],
        },
      },
    });

    await expect(
      runRecruiterJobMatching({
        jobId: 'job-1111',
        recruiterId: 'recruiter-9999',
        userRole: 'recruiter',
        client,
        candidatePoolFn,
        axiosPostFn,
      })
    ).rejects.toThrow(RecruiterMatchingError);
  });

  // ── 25. Unknown candidateId Rejection ─────────────────────────────
  test('25. rejects AI candidate result returning candidateId not in submitted batch', async () => {
    const client = createMockClient({ jobData: sampleJob });
    const candidatePoolFn = createCandidatePoolFn([[sampleCandidate1]]);
    const axiosPostFn = jest.fn().mockResolvedValue({
      data: {
        success: true,
        data: {
          jobId: 'job-1111',
          rankedCandidates: [
            { candidateId: 'foreign-id-999', name: 'Foreign Candidate', score: 90.0 },
          ],
        },
      },
    });

    await expect(
      runRecruiterJobMatching({
        jobId: 'job-1111',
        recruiterId: 'recruiter-9999',
        userRole: 'recruiter',
        client,
        candidatePoolFn,
        axiosPostFn,
      })
    ).rejects.toThrow(RecruiterMatchingError);
  });

  // ── 26. Reordered AI Candidate Correlation ─────────────────────────
  test('26. correlates reordered AI candidates correctly by candidateId, not by index', async () => {
    const client = createMockClient({ jobData: sampleJob });
    const candidatePoolFn = createCandidatePoolFn([[sampleCandidate1, sampleCandidate2]]);
    // Input batch order: [sampleCandidate1 (Alice), sampleCandidate2 (Bob)]
    // AI returned order reordered: [sampleCandidate2 (Bob) @ score 90, sampleCandidate1 (Alice) @ score 70]
    const axiosPostFn = jest.fn().mockResolvedValue({
      data: {
        success: true,
        data: {
          jobId: 'job-1111',
          rankedCandidates: [
            { candidateId: 'profile-002', name: 'Bob Engineer', score: 90.0 },
            { candidateId: 'profile-001', name: 'Alice Developer', score: 70.0 },
          ],
        },
      },
    });

    const result = await runRecruiterJobMatching({
      jobId: 'job-1111',
      recruiterId: 'recruiter-9999',
      userRole: 'recruiter',
      client,
      candidatePoolFn,
      axiosPostFn,
    });

    expect(result.data.rankedCandidates[0].candidateId).toBe('profile-002');
    expect(result.data.rankedCandidates[0].userId).toBe('user-002');
    expect(result.data.rankedCandidates[0].score).toBe(90);

    expect(result.data.rankedCandidates[1].candidateId).toBe('profile-001');
    expect(result.data.rankedCandidates[1].userId).toBe('user-001');
    expect(result.data.rankedCandidates[1].score).toBe(70);
  });
});

