/**
 * React Query mutation hook for creating transactions
 */

import { useMutation } from '@tanstack/react-query';
import { postTransaction } from '../api';

/**
 * Hook to create a transaction (scan card)
 * @returns {Object} Mutation object
 */
export const usePostTransactionMutation = () => {
  return useMutation({
    mutationFn: postTransaction,
    // Note: Only invalidate if transaction-dependent queries exist
    // For now, no invalidation as there are no transaction list queries
  });
};
