/**
 * Notifications API
 * Interfacing with backend notifications endpoints
 */

import { authFetch, createApiError } from './apiClient';

export const notificationsAPI = {
  /**
   * Get user notifications
   * @param {string} token - Auth token
   * @returns {Promise<Array>} - List of notifications
   */
  async getNotifications(token) {
    const response = await authFetch('/notifications', {
      method: 'GET',
    }, token);

    if (!response.ok) {
      throw await createApiError(response, 'Failed to fetch notifications');
    }

    return response.json();
  },
};
