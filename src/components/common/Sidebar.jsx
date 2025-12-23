import React from 'react';
import { format, parseISO } from 'date-fns';
import { Activity } from 'lucide-react';
import { useStatsQuery } from '../../features/admin/stats/hooks';
import { SIDEBAR_ITEMS } from '../../constants';

const Sidebar = ({
  currentView,
  setCurrentView,
  sidebarOpen,
  setSidebarOpen
}) => {
  const { data: stats } = useStatsQuery();
  return (
    <>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 right-0 z-50
        w-64 lg:w-72 bg-white shadow-lg border-l border-gray-200
        transform transition-transform duration-300 ease-in-out
        flex flex-col h-screen flex-shrink-0
        ${sidebarOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}
      `}>
        {/* Sidebar header */}
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
        
        {/* Navigation */}
        <nav className="flex-1 p-4 overflow-y-auto">
          <ul className="space-y-2">
            {SIDEBAR_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;
              
              return (
                <li key={item.id}>
                  <button
                    onClick={() => {
                      setCurrentView(item.id);
                      setSidebarOpen(false); // Close sidebar on mobile
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
        
        {/* System status */}
        <div className="p-4 border-t border-gray-200">
          <div className="gradient-robotics rounded-xl p-4 text-white">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium">النظام متصل</span>
            </div>
            <p className="text-xs text-blue-100">
              آخر تحديث: {stats?.lastSync ? format(parseISO(stats.lastSync), 'HH:mm') : format(new Date(), 'HH:mm')}
            </p>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;

