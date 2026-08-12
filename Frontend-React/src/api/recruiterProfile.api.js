/**
 * Recruiter Profile API
 * Company profile API calls for recruiters
 */

import { authFetch, createApiError } from './apiClient';

export const recruiterProfileAPI = {
  /**
   * Get recruiter company profile
   * @param {string} [token] - Auth token
   * @returns {Promise<Object>} - { success: true, data: companyProfile | null }
   */
  async getCompanyProfile(token) {
    const response = await authFetch('/recruiter/company-profile', {
      method: 'GET',
    }, token);

    if (!response.ok) {
      throw await createApiError(response, 'Failed to fetch company profile');
    }

    return response.json();
  },

  /**
   * Update recruiter company profile
   * @param {Object} data - Profile fields { name, description, email, phone, location }
   * @param {string} [token] - Auth token
   * @returns {Promise<Object>} - { success: true, data: companyProfile }
   */
  async updateCompanyProfile(data, token) {
    const response = await authFetch('/recruiter/company-profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    }, token);

    if (!response.ok) {
      throw await createApiError(response, 'Failed to update company profile');
    }

    return response.json();
  },
};
