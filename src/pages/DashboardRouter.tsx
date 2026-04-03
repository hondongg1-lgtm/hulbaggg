import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import CreateCampaignPage from './CreateCampaignPage';
import AdvertiserDashboard from './AdvertiserDashboard';
import AdminDashboard from './AdminDashboard';
import { LogOut, BarChart3, Plus, Shield } from 'lucide-react';

interface DashboardRouterProps {
  userId: string;
  userRole: 'admin' | 'advertiser';
}

export default function DashboardRouter({ userId, userRole }: DashboardRouterProps) {
  const [view, setView] = useState<'dashboard' | 'create'>('dashboard');
  const [userEmail, setUserEmail] = useState('');

  useEffect(() => {
    loadUserEmail();
  }, [userId]);

  const loadUserEmail = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      setUserEmail(user.email || '');
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.href = '/';
  };

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <img
                src="/Gemini_Generated_Image_sfh2jysfh2jysfh2_(1).png"
                alt="حلول الحقيبة"
                className="h-12 w-auto"
              />
              <div>
                <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  {userRole === 'admin' && <Shield className="w-5 h-5 text-emerald-600" />}
                  {userRole === 'admin' ? 'لوحة الإدارة' : 'لوحة المعلن'}
                </h1>
                <p className="text-sm text-gray-600">{userEmail}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex gap-2">
                <button
                  onClick={() => setView('dashboard')}
                  className={`px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors ${
                    view === 'dashboard'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <BarChart3 size={18} />
                  الإحصائيات
                </button>
                <button
                  onClick={() => setView('create')}
                  className={`px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors ${
                    view === 'create'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <Plus size={18} />
                  حملة جديدة
                </button>
              </div>

              <button
                onClick={handleSignOut}
                className="px-4 py-2 bg-red-50 text-red-600 rounded-lg font-medium hover:bg-red-100 transition-colors flex items-center gap-2"
              >
                <LogOut size={18} />
                تسجيل الخروج
              </button>
            </div>
          </div>
        </div>
      </header>

      <main>
        {view === 'dashboard' ? (
          userRole === 'admin' ? (
            <AdminDashboard />
          ) : (
            <AdvertiserDashboard userId={userId} />
          )
        ) : (
          <CreateCampaignPage onSuccess={() => setView('dashboard')} />
        )}
      </main>
    </div>
  );
}
