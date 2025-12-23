/**
 * Query Keys for Admin Attendance
 * 
 * Centralized query key factory for consistent cache management
 */

export const adminAttendanceKeys = {
  /**
   * Base key for all attendance queries
   */
  all: ['admin', 'attendance'],

  /**
   * Key for all attendance records list
   */
  records: () => [...adminAttendanceKeys.all, 'records'],
};
