# Phase 4: Detailed Execution Plan - Code Quality & Validation

## Overview
Improve code quality, add comprehensive validation, implement error boundaries, fix naming inconsistencies, and extract all magic numbers/strings. This phase focuses on making the codebase more robust, maintainable, and production-ready.

**Estimated Time:** 5-7 days  
**Prerequisites:** Phase 1, Phase 2, and Phase 3 must be completed  
**Dependencies:** All components, Context, hooks, and API service from previous phases

---

## Step 4.1: Enhance Input Validation

### Task
Improve and expand the validation system with more validators, better error messages, and validation schemas for all forms.

### 4.1.1: Enhance Validators

**File:** `src/utils/validators.js` (Update)

**Add New Validators:**
```javascript
// ... existing validators ...

/**
 * Validate Arabic name (allows Arabic characters, spaces, and common punctuation)
 */
export const validateArabicName = (name) => {
  if (!name || typeof name !== 'string') return false;
  // Arabic Unicode range: \u0600-\u06FF
  const arabicPattern = /^[\u0600-\u06FF\s\-'\.]+$/;
  return arabicPattern.test(name.trim());
};

/**
 * Validate English name (allows English characters, spaces, and common punctuation)
 */
export const validateEnglishName = (name) => {
  if (!name || typeof name !== 'string') return false;
  const englishPattern = /^[a-zA-Z\s\-'\.]+$/;
  return englishPattern.test(name.trim());
};

/**
 * Validate name (supports both Arabic and English)
 */
export const validateName = (name) => {
  return validateArabicName(name) || validateEnglishName(name);
};

/**
 * Validate phone number with multiple formats
 * Supports: 10 digits, +963 format, 0-prefixed
 */
export const validatePhoneAdvanced = (phone) => {
  if (!phone || typeof phone !== 'string') return false;
  
  // Remove spaces, dashes, and parentheses
  const cleaned = phone.replace(/[\s\-\(\)]/g, '');
  
  // Check for 10 digits (0987654321)
  if (/^0\d{9}$/.test(cleaned)) return true;
  
  // Check for +963 format (+963987654321)
  if (/^\+963\d{9}$/.test(cleaned)) return true;
  
  // Check for 963 prefix (963987654321)
  if (/^963\d{9}$/.test(cleaned)) return true;
  
  // Check for 10 digits without prefix
  if (/^\d{10}$/.test(cleaned)) return true;
  
  return false;
};

/**
 * Validate password strength
 * Requirements: min 6 chars, at least one letter and one number
 */
export const validatePasswordStrength = (password) => {
  if (!password || password.length < 6) return false;
  
  const hasLetter = /[a-zA-Z\u0600-\u06FF]/.test(password);
  const hasNumber = /\d/.test(password);
  
  return hasLetter && hasNumber;
};

/**
 * Validate card ID format
 * Supports alphanumeric, typically 4-20 characters
 */
export const validateCardIdFormat = (cardId) => {
  if (!cardId || typeof cardId !== 'string') return false;
  const trimmed = cardId.trim();
  return trimmed.length >= 4 && trimmed.length <= 20 && /^[a-zA-Z0-9]+$/.test(trimmed);
};

/**
 * Validate date format (YYYY-MM-DD)
 */
export const validateDateFormat = (date) => {
  if (!date || typeof date !== 'string') return false;
  const datePattern = /^\d{4}-\d{2}-\d{2}$/;
  if (!datePattern.test(date)) return false;
  
  const dateObj = new Date(date);
  return dateObj instanceof Date && !isNaN(dateObj);
};

/**
 * Validate date is not in the future
 */
export const validateDateNotFuture = (date) => {
  if (!date) return true; // Optional field
  const dateObj = new Date(date);
  return dateObj <= new Date();
};

/**
 * Validate date is not too old (e.g., not more than 100 years ago)
 */
export const validateDateNotTooOld = (date, maxYears = 100) => {
  if (!date) return true; // Optional field
  const dateObj = new Date(date);
  const minDate = new Date();
  minDate.setFullYear(minDate.getFullYear() - maxYears);
  return dateObj >= minDate;
};

/**
 * Validate role (must be Admin or User)
 */
export const validateRole = (role) => {
  return role === 'Admin' || role === 'User';
};

/**
 * Validate status (must be active or inactive)
 */
export const validateStatus = (status) => {
  return status === 'active' || status === 'inactive';
};

/**
 * Validate URL format
 */
export const validateUrl = (url) => {
  if (!url || typeof url !== 'string') return false;
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

/**
 * Validate positive number
 */
export const validatePositiveNumber = (value) => {
  const num = Number(value);
  return !isNaN(num) && num > 0;
};

/**
 * Validate non-negative number
 */
export const validateNonNegativeNumber = (value) => {
  const num = Number(value);
  return !isNaN(num) && num >= 0;
};

/**
 * Validate integer
 */
export const validateInteger = (value) => {
  const num = Number(value);
  return !isNaN(num) && Number.isInteger(num);
};
```

### 4.1.2: Create Validation Schemas

**File:** `src/utils/validationSchemas.js`

**Implementation:**
```javascript
import {
  validateRequired,
  validateEmail,
  validatePhone,
  validatePhoneAdvanced,
  validatePassword,
  validatePasswordStrength,
  validateName,
  validateArabicName,
  validateCardIdFormat,
  validateRole,
  validateStatus,
  validateDateFormat,
  validateDateNotFuture,
} from './validators';

/**
 * User creation/update validation schema
 */
export const userSchema = {
  first_name: {
    required: true,
    requiredMessage: 'الاسم الأول مطلوب',
    validator: (value) => {
      if (!validateRequired(value)) return 'الاسم الأول مطلوب';
      if (!validateName(value)) return 'الاسم الأول يجب أن يحتوي على أحرف فقط';
      if (value.trim().length < 2) return 'الاسم الأول يجب أن يكون على الأقل حرفين';
      if (value.trim().length > 50) return 'الاسم الأول يجب أن يكون على الأكثر 50 حرفاً';
      return null;
    },
  },
  last_name: {
    required: true,
    requiredMessage: 'اسم العائلة مطلوب',
    validator: (value) => {
      if (!validateRequired(value)) return 'اسم العائلة مطلوب';
      if (!validateName(value)) return 'اسم العائلة يجب أن يحتوي على أحرف فقط';
      if (value.trim().length < 2) return 'اسم العائلة يجب أن يكون على الأقل حرفين';
      if (value.trim().length > 50) return 'اسم العائلة يجب أن يكون على الأكثر 50 حرفاً';
      return null;
    },
  },
  email: {
    required: true,
    requiredMessage: 'البريد الإلكتروني مطلوب',
    validator: (value) => {
      if (!validateRequired(value)) return 'البريد الإلكتروني مطلوب';
      if (!validateEmail(value)) return 'البريد الإلكتروني غير صحيح';
      return null;
    },
  },
  phone: {
    required: true,
    requiredMessage: 'رقم الهاتف مطلوب',
    validator: (value) => {
      if (!validateRequired(value)) return 'رقم الهاتف مطلوب';
      if (!validatePhoneAdvanced(value)) return 'رقم الهاتف غير صحيح (يجب أن يكون 10 أرقام)';
      return null;
    },
  },
  password: {
    required: false, // Not required for updates
    validator: (value, allValues) => {
      // Only validate if password is provided (for create or password change)
      if (!value && !allValues.id) {
        return 'كلمة المرور مطلوبة';
      }
      if (value && !validatePasswordStrength(value)) {
        return 'كلمة المرور يجب أن تحتوي على 6 أحرف على الأقل وتتضمن حروف وأرقام';
      }
      return null;
    },
  },
  role: {
    required: false,
    validator: (value) => {
      if (value && !validateRole(value)) {
        return 'الدور يجب أن يكون Admin أو User';
      }
      return null;
    },
  },
};

/**
 * Card creation/update validation schema
 */
export const cardSchema = {
  card_id: {
    required: true,
    requiredMessage: 'رقم البطاقة مطلوب',
    validator: (value) => {
      if (!validateRequired(value)) return 'رقم البطاقة مطلوب';
      if (!validateCardIdFormat(value)) return 'رقم البطاقة غير صحيح (يجب أن يكون 4-20 حرف/رقم)';
      return null;
    },
  },
  user_id: {
    required: true,
    requiredMessage: 'المستخدم مطلوب',
    validator: (value) => {
      if (!validateRequired(value)) return 'المستخدم مطلوب';
      if (!validatePositiveNumber(value)) return 'معرف المستخدم غير صحيح';
      return null;
    },
  },
  status: {
    required: false,
    validator: (value) => {
      if (value && !validateStatus(value)) {
        return 'الحالة يجب أن تكون active أو inactive';
      }
      return null;
    },
  },
};

/**
 * Login validation schema
 */
export const loginSchema = {
  email: {
    required: true,
    requiredMessage: 'البريد الإلكتروني مطلوب',
    validator: (value) => {
      if (!validateRequired(value)) return 'البريد الإلكتروني مطلوب';
      if (!validateEmail(value)) return 'البريد الإلكتروني غير صحيح';
      return null;
    },
  },
  password: {
    required: true,
    requiredMessage: 'كلمة المرور مطلوبة',
    validator: (value) => {
      if (!validateRequired(value)) return 'كلمة المرور مطلوبة';
      if (value.length < 6) return 'كلمة المرور يجب أن تكون 6 أحرف على الأقل';
      return null;
    },
  },
};
```

### 4.1.3: Update Components to Use Validation Schemas

**Files to Update:**
- `src/components/users/UserForm.jsx` - Use `userSchema`
- `src/components/cards/CardForm.jsx` - Use `cardSchema`
- `src/components/auth/Login.jsx` - Use `loginSchema`

### Actions:
1. Update `src/utils/validators.js` with new validators
2. Create `src/utils/validationSchemas.js`
3. Update UserForm to use userSchema
4. Update CardForm to use cardSchema
5. Update Login to use loginSchema
6. Test all validations

### Verification:
- All new validators work
- Validation schemas are used
- Error messages are in Arabic
- Forms validate correctly

---

## Step 4.2: Add Error Boundaries

### Task
Implement React Error Boundaries to catch and handle errors gracefully, preventing the entire app from crashing.

### 4.2.1: Create ErrorBoundary Component

**File:** `src/components/common/ErrorBoundary.jsx`

**Implementation:**
```javascript
import React from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { Button } from './Button';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null,
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      error,
      errorId: `error-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    };
  }

  componentDidCatch(error, errorInfo) {
    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Error caught by boundary:', error, errorInfo);
    }

    // Log error details
    this.setState({
      errorInfo,
    });

    // In production, you could log to an error reporting service
    // Example: logErrorToService(error, errorInfo, this.state.errorId);
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null,
    });
  };

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback(this.state.error, this.handleReset);
      }

      // Default fallback UI
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4" dir="rtl">
          <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-10 h-10 text-red-600" />
            </div>
            
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              حدث خطأ غير متوقع
            </h2>
            
            <p className="text-gray-600 mb-6">
              نعتذر، حدث خطأ في التطبيق. يرجى المحاولة مرة أخرى.
            </p>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <div className="mb-6 p-4 bg-red-50 rounded-lg text-left">
                <p className="text-sm font-semibold text-red-800 mb-2">تفاصيل الخطأ:</p>
                <p className="text-xs text-red-700 font-mono break-all">
                  {this.state.error.toString()}
                </p>
                {this.state.errorInfo && (
                  <details className="mt-2">
                    <summary className="text-xs text-red-600 cursor-pointer">
                      مكونات المكدس
                    </summary>
                    <pre className="text-xs text-red-700 mt-2 overflow-auto max-h-40">
                      {this.state.errorInfo.componentStack}
                    </pre>
                  </details>
                )}
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                variant="primary"
                onClick={this.handleReset}
                className="flex-1"
              >
                <RefreshCw className="w-4 h-4 ml-2" />
                إعادة المحاولة
              </Button>
              
              <Button
                variant="secondary"
                onClick={this.handleReload}
                className="flex-1"
              >
                <RefreshCw className="w-4 h-4 ml-2" />
                إعادة تحميل الصفحة
              </Button>
              
              <Button
                variant="secondary"
                onClick={this.handleGoHome}
                className="flex-1"
              >
                <Home className="w-4 h-4 ml-2" />
                الصفحة الرئيسية
              </Button>
            </div>

            {this.state.errorId && (
              <p className="text-xs text-gray-500 mt-4">
                معرف الخطأ: {this.state.errorId}
              </p>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
```

### 4.2.2: Create ErrorFallback Component

**File:** `src/components/common/ErrorFallback.jsx`

**Implementation:**
```javascript
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from './Button';

/**
 * Simple error fallback component for inline errors
 */
export const ErrorFallback = ({ error, resetError }) => {
  return (
    <div className="p-4 bg-red-50 border border-red-200 rounded-lg" dir="rtl">
      <div className="flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-red-800 mb-1">
            حدث خطأ
          </h3>
          <p className="text-sm text-red-700 mb-3">
            {error?.message || 'حدث خطأ غير متوقع'}
          </p>
          {resetError && (
            <Button
              variant="secondary"
              size="sm"
              onClick={resetError}
            >
              <RefreshCw className="w-4 h-4 ml-2" />
              إعادة المحاولة
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
```

### 4.2.3: Wrap App with ErrorBoundary

**File:** `src/App.jsx` (Update)

**Changes:**
```javascript
import ErrorBoundary from './components/common/ErrorBoundary';

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <AppProvider>
          <AppContent />
        </AppProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}
```

### 4.2.4: Add Error Boundaries to Key Sections

**Files to Update:**
- Wrap Dashboard component
- Wrap UsersManagement component
- Wrap CardsManagement component
- Wrap AttendanceRecords component

**Example:**
```javascript
// In App.jsx or individual components
<ErrorBoundary fallback={(error, reset) => <ErrorFallback error={error} resetError={reset} />}>
  <Dashboard />
</ErrorBoundary>
```

### Actions:
1. Create `src/components/common/ErrorBoundary.jsx`
2. Create `src/components/common/ErrorFallback.jsx`
3. Update `src/App.jsx` to wrap with ErrorBoundary
4. Add ErrorBoundary to key sections
5. Test error boundaries

### Verification:
- ErrorBoundary catches errors
- Fallback UI displays correctly
- Reset functionality works
- Error details shown in development

---

## Step 4.3: Fix Naming Inconsistencies

### Task
Standardize naming conventions throughout the codebase to ensure consistency.

### 4.3.1: Identify Naming Issues

**Issues to Fix:**
1. `Phone` vs `phone` - Standardize to `phone` (camelCase)
2. `card_id` vs `cardId` - Use `cardId` in JavaScript, `card_id` for API
3. `user_id` vs `userId` - Use `userId` in JavaScript, `user_id` for API
4. `first_name` vs `firstName` - Use `firstName` in JavaScript, `first_name` for API
5. `last_name` vs `lastName` - Use `lastName` in JavaScript, `last_name` for API
6. `created_at` vs `createdAt` - Use `createdAt` in JavaScript, `created_at` for API

### 4.3.2: Create Data Transformation Utilities

**File:** `src/utils/dataTransformers.js`

**Implementation:**
```javascript
/**
 * Transform API response to frontend format (snake_case to camelCase)
 */
export const transformApiToFrontend = (data) => {
  if (Array.isArray(data)) {
    return data.map(transformApiToFrontend);
  }

  if (data && typeof data === 'object' && !(data instanceof Date)) {
    const transformed = {};
    
    for (const key in data) {
      const camelKey = snakeToCamel(key);
      transformed[camelKey] = transformApiToFrontend(data[key]);
    }
    
    return transformed;
  }

  return data;
};

/**
 * Transform frontend data to API format (camelCase to snake_case)
 */
export const transformFrontendToApi = (data) => {
  if (Array.isArray(data)) {
    return data.map(transformFrontendToApi);
  }

  if (data && typeof data === 'object' && !(data instanceof Date)) {
    const transformed = {};
    
    for (const key in data) {
      const snakeKey = camelToSnake(key);
      transformed[snakeKey] = transformFrontendToApi(data[key]);
    }
    
    return transformed;
  }

  return data;
};

/**
 * Convert snake_case to camelCase
 */
const snakeToCamel = (str) => {
  return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
};

/**
 * Convert camelCase to snake_case
 */
const camelToSnake = (str) => {
  return str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
};

/**
 * Transform user object
 */
export const transformUser = (user) => {
  if (!user) return null;
  
  return {
    id: user.id,
    firstName: user.first_name || user.firstName,
    lastName: user.last_name || user.lastName,
    email: user.email,
    phone: user.phone || user.Phone,
    role: user.role,
    createdAt: user.created_at || user.createdAt,
    cardId: user.card_id || user.cardId,
    status: user.status,
    lastSeen: user.last_seen || user.lastSeen,
  };
};

/**
 * Transform user object back to API format
 */
export const transformUserToApi = (user) => {
  if (!user) return null;
  
  return {
    id: user.id,
    first_name: user.firstName,
    last_name: user.lastName,
    email: user.email,
    Phone: user.phone, // API expects Phone
    phone: user.phone,
    role: user.role,
    created_at: user.createdAt,
    card_id: user.cardId,
    status: user.status,
    last_seen: user.lastSeen,
  };
};

/**
 * Transform card object
 */
export const transformCard = (card) => {
  if (!card) return null;
  
  return {
    id: card.id,
    cardId: card.card_id || card.cardId,
    userId: card.user_id || card.userId,
    status: card.status,
  };
};

/**
 * Transform card object back to API format
 */
export const transformCardToApi = (card) => {
  if (!card) return null;
  
  return {
    id: card.id,
    card_id: card.cardId,
    user_id: card.userId,
    status: card.status,
  };
};

/**
 * Transform attendance record
 */
export const transformAttendance = (attendance) => {
  if (!attendance) return null;
  
  return {
    id: attendance.id,
    userId: attendance.user_id || attendance.userId,
    userName: attendance.user_name || attendance.userName,
    cardId: attendance.card_id || attendance.cardId,
    timestamp: attendance.timestamp,
    type: attendance.type,
    method: attendance.method,
  };
};
```

### 4.3.3: Update API Service to Use Transformers

**File:** `src/services/ApiService.js` (Update)

**Add transformation in request/response:**
```javascript
import { transformApiToFrontend, transformFrontendToApi } from '../utils/dataTransformers';

// In request method, transform outgoing data
async request(endpoint, options = {}) {
  // ... existing code ...
  
  // Transform request body if present
  if (config.body && typeof config.body === 'string') {
    try {
      const bodyData = JSON.parse(config.body);
      const transformed = transformFrontendToApi(bodyData);
      config.body = JSON.stringify(transformed);
    } catch (e) {
      // Not JSON, skip transformation
    }
  }
  
  // ... make request ...
  
  // Transform response
  const data = await this.handleResponse(response);
  return transformApiToFrontend(data);
}
```

### 4.3.4: Update Components to Use camelCase

**Files to Update:**
- All components using `first_name` → `firstName`
- All components using `last_name` → `lastName`
- All components using `card_id` → `cardId`
- All components using `user_id` → `userId`
- All components using `Phone` → `phone`
- All components using `created_at` → `createdAt`

### Actions:
1. Create `src/utils/dataTransformers.js`
2. Update ApiService to use transformers
3. Update all components to use camelCase
4. Update Context to use camelCase
5. Update hooks to use camelCase
6. Test all functionality

### Verification:
- All naming is consistent
- Transformers work correctly
- API communication works
- Components use camelCase

---

## Step 4.4: Extract Magic Numbers and Strings

### Task
Move all hardcoded values to constants file for better maintainability.

### 4.4.1: Audit Codebase for Magic Values

**Search for:**
- Hardcoded numbers (delays, limits, sizes)
- Hardcoded strings (messages, labels, placeholders)
- Hardcoded colors
- Hardcoded URLs
- Hardcoded validation rules

### 4.4.2: Update Constants File

**File:** `src/constants/index.js` (Update)

**Add Missing Constants:**
```javascript
// ... existing constants ...

/**
 * Validation Rules
 */
export const VALIDATION_RULES = {
  NAME_MIN_LENGTH: 2,
  NAME_MAX_LENGTH: 50,
  PASSWORD_MIN_LENGTH: 6,
  PASSWORD_MAX_LENGTH: 128,
  PHONE_LENGTH: 10,
  CARD_ID_MIN_LENGTH: 4,
  CARD_ID_MAX_LENGTH: 20,
  EMAIL_MAX_LENGTH: 255,
};

/**
 * Date/Time Formats
 */
export const DATE_FORMATS = {
  DISPLAY_DATE: 'YYYY-MM-DD',
  DISPLAY_TIME: 'HH:mm',
  DISPLAY_DATETIME: 'YYYY-MM-DD HH:mm',
  API_DATE: 'YYYY-MM-DD',
  API_DATETIME: 'YYYY-MM-DD HH:mm:ss',
};

/**
 * Delays and Timeouts
 */
export const DELAYS = {
  MODAL_TRANSITION: 100,
  DEBOUNCE_SEARCH: 300,
  MOCK_API_DELAY: 500,
  TOAST_DURATION: 3000,
  ANIMATION_DURATION: 300,
};

/**
 * Limits
 */
export const LIMITS = {
  RECENT_ATTENDANCE: 5,
  MAX_SEARCH_LENGTH: 100,
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  PAGINATION_PAGE_SIZE: 20,
  MAX_RETRIES: 3,
};

/**
 * Colors
 */
export const COLORS = {
  PRIMARY: '#4A90E2',
  SECONDARY: '#2E5BBA',
  ACCENT: '#64B5F6',
  DARK: '#1E3A8A',
  LIGHT: '#E3F2FD',
  SUCCESS: '#10b981',
  ERROR: '#ef4444',
  WARNING: '#f59e0b',
  INFO: '#3b82f6',
};

/**
 * Breakpoints (for responsive design)
 */
export const BREAKPOINTS = {
  SM: 640,
  MD: 768,
  LG: 1024,
  XL: 1280,
  '2XL': 1536,
};

/**
 * Z-Index Layers
 */
export const Z_INDEX = {
  DROPDOWN: 1000,
  STICKY: 1020,
  FIXED: 1030,
  MODAL_BACKDROP: 1040,
  MODAL: 1050,
  POPOVER: 1060,
  TOOLTIP: 1070,
};

/**
 * Animation Durations
 */
export const ANIMATIONS = {
  FAST: 150,
  NORMAL: 300,
  SLOW: 500,
};

/**
 * User Messages (Arabic)
 */
export const MESSAGES = {
  // Loading
  LOADING: 'جاري التحميل...',
  LOADING_AUTH: 'جاري التحقق من المصادقة...',
  
  // Success
  SUCCESS_CREATE_USER: 'تم إضافة المستخدم بنجاح',
  SUCCESS_UPDATE_USER: 'تم تحديث المستخدم بنجاح',
  SUCCESS_DELETE_USER: 'تم حذف المستخدم بنجاح',
  SUCCESS_CREATE_CARD: 'تم إضافة البطاقة بنجاح',
  SUCCESS_UPDATE_CARD: 'تم تحديث البطاقة بنجاح',
  SUCCESS_DELETE_CARD: 'تم حذف البطاقة بنجاح',
  
  // Errors
  ERROR_GENERIC: 'حدث خطأ ما',
  ERROR_NETWORK: 'لا يمكن الاتصال بالخادم',
  ERROR_UNAUTHORIZED: 'غير مصرح لك بالوصول',
  ERROR_NOT_FOUND: 'الصفحة غير موجودة',
  ERROR_SERVER: 'خطأ في الخادم',
  
  // User Operations
  ERROR_FETCH_USERS: 'فشل في تحميل المستخدمين',
  ERROR_CREATE_USER: 'فشل في إضافة المستخدم',
  ERROR_UPDATE_USER: 'فشل في تحديث المستخدم',
  ERROR_DELETE_USER: 'فشل في حذف المستخدم',
  
  // Card Operations
  ERROR_FETCH_CARDS: 'فشل في تحميل البطاقات',
  ERROR_CREATE_CARD: 'فشل في إضافة البطاقة',
  ERROR_UPDATE_CARD: 'فشل في تحديث البطاقة',
  ERROR_DELETE_CARD: 'فشل في حذف البطاقة',
  
  // Attendance
  ERROR_FETCH_ATTENDANCE: 'فشل في تحميل سجلات الحضور',
  
  // Confirmations
  CONFIRM_DELETE_USER: 'هل أنت متأكد من حذف هذا المستخدم؟ لا يمكن التراجع عن هذا الإجراء.',
  CONFIRM_DELETE_CARD: 'هل أنت متأكد من حذف هذه البطاقة؟ لا يمكن التراجع عن هذا الإجراء.',
  
  // Empty States
  NO_USERS: 'لا يوجد مستخدمين',
  NO_CARDS: 'لا توجد بطاقات',
  NO_ATTENDANCE: 'لا توجد سجلات حضور',
  
  // Placeholders
  PLACEHOLDER_SEARCH: 'البحث...',
  PLACEHOLDER_EMAIL: 'admin@example.com',
  PLACEHOLDER_PHONE: '0987654321',
  PLACEHOLDER_PASSWORD: '••••••••',
  PLACEHOLDER_CARD_ID: 'أدخل رقم البطاقة',
};
```

### 4.4.3: Replace Magic Values in Code

**Files to Update:**
- All components
- All hooks
- All utilities
- All services

**Search and Replace:**
- `500` → `DELAYS.MOCK_API_DELAY`
- `300` → `DELAYS.DEBOUNCE_SEARCH`
- `100` → `DELAYS.MODAL_TRANSITION`
- `5` → `LIMITS.RECENT_ATTENDANCE`
- Hardcoded messages → `MESSAGES.*`
- Hardcoded colors → `COLORS.*`

### Actions:
1. Audit codebase for magic values
2. Update `src/constants/index.js` with all constants
3. Replace magic values in components
4. Replace magic values in hooks
5. Replace magic values in utilities
6. Replace magic values in services
7. Test all functionality

### Verification:
- No hardcoded numbers (except 0, 1 for simple math)
- No hardcoded strings (except simple variable names)
- All constants are used
- Code is more maintainable

---

## Step 4.5: Improve Error Handling

### Task
Enhance error handling throughout the application with better error messages and user feedback.

### 4.5.1: Enhance Error Handler

**File:** `src/utils/errorHandler.js` (Update)

**Add More Error Types:**
```javascript
// ... existing code ...

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
    502: 'خطأ في الاتصال بالخادم',
    503: 'الخدمة غير متاحة حالياً',
    504: 'انتهت مهلة الاتصال بالخادم',
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
```

### 4.5.2: Add Toast Notification System

**File:** `src/components/common/Toast.jsx`

**Implementation:**
```javascript
import { useState, useEffect } from 'react';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import { DELAYS } from '../../constants';

export const Toast = ({ message, type = 'info', onClose, duration = DELAYS.TOAST_DURATION }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => onClose?.(), 300); // Wait for animation
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const icons = {
    success: CheckCircle,
    error: AlertCircle,
    warning: AlertTriangle,
    info: Info,
  };

  const colors = {
    success: 'bg-green-50 border-green-200 text-green-800',
    error: 'bg-red-50 border-red-200 text-red-800',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    info: 'bg-blue-50 border-blue-200 text-blue-800',
  };

  const Icon = icons[type] || Info;

  if (!isVisible) return null;

  return (
    <div
      className={`fixed top-4 left-4 right-4 sm:left-auto sm:right-4 sm:max-w-md z-50 transition-all duration-300 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'
      }`}
      dir="rtl"
    >
      <div className={`${colors[type]} border rounded-lg shadow-lg p-4 flex items-start gap-3`}>
        <Icon className="w-5 h-5 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <p className="text-sm font-medium">{message}</p>
        </div>
        <button
          onClick={() => {
            setIsVisible(false);
            setTimeout(() => onClose?.(), 300);
          }}
          className="text-current opacity-70 hover:opacity-100"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
```

**File:** `src/components/common/ToastContainer.jsx`

**Implementation:**
```javascript
import { useState, useCallback } from 'react';
import { Toast } from './Toast';

let toastId = 0;
const toastListeners = new Set();

export const useToast = () => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info', duration) => {
    const id = toastId++;
    const newToast = { id, message, type, duration };
    
    setToasts(prev => [...prev, newToast]);
    
    return id;
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const showSuccess = useCallback((message, duration) => {
    return addToast(message, 'success', duration);
  }, [addToast]);

  const showError = useCallback((message, duration) => {
    return addToast(message, 'error', duration);
  }, [addToast]);

  const showWarning = useCallback((message, duration) => {
    return addToast(message, 'warning', duration);
  }, [addToast]);

  const showInfo = useCallback((message, duration) => {
    return addToast(message, 'info', duration);
  }, [addToast]);

  return {
    toasts,
    addToast,
    removeToast,
    showSuccess,
    showError,
    showWarning,
    showInfo,
  };
};

export const ToastContainer = ({ toasts, onRemove }) => {
  return (
    <div className="fixed top-4 left-4 right-4 sm:left-auto sm:right-4 z-50 space-y-2 pointer-events-none">
      {toasts.map(toast => (
        <div key={toast.id} className="pointer-events-auto">
          <Toast
            message={toast.message}
            type={toast.type}
            duration={toast.duration}
            onClose={() => onRemove(toast.id)}
          />
        </div>
      ))}
    </div>
  );
};
```

### 4.5.3: Integrate Toast in App

**File:** `src/App.jsx` (Update)

**Add Toast Container:**
```javascript
import { ToastContainer, useToast } from './components/common/ToastContainer';

function AppContent() {
  const toast = useToast();
  // ... existing code ...

  return (
    <>
      <ToastContainer toasts={toast.toasts} onRemove={toast.removeToast} />
      {/* ... existing JSX ... */}
    </>
  );
}
```

### Actions:
1. Update `src/utils/errorHandler.js`
2. Create `src/components/common/Toast.jsx`
3. Create `src/components/common/ToastContainer.jsx`
4. Integrate toast in App
5. Update error handling to use toast
6. Test error handling

### Verification:
- Error messages are user-friendly
- Toast notifications work
- Errors are handled gracefully
- User feedback is clear

---

## Step 4.6: Add Input Sanitization

### Task
Ensure all user inputs are sanitized to prevent XSS attacks.

### 4.6.1: Install DOMPurify

**Command:**
```bash
npm install dompurify
```

### 4.6.2: Update Sanitizers

**File:** `src/utils/sanitizers.js` (Update)

**Enhance Sanitization:**
```javascript
import DOMPurify from 'dompurify';

/**
 * Sanitize user input (string)
 */
export const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  
  // Remove leading/trailing whitespace
  const trimmed = input.trim();
  
  // Sanitize HTML
  return DOMPurify.sanitize(trimmed, {
    ALLOWED_TAGS: [], // No HTML tags allowed
    ALLOWED_ATTR: [],
  });
};

/**
 * Sanitize HTML content (allows safe HTML)
 */
export const sanitizeHtml = (html) => {
  if (typeof html !== 'string') return html;
  
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br'],
    ALLOWED_ATTR: ['href'],
  });
};

/**
 * Recursively sanitize object
 */
export const sanitizeObject = (obj) => {
  if (typeof obj === 'string') {
    return sanitizeInput(obj);
  }
  
  if (Array.isArray(obj)) {
    return obj.map(sanitizeObject);
  }
  
  if (obj && typeof obj === 'object') {
    const sanitized = {};
    for (const key in obj) {
      sanitized[key] = sanitizeObject(obj[key]);
    }
    return sanitized;
  }
  
  return obj;
};

/**
 * Sanitize form data before submission
 */
export const sanitizeFormData = (formData) => {
  return sanitizeObject(formData);
};
```

### 4.6.3: Integrate Sanitization in Forms

**Update Components:**
- UserForm - Sanitize before submission
- CardForm - Sanitize before submission
- Login - Sanitize inputs

### Actions:
1. Install DOMPurify
2. Update `src/utils/sanitizers.js`
3. Integrate sanitization in forms
4. Test sanitization
5. Verify XSS prevention

### Verification:
- All inputs are sanitized
- XSS attacks are prevented
- Data is cleaned before API calls
- Special characters are handled

---

## Step 4.7: Code Quality Improvements

### Task
Apply general code quality improvements and best practices.

### 4.7.1: Add ESLint Rules

**File:** `.eslintrc.js` (Update or create)

**Add Rules:**
```javascript
export default {
  // ... existing config ...
  rules: {
    'no-console': ['warn', { allow: ['warn', 'error'] }],
    'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    'react-hooks/exhaustive-deps': 'warn',
    'prefer-const': 'error',
    'no-var': 'error',
    'object-shorthand': 'error',
    'prefer-arrow-callback': 'error',
  },
};
```

### 4.7.2: Add Prettier Configuration

**File:** `.prettierrc` (Create)

**Configuration:**
```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 100,
  "tabWidth": 2,
  "useTabs": false
}
```

### 4.7.3: Code Review Checklist

**Review All Files For:**
- Unused imports
- Unused variables
- Console.logs (remove or convert to console.error/warn)
- Commented code (remove)
- Duplicate code (extract to utilities)
- Magic numbers/strings (move to constants)
- Inconsistent formatting
- Missing error handling
- Missing prop validation

### Actions:
1. Update ESLint configuration
2. Add Prettier configuration
3. Run ESLint and fix issues
4. Format all files with Prettier
5. Review code quality
6. Fix identified issues

### Verification:
- ESLint passes with no errors
- Code is consistently formatted
- No unused code
- Best practices followed

---

## Step 4.8: Testing and Verification

### Testing Checklist:

**Validation:**
- ✅ All forms validate correctly
- ✅ Error messages are in Arabic
- ✅ Validation schemas work
- ✅ Real-time validation works

**Error Boundaries:**
- ✅ ErrorBoundary catches errors
- ✅ Fallback UI displays
- ✅ Reset functionality works
- ✅ Error details shown in dev

**Naming:**
- ✅ All naming is consistent
- ✅ Transformers work
- ✅ API communication works
- ✅ Components use camelCase

**Constants:**
- ✅ No magic numbers
- ✅ No magic strings
- ✅ All constants used
- ✅ Code is maintainable

**Error Handling:**
- ✅ Error messages are user-friendly
- ✅ Toast notifications work
- ✅ Errors handled gracefully
- ✅ User feedback is clear

**Sanitization:**
- ✅ All inputs sanitized
- ✅ XSS prevented
- ✅ Data cleaned before API

**Code Quality:**
- ✅ ESLint passes
- ✅ Code formatted
- ✅ No unused code
- ✅ Best practices followed

---

## Step 4.9: Documentation

### Task
Document all improvements and create usage guides.

### 4.9.1: Update README

**File:** `README.md` (Update)

**Add Sections:**
- Validation system usage
- Error boundary usage
- Naming conventions
- Constants usage
- Error handling guide

### 4.9.2: Create Validation Guide

**File:** `docs/VALIDATION_GUIDE.md`

**Content:**
- How to use validators
- How to create validation schemas
- How to use useForm hook
- Examples

### Actions:
1. Update README.md
2. Create validation guide
3. Document error handling
4. Document naming conventions
5. Add code examples

---

## Success Criteria

### Phase 4 Complete When:
- ✅ Enhanced validation system
- ✅ Error boundaries implemented
- ✅ Naming inconsistencies fixed
- ✅ Magic values extracted
- ✅ Error handling improved
- ✅ Input sanitization added
- ✅ Code quality improved
- ✅ Documentation updated
- ✅ All tests pass
- ✅ Code is production-ready

### Metrics:
- **Before:** Basic validation, inconsistent naming, magic values
- **After:** Comprehensive validation, consistent naming, maintainable code
- **Code Quality:** 9/10
- **Security:** Improved
- **Maintainability:** Significantly improved

---

## Estimated Timeline

- **Step 4.1:** 3-4 hours (Enhanced validation)
- **Step 4.2:** 2-3 hours (Error boundaries)
- **Step 4.3:** 4-5 hours (Naming fixes)
- **Step 4.4:** 2-3 hours (Extract magic values)
- **Step 4.5:** 2-3 hours (Error handling)
- **Step 4.6:** 1-2 hours (Sanitization)
- **Step 4.7:** 2-3 hours (Code quality)
- **Step 4.8:** 2-3 hours (Testing)
- **Step 4.9:** 1-2 hours (Documentation)

**Total:** 19-28 hours (approximately 3-4 working days)

---

## Notes

- Work incrementally: Fix one issue type at a time
- Test after each major change
- Keep git commits focused
- Maintain backward compatibility where possible
- Document breaking changes
- Update tests as needed

---

## Common Issues and Solutions

### Issue 1: Validation Not Working
**Solution:** Check validation schema format and useForm hook integration

### Issue 2: Error Boundary Not Catching Errors
**Solution:** Ensure ErrorBoundary wraps components correctly, check error is thrown (not just logged)

### Issue 3: Naming Transformations Breaking API
**Solution:** Verify transformers work correctly, test API calls

### Issue 4: Constants Not Found
**Solution:** Check imports, ensure constants are exported

### Issue 5: Sanitization Too Aggressive
**Solution:** Adjust DOMPurify configuration, test with real data

