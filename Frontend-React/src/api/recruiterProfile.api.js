/**
 * Recruiter Profile API
 * Company profile API calls for recruiters
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
    // Keep fallback when non-JSON error returned
  }

  const error = new Error(message);
  error.status = response.status;
  return error;
};

export const recruiterProfileAPI = {
  /**
   * Get recruiter company profile
   * @param {string} [token] - Auth token
   * @returns {Promise<Object>} - { success: true, data: companyProfile | null }
   */
  async getCompanyProfile(token) {
    const response = await fetch(`${API_BASE_URL}/recruiter/company-profile`, {
      method: 'GET',
      headers: getAuthHeaders(token),
    });

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
    const response = await fetch(`${API_BASE_URL}/recruiter/company-profile`, {
      method: 'PUT',
      headers: getAuthHeaders(token),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw await createApiError(response, 'Failed to update company profile');
    }

    return response.json();
  },
};
