/**
 * Transaction API Service
 * 
 * Handles API calls for creating transactions
 * Uses the base API client from services/api.js
 */

import { api } from '../../../services/api';
import { API_ENDPOINTS } from '../../../constants';

/**
 * Create a transaction (scan card)
 * @param {string} code - Card code (e.g., "4CEF0905")
 * @returns {Promise<TransactionResponse>} Transaction response
 */
export const postTransaction = async (code) => {
  // No request body in Postman - implement without body
  // If backend requires empty object, change to: api.post(API_ENDPOINTS.TRANSACTION(code), {})
  return api.post(API_ENDPOINTS.TRANSACTION(code));
};
