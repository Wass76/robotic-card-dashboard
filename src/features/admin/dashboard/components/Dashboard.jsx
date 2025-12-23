import React from 'react';
import { Users, CreditCard, Clock, BarChart3, Zap } from 'lucide-react';
import { format, parseISO, isToday } from 'date-fns';
import { useUsersQuery } from '../../user-operations/hooks';
import { useCardsQuery } from '../../card/hooks';
import { useAttendanceQuery } from '../../attendance/hooks';
import { useStatsQuery } from '../../stats/hooks';
import StatCard from '../../../../components/common/StatCard';
import LoadingSpinner from '../../../../components/common/LoadingSpinner';

const Dashboard = () => {
  const { data: users, isLoading: usersLoading } = useUsersQuery();
  const { data: cards, isLoading: cardsLoading } = useCardsQuery();
  const { data: attendance, isLoading: attendanceLoading } = useAttendanceQuery();
  const { data: stats, isLoading: statsLoading } = useStatsQuery();

  const isLoading = usersLoading || cardsLoading || attendanceLoading || statsLoading;

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
  const attendanceArray = safeArray(attendance);

  const activeUsers = usersArray.filter((u) => u?.status === 'active').length;

  return (
    <div className="space-y-6 fade-in">
      {/* Welcome section */}
      <div className="gradient-robotics rounded-2xl p-6 lg:p-8 text-white relative overflow-hidden">
        <div className="relative z-10">
          <h2 className="text-2xl lg:text-3xl font-bold mb-2">مرحباً بك، وسيم! 👋</h2>
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
          trend="+12% هذا الشهر"
        />
        <StatCard
          title="البطاقات المفعلة"
          value={cardsArray.length}
          subtitle="جميع البطاقات تعمل"
          icon={CreditCard}
          color="gradient-robotics"
          trend="+5 بطاقات جديدة"
        />
        <StatCard
          title="حضور اليوم"
          value={stats?.todayAttendance || 0}
          subtitle="عمليات دخول وخروج"
          icon={Clock}
          color="gradient-robotics"
          trend="+80% معدل الحضور"
        />
        <StatCard
          title="حضور الشهر"
          value={stats?.monthlyAttendance || attendanceArray.length}
          subtitle="إجمالي العمليات"
          icon={BarChart3}
          color="gradient-robotics"
          trend="+15% من الشهر السابق"
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
              {attendanceArray.slice(0, 5).map((record) => (
                <div key={record.id} className="flex items-center justify-between p-3 lg:p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 lg:w-12 lg:h-12 gradient-robotics rounded-full flex items-center justify-center text-white font-semibold text-sm lg:text-base">
                      {record.user_name?.charAt(0) || '?'}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 text-sm lg:text-base">{record.user_name || 'غير معروف'}</p>
                      <div className="flex items-center gap-2">
                        <span className="text-xs lg:text-sm text-gray-600">بطاقة: {record.card_id}</span>
                        <span className="text-xs px-2 py-1 bg-blue-100 text-robotics-dark rounded-full">
                          {record.method}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-medium text-gray-900">
                      {record.timestamp ? format(parseISO(record.timestamp), 'HH:mm') : '--:--'}
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
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">التعرف على الوجه</span>
              <span className="text-sm font-semibold text-purple-600">40%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-purple-500 h-2 rounded-full" style={{width: '40%'}}></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

