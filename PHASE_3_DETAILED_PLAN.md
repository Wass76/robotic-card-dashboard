# Phase 3: Detailed Execution Plan - API Service Refactoring

## Overview
Refactor the API service into a robust, maintainable structure with proper error handling, request interceptors, retry mechanisms, and environment-based configuration. The system will support both mock data (for development) and real API integration (when backend is ready), with seamless switching between modes.

**Estimated Time:** 4-6 days  
**Prerequisites:** Phase 1 and Phase 2 must be completed  
**Dependencies:** All Context and hooks from Phase 2

---

## Step 3.1: Setup Environment Variables

### Task
Create environment configuration files to manage API URLs, mock mode, and other settings across different environments.

### 3.1.1: Create Environment Files

**File:** `.env.development`
```env
VITE_API_BASE_URL=https://api-cards-robotic-club.tech-sauce.com
VITE_USE_MOCK_DATA=true
VITE_MOCK_DELAY=500
VITE_API_TIMEOUT=30000
VITE_ENABLE_API_LOGGING=true
```

**File:** `.env.production`
```env
VITE_API_BASE_URL=https://api-cards-robotic-club.tech-sauce.com
VITE_USE_MOCK_DATA=false
VITE_MOCK_DELAY=0
VITE_API_TIMEOUT=30000
VITE_ENABLE_API_LOGGING=false
```

**File:** `.env.local` (optional, for local overrides)
```env
# This file is ignored by git and can be used for local development
VITE_API_BASE_URL=http://localhost:8000
VITE_USE_MOCK_DATA=true
```

### 3.1.2: Create Environment Config Utility

**File:** `src/config/env.js`

**Implementation:**
```javascript
/**
 * Environment configuration
 * Reads from Vite environment variables
 */

export const env = {
  // API Configuration
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL || '',
  USE_MOCK_DATA: import.meta.env.VITE_USE_MOCK_DATA === 'true' || false,
  MOCK_DELAY: parseInt(import.meta.env.VITE_MOCK_DELAY || '500', 10),
  API_TIMEOUT: parseInt(import.meta.env.VITE_API_TIMEOUT || '30000', 10),
  ENABLE_API_LOGGING: import.meta.env.VITE_ENABLE_API_LOGGING === 'true' || false,
  
  // Environment
  MODE: import.meta.env.MODE, // 'development' | 'production'
  DEV: import.meta.env.DEV,
  PROD: import.meta.env.PROD,
};

// Log environment status
if (env.ENABLE_API_LOGGING) {
  if (env.USE_MOCK_DATA) {
    console.log('%c🔧 Mock Data Mode Enabled', 'color: #4A90E2; font-weight: bold; font-size: 14px;');
    console.log('%cYou can login with any email and password', 'color: #666; font-size: 12px;');
  } else {
    console.log('%c🌐 API Mode Enabled', 'color: #10b981; font-weight: bold; font-size: 14px;');
    console.log(`%cAPI Base URL: ${env.API_BASE_URL}`, 'color: #666; font-size: 12px;');
  }
}

export default env;
```

### Actions:
1. Create `.env.development` file
2. Create `.env.production` file
3. Create `.env.local.example` file (template)
4. Create `src/config/env.js` file
5. Add `.env.local` to `.gitignore`
6. Update `vite.config.js` if needed

### Verification:
- Environment variables are accessible
- Mock mode can be toggled via env
- Different configs for dev/prod

---

## Step 3.2: Create API Service Class

### Task
Refactor the API service into a class-based structure with better organization, error handling, and extensibility.

### File: `src/services/ApiService.js`

### Implementation:

**Class Structure:**
```javascript
import env from '../config/env';
import { getToken, clearToken } from '../utils/tokenManager';
import { handleApiError, getErrorMessage } from '../utils/errorHandler';
import { API_ENDPOINTS } from '../constants';

/**
 * API Service Class
 * Handles all HTTP requests with interceptors, retry logic, and error handling
 */
class ApiService {
  constructor(baseURL = env.API_BASE_URL) {
    this.baseURL = baseURL;
    this.useMockData = env.USE_MOCK_DATA;
    this.timeout = env.API_TIMEOUT;
    this.enableLogging = env.ENABLE_API_LOGGING;
    
    // Request interceptors
    this.requestInterceptors = [];
    
    // Response interceptors
    this.responseInterceptors = [];
    
    // Error interceptors
    this.errorInterceptors = [];
    
    // Retry configuration
    this.retryConfig = {
      maxRetries: 3,
      retryDelay: 1000,
      retryableStatuses: [408, 429, 500, 502, 503, 504],
    };
  }

  /**
   * Add request interceptor
   */
  addRequestInterceptor(interceptor) {
    this.requestInterceptors.push(interceptor);
  }

  /**
   * Add response interceptor
   */
  addResponseInterceptor(interceptor) {
    this.responseInterceptors.push(interceptor);
  }

  /**
   * Add error interceptor
   */
  addErrorInterceptor(interceptor) {
    this.errorInterceptors.push(interceptor);
  }

  /**
   * Apply request interceptors
   */
  async applyRequestInterceptors(config) {
    let modifiedConfig = { ...config };
    
    for (const interceptor of this.requestInterceptors) {
      modifiedConfig = await interceptor(modifiedConfig);
    }
    
    return modifiedConfig;
  }

  /**
   * Apply response interceptors
   */
  async applyResponseInterceptors(response) {
    let modifiedResponse = response;
    
    for (const interceptor of this.responseInterceptors) {
      modifiedResponse = await interceptor(modifiedResponse);
    }
    
    return modifiedResponse;
  }

  /**
   * Apply error interceptors
   */
  async applyErrorInterceptors(error) {
    let modifiedError = error;
    
    for (const interceptor of this.errorInterceptors) {
      modifiedError = await interceptor(modifiedError);
    }
    
    return modifiedError;
  }

  /**
   * Get default headers
   */
  getDefaultHeaders() {
    const headers = {
      'Content-Type': 'application/json',
    };

    // Add authorization token if available
    const token = getToken();
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    return headers;
  }

  /**
   * Create timeout promise
   */
  createTimeoutPromise(timeout) {
    return new Promise((_, reject) => {
      setTimeout(() => {
        reject(new Error(`Request timeout after ${timeout}ms`));
      }, timeout);
    });
  }

  /**
   * Check if status is retryable
   */
  isRetryableStatus(status) {
    return this.retryConfig.retryableStatuses.includes(status);
  }

  /**
   * Retry request with exponential backoff
   */
  async retryRequest(requestFn, retryCount = 0) {
    try {
      return await requestFn();
    } catch (error) {
      if (retryCount >= this.retryConfig.maxRetries) {
        throw error;
      }

      const status = error.response?.status || error.status;
      
      if (this.isRetryableStatus(status)) {
        const delay = this.retryConfig.retryDelay * Math.pow(2, retryCount);
        
        if (this.enableLogging) {
          console.log(`Retrying request (${retryCount + 1}/${this.retryConfig.maxRetries}) after ${delay}ms`);
        }
        
        await new Promise(resolve => setTimeout(resolve, delay));
        return this.retryRequest(requestFn, retryCount + 1);
      }
      
      throw error;
    }
  }

  /**
   * Handle response
   */
  async handleResponse(response) {
    const contentType = response.headers.get('content-type');
    
    // Check if response is JSON
    if (contentType && contentType.includes('application/json')) {
      const data = await response.json();
      
      if (!response.ok) {
        const error = new Error(data.message || data.error || `HTTP error! status: ${response.status}`);
        error.status = response.status;
        error.response = data;
        throw error;
      }
      
      return data;
    }
    
    // Handle non-JSON responses
    if (!response.ok) {
      const text = await response.text();
      const error = new Error(text || `HTTP error! status: ${response.status}`);
      error.status = response.status;
      throw error;
    }
    
    return null;
  }

  /**
   * Make API request
   */
  async request(endpoint, options = {}) {
    // Use mock data if enabled
    if (this.useMockData) {
      return this.handleMockRequest(endpoint, options);
    }

    // Build URL
    const url = endpoint.startsWith('http') 
      ? endpoint 
      : `${this.baseURL}${endpoint}`;

    // Prepare config
    let config = {
      method: options.method || 'GET',
      headers: {
        ...this.getDefaultHeaders(),
        ...options.headers,
      },
      ...options,
    };

    // Apply request interceptors
    config = await this.applyRequestInterceptors(config);

    // Log request if enabled
    if (this.enableLogging) {
      console.log(`[API Request] ${config.method} ${endpoint}`, {
        url,
        config: { ...config, body: config.body ? '[Body]' : undefined },
      });
    }

    // Create request function
    const requestFn = async () => {
      // Create timeout promise
      const timeoutPromise = this.createTimeoutPromise(this.timeout);
      
      // Create fetch promise
      const fetchPromise = fetch(url, config);
      
      // Race between fetch and timeout
      const response = await Promise.race([fetchPromise, timeoutPromise]);
      
      // Apply response interceptors
      const modifiedResponse = await this.applyResponseInterceptors(response);
      
      // Handle response
      return this.handleResponse(modifiedResponse);
    };

    try {
      // Execute request with retry logic
      const data = await this.retryRequest(requestFn);
      
      if (this.enableLogging) {
        console.log(`[API Response] ${config.method} ${endpoint}`, data);
      }
      
      return data;
    } catch (error) {
      // Apply error interceptors
      const modifiedError = await this.applyErrorInterceptors(error);
      
      // Log error if enabled
      if (this.enableLogging) {
        console.error(`[API Error] ${config.method} ${endpoint}`, modifiedError);
      }
      
      // Handle API error
      const apiError = handleApiError(modifiedError);
      throw apiError;
    }
  }

  /**
   * Handle mock request
   */
  async handleMockRequest(endpoint, options) {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, env.MOCK_DELAY));

    if (this.enableLogging) {
      console.log(`[MOCK API] ${options.method || 'GET'} ${endpoint}`, options);
    }

    // Import mock handlers
    const { handleMockRequest } = await import('./mockHandlers');
    return handleMockRequest(endpoint, options);
  }

  // Convenience methods
  async get(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: 'GET' });
  }

  async post(endpoint, data, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async put(endpoint, data, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async patch(endpoint, data, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async delete(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: 'DELETE' });
  }
}

// Create singleton instance
export const apiService = new ApiService();

// Setup default interceptors
apiService.addRequestInterceptor(async (config) => {
  // Add timestamp to requests
  config.headers['X-Request-Time'] = new Date().toISOString();
  return config;
});

apiService.addResponseInterceptor(async (response) => {
  // Handle token refresh if needed
  // This can be extended later
  return response;
});

apiService.addErrorInterceptor(async (error) => {
  // Handle 401 Unauthorized - clear token and redirect to login
  if (error.status === 401) {
    clearToken();
    // Could dispatch event or use router here
    window.dispatchEvent(new CustomEvent('auth:unauthorized'));
  }
  
  return error;
});

export default apiService;
```

### Actions:
1. Create `src/services/ApiService.js` file
2. Implement ApiService class
3. Add interceptor support
4. Add retry logic
5. Add timeout handling
6. Test basic functionality

### Verification:
- ApiService class works
- Interceptors are applied
- Retry logic works
- Timeout handling works

---

## Step 3.3: Create Mock Handlers

### Task
Extract mock data handling into a separate module for better organization and easier maintenance.

### File: `src/services/mockHandlers.js`

### Implementation:

```javascript
import env from '../config/env';

// Mock Data
const MOCK_USERS = [
  { id: 1, first_name: 'سنا', last_name: 'مسلم', email: 'sana@robotics.club', Phone: '0987654321', phone: '0987654321', role: 'Admin', created_at: '2024-01-15', card_id: '1111', status: 'active', last_seen: '2024-11-24 09:30:00' },
  { id: 2, first_name: 'سلام', last_name: 'مسلم', email: 'salam@robotics.club', Phone: '0987654322', phone: '0987654322', role: 'User', created_at: '2024-01-16', card_id: '2222', status: 'active', last_seen: '2024-11-24 10:15:00' },
  { id: 3, first_name: 'إيمان', last_name: 'غباش', email: 'iman@robotics.club', Phone: '0987654323', phone: '0987654323', role: 'User', created_at: '2024-01-17', card_id: '3333', status: 'active', last_seen: '2024-11-24 11:00:00' },
  { id: 4, first_name: 'حلا', last_name: 'عرقسوسي', email: 'hala@robotics.club', Phone: '0987654324', phone: '0987654324', role: 'User', created_at: '2024-01-18', card_id: '4444', status: 'inactive', last_seen: '2024-11-23 14:20:00' },
  { id: 5, first_name: 'أيمن', last_name: 'الأحمد', email: 'ayman@robotics.club', Phone: '0987654325', phone: '0987654325', role: 'User', created_at: '2024-01-19', card_id: '5555', status: 'active', last_seen: '2024-11-24 08:45:00' },
];

const MOCK_CARDS = [
  { id: 1, card_id: '1111', user_id: 1, status: 'active' },
  { id: 2, card_id: '2222', user_id: 2, status: 'active' },
  { id: 3, card_id: '3333', user_id: 3, status: 'active' },
  { id: 4, card_id: '4444', user_id: 4, status: 'active' },
  { id: 5, card_id: '5555', user_id: 5, status: 'active' }
];

const MOCK_ATTENDANCE = [
  { id: 1, user_id: 1, user_name: 'سنا مسلم', card_id: '1111', timestamp: '2024-11-24 09:30:00', type: 'entry', method: 'RFID' },
  { id: 2, user_id: 2, user_name: 'سلام مسلم', card_id: '2222', timestamp: '2024-11-24 10:15:00', type: 'entry', method: 'Face Recognition' },
  { id: 3, user_id: 3, user_name: 'إيمان غباش', card_id: '3333', timestamp: '2024-11-24 11:00:00', type: 'entry', method: 'RFID' },
  { id: 4, user_id: 1, user_name: 'سنا مسلم', card_id: '1111', timestamp: '2024-11-24 17:30:00', type: 'exit', method: 'RFID' },
  { id: 5, user_id: 4, user_name: 'حلا عرقسوسي', card_id: '4444', timestamp: '2024-11-24 14:20:00', type: 'entry', method: 'Face Recognition' },
  { id: 6, user_id: 5, user_name: 'أيمن الأحمد', card_id: '5555', timestamp: '2024-11-24 08:45:00', type: 'entry', method: 'RFID' },
];

// In-memory storage for mock data (simulates database)
let mockUsers = [...MOCK_USERS];
let mockCards = [...MOCK_CARDS];
let mockAttendance = [...MOCK_ATTENDANCE];

/**
 * Reset mock data to initial state
 */
export const resetMockData = () => {
  mockUsers = [...MOCK_USERS];
  mockCards = [...MOCK_CARDS];
  mockAttendance = [...MOCK_ATTENDANCE];
};

/**
 * Handle mock request
 */
export const handleMockRequest = async (endpoint, options = {}) => {
  const method = options.method || 'GET';
  const body = options.body ? JSON.parse(options.body) : {};

  // Authentication endpoints
  if (endpoint.includes('/login')) {
    return handleMockLogin(body);
  }

  if (endpoint.includes('/logoutFromApp')) {
    return { message: 'Logged out successfully' };
  }

  if (endpoint.includes('/profile')) {
    return {
      id: 1,
      name: 'Admin User',
      email: 'admin@robotics.club',
      role: 'Admin',
    };
  }

  // User endpoints
  if (endpoint.includes('/User')) {
    return handleMockUserRequest(endpoint, method, body);
  }

  // Card endpoints
  if (endpoint.includes('/Card')) {
    return handleMockCardRequest(endpoint, method, body);
  }

  // Attendance endpoints
  if (endpoint.includes('attendance') || endpoint.includes('Attendance')) {
    return handleMockAttendanceRequest(endpoint, method, body);
  }

  // Monthly attendance
  if (endpoint.includes('monthlyAttendance')) {
    return { total: mockAttendance.length };
  }

  // Transaction
  if (endpoint.includes('/Transaction')) {
    return handleMockTransaction(endpoint, method);
  }

  return {};
};

/**
 * Handle mock login
 */
const handleMockLogin = (body) => {
  const email = body.email || 'admin@robotics.club';
  
  return {
    authorisation: { token: 'mock-token-' + Date.now() },
    user: {
      id: 1,
      name: 'Admin User',
      email: email,
      role: 'Admin',
      first_name: 'Admin',
      last_name: 'User'
    }
  };
};

/**
 * Handle mock user requests
 */
const handleMockUserRequest = (endpoint, method, body) => {
  if (method === 'GET') {
    // Get user by ID
    const idMatch = endpoint.match(/\/User\/(\d+)/);
    if (idMatch) {
      const userId = parseInt(idMatch[1], 10);
      return mockUsers.find(u => u.id === userId) || null;
    }
    
    // Get all users
    return mockUsers;
  }

  if (method === 'POST') {
    // Create user
    const newUser = {
      ...body,
      id: Math.max(...mockUsers.map(u => u.id)) + 1,
      status: body.status || 'active',
      created_at: new Date().toISOString().split('T')[0],
    };
    mockUsers.push(newUser);
    return newUser;
  }

  if (method === 'PUT') {
    // Update user
    const idMatch = endpoint.match(/\/User\/(\d+)/);
    if (idMatch) {
      const userId = parseInt(idMatch[1], 10);
      const index = mockUsers.findIndex(u => u.id === userId);
      if (index !== -1) {
        mockUsers[index] = { ...mockUsers[index], ...body };
        return mockUsers[index];
      }
    }
    return { ...body, id: parseInt(endpoint.split('/').pop(), 10) };
  }

  if (method === 'DELETE') {
    // Delete user
    const idMatch = endpoint.match(/\/User\/(\d+)/);
    if (idMatch) {
      const userId = parseInt(idMatch[1], 10);
      mockUsers = mockUsers.filter(u => u.id !== userId);
      return { message: 'User deleted successfully' };
    }
  }

  return {};
};

/**
 * Handle mock card requests
 */
const handleMockCardRequest = (endpoint, method, body) => {
  if (method === 'GET') {
    // Get card by ID
    const idMatch = endpoint.match(/\/Card\/(\d+)$/);
    if (idMatch) {
      const cardId = parseInt(idMatch[1], 10);
      return mockCards.find(c => c.id === cardId) || null;
    }
    
    // Get all cards
    return mockCards;
  }

  if (method === 'POST') {
    // Create card for user
    const userIdMatch = endpoint.match(/\/Card\/(\d+)$/);
    if (userIdMatch) {
      const userId = parseInt(userIdMatch[1], 10);
      const newCard = {
        ...body,
        id: Math.max(...mockCards.map(c => c.id), 0) + 1,
        user_id: userId,
        status: body.status || 'active',
      };
      mockCards.push(newCard);
      return newCard;
    }
  }

  if (method === 'PUT') {
    // Update card
    const idMatch = endpoint.match(/\/Card\/(\d+)$/);
    if (idMatch) {
      const cardId = parseInt(idMatch[1], 10);
      const index = mockCards.findIndex(c => c.id === cardId);
      if (index !== -1) {
        mockCards[index] = { ...mockCards[index], ...body };
        return mockCards[index];
      }
    }
  }

  if (method === 'DELETE') {
    // Delete card
    const idMatch = endpoint.match(/\/Card\/(\d+)$/);
    if (idMatch) {
      const cardId = parseInt(idMatch[1], 10);
      mockCards = mockCards.filter(c => c.id !== cardId);
      return { message: 'Card deleted successfully' };
    }
  }

  return {};
};

/**
 * Handle mock attendance requests
 */
const handleMockAttendanceRequest = (endpoint, method, body) => {
  if (method === 'GET') {
    // Get attendance by user ID
    const userIdMatch = endpoint.match(/Attendance_Records_By_UserId\/(\d+)/);
    if (userIdMatch) {
      const userId = parseInt(userIdMatch[1], 10);
      return mockAttendance.filter(a => a.user_id === userId);
    }
    
    // Get all attendance
    return mockAttendance;
  }

  return mockAttendance;
};

/**
 * Handle mock transaction
 */
const handleMockTransaction = (endpoint, method) => {
  if (method === 'POST') {
    const cardIdMatch = endpoint.match(/\/Transaction\/(.+)$/);
    if (cardIdMatch) {
      const cardId = cardIdMatch[1];
      const card = mockCards.find(c => c.card_id === cardId);
      
      if (card) {
        // Create attendance record
        const user = mockUsers.find(u => u.id === card.user_id);
        const newAttendance = {
          id: Math.max(...mockAttendance.map(a => a.id), 0) + 1,
          user_id: card.user_id,
          user_name: user ? `${user.first_name} ${user.last_name}` : 'Unknown',
          card_id: cardId,
          timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
          type: 'entry',
          method: 'RFID',
        };
        mockAttendance.unshift(newAttendance);
        return newAttendance;
      }
    }
  }

  return {};
};
```

### Actions:
1. Create `src/services/mockHandlers.js` file
2. Extract mock data
3. Implement mock request handlers
4. Add reset functionality
5. Test mock handlers

### Verification:
- Mock handlers work correctly
- All endpoints are handled
- Data persists during session
- Reset function works

---

## Step 3.4: Refactor API Methods

### Task
Update the existing API methods to use the new ApiService class while maintaining backward compatibility.

### File: `src/services/api.js`

### Implementation:

```javascript
import apiService from './ApiService';
import { API_ENDPOINTS } from '../constants';

// ==================== AUTHENTICATION ====================

export const login = async (email, password) => {
  try {
    const response = await apiService.post(API_ENDPOINTS.LOGIN, {
      email,
      password,
    });

    // Extract token from various possible locations
    const token = response?.authorisation?.token || 
                 response?.token || 
                 response?.access_token ||
                 response?.data?.token;

    if (token) {
      // Token storage is handled by AuthContext
      return {
        ...response,
        token, // Include token in response for AuthContext
      };
    } else {
      throw new Error('Token missing in response');
    }
  } catch (error) {
    throw error;
  }
};

export const logout = async () => {
  try {
    await apiService.post(API_ENDPOINTS.LOGOUT);
  } catch (error) {
    // Logout should succeed even if API call fails
    console.warn('Logout API call failed:', error);
  }
};

export const getProfile = async () => {
  return apiService.get(API_ENDPOINTS.PROFILE);
};

// ==================== USER OPERATIONS ====================

export const getUsers = async () => {
  return apiService.get(API_ENDPOINTS.USERS);
};

export const getUserById = async (userId) => {
  return apiService.get(API_ENDPOINTS.USER_BY_ID(userId));
};

export const createUser = async (userData) => {
  return apiService.post(API_ENDPOINTS.USERS, userData);
};

export const updateUser = async (userId, userData) => {
  return apiService.put(API_ENDPOINTS.USER_BY_ID(userId), userData);
};

export const deleteUser = async (userId) => {
  return apiService.delete(API_ENDPOINTS.USER_BY_ID(userId));
};

// ==================== CARD OPERATIONS ====================

export const getCards = async () => {
  return apiService.get(API_ENDPOINTS.CARDS);
};

export const getCardById = async (cardId) => {
  return apiService.get(API_ENDPOINTS.CARD_BY_ID(cardId));
};

export const createCardForUser = async (userId, cardData) => {
  return apiService.post(API_ENDPOINTS.CARD_FOR_USER(userId), cardData);
};

export const updateCard = async (cardId, cardData) => {
  return apiService.put(API_ENDPOINTS.CARD_BY_ID(cardId), cardData);
};

export const deleteCard = async (cardId) => {
  return apiService.delete(API_ENDPOINTS.CARD_BY_ID(cardId));
};

// ==================== ATTENDANCE RECORDS ====================

export const getAllAttendance = async () => {
  return apiService.get(API_ENDPOINTS.ATTENDANCE);
};

export const getUserAttendance = async (userId) => {
  return apiService.get(API_ENDPOINTS.USER_ATTENDANCE(userId));
};

export const getMonthlyAttendance = async () => {
  return apiService.get(API_ENDPOINTS.MONTHLY_ATTENDANCE);
};

// ==================== TRANSACTION ====================

export const simulateTransaction = async (cardId) => {
  return apiService.post(API_ENDPOINTS.TRANSACTION(cardId));
};

// Export apiService for advanced usage
export { apiService };
export default apiService;
```

### Actions:
1. Update `src/services/api.js` file
2. Replace apiRequest calls with apiService methods
3. Use API_ENDPOINTS constants
4. Maintain backward compatibility
5. Test all API methods

### Verification:
- All API methods work
- Backward compatibility maintained
- Error handling works
- Mock mode works

---

## Step 3.5: Create API Hooks

### Task
Create specialized hooks for API operations that integrate with Context and provide loading/error states.

### 3.5.1: Create useApi Hook

**File:** `src/hooks/api/useApi.js`

**Implementation:**
```javascript
import { useState, useCallback } from 'react';

/**
 * Generic API hook with loading and error states
 */
export const useApi = (apiFunction) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const execute = useCallback(async (...args) => {
    try {
      setLoading(true);
      setError(null);
      const result = await apiFunction(...args);
      setData(result);
      return result;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [apiFunction]);

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setLoading(false);
  }, []);

  return {
    data,
    loading,
    error,
    execute,
    reset,
  };
};
```

### 3.5.2: Create useUsersApi Hook

**File:** `src/hooks/api/useUsersApi.js`

**Implementation:**
```javascript
import { useCallback } from 'react';
import * as api from '../../services/api';
import { useApi } from './useApi';

/**
 * Hook for user API operations
 */
export const useUsersApi = () => {
  const getUsers = useApi(api.getUsers);
  const getUserById = useApi(api.getUserById);
  const createUser = useApi(api.createUser);
  const updateUser = useApi(api.updateUser);
  const deleteUser = useApi(api.deleteUser);

  return {
    getUsers,
    getUserById,
    createUser,
    updateUser,
    deleteUser,
  };
};
```

### 3.5.3: Create useCardsApi Hook

**File:** `src/hooks/api/useCardsApi.js`

**Implementation:**
```javascript
import { useCallback } from 'react';
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
```

### 3.5.4: Create useAttendanceApi Hook

**File:** `src/hooks/api/useAttendanceApi.js`

**Implementation:**
```javascript
import { useCallback } from 'react';
import * as api from '../../services/api';
import { useApi } from './useApi';

/**
 * Hook for attendance API operations
 */
export const useAttendanceApi = () => {
  const getAllAttendance = useApi(api.getAllAttendance);
  const getUserAttendance = useApi(api.getUserAttendance);
  const getMonthlyAttendance = useApi(api.getMonthlyAttendance);

  return {
    getAllAttendance,
    getUserAttendance,
    getMonthlyAttendance,
  };
};
```

### 3.5.5: Create API Hooks Index

**File:** `src/hooks/api/index.js`

**Implementation:**
```javascript
export { useApi } from './useApi';
export { useUsersApi } from './useUsersApi';
export { useCardsApi } from './useCardsApi';
export { useAttendanceApi } from './useAttendanceApi';
```

### Actions:
1. Create `src/hooks/api/` directory
2. Create `useApi.js` hook
3. Create `useUsersApi.js` hook
4. Create `useCardsApi.js` hook
5. Create `useAttendanceApi.js` hook
6. Create index file
7. Test hooks

### Verification:
- All API hooks work
- Loading states work
- Error states work
- Hooks integrate with Context

---

## Step 3.6: Update Context to Use New API Service

### Task
Update AuthContext and AppContext to use the new API service structure.

### 3.6.1: Update AuthContext

**File:** `src/context/AuthContext.jsx`

**Changes:**
- Use new `api.login()` method
- Use new `api.logout()` method
- Handle token from response properly
- Use error handling from ApiService

### 3.6.2: Update AppContext

**File:** `src/context/AppContext.jsx`

**Changes:**
- Use new API methods
- Better error handling
- Use API_ENDPOINTS constants
- Improved error messages

### Actions:
1. Update AuthContext imports
2. Update AppContext imports
3. Update API calls
4. Test authentication flow
5. Test data fetching

### Verification:
- AuthContext works with new API
- AppContext works with new API
- Error handling improved
- Mock mode works

---

## Step 3.7: Add Request Cancellation Support

### Task
Add support for canceling in-flight requests using AbortController.

### File: `src/services/ApiService.js` (Update)

**Add to ApiService class:**
```javascript
/**
 * Create cancelable request
 */
createCancelableRequest(endpoint, options = {}) {
  const controller = new AbortController();
  
  const request = this.request(endpoint, {
    ...options,
    signal: controller.signal,
  });
  
  request.cancel = () => controller.abort();
  
  return request;
}

/**
 * Request with cancellation support
 */
async requestWithCancel(endpoint, options = {}) {
  return this.createCancelableRequest(endpoint, options);
}
```

### Actions:
1. Add AbortController support
2. Add cancel method to requests
3. Test request cancellation
4. Update hooks to support cancellation

### Verification:
- Requests can be cancelled
- No memory leaks
- Error handling works for cancelled requests

---

## Step 3.8: Add Token Refresh Logic

### Task
Implement automatic token refresh when token expires.

### File: `src/services/ApiService.js` (Update)

**Add token refresh interceptor:**
```javascript
// Add to ApiService setup
apiService.addErrorInterceptor(async (error) => {
  // Handle 401 Unauthorized - try to refresh token
  if (error.status === 401) {
    const { refreshToken } = await import('../context/AuthContext');
    
    try {
      // Attempt to refresh token
      const newToken = await refreshToken();
      
      if (newToken) {
        // Retry original request with new token
        // This would need to be implemented based on your auth flow
        return error; // For now, just return error
      }
    } catch (refreshError) {
      // Refresh failed, clear token and redirect to login
      clearToken();
      window.dispatchEvent(new CustomEvent('auth:unauthorized'));
    }
  }
  
  return error;
});
```

### Actions:
1. Add token refresh logic
2. Update error interceptor
3. Test token refresh flow
4. Handle refresh failures

### Verification:
- Token refresh works
- Failed refresh redirects to login
- Original request retries with new token

---

## Step 3.9: Update Vite Config

### Task
Update Vite configuration to use environment variables properly.

### File: `vite.config.js` (Update)

**Changes:**
```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    host: '0.0.0.0',
    strictPort: false,
    proxy: {
      '/api': {
        target: process.env.VITE_API_BASE_URL || 'https://api-cards-robotic-club.tech-sauce.com',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  // Expose env variables
  define: {
    'import.meta.env.VITE_API_BASE_URL': JSON.stringify(process.env.VITE_API_BASE_URL || ''),
    'import.meta.env.VITE_USE_MOCK_DATA': JSON.stringify(process.env.VITE_USE_MOCK_DATA || 'false'),
  },
})
```

### Actions:
1. Update `vite.config.js`
2. Use environment variables
3. Test proxy configuration
4. Test environment variable access

### Verification:
- Environment variables accessible
- Proxy works correctly
- Mock mode toggleable

---

## Step 3.10: Testing and Verification

### Testing Checklist:

**Environment Configuration:**
- ✅ Environment variables load correctly
- ✅ Mock mode can be toggled
- ✅ Different configs for dev/prod

**API Service:**
- ✅ ApiService class works
- ✅ Interceptors are applied
- ✅ Retry logic works
- ✅ Timeout handling works
- ✅ Request cancellation works

**Mock Handlers:**
- ✅ All endpoints have mock handlers
- ✅ Mock data persists correctly
- ✅ CRUD operations work in mock mode
- ✅ Reset function works

**API Methods:**
- ✅ All API methods work
- ✅ Backward compatibility maintained
- ✅ Error handling works
- ✅ Token management works

**API Hooks:**
- ✅ useApi hook works
- ✅ useUsersApi hook works
- ✅ useCardsApi hook works
- ✅ useAttendanceApi hook works
- ✅ Loading states work
- ✅ Error states work

**Integration:**
- ✅ AuthContext works with new API
- ✅ AppContext works with new API
- ✅ Components work with new API
- ✅ Mock mode works end-to-end
- ✅ Real API ready (when backend available)

**Error Handling:**
- ✅ Network errors handled
- ✅ Timeout errors handled
- ✅ 401 errors handled
- ✅ 500 errors handled
- ✅ Error messages are user-friendly

**Performance:**
- ✅ Request cancellation works
- ✅ No memory leaks
- ✅ Retry logic doesn't cause issues
- ✅ Timeout prevents hanging requests

---

## Step 3.11: Code Cleanup and Documentation

### Actions:
1. Remove old apiRequest function (if not used)
2. Update comments and JSDoc
3. Remove console.logs (keep error logs)
4. Update README with API documentation
5. Document environment variables
6. Document mock mode usage
7. Document API service usage
8. Run ESLint and fix warnings
9. Format code consistently

### Documentation to Add:

**API Service Usage:**
```javascript
// Basic usage
import apiService from './services/ApiService';

// GET request
const users = await apiService.get('/api/User');

// POST request
const newUser = await apiService.post('/api/User', { name: 'John' });

// With custom options
const data = await apiService.get('/api/User', {
  headers: { 'Custom-Header': 'value' }
});
```

**Mock Mode:**
- How to enable/disable
- How to reset mock data
- How to add new mock handlers

**Environment Variables:**
- List all variables
- Default values
- How to override

---

## Success Criteria

### Phase 3 Complete When:
- ✅ Environment variables configured
- ✅ ApiService class implemented
- ✅ Mock handlers extracted and working
- ✅ API methods refactored
- ✅ API hooks created
- ✅ Context updated to use new API
- ✅ Request cancellation works
- ✅ Token refresh logic added
- ✅ All functionality works
- ✅ Mock mode works
- ✅ Ready for backend integration
- ✅ Documentation complete

### Metrics:
- **Before:** Simple API functions, mixed concerns
- **After:** Robust API service, clean separation, extensible
- **API Architecture:** 9/10
- **Backend Ready:** Yes, seamless switch when ready

---

## Estimated Timeline

- **Step 3.1:** 1-2 hours (Environment setup)
- **Step 3.2:** 4-5 hours (ApiService class)
- **Step 3.3:** 2-3 hours (Mock handlers)
- **Step 3.4:** 1-2 hours (Refactor API methods)
- **Step 3.5:** 2-3 hours (API hooks)
- **Step 3.6:** 1-2 hours (Update Context)
- **Step 3.7:** 1-2 hours (Request cancellation)
- **Step 3.8:** 2-3 hours (Token refresh)
- **Step 3.9:** 30 minutes (Vite config)
- **Step 3.10:** 2-3 hours (Testing)
- **Step 3.11:** 1-2 hours (Documentation)

**Total:** 17-25 hours (approximately 3-4 working days)

---

## Notes

- Mock data mode is the default until backend is ready
- All hooks are ready to integrate with real API
- Switching to real API only requires changing environment variable
- Request interceptors can be extended for logging, analytics, etc.
- Response interceptors can be extended for data transformation
- Error interceptors can be extended for custom error handling
- Retry logic is configurable per request if needed
- All API calls are cancelable for better UX

---

## Common Issues and Solutions

### Issue 1: Environment Variables Not Loading
**Solution:** Ensure variables start with `VITE_` prefix and restart dev server

### Issue 2: Mock Data Not Working
**Solution:** Check `VITE_USE_MOCK_DATA` is set to 'true' in .env file

### Issue 3: CORS Errors
**Solution:** Use Vite proxy in development, ensure backend CORS is configured

### Issue 4: Token Not Refreshing
**Solution:** Check token refresh endpoint and interceptor logic

### Issue 5: Requests Hanging
**Solution:** Check timeout configuration and network connectivity

---

## Migration Path to Real API

When backend is ready:

1. Set `VITE_USE_MOCK_DATA=false` in `.env.production`
2. Update `VITE_API_BASE_URL` to production API URL
3. Test all endpoints
4. Remove mock handlers (optional, can keep for testing)
5. Update API endpoints if structure differs
6. Test authentication flow
7. Test all CRUD operations
8. Deploy

No code changes needed in components or hooks - they're already ready!

