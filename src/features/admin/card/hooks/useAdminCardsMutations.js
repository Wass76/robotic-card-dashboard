/**
 * React Query mutation hooks for card operations
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createCardForUser, updateCard, deleteCard } from '../api';
import { adminCardsKeys } from '../api';

/**
 * Hook to create a card for a user
 * @returns {Object} Mutation object
 */
export const useCreateCardForUserMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, payload }) => createCardForUser(userId, payload),
    onSuccess: () => {
      // Invalidate cards list to refetch
      queryClient.invalidateQueries({ queryKey: adminCardsKeys.all });
    },
  });
};

/**
 * Hook to update a card
 * @returns {Object} Mutation object
 */
export const useUpdateCardMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ cardId, payload }) => updateCard(cardId, payload),
    onSuccess: (data, variables) => {
      // Invalidate both list and specific card detail
      queryClient.invalidateQueries({ queryKey: adminCardsKeys.all });
      queryClient.invalidateQueries({ queryKey: adminCardsKeys.detail(variables.cardId) });
    },
  });
};

/**
 * Hook to delete a card
 * @returns {Object} Mutation object
 */
export const useDeleteCardMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteCard,
    onSuccess: () => {
      // Invalidate cards list to refetch
      queryClient.invalidateQueries({ queryKey: adminCardsKeys.all });
    },
  });
};
