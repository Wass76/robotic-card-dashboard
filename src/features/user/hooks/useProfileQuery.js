/**
 * React Query hook for fetching user profile
 */

import { useQuery } from '@tanstack/react-query';
import { getProfile } from '../api';
import { userKeys } from '../api';

/**
 * Hook to fetch user profile
 * @param {Object} options - React Query options
 * @returns {Object} Query result
 */
export const useProfileQuery = (options = {}) => {
  return useQuery({
    queryKey: userKeys.profile(),
    queryFn: getProfile,
    ...options,
  });
};

