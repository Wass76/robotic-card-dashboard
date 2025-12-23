import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { format, parseISO } from 'date-fns';
import { ArrowRight, Pencil, XCircle, CreditCard, Mail, Phone, Calendar, User, GraduationCap, Tag } from 'lucide-react';
import { useUserQuery, useDeleteUserMutation, useUpdateUserMutation } from '../hooks';
import { useCardsQuery } from '../../card/hooks';
import { useToast } from '../../../../components/common';
import Button from '../../../../components/common/Button';
import LoadingSpinner from '../../../../components/common/LoadingSpinner';
import ErrorMessage from '../../../../components/common/ErrorMessage';
import UserForm from './UserForm';
import { useModal } from '../../../../hooks';

const UserDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: user, isLoading, error } = useUserQuery(id);
  const { data: cards = [] } = useCardsQuery();
  const deleteUserMutation = useDeleteUserMutation();
  const updateUserMutation = useUpdateUserMutation();
  const toast = useToast();
  const editUserModal = useModal();
  const deleteConfirmModal = useModal();
  const actionLoading = updateUserMutation.isPending || deleteUserMutation.isPending;

  const hasCard = Array.isArray(cards) && cards.some(c => c.user_id === user?.id);

  const handleDelete = async (userId) => {
    try {
      await deleteUserMutation.mutateAsync(userId);
      toast.showSuccess('تم حذف المستخدم بنجاح');
      deleteConfirmModal.close();
      navigate('/users');
    } catch (err) {
      toast.showError(err.message || 'فشل في حذف المستخدم');
    }
  };

  const handleUpdateUser = async (userData) => {
    try {
      await updateUserMutation.mutateAsync({
        id: editUserModal.data.id,
        payload: userData,
      });
      toast.showSuccess('تم تحديث المستخدم بنجاح');
      editUserModal.close();
    } catch (err) {
      toast.showError(err.message || 'فشل في تحديث المستخدم');
    }
  };

  const handleCreateCard = (user) => {
    // Navigate to cards view and trigger create card modal
    const event = new CustomEvent('openCreateCard', { detail: user });
    window.dispatchEvent(event);
    navigate('/cards');
  };

  if (isLoading) {
    return (
      <div className="card">
        <div className="p-8">
          <LoadingSpinner message="جاري تحميل تفاصيل المستخدم..." />
        </div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="card">
        <div className="p-8">
          <ErrorMessage 
            error={error?.message || 'المستخدم غير موجود'} 
            onDismiss={() => navigate('/users')} 
          />
        </div>
      </div>
    );
  }

  const getFullName = () => {
    const firstName = (user.first_name || user.firstName || '').toString().trim();
    const lastName = (user.last_name || user.lastName || '').toString().trim();
    return `${firstName} ${lastName}`.trim() || 'غير متوفر';
  };

  const getInitials = () => {
    const firstName = (user.first_name || user.firstName || '').toString().trim();
    const lastName = (user.last_name || user.lastName || '').toString().trim();
    if (firstName && lastName) {
      return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
    }
    return (firstName || '?').charAt(0).toUpperCase();
  };

  const getGenderLabel = (gender) => {
    if (!gender) return 'غير محدد';
    const genderMap = {
      'male': 'ذكر',
      'female': 'أنثى',
      'Male': 'ذكر',
      'Female': 'أنثى',
      'M': 'ذكر',
      'F': 'أنثى',
      'ذكر': 'ذكر',
      'أنثى': 'أنثى',
    };
    return genderMap[gender] || gender;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'غير متوفر';
    try {
      const date = typeof dateString === 'string' ? parseISO(dateString) : new Date(dateString);
      return format(date, 'MMM d, yyyy');
    } catch {
      return dateString;
    }
  };

  const getFieldValue = (value) => {
    if (value === null || value === undefined || value === '' || value === 'null') return 'غير متوفر';
    return value.toString();
  };

  const InfoField = ({ icon: Icon, label, value }) => (
    <div className="flex items-start gap-3 p-4 rounded-xl hover:bg-gray-50 transition-colors border border-gray-100">
      <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center">
        {Icon && <Icon className="w-5 h-5 text-gray-600" />}
      </div>
      <div className="flex-1 min-w-0">
        <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">{label}</label>
        <p className="text-base font-medium text-gray-900 break-words">{value}</p>
      </div>
    </div>
  );

  return (
    <div className="space-y-6 fade-in">
      {/* Header with Back Button */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/users')}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          aria-label="رجوع"
        >
          <ArrowRight className="w-6 h-6 text-gray-600" />
        </button>
        <h2 className="text-2xl font-bold text-gray-900">تفاصيل المستخدم</h2>
      </div>

      {/* User Details Card */}
      <div className="card">
        <div className="p-6 space-y-6">
          {/* User Avatar and Name */}
          <div className="flex flex-col items-center text-center pb-6 border-b border-gray-200">
            <div className="w-24 h-24 gradient-robotics rounded-full flex items-center justify-center text-white font-bold text-3xl shadow-xl mb-4">
              {getInitials()}
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">{getFullName()}</h3>
            <span className={`inline-flex items-center px-5 py-2 rounded-full text-sm font-semibold ${
              user.role === 'Admin' 
                ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-md' 
                : 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md'
            }`}>
              {user.role || 'User'}
            </span>
          </div>

          {/* User Details Grid */}
          <div className="space-y-3">
            <InfoField
              icon={User}
              label="الاسم الأول"
              value={getFieldValue(user.first_name || user.firstName)}
            />
            <InfoField
              icon={User}
              label="اسم العائلة"
              value={getFieldValue(user.last_name || user.lastName)}
            />
            <InfoField
              icon={Mail}
              label="البريد الإلكتروني"
              value={getFieldValue(user.email)}
            />
            <InfoField
              icon={Phone}
              label="رقم الهاتف"
              value={getFieldValue(user.Phone || user.phone)}
            />
            <InfoField
              icon={Tag}
              label="الجنس"
              value={getGenderLabel(user.gender)}
            />
            <InfoField
              icon={GraduationCap}
              label="السنة"
              value={getFieldValue(user.Year || user.year)}
            />
            <InfoField
              icon={GraduationCap}
              label="التخصص"
              value={getFieldValue(user.specialization)}
            />
            <InfoField
              icon={Calendar}
              label="تاريخ الإنشاء"
              value={formatDate(user.created_at || user.createdAt)}
            />
          </div>

          {/* Card Status */}
          {hasCard !== undefined && (
            <div className="pt-4 border-t border-gray-200">
              <div className={`flex items-center gap-4 p-5 rounded-xl ${
                hasCard 
                  ? 'bg-green-50 border-2 border-green-200' 
                  : 'bg-orange-50 border-2 border-orange-200'
              }`}>
                <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${
                  hasCard ? 'bg-green-100' : 'bg-orange-100'
                }`}>
                  <CreditCard className={`w-7 h-7 ${
                    hasCard ? 'text-green-600' : 'text-orange-600'
                  }`} />
                </div>
                <div>
                  <span className="block text-sm font-semibold text-gray-700 mb-1">حالة البطاقة</span>
                  <span className={`text-base font-bold ${
                    hasCard ? 'text-green-700' : 'text-orange-700'
                  }`}>
                    {hasCard ? 'موجودة' : 'غير موجودة'}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200">
            {!hasCard && (
              <Button
                variant="primary"
                onClick={() => handleCreateCard(user)}
                className="flex-1"
              >
                <CreditCard className="w-4 h-4 ml-2" />
                إنشاء بطاقة
              </Button>
            )}
            <Button
              variant="secondary"
              onClick={() => editUserModal.open('edit', user)}
              className="flex-1"
            >
              <Pencil className="w-4 h-4 ml-2" />
              تعديل
            </Button>
            <Button
              variant="secondary"
              onClick={() => deleteConfirmModal.open('delete', user.id)}
              className="flex-1 bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 border-red-200"
            >
              <XCircle className="w-4 h-4 ml-2" />
              حذف
            </Button>
          </div>
        </div>
      </div>

      {/* Edit User Modal */}
      {editUserModal.isOpen && editUserModal.data && (
        <UserForm
          user={editUserModal.data}
          onSubmit={handleUpdateUser}
          onClose={editUserModal.close}
          loading={actionLoading}
        />
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmModal.isOpen && deleteConfirmModal.data && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm">
            <div className="p-4">
              <h3 className="text-lg font-bold text-gray-900 mb-2">تأكيد الحذف</h3>
              <p className="text-sm text-gray-600 mb-4">هل أنت متأكد من حذف هذا المستخدم؟ لا يمكن التراجع عن هذا الإجراء.</p>
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
                  disabled={actionLoading}
                >
                  {actionLoading ? 'جاري الحذف...' : 'حذف'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserDetails;


