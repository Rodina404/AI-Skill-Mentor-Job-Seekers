/**
 * Authentication API
 * All authentication-related API calls
 */

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

export const authAPI = {
  /**
   * Sign in user
   * @param {Object} credentials - { email, password, role }
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
      const error = await response.json();
      throw new Error(error.message || 'Sign in failed');
    }

    return response.json();
  },

  /**
   * Sign up new user
   * @param {Object} userData - { name, email, password, role }
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
      const error = await response.json();
      throw new Error(error.message || 'Sign up failed');
    }

    return response.json();
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
      throw new Error('Token verification failed');
    }

    return response.json();
  },
};
