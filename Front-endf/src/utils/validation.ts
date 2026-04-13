export function validateEmail(email: string): string | null {
  if (!email) {
    return 'Email is required';
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return 'Please enter a valid email address';
  }
  
  return null;
}

export function validatePassword(password: string): string | null {
  if (!password) {
    return 'Password is required';
  }
  
  if (password.length < 8) {
    return 'Password must be at least 8 characters';
  }
  
  if (!/[A-Z]/.test(password)) {
    return 'Password must contain at least one uppercase letter';
  }
  
  if (!/[a-z]/.test(password)) {
    return 'Password must contain at least one lowercase letter';
  }
  
  if (!/[0-9]/.test(password)) {
    return 'Password must contain at least one number';
  }
  
  return null;
}

export function validateName(name: string): string | null {
  if (!name || name.trim().length === 0) {
    return 'Name is required';
  }
  
  if (name.trim().length < 2) {
    return 'Name must be at least 2 characters';
  }
  
  return null;
}

export function validateRequired(value: string, fieldName: string = 'Field'): string | null {
  if (!value || value.trim().length === 0) {
    return `${fieldName} is required`;
  }
  
  return null;
}

export function validateTextLength(
  value: string,
  minLength: number,
  maxLength?: number,
  fieldName: string = 'Field'
): string | null {
  if (!value || value.trim().length === 0) {
    return `${fieldName} is required`;
  }
  
  if (value.trim().length < minLength) {
    return `${fieldName} must be at least ${minLength} characters`;
  }
  
  if (maxLength && value.trim().length > maxLength) {
    return `${fieldName} must be no more than ${maxLength} characters`;
  }
  
  return null;
}