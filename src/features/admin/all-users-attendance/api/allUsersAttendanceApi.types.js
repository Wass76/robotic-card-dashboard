/**
 * JSDoc Type Definitions for All Users Attendance
 */

/**
 * @typedef {Object} AllUsersAttendanceRecord
 * @property {number} user_id
 * @property {string} user_name
 * @property {string} type - 'entry' | 'ُExit'
 * @property {string} [login_date] - Date string (e.g., "December 24, 2024")
 * @property {string} [login_time] - Time string (e.g., "09:30 AM")
 * @property {string} [logout_date] - Date string (e.g., "December 24, 2024")
 * @property {string} [logout_time] - Time string (e.g., "05:30 PM")
 */

/**
 * @typedef {Object} PaginatedAllUsersAttendance
 * @property {AllUsersAttendanceRecord[]} data
 * @property {number} current_page
 * @property {number} last_page
 * @property {number} per_page
 * @property {number} total
 * @property {string} first_page_url
 * @property {string} last_page_url
 * @property {string} next_page_url
 * @property {string} prev_page_url
 */

