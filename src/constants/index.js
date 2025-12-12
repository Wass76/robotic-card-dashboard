import {
  LayoutDashboard,
  Users,
  CreditCard,
  Clock,
  BarChart3,
  Settings,
  Activity
} from 'lucide-react';

// Static data for fallback
export const STATIC_DATA = Object.freeze({
  users: [
    { id: 1, first_name: 'سنا', last_name: 'مسلم', email: 'sana@robotics.club', phone: '0987654321', role: 'Admin', created_at: '2024-01-15', card_id: '1111', status: 'active', last_seen: '2024-11-24 09:30:00' },
    { id: 2, first_name: 'سلام', last_name: 'مسلم', email: 'salam@robotics.club', phone: '0987654322', role: 'User', created_at: '2024-01-16', card_id: '2222', status: 'active', last_seen: '2024-11-24 10:15:00' },
    { id: 3, first_name: 'إيمان', last_name: 'غباش', email: 'iman@robotics.club', phone: '0987654323', role: 'User', created_at: '2024-01-17', card_id: '3333', status: 'active', last_seen: '2024-11-24 11:00:00' },
    { id: 4, first_name: 'حلا', last_name: 'عرقسوسي', email: 'hala@robotics.club', phone: '0987654324', role: 'User', created_at: '2024-01-18', card_id: '4444', status: 'inactive', last_seen: '2024-11-23 14:20:00' },
    { id: 5, first_name: 'أيمن', last_name: 'الأحمد', email: 'ayman@robotics.club', phone: '0987654325', role: 'User', created_at: '2024-01-19', card_id: '5555', status: 'active', last_seen: '2024-11-24 08:45:00' },
  ],
  attendance: [
    { id: 1, user_id: 1, user_name: 'سنا مسلم', card_id: '1111', timestamp: '2024-11-24 09:30:00', type: 'entry', method: 'RFID' },
    { id: 2, user_id: 2, user_name: 'سلام مسلم', card_id: '2222', timestamp: '2024-11-24 10:15:00', type: 'entry', method: 'Face Recognition' },
    { id: 3, user_id: 3, user_name: 'إيمان غباش', card_id: '3333', timestamp: '2024-11-24 11:00:00', type: 'entry', method: 'RFID' },
    { id: 4, user_id: 1, user_name: 'سنا مسلم', card_id: '1111', timestamp: '2024-11-24 17:30:00', type: 'exit', method: 'RFID' },
    { id: 5, user_id: 4, user_name: 'حلا عرقسوسي', card_id: '4444', timestamp: '2024-11-24 14:20:00', type: 'entry', method: 'Face Recognition' },
    { id: 6, user_id: 5, user_name: 'أيمن الأحمد', card_id: '5555', timestamp: '2024-11-24 08:45:00', type: 'entry', method: 'RFID' },
  ],
  stats: {
    totalUsers: 5,
    activeUsers: 4,
    totalCards: 5,
    todayAttendance: 5,
    monthlyAttendance: 87,
    systemStatus: 'online',
    lastSync: '2024-11-24 16:00:00'
  }
});

// API Endpoints
export const API_ENDPOINTS = {
  LOGIN: '/api/login',
  LOGOUT: '/api/logoutFromApp',
  PROFILE: '/api/profile',
  USERS: '/api/User',
  USER_BY_ID: (id) => `/api/User/${id}`,
  CARDS: '/api/Card',
  CARD_BY_ID: (id) => `/api/Card/${id}`,
  CARD_FOR_USER: (userId) => `/api/Card/${userId}`,
  ATTENDANCE: '/api/attendance_records',
  USER_ATTENDANCE: (userId) => `/api/Attendance_Records_By_UserId/${userId}`,
  MONTHLY_ATTENDANCE: '/api/monthlyAttendance',
  TRANSACTION: (cardId) => `/api/Transaction/${cardId}`,
};

// User Roles
export const USER_ROLES = {
  ADMIN: 'Admin',
  USER: 'User',
};

// Attendance Types
export const ATTENDANCE_TYPES = {
  ENTRY: 'entry',
  EXIT: 'exit',
};

// Card Status
export const CARD_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
};

// Modal Modes
export const MODAL_MODES = {
  CREATE: 'create',
  EDIT: 'edit',
  VIEW: 'view',
};

// View Modes
export const VIEW_MODES = {
  DASHBOARD: 'dashboard',
  USERS: 'users',
  CARDS: 'cards',
  ATTENDANCE: 'attendance',
  ANALYTICS: 'analytics',
  SETTINGS: 'settings',
};

// Sidebar Items
export const SIDEBAR_ITEMS = [
  { 
    id: 'dashboard', 
    label: 'لوحة التحكم', 
    icon: LayoutDashboard, 
    color: 'text-robotics-primary' 
  },
  { 
    id: 'users', 
    label: 'إدارة المستخدمين', 
    icon: Users, 
    color: 'text-robotics-secondary' 
  },
  { 
    id: 'cards', 
    label: 'إدارة البطاقات', 
    icon: CreditCard, 
    color: 'text-robotics-accent' 
  },
  { 
    id: 'attendance', 
    label: 'سجلات الحضور', 
    icon: Clock, 
    color: 'text-robotics-dark' 
  },
  { 
    id: 'analytics', 
    label: 'التحليلات', 
    icon: BarChart3, 
    color: 'text-robotics-primary' 
  },
  { 
    id: 'settings', 
    label: 'الإعدادات', 
    icon: Settings, 
    color: 'text-gray-500' 
  },
];

// Validation Rules
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

// Date/Time Formats
export const DATE_FORMATS = {
  DISPLAY_DATE: 'YYYY-MM-DD',
  DISPLAY_TIME: 'HH:mm',
  DISPLAY_DATETIME: 'YYYY-MM-DD HH:mm',
  API_DATE: 'YYYY-MM-DD',
  API_DATETIME: 'YYYY-MM-DD HH:mm:ss',
};

// Delays and Timeouts
export const DELAYS = {
  MODAL_TRANSITION: 100,
  DEBOUNCE_SEARCH: 300,
  MOCK_API_DELAY: 500,
  TOAST_DURATION: 3000,
  ANIMATION_DURATION: 300,
};

// Limits
export const LIMITS = {
  RECENT_ATTENDANCE: 5,
  MAX_SEARCH_LENGTH: 100,
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  PAGINATION_PAGE_SIZE: 20,
  MAX_RETRIES: 3,
};

// Colors
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

// Breakpoints (for responsive design)
export const BREAKPOINTS = {
  SM: 640,
  MD: 768,
  LG: 1024,
  XL: 1280,
  '2XL': 1536,
};

// Z-Index Layers
export const Z_INDEX = {
  DROPDOWN: 1000,
  STICKY: 1020,
  FIXED: 1030,
  MODAL_BACKDROP: 1040,
  MODAL: 1050,
  POPOVER: 1060,
  TOOLTIP: 1070,
};

// Animation Durations
export const ANIMATIONS = {
  FAST: 150,
  NORMAL: 300,
  SLOW: 500,
};

// Messages
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
  
  // Login
  LOGIN_ERROR: 'البريد الإلكتروني أو كلمة المرور غير صحيحة',
  
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

