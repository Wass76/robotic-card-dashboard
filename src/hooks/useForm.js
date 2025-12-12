import { useState, useCallback } from 'react';
import { validateEmail, validatePhone, validatePassword, validateRequired } from '../utils/validators';

export const useForm = (initialValues = {}, validationSchema = {}) => {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const setValue = useCallback((name, value) => {
    setValues(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  }, [errors]);

  const setFieldTouched = useCallback((name) => {
    setTouched(prev => ({ ...prev, [name]: true }));
  }, []);

  const validateField = useCallback((name, value) => {
    const rules = validationSchema[name];
    if (!rules) return null;

    for (const rule of rules) {
      let isValid = true;
      let errorMessage = '';

      switch (rule.type) {
        case 'required':
          isValid = validateRequired(value);
          errorMessage = rule.message || 'هذا الحقل مطلوب';
          break;
        case 'email':
          isValid = validateEmail(value);
          errorMessage = rule.message || 'البريد الإلكتروني غير صحيح';
          break;
        case 'phone':
          isValid = validatePhone(value);
          errorMessage = rule.message || 'رقم الهاتف غير صحيح';
          break;
        case 'password':
          isValid = validatePassword(value);
          errorMessage = rule.message || 'كلمة المرور يجب أن تكون 6 أحرف على الأقل';
          break;
        case 'minLength':
          isValid = value && value.length >= rule.value;
          errorMessage = rule.message || `يجب أن يكون ${rule.value} أحرف على الأقل`;
          break;
        case 'maxLength':
          isValid = !value || value.length <= rule.value;
          errorMessage = rule.message || `يجب أن يكون ${rule.value} أحرف على الأكثر`;
          break;
        case 'custom':
          isValid = rule.validator(value);
          errorMessage = rule.message || 'القيمة غير صحيحة';
          break;
        default:
          isValid = true;
      }

      if (!isValid) {
        return errorMessage;
      }
    }

    return null;
  }, [validationSchema]);

  const validate = useCallback(() => {
    const newErrors = {};
    
    Object.keys(validationSchema).forEach(name => {
      const error = validateField(name, values[name]);
      if (error) {
        newErrors[name] = error;
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [values, validationSchema, validateField]);

  const handleChange = useCallback((name, value) => {
    setValue(name, value);
    
    // Validate on change if field was touched
    if (touched[name]) {
      const error = validateField(name, value);
      if (error) {
        setErrors(prev => ({ ...prev, [name]: error }));
      } else {
        setErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors[name];
          return newErrors;
        });
      }
    }
  }, [touched, setValue, validateField]);

  const handleBlur = useCallback((name) => {
    setFieldTouched(name);
    const error = validateField(name, values[name]);
    if (error) {
      setErrors(prev => ({ ...prev, [name]: error }));
    }
  }, [values, setFieldTouched, validateField]);

  const handleSubmit = useCallback(async (onSubmit) => {
    setIsSubmitting(true);
    
    // Mark all fields as touched
    const allTouched = {};
    Object.keys(validationSchema).forEach(name => {
      allTouched[name] = true;
    });
    setTouched(allTouched);

    // Validate all fields
    const isValid = validate();
    
    if (isValid && onSubmit) {
      try {
        await onSubmit(values);
      } catch (err) {
        console.error('Form submission error:', err);
        throw err;
      }
    }
    
    setIsSubmitting(false);
    return isValid;
  }, [values, validationSchema, validate]);

  const reset = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
    setIsSubmitting(false);
  }, [initialValues]);

  return {
    values,
    errors,
    touched,
    isSubmitting,
    setValue,
    handleChange,
    handleBlur,
    handleSubmit,
    validate,
    reset,
    setFieldTouched,
  };
};

