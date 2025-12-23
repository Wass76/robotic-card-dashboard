/**
 * React Query hook for fetching all users
 */

import { useQuery } from '@tanstack/react-query';
import { getUsers } from '../api';
import { adminUsersKeys } from '../api';

/**
 * Hook to fetch all users
 * @param {Object} options - React Query options
 * @returns {Object} Query result
 */
export const useUsersQuery = (options = {}) => {
  return useQuery({
    queryKey: adminUsersKeys.lists(),
    queryFn: getUsers,
    ...options,
  });
};

