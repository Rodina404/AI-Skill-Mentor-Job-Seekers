/**
 * Jobs API
 * All job-related API calls
 */

import { authFetch, createApiError } from './apiClient';

export const jobsAPI = {
  /**
   * Get all jobs
   * @param {Object} filters - Optional filters (location, type, etc.)
   * @param {string} token - Auth token
   * @returns {Promise<Array>} - List of jobs
   */
  async getAllJobs(filters = {}, token) {
    const queryParams = new URLSearchParams(filters).toString();
    const response = await authFetch(`/jobs?${queryParams}`, {
      method: 'GET',
    }, token);

    if (!response.ok) {
      throw await createApiError(response, 'Failed to fetch jobs');
    }

    return response.json();
  },

  /**
   * Get jobs owned by the authenticated recruiter.
   * @param {Object} filters - Optional filters, e.g. { status: 'open' | 'all' }
   * @param {string} token - Auth token
   * @returns {Promise<Array>} - Recruiter-owned jobs
   */
  async getMyRecruiterJobs(filters = {}, token) {
    const queryParams = new URLSearchParams(filters).toString();
    const response = await authFetch(`/jobs/recruiter/my-jobs?${queryParams}`, {
      method: 'GET',
    }, token);

    if (!response.ok) {
      throw await createApiError(response, 'Failed to fetch your posted jobs');
    }

    return response.json();
  },

  /**
   * Get job by ID
   * @param {string} jobId - Job ID
   * @param {string} token - Auth token
   * @returns {Promise<Object>} - Job details
   */
  async getJobById(jobId, token) {
    const response = await authFetch(`/jobs/${jobId}`, {
      method: 'GET',
    }, token);

    if (!response.ok) {
      throw await createApiError(response, 'Failed to fetch job details');
    }

    return response.json();
  },

  /**
   * Create new job posting (Recruiter only)
   * @param {Object} jobData - Job details
   * @param {string} token - Auth token
   * @returns {Promise<Object>} - Created job
   */
  async createJob(jobData, token) {
    const response = await authFetch('/jobs', {
      method: 'POST',
      body: JSON.stringify(jobData),
    }, token);

    if (!response.ok) {
      throw await createApiError(response, 'Failed to create job');
    }

    return response.json();
  },

  /**
   * Update job posting (Recruiter only)
   * @param {string} jobId - Job ID
   * @param {Object} jobData - Updated job details
   * @param {string} token - Auth token
   * @returns {Promise<Object>} - Updated job
   */
  async updateJob(jobId, jobData, token) {
    const response = await authFetch(`/jobs/${jobId}`, {
      method: 'PUT',
      body: JSON.stringify(jobData),
    }, token);

    if (!response.ok) {
      throw await createApiError(response, 'Failed to update job');
    }

    return response.json();
  },

  /**
   * Delete job posting (Recruiter/Admin only)
   * @param {string} jobId - Job ID
   * @param {string} token - Auth token
   * @returns {Promise<Object>} - Success message
   */
  async deleteJob(jobId, token) {
    const response = await authFetch(`/jobs/${jobId}`, {
      method: 'DELETE',
    }, token);

    if (!response.ok) {
      throw await createApiError(response, 'Failed to delete job');
    }

    return response.json();
  },

  /**
   * Apply to job
   * @param {string} jobId - Job ID
   * @param {string} token - Auth token
   * @returns {Promise<Object>} - Application confirmation
   */
  async applyToJob(jobId, token) {
    const response = await authFetch(`/jobs/${jobId}/apply`, {
      method: 'POST',
    }, token);

    if (!response.ok) {
      throw await createApiError(response, 'Failed to apply to job');
    }

    return response.json();
  },

  /**
   * Get applicants for a job (Recruiter only)
   * @param {string} jobId - Job ID
   * @param {string} token - Auth token
   * @returns {Promise<Array>} - List of applicants
   */
  async getJobApplicants(jobId, token) {
    const response = await authFetch(`/jobs/${jobId}/applicants`, {
      method: 'GET',
    }, token);

    if (!response.ok) {
      throw await createApiError(response, 'Failed to fetch applicants');
    }

    return response.json();
  },

  /**
   * Approve job (Admin only)
   * @param {string} jobId - Job ID
   * @param {string} token - Auth token
   * @returns {Promise<Object>} - Updated job
   */
  async approveJob(jobId, token) {
    const response = await authFetch(`/jobs/${jobId}/approve`, {
      method: 'POST',
    }, token);

    if (!response.ok) {
      throw await createApiError(response, 'Failed to approve job');
    }

    return response.json();
  },

  /**
   * Get recommended jobs from Adzuna (Job Recommendation Service)
   * @param {Object} filters - Optional filters (search, location, type)
   * @param {string} token - Auth token
   * @returns {Promise<Object>} - Recommendations
   */
  /**
   * Get recommended jobs from Adzuna (Job Recommendation Service)
   * @param {Object} filters - Optional filters (search, location, type)
   * @param {string} token - Auth token
   * @returns {Promise<Object>} - Recommendations
   */
  async getRecommendedJobs(filters = {}, token) {
    const queryParams = new URLSearchParams(filters).toString();
    const response = await authFetch(`/jobs/recommended?${queryParams}`, {
      method: 'GET',
    }, token);

    if (!response.ok) {
      throw await createApiError(response, 'Failed to fetch recommended jobs');
    }

    return response.json();
  },

  /**
   * Run AI Candidate Discovery & Matching for a Recruiter Job
   * @param {string} jobId - Job Posting UUID
   * @param {string} token - Auth token
   * @returns {Promise<Object>} - Matching pipeline result
   */
  async matchCandidates(jobId, token) {
    const response = await authFetch(`/jobs/${jobId}/match-candidates`, {
      method: 'POST',
    }, token);

    if (!response.ok) {
      throw await createApiError(response, 'Failed to run candidate matching');
    }

    return response.json();
  },

  /**
   * Get persisted candidate matches for a Recruiter Job
   * @param {string} jobId - Job Posting UUID
   * @param {Object} params - Query params { page, limit }
   * @param {string} token - Auth token
   * @returns {Promise<Object>} - Persisted candidate matches
   */
  async getCandidateMatches(jobId, { page = 1, limit = 20 } = {}, token) {
    const queryParams = new URLSearchParams({ page, limit }).toString();
    const response = await authFetch(`/jobs/${jobId}/candidate-matches?${queryParams}`, {
      method: 'GET',
    }, token);

    if (!response.ok) {
      throw await createApiError(response, 'Failed to fetch candidate matches');
    }

    return response.json();
  },

  /**
   * Get temporary Supabase Storage Signed URL for a candidate's resume
   * @param {string} jobId - Job Posting UUID
   * @param {string} candidateId - Candidate Profile UUID
   * @param {string} token - Auth token
   * @returns {Promise<{ success: boolean, data: { url: string, expiresIn: number, originalName: string } }>}
   */
  async getCandidateResumeUrl(jobId, candidateId, token) {
    const response = await authFetch(`/jobs/${jobId}/candidates/${candidateId}/resume-url`, {
      method: 'GET',
    }, token);

    if (!response.ok) {
      throw await createApiError(response, 'Failed to generate temporary resume signed URL');
    }

    return response.json();
  },
};
