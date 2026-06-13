/**
 * Resume Analysis API
 * All resume analysis and AI-related API calls
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const getAuthHeaders = (token) => {
  const finalToken = token || localStorage.getItem('token');
  return {
    'Authorization': `Bearer ${finalToken}`,
  };
};

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

  /**
   * Get resume analysis and match details
   * @param {string} resumeId - Resume ID
   * @param {string} token - Auth token
   * @returns {Promise<Object>} - Consolidated analysis and match details
   */
  async getAnalysis(resumeId, token) {
    const resumeResponse = await fetch(`${API_BASE_URL}/resume/analysis/${resumeId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(token),
      },
    });
    if (!resumeResponse.ok) {
      throw new Error('Failed to fetch resume status');
    }
    const resumeData = await resumeResponse.json();

    // Fetch matches for this user
    const matchesResponse = await fetch(`${API_BASE_URL}/matches`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(token),
      },
    });

    let matchData = null;
    if (matchesResponse.ok) {
      const matches = await matchesResponse.json();
      // Find the match belonging to this resumeId
      matchData = matches.find(m => m.resume_id === resumeId);
      if (!matchData && matches.length > 0) {
        matchData = matches[0]; // fallback to latest match
      }
    }

    return {
      ...resumeData,
      match: matchData,
      extractedSkills: resumeData.normalized_skills || [],
      missingSkills: matchData ? matchData.missing_skills || [] : [],
      readinessScore: matchData ? Math.round((matchData.skill_match_score || matchData.overall_score || 0) * 100) : 0
    };
  },

  /**
   * Run matching pipeline for resume and job posting
   * @param {string} resumeId - Resume ID
   * @param {string} jobId - Job Posting ID
   * @param {string} token - Auth token
   * @returns {Promise<Object>} - Matching results
   */
  async runMatching(resumeId, jobId, token) {
    const response = await fetch(`${API_BASE_URL}/matches/run`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(token),
      },
      body: JSON.stringify({ resume_id: resumeId, job_id: jobId }),
    });

    if (!response.ok) {
      throw new Error('Failed to run matching pipeline');
    }

    return response.json();
  },

  async getLearningPath(analysisId, token) {
    return this.createLearningPath(analysisId, token);
  },

  async getRecommendations(resumeId, token) {
    return this.getRecommendedCourses(resumeId, token);
  },

  async getRoadmap(resumeId, token) {
    const response = await fetch(`${API_BASE_URL}/roadmap/${resumeId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(token),
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch roadmap');
    }

    return response.json();
  },
};


