/**
 * React Query mutation hooks for logout operations
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { logoutFromApp, logoutFromClub } from '../api';
import { userKeys } from '../api';

/**
 * Hook to logout from app
 * @returns {Object} Mutation object
 */
export const useLogoutFromAppMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: logoutFromApp,
    onSuccess: () => {
      // Invalidate all user-scoped queries
      queryClient.invalidateQueries({ queryKey: userKeys.all });
      // Note: Actual logout logic (token clearing, navigation) is handled by AuthContext
    },
  });
};

/**
 * Hook to logout from club
 * @returns {Object} Mutation object
 */
export const useLogoutFromClubMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: logoutFromClub,
    onSuccess: () => {
      // Invalidate all user-scoped queries
      queryClient.invalidateQueries({ queryKey: userKeys.all });
      // Note: Actual logout logic (token clearing, navigation) is handled by AuthContext
    },
  });
};
