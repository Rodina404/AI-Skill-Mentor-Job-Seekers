/**
 * Admin API
 * All admin-related API calls
 */

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

const getAuthHeaders = (token) => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${token}`,
});

export const adminAPI = {
  /**
   * Get all users (Admin only)
   * @param {string} token - Auth token
   * @returns {Promise<Array>} - List of users
   */
  async getAllUsers(token) {
    const response = await fetch(`${API_BASE_URL}/admin/users`, {
      method: 'GET',
      headers: getAuthHeaders(token),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch users');
    }

    return response.json();
  },

  /**
   * Create new user (Admin only)
   * @param {Object} userData - User data
   * @param {string} token - Auth token
   * @returns {Promise<Object>} - Created user
   */
  async createUser(userData, token) {
    const response = await fetch(`${API_BASE_URL}/admin/users`, {
      method: 'POST',
      headers: getAuthHeaders(token),
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      throw new Error('Failed to create user');
    }

    return response.json();
  },

  /**
   * Update user (Admin only)
   * @param {string} userId - User ID
   * @param {Object} userData - Updated user data
   * @param {string} token - Auth token
   * @returns {Promise<Object>} - Updated user
   */
  async updateUser(userId, userData, token) {
    const response = await fetch(`${API_BASE_URL}/admin/users/${userId}`, {
      method: 'PUT',
      headers: getAuthHeaders(token),
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      throw new Error('Failed to update user');
    }

    return response.json();
  },

  /**
   * Delete user (Admin only)
   * @param {string} userId - User ID
   * @param {string} token - Auth token
   * @returns {Promise<Object>} - Success message
   */
  async deleteUser(userId, token) {
    const response = await fetch(`${API_BASE_URL}/admin/users/${userId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(token),
    });

    if (!response.ok) {
      throw new Error('Failed to delete user');
    }

    return response.json();
  },

  /**
   * Get system statistics (Admin only)
   * @param {string} token - Auth token
   * @returns {Promise<Object>} - System stats
   */
  async getSystemStats(token) {
    const response = await fetch(`${API_BASE_URL}/admin/stats`, {
      method: 'GET',
      headers: getAuthHeaders(token),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch system stats');
    }

    return response.json();
  },

  /**
   * Get all jobs for review (Admin only)
   * @param {string} token - Auth token
   * @returns {Promise<Array>} - List of jobs pending review
   */
  async getAllJobsForReview(token) {
    const response = await fetch(`${API_BASE_URL}/admin/jobs`, {
      method: 'GET',
      headers: getAuthHeaders(token),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch jobs');
    }

    return response.json();
  },

  /**
   * Approve job (Admin only)
   * @param {string} jobId - Job ID
   * @param {string} token - Auth token
   * @returns {Promise<Object>} - Approved job
   */
  async approveJob(jobId, token) {
    const response = await fetch(`${API_BASE_URL}/admin/jobs/${jobId}/approve`, {
      method: 'POST',
      headers: getAuthHeaders(token),
    });

    if (!response.ok) {
      throw new Error('Failed to approve job');
    }

    return response.json();
  },

  /**
   * Archive job (Admin only)
   * @param {string} jobId - Job ID
   * @param {string} token - Auth token
   * @returns {Promise<Object>} - Archived job
   */
  async archiveJob(jobId, token) {
    const response = await fetch(`${API_BASE_URL}/admin/jobs/${jobId}/archive`, {
      method: 'POST',
      headers: getAuthHeaders(token),
    });

    if (!response.ok) {
      throw new Error('Failed to archive job');
    }

    return response.json();
  },

  /**
   * Delete job (Admin only)
   * @param {string} jobId - Job ID
   * @param {string} token - Auth token
   * @returns {Promise<Object>} - Success message
   */
  async deleteJob(jobId, token) {
    const response = await fetch(`${API_BASE_URL}/admin/jobs/${jobId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(token),
    });

    if (!response.ok) {
      throw new Error('Failed to delete job');
    }

    return response.json();
  },
};
