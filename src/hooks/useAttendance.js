import { useState, useCallback } from 'react';
import * as api from '../services/api';
import { useApp } from '../context/AppContext';

export const useAttendance = () => {
  const { attendance, fetchAttendance } = useApp();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const getUserAttendance = useCallback(async (userId) => {
    try {
      setLoading(true);
      setError(null);
      
      const records = await api.getUserAttendance(userId);
      return records;
    } catch (err) {
      const errorMessage = err.message || 'فشل في تحميل سجلات الحضور';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getMonthlyAttendance = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await api.getMonthlyAttendance();
      return data;
    } catch (err) {
      const errorMessage = err.message || 'فشل في تحميل إحصائيات الحضور';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshAttendance = useCallback(async () => {
    await fetchAttendance();
  }, [fetchAttendance]);

  return {
    attendance,
    loading,
    error,
    getUserAttendance,
    getMonthlyAttendance,
    refreshAttendance,
  };
};

