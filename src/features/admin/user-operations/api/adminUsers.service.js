/**
 * Admin User Operations API Service
 * 
 * Handles all API calls related to user management (admin operations)
 * Uses the base API client from services/api.js
 */

import { api } from '../../../../services/api';
import { API_ENDPOINTS } from '../../../../constants';

/**
 * Create a new user
 * @param {CreateUserPayload} payload - User data
 * @returns {Promise<User>} Created user
 */
export const createUser = async (payload) => {
  const response = await api.post(API_ENDPOINTS.USERS, payload);
  
  // Handle nested response structure: { User: {...} }
  // The API returns: { code: 201, message: "...", data: { User: {...} } }
  // api.js unwraps to: { User: {...} }
  // We need to extract the User object
  if (response && typeof response === 'object' && response.User) {
    return response.User;
  }
  
  // Fallback: return response as-is if structure is different
  return response;
};

/**
 * Get all users
 * @returns {Promise<User[]>} Array of users
 */
export const getUsers = async () => {
  const response = await api.get(API_ENDPOINTS.USERS);
  
  // Handle nested array structure: data: [[...users...]]
  // If response is an array containing another array, flatten it
  if (Array.isArray(response) && response.length > 0 && Array.isArray(response[0])) {
    return response[0];
  }
  
  // If response is already a flat array, return as-is
  if (Array.isArray(response)) {
    return response;
  }
  
  // Fallback: return empty array if response is not in expected format
  return [];
};

/**
 * Get user by ID
 * @param {number|string} userId - User ID
 * @returns {Promise<User>} User data
 */
export const getUserById = async (userId) => {
  return api.get(API_ENDPOINTS.USER_BY_ID(userId));
};

/**
 * Update user
 * @param {number|string} userId - User ID
 * @param {UpdateUserPayload} payload - Updated user data (partial)
 * @returns {Promise<User>} Updated user
 */
export const updateUser = async (userId, payload) => {
  return api.put(API_ENDPOINTS.USER_BY_ID(userId), payload);
};

/**
 * Delete user
 * @param {number|string} userId - User ID
 * @returns {Promise<Object>} Delete response
 */
export const deleteUser = async (userId) => {
  return api.delete(API_ENDPOINTS.USER_BY_ID(userId));
};
