/**
 * React Query hook for fetching monthly attendance
 */

import { useQuery } from '@tanstack/react-query';
import { getMonthlyAttendance } from '../api';
import { userKeys } from '../api';

/**
 * Hook to fetch monthly attendance
 * @param {Object} options - React Query options
 * @returns {Object} Query result
 */
export const useMonthlyAttendanceQuery = (options = {}) => {
  return useQuery({
    queryKey: userKeys.monthlyAttendance(),
    queryFn: getMonthlyAttendance,
    ...options,
  });
};

