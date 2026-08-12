/**
 * Authentication API
 * All authentication-related API calls
 */

import { API_BASE_URL, createApiError } from './apiClient';

export const authAPI = {
  /**
   * Sign in user
   * @param {Object} credentials - { email, password }
   * @returns {Promise<Object>} - User data and token
   */
  async signIn(credentials) {
    const response = await fetch(`${API_BASE_URL}/auth/signin`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      throw await createApiError(response, 'Sign in failed');
    }

    return response.json();
  },

  // Alias for signin
  async signin(credentials) {
    return this.signIn(credentials);
  },

  /**
   * Sign up new user
   * @param {Object} userData - { email, password, full_name, role }
   * @returns {Promise<Object>} - User data and token
   */
  async signUp(userData) {
    const response = await fetch(`${API_BASE_URL}/auth/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      throw await createApiError(response, 'Sign up failed');
    }

    return response.json();
  },

  // Alias for signup
  async signup(userData) {
    return this.signUp(userData);
  },

  /**
   * Sign out user
   * @param {string} token - Auth token
   * @returns {Promise<void>}
   */
  async signOut(token) {
    const response = await fetch(`${API_BASE_URL}/auth/signout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Sign out failed');
    }

    return response.json();
  },

  async refreshToken(refreshToken) {
    const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refresh_token: refreshToken }),
    });

    if (!response.ok) {
      throw await createApiError(response, 'Session refresh failed');
    }

    return response.json();
  },

  /**
   * Verify auth token
   * @param {string} token - Auth token
   * @returns {Promise<Object>} - User data
   */
  async verifyToken(token) {
    const response = await fetch(`${API_BASE_URL}/auth/verify`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw await createApiError(response, 'Token verification failed');
    }

    return response.json();
  },
};
