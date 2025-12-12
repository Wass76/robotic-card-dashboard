import React, { useState } from 'react';
import Modal from '../common/Modal';
import Input from '../common/Input';
import Button from '../common/Button';

const CardForm = ({ card, users, onSubmit, onClose, loading }) => {
  const isEditMode = card !== null;
  
  const [formData, setFormData] = useState({
    card_id: card?.card_id || '',
    user_id: card?.user_id || ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title={isEditMode ? 'تعديل بطاقة' : 'إضافة بطاقة'}
      size="sm"
    >
      <form onSubmit={handleSubmit} className="p-4 space-y-4">
        {!isEditMode && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">المستخدم</label>
            <select
              required
              value={formData.user_id}
              onChange={(e) => setFormData({...formData, user_id: e.target.value})}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-robotics-primary focus:border-transparent"
            >
              <option value="">اختر مستخدم</option>
              {users.map(u => (
                <option key={u.id} value={u.id}>{u.first_name} {u.last_name}</option>
              ))}
            </select>
          </div>
        )}
        <Input
          type="text"
          label="رقم البطاقة (UID)"
          value={formData.card_id}
          onChange={(e) => setFormData({...formData, card_id: e.target.value})}
          placeholder="أدخل رقم البطاقة"
          required
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

