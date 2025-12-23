/**
 * User Module API Service
 * 
 * Handles all API calls related to user-scoped operations
 * (profile, attendance records, monthly attendance, logout)
 * Uses the base API client from services/api.js
 */

import { api } from '../../../services/api';
import { API_ENDPOINTS } from '../../../constants';

/**
 * Get user profile
 * @returns {Promise<Profile>} User profile data
 */
export const getProfile = async () => {
  return api.get(API_ENDPOINTS.PROFILE);
};

/**
 * Get all attendance records
 * @returns {Promise<AttendanceRecord[]>} Array of attendance records
 */
export const getAttendanceRecords = async () => {
  return api.get(API_ENDPOINTS.ATTENDANCE);
};

/**
 * Get monthly attendance
 * @returns {Promise<MonthlyAttendanceResponse>} Monthly attendance data
 */
export const getMonthlyAttendance = async () => {
  return api.get(API_ENDPOINTS.MONTHLY_ATTENDANCE);
};

/**
 * Logout from app
 * @returns {Promise<Object>} Logout response
 */
export const logoutFromApp = async () => {
  return api.post(API_ENDPOINTS.LOGOUT);
};

/**
 * Logout from club
 * @returns {Promise<Object>} Logout response
 */
export const logoutFromClub = async () => {
  return api.post(API_ENDPOINTS.LOGOUT_FROM_CLUB);
};
