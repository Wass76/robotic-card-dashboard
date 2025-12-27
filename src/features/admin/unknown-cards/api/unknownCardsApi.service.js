/**
 * Unknown Cards API Service
 * 
 * Handles API calls for unknown card scans
 * Uses the base API client from services/api.js
 */

import { api } from '../../../../services/api';
import { API_ENDPOINTS } from '../../../../constants';

/**
 * Get all unknown card codes
 * @returns {Promise<string[]>} Array of unknown card codes
 * 
 * Response structure: { code: 200, message: "...", data: { code: [...] } }
 */
export const getUnknownCards = async () => {
  const response = await api.get(API_ENDPOINTS.UNKNOWN_CARDS);
  
  // Handle API response structure: { code: [...] }
  if (response && typeof response === 'object' && 'code' in response) {
    return Array.isArray(response.code) ? response.code : [];
  }
  
  // Fallback: if response is already an array, return it
  return Array.isArray(response) ? response : [];
};

