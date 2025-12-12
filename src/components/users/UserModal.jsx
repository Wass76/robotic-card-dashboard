import React from 'react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import { Pencil, XCircle, CreditCard, User } from 'lucide-react';

const UserModal = ({ user, hasCard, onClose, onEdit, onDelete, onCreateCard }) => {
  if (!user) return null;

  const getFullName = () => {
    const firstName = (user.first_name || user.firstName || '').toString().trim();
    const lastName = (user.last_name || user.lastName || '').toString().trim();
    return `${firstName} ${lastName}`.trim() || 'غير متوفر';
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
    };
    return genderMap[gender] || gender;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'غير متوفر';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      });
    } catch {
      return dateString;
    }
  };

  const getFieldValue = (value) => {
    if (value === null || value === undefined || value === '') return 'غير متوفر';
    return value.toString();
  };

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title="تفاصيل المستخدم"
      size="lg"
    >
      <div className="space-y-6">
        {/* User Avatar and Name */}
        <div className="flex items-center gap-4 pb-4 border-b border-gray-200">
          <div className="w-16 h-16 gradient-robotics rounded-full flex items-center justify-center text-white font-bold text-xl">
            {(user.first_name || user.firstName || '?').charAt(0).toUpperCase()}
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900">{getFullName()}</h3>
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium mt-1 ${
              user.role === 'Admin' 
                ? 'bg-purple-100 text-purple-800' 
                : 'bg-blue-100 text-blue-800'
            }`}>
              {user.role || 'User'}
            </span>
          </div>
        </div>

        {/* User Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">الاسم الأول</label>
            <p className="text-base text-gray-900">{getFieldValue(user.first_name || user.firstName)}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">اسم العائلة</label>
            <p className="text-base text-gray-900">{getFieldValue(user.last_name || user.lastName)}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">البريد الإلكتروني</label>
            <p className="text-base text-gray-900">{getFieldValue(user.email)}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">رقم الهاتف</label>
            <p className="text-base text-gray-900">{getFieldValue(user.Phone || user.phone)}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">الجنس</label>
            <p className="text-base text-gray-900">{getGenderLabel(user.gender)}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">السنة</label>
            <p className="text-base text-gray-900">{getFieldValue(user.Year || user.year)}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">التخصص</label>
            <p className="text-base text-gray-900">{getFieldValue(user.specialization)}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">تاريخ الإنشاء</label>
            <p className="text-base text-gray-900">{formatDate(user.created_at || user.createdAt)}</p>
          </div>
        </div>

        {/* Card Status */}
        {hasCard !== undefined && (
          <div className="pt-4 border-t border-gray-200">
            <div className="flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">
                حالة البطاقة: {hasCard ? 'موجودة' : 'غير موجودة'}
              </span>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200">
          {!hasCard && onCreateCard && (
            <Button
              variant="primary"
              onClick={() => onCreateCard(user)}
              className="flex-1"
              icon={<CreditCard className="w-4 h-4" />}
            >
              إنشاء بطاقة
            </Button>
          )}
          {onEdit && (
            <Button
              variant="secondary"
              onClick={() => onEdit(user)}
              className="flex-1"
              icon={<Pencil className="w-4 h-4" />}
            >
              تعديل
            </Button>
          )}
          {onDelete && (
            <Button
              variant="secondary"
              onClick={() => onDelete(user.id)}
              className="flex-1 text-red-600 hover:text-red-700 hover:bg-red-50"
              icon={<XCircle className="w-4 h-4" />}
            >
              حذف
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default UserModal;

