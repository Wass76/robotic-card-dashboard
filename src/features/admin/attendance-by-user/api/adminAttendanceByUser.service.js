/**
 * Admin Attendance By User API Service
 * 
 * Handles API calls for fetching attendance records by user ID
 * Uses the base API client from services/api.js
 * 
 * IMPORTANT: Endpoint path must be exact: /api/Attendance_Records_By_UserId/{userId}
 * (with underscore and capital letters)
 */

import { api } from '../../../../services/api';
import { API_ENDPOINTS } from '../../../../constants';

/**
 * Get attendance records for a specific user
 * @param {number|string} userId - User ID
 * @returns {Promise<AttendanceRecord[]>} Array of attendance records
 */
export const getAttendanceRecordsByUserId = async (userId) => {
  // Use exact endpoint path from constants (with underscore and capitals)
  return api.get(API_ENDPOINTS.USER_ATTENDANCE(userId));
};
