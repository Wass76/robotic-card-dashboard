/**
 * React Query hook for fetching a single card by ID
 */

import { useQuery } from '@tanstack/react-query';
import { getCardById } from '../api';
import { adminCardsKeys } from '../api';

/**
 * Hook to fetch a single card by ID
 * @param {number|string} cardId - Card ID
 * @param {Object} options - React Query options
 * @returns {Object} Query result
 */
export const useCardQuery = (cardId, options = {}) => {
  return useQuery({
    queryKey: adminCardsKeys.detail(cardId),
    queryFn: () => getCardById(cardId),
    enabled: !!cardId,
    ...options,
  });
};
