import apiService from './ApiService';
import { API_ENDPOINTS } from '../constants';

// ==================== AUTHENTICATION ====================

export const login = async (email, password) => {
  try {
    // Send login request with all required fields
    // The API requires all fields, but the form only collects email and password
    // Using default values for the other required fields
    const response = await apiService.post(API_ENDPOINTS.LOGIN, {
      first_name: 'robotic',
      last_name: 'club',
      Phone: '0000000000',
      email: email,
      password: password,
      role: 'Admin',
    });

    // Handle response structure: { code, message, data: { id, first_name, last_name, phone, Year, specialization, email, role, token } }
    if (response && response.code === 200 && response.data) {
      const token = response.data.token;
      
      if (token) {
        // Return response with token and user data
        return {
          ...response,
          token, // Include token at top level for AuthContext
          user: response.data, // Include user data
        };
      } else {
        throw new Error('Token missing in response');
      }
    } else {
      // Handle error response (non-200 code or missing data)
      const errorMessage = response?.message || 'فشل تسجيل الدخول';
      throw new Error(errorMessage);
    }
  } catch (error) {
    // Re-throw with a user-friendly message if it's an API error
    if (error.response) {
      const errorMessage = error.response.message || error.message || 'فشل تسجيل الدخول';
      throw new Error(errorMessage);
    }
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
  const response = await apiService.get(API_ENDPOINTS.USERS);
  
  // Log the response structure for debugging
  console.log('[getUsers] Raw API Response:', response);
  console.log('[getUsers] Response type:', typeof response);
  console.log('[getUsers] Is array:', Array.isArray(response));
  console.log('[getUsers] Has data:', !!response?.data);
  
  let usersArray = null;
  
  // Handle nested response structure: users are in response.data[0]
  if (response && response.data && Array.isArray(response.data) && response.data.length > 0) {
    // Check if data[0] is an array (nested structure)
    if (Array.isArray(response.data[0])) {
      console.log('[getUsers] Using nested structure: response.data[0]');
      usersArray = response.data[0];
    } else {
      // If data[0] is not an array, data itself might be the users array
      console.log('[getUsers] Using response.data directly');
      usersArray = response.data;
    }
  } else if (response && Array.isArray(response.data)) {
    // Fallback: if structure is different, try to return data directly
    console.log('[getUsers] Using response.data (fallback)');
    usersArray = response.data;
  } else if (Array.isArray(response)) {
    // If response is already an array, return it
    console.log('[getUsers] Using response directly (array)');
    usersArray = response;
  }
  
  if (usersArray && usersArray.length > 0) {
    // Log first user to check field names
    const firstUser = usersArray[0];
    console.log('[getUsers] First user object:', firstUser);
    console.log('[getUsers] First user keys:', Object.keys(firstUser));
    console.log('[getUsers] Has first_name:', 'first_name' in firstUser);
    console.log('[getUsers] Has firstName:', 'firstName' in firstUser);
    console.log('[getUsers] Has last_name:', 'last_name' in firstUser);
    console.log('[getUsers] Has lastName:', 'lastName' in firstUser);
    
    // Normalize field names - ensure we have both snake_case and camelCase
    // The API might return snake_case, but transformer converts to camelCase
    // We'll preserve both for compatibility
    usersArray = usersArray.map(user => {
      // Preserve original fields and add normalized versions
      return {
        ...user,
        // Ensure snake_case fields exist (for components expecting them)
        first_name: user.first_name || user.firstName || '',
        last_name: user.last_name || user.lastName || '',
        Phone: user.Phone || user.phone || '',
        phone: user.phone || user.Phone || '',
        Year: user.Year || user.year || '',
        year: user.year || user.Year || '',
        specialization: user.specialization || '',
        gender: user.gender || '',
        email: user.email || '',
        role: user.role || '',
        created_at: user.created_at || user.createdAt || '',
      };
    });
    
    console.log('[getUsers] Normalized first user:', usersArray[0]);
    return usersArray;
  }
  
  // Return empty array if structure is unexpected
  console.warn('[getUsers] Unexpected response structure, returning empty array');
  return [];
};

export const getUserById = async (userId) => {
  const response = await apiService.get(API_ENDPOINTS.USER_BY_ID(userId));
  
  // Log the raw response for debugging
  console.log('[getUserById] Raw API Response:', response);
  console.log('[getUserById] Response type:', typeof response);
  console.log('[getUserById] Is array:', Array.isArray(response));
  console.log('[getUserById] Has data:', !!response?.data);
  console.log('[getUserById] Has id:', !!response?.id);
  if (response) {
    console.log('[getUserById] Response keys:', Object.keys(response));
    if (response.data) {
      console.log('[getUserById] response.data type:', typeof response.data);
      console.log('[getUserById] response.data is array:', Array.isArray(response.data));
      if (Array.isArray(response.data) && response.data.length > 0) {
        console.log('[getUserById] response.data[0]:', response.data[0]);
      }
    }
  }
  
  let user = null;
  
  // Handle nested response structure (similar to getUsers - response.data[0])
  if (response && response.data) {
    if (Array.isArray(response.data) && response.data.length > 0) {
      // If data is an array, take the first element
      user = response.data[0];
      console.log('[getUserById] Using response.data[0] (nested array)');
    } else if (response.data && typeof response.data === 'object' && response.data.id) {
      // If data is an object with id
      user = response.data;
      console.log('[getUserById] Using response.data (object)');
    }
  } else if (response && response.id) {
    // If response is already the user object
    user = response;
    console.log('[getUserById] Using response directly');
  } else if (Array.isArray(response) && response.length > 0) {
    // If response is an array, take first element
    user = response[0];
    console.log('[getUserById] Using response[0] (array)');
  } else {
    console.warn('[getUserById] Unexpected response structure:', response);
    return response;
  }
  
  if (!user) {
    console.error('[getUserById] No user data found in response');
    return null;
  }
  
  console.log('[getUserById] User object:', user);
  console.log('[getUserById] User keys:', Object.keys(user || {}));
  console.log('[getUserById] first_name:', user?.first_name);
  console.log('[getUserById] firstName:', user?.firstName);
  console.log('[getUserById] last_name:', user?.last_name);
  console.log('[getUserById] lastName:', user?.lastName);
  console.log('[getUserById] email:', user?.email);
  console.log('[getUserById] Phone:', user?.Phone);
  
  // Normalize field names to ensure both formats are available
  const normalizedUser = {
    ...user,
    id: user.id || userId,
    // Ensure snake_case fields exist (preserve original if exists)
    first_name: user.first_name || user.firstName || user.FirstName || '',
    last_name: user.last_name || user.lastName || user.LastName || '',
    Phone: user.Phone || user.phone || '',
    phone: user.phone || user.Phone || '',
    Year: user.Year || user.year || '',
    year: user.year || user.Year || '',
    specialization: user.specialization || user.Specialization || '',
    gender: user.gender || user.Gender || '',
    email: user.email || user.Email || '',
    role: user.role || user.Role || 'User',
    created_at: user.created_at || user.createdAt || user.CreatedAt || '',
    updated_at: user.updated_at || user.updatedAt || user.UpdatedAt || '',
    email_verified_at: user.email_verified_at || user.emailVerifiedAt || user.EmailVerifiedAt || null,
  };
  
  console.log('[getUserById] Normalized user:', normalizedUser);
  return normalizedUser;
};

export const createUser = async (userData) => {
  return apiService.post(API_ENDPOINTS.USERS, userData);
};

export const updateUser = async (userId, userData) => {
  // Prepare the exact payload format required by the API
  const payload = {
    first_name: userData.first_name,
    last_name: userData.last_name,
    Phone: userData.Phone || userData.phone,
    email: userData.email,
    password: userData.password, // Required by API
    role: userData.role,
  };
  
  // Send PUT request to /api/User/{id}
  const response = await apiService.put(API_ENDPOINTS.USER_BY_ID(userId), payload);
  
  // Note: Backend returns old user object, so we'll use the submitted data instead
  // Return the payload with the userId for state update
  return {
    id: userId,
    ...payload,
  };
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
