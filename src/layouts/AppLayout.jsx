import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Header, Sidebar, ErrorBoundary, ToastContainer, useToast } from '../components/common';
import { SIDEBAR_ITEMS } from '../constants';

const AppLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const toast = useToast();

  // Get current view from pathname
  const currentView = location.pathname.split('/')[1] || 'dashboard';

  // Handle navigation
  const handleNavigation = (viewId) => {
    navigate(`/${viewId}`);
    setSidebarOpen(false);
  };

  // Get search term from URL query params
  const searchParams = new URLSearchParams(location.search);
  const searchTerm = searchParams.get('search') || '';

  // Update search term in URL
  const setSearchTerm = (term) => {
    const params = new URLSearchParams(location.search);
    if (term) {
      params.set('search', term);
    } else {
      params.delete('search');
    }
    navigate({ search: params.toString() }, { replace: true });
  };

  return (
    <>
      <ToastContainer toasts={toast.toasts} onRemove={toast.removeToast} />
      <div className="flex h-screen bg-gray-50 overflow-hidden">
        <Sidebar
          currentView={currentView}
          setCurrentView={handleNavigation}
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
            <ErrorBoundary>
              {children}
            </ErrorBoundary>
          </main>
        </div>
      </div>
    </>
  );
};

export default AppLayout;



