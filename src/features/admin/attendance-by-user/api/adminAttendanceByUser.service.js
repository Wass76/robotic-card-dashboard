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
  const response = await api.get(API_ENDPOINTS.USER_ATTENDANCE(userId));
  
  // Handle API response structure: { user_id: "...", "Entry records For this user ": [...] }
  // Note: The key has a trailing space
  if (response && typeof response === 'object') {
    // Try both with and without trailing space
    const recordsKey = 'Entry records For this user ';
    const recordsKeyNoSpace = 'Entry records For this user';
    
    if (recordsKey in response && Array.isArray(response[recordsKey])) {
      return response[recordsKey];
    }
    if (recordsKeyNoSpace in response && Array.isArray(response[recordsKeyNoSpace])) {
      return response[recordsKeyNoSpace];
    }
  }
  
  // Fallback: if response is already an array, return it
  return Array.isArray(response) ? response : [];
};
