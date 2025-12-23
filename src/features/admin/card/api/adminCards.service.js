/**
 * Admin Card Operations API Service
 * 
 * Handles all API calls related to card management (admin operations)
 * Uses the base API client from services/api.js
 */

import { api } from '../../../../services/api';
import { API_ENDPOINTS } from '../../../../constants';

/**
 * Create a card for a user
 * @param {number|string} userId - User ID
 * @param {CardPayload} payload - Card data
 * @returns {Promise<Card>} Created card
 */
export const createCardForUser = async (userId, payload) => {
  return api.post(API_ENDPOINTS.CARD_FOR_USER(userId), payload);
};

/**
 * Get all cards
 * @returns {Promise<Card[]>} Array of cards
 */
export const getCards = async () => {
  return api.get(API_ENDPOINTS.CARDS);
};

/**
 * Get card by ID
 * @param {number|string} cardId - Card ID
 * @returns {Promise<Card>} Card data
 */
export const getCardById = async (cardId) => {
  return api.get(API_ENDPOINTS.CARD_BY_ID(cardId));
};

/**
 * Update card
 * @param {number|string} cardId - Card ID
 * @param {CardPayload} payload - Updated card data
 * @returns {Promise<Card>} Updated card
 */
export const updateCard = async (cardId, payload) => {
  return api.put(API_ENDPOINTS.CARD_BY_ID(cardId), payload);
};

/**
 * Delete card
 * @param {number|string} cardId - Card ID
 * @returns {Promise<Object>} Delete response
 */
export const deleteCard = async (cardId) => {
  return api.delete(API_ENDPOINTS.CARD_BY_ID(cardId));
};
