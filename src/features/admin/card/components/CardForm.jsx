import React, { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Modal from '../../../../components/common/Modal';
import Input from '../../../../components/common/Input';
import Button from '../../../../components/common/Button';
import { cardSchema } from '../../../../schemas';

const CardForm = ({ card, users, onSubmit, onClose, loading }) => {
  const isEditMode = card !== null;
  
  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(cardSchema),
    defaultValues: {
      card_id: '',
      user_id: '',
    },
  });

  useEffect(() => {
    if (card) {
      reset({
        card_id: card.card_id || '',
        user_id: card.user_id || '',
      });
    } else {
      reset({
        card_id: '',
        user_id: '',
      });
    }
  }, [card, reset]);

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title={isEditMode ? 'تعديل بطاقة' : 'إضافة بطاقة'}
      size="sm"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="p-4 space-y-4">
        {!isEditMode && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              المستخدم
              {errors.user_id && <span className="text-red-500 mr-1">*</span>}
            </label>
            <Controller
              name="user_id"
              control={control}
              render={({ field }) => (
                <select
                  value={field.value}
                  onChange={field.onChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-robotics-primary focus:border-transparent ${
                    errors.user_id ? 'border-red-300' : 'border-gray-300'
                  }`}
                >
                  <option value="">اختر مستخدم</option>
                  {users.map(u => (
                    <option key={u.id} value={u.id}>{u.first_name} {u.last_name}</option>
                  ))}
                </select>
              )}
            />
            {errors.user_id && (
              <p className="mt-1 text-sm text-red-600">{errors.user_id.message}</p>
            )}
          </div>
        )}
        <Controller
          name="card_id"
          control={control}
          render={({ field }) => (
            <Input
              type="text"
              label="رقم البطاقة (UID)"
              value={field.value}
              onChange={field.onChange}
              placeholder="أدخل رقم البطاقة"
              error={errors.card_id?.message}
            />
          )}
        />
        <div className="flex gap-2 pt-2">
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
            {loading ? 'جاري الحفظ...' : 'حفظ'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default CardForm;


