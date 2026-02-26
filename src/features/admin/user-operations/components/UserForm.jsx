import React, { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Modal from '../../../../components/common/Modal';
import Input from '../../../../components/common/Input';
import Button from '../../../../components/common/Button';
import { userSchema, userCreateSchema } from '../../../../schemas';

const FormSection = ({ title, children, className = '' }) => (
  <div className={className}>
    <h4 className="text-sm font-semibold text-gray-600 mb-3 pb-1.5 border-b border-gray-200">
      {title}
    </h4>
    <div className="space-y-3">{children}</div>
  </div>
);

const UserForm = ({ user, onSubmit, onClose, loading }) => {
  const isEditMode = user !== null;

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(isEditMode ? userSchema : userCreateSchema),
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

  useEffect(() => {
    if (user) {
      const rawYear = user.year ?? user.Year ?? 1;
      reset({
        first_name: user.first_name || user.firstName || '',
        last_name: user.last_name || user.lastName || '',
        gender: user.gender || '',
        Phone: user.Phone ?? user.phone ?? '',
        year: Number(rawYear) || 1,
        specialization: user.specialization || '',
        email: user.email || '',
        password: '',
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
    const submitData = {
      ...data,
      Phone: (data.Phone || '').replace(/\D/g, ''),
      year: Number(data.year),
      gender: (data.gender || '').toLowerCase(),
    };
    if (isEditMode && (!submitData.password || String(submitData.password).trim() === '')) {
      const { password, ...rest } = submitData;
      onSubmit(rest);
    } else {
      onSubmit(submitData);
    }
  };

  const selectClass = (hasError) =>
    `w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-robotics-primary focus:border-transparent transition-colors min-h-[44px] ${hasError ? 'border-red-300' : 'border-gray-300'}`;

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title={isEditMode ? 'تعديل المستخدم' : 'إضافة مستخدم جديد'}
      size="lg"
    >
      <form onSubmit={handleSubmit(onSubmitForm)} className="flex flex-col min-h-0 flex-1 overflow-hidden">
        {/* Scrollable body: constrained height so it scrolls on small screens */}
        <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden max-h-[65vh]">
          <div className="space-y-5 py-1 pr-1">
            <FormSection title="البيانات الشخصية">
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
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    الجنس <span className="text-red-500">*</span>
                  </label>
                  <Controller
                    name="gender"
                    control={control}
                    render={({ field }) => (
                      <select
                        value={field.value}
                        onChange={field.onChange}
                        className={selectClass(!!errors.gender)}
                        aria-invalid={!!errors.gender}
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
                      onChange={(e) => field.onChange(Number(e.target.value) || 1)}
                      placeholder="1"
                      min={1}
                      max={10}
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
                    placeholder="مثال: هندسة البرمجيات"
                    error={errors.specialization?.message}
                  />
                )}
              />
            </FormSection>

            <FormSection title="التواصل">
              <Controller
                name="Phone"
                control={control}
                render={({ field }) => (
                  <Input
                    type="tel"
                    label="رقم الهاتف"
                    value={field.value}
                    onChange={field.onChange}
                    placeholder="09xxxxxxxx"
                    error={errors.Phone?.message}
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
                    placeholder="example@email.com"
                    error={errors.email?.message}
                  />
                )}
              />
            </FormSection>

            <FormSection title="الحساب والدور">
              <Controller
                name="password"
                control={control}
                render={({ field }) => (
                  <div>
                    <Input
                      type="password"
                      label="كلمة المرور"
                      value={field.value}
                      onChange={field.onChange}
                      placeholder={
                        isEditMode
                          ? 'اتركها فارغة للإبقاء على كلمة المرور الحالية'
                          : '6 أحرف على الأقل'
                      }
                      showPasswordToggle
                      error={errors.password?.message}
                    />
                    {isEditMode && (
                      <p className="mt-1.5 text-xs text-gray-500">
                        اترك الحقل فارغاً إذا كنت لا تريد تغيير كلمة المرور
                      </p>
                    )}
                  </div>
                )}
              />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  الدور <span className="text-red-500">*</span>
                </label>
                <Controller
                  name="role"
                  control={control}
                  render={({ field }) => (
                    <select
                      value={field.value}
                      onChange={field.onChange}
                      className={selectClass(!!errors.role)}
                      aria-invalid={!!errors.role}
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
            </FormSection>
          </div>
        </div>

        {/* Fixed footer: always visible, stacks on narrow screens */}
        <div className="flex-shrink-0 flex flex-col sm:flex-row gap-3 pt-4 mt-4 border-t border-gray-200">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            disabled={loading}
            className="flex-1 w-full min-h-[44px]"
          >
            إلغاء
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={loading}
            loading={loading}
            className="flex-1 w-full min-h-[44px]"
          >
            {isEditMode ? (loading ? 'جاري الحفظ...' : 'حفظ التغييرات') : 'إضافة المستخدم'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default UserForm;
