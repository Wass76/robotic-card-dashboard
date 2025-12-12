import DOMPurify from 'dompurify';

/**
 * Sanitize user input (string)
 */
export const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  
  // Remove leading/trailing whitespace
  const trimmed = input.trim();
  
  // Sanitize HTML
  return DOMPurify.sanitize(trimmed, {
    ALLOWED_TAGS: [], // No HTML tags allowed
    ALLOWED_ATTR: [],
  });
};

/**
 * Sanitize HTML content (allows safe HTML)
 */
export const sanitizeHtml = (html) => {
  if (typeof html !== 'string') return html;
  
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br'],
    ALLOWED_ATTR: ['href'],
  });
};

/**
 * Recursively sanitize object
 */
export const sanitizeObject = (obj) => {
  if (typeof obj === 'string') {
    return sanitizeInput(obj);
  }
  
  if (Array.isArray(obj)) {
    return obj.map(sanitizeObject);
  }
  
  if (obj && typeof obj === 'object') {
    const sanitized = {};
    for (const key in obj) {
      sanitized[key] = sanitizeObject(obj[key]);
    }
    return sanitized;
  }
  
  return obj;
};

/**
 * Sanitize form data before submission
 */
export const sanitizeFormData = (formData) => {
  return sanitizeObject(formData);
};

