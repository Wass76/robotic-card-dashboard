import env from '../config/env';
import { getToken, clearToken } from '../utils/tokenManager';
import { handleApiError } from '../utils/errorHandler';
import { transformApiToFrontend, transformFrontendToApi } from '../utils/dataTransformers';

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
          console.warn(`Retrying request (${retryCount + 1}/${this.retryConfig.maxRetries}) after ${delay}ms`);
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
    
    // Handle non-JSON responses (including HTML error pages)
    if (!response.ok) {
      const text = await response.text();
      
      // Check if response is HTML (like Cloudflare error pages)
      if (contentType && contentType.includes('text/html')) {
        let errorMessage = `Server error (${response.status})`;
        
        // Provide specific messages for common errors
        if (response.status === 502) {
          errorMessage = 'الخادم غير متاح حالياً. يرجى المحاولة مرة أخرى لاحقاً';
        } else if (response.status === 503) {
          errorMessage = 'الخادم قيد الصيانة. يرجى المحاولة مرة أخرى لاحقاً';
        } else if (response.status === 504) {
          errorMessage = 'انتهت مهلة الاتصال بالخادم. يرجى المحاولة مرة أخرى';
        } else if (response.status === 500) {
          errorMessage = 'خطأ في الخادم. يرجى المحاولة مرة أخرى';
        } else {
          errorMessage = `خطأ في الاتصال (${response.status})`;
        }
        
        const error = new Error(errorMessage);
        error.status = response.status;
        error.isHtmlResponse = true;
        error.originalResponse = text.substring(0, 200); // Store first 200 chars for debugging
        throw error;
      }
      
      // For other non-JSON responses
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
    // In development, use relative URLs to leverage Vite proxy (avoids CORS)
    // In production, use full URL
    let url;
    if (endpoint.startsWith('http')) {
      url = endpoint;
    } else if (env.DEV && this.baseURL) {
      // Use relative URL in development to go through Vite proxy
      url = endpoint;
    } else {
      // Use full URL in production or when no proxy is available
      url = `${this.baseURL}${endpoint}`;
    }

    // Prepare config
    let config = {
      method: options.method || 'GET',
      headers: {
        ...this.getDefaultHeaders(),
        ...options.headers,
      },
      ...options,
    };

    // Transform request body if present (camelCase to snake_case)
    if (config.body && typeof config.body === 'string') {
      try {
        const bodyData = JSON.parse(config.body);
        const transformed = transformFrontendToApi(bodyData);
        config.body = JSON.stringify(transformed);
      } catch {
        // Not JSON, skip transformation
      }
    }

    // Apply request interceptors
    config = await this.applyRequestInterceptors(config);

    // Log request if enabled
    if (this.enableLogging) {
      console.info(`[API Request] ${config.method} ${endpoint}`, {
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
      let response;
      try {
        response = await Promise.race([fetchPromise, timeoutPromise]);
      } catch (error) {
        // Handle timeout or other errors
        if (error.message && error.message.includes('timeout')) {
          const timeoutError = new Error('Request timeout');
          timeoutError.status = 408;
          timeoutError.timeout = true;
          throw timeoutError;
        }
        throw error;
      }
      
      // Apply response interceptors
      const modifiedResponse = await this.applyResponseInterceptors(response);
      
      // Handle response
      return this.handleResponse(modifiedResponse);
    };

    try {
      // Execute request with retry logic
      const data = await this.retryRequest(requestFn);
      
      // Transform response (snake_case to camelCase)
      const transformedData = transformApiToFrontend(data);
      
      if (this.enableLogging) {
        console.info(`[API Response] ${config.method} ${endpoint}`, transformedData);
      }
      
      return transformedData;
    } catch (error) {
      // Ensure error has consistent structure
      if (!error.status && error.name === 'TypeError' && error.message.includes('fetch')) {
        // Network error - fetch failed
        error.networkError = true;
        error.status = 0;
      }
      
      // Apply error interceptors
      const modifiedError = await this.applyErrorInterceptors(error);
      
      // Log error if enabled
      if (this.enableLogging) {
        console.error(`[API Error] ${config.method} ${endpoint}`, modifiedError);
      }
      
      // Handle API error - create Error instance with structured data
      const apiErrorData = handleApiError(modifiedError);
      const apiError = new Error(apiErrorData.message);
      apiError.status = apiErrorData.status;
      apiError.data = apiErrorData.data;
      apiError.networkError = apiErrorData.networkError;
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
      console.info(`[MOCK API] ${options.method || 'GET'} ${endpoint}`, options);
    }

    // Import mock handlers
    const { handleMockRequest } = await import('./mockHandlers');
    return handleMockRequest(endpoint, options);
  }

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
  // Note: X-Request-Time header removed to avoid CORS issues
  // If needed for debugging, can be added server-side or via allowed headers
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

