/**
 * React Query hook for fetching statistics
 * 
 * Note: Stats might be computed from multiple endpoints
 * rather than fetched from a single endpoint
 */

import { useQuery } from '@tanstack/react-query';
import { useUsersQuery } from '../../user-operations/hooks';
import { useCardsQuery } from '../../card/hooks';
import { useAttendanceQuery } from '../../attendance/hooks';
import { useMonthlyAttendanceQuery } from '../../../user/hooks';
import { adminStatsKeys } from '../api';

/**
 * Hook to fetch/compute statistics
 * @param {Object} options - React Query options
 * @returns {Object} Query result with computed stats
 */
export const useStatsQuery = (options = {}) => {
  const { data: users, isLoading: usersLoading, error: usersError } = useUsersQuery();
  const { data: cards, isLoading: cardsLoading, error: cardsError } = useCardsQuery();
  const { data: attendance, isLoading: attendanceLoading, error: attendanceError } = useAttendanceQuery();
  // Make monthly attendance optional - if endpoint doesn't exist (404), it will fail gracefully
  const { data: monthlyAttendance, isLoading: monthlyLoading, error: monthlyError } = useMonthlyAttendanceQuery({
    retry: false,
    // Don't retry on 404 - endpoint might not exist
    retryOnMount: false,
  });

  const isLoading = usersLoading || cardsLoading || attendanceLoading;
  // Don't treat monthly attendance 404 as a critical error (endpoint might not exist)
  // Only treat it as error if it's not a 404
  const monthlyIsError = monthlyError && monthlyError?.status !== 404 && monthlyError?.response?.status !== 404;
  const hasError = usersError || cardsError || attendanceError || monthlyIsError;

  // Ensure data is always an array, even if API returns null/undefined or different structure
  // Handle cases where data might be wrapped, null, undefined, or not an array
  const safeArray = (data) => {
    if (!data) return [];
    if (Array.isArray(data)) return data;
    if (data && typeof data === 'object' && Array.isArray(data.data)) return data.data;
    if (data && typeof data === 'object' && Array.isArray(data.items)) return data.items;
    // If data is a single object, wrap it in an array (shouldn't happen but be safe)
    if (data && typeof data === 'object' && !Array.isArray(data)) return [];
    return [];
  };

  const usersArray = safeArray(users);
  const cardsArray = safeArray(cards);
  const attendanceArray = safeArray(attendance);

  // Compute stats from the data
  const stats = {
    totalUsers: usersArray.length,
    activeUsers: usersArray.filter((u) => u?.status === 'active').length,
    totalCards: cardsArray.length,
    todayAttendance: attendanceArray.filter((a) => {
      if (!a?.timestamp) return false;
      try {
        const recordDate = new Date(a.timestamp);
        const today = new Date();
        return (
          recordDate.getDate() === today.getDate() &&
          recordDate.getMonth() === today.getMonth() &&
          recordDate.getFullYear() === today.getFullYear()
        );
      } catch {
        return false;
      }
    }).length,
    monthlyAttendance: monthlyAttendance?.total || (typeof monthlyAttendance === 'number' ? monthlyAttendance : attendanceArray.length),
    systemStatus: 'online',
    lastSync: new Date().toISOString(),
  };

  return {
    data: stats,
    isLoading,
    error: hasError || null,
    isError: !!hasError,
    isSuccess: !isLoading && !hasError,
  };
};
