/**
 * Users API
 * All user-related API calls
 */

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

const getAuthHeaders = (token) => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${token}`,
});

export const usersAPI = {
  /**
   * Get user profile
   * @param {string} userId - User ID
   * @param {string} token - Auth token
   * @returns {Promise<Object>} - User profile data
   */
  async getProfile(userId, token) {
    const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
      method: 'GET',
      headers: getAuthHeaders(token),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch user profile');
    }

    return response.json();
  },

  /**
   * Update user profile
   * @param {string} userId - User ID
   * @param {Object} profileData - Updated profile data
   * @param {string} token - Auth token
   * @returns {Promise<Object>} - Updated profile data
   */
  async updateProfile(userId, profileData, token) {
    const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
      method: 'PUT',
      headers: getAuthHeaders(token),
      body: JSON.stringify(profileData),
    });

    if (!response.ok) {
      throw new Error('Failed to update profile');
    }

    return response.json();
  },

  /**
   * Add skill to user profile
   * @param {string} userId - User ID
   * @param {Object} skillData - { name, level, category }
   * @param {string} token - Auth token
   * @returns {Promise<Object>} - Updated skills list
   */
  async addSkill(userId, skillData, token) {
    const response = await fetch(`${API_BASE_URL}/users/${userId}/skills`, {
      method: 'POST',
      headers: getAuthHeaders(token),
      body: JSON.stringify(skillData),
    });

    if (!response.ok) {
      throw new Error('Failed to add skill');
    }

    return response.json();
  },

  /**
   * Update career goals
   * @param {string} userId - User ID
   * @param {Array<string>} goals - List of career goals
   * @param {string} token - Auth token
   * @returns {Promise<Object>} - Updated goals
   */
  async updateGoals(userId, goals, token) {
    const response = await fetch(`${API_BASE_URL}/users/${userId}/goals`, {
      method: 'PUT',
      headers: getAuthHeaders(token),
      body: JSON.stringify({ goals }),
    });

    if (!response.ok) {
      throw new Error('Failed to update goals');
    }

    return response.json();
  },

  /**
   * Get user's saved jobs
   * @param {string} userId - User ID
   * @param {string} token - Auth token
   * @returns {Promise<Array>} - List of saved jobs
   */
  async getSavedJobs(userId, token) {
    const response = await fetch(`${API_BASE_URL}/users/${userId}/saved-jobs`, {
      method: 'GET',
      headers: getAuthHeaders(token),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch saved jobs');
    }

    return response.json();
  },

  /**
   * Save a job
   * @param {string} userId - User ID
   * @param {string} jobId - Job ID
   * @param {string} token - Auth token
   * @returns {Promise<Object>} - Success message
   */
  async saveJob(userId, jobId, token) {
    const response = await fetch(`${API_BASE_URL}/users/${userId}/saved-jobs`, {
      method: 'POST',
      headers: getAuthHeaders(token),
      body: JSON.stringify({ jobId }),
    });

    if (!response.ok) {
      throw new Error('Failed to save job');
    }

    return response.json();
  },

  /**
   * Remove saved job
   * @param {string} userId - User ID
   * @param {string} jobId - Job ID
   * @param {string} token - Auth token
   * @returns {Promise<Object>} - Success message
   */
  async removeSavedJob(userId, jobId, token) {
    const response = await fetch(`${API_BASE_URL}/users/${userId}/saved-jobs/${jobId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(token),
    });

    if (!response.ok) {
      throw new Error('Failed to remove saved job');
    }

    return response.json();
  },
};
