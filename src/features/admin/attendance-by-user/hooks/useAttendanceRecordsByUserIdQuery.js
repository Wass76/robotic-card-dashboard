/**
 * React Query hook for fetching attendance records by user ID
 */

import { useQuery } from '@tanstack/react-query';
import { getAttendanceRecordsByUserId } from '../api';
import { adminAttendanceByUserKeys } from '../api';

/**
 * Hook to fetch attendance records for a specific user
 * @param {number|string} userId - User ID
 * @param {Object} options - React Query options
 * @returns {Object} Query result
 */
export const useAttendanceRecordsByUserIdQuery = (userId, options = {}) => {
  return useQuery({
    queryKey: adminAttendanceByUserKeys.byUserId(userId),
    queryFn: () => getAttendanceRecordsByUserId(userId),
    enabled: !!userId,
    ...options,
  });
};
