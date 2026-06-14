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

const throwApiError = async (response, fallbackMessage) => {
  let message = fallbackMessage;

  try {
    const body = await response.json();
    message = body.error || body.message || fallbackMessage;
  } catch {
    // Keep the fallback when the server does not return JSON.
  }

  const error = new Error(
    response.status === 401 ? 'Session expired. Please log in again.' : message
  );
  error.status = response.status;
  throw error;
};

export const resumeAPI = {
  /**
   * Upload and analyze resume
   * POST /api/resumes/upload  (multer field name: 'file')
   * Returns 202: { message, resume_id }
   */
  async analyzeResume(file, jobTitle, token) {
    const formData = new FormData();
    formData.append('file', file);          // multer expects 'file'
    formData.append('jobTitle', jobTitle);

    const response = await fetch(`${API_BASE_URL}/resumes/upload`, {
      method: 'POST',
      headers: getAuthHeaders(token),       // no Content-Type — browser sets multipart boundary
      body: formData,
    });

    if (!response.ok) {
      await throwApiError(response, 'Failed to upload resume');
    }

    return response.json();
  },

  /**
   * Poll resume analysis status
   * GET /api/resumes/:resumeId/status
   * Returns: { id, status, original_name, analyzed_at, normalized_skills, extracted_data,
   *            jobTitle, readinessScore, matchedSkills, missingSkills, courseRecommendations, roadmap }
   */
  async pollResumeStatus(resumeId, token) {
    const response = await fetch(`${API_BASE_URL}/resumes/${resumeId}/status`, {
      method: 'GET',
      cache: 'no-store',
      headers: {
        ...getAuthHeaders(token),
      },
    });

    if (!response.ok) {
      await throwApiError(response, 'Failed to fetch analysis status');
    }

    return response.json();
  },

  /**
   * Get analysis history
   */
  async getAnalysisHistory(userId, token) {
    const response = await fetch(`${API_BASE_URL}/resumes`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(token),
      },
    });

    if (!response.ok) {
      await throwApiError(response, 'Failed to fetch analysis history');
    }

    return response.json();
  },

  /**
   * Get specific analysis by ID (alias for pollResumeStatus)
   */
  async getAnalysisById(analysisId, token) {
    return this.pollResumeStatus(analysisId, token);
  },

  /**
   * Create learning path from analysis
   */
  async createLearningPath(analysisId, token) {
    const response = await fetch(`${API_BASE_URL}/resumes/learning-path`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(token),
      },
      body: JSON.stringify({ analysisId }),
    });

    if (!response.ok) {
      await throwApiError(response, 'Failed to create learning path');
    }

    return response.json();
  },

  /**
   * Get recommended courses based on skill gaps
   */
  async getRecommendedCourses(analysisId, token) {
    const response = await fetch(`${API_BASE_URL}/resumes/recommendations/${analysisId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(token),
      },
    });

    if (!response.ok) {
      await throwApiError(response, 'Failed to fetch recommendations');
    }

    return response.json();
  },

  /**
   * Get consolidated resume analysis and match details
   */
  async getAnalysis(resumeId, token) {
    const resumeData = await this.pollResumeStatus(resumeId, token);

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
      matchData = matches.find(m => m.resume_id === resumeId);
      if (!matchData && matches.length > 0) {
        matchData = matches[0];
      }
    }

    return {
      ...resumeData,
      match: matchData,
      extractedSkills: resumeData.normalized_skills || [],
      missingSkills: matchData ? matchData.missing_skills || [] : resumeData.missingSkills || [],
      readinessScore: matchData
        ? Math.round((matchData.skill_match_score || matchData.overall_score || 0) * 100)
        : resumeData.readinessScore || 0
    };
  },

  /**
   * Run matching pipeline for resume and job posting
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
      await throwApiError(response, 'Failed to run matching pipeline');
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
      await throwApiError(response, 'Failed to fetch roadmap');
    }

    return response.json();
  },
};
