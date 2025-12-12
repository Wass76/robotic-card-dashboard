import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import * as api from '../services/api';
import { STATIC_DATA, API_ENDPOINTS } from '../constants';
import { useAuth } from './AuthContext';
import { getErrorMessage } from '../utils/errorHandler';

const AppContext = createContext(null);

export const AppProvider = ({ children }) => {
  const { isLoggedIn } = useAuth();
  
  const [users, setUsers] = useState([]);
  const [cards, setCards] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch all data in parallel
      const [usersData, cardsData, attendanceData, monthlyAttendance] = await Promise.all([
        api.getUsers().catch(e => { 
          console.error('Error fetching users:', e); 
          return []; 
        }),
        api.getCards().catch(e => { 
          console.error('Error fetching cards:', e); 
          return []; 
        }),
        api.getAllAttendance().catch(e => { 
          console.error('Error fetching attendance:', e); 
          return []; 
        }),
        api.getMonthlyAttendance().catch(e => { 
          console.error('Error fetching monthly attendance:', e); 
          return null; 
        }),
      ]);

      setUsers(usersData || []);
      setCards(cardsData || []);
      setAttendance(attendanceData || []);

      // Calculate stats
      const today = new Date().toDateString();
      const todayAttendance = (attendanceData || []).filter(a => 
        new Date(a.timestamp).toDateString() === today
      ).length;

      setStats({
        totalUsers: (usersData || []).length,
        activeUsers: (usersData || []).filter(u => u.status === 'active').length,
        totalCards: (cardsData || []).length,
        monthlyAttendance: monthlyAttendance?.total || (attendanceData || []).length,
        todayAttendance,
        lastSync: new Date().toISOString(),
      });
    } catch (err) {
      console.error('Error fetching data:', err);
      const errorMessage = getErrorMessage(err);
      setError(errorMessage || 'فشل في تحميل البيانات');
      
      // Fallback to static data if API fails completely
      setUsers([...STATIC_DATA.users]);
      setAttendance([...STATIC_DATA.attendance]);
      setStats(STATIC_DATA.stats);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch all data when user is logged in
  useEffect(() => {
    if (isLoggedIn) {
      fetchData();
    } else {
      // Clear data when logged out
      setUsers([]);
      setCards([]);
      setAttendance([]);
      setStats(null);
    }
  }, [isLoggedIn, fetchData]);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const usersData = await api.getUsers();
      setUsers(usersData || []);
      return usersData;
    } catch (err) {
      console.error('Error fetching users:', err);
      const errorMessage = getErrorMessage(err);
      setError(errorMessage || 'فشل في تحميل المستخدمين');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchCards = useCallback(async () => {
    try {
      setLoading(true);
      const cardsData = await api.getCards();
      setCards(cardsData || []);
      return cardsData;
    } catch (err) {
      console.error('Error fetching cards:', err);
      const errorMessage = getErrorMessage(err);
      setError(errorMessage || 'فشل في تحميل البطاقات');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchAttendance = useCallback(async () => {
    try {
      setLoading(true);
      const attendanceData = await api.getAllAttendance();
      setAttendance(attendanceData || []);
      return attendanceData;
    } catch (err) {
      console.error('Error fetching attendance:', err);
      const errorMessage = getErrorMessage(err);
      setError(errorMessage || 'فشل في تحميل سجلات الحضور');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchStats = useCallback(async () => {
    try {
      const monthlyAttendance = await api.getMonthlyAttendance();
      const today = new Date().toDateString();
      const todayAttendance = attendance.filter(a => 
        new Date(a.timestamp).toDateString() === today
      ).length;

      setStats({
        totalUsers: users.length,
        activeUsers: users.filter(u => u.status === 'active').length,
        totalCards: cards.length,
        monthlyAttendance: monthlyAttendance?.total || attendance.length,
        todayAttendance,
        lastSync: new Date().toISOString(),
      });
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  }, [users, cards, attendance]);

  const refreshData = useCallback(async () => {
    await fetchData();
  }, [fetchData]);

  const value = {
    // State
    users,
    cards,
    attendance,
    stats,
    loading,
    error,
    
    // Actions
    setUsers,
    setCards,
    setAttendance,
    setStats,
    setError,
    
    // Functions
    fetchData,
    fetchUsers,
    fetchCards,
    fetchAttendance,
    fetchStats,
    refreshData,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

// eslint-disable-next-line react-refresh/only-export-components
export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
};

