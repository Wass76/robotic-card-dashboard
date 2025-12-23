/**
 * React Query mutation hooks for user operations
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createUser, updateUser, deleteUser } from '../api';
import { adminUsersKeys } from '../api';

/**
 * Hook to create a new user
 * @returns {Object} Mutation object
 */
export const useCreateUserMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createUser,
    onSuccess: () => {
      // Invalidate users list to refetch
      queryClient.invalidateQueries({ queryKey: adminUsersKeys.all });
    },
  });
};

/**
 * Hook to update a user
 * @returns {Object} Mutation object
 */
export const useUpdateUserMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }) => updateUser(id, payload),
    onSuccess: (data, variables) => {
      // Invalidate both list and specific user detail
      queryClient.invalidateQueries({ queryKey: adminUsersKeys.all });
      queryClient.invalidateQueries({ queryKey: adminUsersKeys.detail(variables.id) });
    },
  });
};

/**
 * Hook to delete a user
 * @returns {Object} Mutation object
 */
export const useDeleteUserMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteUser,
    onSuccess: () => {
      // Invalidate users list to refetch
      queryClient.invalidateQueries({ queryKey: adminUsersKeys.all });
    },
  });
};
