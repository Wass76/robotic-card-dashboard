import { z } from 'zod';

/**
 * Safely validate API response with zod schema
 * @param {any} data - Data to validate
 * @param {z.ZodSchema} schema - Zod schema to validate against
 * @param {boolean} strict - If true, throw on validation error. If false, return original data.
 * @returns {any} - Validated data or original data if validation fails and strict is false
 */
export const validateApiResponse = (data, schema, strict = false) => {
  try {
    return schema.parse(data);
  } catch (error) {
    if (strict) {
      throw new Error(`API response validation failed: ${error.message}`);
    }
    // In non-strict mode, log warning and return original data
    if (process.env.NODE_ENV !== 'production') {
      console.warn('API response validation warning:', error.message, data);
    }
    return data;
  }
};

/**
 * Safe parse with fallback
 */
export const safeParse = (data, schema) => {
  const result = schema.safeParse(data);
  if (result.success) {
    return result.data;
  }
  return data;
};



