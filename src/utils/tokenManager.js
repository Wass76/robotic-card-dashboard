const TOKEN_KEY = 'authToken';
const TOKEN_EXPIRY_KEY = 'tokenExpiresAt';
const DEFAULT_EXPIRY_HOURS = 24;

// Store token with expiration
export const setToken = (token, expiresInHours = DEFAULT_EXPIRY_HOURS) => {
  const expiresAt = Date.now() + (expiresInHours * 60 * 60 * 1000);
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(TOKEN_EXPIRY_KEY, expiresAt.toString());
};

// Get token if valid
export const getToken = () => {
  const token = localStorage.getItem(TOKEN_KEY);
  const expiresAt = localStorage.getItem(TOKEN_EXPIRY_KEY);
  
  if (!token || !expiresAt) {
    return null;
  }
  
  if (Date.now() > parseInt(expiresAt)) {
    clearToken();
    return null;
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

