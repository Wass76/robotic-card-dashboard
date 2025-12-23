/**
 * React Query hooks for auth operations
 */

import { useQuery } from '@tanstack/react-query';
import { getProfile } from '../api';
import { authKeys } from '../api';

/**
 * Hook to fetch user profile
 * Note: This may duplicate user module's useProfileQuery
 * Consider using user module's hook instead if available
 * @param {Object} options - React Query options
 * @returns {Object} Query result
 */
export const useProfileQuery = (options = {}) => {
  return useQuery({
    queryKey: authKeys.profile(),
    queryFn: getProfile,
    ...options,
  });
};
