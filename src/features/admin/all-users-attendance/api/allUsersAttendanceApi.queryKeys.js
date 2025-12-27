/**
 * Query Keys for All Users Attendance
 * 
 * Centralized query key factory for consistent cache management
 */

export const allUsersAttendanceKeys = {
  /**
   * Base key for all users attendance queries
   */
  all: ['admin', 'allUsersAttendance'],

  /**
   * Key for all users attendance records list
   * @param {Object} params - Query parameters (e.g., { per_page: 10, page: 1 })
   */
  records: (params) => [...allUsersAttendanceKeys.all, 'records', params],

  /**
   * Key for all users attendance records list (default)
   */
  recordsList: () => [...allUsersAttendanceKeys.all, 'records'],
};

