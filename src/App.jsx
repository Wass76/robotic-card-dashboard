import { useState } from 'react';
import { BarChart3, Settings } from 'lucide-react';
import { AuthProvider, useAuth } from './context';
import { AppProvider, useApp } from './context';
import { VIEW_MODES } from './constants';

// Components
import { Login } from './components/auth';
import { Header, Sidebar, ErrorMessage, LoadingSpinner, ComingSoon, ErrorBoundary, ToastContainer, useToast } from './components/common';
import { Dashboard } from './components/dashboard';
import { UsersManagement } from './components/users';
import { CardsManagement } from './components/cards';
import { AttendanceRecords } from './components/attendance';

function AppContent() {
  const { isLoggedIn, loading: authLoading } = useAuth();
  const { loading: dataLoading, error, setError } = useApp();
  const toast = useToast();
  const [currentView, setCurrentView] = useState(VIEW_MODES.DASHBOARD);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Render content based on current view
  const renderContent = () => {
    switch (currentView) {
      case VIEW_MODES.DASHBOARD:
        return <Dashboard />;
      case VIEW_MODES.USERS:
        return <UsersManagement searchTerm={searchTerm} setSearchTerm={setSearchTerm} />;
      case VIEW_MODES.CARDS:
        return <CardsManagement />;
      case VIEW_MODES.ATTENDANCE:
        return <AttendanceRecords searchTerm={searchTerm} setSearchTerm={setSearchTerm} />;
      case VIEW_MODES.ANALYTICS:
        return <ComingSoon title="التحليلات" description="تقارير مفصلة وإحصائيات متقدمة" icon={BarChart3} />;
      case VIEW_MODES.SETTINGS:
        return <ComingSoon title="الإعدادات" description="إعدادات النظام والتكوين العام" icon={Settings} />;
      default:
        return <Dashboard />;
    }
  };

  if (authLoading) {
    return <LoadingSpinner fullScreen message="جاري التحقق من المصادقة..." />;
  }

  if (!isLoggedIn) {
    return <Login />;
  }

  return (
    <>
      <ToastContainer toasts={toast.toasts} onRemove={toast.removeToast} />
      <div className="flex h-screen bg-gray-50 overflow-hidden">
        <Sidebar 
          currentView={currentView}
          setCurrentView={setCurrentView}
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
        />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header 
            sidebarOpen={sidebarOpen}
            setSidebarOpen={setSidebarOpen}
            currentView={currentView}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
          />
          <main className="flex-1 overflow-y-auto p-4 lg:p-6">
            {error && <ErrorMessage error={error} onDismiss={() => setError(null)} />}
            {dataLoading ? <LoadingSpinner /> : renderContent()}
          </main>
        </div>
      </div>
    </>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <AppProvider>
          <AppContent />
        </AppProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
