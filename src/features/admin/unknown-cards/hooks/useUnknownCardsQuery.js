/**
 * React Query hook for fetching unknown cards
 */

import { useQuery } from '@tanstack/react-query';
import { getUnknownCards, unknownCardsKeys } from '../api';

/**
 * Hook to fetch unknown card codes
 * @param {Object} options - React Query options
 * @returns {Object} Query result
 */
export const useUnknownCardsQuery = (options = {}) => {
  return useQuery({
    queryKey: unknownCardsKeys.list(),
    queryFn: getUnknownCards,
    ...options,
  });
};

