/**
 * Matches API
 * All match-related API calls (CV matching pipeline, match results)
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const getAuthHeaders = (token) => {
  const finalToken = token || localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${finalToken}`,
  };
};

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
    const response = await fetch(`${API_BASE_URL}/matches/run`, {
      method: 'POST',
      headers: getAuthHeaders(token),
      body: JSON.stringify({ resume_id: resumeId, job_id: jobId }),
    });

    if (!response.ok) {
      let message = 'Failed to run matching pipeline';
      try {
        const body = await response.json();
        message = body.error || body.message || message;
      } catch {
        // keep fallback
      }
      const error = new Error(message);
      error.status = response.status;
      throw error;
    }

    return response.json();
  },

  /**
   * Get all match results for the authenticated user.
   * @param {string} token - Auth token
   * @returns {Promise<Array>} - List of candidate_matches with joined job_postings
   */
  async getMatchResults(token) {
    const response = await fetch(`${API_BASE_URL}/matches`, {
      method: 'GET',
      headers: getAuthHeaders(token),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch match results');
    }

    return response.json();
  },
};
