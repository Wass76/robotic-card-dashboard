import React from 'react';
import { FileText, Pencil, XCircle } from 'lucide-react';

const UserTable = ({ users, onView, onEdit, onDelete }) => {
  const formatDate = (dateString) => {
    if (!dateString) return 'غير متوفر';
    try {
      const date = new Date(dateString);
      // Use Gregorian (Western) date format
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      });
    } catch {
      return dateString;
    }
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

  const getFullName = (user) => {
    // Handle both snake_case and camelCase field names
    const firstName = (user.first_name || user.firstName || '').toString().trim();
    const lastName = (user.last_name || user.lastName || '').toString().trim();
    const fullName = `${firstName} ${lastName}`.trim();
    return fullName || 'غير متوفر';
  };
  
  // Helper to get field value with fallback for both naming conventions
  const getField = (user, fieldName, snakeCase, camelCase) => {
    return user[fieldName] || user[snakeCase] || user[camelCase] || 'غير متوفر';
  };

  if (users.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg">لا يوجد مستخدمين</p>
      </div>
    );
  }

  return (
    <div className="table-container overflow-x-auto">
      <table className="w-full min-w-[800px]">
        <thead>
          <tr className="border-b border-gray-200">
            <th className="text-right py-3 px-2 lg:px-4 font-semibold text-gray-700 text-sm lg:text-base">الاسم</th>
            <th className="text-right py-3 px-2 lg:px-4 font-semibold text-gray-700 text-sm lg:text-base mobile-hidden">البريد الإلكتروني</th>
            <th className="text-right py-3 px-2 lg:px-4 font-semibold text-gray-700 text-sm lg:text-base mobile-hidden">الهاتف</th>
            <th className="text-right py-3 px-2 lg:px-4 font-semibold text-gray-700 text-sm lg:text-base mobile-hidden">الجنس</th>
            <th className="text-right py-3 px-2 lg:px-4 font-semibold text-gray-700 text-sm lg:text-base mobile-hidden">السنة</th>
            <th className="text-right py-3 px-2 lg:px-4 font-semibold text-gray-700 text-sm lg:text-base mobile-hidden">التخصص</th>
            <th className="text-right py-3 px-2 lg:px-4 font-semibold text-gray-700 text-sm lg:text-base">الدور</th>
            <th className="text-right py-3 px-2 lg:px-4 font-semibold text-gray-700 text-sm lg:text-base mobile-hidden">تاريخ الإنشاء</th>
            <th className="text-center py-3 px-2 lg:px-4 font-semibold text-gray-700 text-sm lg:text-base">الإجراءات</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50">
              <td className="py-3 lg:py-4 px-2 lg:px-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 lg:w-10 lg:h-10 gradient-robotics rounded-full flex items-center justify-center text-white font-semibold text-sm">
                    {user.first_name?.charAt(0) || '?'}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 text-sm lg:text-base">
                      {getFullName(user)}
                    </p>
                    <p className="text-xs text-gray-500 sm:hidden">{user.email || 'غير متوفر'}</p>
                    <p className="text-xs text-gray-500 sm:hidden">{(user.Phone || user.phone || '').toString() || 'غير متوفر'}</p>
                  </div>
                </div>
              </td>
              <td className="py-3 lg:py-4 px-2 lg:px-4 text-gray-700 text-sm lg:text-base mobile-hidden">
                {user.email || 'غير متوفر'}
              </td>
              <td className="py-3 lg:py-4 px-2 lg:px-4 text-gray-700 text-sm lg:text-base mobile-hidden">
                {(user.Phone || user.phone || '').toString() || 'غير متوفر'}
              </td>
              <td className="py-3 lg:py-4 px-2 lg:px-4 text-gray-700 text-sm lg:text-base mobile-hidden">
                {getGenderLabel(user.gender)}
              </td>
              <td className="py-3 lg:py-4 px-2 lg:px-4 text-gray-700 text-sm lg:text-base mobile-hidden">
                {(user.Year || user.year || '').toString() || 'غير متوفر'}
              </td>
              <td className="py-3 lg:py-4 px-2 lg:px-4 text-gray-700 text-sm lg:text-base mobile-hidden">
                {(user.specialization || '').toString() || 'غير متوفر'}
              </td>
              <td className="py-3 lg:py-4 px-2 lg:px-4">
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                  user.role === 'Admin' 
                    ? 'bg-purple-100 text-purple-800' 
                    : 'bg-blue-100 text-blue-800'
                }`}>
                  {user.role || 'User'}
                </span>
              </td>
              <td className="py-3 lg:py-4 px-2 lg:px-4 text-gray-700 text-sm lg:text-base mobile-hidden">
                {formatDate(user.created_at || user.createdAt)}
              </td>
              <td className="py-3 lg:py-4 px-2 lg:px-4">
                <div className="flex items-center justify-center gap-2 lg:gap-3">
                  <button 
                    onClick={() => onView(user)}
                    className="action-btn-view"
                    title="عرض التفاصيل"
                  >
                    <FileText className="w-4 h-4 lg:w-5 lg:h-5" />
                  </button>
                  <button 
                    onClick={() => onEdit(user)}
                    className="action-btn-edit"
                    title="تعديل"
                  >
                    <Pencil className="w-4 h-4 lg:w-5 lg:h-5" />
                  </button>
                  <button 
                    onClick={() => onDelete(user.id)}
                    className="action-btn-delete"
                    title="حذف"
                  >
                    <XCircle className="w-4 h-4 lg:w-5 lg:h-5" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default UserTable;

