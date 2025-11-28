// API Configuration
// Use relative path to leverage Vite proxy in development
const BASE_URL = '';
export const USE_MOCK_DATA = false; // Set to true to use mock data

// Mock Data
const MOCK_USERS = [
  { id: 1, first_name: 'Mock', last_name: 'Admin', email: 'admin@mock.com', phone: '0000000000', role: 'Admin', status: 'active', card_id: '1111' },
  { id: 2, first_name: 'Mock', last_name: 'User', email: 'user@mock.com', phone: '1111111111', role: 'User', status: 'active', card_id: '2222' }
];

const MOCK_CARDS = [
  { id: 1, card_id: '1111', user_id: 1, status: 'active' },
  { id: 2, card_id: '2222', user_id: 2, status: 'active' }
];

const MOCK_ATTENDANCE = [
  { id: 1, user_id: 1, user_name: 'Mock Admin', card_id: '1111', timestamp: new Date().toISOString(), type: 'entry', method: 'RFID' }
];

// Helper function to handle API responses
const handleResponse = async (response) => {
  const contentType = response.headers.get("content-type");
  
  if (contentType && contentType.indexOf("application/json") !== -1) {
    const data = await response.json();
    
    // Check for logical errors even if status is 200
    if (!response.ok) {
      throw new Error(data.message || data.error || `HTTP error! status: ${response.status}`);
    }
    
    return data;
  } else {
    // Handle non-JSON responses
    if (!response.ok) {
      const text = await response.text();
      throw new Error(text || `HTTP error! status: ${response.status}`);
    }
    return null;
  }
};

// Generic API request function
const apiRequest = async (endpoint, options = {}) => {
  if (USE_MOCK_DATA) {
    console.log(`[MOCK API] Request to ${endpoint}`, options);
    return handleMockRequest(endpoint, options);
  }

  const url = `${BASE_URL}${endpoint}`;
  
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  // Add authorization token if available
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  try {
    const response = await fetch(url, config);
    return handleResponse(response);
  } catch (error) {
    console.error(`API Error (${endpoint}):`, error);
    throw error;
  }
};

// Mock Request Handler
const handleMockRequest = async (endpoint, options) => {
  await new Promise(resolve => setTimeout(resolve, 500)); // Simulate delay

  if (endpoint.includes('/login')) {
    return {
      authorisation: { token: 'mock-token-123' },
      user: { id: 1, name: 'Mock Admin', email: 'admin@mock.com', role: 'Admin' }
    };
  }
  
  if (endpoint.includes('/User')) {
    if (options.method === 'POST') return { ...JSON.parse(options.body), id: Math.random(), status: 'active' };
    if (options.method === 'PUT') return { ...JSON.parse(options.body), id: endpoint.split('/').pop() };
    if (options.method === 'DELETE') return { message: 'Deleted' };
    return MOCK_USERS;
  }

  if (endpoint.includes('/Card')) {
    if (options.method === 'POST') return { ...JSON.parse(options.body), id: Math.random(), status: 'active' };
    if (options.method === 'PUT') return { ...JSON.parse(options.body), id: endpoint.split('/').pop() };
    if (options.method === 'DELETE') return { message: 'Deleted' };
    return MOCK_CARDS;
  }

  if (endpoint.includes('attendance') || endpoint.includes('monthlyAttendance')) {
    if (endpoint.includes('monthlyAttendance')) return { total: 10 };
    return MOCK_ATTENDANCE;
  }

  return {};
};

// ==================== AUTHENTICATION ====================

export const login = async (email, password) => {
  console.log('Attempting login with:', email);
  try {
    const response = await apiRequest('/api/login', {
      method: 'POST',
      body: JSON.stringify({ 
        email, 
        password,
        // Include these as fallback, but usually not needed for login
        first_name: "admin", 
        last_name: "admin",
        Phone: "0000000000",
        role: "Admin"
      }),
    });
    
    console.log('Login response:', response);

    // Extract token from various possible locations
    let token = null;
    if (response?.authorisation?.token) {
      token = response.authorisation.token;
    } else if (response?.token) {
      token = response.token;
    } else if (response?.access_token) {
      token = response.access_token;
    } else if (response?.data?.token) {
      token = response.data.token;
    }

    if (token) {
      localStorage.setItem('authToken', token);
      const user = response.user || response.data?.user || { email, name: 'Admin' };
      localStorage.setItem('user', JSON.stringify(user));
      return response;
    } else {
      console.error('Token missing in login response');
      throw new Error('Token missing in response');
    }
  } catch (error) {
    console.error('Login API Error:', error);
    throw error;
  }
};

export const logout = async () => {
  // POST /api/logoutFromApp
  try {
    await apiRequest('/api/logoutFromApp', { method: 'POST' });
  } catch (e) {
    console.warn('Logout API call failed, clearing local storage anyway');
  }
  localStorage.removeItem('authToken');
  localStorage.removeItem('user');
};

export const getProfile = async () => {
  // GET /api/profile
  return apiRequest('/api/profile');
};

// ==================== USER OPERATIONS (ADMIN) ====================

export const getUsers = async () => {
  // GET /api/User
  return apiRequest('/api/User');
};

export const getUserById = async (userId) => {
  // GET /api/User/:id
  return apiRequest(`/api/User/${userId}`);
};

export const createUser = async (userData) => {
  // POST /api/User
  return apiRequest('/api/User', {
    method: 'POST',
    body: JSON.stringify(userData),
  });
};

export const updateUser = async (userId, userData) => {
  // PUT /api/User/:id
  return apiRequest(`/api/User/${userId}`, {
    method: 'PUT',
    body: JSON.stringify(userData),
  });
};

export const deleteUser = async (userId) => {
  // DELETE /api/User/:id
  return apiRequest(`/api/User/${userId}`, {
    method: 'DELETE',
  });
};

// ==================== CARD OPERATIONS (ADMIN) ====================

export const getCards = async () => {
  // GET /api/Card
  return apiRequest('/api/Card');
};

export const getCardById = async (cardId) => {
  // GET /api/Card/:id
  return apiRequest(`/api/Card/${cardId}`);
};

export const createCardForUser = async (userId, cardData) => {
  // POST /api/Card/:userId
  // Note: Postman example body contains user info again? 
  // Assuming we just need to trigger creation or send card info if valid.
  return apiRequest(`/api/Card/${userId}`, {
    method: 'POST',
    body: JSON.stringify(cardData),
  });
};

export const updateCard = async (cardId, cardData) => {
  // PUT /api/Card/:id
  return apiRequest(`/api/Card/${cardId}`, {
    method: 'PUT',
    body: JSON.stringify(cardData),
  });
};

export const deleteCard = async (cardId) => {
  // DELETE /api/Card/:id
  return apiRequest(`/api/Card/${cardId}`, {
    method: 'DELETE',
  });
};

// ==================== ATTENDANCE RECORDS ====================

export const getAllAttendance = async () => {
  // GET /api/attendance_records
  // Used for "User" in Postman, checking if Admin can see all here.
  return apiRequest('/api/attendance_records');
};

export const getUserAttendance = async (userId) => {
  // GET /api/Attendance_Records_By_UserId/:userId
  return apiRequest(`/api/Attendance_Records_By_UserId/${userId}`);
};

export const getMonthlyAttendance = async () => {
  // GET /api/monthlyAttendance
  return apiRequest('/api/monthlyAttendance');
};

// ==================== TRANSACTION ====================

export const simulateTransaction = async (cardId) => {
  // POST /api/Transaction/:cardId
  return apiRequest(`/api/Transaction/${cardId}`, {
    method: 'POST'
  });
};
