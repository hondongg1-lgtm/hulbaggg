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
    <div className="min-h-screen bg-gray-50 overflow-x-hidden" dir="rtl">
      <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-3 sm:px-4 py-3 sm:py-4">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 sm:gap-4 min-w-0">
              <img
                src="/Gemini_Generated_Image_sfh2jysfh2jysfh2_(1).png"
                alt="حلول الحقيبة"
                className="h-10 sm:h-12 w-auto flex-shrink-0"
              />
              <div className="min-w-0">
                <h1 className="text-base sm:text-xl font-bold text-gray-900 flex items-center gap-2 truncate">
                  {userRole === 'admin' && <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600 flex-shrink-0" />}
                  {userRole === 'admin' ? 'لوحة الإدارة' : 'لوحة المعلن'}
                </h1>
                <p className="text-xs sm:text-sm text-gray-600 truncate">{userEmail}</p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 sm:gap-3 flex-shrink-0">
              <div className="flex gap-1 sm:gap-2">
                <button
                  onClick={() => setView('dashboard')}
                  className={`px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-lg font-medium flex items-center gap-1 sm:gap-2 transition-colors text-sm ${
                    view === 'dashboard'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <BarChart3 size={16} />
                  <span className="hidden sm:inline">الإحصائيات</span>
                </button>
                <button
                  onClick={() => setView('create')}
                  className={`px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-lg font-medium flex items-center gap-1 sm:gap-2 transition-colors text-sm ${
                    view === 'create'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <Plus size={16} />
                  <span className="hidden sm:inline">حملة جديدة</span>
                </button>
              </div>

              <button
                onClick={handleSignOut}
                className="px-2.5 sm:px-4 py-1.5 sm:py-2 bg-red-50 text-red-600 rounded-lg font-medium hover:bg-red-100 transition-colors flex items-center gap-1 sm:gap-2 text-sm"
              >
                <LogOut size={16} />
                <span className="hidden sm:inline">تسجيل الخروج</span>
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
