# Phase 2: Detailed Execution Plan - State Management & Context API

## Overview
Implement centralized state management using React Context API and create custom hooks to replace scattered useState hooks throughout the application. This phase will eliminate prop drilling and create a clean, maintainable state management solution.

**Estimated Time:** 4-6 days  
**Prerequisites:** Phase 1 must be completed  
**Dependencies:** All components from Phase 1 must be extracted

---

## Step 2.1: Create AuthContext

### Task
Create a centralized authentication context to manage user authentication state, token management, and authentication operations.

### File: `src/context/AuthContext.jsx`

### Implementation Details:

**State to Manage:**
- `isLoggedIn` (boolean) - Authentication status
- `user` (object | null) - Current user data
- `token` (string | null) - Authentication token
- `loading` (boolean) - Loading state for auth operations
- `error` (string | null) - Authentication errors

**Functions to Provide:**
- `login(email, password)` - Handle user login
- `logout()` - Handle user logout
- `checkAuth()` - Check if user is authenticated on mount
- `refreshToken()` - Refresh authentication token (if needed)

**Context Structure:**
```javascript
import { createContext, useContext, useState, useEffect } from 'react';
import * as api from '../services/api';
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
      console.error('Auth check failed:', err);
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
      const authToken = response?.authorisation?.token || 
                       response?.token || 
                       response?.access_token ||
                       response?.data?.token;
      
      if (authToken) {
        setToken(authToken);
        setTokenState(authToken);
        
        const userData = response?.user || response?.data?.user || { email, name: 'Admin' };
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
      console.warn('Logout API call failed:', err);
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

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
```

### Actions:
1. Create `src/context/AuthContext.jsx` file
2. Implement AuthProvider component
3. Implement useAuth hook
4. Export both AuthProvider and useAuth
5. Test authentication flow

### Verification:
- AuthContext file exists
- AuthProvider wraps application correctly
- useAuth hook works in components
- Login/logout functionality works
- Token management integrated

---

## Step 2.2: Create AppContext

### Task
Create a centralized application context to manage global application state including users, cards, attendance, and statistics.

### File: `src/context/AppContext.jsx`

### Implementation Details:

**State to Manage:**
- `users` (array) - List of all users
- `cards` (array) - List of all cards
- `attendance` (array) - List of attendance records
- `stats` (object | null) - Dashboard statistics
- `loading` (boolean) - Loading state for data operations
- `error` (string | null) - Error messages

**Functions to Provide:**
- `fetchData()` - Fetch all initial data (users, cards, attendance, stats)
- `fetchUsers()` - Fetch users list
- `fetchCards()` - Fetch cards list
- `fetchAttendance()` - Fetch attendance records
- `fetchStats()` - Fetch dashboard statistics
- `refreshData()` - Refresh all data

**Context Structure:**
```javascript
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import * as api from '../services/api';
import { STATIC_DATA } from '../constants';
import { useAuth } from './AuthContext';

const AppContext = createContext(null);

export const AppProvider = ({ children }) => {
  const { isLoggedIn } = useAuth();
  
  const [users, setUsers] = useState([]);
  const [cards, setCards] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

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
  }, [isLoggedIn]);

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
        todayAttendance: todayAttendance,
        lastSync: new Date().toISOString(),
      });
    } catch (err) {
      console.error('Error fetching data:', err);
      setError(err.message || 'فشل في تحميل البيانات');
      
      // Fallback to static data if API fails completely
      setUsers([...STATIC_DATA.users]);
      setAttendance([...STATIC_DATA.attendance]);
      setStats(STATIC_DATA.stats);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const usersData = await api.getUsers();
      setUsers(usersData || []);
      return usersData;
    } catch (err) {
      console.error('Error fetching users:', err);
      setError(err.message || 'فشل في تحميل المستخدمين');
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
      setError(err.message || 'فشل في تحميل البطاقات');
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
      setError(err.message || 'فشل في تحميل سجلات الحضور');
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
        todayAttendance: todayAttendance,
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

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
};
```

### Actions:
1. Create `src/context/AppContext.jsx` file
2. Implement AppProvider component
3. Implement useApp hook
4. Integrate with AuthContext (check isLoggedIn)
5. Export both AppProvider and useApp
6. Test data fetching

### Verification:
- AppContext file exists
- AppProvider wraps application correctly
- useApp hook works in components
- Data fetching works on login
- Stats calculation is correct

---

## Step 2.3: Create Custom Hooks

### Task
Create specialized custom hooks for specific features to encapsulate business logic and provide clean APIs for components.

### 2.3.1: Create useAuth Hook (Wrapper)

**File:** `src/hooks/useAuth.js`

**Purpose:** Re-export useAuth from AuthContext for consistency

**Implementation:**
```javascript
export { useAuth } from '../context/AuthContext';
```

**Actions:**
1. Create `src/hooks/useAuth.js`
2. Re-export useAuth from AuthContext
3. Update imports in components to use this hook

---

### 2.3.2: Create useUsers Hook

**File:** `src/hooks/useUsers.js`

**Purpose:** Encapsulate all user-related operations (CRUD)

**State:**
- Uses users from AppContext
- Local loading state for operations
- Local error state for operations

**Functions:**
- `createUser(userData)` - Create new user
- `updateUser(userId, userData)` - Update existing user
- `deleteUser(userId)` - Delete user
- `getUserById(userId)` - Get user by ID
- `refreshUsers()` - Refresh users list

**Implementation:**
```javascript
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
      
      const updatedUser = await api.updateUser(userId, userData);
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
```

**Actions:**
1. Create `src/hooks/useUsers.js`
2. Implement all user CRUD operations
3. Integrate with AppContext
4. Test all operations

---

### 2.3.3: Create useCards Hook

**File:** `src/hooks/useCards.js`

**Purpose:** Encapsulate all card-related operations (CRUD)

**Implementation:**
```javascript
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
```

**Actions:**
1. Create `src/hooks/useCards.js`
2. Implement all card CRUD operations
3. Integrate with AppContext
4. Test all operations

---

### 2.3.4: Create useAttendance Hook

**File:** `src/hooks/useAttendance.js`

**Purpose:** Encapsulate attendance-related operations

**Implementation:**
```javascript
import { useState, useCallback } from 'react';
import * as api from '../services/api';
import { useApp } from '../context/AppContext';

export const useAttendance = () => {
  const { attendance, setAttendance, fetchAttendance } = useApp();
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
```

**Actions:**
1. Create `src/hooks/useAttendance.js`
2. Implement attendance operations
3. Integrate with AppContext
4. Test operations

---

### 2.3.5: Create useForm Hook

**File:** `src/hooks/useForm.js`

**Purpose:** Generic form state management with validation

**Implementation:**
```javascript
import { useState, useCallback } from 'react';
import { validateEmail, validatePhone, validatePassword, validateRequired } from '../utils/validators';

export const useForm = (initialValues = {}, validationSchema = {}) => {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const setValue = useCallback((name, value) => {
    setValues(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  }, [errors]);

  const setFieldTouched = useCallback((name) => {
    setTouched(prev => ({ ...prev, [name]: true }));
  }, []);

  const validateField = useCallback((name, value) => {
    const rules = validationSchema[name];
    if (!rules) return null;

    for (const rule of rules) {
      let isValid = true;
      let errorMessage = '';

      switch (rule.type) {
        case 'required':
          isValid = validateRequired(value);
          errorMessage = rule.message || 'هذا الحقل مطلوب';
          break;
        case 'email':
          isValid = validateEmail(value);
          errorMessage = rule.message || 'البريد الإلكتروني غير صحيح';
          break;
        case 'phone':
          isValid = validatePhone(value);
          errorMessage = rule.message || 'رقم الهاتف غير صحيح';
          break;
        case 'password':
          isValid = validatePassword(value);
          errorMessage = rule.message || 'كلمة المرور يجب أن تكون 6 أحرف على الأقل';
          break;
        case 'minLength':
          isValid = value && value.length >= rule.value;
          errorMessage = rule.message || `يجب أن يكون ${rule.value} أحرف على الأقل`;
          break;
        case 'maxLength':
          isValid = !value || value.length <= rule.value;
          errorMessage = rule.message || `يجب أن يكون ${rule.value} أحرف على الأكثر`;
          break;
        case 'custom':
          isValid = rule.validator(value);
          errorMessage = rule.message || 'القيمة غير صحيحة';
          break;
        default:
          isValid = true;
      }

      if (!isValid) {
        return errorMessage;
      }
    }

    return null;
  }, [validationSchema]);

  const validate = useCallback(() => {
    const newErrors = {};
    
    Object.keys(validationSchema).forEach(name => {
      const error = validateField(name, values[name]);
      if (error) {
        newErrors[name] = error;
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [values, validationSchema, validateField]);

  const handleChange = useCallback((name, value) => {
    setValue(name, value);
    
    // Validate on change if field was touched
    if (touched[name]) {
      const error = validateField(name, value);
      if (error) {
        setErrors(prev => ({ ...prev, [name]: error }));
      } else {
        setErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors[name];
          return newErrors;
        });
      }
    }
  }, [touched, setValue, validateField]);

  const handleBlur = useCallback((name) => {
    setFieldTouched(name);
    const error = validateField(name, values[name]);
    if (error) {
      setErrors(prev => ({ ...prev, [name]: error }));
    }
  }, [values, setFieldTouched, validateField]);

  const handleSubmit = useCallback(async (onSubmit) => {
    setIsSubmitting(true);
    
    // Mark all fields as touched
    const allTouched = {};
    Object.keys(validationSchema).forEach(name => {
      allTouched[name] = true;
    });
    setTouched(allTouched);

    // Validate all fields
    const isValid = validate();
    
    if (isValid && onSubmit) {
      try {
        await onSubmit(values);
      } catch (err) {
        console.error('Form submission error:', err);
        throw err;
      }
    }
    
    setIsSubmitting(false);
    return isValid;
  }, [values, validationSchema, validate]);

  const reset = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
    setIsSubmitting(false);
  }, [initialValues]);

  return {
    values,
    errors,
    touched,
    isSubmitting,
    setValue,
    handleChange,
    handleBlur,
    handleSubmit,
    validate,
    reset,
    setFieldTouched,
  };
};
```

**Actions:**
1. Create `src/hooks/useForm.js`
2. Implement form state management
3. Implement validation integration
4. Test with UserForm component

---

### 2.3.6: Create useModal Hook

**File:** `src/hooks/useModal.js`

**Purpose:** Manage modal state (open/close, mode, data)

**Implementation:**
```javascript
import { useState, useCallback } from 'react';
import { MODAL_MODES } from '../constants';

export const useModal = (initialMode = null) => {
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState(initialMode);
  const [data, setData] = useState(null);

  const open = useCallback((newMode = null, newData = null) => {
    setMode(newMode || initialMode);
    setData(newData);
    setIsOpen(true);
  }, [initialMode]);

  const close = useCallback(() => {
    setIsOpen(false);
    // Clear data after animation (optional delay)
    setTimeout(() => {
      setData(null);
      setMode(initialMode);
    }, 300);
  }, [initialMode]);

  const toggle = useCallback(() => {
    if (isOpen) {
      close();
    } else {
      open();
    }
  }, [isOpen, open, close]);

  return {
    isOpen,
    mode,
    data,
    open,
    close,
    toggle,
    setMode,
    setData,
  };
};
```

**Actions:**
1. Create `src/hooks/useModal.js`
2. Implement modal state management
3. Test with modals in the app

---

### 2.3.7: Create useDebounce Hook

**File:** `src/hooks/useDebounce.js`

**Purpose:** Debounce search input to reduce API calls

**Implementation:**
```javascript
import { useState, useEffect } from 'react';
import { LIMITS } from '../constants';

export const useDebounce = (value, delay = LIMITS.DEBOUNCE_DELAY) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};
```

**Actions:**
1. Create `src/hooks/useDebounce.js`
2. Implement debounce logic
3. Use in search components

---

### 2.3.8: Create Hooks Index File

**File:** `src/hooks/index.js`

**Purpose:** Export all hooks for easier imports

**Implementation:**
```javascript
export { useAuth } from './useAuth';
export { useUsers } from './useUsers';
export { useCards } from './useCards';
export { useAttendance } from './useAttendance';
export { useForm } from './useForm';
export { useModal } from './useModal';
export { useDebounce } from './useDebounce';
```

**Actions:**
1. Create `src/hooks/index.js`
2. Export all hooks
3. Update imports in components

---

## Step 2.4: Refactor App.jsx

### Task
Update App.jsx to use Context providers and custom hooks instead of local state management.

### File: `src/App.jsx`

### Changes Required:

**1. Wrap App with Context Providers:**
```javascript
import { AuthProvider } from './context/AuthContext';
import { AppProvider } from './context/AppContext';

function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <AppContent />
      </AppProvider>
    </AuthProvider>
  );
}

function AppContent() {
  // Main app logic here
}

export default App;
```

**2. Replace useState with Context Hooks:**
- Remove `isLoggedIn`, `user` state → Use `useAuth()`
- Remove `users`, `cards`, `attendance`, `stats` state → Use `useApp()`
- Remove `loading`, `error` state → Use Context hooks
- Remove `fetchData` function → Use Context methods

**3. Update Component Props:**
- Pass data from Context instead of props
- Use hooks in child components directly where possible

**4. Remove Duplicate Logic:**
- Remove authentication logic (moved to AuthContext)
- Remove data fetching logic (moved to AppContext)
- Remove user CRUD handlers (moved to useUsers hook)
- Remove card CRUD handlers (moved to useCards hook)

### New App.jsx Structure:
```javascript
import { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AppProvider, useApp } from './context/AppContext';
import { VIEW_MODES } from './constants';

// Components
import { Login } from './components/auth';
import { Header, Sidebar, ErrorMessage, LoadingSpinner } from './components/common';
import { Dashboard } from './components/dashboard';
import { UsersManagement } from './components/users';
import { CardsManagement } from './components/cards';
import { AttendanceRecords } from './components/attendance';
import { ComingSoon } from './components/common';

function AppContent() {
  const { isLoggedIn, loading: authLoading } = useAuth();
  const { loading: dataLoading, error } = useApp();
  const [currentView, setCurrentView] = useState(VIEW_MODES.DASHBOARD);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Render content based on current view
  const renderContent = () => {
    switch (currentView) {
      case VIEW_MODES.DASHBOARD:
        return <Dashboard />;
      case VIEW_MODES.USERS:
        return <UsersManagement searchTerm={searchTerm} setSearchTerm={setSearchTerm} />;
      case VIEW_MODES.CARDS:
        return <CardsManagement />;
      case VIEW_MODES.ATTENDANCE:
        return <AttendanceRecords searchTerm={searchTerm} setSearchTerm={setSearchTerm} />;
      case VIEW_MODES.ANALYTICS:
        return <ComingSoon title="التحليلات" description="تقارير مفصلة وإحصائيات متقدمة" />;
      case VIEW_MODES.SETTINGS:
        return <ComingSoon title="الإعدادات" description="إعدادات النظام والتكوين العام" />;
      default:
        return <Dashboard />;
    }
  };

  if (authLoading) {
    return <LoadingSpinner fullScreen message="جاري التحقق من المصادقة..." />;
  }

  if (!isLoggedIn) {
    return <Login />;
  }

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar 
        currentView={currentView}
        setCurrentView={setCurrentView}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header 
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          currentView={currentView}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
        />
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          {error && <ErrorMessage error={error} onDismiss={() => {}} />}
          {dataLoading ? <LoadingSpinner /> : renderContent()}
        </main>
      </div>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <AppContent />
      </AppProvider>
    </AuthProvider>
  );
}

export default App;
```

### Actions:
1. Update `src/App.jsx` imports
2. Wrap App with Context providers
3. Create AppContent component
4. Replace state with Context hooks
5. Update component props
6. Remove duplicate logic
7. Test all functionality

### Verification:
- App.jsx uses Context providers
- All state comes from Context
- Components receive data from hooks
- No prop drilling
- Application works identically

---

## Step 2.5: Update Components to Use Hooks

### Task
Update all components to use Context hooks instead of receiving props for data.

### Components to Update:

**2.5.1: Update Login Component**
- Use `useAuth()` hook instead of props
- Remove `onLoginSuccess` prop

**2.5.2: Update Dashboard Component**
- Use `useApp()` hook to get users, attendance, stats
- Remove props

**2.5.3: Update UsersManagement Component**
- Use `useUsers()` hook for user operations
- Use `useApp()` for users list
- Use `useDebounce()` for search
- Remove most props

**2.5.4: Update UserForm Component**
- Use `useForm()` hook for form state
- Use `useUsers()` hook for operations
- Remove props where possible

**2.5.5: Update CardsManagement Component**
- Use `useCards()` hook for card operations
- Use `useApp()` for cards and users
- Remove props

**2.5.6: Update AttendanceRecords Component**
- Use `useAttendance()` hook
- Use `useApp()` for attendance list
- Use `useDebounce()` for search
- Remove props

### Actions:
1. Update each component file
2. Replace props with hooks
3. Test each component
4. Verify no broken functionality

---

## Step 2.6: Create Context Index File

### Task
Create index file for easier Context imports.

### File: `src/context/index.js`

**Implementation:**
```javascript
export { AuthProvider, useAuth } from './AuthContext';
export { AppProvider, useApp } from './AppContext';
```

**Actions:**
1. Create `src/context/index.js`
2. Export all contexts and hooks
3. Update imports in App.jsx

---

## Step 2.7: Testing and Verification

### Testing Checklist:

**Authentication:**
- ✅ Login works correctly
- ✅ Logout works correctly
- ✅ Token is stored and retrieved
- ✅ Auth state persists on page refresh
- ✅ Protected routes work

**Data Management:**
- ✅ Users list loads on login
- ✅ Cards list loads on login
- ✅ Attendance loads on login
- ✅ Stats calculate correctly
- ✅ Data refreshes after operations

**User Operations:**
- ✅ Create user works
- ✅ Update user works
- ✅ Delete user works
- ✅ User list updates after operations

**Card Operations:**
- ✅ Create card works
- ✅ Update card works
- ✅ Delete card works
- ✅ Card list updates after operations

**Search and Filter:**
- ✅ Search debouncing works
- ✅ Filter functionality works
- ✅ No unnecessary API calls

**Error Handling:**
- ✅ Errors display correctly
- ✅ Error state clears properly
- ✅ Network errors handled

**Performance:**
- ✅ No unnecessary re-renders
- ✅ Context values memoized
- ✅ Components only re-render when needed

---

## Step 2.8: Code Cleanup

### Actions:
1. Remove unused state variables
2. Remove unused functions
3. Remove prop drilling
4. Clean up imports
5. Remove console.logs (keep error logs)
6. Update comments
7. Run ESLint and fix warnings
8. Format code consistently

---

## Success Criteria

### Phase 2 Complete When:
- ✅ AuthContext created and working
- ✅ AppContext created and working
- ✅ All custom hooks created
- ✅ App.jsx refactored to use Context
- ✅ All components updated to use hooks
- ✅ No prop drilling
- ✅ State management centralized
- ✅ All functionality works identically
- ✅ No console errors
- ✅ Performance is maintained or improved

### Metrics:
- **Before:** State scattered across components, prop drilling
- **After:** Centralized state management, clean hook APIs
- **State Management:** 9/10
- **Code Reusability:** Significantly improved

---

## Estimated Timeline

- **Step 2.1:** 2-3 hours (AuthContext)
- **Step 2.2:** 3-4 hours (AppContext)
- **Step 2.3:** 6-8 hours (Custom hooks)
- **Step 2.4:** 2-3 hours (Refactor App.jsx)
- **Step 2.5:** 4-5 hours (Update components)
- **Step 2.6:** 30 minutes (Index files)
- **Step 2.7:** 2-3 hours (Testing)
- **Step 2.8:** 1-2 hours (Cleanup)

**Total:** 20-29 hours (approximately 3-4 working days)

---

## Notes

- Work incrementally: Create one context/hook at a time and test
- Keep git commits small and focused
- Test after each major change
- Maintain all existing functionality
- Use useCallback and useMemo to prevent unnecessary re-renders
- Document any issues or decisions made during implementation

---

## Common Issues and Solutions

### Issue 1: Infinite Re-render Loop
**Solution:** Ensure Context values are memoized using useMemo

### Issue 2: Components Not Updating
**Solution:** Check that Context providers are wrapping components correctly

### Issue 3: Hook Called Outside Provider
**Solution:** Ensure all components using hooks are within provider tree

### Issue 4: Performance Issues
**Solution:** Use React.memo, useMemo, and useCallback appropriately

### Issue 5: State Not Persisting
**Solution:** Check token storage and Context initialization

