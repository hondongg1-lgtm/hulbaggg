import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Package, Users, Activity, DollarSign } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface NewAdminDashboardProps {
  adminId: string;
}

interface Advertiser {
  id: string;
  email: string;
  username: string;
  business_name: string;
  phone: string;
  is_active: boolean;
  created_at: string;
}

interface Campaign {
  id: string;
  store_name: string;
  business_type: string;
  description: string;
  status: string;
  advertiser_id: string;
  bags_distributed: number;
  distribution_locations: any[];
  start_date: string;
  end_date: string;
  created_at: string;
  advertiser_accounts?: {
    business_name: string;
    email: string;
  };
}

interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  status: 'active' | 'blocked';
  created_at: string;
  role?: string;
}

interface Wallet {
  id: string;
  user_id: string;
  balance: number;
  user_email?: string;
}

export default function NewAdminDashboard({ adminId }: NewAdminDashboardProps) {
  const { language, t } = useLanguage();
  const [activeTab, setActiveTab] = useState<'overview' | 'advertisers' | 'campaigns' | 'users' | 'finance'>('overview');
  const [advertisers, setAdvertisers] = useState<Advertiser[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);      // 1. Load users and roles separately for maximum reliability
      const [profilesRes, rolesRes] = await Promise.all([
        supabase.from('user_profiles').select('*').order('created_at', { ascending: false }),
        supabase.from('user_roles').select('*')
      ]);

      if (profilesRes.data) {
        const mappedUsers = profilesRes.data.map(p => {
          // Look for role by id OR email (for manual Supabase entries)
          const roleData = rolesRes.data?.find(r => r.user_id === p.id || r.email === p.email);
          return {
            ...p,
            role: roleData?.role || 'user'
          };
        });
        setUsers(mappedUsers);
      }


      // 2. Load advertisers
      const { data: advData, error: advError } = await supabase
        .from('advertiser_accounts')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (advError) console.error('Advertisers fetch error:', advError);
      if (advData) setAdvertisers(advData);

      // 3. Load campaigns
      const { data: campData } = await supabase.from('campaigns').select('*, advertiser_accounts(business_name, email)').order('created_at', { ascending: false });
      if (campData) setCampaigns(campData as any);

      // 4. Load wallets (handle missing table)
      const { data: walletData, error: walletError } = await supabase
        .from('wallets')
        .select('*, user_profiles(email)');

      if (walletError) {
        console.error('Wallets fetch error:', walletError);
        if (walletError.code === 'PGRST116' || walletError.code === '404') {
          console.log('Wallets table not found yet.');
        }
      }
      
      if (walletData) setWallets(walletData.map((w: any) => ({ ...w, user_email: w.user_profiles?.email })));
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleUserStatus = async (user: UserProfile) => {
    try {
      const newStatus = user.status === 'active' ? 'blocked' : 'active';
      await supabase.from('user_profiles').update({ status: newStatus }).eq('id', user.id);
      loadData();
    } catch (error: any) {
      alert(t('حدث خطأ', 'Error occurred'));
    }
  };

  const handleUpdateUserRole = async (userId: string, newRole: string) => {
    try {
      const user = users.find(u => u.id === userId);
      const { error: roleError } = await supabase.from('user_roles').upsert({ 
        user_id: userId, 
        role: newRole,
        email: user?.email || '',
        is_active: true 
      }, { onConflict: 'email' });

      if (roleError) throw roleError;

      if (newRole === 'advertiser') {
        const user = users.find(u => u.id === userId);
        if (user) {
          const { error: advError } = await supabase.from('advertiser_accounts').upsert({
            id: userId,
            username: user.email,
            email: user.email,
            full_name: user.full_name || '',
            business_name: user.full_name || '',
            password: 'PROMOTED_USER',
            is_active: true
          }, { onConflict: 'id' });
          
          if (advError) throw advError;
          await supabase.from('wallets').upsert({ user_id: userId }, { onConflict: 'user_id' });
        }
      }
      
      // Refresh with a tiny delay to ensure DB consistency
      setTimeout(() => loadData(), 500);
    } catch (error: any) {
      console.error('Update role error:', error);
      alert(t('حدث خطأ أثناء تحديث الرتبة', 'Error updating role'));
    }
  };

  const handleApproveCampaign = async (id: string) => {
    await supabase.from('campaigns').update({ status: 'active', approved_at: new Date().toISOString() }).eq('id', id);
    loadData();
  };

  const handleRejectCampaign = async (id: string) => {
    const notes = prompt(t('سبب الرفض:', 'Rejection reason:'));
    if (notes) {
      await supabase.from('campaigns').update({ status: 'rejected', approval_notes: notes }).eq('id', id);
      loadData();
    }
  };

  const getStatusBadge = (status: string) => {
    const styles: any = { active: 'bg-green-100 text-green-800', pending: 'bg-yellow-100 text-yellow-800', rejected: 'bg-red-100 text-red-800' };
    return <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status] || 'bg-gray-100'}`}>{status}</span>;
  };

  if (loading) return <div className="flex items-center justify-center p-20"><Activity className="animate-spin text-green-700" /></div>;

  return (
    <div className="min-h-screen bg-gray-50 overflow-x-hidden" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-8">
        <div className="flex flex-wrap gap-2 sm:gap-3 mb-6 sm:mb-8">
          {[
            { id: 'overview', label: t('نظرة عامة', 'Overview'), icon: Activity },
            { id: 'advertisers', label: t('المعلنين', 'Advertisers'), icon: Users },
            { id: 'campaigns', label: t('الحملات', 'Campaigns'), icon: Package },
            { id: 'users', label: t('المستخدمين', 'Users'), icon: Users },
            { id: 'finance', label: t('المالية', 'Finance'), icon: DollarSign }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-6 py-2 sm:py-2.5 rounded-2xl text-sm sm:text-base font-bold transition-all ${
                activeTab === tab.id ? 'bg-green-700 text-white shadow-lg shadow-green-200' : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-100'
              }`}
            >
              <tab.icon size={18} />
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'overview' && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6">
            {[
              { label: t('إجمالي المعلنين', 'Total Advertisers'), value: advertisers.length, color: 'text-blue-600' },
              { label: t('الحملات النشطة', 'Active Campaigns'), value: campaigns.filter(c => c.status === 'active').length, color: 'text-green-600' },
              { label: t('طلبات بانتظار الموافقة', 'Pending Approval'), value: campaigns.filter(c => c.status === 'pending').length, color: 'text-yellow-600' },
              { label: t('أكياس موزعة', 'Bags Distributed'), value: campaigns.reduce((sum, c) => sum + (c.bags_distributed || 0), 0), color: 'text-purple-600' }
            ].map((stat, i) => (
              <div key={i} className="bg-white p-4 sm:p-6 rounded-2xl sm:rounded-3xl shadow-sm border border-gray-100">
                <p className="text-xs sm:text-sm font-medium text-gray-500 mb-1 truncate">{stat.label}</p>
                <p className={`text-2xl sm:text-3xl font-black ${stat.color}`}>{stat.value}</p>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'users' && (
          <div className="bg-white rounded-2xl sm:rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
            <table className="w-full text-right min-w-[600px]">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="px-4 sm:px-6 py-3 sm:py-4 font-bold text-gray-900 text-sm">{t('المستخدم', 'User')}</th>
                  <th className="px-4 sm:px-6 py-3 sm:py-4 font-bold text-gray-900 text-sm">{t('الرتبة', 'Role')}</th>
                  <th className="px-4 sm:px-6 py-3 sm:py-4 font-bold text-gray-900 text-sm">{t('الحالة', 'Status')}</th>
                  <th className="px-4 sm:px-6 py-3 sm:py-4 font-bold text-gray-900 text-sm">{t('الإجراءات', 'Actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {users.map(user => (
                  <tr key={user.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-4 sm:px-6 py-3 sm:py-4">
                      <div className="font-bold text-gray-900 text-sm">{user.full_name || 'N/A'}</div>
                      <div className="text-xs text-gray-500 truncate max-w-[200px]">{user.email}</div>
                    </td>
                    <td className="px-4 sm:px-6 py-3 sm:py-4">
                      <select 
                        value={user.role || 'user'} 
                        onChange={(e) => handleUpdateUserRole(user.id, e.target.value)}
                        className="text-sm font-bold bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-green-500"
                      >
                        <option value="user">{t('مستخدم', 'User')}</option>
                        <option value="advertiser">{t('معلن', 'Advertiser')}</option>
                        <option value="admin">{t('مدير', 'Admin')}</option>
                      </select>
                    </td>
                    <td className="px-4 sm:px-6 py-3 sm:py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${user.status === 'blocked' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                        {user.status === 'blocked' ? t('محظور', 'Blocked') : t('نشط', 'Active')}
                      </span>
                    </td>
                    <td className="px-4 sm:px-6 py-3 sm:py-4">
                      <button 
                        onClick={() => handleToggleUserStatus(user)} 
                        className={`text-sm font-black transition-colors ${user.status === 'blocked' ? 'text-green-600 hover:text-green-700' : 'text-red-600 hover:text-red-700'}`}
                      >
                        {user.status === 'blocked' ? t('إلغاء الحظر', 'Unblock') : t('حظر', 'Block')}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
          </div>
        )}

        {activeTab === 'advertisers' && (
          <div className="bg-white rounded-2xl sm:rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
            <table className="w-full text-right min-w-[600px]">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="px-4 sm:px-6 py-3 sm:py-4 font-bold text-gray-900 text-sm">{t('المعلن', 'Advertiser')}</th>
                  <th className="px-4 sm:px-6 py-3 sm:py-4 font-bold text-gray-900 text-sm">{t('النشاط التجاري', 'Business Name')}</th>
                  <th className="px-4 sm:px-6 py-3 sm:py-4 font-bold text-gray-900 text-sm">{t('تاريخ التسجيل', 'Registered At')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {advertisers.map(adv => (
                  <tr key={adv.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-4 sm:px-6 py-3 sm:py-4">
                      <div className="font-bold text-gray-900 text-sm">{adv.email}</div>
                      <div className="text-xs text-gray-500">{adv.phone || 'N/A'}</div>
                    </td>
                    <td className="px-4 sm:px-6 py-3 sm:py-4 font-bold text-green-700 text-sm">{adv.business_name}</td>
                    <td className="px-4 sm:px-6 py-3 sm:py-4 text-xs text-gray-500 font-mono">
                      {new Date(adv.created_at).toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US')}
                    </td>
                  </tr>
                ))}
                {advertisers.length === 0 && (
                  <tr>
                    <td colSpan={3} className="px-6 py-12 text-center text-gray-400 font-bold">{t('لا يوجد معلنين حالياً', 'No advertisers currenty available')}</td>
                  </tr>
                )}
              </tbody>
            </table>
            </div>
          </div>
        )}

        {activeTab === 'finance' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
              <h3 className="text-xl font-black text-gray-900 mb-6 flex items-center gap-2">
                <DollarSign className="text-green-600" />
                {t('محفظة المعلنين', 'Advertiser Wallets')}
              </h3>
              <div className="space-y-4">
                {wallets.map(w => (
                  <div key={w.id} className="flex justify-between items-center p-4 bg-gray-50 rounded-2xl border border-gray-100">
                    <div>
                      <p className="font-bold text-gray-900">{w.user_email || t('غير معروف', 'Unknown')}</p>
                      <p className="text-[10px] text-gray-400 font-mono">{w.id}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-black text-green-700">{w.balance} {t('ريال', 'SAR')}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'campaigns' && (
          <div className="grid gap-4 sm:gap-6">
            {campaigns.map(c => (
              <div key={c.id} className="bg-white p-4 sm:p-6 rounded-2xl sm:rounded-3xl shadow-sm border border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4 overflow-hidden">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 sm:gap-3 mb-1 flex-wrap">
                    <h3 className="text-base sm:text-lg font-black text-gray-900 truncate">{c.store_name}</h3>
                    {getStatusBadge(c.status)}
                  </div>
                  <p className="text-sm text-gray-600 mb-2 break-words line-clamp-2">{c.description}</p>
                  <div className="flex items-center gap-3 sm:gap-4 text-xs font-bold text-gray-400 flex-wrap">
                    <span className="flex items-center gap-1"><Package size={14} />{c.bags_distributed} {t('كيس', 'Bags')}</span>
                    <span className="flex items-center gap-1 truncate"><Users size={14} />{c.advertiser_accounts?.business_name || t('غير معروف', 'Unknown')}</span>
                  </div>
                </div>
                <div className="flex gap-2 w-full sm:w-auto flex-shrink-0">
                  {c.status === 'pending' && (
                    <>
                      <button onClick={() => handleApproveCampaign(c.id)} className="flex-1 sm:flex-none px-4 sm:px-6 py-2 bg-green-600 text-white rounded-xl font-black hover:bg-green-700 transition-colors text-sm">{t('موافقة', 'Approve')}</button>
                      <button onClick={() => handleRejectCampaign(c.id)} className="flex-1 sm:flex-none px-4 sm:px-6 py-2 bg-red-50 text-red-600 rounded-xl font-black hover:bg-red-100 transition-colors text-sm">{t('رفض', 'Reject')}</button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
