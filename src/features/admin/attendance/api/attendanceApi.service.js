/**
 * Admin Attendance API Service
 * 
 * Handles API calls for attendance records (all records)
 * Uses the base API client from services/api.js
 * 
 * Note: This is for getting all attendance records (admin view)
 * For user-specific attendance, see admin/attendance-by-user
 */

import { api } from '../../../../services/api';
import { API_ENDPOINTS } from '../../../../constants';

/**
 * Get all attendance records
 * @returns {Promise<AttendanceRecord[]>} Array of attendance records
 * 
 * Headers are automatically added by apiClient:
 * - Content-Type: text/plain (for GET requests)
 * - Authorization: Bearer <token> (if token exists)
 * 
 * To add custom headers, you can pass them as options:
 * return api.get(API_ENDPOINTS.ATTENDANCE, {
 *   headers: {
 *     'Custom-Header': 'value'
 *   }
 * });
 */
export const getAttendanceRecords = async () => {
  return api.get(API_ENDPOINTS.ATTENDANCE);
};
