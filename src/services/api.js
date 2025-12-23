/**
 * Base API Client
 * 
 * Standard HTTP client for API requests
 * Handles authentication, error handling, and response parsing
 */

import { getToken } from '../utils/tokenManager';
import { handleApiError } from '../utils/errorHandler';
import { env } from '../config/env';
import { API_ENDPOINTS } from '../constants';

/**
 * Build full URL for API request
 * @param {string} endpoint - API endpoint path
 * @returns {string} Full URL or relative path
 */
const buildUrl = (endpoint) => {
  // If endpoint is already a full URL, use as-is
  if (endpoint.startsWith('http://') || endpoint.startsWith('https://')) {
    return endpoint;
  }

  // In development, use relative paths (goes through Vite proxy)
  if (env.DEV) {
    return endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  }

  // In production, use full URL
  if (env.API_BASE_URL) {
    const baseUrl = env.API_BASE_URL.replace(/\/$/, '');
    const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    return `${baseUrl}${path}`;
  }

  // Fallback: relative path
  return endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
};

/**
 * Core API client function
 * @param {string} endpoint - API endpoint
 * @param {Object} options - Fetch options
 * @returns {Promise} API response
 */
const apiClient = async (endpoint, options = {}) => {
  const url = buildUrl(endpoint);
  const token = getToken();

  // Prepare headers
  const headers = {
    ...options.headers,
  };

  // Add Authorization header if token exists (exclude for login endpoint)
  const isLoginEndpoint = endpoint === API_ENDPOINTS.LOGIN || url.includes('/api/login');
  if (token && !isLoginEndpoint) {
    headers['Authorization'] = `Bearer ${token}`;
  } else if (!token && !isLoginEndpoint && env.DEV) {
    // Warn in development if token is missing for protected endpoints
    console.warn('⚠️ [API] No token found for protected endpoint:', endpoint);
  }

  // Add Accept header for JSON responses
  if (!headers['Accept']) {
    headers['Accept'] = 'application/json';
  }
  
  // Add Content-Type for requests with body
  const hasBody = options.body !== undefined && options.body !== null && 
                  options.method !== 'GET' && options.method !== 'HEAD';
  
  if (hasBody && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  // Log request details in development mode
  if (env.DEV) {
    console.log('📤 [API] Request:', {
      method: options.method || 'GET',
      url: url,
      hasToken: !!token,
      headers: {
        'Content-Type': headers['Content-Type'],
        'Accept': headers['Accept'],
        'Authorization': token ? `Bearer ${token.substring(0, 20)}...` : 'Not set',
      },
    });
  }

  // Prepare fetch options
  const fetchOptions = {
    ...options,
    headers,
  };

  // Handle request body
  if (options.method === 'GET' || options.method === 'HEAD') {
    delete fetchOptions.body;
  } else if (hasBody) {
    // Stringify body if it's an object
    if (typeof options.body === 'object' && !(options.body instanceof FormData)) {
      fetchOptions.body = JSON.stringify(options.body);
    } else {
      fetchOptions.body = options.body;
    }
  }

  try {
    const response = await fetch(url, fetchOptions);

    // Handle 401 Unauthorized
    if (response.status === 401) {
      window.dispatchEvent(new CustomEvent('auth:unauthorized'));
      const error = new Error('غير مصرح لك بالوصول. يرجى تسجيل الدخول مرة أخرى');
      error.status = 401;
      throw error;
    }

    // Handle error responses
    if (!response.ok) {
      let errorData;
      const contentType = response.headers.get('content-type');

      try {
        if (contentType && contentType.includes('application/json')) {
          errorData = await response.json();
        } else {
          const text = await response.text();
          // If text is empty, try to get more info from status
          if (!text || text.trim() === '') {
            errorData = { 
              message: `Server error (${response.status})`,
              status: response.status,
              statusText: response.statusText
            };
          } else {
            errorData = { message: text };
          }
        }
      } catch (parseError) {
        // If we can't parse the error, provide more context
        errorData = { 
          message: `Server error (${response.status}): ${response.statusText || 'Unknown error'}`,
          status: response.status,
          statusText: response.statusText
        };
      }

      const error = new Error(errorData?.message || errorData?.error || `Server error (${response.status})`);
      error.status = response.status;
      error.response = errorData;
      
      // Log error details in development
      if (env.DEV) {
        console.error('API Error:', {
          status: response.status,
          statusText: response.statusText,
          url: url,
          errorData: errorData
        });
      }
      
      throw error;
    }

    // Parse successful response
    const contentType = response.headers.get('content-type') || '';

    if (contentType.includes('application/json')) {
      const data = await response.json();
      
      // For login endpoint, return full response object so AuthContext can handle it
      // For other endpoints, unwrap if wrapped
      if (isLoginEndpoint) {
        return data;
      }
      
      // Handle API response wrapper: { code, message, data }
      if (data && typeof data === 'object' && 'data' in data && 'code' in data) {
        return data.data;
      }
      
      return data;
    }

    // For non-JSON responses, return text
    return await response.text();
  } catch (error) {
    // Handle network/CORS errors
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      const networkError = new Error('لا يمكن الاتصال بالخادم');
      networkError.status = 0;
      networkError.networkError = true;
      throw networkError;
    }

    // Use error handler for normalization
    throw handleApiError(error);
  }
};

/**
 * API methods
 */
export const api = {
  /**
   * GET request
   * @param {string} endpoint - API endpoint
   * @param {Object} options - Optional fetch options
   * @returns {Promise} API response
   */
  get: (endpoint, options = {}) => {
    return apiClient(endpoint, { ...options, method: 'GET' });
  },

  /**
   * POST request
   * @param {string} endpoint - API endpoint
   * @param {Object|undefined} data - Request body (optional)
   * @param {Object} options - Optional fetch options
   * @returns {Promise} API response
   */
  post: (endpoint, data, options = {}) => {
    const requestOptions = {
      ...options,
      method: 'POST',
    };
    // Only include body if data is provided
    if (data !== undefined && data !== null) {
      requestOptions.body = data;
    }
    return apiClient(endpoint, requestOptions);
  },

  /**
   * PUT request
   * @param {string} endpoint - API endpoint
   * @param {Object} data - Request body
   * @param {Object} options - Optional fetch options
   * @returns {Promise} API response
   */
  put: (endpoint, data, options = {}) => {
    return apiClient(endpoint, {
      ...options,
      method: 'PUT',
      body: data,
    });
  },

  /**
   * PATCH request
   * @param {string} endpoint - API endpoint
   * @param {Object} data - Request body
   * @param {Object} options - Optional fetch options
   * @returns {Promise} API response
   */
  patch: (endpoint, data, options = {}) => {
    return apiClient(endpoint, {
      ...options,
      method: 'PATCH',
      body: data,
    });
  },

  /**
   * DELETE request
   * @param {string} endpoint - API endpoint
   * @param {Object} options - Optional fetch options
   * @returns {Promise} API response
   */
  delete: (endpoint, options = {}) => {
    return apiClient(endpoint, { ...options, method: 'DELETE' });
  },

  /**
   * Login (for backward compatibility)
   * @param {string} email - User email
   * @param {string} password - User password
   * @returns {Promise} Login response
   */
  login: async (email, password) => {
    return api.post(API_ENDPOINTS.LOGIN, { email, password });
  },

  /**
   * Logout (for backward compatibility)
   * @returns {Promise} Logout response
   */
  logout: async () => {
    return api.post(API_ENDPOINTS.LOGOUT);
  },
};

export default api;
