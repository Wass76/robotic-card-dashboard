// Parse and format API errors
export const handleApiError = (error) => {
  // Handle HTML error responses (like Cloudflare 502 pages)
  if (error.isHtmlResponse) {
    return {
      message: error.message || 'الخادم غير متاح حالياً. يرجى المحاولة مرة أخرى لاحقاً',
      status: error.status,
      data: null,
      networkError: false,
      isHtmlResponse: true
    };
  }
  
  // Handle CORS errors
  if (error.corsError) {
    return {
      message: error.message || 'خطأ في إعدادات CORS على الخادم. يرجى التحقق من إعدادات الخادم.',
      status: 0,
      data: null,
      networkError: true,
      corsError: true,
      originalMessage: error.originalMessage
    };
  }

  // Handle fetch-style errors (from ApiService)
  if (error.status !== undefined) {
    // Check if error message contains HTML
    const errorMessage = error.message || '';
    if (errorMessage.includes('<!DOCTYPE html>') || errorMessage.includes('<html')) {
      // Extract status from HTML if possible, or use error.status
      let status = error.status;
      const statusMatch = errorMessage.match(/Error code (\d+)/);
      if (statusMatch) {
        status = parseInt(statusMatch[1]);
      }
      
      return {
        message: status === 502 
          ? 'الخادم غير متاح حالياً. يرجى المحاولة مرة أخرى لاحقاً'
          : status === 503
          ? 'الخادم قيد الصيانة. يرجى المحاولة مرة أخرى لاحقاً'
          : status === 504
          ? 'انتهت مهلة الاتصال بالخادم. يرجى المحاولة مرة أخرى'
          : 'خطأ في الاتصال بالخادم. يرجى المحاولة مرة أخرى',
        status: status,
        data: null,
        networkError: false,
        isHtmlResponse: true
      };
    }
    
    // Server responded with error
    return {
      message: error.response?.message || error.response?.error || error.message || 'حدث خطأ في الخادم',
      status: error.status,
      data: error.response,
      response: error.response // Keep for backward compatibility
    };
  }
  
  // Handle axios-style errors (backward compatibility)
  if (error.response) {
    // Server responded with error
    return {
      message: error.response.data?.message || error.response.data?.error || 'حدث خطأ في الخادم',
      status: error.response.status,
      data: error.response.data
    };
  } else if (error.request) {
    // Request made but no response
    return {
      message: 'لا يمكن الاتصال بالخادم',
      status: 0,
      networkError: true
    };
  } else {
    // Error in request setup
    return {
      message: error.message || 'حدث خطأ غير متوقع',
      status: null
    };
  }
};

/**
 * Get user-friendly error message in Arabic
 */
export const getErrorMessage = (error) => {
  if (typeof error === 'string') {
    return error;
  }

  const apiError = handleApiError(error);
  
  // Map common error codes to Arabic messages
  const errorMessages = {
    400: 'طلب غير صحيح',
    401: 'غير مصرح لك بالوصول. يرجى تسجيل الدخول مرة أخرى',
    403: 'غير مسموح لك بهذا الإجراء',
    404: 'الصفحة أو المورد غير موجود',
    408: 'انتهت مهلة الطلب. يرجى المحاولة مرة أخرى',
    409: 'تعارض في البيانات',
    422: 'البيانات المرسلة غير صحيحة',
    429: 'تم تجاوز الحد المسموح. يرجى المحاولة لاحقاً',
    500: 'خطأ في الخادم. يرجى المحاولة لاحقاً',
    502: 'الخادم غير متاح حالياً. يرجى المحاولة مرة أخرى لاحقاً',
    503: 'الخدمة غير متاحة حالياً. يرجى المحاولة لاحقاً',
    504: 'انتهت مهلة الاتصال بالخادم. يرجى المحاولة مرة أخرى',
  };

  // Return specific message if available
  if (apiError.status && errorMessages[apiError.status]) {
    return errorMessages[apiError.status];
  }

  // Return generic message
  return apiError.message || 'حدث خطأ غير متوقع';
};

/**
 * Check if error is retryable
 */
export const isRetryableError = (error) => {
  const retryableStatuses = [408, 429, 500, 502, 503, 504];
  const status = error.status || error.response?.status;
  return status && retryableStatuses.includes(status);
};

/**
 * Get error severity
 */
export const getErrorSeverity = (error) => {
  const status = error.status || error.response?.status;
  
  if (!status) return 'error';
  
  if (status >= 500) return 'error';
  if (status >= 400) return 'warning';
  
  return 'info';
};

// Log error with context
export const logError = (error, context = {}) => {
  console.error('Error:', {
    error,
    context,
    timestamp: new Date().toISOString()
  });
  
  // Could send to error tracking service here
};

// Check if error is network-related
export const isNetworkError = (error) => {
  return !error.response && error.request;
};

