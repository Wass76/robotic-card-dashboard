/**
 * All Users Attendance API Service
 * 
 * Handles API calls for all users attendance records (paginated)
 * Uses the base API client from services/api.js
 * 
 * This endpoint returns paginated attendance records for all users
 */

import { api } from '../../../../services/api';
import { API_ENDPOINTS } from '../../../../constants';

/**
 * Get all users attendance records with pagination
 * @param {Object} params - Query parameters
 * @param {number} [params.per_page=10] - Number of records per page
 * @param {number} [params.page=1] - Page number
 * @returns {Promise<PaginatedAllUsersAttendance>} Paginated attendance records
 * 
 * Headers are automatically added by apiClient:
 * - Content-Type: text/plain (for GET requests)
 * - Authorization: Bearer <token> (if token exists)
 */
export const getAllUsersAttendanceRecords = async (params = {}) => {
  const { per_page = 10, page = 1 } = params;
  
  // Build query string
  const queryParams = new URLSearchParams();
  if (per_page) queryParams.append('per_page', per_page.toString());
  if (page) queryParams.append('page', page.toString());
  
  const queryString = queryParams.toString();
  const endpoint = queryString 
    ? `${API_ENDPOINTS.ATTENDANCE_FOR_ALL_USERS}?${queryString}`
    : API_ENDPOINTS.ATTENDANCE_FOR_ALL_USERS;
  
  return api.get(endpoint);
};

