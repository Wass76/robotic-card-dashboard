import React, { useState, useMemo, useEffect } from 'react';
import * as api from './services/api';
import { 
  LayoutDashboard, 
  Users, 
  CreditCard, 
  Clock, 
  BarChart3, 
  Settings,
  Menu,
  X,
  Search,
  LogOut,
  Activity,
  Zap,
  TrendingUp,
  FileText,
  Pencil,
  XCircle,
  Plus,
  Filter,
  Download,
  UserCheck,
  Calendar,
  Shield,
  Eye,
  EyeOff
} from 'lucide-react';

// بيانات ثابتة لمنع الترميش - لن تتغير أبداً
const STATIC_DATA = Object.freeze({
  users: [
    { id: 1, first_name: 'سنا', last_name: 'مسلم', email: 'sana@robotics.club', phone: '0987654321', role: 'Admin', created_at: '2024-01-15', card_id: '1111', status: 'active', last_seen: '2024-11-24 09:30:00' },
    { id: 2, first_name: 'سلام', last_name: 'مسلم', email: 'salam@robotics.club', phone: '0987654322', role: 'User', created_at: '2024-01-16', card_id: '2222', status: 'active', last_seen: '2024-11-24 10:15:00' },
    { id: 3, first_name: 'إيمان', last_name: 'غباش', email: 'iman@robotics.club', phone: '0987654323', role: 'User', created_at: '2024-01-17', card_id: '3333', status: 'active', last_seen: '2024-11-24 11:00:00' },
    { id: 4, first_name: 'حلا', last_name: 'عرقسوسي', email: 'hala@robotics.club', phone: '0987654324', role: 'User', created_at: '2024-01-18', card_id: '4444', status: 'inactive', last_seen: '2024-11-23 14:20:00' },
    { id: 5, first_name: 'أيمن', last_name: 'الأحمد', email: 'ayman@robotics.club', phone: '0987654325', role: 'User', created_at: '2024-01-19', card_id: '5555', status: 'active', last_seen: '2024-11-24 08:45:00' },
  ],
  attendance: [
    { id: 1, user_id: 1, user_name: 'سنا مسلم', card_id: '1111', timestamp: '2024-11-24 09:30:00', type: 'entry', method: 'RFID' },
    { id: 2, user_id: 2, user_name: 'سلام مسلم', card_id: '2222', timestamp: '2024-11-24 10:15:00', type: 'entry', method: 'Face Recognition' },
    { id: 3, user_id: 3, user_name: 'إيمان غباش', card_id: '3333', timestamp: '2024-11-24 11:00:00', type: 'entry', method: 'RFID' },
    { id: 4, user_id: 1, user_name: 'سنا مسلم', card_id: '1111', timestamp: '2024-11-24 17:30:00', type: 'exit', method: 'RFID' },
    { id: 5, user_id: 4, user_name: 'حلا عرقسوسي', card_id: '4444', timestamp: '2024-11-24 14:20:00', type: 'entry', method: 'Face Recognition' },
    { id: 6, user_id: 5, user_name: 'أيمن الأحمد', card_id: '5555', timestamp: '2024-11-24 08:45:00', type: 'entry', method: 'RFID' },
  ],
  stats: {
    totalUsers: 5,
    activeUsers: 4,
    totalCards: 5,
    todayAttendance: 5,
    monthlyAttendance: 87,
    systemStatus: 'online',
    lastSync: '2024-11-24 16:00:00'
  }
});

function App() {
  const [currentView, setCurrentView] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false); // مغلق افتراضياً للهاتف
  const [searchTerm, setSearchTerm] = useState('');
  const [users, setUsers] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddUserForm, setShowAddUserForm] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [viewMode, setViewMode] = useState(null); // 'view', 'edit', or null
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const [cards, setCards] = useState([]);
  const [showAddCardForm, setShowAddCardForm] = useState(false);
  const [selectedCard, setSelectedCard] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [authError, setAuthError] = useState(null);

  // Check auth token on mount
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      setIsLoggedIn(true);
    }
  }, []);

  // Fetch initial data
  useEffect(() => {
    if (isLoggedIn) {
      fetchData();
    }
  }, [isLoggedIn]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch users, cards, and attendance in parallel
      const [usersData, cardsData, attendanceData, monthlyAttendance] = await Promise.all([
        api.getUsers().catch(e => { console.error(e); return []; }), 
        api.getCards().catch(e => { console.error(e); return []; }),
        api.getAllAttendance().catch(e => { console.error(e); return []; }),
        api.getMonthlyAttendance().catch(e => { console.error(e); return null; }),
      ]);

      setUsers(usersData || []);
      setCards(cardsData || []);
      setAttendance(attendanceData || []);
      setStats({
        totalUsers: usersData?.length || 0,
        activeUsers: usersData?.filter(u => u.status === 'active').length || 0,
        totalCards: cardsData?.length || 0,
        monthlyAttendance: monthlyAttendance?.total || attendanceData?.length || 0,
        todayAttendance: attendanceData?.filter(a => new Date(a.timestamp).toDateString() === new Date().toDateString()).length || 0,
        lastSync: new Date().toISOString()
      });
    } catch (err) {
      console.error('Error fetching data:', err);
      setError(err.message || 'فشل في تحميل البيانات');
      // Fallback to static data if API fails completely
      setUsers([...STATIC_DATA.users]);
      setAttendance([...STATIC_DATA.attendance]);
      setStats(STATIC_DATA.stats);
    } finally {
      setLoading(false);
    }
  };

  // استخدام useMemo للبيانات المفلترة لمنع إعادة الحساب
  const filteredUsers = useMemo(() => {
    if (!searchTerm) return users;
    return users.filter(user => 
      user.first_name.includes(searchTerm) || 
      user.last_name.includes(searchTerm) || 
      user.email.includes(searchTerm)
    );
  }, [searchTerm, users]);

  const filteredAttendance = useMemo(() => {
    if (!searchTerm) return attendance;
    return attendance.filter(record => 
      (record.user_name && record.user_name.includes(searchTerm)) || 
      (record.card_id && record.card_id.includes(searchTerm))
    );
  }, [searchTerm, attendance]);

  // معالجات الإجراءات
  const handleAddUser = async (userData) => {
    try {
      setActionLoading(true);
      setError(null);
      const newUser = await api.createUser(userData);
      setUsers([...users, newUser]);
      setShowAddUserForm(false);
      // Refresh data to get updated stats
      await fetchData();
    } catch (err) {
      console.error('Error creating user:', err);
      setError(err.message || 'فشل في إضافة المستخدم');
      throw err; // Re-throw to let the form handle it
    } finally {
      setActionLoading(false);
    }
  };

  const handleEditUser = async (userData) => {
    try {
      setActionLoading(true);
      setError(null);
      const updatedUser = await api.updateUser(selectedUser.id, userData);
      setUsers(users.map(user => 
        user.id === selectedUser.id ? updatedUser : user
      ));
      setSelectedUser(null);
      setViewMode(null);
      // Refresh data to get updated stats
      await fetchData();
    } catch (err) {
      console.error('Error updating user:', err);
      setError(err.message || 'فشل في تحديث المستخدم');
      throw err;
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    try {
      setActionLoading(true);
      setError(null);
      await api.deleteUser(userId);
      setUsers(users.filter(user => user.id !== userId));
      setDeleteConfirm(null);
      // Refresh data to get updated stats
      await fetchData();
    } catch (err) {
      console.error('Error deleting user:', err);
      setError(err.message || 'فشل في حذف المستخدم');
    } finally {
      setActionLoading(false);
    }
  };

  const handleViewUser = (user) => {
    setSelectedUser(user);
    setViewMode('view');
  };

  const handleEditClick = (user) => {
    setSelectedUser(user);
    setViewMode('edit');
  };

  // قائمة التنقل الجانبية
  const sidebarItems = [
    { id: 'dashboard', label: 'لوحة التحكم', icon: LayoutDashboard, color: 'text-robotics-primary' },
    { id: 'users', label: 'إدارة المستخدمين', icon: Users, color: 'text-robotics-secondary' },
    { id: 'cards', label: 'إدارة البطاقات', icon: CreditCard, color: 'text-robotics-accent' },
    { id: 'attendance', label: 'سجلات الحضور', icon: Clock, color: 'text-robotics-dark' },
    { id: 'analytics', label: 'التحليلات', icon: BarChart3, color: 'text-robotics-primary' },
    { id: 'settings', label: 'الإعدادات', icon: Settings, color: 'text-gray-500' },
  ];

  // مكون تسجيل الدخول
  const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPass, setShowPass] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e) => {
      e.preventDefault();
      setLoading(true);
      setAuthError(null);
      try {
        await api.login(email, password);
        setIsLoggedIn(true);
      } catch (err) {
        console.error('Login error:', err);
        setAuthError('البريد الإلكتروني أو كلمة المرور غير صحيحة');
      } finally {
        setLoading(false);
      }
    };

    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4" dir="rtl">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="p-8">
            <div className="text-center mb-8">
              <div className="w-20 h-20 gradient-robotics rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                <Activity className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">نظام إدارة الحضور</h2>
              <p className="text-gray-600 mt-2">نادي الروبوتيك</p>
            </div>

            {authError && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm text-center">
                {authError}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">البريد الإلكتروني</label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-robotics-primary focus:border-transparent"
                    placeholder="admin@example.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">كلمة المرور</label>
                <div className="relative">
                  <input
                    type={showPass ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-xl focus:ring-2 focus:ring-robotics-primary focus:border-transparent"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showPass ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full gradient-robotics text-white py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? 'جاري الدخول...' : 'تسجيل الدخول'}
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  };

  if (!isLoggedIn) {
    return <Login />;
  }

  // مكون بطاقة الإحصائيات
  const StatCard = ({ title, value, subtitle, icon: Icon, color, trend }) => (
    <div className="stat-card">
      <div className="flex items-center justify-between mb-4">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-2xl lg:text-3xl font-bold text-gray-900">{value}</p>
          <p className="text-xs lg:text-sm text-gray-500 mt-1">{subtitle}</p>
        </div>
        <div className={`w-12 h-12 lg:w-16 lg:h-16 ${color} rounded-2xl flex items-center justify-center flex-shrink-0`}>
          <Icon className="w-6 h-6 lg:w-8 lg:h-8 text-white" />
        </div>
      </div>
      {trend && (
        <div className="flex items-center">
          <TrendingUp className="w-4 h-4 text-green-500 ml-1" />
          <span className="text-xs lg:text-sm text-green-600 font-medium">{trend}</span>
        </div>
      )}
    </div>
  );

  // مكون الترويسة
  const Header = () => (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
      <div className="px-4 lg:px-6 py-4">
        <div className="flex items-center justify-between">
          {/* زر القائمة للهاتف */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          
          {/* شعار وعنوان */}
          <div className="flex items-center gap-3">
            <img src="/robotics-logo.png" alt="Robotics Club" className="w-8 h-8 lg:w-10 lg:h-10" />
            <div className="hidden sm:block">
              <h1 className="text-lg lg:text-xl font-bold text-gray-900">نظام إدارة الحضور الذكي</h1>
              <p className="text-xs lg:text-sm text-gray-600">نادي الروبوتيك</p>
            </div>
          </div>

          {/* شريط البحث والأدوات */}
          <div className="flex items-center gap-2 lg:gap-4">
            {/* شريط البحث */}
            {(currentView === 'users' || currentView === 'attendance') && (
              <div className="relative hidden sm:block">
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="البحث..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-32 lg:w-64 pr-10 pl-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-robotics-primary focus:border-transparent"
                />
              </div>
            )}
            
            {/* المستخدم الحالي */}
            <div className="hidden md:flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
              <div className="w-8 h-8 gradient-robotics rounded-full flex items-center justify-center text-white font-semibold">
                و
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-gray-700">مشرف النظام</p>
                <p className="text-xs text-gray-500">وسيم تنبكجي</p>
              </div>
            </div>
            
            <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
              <LogOut className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );

  // مكون القائمة الجانبية المتجاوبة
  const Sidebar = () => (
    <>
      {/* خلفية مظلمة للهاتف */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      {/* القائمة الجانبية */}
      <aside className={`
        fixed lg:static inset-y-0 right-0 z-50
        w-64 lg:w-72 bg-white shadow-lg border-l border-gray-200
        transform transition-transform duration-300 ease-in-out
        flex flex-col h-screen flex-shrink-0
        ${sidebarOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}
      `}>
        {/* رأس القائمة */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 gradient-robotics rounded-xl flex items-center justify-center shadow-lg">
              <Activity className="w-7 h-7 text-white" />
            </div>
            <div>
              <h2 className="font-bold text-gray-900 text-lg">لوحة التحكم</h2>
              <p className="text-sm text-gray-600">نادي الروبوتيك</p>
            </div>
          </div>
        </div>
        
        {/* قائمة التنقل */}
        <nav className="flex-1 p-4 overflow-y-auto">
          <ul className="space-y-2">
            {sidebarItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;
              
              return (
                <li key={item.id}>
                  <button
                    onClick={() => {
                      setCurrentView(item.id);
                      setSidebarOpen(false); // إغلاق القائمة على الهاتف
                    }}
                    className={`sidebar-item ${isActive ? 'active' : ''}`}
                  >
                    <Icon className={`w-5 h-5 ${isActive ? 'text-white' : item.color}`} />
                    <span className={`font-medium ${isActive ? 'text-white' : 'text-gray-700'}`}>
                      {item.label}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>
        
        {/* معلومات النظام */}
        <div className="p-4 border-t border-gray-200">
          <div className="gradient-robotics rounded-xl p-4 text-white">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium">النظام متصل</span>
            </div>
            <p className="text-xs text-blue-100">
              آخر تحديث: {stats?.lastSync ? new Date(stats.lastSync).toLocaleTimeString('ar-SA') : new Date().toLocaleTimeString('ar-SA')}
            </p>
          </div>
        </div>
      </aside>
    </>
  );

  // مكون لوحة التحكم الرئيسية
  const Dashboard = () => (
    <div className="space-y-6 fade-in">
      {/* ترحيب */}
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
              <span className="text-sm">{users.filter(u => u.status === 'active').length} مستخدمين نشطين</span>
            </div>
          </div>
        </div>
        <div className="absolute top-0 left-0 w-full h-full opacity-10">
        </div>
      </div>

      {/* بطاقات الإحصائيات */}
      <div className="stat-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        <StatCard
          title="إجمالي المستخدمين"
          value={users.length}
          subtitle={`${users.filter(u => u.status === 'active').length} نشط`}
          icon={Users}
          color="gradient-robotics"
          trend="+12% هذا الشهر"
        />
        <StatCard
          title="البطاقات المفعلة"
          value={users.length}
          subtitle="جميع البطاقات تعمل"
          icon={CreditCard}
          color="gradient-robotics"
          trend="+5 بطاقات جديدة"
        />
        <StatCard
          title="حضور اليوم"
          value={stats?.todayAttendance || attendance.filter(a => {
            const today = new Date().toDateString();
            const recordDate = new Date(a.timestamp).toDateString();
            return today === recordDate;
          }).length}
          subtitle="عمليات دخول وخروج"
          icon={Clock}
          color="gradient-robotics"
          trend="+80% معدل الحضور"
        />
        <StatCard
          title="حضور الشهر"
          value={stats?.monthlyAttendance || attendance.length}
          subtitle="إجمالي العمليات"
          icon={BarChart3}
          color="gradient-robotics"
          trend="+15% من الشهر السابق"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* آخر عمليات الحضور */}
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
              {attendance.slice(0, 5).map((record) => (
                <div key={record.id} className="flex items-center justify-between p-3 lg:p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 lg:w-12 lg:h-12 gradient-robotics rounded-full flex items-center justify-center text-white font-semibold text-sm lg:text-base">
                      {record.user_name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 text-sm lg:text-base">{record.user_name}</p>
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
                      {new Date(record.timestamp).toLocaleTimeString('ar-SA', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
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

        {/* إحصائيات سريعة */}
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

  // مكون نموذج إضافة مستخدم
  const AddUserForm = ({ onClose, onSubmit }) => {
    const [formData, setFormData] = useState({
      first_name: '',
      last_name: '',
      Phone: '',
      email: '',
      password: '',
      role: 'User'
    });
    const [showPassword, setShowPassword] = useState(false);

    const handleSubmit = (e) => {
      e.preventDefault();
      onSubmit(formData);
      setFormData({
        first_name: '',
        last_name: '',
        Phone: '',
        email: '',
        password: '',
        role: 'User'
      });
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm max-h-[90vh] overflow-y-auto">
          <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between">
            <h3 className="text-lg font-bold text-gray-900">إضافة مستخدم جديد</h3>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="p-4 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">الاسم الأول</label>
                <input
                  type="text"
                  required
                  value={formData.first_name}
                  onChange={(e) => setFormData({...formData, first_name: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-robotics-primary focus:border-transparent"
                  placeholder="أدخل الاسم الأول"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">اسم العائلة</label>
                <input
                  type="text"
                  required
                  value={formData.last_name}
                  onChange={(e) => setFormData({...formData, last_name: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-robotics-primary focus:border-transparent"
                  placeholder="أدخل اسم العائلة"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">رقم الهاتف</label>
              <input
                type="tel"
                required
                value={formData.Phone}
                onChange={(e) => setFormData({...formData, Phone: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-robotics-primary focus:border-transparent"
                placeholder="0987675572"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">البريد الإلكتروني</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-robotics-primary focus:border-transparent"
                placeholder="sana@gmail.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">كلمة المرور</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-robotics-primary focus:border-transparent"
                  placeholder="أدخل كلمة المرور"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">الدور (اختياري)</label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({...formData, role: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-robotics-primary focus:border-transparent"
              >
                <option value="User">مستخدم</option>
                <option value="Admin">مدير</option>
              </select>
            </div>
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="btn-secondary flex-1 text-sm py-2"
              >
                إلغاء
              </button>
              <button
                type="submit"
                className="btn-primary flex-1 text-sm py-2"
              >
                إضافة المستخدم
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  // مكون عرض تفاصيل المستخدم
  const ViewUserModal = ({ user, onClose, onEdit, onDelete, onCreateCard, hasCard }) => {
    const [userAttendance, setUserAttendance] = useState([]);
    const [loadingAttendance, setLoadingAttendance] = useState(true);

    useEffect(() => {
      const fetchUserAttendance = async () => {
        try {
          setLoadingAttendance(true);
          const records = await api.getUserAttendance(user.id);
          setUserAttendance(records.slice(0, 5)); // آخر 5 سجلات
        } catch (err) {
          console.error('Error fetching user attendance:', err);
          // Fallback to filtering from local attendance data
          const filtered = attendance.filter(
            record => record.user_id === user.id || record.card_id === user.card_id
          ).slice(0, 5);
          setUserAttendance(filtered);
        } finally {
          setLoadingAttendance(false);
        }
      };

      if (user) {
        fetchUserAttendance();
      }
    }, [user, attendance]);

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm max-h-[90vh] overflow-y-auto">
          <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between">
            <h3 className="text-lg font-bold text-gray-900">تفاصيل المستخدم</h3>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>
          </div>
          <div className="p-4 space-y-3">
            <div className="flex items-center gap-3 pb-3 border-b border-gray-200">
              <div className="w-10 h-10 gradient-robotics rounded-full flex items-center justify-center text-white font-bold">
                {user.first_name.charAt(0)}
              </div>
              <div>
                <h4 className="text-base font-bold text-gray-900">{user.first_name} {user.last_name}</h4>
                <p className="text-xs text-gray-500">{user.role}</p>
              </div>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-gray-600 text-sm">البريد الإلكتروني:</span>
                <span className="font-medium text-gray-900 text-sm">{user.email}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 text-sm">رقم الهاتف:</span>
                <span className="font-medium text-gray-900 text-sm">{user.phone}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 text-sm">رقم البطاقة:</span>
                {hasCard ? (
                  <span className="font-medium text-gray-900 text-sm font-mono">{user.card_id}</span>
                ) : (
                  <button
                    onClick={() => { onClose(); onCreateCard(user); }}
                    className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded-lg hover:bg-blue-100 transition-colors flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" />
                    إنشاء بطاقة
                  </button>
                )}
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 text-sm">الحالة:</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  user.status === 'active' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {user.status === 'active' ? 'نشط' : 'غير نشط'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 text-sm">تاريخ الإنشاء:</span>
                <span className="font-medium text-gray-900 text-sm">{user.created_at}</span>
              </div>
            </div>

            {/* سجلات الحضور */}
            {loadingAttendance ? (
              <div className="pt-3 border-t border-gray-200">
                <p className="text-sm text-gray-500 text-center py-4">جاري التحميل...</p>
              </div>
            ) : userAttendance.length > 0 ? (
              <div className="pt-3 border-t border-gray-200">
                <h5 className="text-sm font-semibold text-gray-900 mb-3">سجلات الحضور الأخيرة</h5>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {userAttendance.map((record) => (
                    <div key={record.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${
                          record.type === 'entry' ? 'bg-green-500' : 'bg-red-500'
                        }`}></span>
                        <div>
                          <p className="text-xs font-medium text-gray-900">
                            {record.type === 'entry' ? 'دخول' : 'خروج'}
                          </p>
                          <p className="text-xs text-gray-500">{record.method}</p>
                        </div>
                      </div>
                      <div className="text-left">
                        <p className="text-xs font-medium text-gray-900">
                          {new Date(record.timestamp).toLocaleDateString('ar-SA')}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(record.timestamp).toLocaleTimeString('ar-SA', { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="pt-3 border-t border-gray-200">
                <p className="text-sm text-gray-500 text-center py-4">لا توجد سجلات حضور</p>
              </div>
            )}

            <div className="flex gap-2 pt-3 border-t border-gray-200">
              <button
                onClick={() => { onEdit(user); onClose(); }}
                className="action-btn-edit flex-1 text-sm py-2"
              >
                <Pencil className="w-4 h-4 ml-1" />
                تعديل
              </button>
              <button
                onClick={() => { onDelete(user.id); onClose(); }}
                className="action-btn-delete flex-1 text-sm py-2"
              >
                <XCircle className="w-4 h-4 ml-1" />
                حذف
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // مكون تعديل مستخدم
  const EditUserForm = ({ user, onClose, onSubmit }) => {
    const [formData, setFormData] = useState({
      first_name: user.first_name,
      last_name: user.last_name,
      Phone: user.phone,
      email: user.email,
      role: user.role
    });

    const handleSubmit = (e) => {
      e.preventDefault();
      onSubmit(formData);
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm max-h-[90vh] overflow-y-auto">
          <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between">
            <h3 className="text-lg font-bold text-gray-900">تعديل المستخدم</h3>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="p-4 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">الاسم الأول</label>
                <input
                  type="text"
                  required
                  value={formData.first_name}
                  onChange={(e) => setFormData({...formData, first_name: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-robotics-primary focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">اسم العائلة</label>
                <input
                  type="text"
                  required
                  value={formData.last_name}
                  onChange={(e) => setFormData({...formData, last_name: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-robotics-primary focus:border-transparent"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">رقم الهاتف</label>
              <input
                type="tel"
                required
                value={formData.Phone}
                onChange={(e) => setFormData({...formData, Phone: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-robotics-primary focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">البريد الإلكتروني</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-robotics-primary focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">الدور</label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({...formData, role: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-robotics-primary focus:border-transparent"
              >
                <option value="User">مستخدم</option>
                <option value="Admin">مدير</option>
              </select>
            </div>
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                disabled={actionLoading}
                className="btn-secondary flex-1 text-sm py-2 disabled:opacity-50"
              >
                إلغاء
              </button>
              <button
                type="submit"
                disabled={actionLoading}
                className="btn-primary flex-1 text-sm py-2 disabled:opacity-50"
              >
                {actionLoading ? 'جاري الحفظ...' : 'حفظ التغييرات'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  // مكون إدارة المستخدمين
  const UsersManagement = () => (
    <div className="space-y-6 fade-in">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h2 className="text-2xl font-bold text-gray-900">إدارة المستخدمين</h2>
        <button 
          onClick={() => setShowAddUserForm(true)}
          className="btn-primary w-full sm:w-auto"
        >
          <Plus className="w-4 h-4 ml-2" />
          إضافة مستخدم جديد
        </button>
      </div>

      {/* شريط البحث للهاتف */}
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
          <div className="table-container">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-right py-3 px-2 lg:px-4 font-semibold text-gray-700 text-sm lg:text-base">الاسم</th>
                  <th className="text-right py-3 px-2 lg:px-4 font-semibold text-gray-700 text-sm lg:text-base mobile-hidden">البريد الإلكتروني</th>
                  <th className="text-right py-3 px-2 lg:px-4 font-semibold text-gray-700 text-sm lg:text-base">رقم البطاقة</th>
                  <th className="text-right py-3 px-2 lg:px-4 font-semibold text-gray-700 text-sm lg:text-base">الحالة</th>
                  <th className="text-center py-3 px-2 lg:px-4 font-semibold text-gray-700 text-sm lg:text-base">الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 lg:py-4 px-2 lg:px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 lg:w-10 lg:h-10 gradient-robotics rounded-full flex items-center justify-center text-white font-semibold text-sm">
                          {user.first_name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 text-sm lg:text-base">{user.first_name} {user.last_name}</p>
                          <p className="text-xs lg:text-sm text-gray-500">{user.role}</p>
                          <p className="text-xs text-gray-500 sm:hidden">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 lg:py-4 px-2 lg:px-4 text-gray-700 text-sm lg:text-base mobile-hidden">{user.email}</td>
                    <td className="py-3 lg:py-4 px-2 lg:px-4">
                      <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs lg:text-sm font-mono">
                        {user.card_id}
                      </span>
                    </td>
                    <td className="py-3 lg:py-4 px-2 lg:px-4">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        user.status === 'active' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {user.status === 'active' ? 'نشط' : 'غير نشط'}
                      </span>
                    </td>
                    <td className="py-3 lg:py-4 px-2 lg:px-4">
                      <div className="flex items-center justify-center gap-2 lg:gap-3">
                        <button 
                          onClick={() => handleViewUser(user)}
                          className="action-btn-view"
                          title="عرض التفاصيل"
                        >
                          <FileText className="w-4 h-4 lg:w-5 lg:h-5" />
                        </button>
                        <button 
                          onClick={() => handleEditClick(user)}
                          className="action-btn-edit"
                          title="تعديل"
                        >
                          <Pencil className="w-4 h-4 lg:w-5 lg:h-5" />
                        </button>
                        <button 
                          onClick={() => setDeleteConfirm(user.id)}
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
        </div>
      </div>
    </div>
  );

  // مكون سجلات الحضور
  const AttendanceRecords = () => (
    <div className="space-y-6 fade-in">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h2 className="text-2xl font-bold text-gray-900">سجلات الحضور</h2>
        <div className="flex gap-2 w-full sm:w-auto">
          <button className="btn-secondary flex-1 sm:flex-none">
            <Filter className="w-4 h-4 ml-2" />
            فلترة
          </button>
          <button className="btn-secondary flex-1 sm:flex-none">
            <Download className="w-4 h-4 ml-2" />
            تصدير
          </button>
        </div>
      </div>

      {/* شريط البحث للهاتف */}
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
                    {record.user_name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 text-sm lg:text-base">{record.user_name}</p>
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
          </div>
        </div>
      </div>
    </div>
  );

  // مكون إدارة البطاقات
  const CardsManagement = () => {
    const [formData, setFormData] = useState({ card_id: '', user_id: '' });
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('create'); // create or edit

    const handleSubmit = async (e) => {
      e.preventDefault();
      setActionLoading(true);
      try {
        if (modalMode === 'create') {
          // Requires user_id for creation based on Postman
          await api.createCardForUser(formData.user_id, formData);
        } else {
          await api.updateCard(selectedCard.id, formData);
        }
        await fetchData();
        setIsModalOpen(false);
      } catch (err) {
        setError(err.message || 'فشل في حفظ البطاقة');
      } finally {
        setActionLoading(false);
      }
    };

    const openCreateModal = () => {
      setFormData({ card_id: '', user_id: '' });
      setModalMode('create');
      setIsModalOpen(true);
    };

    const openEditModal = (card) => {
      setSelectedCard(card);
      setFormData({ card_id: card.card_id, user_id: card.user_id }); 
      setModalMode('edit');
      setIsModalOpen(true);
    };

    const handleDelete = async (cardId) => {
      if (window.confirm('هل أنت متأكد من حذف هذه البطاقة؟')) {
        setActionLoading(true);
        try {
          await api.deleteCard(cardId);
          await fetchData();
        } catch (err) {
          setError(err.message || 'فشل في حذف البطاقة');
        } finally {
          setActionLoading(false);
        }
      }
    };

    return (
      <div className="space-y-6 fade-in">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <h2 className="text-2xl font-bold text-gray-900">إدارة البطاقات</h2>
          <button onClick={openCreateModal} className="btn-primary w-full sm:w-auto">
            <Plus className="w-4 h-4 ml-2" />
            إضافة بطاقة جديدة
          </button>
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
                          <button onClick={() => openEditModal(card)} className="action-btn-edit" title="تعديل">
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleDelete(card.id)} className="action-btn-delete" title="حذف">
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

        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm">
              <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between">
                <h3 className="text-lg font-bold text-gray-900">
                  {modalMode === 'create' ? 'إضافة بطاقة' : 'تعديل بطاقة'}
                </h3>
                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                  <X className="w-5 h-5 text-gray-600" />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="p-4 space-y-4">
                {modalMode === 'create' && (
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
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">رقم البطاقة (UID)</label>
                  <input
                    type="text"
                    required
                    value={formData.card_id}
                    onChange={(e) => setFormData({...formData, card_id: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-robotics-primary focus:border-transparent"
                    placeholder="أدخل رقم البطاقة"
                  />
                </div>
                <div className="flex gap-2 pt-2">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary flex-1 text-sm py-2">إلغاء</button>
                  <button type="submit" disabled={actionLoading} className="btn-primary flex-1 text-sm py-2">
                    {actionLoading ? 'جاري الحفظ...' : 'حفظ'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  };


  // مكون عام للصفحات قيد التطوير
  const ComingSoon = ({ title, description, icon: Icon }) => (
    <div className="flex items-center justify-center min-h-96 fade-in">
      <div className="text-center">
        <div className="w-20 h-20 lg:w-24 lg:h-24 gradient-robotics rounded-full flex items-center justify-center mx-auto mb-4">
          <Icon className="w-10 h-10 lg:w-12 lg:h-12 text-white" />
        </div>
        <h2 className="text-xl lg:text-2xl font-bold text-gray-900 mb-2">{title}</h2>
        <p className="text-gray-600 mb-4 text-sm lg:text-base">{description}</p>
        <p className="text-xs lg:text-sm text-gray-500">هذا القسم قيد التطوير وسيكون متاحاً قريباً</p>
      </div>
    </div>
  );

  // عرض المحتوى حسب الصفحة المحددة
  const renderContent = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard />;
      case 'users':
        return <UsersManagement />;
      case 'attendance':
        return <AttendanceRecords />;
      case 'cards':
        return <CardsManagement />;
      case 'analytics':
        return <ComingSoon title="التحليلات" description="تقارير مفصلة وإحصائيات متقدمة" icon={BarChart3} />;
      case 'settings':
        return <ComingSoon title="الإعدادات" description="إعدادات النظام والتكوين العام" icon={Settings} />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center justify-between">
              <p className="text-red-800 text-sm">{error}</p>
              <button
                onClick={() => setError(null)}
                className="text-red-600 hover:text-red-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
          {loading && currentView === 'dashboard' ? (
            <div className="flex items-center justify-center min-h-96">
              <div className="text-center">
                <div className="w-12 h-12 border-4 border-robotics-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-600">جاري التحميل...</p>
              </div>
            </div>
          ) : (
            renderContent()
          )}
        </main>
      </div>

      {/* Modals */}
      {showAddUserForm && (
        <AddUserForm
          onClose={() => setShowAddUserForm(false)}
          onSubmit={handleAddUser}
        />
      )}

      {viewMode === 'view' && selectedUser && (
        <ViewUserModal
          user={selectedUser}
          hasCard={cards.some(c => c.user_id === selectedUser.id)}
          onClose={() => {
            setSelectedUser(null);
            setViewMode(null);
          }}
          onEdit={handleEditClick}
          onDelete={(userId) => {
            setDeleteConfirm(userId);
            setSelectedUser(null);
            setViewMode(null);
          }}
          onCreateCard={(user) => {
            setCurrentView('cards');
            // We need to trigger the card creation modal with this user
            // Passing state via a global variable or context would be better, 
            // but for now let's use a timeout to allow view change
            setTimeout(() => {
              const event = new CustomEvent('openCreateCard', { detail: user });
              window.dispatchEvent(event);
            }, 100);
          }}
        />
      )}

      {viewMode === 'edit' && selectedUser && (
        <EditUserForm
          user={selectedUser}
          onClose={() => {
            setSelectedUser(null);
            setViewMode(null);
          }}
          onSubmit={handleEditUser}
        />
      )}

      {deleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm">
            <div className="p-4">
              <h3 className="text-lg font-bold text-gray-900 mb-2">تأكيد الحذف</h3>
              <p className="text-sm text-gray-600 mb-4">هل أنت متأكد من حذف هذا المستخدم؟ لا يمكن التراجع عن هذا الإجراء.</p>
              <div className="flex gap-2">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="btn-secondary flex-1 text-sm py-2"
                >
                  إلغاء
                </button>
                <button
                  onClick={() => handleDeleteUser(deleteConfirm)}
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
}

export default App;
