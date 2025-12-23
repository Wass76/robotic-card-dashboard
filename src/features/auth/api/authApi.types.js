/**
 * JSDoc Type Definitions for Auth
 */

/**
 * @typedef {Object} LoginPayload
 * @property {string} email
 * @property {string} password
 */

/**
 * @typedef {Object} LoginResponse
 * @property {string} [token]
 * @property {Object} [authorisation]
 * @property {string} [authorisation.token]
 * @property {string} [access_token]
 * @property {Object} [data]
 * @property {string} [data.token]
 * @property {Object} [user]
 * @property {Object} [data] - User data
 */

/**
 * @typedef {Object} Profile
 * @property {number} id
 * @property {string} first_name
 * @property {string} last_name
 * @property {string} email
 * @property {string} role
 */

/**
 * @typedef {Profile} ProfileResponse
 */
