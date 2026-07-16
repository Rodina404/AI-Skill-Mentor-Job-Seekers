/**
 * Users API
 * All user-related API calls
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const getAuthHeaders = (token) => {
  const finalToken = token || localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${finalToken}`,
  };
};

const createApiError = async (response, fallbackMessage) => {
  let message = fallbackMessage;

  try {
    const body = await response.json();
    message = body.error || body.message || fallbackMessage;
  } catch {
    // Keep the fallback when the server does not return JSON.
  }

  const error = new Error(message);
  error.status = response.status;
  return error;
};

export const usersAPI = {
  /**
   * Get user profile
   * @param {string} userId - User ID
   * @param {string} token - Auth token
   * @returns {Promise<Object>} - User profile data
   */
  async getProfile(userId, token) {
    const response = await fetch(`${API_BASE_URL}/auth/me`, {
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
    const payload = {
      skillName: skillData.name || skillData.skillName,
      proficiency: skillData.level || skillData.proficiency || 'intermediate',
      yearsOfExperience: skillData.yearsOfExperience || 1
    };
    const response = await fetch(`${API_BASE_URL}/skills/me`, {
      method: 'POST',
      headers: getAuthHeaders(token),
      body: JSON.stringify(payload),
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
  async saveJob(userId, jobId, token, options = {}) {
    const response = await fetch(`${API_BASE_URL}/users/${userId}/saved-jobs`, {
      method: 'POST',
      headers: getAuthHeaders(token),
      body: JSON.stringify({ jobId, ...options }),
    });

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
    const response = await fetch(`${API_BASE_URL}/users/${userId}/saved-jobs/${savedJobId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(token),
    });

    if (!response.ok) {
      throw new Error('Failed to remove saved job');
    }

    return response.json();
  },

  /**
   * Get current user's skills
   * @param {string} token - Auth token
   * @returns {Promise<Array>} - List of skills
   */
  async getSkills(token) {
    const response = await fetch(`${API_BASE_URL}/skills/me`, {
      method: 'GET',
      headers: getAuthHeaders(token),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch user skills');
    }

    return response.json();
  },
};
