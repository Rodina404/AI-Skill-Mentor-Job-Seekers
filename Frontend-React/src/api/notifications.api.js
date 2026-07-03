/**
 * Notifications API
 * Interfacing with backend notifications endpoints
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const getAuthHeaders = (token) => {
  const finalToken = token || localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${finalToken}`,
  };
};

export const notificationsAPI = {
  /**
   * Get user notifications
   * @param {string} token - Auth token
   * @returns {Promise<Array>} - List of notifications
   */
  async getNotifications(token) {
    const response = await fetch(`${API_BASE_URL}/notifications`, {
      method: 'GET',
      headers: getAuthHeaders(token),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch notifications');
    }

    return response.json();
  },
};
