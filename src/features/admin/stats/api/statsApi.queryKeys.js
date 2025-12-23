/**
 * Query Keys for Admin Stats
 * 
 * Centralized query key factory for consistent cache management
 */

export const adminStatsKeys = {
  /**
   * Base key for all stats queries
   */
  all: ['admin', 'stats'],

  /**
   * Key for general stats query
   */
  stats: () => [...adminStatsKeys.all, 'general'],
};
