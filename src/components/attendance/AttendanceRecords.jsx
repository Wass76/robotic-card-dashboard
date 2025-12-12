import React, { useMemo } from 'react';
import { Filter, Download, Search } from 'lucide-react';
import { useApp } from '../../context';
import { useDebounce } from '../../hooks';
import Button from '../common/Button';

const AttendanceRecords = ({ searchTerm, setSearchTerm }) => {
  const { attendance } = useApp();
  const debouncedSearchTerm = useDebounce(searchTerm);
  
  const filteredAttendance = useMemo(() => {
    if (!debouncedSearchTerm) return attendance;
    return attendance.filter(record => 
      (record.user_name && record.user_name.includes(debouncedSearchTerm)) || 
      (record.card_id && record.card_id.includes(debouncedSearchTerm))
    );
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

      <div className="card">
        <div className="p-4 lg:p-6">
          <div className="space-y-4">
            {filteredAttendance.map((record) => (
              <div key={record.id} className="flex items-center justify-between p-3 lg:p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                <div className="flex items-center gap-3 lg:gap-4">
                  <div className="w-10 h-10 lg:w-12 lg:h-12 gradient-robotics rounded-full flex items-center justify-center text-white font-semibold text-sm lg:text-base">
                    {record.user_name?.charAt(0) || '?'}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 text-sm lg:text-base">{record.user_name || 'غير معروف'}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs lg:text-sm text-gray-600">بطاقة: {record.card_id}</span>
                      <span className="text-xs px-2 py-1 bg-blue-100 text-robotics-dark rounded-full">
                        {record.method}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-left">
                  <p className="text-sm font-medium text-gray-900">
                    {new Date(record.timestamp).toLocaleString('ar-SA')}
                  </p>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    record.type === 'entry' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {record.type === 'entry' ? '🟢 دخول' : '🔴 خروج'}
                  </span>
                </div>
              </div>
            ))}
            {filteredAttendance.length === 0 && (
              <div className="text-center py-8 text-gray-500">لا توجد سجلات حضور</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AttendanceRecords;

