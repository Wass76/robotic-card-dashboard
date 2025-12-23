/**
 * Query Keys for Admin Attendance By User
 * 
 * Centralized query key factory for consistent cache management
 */

export const adminAttendanceByUserKeys = {
  /**
   * Base key for all attendance-by-user queries
   */
  all: ['admin', 'attendance-records-by-user'],

  /**
   * Key for attendance records by user ID
   * @param {number|string} userId - User ID
   */
  byUserId: (userId) => [...adminAttendanceByUserKeys.all, userId],
};
