/**
 * JSDoc Type Definitions for Admin User Operations
 */

/**
 * @typedef {Object} CreateUserPayload
 * @property {string} first_name
 * @property {string} last_name
 * @property {string} gender
 * @property {string} Phone - Keep capital P (do not rename)
 * @property {number} year
 * @property {string} specialization
 * @property {string} email
 * @property {string} password
 * @property {string} role - 'Admin' | 'User'
 */

/**
 * @typedef {Object} UpdateUserPayload
 * @property {string} [first_name]
 * @property {string} [last_name]
 * @property {string} [Phone] - Keep capital P (do not rename)
 * @property {string} [email]
 * @property {string} [password]
 * @property {string} [role] - 'Admin' | 'User'
 */

/**
 * @typedef {Object} User
 * @property {number} id
 * @property {string} first_name
 * @property {string} last_name
 * @property {string} gender
 * @property {string} Phone - Keep capital P
 * @property {number} year
 * @property {string} specialization
 * @property {string} email
 * @property {string} role
 * @property {string} [status] - 'active' | 'inactive'
 * @property {string} [created_at]
 * @property {string} [last_seen]
 * @property {string} [card_id]
 */

/**
 * @typedef {User|User[]} UserResponse
 */
