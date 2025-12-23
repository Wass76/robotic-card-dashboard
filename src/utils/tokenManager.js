const TOKEN_KEY = 'authToken';
const TOKEN_EXPIRY_KEY = 'tokenExpiresAt';
const DEFAULT_EXPIRY_HOURS = 24;

// Store token with expiration
export const setToken = (token, expiresInHours = DEFAULT_EXPIRY_HOURS) => {
  const expiresAt = Date.now() + (expiresInHours * 60 * 60 * 1000);
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(TOKEN_EXPIRY_KEY, expiresAt.toString());
  
  if (process.env.NODE_ENV === 'development') {
    console.log('💾 [TokenManager] Token stored');
    console.log('🔐 Token preview:', token.substring(0, 30) + '...');
    console.log('⏰ Expires at:', new Date(expiresAt).toLocaleString());
    console.log('⏰ Expires in:', expiresInHours, 'hours');
  }
};

// Get token if valid
export const getToken = () => {
  const token = localStorage.getItem(TOKEN_KEY);
  const expiresAt = localStorage.getItem(TOKEN_EXPIRY_KEY);
  
  if (process.env.NODE_ENV === 'development') {
    console.log('🔑 [TokenManager] getToken called');
    console.log('📋 Token exists:', !!token);
    console.log('⏰ Expiry exists:', !!expiresAt);
    if (token) {
      console.log('🔐 Token preview:', token.substring(0, 30) + '...');
    }
    if (expiresAt) {
      const expiryDate = new Date(parseInt(expiresAt));
      const now = new Date();
      console.log('⏰ Token expires at:', expiryDate.toLocaleString());
      console.log('⏰ Current time:', now.toLocaleString());
      console.log('⏰ Is expired:', Date.now() > parseInt(expiresAt));
    }
  }
  
  if (!token || !expiresAt) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('⚠️ [TokenManager] No token or expiry found');
    }
    return null;
  }
  
  if (Date.now() > parseInt(expiresAt)) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('⚠️ [TokenManager] Token expired, clearing');
    }
    clearToken();
    return null;
  }
  
  if (process.env.NODE_ENV === 'development') {
    console.log('✅ [TokenManager] Valid token found');
  }
  return token;
};

// Remove token
export const clearToken = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(TOKEN_EXPIRY_KEY);
};

// Check if token is valid
export const isTokenValid = () => {
  return getToken() !== null;
};

// Get token expiration time
export const getTokenExpiration = () => {
  const expiresAt = localStorage.getItem(TOKEN_EXPIRY_KEY);
  return expiresAt ? parseInt(expiresAt) : null;
};

