/**
 * React Query hook for fetching all users attendance records
 */

import { useQuery } from '@tanstack/react-query';
import { getAllUsersAttendanceRecords, allUsersAttendanceKeys } from '../api';

/**
 * Hook to fetch all users attendance records with pagination
 * @param {Object} params - Query parameters
 * @param {number} [params.per_page=10] - Number of records per page
 * @param {number} [params.page=1] - Page number
 * @param {Object} options - React Query options
 * @returns {Object} Query result
 */
export const useAllUsersAttendanceQuery = (params = {}, options = {}) => {
  return useQuery({
    queryKey: allUsersAttendanceKeys.records(params),
    queryFn: () => getAllUsersAttendanceRecords(params),
    ...options,
  });
};

