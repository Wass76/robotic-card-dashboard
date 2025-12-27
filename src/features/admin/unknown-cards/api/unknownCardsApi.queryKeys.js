/**
 * Query Keys for Unknown Cards
 * 
 * Centralized query key factory for consistent cache management
 */

export const unknownCardsKeys = {
  /**
   * Base key for all unknown cards queries
   */
  all: ['admin', 'unknownCards'],

  /**
   * Key for unknown cards list
   */
  list: () => [...unknownCardsKeys.all, 'list'],
};

