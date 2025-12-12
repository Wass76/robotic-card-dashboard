import {
  validateRequired,
  validateEmail,
  validatePhoneAdvanced,
  validatePasswordStrength,
  validateName,
  validateCardIdFormat,
  validateRole,
  validateStatus,
  validatePositiveNumber,
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

