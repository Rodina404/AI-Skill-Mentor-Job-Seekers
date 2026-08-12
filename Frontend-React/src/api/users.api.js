/**
 * Users API
 * All user-related API calls
 */

import { authFetch, createApiError } from './apiClient';

export const usersAPI = {
  /**
   * Get user profile
   * @param {string} userId - User ID
   * @param {string} token - Auth token
   * @returns {Promise<Object>} - User profile data
   */
  async getProfile(userId, token) {
    const response = await authFetch('/auth/me', {
      method: 'GET',
    }, token);

    if (!response.ok) {
      throw await createApiError(response, 'Failed to fetch user profile');
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
    const response = await authFetch(`/users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(profileData),
    }, token);

    if (!response.ok) {
      throw await createApiError(response, 'Failed to update profile');
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
    const payload = {
      skillName: skillData.name || skillData.skillName,
      proficiency: skillData.level || skillData.proficiency || 'intermediate',
      yearsOfExperience: skillData.yearsOfExperience || 1
    };
    const response = await authFetch('/skills/me', {
      method: 'POST',
      body: JSON.stringify(payload),
    }, token);

    if (!response.ok) {
      throw await createApiError(response, 'Failed to add skill');
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
    const response = await authFetch(`/users/${userId}/goals`, {
      method: 'PUT',
      body: JSON.stringify({ goals }),
    }, token);

    if (!response.ok) {
      throw await createApiError(response, 'Failed to update goals');
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
    const response = await authFetch(`/users/${userId}/saved-jobs`, {
      method: 'GET',
    }, token);

    if (!response.ok) {
      throw await createApiError(response, 'Failed to fetch saved jobs');
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
  async saveJob(userId, jobId, token, options = {}) {
    const response = await authFetch(`/users/${userId}/saved-jobs`, {
      method: 'POST',
      body: JSON.stringify({ jobId, ...options }),
    }, token);

    if (!response.ok) {
      throw await createApiError(response, 'Failed to save job');
    }

    return response.json();
  },

  /**
   * Remove saved job
   * @param {string} userId - User ID
   * @param {string} savedJobId - Saved-job record ID
   * @param {string} token - Auth token
   * @returns {Promise<Object>} - Success message
   */
  async removeSavedJob(userId, savedJobId, token) {
    const response = await authFetch(`/users/${userId}/saved-jobs/${savedJobId}`, {
      method: 'DELETE',
    }, token);

    if (!response.ok) {
      throw await createApiError(response, 'Failed to remove saved job');
    }

    return response.json();
  },

  /**
   * Get current user's skills
   * @param {string} token - Auth token
   * @returns {Promise<Array>} - List of skills
   */
  async getSkills(token) {
    const response = await authFetch('/skills/me', {
      method: 'GET',
    }, token);

    if (!response.ok) {
      throw await createApiError(response, 'Failed to fetch user skills');
    }

    return response.json();
  },
};
