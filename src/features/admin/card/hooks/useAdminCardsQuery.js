/**
 * React Query hook for fetching all cards
 */

import { useQuery } from '@tanstack/react-query';
import { getCards } from '../api';
import { adminCardsKeys } from '../api';

/**
 * Hook to fetch all cards
 * @param {Object} options - React Query options
 * @returns {Object} Query result
 */
export const useCardsQuery = (options = {}) => {
  return useQuery({
    queryKey: adminCardsKeys.lists(),
    queryFn: getCards,
    ...options,
  });
};

