/**
 * Jobs API
 * All job-related API calls
 */

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

const getAuthHeaders = (token) => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${token}`,
});

export const jobsAPI = {
  /**
   * Get all jobs
   * @param {Object} filters - Optional filters (location, type, etc.)
   * @param {string} token - Auth token
   * @returns {Promise<Array>} - List of jobs
   */
  async getAllJobs(filters = {}, token) {
    const queryParams = new URLSearchParams(filters).toString();
    const response = await fetch(`${API_BASE_URL}/jobs?${queryParams}`, {
      method: 'GET',
      headers: getAuthHeaders(token),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch jobs');
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
    const response = await fetch(`${API_BASE_URL}/jobs/${jobId}`, {
      method: 'GET',
      headers: getAuthHeaders(token),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch job details');
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
    const response = await fetch(`${API_BASE_URL}/jobs`, {
      method: 'POST',
      headers: getAuthHeaders(token),
      body: JSON.stringify(jobData),
    });

    if (!response.ok) {
      throw new Error('Failed to create job');
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
    const response = await fetch(`${API_BASE_URL}/jobs/${jobId}`, {
      method: 'PUT',
      headers: getAuthHeaders(token),
      body: JSON.stringify(jobData),
    });

    if (!response.ok) {
      throw new Error('Failed to update job');
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
    const response = await fetch(`${API_BASE_URL}/jobs/${jobId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(token),
    });

    if (!response.ok) {
      throw new Error('Failed to delete job');
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
    const response = await fetch(`${API_BASE_URL}/jobs/${jobId}/apply`, {
      method: 'POST',
      headers: getAuthHeaders(token),
    });

    if (!response.ok) {
      throw new Error('Failed to apply to job');
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
    const response = await fetch(`${API_BASE_URL}/jobs/${jobId}/applicants`, {
      method: 'GET',
      headers: getAuthHeaders(token),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch applicants');
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
    const response = await fetch(`${API_BASE_URL}/jobs/${jobId}/approve`, {
      method: 'POST',
      headers: getAuthHeaders(token),
    });

    if (!response.ok) {
      throw new Error('Failed to approve job');
    }

    return response.json();
  },
};
