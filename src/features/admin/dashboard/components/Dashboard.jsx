import React, { useState, useMemo } from 'react';
import { Users, CreditCard, Clock, BarChart3, Zap, ChevronLeft, ChevronRight } from 'lucide-react';
import { useUsersQuery } from '../../user-operations/hooks';
import { useCardsQuery } from '../../card/hooks';
import { useAllUsersAttendanceQuery } from '../../all-users-attendance/hooks';
import StatCard from '../../../../components/common/StatCard';
import LoadingSpinner from '../../../../components/common/LoadingSpinner';

const Dashboard = () => {
  const [allUsersAttendancePage, setAllUsersAttendancePage] = useState(1);
  const perPage = 10;

  const { data: users, isLoading: usersLoading } = useUsersQuery();
  const { data: cards, isLoading: cardsLoading } = useCardsQuery();
  
  // Single call for page 1 with more records (for stats, recent, and paginated section)
  const { 
    data: allUsersAttendancePage1, 
    isLoading: allUsersAttendancePage1Loading 
  } = useAllUsersAttendanceQuery({ per_page: 50, page: 1 });
  
  // Only make second call if user navigates to page > 1
  const { 
    data: allUsersAttendanceOtherPages, 
    isLoading: allUsersAttendanceOtherPagesLoading 
  } = useAllUsersAttendanceQuery(
    { per_page: perPage, page: allUsersAttendancePage },
    { enabled: allUsersAttendancePage > 1 } // Only fetch if page > 1
  );
  
  // Use page 1 data when on page 1, otherwise use other pages data
  const allUsersAttendance = allUsersAttendancePage === 1 
    ? allUsersAttendancePage1 
    : allUsersAttendanceOtherPages;
  
  const allUsersAttendanceLoading = allUsersAttendancePage === 1
    ? allUsersAttendancePage1Loading
    : allUsersAttendanceOtherPagesLoading;

  // Calculate stats from all users attendance data (must be called before early return)
  const stats = useMemo(() => {
    const allRecordsForStats = allUsersAttendancePage1?.data || [];
    const today = new Date();
    const todayAttendance = allRecordsForStats.filter((record) => {
      // Check if record has login_date or logout_date that matches today
      const dateStr = record.login_date || record.logout_date;
      if (!dateStr) return false;
      
      // Parse date string like "December 24, 2024"
      try {
        const recordDate = new Date(dateStr);
        return (
          recordDate.getDate() === today.getDate() &&
          recordDate.getMonth() === today.getMonth() &&
          recordDate.getFullYear() === today.getFullYear()
        );
      } catch {
        return false;
      }
    }).length;

    // Get monthly attendance count (all records from current month)
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    const monthlyAttendance = allRecordsForStats.filter((record) => {
      const dateStr = record.login_date || record.logout_date;
      if (!dateStr) return false;
      try {
        const recordDate = new Date(dateStr);
        return (
          recordDate.getMonth() === currentMonth &&
          recordDate.getFullYear() === currentYear
        );
      } catch {
        return false;
      }
    }).length;

    return {
      todayAttendance,
      monthlyAttendance: allUsersAttendancePage1?.total || monthlyAttendance,
    };
  }, [allUsersAttendancePage1]);

  const isLoading = usersLoading || cardsLoading || allUsersAttendanceLoading;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner />
      </div>
    );
  }

  // Ensure data is always an array
  const safeArray = (data) => {
    if (!data) return [];
    if (Array.isArray(data)) return data;
    if (data && typeof data === 'object' && Array.isArray(data.data)) return data.data;
    return [];
  };

  const usersArray = safeArray(users);
  const cardsArray = safeArray(cards);
  
  // Handle paginated all users attendance data
  // When on page 1, use page1 data's pagination info, otherwise use current page data
  const paginationSource = allUsersAttendancePage === 1 ? allUsersAttendancePage1 : allUsersAttendance;
  const allUsersAttendancePagination = paginationSource ? {
    currentPage: allUsersAttendancePage,
    lastPage: paginationSource.last_page || 1,
    total: paginationSource.total || 0,
    perPage: allUsersAttendancePage === 1 ? perPage : (paginationSource.per_page || perPage),
  } : null;

  const activeUsers = usersArray.filter((u) => u?.status === 'active').length;
  
  // Get recent attendance records (first 5 from page 1 data)
  const recentAttendance = (allUsersAttendancePage1?.data || []).slice(0, 5);
  
  // For paginated section: use page 1 data if on page 1, otherwise slice the data for current page
  const allUsersAttendanceRecords = allUsersAttendancePage === 1
    ? (allUsersAttendancePage1?.data || []).slice(0, perPage) // Use first 10 from page 1
    : (allUsersAttendance?.data || []);

  return (
    <div className="space-y-6 fade-in">
      {/* Welcome section */}
      <div className="gradient-robotics rounded-2xl p-6 lg:p-8 text-white relative overflow-hidden">
        <div className="relative z-10">
          <h2 className="text-2xl lg:text-3xl font-bold mb-2">مرحباً بك، أيها الكابتن! 👋</h2>
          <p className="text-blue-100 mb-4 text-sm lg:text-base">إليك نظرة سريعة على أداء النظام اليوم</p>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-sm">النظام يعمل بشكل طبيعي</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4" />
              <span className="text-sm">{activeUsers} مستخدمين نشطين</span>
            </div>
          </div>
        </div>
        <div className="absolute top-0 left-0 w-full h-full opacity-10">
        </div>
      </div>

      {/* Stat cards */}
      <div className="stat-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        <StatCard
          title="إجمالي المستخدمين"
          value={usersArray.length}
          subtitle={`${activeUsers} نشط`}
          icon={Users}
          color="gradient-robotics"
          // trend="+12% هذا الشهر"
        />
        <StatCard
          title="البطاقات المفعلة"
          value={cardsArray.length}
          subtitle="جميع البطاقات تعمل"
          icon={CreditCard}
          color="gradient-robotics"
          // trend="+5 بطاقات جديدة"
        />
        <StatCard
          title="حضور اليوم"
          value={stats.todayAttendance}
          subtitle="عمليات دخول وخروج"
          icon={Clock}
          color="gradient-robotics"
          // trend="+80% معدل الحضور"
        />
        <StatCard
          title="حضور الشهر"
          value={stats.monthlyAttendance}
          subtitle="إجمالي العمليات"
          icon={BarChart3}
          color="gradient-robotics"
          // trend="+15% من الشهر السابق"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent attendance */}
        <div className="lg:col-span-2 card">
          <div className="p-4 lg:p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">آخر عمليات الحضور</h3>
              <button className="text-robotics-primary hover:text-robotics-dark text-sm font-medium">
                عرض الكل
              </button>
            </div>
          </div>
          <div className="p-4 lg:p-6">
            <div className="space-y-4">
              {recentAttendance.length === 0 ? (
                <div className="text-center py-4 text-gray-500 text-sm">
                  لا توجد سجلات حضور حديثة
                </div>
              ) : (
                recentAttendance.map((record, index) => (
                  <div key={`recent-${record.user_id}-${index}`} className="flex items-center justify-between p-3 lg:p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 lg:w-12 lg:h-12 gradient-robotics rounded-full flex items-center justify-center text-white font-semibold text-sm lg:text-base">
                        {record.user_name?.charAt(0) || '?'}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 text-sm lg:text-base">{record.user_name || 'غير معروف'}</p>
                        <div className="flex items-center gap-2 mt-1">
                          {(record.type === 'entry' || record.type === 'enter' || record.type === 'دخول') && record.login_date && (
                            <span className="text-xs lg:text-sm text-gray-600">
                              📅 {record.login_date} 🕐 {record.login_time}
                            </span>
                          )}
                          {(record.type === 'ُExit' || record.type === 'exit' || record.type === 'خروج') && record.logout_date && (
                            <span className="text-xs lg:text-sm text-gray-600">
                              📅 {record.logout_date} 🕐 {record.logout_time}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-left">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        (record.type === 'entry' || record.type === 'enter' || record.type === 'دخول')
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {(record.type === 'entry' || record.type === 'enter' || record.type === 'دخول') ? '🟢 دخول' : '🔴 خروج'}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Quick stats */}
        <div className="card">
          <div className="p-4 lg:p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">إحصائيات سريعة</h3>
          </div>
          <div className="p-4 lg:p-6 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">معدل الحضور اليومي</span>
              <span className="text-sm font-semibold text-green-600">85%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="gradient-robotics h-2 rounded-full" style={{width: '85%'}}></div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">استخدام RFID</span>
              <span className="text-sm font-semibold text-blue-600">60%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-blue-500 h-2 rounded-full" style={{width: '60%'}}></div>
            </div>
          </div>
        </div>
      </div>

      {/* All Users Attendance Records */}
      <div className="card">
        <div className="p-4 lg:p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">سجلات حضور جميع المستخدمين</h3>
            {allUsersAttendancePagination && (
              <span className="text-sm text-gray-600">
                إجمالي: {allUsersAttendancePagination.total} سجل
              </span>
            )}
          </div>
        </div>
        <div className="p-4 lg:p-6">
          {allUsersAttendanceLoading ? (
            <div className="flex items-center justify-center py-8">
              <LoadingSpinner />
            </div>
          ) : allUsersAttendanceRecords.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>لا توجد سجلات حضور</p>
            </div>
          ) : (
            <>
              <div className="space-y-3">
                {allUsersAttendanceRecords.map((record, index) => (
                  <div 
                    key={`${record.user_id}-${index}`} 
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <div className="w-10 h-10 lg:w-12 lg:h-12 gradient-robotics rounded-full flex items-center justify-center text-white font-semibold text-sm lg:text-base">
                        {record.user_name?.charAt(0) || '?'}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 text-sm lg:text-base">
                          {record.user_name || 'غير معروف'}
                        </p>
                        <div className="flex items-center gap-3 mt-1">
                          {(record.type === 'entry' || record.type === 'enter' || record.type === 'دخول') && (
                            <>
                              {record.login_date && (
                                <span className="text-xs text-gray-600">
                                  📅 {record.login_date}
                                </span>
                              )}
                              {record.login_time && (
                                <span className="text-xs text-gray-600">
                                  🕐 {record.login_time}
                                </span>
                              )}
                            </>
                          )}
                          {(record.type === 'ُExit' || record.type === 'exit' || record.type === 'خروج') && (
                            <>
                              {record.logout_date && (
                                <span className="text-xs text-gray-600">
                                  📅 {record.logout_date}
                                </span>
                              )}
                              {record.logout_time && (
                                <span className="text-xs text-gray-600">
                                  🕐 {record.logout_time}
                                </span>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-left">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                        (record.type === 'entry' || record.type === 'enter' || record.type === 'دخول')
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {(record.type === 'entry' || record.type === 'enter' || record.type === 'دخول') ? '🟢 دخول' : '🔴 خروج'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Pagination */}
              {allUsersAttendancePagination && allUsersAttendancePagination.lastPage > 1 && (
                <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200">
                  <div className="text-sm text-gray-600">
                    الصفحة {allUsersAttendancePagination.currentPage} من {allUsersAttendancePagination.lastPage}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setAllUsersAttendancePage(prev => Math.max(1, prev - 1))}
                      disabled={allUsersAttendancePagination.currentPage === 1}
                      className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setAllUsersAttendancePage(prev => Math.min(allUsersAttendancePagination.lastPage, prev + 1))}
                      disabled={allUsersAttendancePagination.currentPage === allUsersAttendancePagination.lastPage}
                      className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

