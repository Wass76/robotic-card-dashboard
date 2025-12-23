/**
 * JSDoc Type Definitions for Admin Card Operations
 */

/**
 * @typedef {Object} CardPayload
 * @property {string} code - Card code (e.g., "111", "666")
 */

/**
 * @typedef {Object} Card
 * @property {number} id
 * @property {string} card_id - Card identifier
 * @property {string} code - Card code
 * @property {number} user_id - Associated user ID
 * @property {string} [status] - 'active' | 'inactive'
 */

/**
 * @typedef {Card|Card[]} CardResponse
 */
