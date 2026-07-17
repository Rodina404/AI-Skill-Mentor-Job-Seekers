process.env.SUPABASE_URL = process.env.SUPABASE_URL || 'http://localhost:54321';
process.env.SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || 'test-anon-key';
process.env.SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || 'test-service-key';

const {
  persistAndConfirmJobRecommendations
} = require('../jobRecommendations.repository');

const recommendation = {
  external_id: 'adzuna-123',
  source: 'adzuna',
  title: 'Backend Engineer',
  company: 'Example Ltd',
  description: 'Build Python APIs',
  posted_date: '2026-07-17T10:00:00Z',
  location: 'Remote',
  url: 'https://www.adzuna.com/land/ad/123',
  readinessScore: 0.8,
  recencyScore: 1.0,
  finalScore: 0.86,
  extractedJobSkills: ['Python']
};

const createClient = ({ insertError = null, readError = null, confirmedRows = null } = {}) => {
  const inserted = insertError ? null : [{ id: 'row-1' }];
  const rows = confirmedRows || [{ id: 'row-1', rank: 1, title: 'Backend Engineer' }];

  const insertQuery = {};
  insertQuery.insert = jest.fn(() => insertQuery);
  insertQuery.select = jest.fn().mockResolvedValue({ data: inserted, error: insertError });

  const readQuery = {};
  readQuery.select = jest.fn(() => readQuery);
  readQuery.eq = jest.fn(() => readQuery);
  readQuery.order = jest.fn().mockResolvedValue({ data: readError ? null : rows, error: readError });

  return {
    from: jest.fn()
      .mockReturnValueOnce(insertQuery)
      .mockReturnValueOnce(readQuery)
  };
};

describe('persistAndConfirmJobRecommendations', () => {
  beforeEach(() => jest.spyOn(console, 'log').mockImplementation(() => {}));
  afterEach(() => jest.restoreAllMocks());

  test('inserts and reads back the same recommendation session', async () => {
    const client = createClient();

    const result = await persistAndConfirmJobRecommendations({
      userId: '00000000-0000-0000-0000-000000000001',
      resumeId: '00000000-0000-0000-0000-000000000002',
      recommendations: [recommendation],
      client
    });

    expect(result.rows).toHaveLength(1);
    expect(result.sessionId).toEqual(expect.any(String));
    expect(client.from).toHaveBeenNthCalledWith(1, 'job_recommendations');
    expect(client.from).toHaveBeenNthCalledWith(2, 'job_recommendations');
    expect(console.log).toHaveBeenCalled();
  });

  test('returns a clear error when Supabase insert fails', async () => {
    const client = createClient({ insertError: { message: 'insert denied' } });

    await expect(persistAndConfirmJobRecommendations({
      userId: 'user-1',
      recommendations: [recommendation],
      client
    })).rejects.toMatchObject({
      code: 'JOB_RECOMMENDATIONS_WRITE_FAILED',
      message: expect.stringContaining('insert denied')
    });
  });

  test('returns a clear error when read-back confirmation fails', async () => {
    const client = createClient({ readError: { message: 'read denied' } });

    await expect(persistAndConfirmJobRecommendations({
      userId: 'user-1',
      recommendations: [recommendation],
      client
    })).rejects.toMatchObject({
      code: 'JOB_RECOMMENDATIONS_CONFIRMATION_FAILED',
      message: expect.stringContaining('read denied')
    });
  });

  test('rejects missing component scores instead of writing fake zeros', async () => {
    const client = createClient();
    const incomplete = { ...recommendation };
    delete incomplete.recencyScore;

    await expect(persistAndConfirmJobRecommendations({
      userId: 'user-1',
      recommendations: [incomplete],
      client
    })).rejects.toMatchObject({ code: 'INVALID_JOB_RECOMMENDATION_SCORE' });

    expect(client.from).not.toHaveBeenCalled();
  });
});
