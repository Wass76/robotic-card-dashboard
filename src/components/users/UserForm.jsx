import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import Input from '../common/Input';
import Button from '../common/Button';

const UserForm = ({ user, onSubmit, onClose, loading }) => {
  const isEditMode = user !== null;
  
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    Phone: '',
    email: '',
    password: '',
    role: 'User'
  });

  // Initialize form data when user prop changes
  useEffect(() => {
    if (user) {
      setFormData({
        first_name: user.first_name || user.firstName || '',
        last_name: user.last_name || user.lastName || '',
        Phone: user.Phone || user.phone || '',
        email: user.email || '',
        password: '', // Always start with empty password
        role: user.role || 'User'
      });
    } else {
      // Reset form for create mode
      setFormData({
        first_name: '',
        last_name: '',
        Phone: '',
        email: '',
        password: '',
        role: 'User'
      });
    }
    setErrors({});
  }, [user]);

  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.first_name?.trim()) {
      newErrors.first_name = 'الاسم الأول مطلوب';
    }
    
    if (!formData.last_name?.trim()) {
      newErrors.last_name = 'اسم العائلة مطلوب';
    }
    
    if (!formData.Phone?.trim()) {
      newErrors.Phone = 'رقم الهاتف مطلوب';
    } else if (!/^\d{10}$/.test(formData.Phone.replace(/\D/g, ''))) {
      newErrors.Phone = 'رقم الهاتف يجب أن يكون 10 أرقام';
    }
    
    if (!formData.email?.trim()) {
      newErrors.email = 'البريد الإلكتروني مطلوب';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'البريد الإلكتروني غير صحيح';
    }
    
    // Password is required for both create and update
    if (!formData.password?.trim()) {
      newErrors.password = 'كلمة المرور مطلوبة';
    } else if (formData.password.length < 6) {
      newErrors.password = 'كلمة المرور يجب أن تكون 6 أحرف على الأقل';
    }
    
    if (!formData.role) {
      newErrors.role = 'الدور مطلوب';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    const submitData = { ...formData };
    // Clean phone number (remove non-digits)
    submitData.Phone = submitData.Phone.replace(/\D/g, '');
    
    onSubmit(submitData);
  };

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title={isEditMode ? 'تعديل المستخدم' : 'إضافة مستخدم جديد'}
      size="sm"
    >
      <form onSubmit={handleSubmit} className="p-4 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            type="text"
            label="الاسم الأول"
            value={formData.first_name}
            onChange={(e) => {
              setFormData({...formData, first_name: e.target.value});
              if (errors.first_name) setErrors({...errors, first_name: ''});
            }}
            placeholder="أدخل الاسم الأول"
            required
            error={errors.first_name}
          />
          <Input
            type="text"
            label="اسم العائلة"
            value={formData.last_name}
            onChange={(e) => {
              setFormData({...formData, last_name: e.target.value});
              if (errors.last_name) setErrors({...errors, last_name: ''});
            }}
            placeholder="أدخل اسم العائلة"
            required
            error={errors.last_name}
          />
        </div>
        <Input
          type="tel"
          label="رقم الهاتف"
          value={formData.Phone}
          onChange={(e) => {
            setFormData({...formData, Phone: e.target.value});
            if (errors.Phone) setErrors({...errors, Phone: ''});
          }}
          placeholder="0987675572"
          required
          error={errors.Phone}
        />
        <Input
          type="email"
          label="البريد الإلكتروني"
          value={formData.email}
          onChange={(e) => {
            setFormData({...formData, email: e.target.value});
            if (errors.email) setErrors({...errors, email: ''});
          }}
          placeholder="sana@gmail.com"
          required
          error={errors.email}
        />
        <Input
          type="password"
          label="كلمة المرور"
          value={formData.password}
          onChange={(e) => {
            setFormData({...formData, password: e.target.value});
            if (errors.password) setErrors({...errors, password: ''});
          }}
          placeholder={isEditMode ? "أدخل كلمة المرور الجديدة" : "أدخل كلمة المرور"}
          required
          showPasswordToggle
          error={errors.password}
        />
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            الدور
            {errors.role && <span className="text-red-500 mr-1">*</span>}
          </label>
          <select
            value={formData.role}
            onChange={(e) => {
              setFormData({...formData, role: e.target.value});
              if (errors.role) setErrors({...errors, role: ''});
            }}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-robotics-primary focus:border-transparent ${
              errors.role ? 'border-red-300' : 'border-gray-300'
            }`}
            required
          >
            <option value="">اختر الدور</option>
            <option value="User">مستخدم</option>
            <option value="Admin">مدير</option>
          </select>
          {errors.role && (
            <p className="mt-1 text-sm text-red-600">{errors.role}</p>
          )}
        </div>
        <div className="flex gap-3 pt-2">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            disabled={loading}
            className="flex-1 text-sm py-2"
          >
            إلغاء
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={loading}
            loading={loading}
            className="flex-1 text-sm py-2"
          >
            {isEditMode ? (loading ? 'جاري الحفظ...' : 'حفظ التغييرات') : 'إضافة المستخدم'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default UserForm;

