/**
 * Query Keys for Admin Card Operations
 * 
 * Centralized query key factory for consistent cache management
 */

export const adminCardsKeys = {
  /**
   * Base key for all card queries
   */
  all: ['admin', 'cards'],

  /**
   * Key for card list queries
   */
  lists: () => [...adminCardsKeys.all, 'list'],

  /**
   * Key for filtered card list
   * @param {Object} filters - Filter parameters
   */
  list: (filters) => [...adminCardsKeys.lists(), { filters }],

  /**
   * Key for card detail queries
   */
  details: () => [...adminCardsKeys.all, 'detail'],

  /**
   * Key for specific card detail
   * @param {number|string} id - Card ID
   */
  detail: (id) => [...adminCardsKeys.details(), id],
};
