/**
 * JSDoc Type Definitions for Admin Attendance By User
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
