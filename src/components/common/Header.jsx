import React from 'react';
import { Menu, X, Search, LogOut } from 'lucide-react';
import { useAuth } from '../../hooks';

const Header = ({
  sidebarOpen,
  setSidebarOpen,
  currentView,
  searchTerm,
  setSearchTerm
}) => {
  const { logout } = useAuth();
  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
      <div className="px-4 lg:px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Mobile menu button */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          
          {/* Logo and title */}
          <div className="flex items-center gap-3">
            <img src="/robotics-logo.png" alt="Robotics Club" className="w-8 h-8 lg:w-10 lg:h-10" />
            <div className="hidden sm:block">
              <h1 className="text-lg lg:text-xl font-bold text-gray-900">نظام إدارة الحضور الذكي</h1>
              <p className="text-xs lg:text-sm text-gray-600">نادي الروبوتيك</p>
            </div>
          </div>

          {/* Search bar and tools */}
          <div className="flex items-center gap-2 lg:gap-4">
            {/* Search bar */}
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
            
            {/* Current user */}
            <div className="hidden md:flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
              <div className="w-8 h-8 gradient-robotics rounded-full flex items-center justify-center text-white font-semibold">
                و
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-gray-700">مشرف النظام</p>
                <p className="text-xs text-gray-500">وسيم تنبكجي</p>
              </div>
            </div>
            
            <button 
              onClick={logout}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <LogOut className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;

