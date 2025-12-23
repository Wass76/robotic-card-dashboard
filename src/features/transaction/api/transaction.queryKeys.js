/**
 * Query Keys for Transaction
 * 
 * Centralized query key factory for consistent cache management
 */

export const transactionKeys = {
  /**
   * Base key for all transaction queries
   */
  all: ['transaction'],

  /**
   * Key for transaction by code
   * @param {string} code - Card code
   */
  byCode: (code) => [...transactionKeys.all, code],
};
