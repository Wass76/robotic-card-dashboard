import * as api from '../../services/api';
import { useApi } from './useApi';

/**
 * Hook for card API operations
 */
export const useCardsApi = () => {
  const getCards = useApi(api.getCards);
  const getCardById = useApi(api.getCardById);
  const createCard = useApi(api.createCardForUser);
  const updateCard = useApi(api.updateCard);
  const deleteCard = useApi(api.deleteCard);

  return {
    getCards,
    getCardById,
    createCard,
    updateCard,
    deleteCard,
  };
};

