import React, { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Filter, Download, Search } from 'lucide-react';
import { useAttendanceRecordsByUserIdQuery } from '../../attendance-by-user/hooks';
import { useUsersQuery } from '../../user-operations/hooks';
import { useDebounce } from '../../../../hooks';
import Button from '../../../../components/common/Button';
import LoadingSpinner from '../../../../components/common/LoadingSpinner';
import ErrorMessage from '../../../../components/common/ErrorMessage';

const AttendanceRecords = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const searchTerm = searchParams.get('search') || '';
  const selectedUserId = searchParams.get('userId') || '';
  const [localSelectedUserId, setLocalSelectedUserId] = useState(selectedUserId);
  
  const { data: users = [] } = useUsersQuery();
  const { data: userAttendanceData, isLoading: userAttendanceLoading, error: userAttendanceError } = useAttendanceRecordsByUserIdQuery(
    selectedUserId || null,
    { enabled: !!selectedUserId }
  );
  
  // Only use user-specific attendance
  const attendance = userAttendanceData || [];
  const attendanceLoading = userAttendanceLoading;
  const attendanceError = userAttendanceError;
  
  // Get selected user info for display
  const selectedUser = selectedUserId ? users.find(u => u.id.toString() === selectedUserId.toString()) : null;
  
  const debouncedSearchTerm = useDebounce(searchTerm);
  
  const setSearchTerm = (term) => {
    const params = new URLSearchParams(searchParams);
    if (term) {
      params.set('search', term);
    } else {
      params.delete('search');
    }
    setSearchParams(params, { replace: true });
  };

  const handleUserChange = (userId) => {
    setLocalSelectedUserId(userId);
    const params = new URLSearchParams(searchParams);
    if (userId) {
      params.set('userId', userId);
    } else {
      params.delete('userId');
    }
    setSearchParams(params, { replace: true });
  };
  
  const filteredAttendance = useMemo(() => {
    if (!debouncedSearchTerm) return attendance;
    return attendance.filter(record => {
      // Filter by Login Date or Login Time
      return (
        (record['Login Date'] && record['Login Date'].includes(debouncedSearchTerm)) ||
        (record['Login Time'] && record['Login Time'].includes(debouncedSearchTerm))
      );
    });
  }, [attendance, debouncedSearchTerm]);

  const handleFilter = () => {
    // TODO: Implement filter functionality
  };

  const handleExport = () => {
    // TODO: Implement export functionality
  };
  return (
    <div className="space-y-6 fade-in">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h2 className="text-2xl font-bold text-gray-900">سجلات الحضور</h2>
        <div className="flex gap-2 w-full sm:w-auto">
          <Button variant="secondary" className="flex-1 sm:flex-none" onClick={handleFilter}>
            <Filter className="w-4 h-4 ml-2" />
            فلترة
          </Button>
          <Button variant="secondary" className="flex-1 sm:flex-none" onClick={handleExport}>
            <Download className="w-4 h-4 ml-2" />
            تصدير
          </Button>
        </div>
      </div>

      {/* User Selector */}
      <div className="card">
        <div className="p-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            اختر مستخدم لعرض سجلات الحضور <span className="text-red-500">*</span>
          </label>
          <select
            value={localSelectedUserId}
            onChange={(e) => handleUserChange(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-robotics-primary focus:border-transparent"
            required
          >
            <option value="">-- اختر مستخدم --</option>
            {users.map(user => (
              <option key={user.id} value={user.id}>
                {user.first_name} {user.last_name} ({user.email})
              </option>
            ))}
          </select>
          {selectedUser && (
            <div className="mt-3 p-3 bg-blue-50 rounded-lg">
              <p className="text-sm font-medium text-gray-900">
                عرض سجلات الحضور لـ: {selectedUser.first_name} {selectedUser.last_name}
              </p>
            </div>
          )}
          {!selectedUserId && (
            <div className="mt-3 p-3 bg-yellow-50 rounded-lg">
              <p className="text-sm text-yellow-800">
                يرجى اختيار مستخدم لعرض سجلات الحضور
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Mobile search bar */}
      <div className="sm:hidden">
        <div className="relative">
          <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="البحث..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pr-10 pl-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-robotics-primary focus:border-transparent"
          />
        </div>
      </div>

      {!selectedUserId ? (
        <div className="card">
          <div className="p-8 text-center">
            <p className="text-gray-500 text-lg">يرجى اختيار مستخدم لعرض سجلات الحضور</p>
          </div>
        </div>
      ) : (
        <>
          {attendanceError && (
            <ErrorMessage error={attendanceError.message || 'فشل في تحميل سجلات الحضور'} onDismiss={() => {}} />
          )}

          {attendanceLoading ? (
            <div className="card">
              <div className="p-8">
                <LoadingSpinner message="جاري تحميل سجلات الحضور..." />
              </div>
            </div>
          ) : (
            <div className="card">
              <div className="p-4 lg:p-6">
                <div className="space-y-4">
                  {filteredAttendance.map((record, index) => (
                    <div key={`login-${index}`} className="flex items-center justify-between p-3 lg:p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                      <div className="flex items-center gap-3 lg:gap-4">
                        <div className="w-10 h-10 lg:w-12 lg:h-12 gradient-robotics rounded-full flex items-center justify-center text-white font-semibold text-sm lg:text-base">
                          {selectedUser ? (selectedUser.first_name?.charAt(0) || selectedUser.last_name?.charAt(0) || '?') : '🟢'}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 text-sm lg:text-base">
                            {selectedUser ? `${selectedUser.first_name} ${selectedUser.last_name}` : 'تسجيل دخول'}
                          </p>
                          <p className="text-xs lg:text-sm text-gray-600 mt-1">
                            {record['Login Date']}
                          </p>
                        </div>
                      </div>
                      <div className="text-left">
                        <p className="text-sm font-medium text-gray-900">
                          {record['Login Time']}
                        </p>
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          🟢 دخول
                        </span>
                      </div>
                    </div>
                  ))}
                  {filteredAttendance.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      {attendance.length === 0 ? 'لا توجد سجلات حضور لهذا المستخدم' : 'لا توجد نتائج مطابقة للبحث'}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AttendanceRecords;


