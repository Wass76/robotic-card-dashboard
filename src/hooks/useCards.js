import { useState, useCallback } from 'react';
import * as api from '../services/api';
import { useApp } from '../context/AppContext';

export const useCards = () => {
  const { cards, setCards, fetchCards, refreshData } = useApp();
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState(null);

  const createCard = useCallback(async (userId, cardData) => {
    try {
      setActionLoading(true);
      setActionError(null);
      
      const newCard = await api.createCardForUser(userId, cardData);
      setCards(prev => [...prev, newCard]);
      
      await refreshData();
      
      return newCard;
    } catch (err) {
      const errorMessage = err.message || 'فشل في إضافة البطاقة';
      setActionError(errorMessage);
      throw err;
    } finally {
      setActionLoading(false);
    }
  }, [setCards, refreshData]);

  const updateCard = useCallback(async (cardId, cardData) => {
    try {
      setActionLoading(true);
      setActionError(null);
      
      const updatedCard = await api.updateCard(cardId, cardData);
      setCards(prev => prev.map(card => 
        card.id === cardId ? updatedCard : card
      ));
      
      await refreshData();
      
      return updatedCard;
    } catch (err) {
      const errorMessage = err.message || 'فشل في تحديث البطاقة';
      setActionError(errorMessage);
      throw err;
    } finally {
      setActionLoading(false);
    }
  }, [setCards, refreshData]);

  const deleteCard = useCallback(async (cardId) => {
    try {
      setActionLoading(true);
      setActionError(null);
      
      await api.deleteCard(cardId);
      setCards(prev => prev.filter(card => card.id !== cardId));
      
      await refreshData();
    } catch (err) {
      const errorMessage = err.message || 'فشل في حذف البطاقة';
      setActionError(errorMessage);
      throw err;
    } finally {
      setActionLoading(false);
    }
  }, [setCards, refreshData]);

  const getCardById = useCallback((cardId) => {
    return cards.find(card => card.id === cardId);
  }, [cards]);

  const getCardByUserId = useCallback((userId) => {
    return cards.find(card => card.user_id === userId);
  }, [cards]);

  const refreshCards = useCallback(async () => {
    await fetchCards();
  }, [fetchCards]);

  return {
    cards,
    loading: actionLoading,
    error: actionError,
    createCard,
    updateCard,
    deleteCard,
    getCardById,
    getCardByUserId,
    refreshCards,
  };
};

