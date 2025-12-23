/**
 * Query Keys for Admin User Operations
 * 
 * Centralized query key factory for consistent cache management
 */

export const adminUsersKeys = {
  /**
   * Base key for all user queries
   */
  all: ['admin', 'users'],

  /**
   * Key for user list queries
   */
  lists: () => [...adminUsersKeys.all, 'list'],

  /**
   * Key for filtered user list
   * @param {Object} filters - Filter parameters
   */
  list: (filters) => [...adminUsersKeys.lists(), { filters }],

  /**
   * Key for user detail queries
   */
  details: () => [...adminUsersKeys.all, 'detail'],

  /**
   * Key for specific user detail
   * @param {number|string} id - User ID
   */
  detail: (id) => [...adminUsersKeys.details(), id],
};
