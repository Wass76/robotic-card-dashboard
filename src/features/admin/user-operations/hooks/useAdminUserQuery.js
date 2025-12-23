/**
 * React Query hook for fetching a single user by ID
 */

import { useQuery } from '@tanstack/react-query';
import { getUserById } from '../api';
import { adminUsersKeys } from '../api';

/**
 * Hook to fetch a single user by ID
 * @param {number|string} userId - User ID
 * @param {Object} options - React Query options
 * @returns {Object} Query result
 */
export const useUserQuery = (userId, options = {}) => {
  return useQuery({
    queryKey: adminUsersKeys.detail(userId),
    queryFn: () => getUserById(userId),
    enabled: !!userId,
    ...options,
  });
};
