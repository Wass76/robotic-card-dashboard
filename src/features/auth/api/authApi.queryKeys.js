/**
 * Query Keys for Auth
 * 
 * Centralized query key factory for consistent cache management
 */

export const authKeys = {
  /**
   * Base key for all auth queries
   */
  all: ['auth'],

  /**
   * Key for profile query
   */
  profile: () => [...authKeys.all, 'profile'],
};
