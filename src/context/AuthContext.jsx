import { createContext, useContext, useState, useEffect } from 'react';
// Keep backward compatibility - services/api.js re-exports from features/auth/api
import api from '../services/api';
import { getToken, setToken, clearToken, isTokenValid } from '../utils/tokenManager';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [token, setTokenState] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check authentication on mount
  useEffect(() => {
    checkAuth();

    // Listen for unauthorized events from API service
    const handleUnauthorized = () => {
      clearToken();
      setTokenState(null);
      setUser(null);
      setIsLoggedIn(false);
      setError('تم انتهاء صلاحية الجلسة. يرجى تسجيل الدخول مرة أخرى');
    };

    window.addEventListener('auth:unauthorized', handleUnauthorized);

    return () => {
      window.removeEventListener('auth:unauthorized', handleUnauthorized);
    };
  }, []);

  const checkAuth = async () => {
    try {
      setLoading(true);
      const storedToken = getToken();
      
      if (storedToken && isTokenValid()) {
        setTokenState(storedToken);
        // Optionally verify token with backend
        const userData = localStorage.getItem('user');
        if (userData) {
          setUser(JSON.parse(userData));
          setIsLoggedIn(true);
        }
      } else {
        clearToken();
        setIsLoggedIn(false);
        setUser(null);
      }
    } catch (err) {
      if (process.env.NODE_ENV !== 'production') {
      console.error('Auth check failed:', err);
      }
      clearToken();
      setIsLoggedIn(false);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.login(email, password);
      
      // Extract token from response
      // API response structure: { code: 200, message: "...", data: { token: "...", ... } }
      // API client now returns full response for login endpoint
      const authToken = response?.data?.token || 
                       response?.token || 
                       response?.authorisation?.token || 
                       response?.access_token;
      
      if (authToken) {
        setToken(authToken);
        setTokenState(authToken);
        
        // Extract user data from response.data (API returns user info in data object)
        // API response: data contains { id, first_name, last_name, email, role, token, ... }
        const userData = response?.data || response?.user || { email, name: 'Admin' };
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
        setIsLoggedIn(true);
        
        return { success: true, user: userData };
      } else {
        throw new Error('Token missing in response');
      }
    } catch (err) {
      const errorMessage = err.message || 'البريد الإلكتروني أو كلمة المرور غير صحيحة';
      setError(errorMessage);
      setIsLoggedIn(false);
      setUser(null);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await api.logout();
    } catch (err) {
      if (process.env.NODE_ENV !== 'production') {
      console.warn('Logout API call failed:', err);
      }
    } finally {
      clearToken();
      setTokenState(null);
      setUser(null);
      setIsLoggedIn(false);
      setError(null);
    }
  };

  const value = {
    isLoggedIn,
    user,
    token,
    loading,
    error,
    login,
    logout,
    checkAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

