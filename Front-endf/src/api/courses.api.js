/**
 * Courses API
 * All course-related API calls
 */

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

const getAuthHeaders = (token) => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${token}`,
});

export const coursesAPI = {
  /**
   * Get all courses
   * @param {Object} filters - Optional filters (level, category, etc.)
   * @param {string} token - Auth token
   * @returns {Promise<Array>} - List of courses
   */
  async getAllCourses(filters = {}, token) {
    const queryParams = new URLSearchParams(filters).toString();
    const response = await fetch(`${API_BASE_URL}/courses?${queryParams}`, {
      method: 'GET',
      headers: getAuthHeaders(token),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch courses');
    }

    return response.json();
  },

  /**
   * Get course by ID
   * @param {string} courseId - Course ID
   * @param {string} token - Auth token
   * @returns {Promise<Object>} - Course details
   */
  async getCourseById(courseId, token) {
    const response = await fetch(`${API_BASE_URL}/courses/${courseId}`, {
      method: 'GET',
      headers: getAuthHeaders(token),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch course details');
    }

    return response.json();
  },

  /**
   * Enroll in course
   * @param {string} courseId - Course ID
   * @param {string} token - Auth token
   * @returns {Promise<Object>} - Enrollment confirmation
   */
  async enrollInCourse(courseId, token) {
    const response = await fetch(`${API_BASE_URL}/courses/${courseId}/enroll`, {
      method: 'POST',
      headers: getAuthHeaders(token),
    });

    if (!response.ok) {
      throw new Error('Failed to enroll in course');
    }

    return response.json();
  },

  /**
   * Get user's enrolled courses
   * @param {string} userId - User ID
   * @param {string} token - Auth token
   * @returns {Promise<Array>} - List of enrolled courses
   */
  async getEnrolledCourses(userId, token) {
    const response = await fetch(`${API_BASE_URL}/users/${userId}/courses`, {
      method: 'GET',
      headers: getAuthHeaders(token),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch enrolled courses');
    }

    return response.json();
  },

  /**
   * Update course progress
   * @param {string} courseId - Course ID
   * @param {number} progress - Progress percentage (0-100)
   * @param {string} token - Auth token
   * @returns {Promise<Object>} - Updated progress
   */
  async updateProgress(courseId, progress, token) {
    const response = await fetch(`${API_BASE_URL}/courses/${courseId}/progress`, {
      method: 'PUT',
      headers: getAuthHeaders(token),
      body: JSON.stringify({ progress }),
    });

    if (!response.ok) {
      throw new Error('Failed to update progress');
    }

    return response.json();
  },

  /**
   * Add course (Admin only)
   * @param {Object} courseData - Course details
   * @param {string} token - Auth token
   * @returns {Promise<Object>} - Created course
   */
  async addCourse(courseData, token) {
    const response = await fetch(`${API_BASE_URL}/courses`, {
      method: 'POST',
      headers: getAuthHeaders(token),
      body: JSON.stringify(courseData),
    });

    if (!response.ok) {
      throw new Error('Failed to add course');
    }

    return response.json();
  },
};
