import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { LogOut, LayoutDashboard, UserCog, Ticket } from 'lucide-react';
import AdminOverview from '../components/AdminOverview';
import AdminUsersManager from '../components/AdminUsersManager';
import AdminCouponsManager from '../components/AdminCouponsManager';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'coupons'>('overview');
  const [loading, setLoading] = useState(true);
  const [adminData, setAdminData] = useState<any>(null);
  const [stats, setStats] = useState({
    totalCampaigns: 0,
    activeCampaigns: 0,
    totalAdvertisers: 0,
    totalUsers: 0,
    totalScans: 0,
    totalPlays: 0,
    totalWins: 0,
    totalRedeemed: 0
  });

  useEffect(() => {
    const admin = localStorage.getItem('admin_session');
    if (admin) {
      setAdminData(JSON.parse(admin));
    }
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const { data: campaigns } = await supabase
        .from('campaigns')
        .select('id, status, user_id');

      const { data: advertisers } = await supabase
        .from('user_roles')
        .select('user_id')
        .eq('role', 'advertiser');

      const { count: playsCount } = await supabase
        .from('game_attempts')
        .select('*', { count: 'exact', head: true });

      const { count: winsCount } = await supabase
        .from('game_attempts')
        .select('*', { count: 'exact', head: true })
        .eq('won', true);

      const { count: redeemedCount } = await supabase
        .from('prize_claims')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'redeemed');

      const { data: users } = await supabase.auth.admin.listUsers();

      setStats({
        totalCampaigns: campaigns?.length || 0,
        activeCampaigns: campaigns?.filter(c => c.status === 'active').length || 0,
        totalAdvertisers: advertisers?.length || 0,
        totalUsers: users?.users?.length || 0,
        totalScans: playsCount || 0,
        totalPlays: playsCount || 0,
        totalWins: winsCount || 0,
        totalRedeemed: redeemedCount || 0
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_session');
    window.location.href = '/login';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const tabs = [
    { id: 'overview' as const, label: 'نظرة عامة', icon: LayoutDashboard },
    { id: 'users' as const, label: 'المستخدمين', icon: UserCog },
    { id: 'coupons' as const, label: 'الكوبونات', icon: Ticket }
  ];

  return (
    <div className="min-h-screen bg-slate-50" dir="rtl">
      <header className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-40">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <img
                src="/Gemini_Generated_Image_sfh2jysfh2jysfh2_(1).png"
                alt="حلول الحقيبة"
                className="h-12 w-auto"
              />
              <div>
                <h1 className="text-2xl font-black text-slate-900">لوحة الإدارة</h1>
                <p className="text-sm text-slate-600">مرحباً، {adminData?.full_name || 'المدير'}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-700 rounded-lg font-semibold hover:bg-red-200 transition-all"
            >
              <LogOut size={18} />
              <span>تسجيل الخروج</span>
            </button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        <div className="flex gap-2 bg-white rounded-xl p-2 shadow-sm border border-slate-200 mb-8 w-fit">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg font-bold transition-all ${
                activeTab === tab.id
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <tab.icon size={20} />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {activeTab === 'overview' && <AdminOverview stats={stats} />}
        {activeTab === 'users' && <AdminUsersManager />}
        {activeTab === 'coupons' && <AdminCouponsManager />}
      </div>
    </div>
  );
}
