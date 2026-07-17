const { randomUUID } = require('crypto');
const { supabaseAdmin } = require('../config/supabase');

class JobRecommendationPersistenceError extends Error {
  constructor(code, message, statusCode = 500) {
    super(message);
    this.name = 'JobRecommendationPersistenceError';
    this.code = code;
    this.statusCode = statusCode;
  }
}

const asScore = (value, fieldName) => {
  const score = Number(value);
  if (!Number.isFinite(score) || score < 0 || score > 1) {
    throw new JobRecommendationPersistenceError(
      'INVALID_JOB_RECOMMENDATION_SCORE',
      `Recommendation field ${fieldName} must be a number between 0 and 1.`,
      502
    );
  }
  return score;
};

const persistAndConfirmJobRecommendations = async ({
  userId,
  resumeId = null,
  jobPostingId = null,
  recommendations,
  client = supabaseAdmin
}) => {
  if (!Array.isArray(recommendations) || recommendations.length === 0) {
    throw new JobRecommendationPersistenceError(
      'NO_JOB_RECOMMENDATIONS',
      'The recommendation service returned no jobs to persist.',
      502
    );
  }

  const sessionId = randomUUID();
  const rows = recommendations.map((job, index) => {
    if (!job.title) {
      throw new JobRecommendationPersistenceError(
        'INVALID_JOB_RECOMMENDATION',
        `Recommendation at rank ${index + 1} has no job title.`,
        502
      );
    }
    return {
    recommendation_session_id: sessionId,
    user_id: userId,
    resume_id: resumeId,
    job_posting_id: jobPostingId,
    rank: index + 1,
    source: job.source || 'local',
    external_job_id: String(job.external_id || job.id || ''),
    title: job.title,
    company: job.company || null,
    description: job.description || null,
    posting_date: job.posted_date || null,
    location: job.location || null,
    external_url: job.url || null,
    readiness_score: asScore(job.readinessScore ?? job.readiness_score, 'readinessScore'),
    recency_score: asScore(job.recencyScore, 'recencyScore'),
    final_score: asScore(job.finalScore ?? job.hybrid_score ?? job.similarity_score, 'finalScore'),
    extracted_skills: job.extractedJobSkills || [],
    raw_job: job
  };
  });

  const { data: inserted, error: insertError } = await client
    .from('job_recommendations')
    .insert(rows)
    .select('id');

  if (insertError) {
    throw new JobRecommendationPersistenceError(
      'JOB_RECOMMENDATIONS_WRITE_FAILED',
      `Supabase failed to write job recommendations: ${insertError.message}`
    );
  }

  if (!inserted || inserted.length !== rows.length) {
    throw new JobRecommendationPersistenceError(
      'JOB_RECOMMENDATIONS_WRITE_INCOMPLETE',
      `Supabase inserted ${inserted?.length || 0} of ${rows.length} job recommendations.`
    );
  }

  const { data: confirmedRows, error: readBackError } = await client
    .from('job_recommendations')
    .select('*')
    .eq('recommendation_session_id', sessionId)
    .eq('user_id', userId)
    .order('rank', { ascending: true });

  if (readBackError) {
    throw new JobRecommendationPersistenceError(
      'JOB_RECOMMENDATIONS_CONFIRMATION_FAILED',
      `Supabase could not read back inserted job recommendations: ${readBackError.message}`
    );
  }

  if (!confirmedRows || confirmedRows.length !== rows.length) {
    throw new JobRecommendationPersistenceError(
      'JOB_RECOMMENDATIONS_CONFIRMATION_INCOMPLETE',
      `Supabase read back ${confirmedRows?.length || 0} of ${rows.length} inserted job recommendations.`
    );
  }

  console.log(
    `[JobRecommendations] Confirmed ${confirmedRows.length} rows for session ${sessionId}:`,
    JSON.stringify(confirmedRows)
  );

  return { sessionId, rows: confirmedRows };
};

module.exports = {
  JobRecommendationPersistenceError,
  persistAndConfirmJobRecommendations
};
