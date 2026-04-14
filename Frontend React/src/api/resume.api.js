/**
 * Resume Analysis API
 * All resume analysis and AI-related API calls
 */

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

const getAuthHeaders = (token) => ({
  'Authorization': `Bearer ${token}`,
});

export const resumeAPI = {
  /**
   * Upload and analyze resume
   * @param {File} file - Resume file
   * @param {string} jobTitle - Target job title
   * @param {string} token - Auth token
   * @returns {Promise<Object>} - Analysis results
   */
  async analyzeResume(file, jobTitle, token) {
    const formData = new FormData();
    formData.append('resume', file);
    formData.append('jobTitle', jobTitle);

    const response = await fetch(`${API_BASE_URL}/resume/analyze`, {
      method: 'POST',
      headers: getAuthHeaders(token),
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Failed to analyze resume');
    }

    return response.json();
  },

  /**
   * Get analysis history
   * @param {string} userId - User ID
   * @param {string} token - Auth token
   * @returns {Promise<Array>} - List of past analyses
   */
  async getAnalysisHistory(userId, token) {
    const response = await fetch(`${API_BASE_URL}/resume/history/${userId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(token),
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch analysis history');
    }

    return response.json();
  },

  /**
   * Get specific analysis by ID
   * @param {string} analysisId - Analysis ID
   * @param {string} token - Auth token
   * @returns {Promise<Object>} - Analysis details
   */
  async getAnalysisById(analysisId, token) {
    const response = await fetch(`${API_BASE_URL}/resume/analysis/${analysisId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(token),
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch analysis');
    }

    return response.json();
  },

  /**
   * Create learning path from analysis
   * @param {string} analysisId - Analysis ID
   * @param {string} token - Auth token
   * @returns {Promise<Object>} - Generated learning path
   */
  async createLearningPath(analysisId, token) {
    const response = await fetch(`${API_BASE_URL}/resume/learning-path`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(token),
      },
      body: JSON.stringify({ analysisId }),
    });

    if (!response.ok) {
      throw new Error('Failed to create learning path');
    }

    return response.json();
  },

  /**
   * Get recommended courses based on skill gaps
   * @param {string} analysisId - Analysis ID
   * @param {string} token - Auth token
   * @returns {Promise<Array>} - List of recommended courses
   */
  async getRecommendedCourses(analysisId, token) {
    const response = await fetch(`${API_BASE_URL}/resume/recommendations/${analysisId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(token),
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch recommendations');
    }

    return response.json();
  },
};
