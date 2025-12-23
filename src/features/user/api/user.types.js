/**
 * JSDoc Type Definitions for User Module
 */

/**
 * @typedef {Object} Profile
 * @property {number} id
 * @property {string} first_name
 * @property {string} last_name
 * @property {string} email
 * @property {string} role
 * @property {string} [Phone]
 * @property {string} [created_at]
 */

/**
 * @typedef {Profile} ProfileResponse
 */

/**
 * @typedef {Object} AttendanceRecord
 * @property {number} id
 * @property {number} user_id
 * @property {string} user_name
 * @property {string} card_id
 * @property {string} timestamp - ISO datetime string
 * @property {string} type - 'entry' | 'exit'
 * @property {string} method - 'RFID' | 'Face Recognition'
 */

/**
 * @typedef {AttendanceRecord[]} AttendanceRecordsResponse
 */

/**
 * @typedef {Object} MonthlyAttendanceResponse
 * @property {number} total - Total attendance count for the month
 */
