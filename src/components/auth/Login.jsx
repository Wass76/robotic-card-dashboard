import React, { useState } from 'react';
import { Activity } from 'lucide-react';
import { useAuth } from '../../hooks';
import Input from '../common/Input';
import Button from '../common/Button';
import ErrorMessage from '../common/ErrorMessage';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, loading, error: authError } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await login(email, password);
    } catch (err) {
      console.error('Login error:', err);
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
            <ErrorMessage error={authError} onDismiss={() => {}} />
          )}

          <form onSubmit={handleLogin} className="space-y-6">
            <Input
              type="email"
              label="البريد الإلكتروني"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@example.com"
              required
            />

            <Input
              type="password"
              label="كلمة المرور"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              showPasswordToggle
            />

            <Button
              type="submit"
              variant="primary"
              disabled={loading}
              loading={loading}
              className="w-full"
            >
              {loading ? 'جاري الدخول...' : 'تسجيل الدخول'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;

