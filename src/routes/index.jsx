import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import AppLayout from '../layouts/AppLayout';
import { LoadingSpinner, ComingSoon } from '../components/common';
import { BarChart3, Settings } from 'lucide-react';

// Lazy load route components
const Login = lazy(() => import('../features/auth/components/Login'));
const Dashboard = lazy(() => import('../features/admin/dashboard/components/Dashboard'));
const UsersManagement = lazy(() => import('../features/admin/user-operations/components/UsersManagement'));
const UserDetails = lazy(() => import('../features/admin/user-operations/components/UserDetails'));
const CardsManagement = lazy(() => import('../features/admin/card/components/CardsManagement'));
const AttendanceRecords = lazy(() => import('../features/admin/attendance/components/AttendanceRecords'));

// Loading fallback component
const RouteLoader = () => (
  <div className="flex items-center justify-center min-h-[400px]">
    <LoadingSpinner />
  </div>
);

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={
        <Suspense fallback={<RouteLoader />}>
          <Login />
        </Suspense>
      } />

      {/* Protected routes */}
      <Route
        path="/*"
        element={
          <ProtectedRoute>
            <AppLayout>
              <Routes>
                <Route
                  path="dashboard"
                  element={
                    <Suspense fallback={<RouteLoader />}>
                      <Dashboard />
                    </Suspense>
                  }
                />
                <Route
                  path="users"
                  element={
                    <Suspense fallback={<RouteLoader />}>
                      <UsersManagement />
                    </Suspense>
                  }
                />
                <Route
                  path="users/:id"
                  element={
                    <Suspense fallback={<RouteLoader />}>
                      <UserDetails />
                    </Suspense>
                  }
                />
                <Route
                  path="cards"
                  element={
                    <Suspense fallback={<RouteLoader />}>
                      <CardsManagement />
                    </Suspense>
                  }
                />
                <Route
                  path="attendance"
                  element={
                    <Suspense fallback={<RouteLoader />}>
                      <AttendanceRecords />
                    </Suspense>
                  }
                />
                <Route
                  path="analytics"
                  element={
                    <ComingSoon
                      title="التحليلات"
                      description="تقارير مفصلة وإحصائيات متقدمة"
                      icon={BarChart3}
                    />
                  }
                />
                <Route
                  path="settings"
                  element={
                    <ComingSoon
                      title="الإعدادات"
                      description="إعدادات النظام والتكوين العام"
                      icon={Settings}
                    />
                  }
                />
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
              </Routes>
            </AppLayout>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
};

export default AppRoutes;


