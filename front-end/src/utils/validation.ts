// Form validation utilities

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

export const validateEmail = (email: string): string | null => {
  if (!email) return 'Email is required';
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) return 'Please enter a valid email address';
  return null;
};

export const validatePassword = (password: string): string | null => {
  if (!password) return 'Password is required';
  if (password.length < 8) return 'Password must be at least 8 characters';
  if (!/[A-Z]/.test(password)) return 'Password must contain at least one uppercase letter';
  if (!/[a-z]/.test(password)) return 'Password must contain at least one lowercase letter';
  if (!/[0-9]/.test(password)) return 'Password must contain at least one number';
  return null;
};

export const validateName = (name: string): string | null => {
  if (!name) return 'Name is required';
  if (name.length < 2) return 'Name must be at least 2 characters';
  if (name.length > 100) return 'Name must not exceed 100 characters';
  return null;
};

export const validateRequired = (value: string, fieldName: string): string | null => {
  if (!value || value.trim() === '') return `${fieldName} is required`;
  return null;
};

export const validateScore = (score: number): string | null => {
  if (score < 0 || score > 100) return 'Score must be between 0 and 100';
  return null;
};

export const validateRating = (rating: number): string | null => {
  if (rating < 0 || rating > 5) return 'Rating must be between 0 and 5';
  return null;
};

export const validateRole = (role: string): string | null => {
  const allowedRoles = ['user', 'jobseeker', 'recruiter'];
  if (!allowedRoles.includes(role.toLowerCase())) {
    return 'Invalid role selection. Please choose User or Recruiter';
  }
  return null;
};

export const validateJobStatus = (status: string): string | null => {
  const allowedStatuses = ['active', 'under review', 'closed', 'pending'];
  if (!allowedStatuses.includes(status.toLowerCase())) {
    return 'Invalid job status';
  }
  return null;
};

export const validateTextLength = (text: string, minLength: number, maxLength: number, fieldName: string): string | null => {
  if (text.length < minLength) return `${fieldName} must be at least ${minLength} characters`;
  if (text.length > maxLength) return `${fieldName} must not exceed ${maxLength} characters`;
  return null;
};
