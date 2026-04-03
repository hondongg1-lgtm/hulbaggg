import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Lock } from 'lucide-react';
import NewAdminDashboard from '../NewAdminDashboard';

export default function AdminApp() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [adminId, setAdminId] = useState('');

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const adminSession = localStorage.getItem('admin_session');
    if (adminSession) {
      const session = JSON.parse(adminSession);
      // التحقق من صلاحية الجلسة (24 ساعة)
      if (Date.now() - session.timestamp < 24 * 60 * 60 * 1000) {
        setIsAuthenticated(true);
        setAdminId(session.id);
      } else {
        localStorage.removeItem('admin_session');
      }
    }
    setLoading(false);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const { data, error: dbError } = await supabase
        .from('admin_accounts')
        .select('*')
        .eq('email', loginForm.username)
        .eq('password', loginForm.password)
        .eq('is_active', true)
        .maybeSingle();

      if (dbError) throw dbError;

      if (!data) {
        setError('اسم المستخدم أو كلمة المرور غير صحيحة');
        return;
      }

      await supabase
        .from('admin_accounts')
        .update({ last_login: new Date().toISOString() })
        .eq('id', data.id);

      localStorage.setItem('admin_session', JSON.stringify({
        id: data.id,
        email: data.email,
        role: data.role,
        timestamp: Date.now()
      }));

      setAdminId(data.id);
      setIsAuthenticated(true);
    } catch (err) {
      setError('حدث خطأ في تسجيل الدخول');
      console.error(err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_session');
    setIsAuthenticated(false);
    setAdminId('');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4" dir="rtl">
        <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock className="w-8 h-8 text-blue-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">لوحة الإدارة</h1>
            <p className="text-gray-600">تسجيل الدخول للإشراف على المنصة</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {error}
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">البريد الإلكتروني</label>
              <input
                type="email"
                value={loginForm.username}
                onChange={(e) => setLoginForm({ ...loginForm, username: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="أدخل البريد الإلكتروني"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">كلمة المرور</label>
              <input
                type="password"
                value={loginForm.password}
                onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="أدخل كلمة المرور"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
            >
              تسجيل الدخول
            </button>
          </form>

          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-900 text-center font-medium mb-2">
              حساب الإدارة التجريبي:
            </p>
            <p className="text-xs text-blue-800 text-center">
              البريد: <span className="font-mono font-bold">admin@bagad.sa</span>
              <br />
              كلمة المرور: <span className="font-mono font-bold">Admin@123</span>
            </p>
          </div>
        </div>
      </div>
    );
  }

  return <NewAdminDashboard adminId={adminId} onLogout={handleLogout} />;
}
