import React, { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Modal from '../../../../components/common/Modal';
import Input from '../../../../components/common/Input';
import Button from '../../../../components/common/Button';
import { userSchema } from '../../../../schemas';

const UserForm = ({ user, onSubmit, onClose, loading }) => {
  const isEditMode = user !== null;
  
  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(userSchema),
    defaultValues: {
      first_name: '',
      last_name: '',
      gender: '',
      Phone: '',
      year: 1,
      specialization: '',
      email: '',
      password: '',
      role: 'User',
    },
  });

  // Initialize form data when user prop changes
  useEffect(() => {
    if (user) {
      reset({
        first_name: user.first_name || user.firstName || '',
        last_name: user.last_name || user.lastName || '',
        gender: user.gender || '',
        Phone: user.Phone || user.phone || '',
        year: user.year || user.Year || 1,
        specialization: user.specialization || '',
        email: user.email || '',
        password: '', // Always start with empty password
        role: user.role || 'User',
      });
    } else {
      reset({
        first_name: '',
        last_name: '',
        gender: '',
        Phone: '',
        year: 1,
        specialization: '',
        email: '',
        password: '',
        role: 'User',
      });
    }
  }, [user, reset]);

  const onSubmitForm = (data) => {
    // Clean phone number (remove non-digits) and ensure year is a number
    const submitData = {
      ...data,
      Phone: data.Phone.replace(/\D/g, ''),
      year: Number(data.year),
      gender: data.gender.toLowerCase(), // Ensure lowercase for API
    };
    onSubmit(submitData);
  };

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title={isEditMode ? 'تعديل المستخدم' : 'إضافة مستخدم جديد'}
      size="sm"
    >
      <form onSubmit={handleSubmit(onSubmitForm)} className="p-4 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Controller
            name="first_name"
            control={control}
            render={({ field }) => (
          <Input
            type="text"
            label="الاسم الأول"
                value={field.value}
                onChange={field.onChange}
            placeholder="أدخل الاسم الأول"
                error={errors.first_name?.message}
              />
            )}
          />
          <Controller
            name="last_name"
            control={control}
            render={({ field }) => (
          <Input
            type="text"
            label="اسم العائلة"
                value={field.value}
                onChange={field.onChange}
            placeholder="أدخل اسم العائلة"
                error={errors.last_name?.message}
              />
            )}
          />
        </div>
        <Controller
          name="Phone"
          control={control}
          render={({ field }) => (
        <Input
          type="tel"
          label="رقم الهاتف"
              value={field.value}
              onChange={field.onChange}
          placeholder="0987675572"
              error={errors.Phone?.message}
            />
          )}
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              الجنس
              {errors.gender && <span className="text-red-500 mr-1">*</span>}
            </label>
            <Controller
              name="gender"
              control={control}
              render={({ field }) => (
                <select
                  value={field.value}
                  onChange={field.onChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-robotics-primary focus:border-transparent ${
                    errors.gender ? 'border-red-300' : 'border-gray-300'
                  }`}
                >
                  <option value="">اختر الجنس</option>
                  <option value="male">ذكر</option>
                  <option value="female">أنثى</option>
                </select>
              )}
            />
            {errors.gender && (
              <p className="mt-1 text-sm text-red-600">{errors.gender.message}</p>
            )}
          </div>
          <Controller
            name="year"
            control={control}
            render={({ field }) => (
              <Input
                type="number"
                label="السنة"
                value={field.value}
                onChange={(e) => field.onChange(Number(e.target.value))}
                placeholder="1"
                min="1"
                max="10"
                error={errors.year?.message}
              />
            )}
          />
        </div>
        <Controller
          name="specialization"
          control={control}
          render={({ field }) => (
            <Input
              type="text"
              label="التخصص"
              value={field.value}
              onChange={field.onChange}
              placeholder="Software Engineering"
              error={errors.specialization?.message}
            />
          )}
        />
        <Controller
          name="email"
          control={control}
          render={({ field }) => (
        <Input
          type="email"
          label="البريد الإلكتروني"
              value={field.value}
              onChange={field.onChange}
          placeholder="sana@gmail.com"
              error={errors.email?.message}
            />
          )}
        />
        <Controller
          name="password"
          control={control}
          render={({ field }) => (
        <Input
          type="password"
          label="كلمة المرور"
              value={field.value}
              onChange={field.onChange}
          placeholder={isEditMode ? "أدخل كلمة المرور الجديدة" : "أدخل كلمة المرور"}
          showPasswordToggle
              error={errors.password?.message}
            />
          )}
        />
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            الدور
            {errors.role && <span className="text-red-500 mr-1">*</span>}
          </label>
          <Controller
            name="role"
            control={control}
            render={({ field }) => (
          <select
                value={field.value}
                onChange={field.onChange}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-robotics-primary focus:border-transparent ${
              errors.role ? 'border-red-300' : 'border-gray-300'
            }`}
          >
            <option value="">اختر الدور</option>
            <option value="User">مستخدم</option>
            <option value="Admin">مدير</option>
          </select>
            )}
          />
          {errors.role && (
            <p className="mt-1 text-sm text-red-600">{errors.role.message}</p>
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


