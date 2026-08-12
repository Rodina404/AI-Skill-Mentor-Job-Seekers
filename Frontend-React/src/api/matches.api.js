/**
 * Matches API
 * All match-related API calls (CV matching pipeline, match results)
 */

import { authFetch, createApiError } from './apiClient';

export const matchesAPI = {
  /**
   * Run the full matching pipeline for a resume against a job posting.
   * Calls cv_matching, gap_engine, course_rec, job_rec, and roadmap services.
   * @param {string} resumeId - Resume UUID
   * @param {string} jobId - Job posting UUID
   * @param {string} token - Auth token
   * @returns {Promise<Object>} - { match_score, readiness_score, matched_skills, missing_skills, recommended_courses, recommended_jobs, roadmap, errors }
   */
  async runMatching(resumeId, jobId, token) {
    const response = await authFetch('/matches/run', {
      method: 'POST',
      body: JSON.stringify({ resume_id: resumeId, job_id: jobId }),
    }, token);

    if (!response.ok) {
      throw await createApiError(response, 'Failed to run matching pipeline');
    }

    return response.json();
  },

  /**
   * Get all match results for the authenticated user.
   * @param {string} token - Auth token
   * @returns {Promise<Array>} - List of candidate_matches with joined job_postings
   */
  async getMatchResults(token) {
    const response = await authFetch('/matches', {
      method: 'GET',
    }, token);

    if (!response.ok) {
      throw await createApiError(response, 'Failed to fetch match results');
    }

    return response.json();
  },
};
