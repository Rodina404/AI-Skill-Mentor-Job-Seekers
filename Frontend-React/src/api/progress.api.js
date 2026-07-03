/**
 * Progress API
 * Interfacing with backend progress endpoints
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const getAuthHeaders = (token) => {
  const finalToken = token || localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${finalToken}`,
  };
};

export const progressAPI = {
  /**
   * Get learning progress for the user
   * @param {string} token - Auth token
   * @returns {Promise<Array>} - List of progress records
   */
  async getProgress(token) {
    const response = await fetch(`${API_BASE_URL}/progress`, {
      method: 'GET',
      headers: getAuthHeaders(token),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch progress');
    }

    return response.json();
  },

  /**
   * Update progress for a specific course recommendation
   * @param {string} courseId - Course recommendation ID
   * @param {string} status - Enrollment status ('in_progress', 'completed')
   * @param {number} progress - Progress percentage (0 to 100)
   * @param {string} token - Auth token
   * @returns {Promise<Object>} - The updated progress record
   */
  async updateProgress(courseId, status, progress, token) {
    const response = await fetch(`${API_BASE_URL}/progress/update`, {
      method: 'POST',
      headers: getAuthHeaders(token),
      body: JSON.stringify({ courseId, status, progress }),
    });

    if (!response.ok) {
      throw new Error('Failed to update progress');
    }

    return response.json();
  },
};
