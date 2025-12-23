/**
 * Query Keys for User Module
 * 
 * Centralized query key factory for consistent cache management
 */

export const userKeys = {
  /**
   * Base key for all user-scoped queries
   */
  all: ['user'],

  /**
   * Key for user profile query
   */
  profile: () => [...userKeys.all, 'profile'],

  /**
   * Key for attendance records query
   */
  attendanceRecords: () => [...userKeys.all, 'attendance-records'],

  /**
   * Key for monthly attendance query
   */
  monthlyAttendance: () => [...userKeys.all, 'monthly-attendance'],
};
