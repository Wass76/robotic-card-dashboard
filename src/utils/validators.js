// Email validation
export const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

// Phone validation (10 digits, Arabic format)
export const validatePhone = (phone) => {
  return /^[0-9]{10}$/.test(phone);
};

// Password validation (min 6 characters)
export const validatePassword = (password) => {
  return password && password.length >= 6;
};

// Required field validation
export const validateRequired = (value) => {
  return value !== null && value !== undefined && value !== '';
};

// Card ID validation
export const validateCardId = (cardId) => {
  return cardId && cardId.length > 0;
};

/**
 * Validate Arabic name (allows Arabic characters, spaces, and common punctuation)
 */
export const validateArabicName = (name) => {
  if (!name || typeof name !== 'string') return false;
  // Arabic Unicode range: \u0600-\u06FF
  const arabicPattern = /^[\u0600-\u06FF\s\-'.]+$/;
  return arabicPattern.test(name.trim());
};

/**
 * Validate English name (allows English characters, spaces, and common punctuation)
 */
export const validateEnglishName = (name) => {
  if (!name || typeof name !== 'string') return false;
  const englishPattern = /^[a-zA-Z\s\-'.]+$/;
  return englishPattern.test(name.trim());
};

/**
 * Validate name (supports both Arabic and English)
 */
export const validateName = (name) => {
  return validateArabicName(name) || validateEnglishName(name);
};

/**
 * Validate phone number with multiple formats
 * Supports: 10 digits, +963 format, 0-prefixed
 */
export const validatePhoneAdvanced = (phone) => {
  if (!phone || typeof phone !== 'string') return false;
  
  // Remove spaces, dashes, and parentheses
  const cleaned = phone.replace(/[\s\-()]/g, '');
  
  // Check for 10 digits (0987654321)
  if (/^0\d{9}$/.test(cleaned)) return true;
  
  // Check for +963 format (+963987654321)
  if (/^\+963\d{9}$/.test(cleaned)) return true;
  
  // Check for 963 prefix (963987654321)
  if (/^963\d{9}$/.test(cleaned)) return true;
  
  // Check for 10 digits without prefix
  if (/^\d{10}$/.test(cleaned)) return true;
  
  return false;
};

/**
 * Validate password strength
 * Requirements: min 6 chars, at least one letter and one number
 */
export const validatePasswordStrength = (password) => {
  if (!password || password.length < 6) return false;
  
  const hasLetter = /[a-zA-Z\u0600-\u06FF]/.test(password);
  const hasNumber = /\d/.test(password);
  
  return hasLetter && hasNumber;
};

/**
 * Validate card ID format
 * Supports alphanumeric, typically 4-20 characters
 */
export const validateCardIdFormat = (cardId) => {
  if (!cardId || typeof cardId !== 'string') return false;
  const trimmed = cardId.trim();
  return trimmed.length >= 4 && trimmed.length <= 20 && /^[a-zA-Z0-9]+$/.test(trimmed);
};

/**
 * Validate date format (YYYY-MM-DD)
 */
export const validateDateFormat = (date) => {
  if (!date || typeof date !== 'string') return false;
  const datePattern = /^\d{4}-\d{2}-\d{2}$/;
  if (!datePattern.test(date)) return false;
  
  const dateObj = new Date(date);
  return dateObj instanceof Date && !isNaN(dateObj);
};

/**
 * Validate date is not in the future
 */
export const validateDateNotFuture = (date) => {
  if (!date) return true; // Optional field
  const dateObj = new Date(date);
  return dateObj <= new Date();
};

/**
 * Validate date is not too old (e.g., not more than 100 years ago)
 */
export const validateDateNotTooOld = (date, maxYears = 100) => {
  if (!date) return true; // Optional field
  const dateObj = new Date(date);
  const minDate = new Date();
  minDate.setFullYear(minDate.getFullYear() - maxYears);
  return dateObj >= minDate;
};

/**
 * Validate role (must be Admin or User)
 */
export const validateRole = (role) => {
  return role === 'Admin' || role === 'User';
};

/**
 * Validate status (must be active or inactive)
 */
export const validateStatus = (status) => {
  return status === 'active' || status === 'inactive';
};

/**
 * Validate URL format
 */
export const validateUrl = (url) => {
  if (!url || typeof url !== 'string') return false;
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

/**
 * Validate positive number
 */
export const validatePositiveNumber = (value) => {
  const num = Number(value);
  return !isNaN(num) && num > 0;
};

/**
 * Validate non-negative number
 */
export const validateNonNegativeNumber = (value) => {
  const num = Number(value);
  return !isNaN(num) && num >= 0;
};

/**
 * Validate integer
 */
export const validateInteger = (value) => {
  const num = Number(value);
  return !isNaN(num) && Number.isInteger(num);
};

// Complete form validation
export const validateForm = (formData, schema) => {
  const errors = {};
  
  for (const field in schema) {
    const rules = schema[field];
    
    // Required check
    if (rules.required && !validateRequired(formData[field])) {
      errors[field] = rules.requiredMessage || `${field} is required`;
      continue;
    }
    
    // Skip other validations if field is empty and not required
    if (!formData[field] && !rules.required) {
      continue;
    }
    
    // Email validation
    if (rules.email && !validateEmail(formData[field])) {
      errors[field] = rules.emailMessage || 'Invalid email format';
    }
    
    // Phone validation
    if (rules.phone && !validatePhone(formData[field])) {
      errors[field] = rules.phoneMessage || 'Invalid phone number';
    }
    
    // Password validation
    if (rules.password && !validatePassword(formData[field])) {
      errors[field] = rules.passwordMessage || 'Password must be at least 6 characters';
    }
    
    // Min length
    if (rules.minLength && formData[field].length < rules.minLength) {
      errors[field] = rules.minLengthMessage || `Must be at least ${rules.minLength} characters`;
    }
    
    // Max length
    if (rules.maxLength && formData[field].length > rules.maxLength) {
      errors[field] = rules.maxLengthMessage || `Must be at most ${rules.maxLength} characters`;
    }
    
    // Custom validator
    if (rules.validator && typeof rules.validator === 'function') {
      const customError = rules.validator(formData[field], formData);
      if (customError) {
        errors[field] = customError;
      }
    }
  }
  
  return { isValid: Object.keys(errors).length === 0, errors };
};

