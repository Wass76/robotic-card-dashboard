import { useState, useCallback } from 'react';
import * as api from '../services/api';
import { useApp } from '../context/AppContext';

export const useUsers = () => {
  const { users, setUsers, fetchUsers, refreshData } = useApp();
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState(null);

  const createUser = useCallback(async (userData) => {
    try {
      setActionLoading(true);
      setActionError(null);
      
      const newUser = await api.createUser(userData);
      setUsers(prev => [...prev, newUser]);
      
      // Refresh data to update stats
      await refreshData();
      
      return newUser;
    } catch (err) {
      const errorMessage = err.message || 'فشل في إضافة المستخدم';
      setActionError(errorMessage);
      throw err;
    } finally {
      setActionLoading(false);
    }
  }, [setUsers, refreshData]);

  const updateUser = useCallback(async (userId, userData) => {
    try {
      setActionLoading(true);
      setActionError(null);
      
      // Call API - note: backend returns old data, so we'll use form data
      await api.updateUser(userId, userData);
      
      // Update state using the submitted form data (not API response)
      // Normalize the user data to match the expected format
      const updatedUser = {
        id: userId,
        first_name: userData.first_name,
        last_name: userData.last_name,
        firstName: userData.first_name, // Keep both formats
        lastName: userData.last_name,
        Phone: userData.Phone,
        phone: userData.Phone,
        email: userData.email,
        role: userData.role,
        // Preserve other fields from existing user
        ...userData,
      };
      
      setUsers(prev => prev.map(user => 
        user.id === userId ? updatedUser : user
      ));
      
      // Refresh data to update stats
      await refreshData();
      
      return updatedUser;
    } catch (err) {
      const errorMessage = err.message || 'فشل في تحديث المستخدم';
      setActionError(errorMessage);
      throw err;
    } finally {
      setActionLoading(false);
    }
  }, [setUsers, refreshData]);

  const deleteUser = useCallback(async (userId) => {
    try {
      setActionLoading(true);
      setActionError(null);
      
      await api.deleteUser(userId);
      setUsers(prev => prev.filter(user => user.id !== userId));
      
      // Refresh data to update stats
      await refreshData();
    } catch (err) {
      const errorMessage = err.message || 'فشل في حذف المستخدم';
      setActionError(errorMessage);
      throw err;
    } finally {
      setActionLoading(false);
    }
  }, [setUsers, refreshData]);

  const getUserById = useCallback((userId) => {
    return users.find(user => user.id === userId);
  }, [users]);

  const refreshUsers = useCallback(async () => {
    await fetchUsers();
  }, [fetchUsers]);

  return {
    users,
    loading: actionLoading,
    error: actionError,
    createUser,
    updateUser,
    deleteUser,
    getUserById,
    refreshUsers,
  };
};

