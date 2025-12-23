/**
 * Auth API Service
 * 
 * Handles authentication-related API calls
 * Uses the base API client from services/api.js
 * 
 * NOTE: Login is already implemented in AuthContext using services/api.js
 * This service provides a feature-based structure for auth operations
 */

import { api } from '../../../services/api';
import { API_ENDPOINTS } from '../../../constants';

/**
 * Login function (for feature-based structure)
 * Note: AuthContext already uses services/api.js login function
 * This is provided for consistency with feature structure
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Promise<LoginResponse>} Login response with token
 */
export const login = async (email, password) => {
  return api.login(email, password);
};

/**
 * Logout function (for feature-based structure)
 * Note: AuthContext already uses services/api.js logout function
 * @returns {Promise<Object>} Logout response
 */
export const logout = async () => {
  return api.logout();
};

/**
 * Get user profile
 * @returns {Promise<Profile>} User profile data
 */
export const getProfile = async () => {
  return api.get(API_ENDPOINTS.PROFILE);
};
