import React from 'react';
import { Plus, Pencil, XCircle } from 'lucide-react';
import { useUsersQuery } from '../../user-operations/hooks';
import { useCardsQuery, useCreateCardForUserMutation, useUpdateCardMutation, useDeleteCardMutation } from '../hooks';
import { useModal } from '../../../../hooks';
import { useToast } from '../../../../components/common';
import Button from '../../../../components/common/Button';
import CardForm from './CardForm';
import LoadingSpinner from '../../../../components/common/LoadingSpinner';
import ErrorMessage from '../../../../components/common/ErrorMessage';

const CardsManagement = () => {
  const { data: users = [] } = useUsersQuery();
  const { data: cardsData, isLoading: cardsLoading, error: cardsError } = useCardsQuery();
  const createCardMutation = useCreateCardForUserMutation();
  const updateCardMutation = useUpdateCardMutation();
  const deleteCardMutation = useDeleteCardMutation();
  const toast = useToast();
  const cardModal = useModal();
  const deleteConfirmModal = useModal();

  // Ensure cards is always an array
  const cards = Array.isArray(cardsData) ? cardsData : [];

  const handleSubmit = async (formData) => {
    try {
      if (cardModal.mode === 'create') {
        // For create, API expects only { code: "..." } in the body
        // user_id is passed in the URL
        await createCardMutation.mutateAsync({
          userId: formData.user_id,
          payload: {
            code: formData.code,
          },
        });
        toast.showSuccess('تم إضافة البطاقة بنجاح');
      } else {
        // For update, send the form data (may include code or other fields)
        await updateCardMutation.mutateAsync({
          cardId: cardModal.data.id,
          payload: {
            code: formData.code || formData.card_id,
          },
        });
        toast.showSuccess('تم تحديث البطاقة بنجاح');
      }
      cardModal.close();
    } catch (err) {
      toast.showError(err.message || 'فشل في حفظ البطاقة');
      throw err;
    }
  };

  const handleDelete = async (cardId) => {
    try {
      await deleteCardMutation.mutateAsync(cardId);
      toast.showSuccess('تم حذف البطاقة بنجاح');
      deleteConfirmModal.close();
    } catch (err) {
      toast.showError(err.message || 'فشل في حذف البطاقة');
    }
  };
  
  const actionLoading = createCardMutation.isPending || updateCardMutation.isPending || deleteCardMutation.isPending;

  return (
    <div className="space-y-6 fade-in">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h2 className="text-2xl font-bold text-gray-900">إدارة البطاقات</h2>
        <Button onClick={() => cardModal.open('create')} variant="primary" className="w-full sm:w-auto">
          <Plus className="w-4 h-4 ml-2" />
          إضافة بطاقة جديدة
        </Button>
      </div>

      {cardsError && (
        <ErrorMessage error={cardsError.message || 'فشل في تحميل البطاقات'} onDismiss={() => {}} />
      )}

      {cardsLoading ? (
        <div className="card">
          <div className="p-8">
            <LoadingSpinner message="جاري تحميل البطاقات..." />
          </div>
        </div>
      ) : (
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
                      <td className="py-3 px-4 font-mono">{card.code || card.card_id || card.id}</td>
                      <td className="py-3 px-4">
                        {users.find(u => u.id === card.user_id)?.first_name || 'غير معين'}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          (card.status === 'active' || card.status === undefined) ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {(card.status === 'active' || card.status === undefined) ? 'نشط' : 'غير نشط'}
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
      )}

      {cardModal.isOpen && (
        <CardForm
          card={cardModal.data}
          users={users}
          onSubmit={handleSubmit}
          onClose={cardModal.close}
          loading={actionLoading}
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

