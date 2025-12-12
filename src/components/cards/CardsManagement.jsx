import React from 'react';
import { Plus, Pencil, XCircle } from 'lucide-react';
import { useApp } from '../../context';
import { useCards, useModal } from '../../hooks';
import Button from '../common/Button';
import CardForm from './CardForm';

const CardsManagement = () => {
  const { users, cards } = useApp();
  const { createCard, updateCard, deleteCard } = useCards();
  const cardModal = useModal();
  const deleteConfirmModal = useModal();

  const handleSubmit = async (formData) => {
    try {
      if (cardModal.mode === 'create') {
        await createCard(formData.user_id, formData);
      } else {
        await updateCard(cardModal.data.id, formData);
      }
      cardModal.close();
    } catch (err) {
      console.error('Error saving card:', err);
      throw err;
    }
  };

  const handleDelete = async (cardId) => {
    try {
      await deleteCard(cardId);
      deleteConfirmModal.close();
    } catch (err) {
      console.error('Error deleting card:', err);
    }
  };

  return (
    <div className="space-y-6 fade-in">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h2 className="text-2xl font-bold text-gray-900">إدارة البطاقات</h2>
        <Button onClick={() => cardModal.open('create')} variant="primary" className="w-full sm:w-auto">
          <Plus className="w-4 h-4 ml-2" />
          إضافة بطاقة جديدة
        </Button>
      </div>

      <div className="card">
        <div className="p-4 lg:p-6">
          <div className="table-container">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-right py-3 px-4 font-semibold text-gray-700">رقم البطاقة</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-700">المستخدم</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-700">الحالة</th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-700">الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {cards.map((card) => (
                  <tr key={card.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 font-mono">{card.card_id || card.id}</td>
                    <td className="py-3 px-4">
                      {users.find(u => u.id === card.user_id)?.first_name || 'غير معين'}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        card.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {card.status === 'active' ? 'نشط' : 'غير نشط'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button onClick={() => cardModal.open('edit', card)} className="action-btn-edit" title="تعديل">
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button onClick={() => deleteConfirmModal.open('delete', card.id)} className="action-btn-delete" title="حذف">
                          <XCircle className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {cards.length === 0 && (
                  <tr>
                    <td colSpan="4" className="text-center py-8 text-gray-500">لا توجد بطاقات مسجلة</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {cardModal.isOpen && (
        <CardForm
          card={cardModal.data}
          users={users}
          onSubmit={handleSubmit}
          onClose={cardModal.close}
        />
      )}

      {deleteConfirmModal.isOpen && deleteConfirmModal.data && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm">
            <div className="p-4">
              <h3 className="text-lg font-bold text-gray-900 mb-2">تأكيد الحذف</h3>
              <p className="text-sm text-gray-600 mb-4">هل أنت متأكد من حذف هذه البطاقة؟</p>
              <div className="flex gap-2">
                <button
                  onClick={deleteConfirmModal.close}
                  className="btn-secondary flex-1 text-sm py-2"
                >
                  إلغاء
                </button>
                <button
                  onClick={() => handleDelete(deleteConfirmModal.data)}
                  className="action-btn-delete flex-1 text-sm py-2"
                >
                  <XCircle className="w-4 h-4 ml-1" />
                  حذف
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CardsManagement;

