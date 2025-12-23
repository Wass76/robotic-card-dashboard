/**
 * React Query hook for fetching attendance records
 */

import { useQuery } from '@tanstack/react-query';
import { getAttendanceRecords } from '../api';
import { userKeys } from '../api';

/**
 * Hook to fetch all attendance records
 * @param {Object} options - React Query options
 * @returns {Object} Query result
 */
export const useAttendanceRecordsQuery = (options = {}) => {
  return useQuery({
    queryKey: userKeys.attendanceRecords(),
    queryFn: getAttendanceRecords,
    ...options,
  });
};

