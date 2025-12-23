/**
 * React Query hook for fetching all attendance records
 */

import { useQuery } from '@tanstack/react-query';
import { getAttendanceRecords } from '../api';
import { adminAttendanceKeys } from '../api';

/**
 * Hook to fetch all attendance records
 * @param {Object} options - React Query options
 * @returns {Object} Query result
 */
export const useAttendanceQuery = (options = {}) => {
  return useQuery({
    queryKey: adminAttendanceKeys.records(),
    queryFn: getAttendanceRecords,
    ...options,
  });
};
