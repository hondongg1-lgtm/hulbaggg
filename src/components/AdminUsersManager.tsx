import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Users, UserPlus, Mail, Shield, Trash2, Check, X } from 'lucide-react';

interface AdminAccount {
  id: string;
  email: string;
  full_name: string;
  role: string;
  is_active: boolean;
  created_at: string;
  last_login: string | null;
}

interface Advertiser {
  id: string;
  email: string;
  role: string;
  created_at: string;
  campaigns_count: number;
}

export default function AdminUsersManager() {
  const [activeTab, setActiveTab] = useState<'admins' | 'advertisers'>('admins');
  const [admins, setAdmins] = useState<AdminAccount[]>([]);
  const [advertisers, setAdvertisers] = useState<Advertiser[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newAdmin, setNewAdmin] = useState({
    email: '',
    password: '',
    full_name: '',
    role: 'admin'
  });

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'admins') {
        const { data } = await supabase
          .from('admin_accounts')
          .select('*')
          .order('created_at', { ascending: false });
        setAdmins(data || []);
      } else {
        const { data } = await supabase
          .from('user_roles')
          .select('*')
          .eq('role', 'advertiser')
          .order('created_at', { ascending: false });

        if (data) {
          const enriched = await Promise.all(
            data.map(async (adv) => {
              const { count } = await supabase
                .from('campaigns')
                .select('*', { count: 'exact', head: true })
                .eq('user_id', adv.user_id);
              return { ...adv, campaigns_count: count || 0 };
            })
          );
          setAdvertisers(enriched);
        }
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { error } = await supabase
        .from('admin_accounts')
        .insert([newAdmin]);

      if (error) throw error;

      setShowAddModal(false);
      setNewAdmin({ email: '', password: '', full_name: '', role: 'admin' });
      loadData();
    } catch (error) {
      console.error('Error adding admin:', error);
      alert('حدث خطأ أثناء إضافة الحساب');
    }
  };

  const toggleAdminStatus = async (id: string, currentStatus: boolean) => {
    try {
      await supabase
        .from('admin_accounts')
        .update({ is_active: !currentStatus })
        .eq('id', id);
      loadData();
    } catch (error) {
      console.error('Error toggling status:', error);
    }
  };

  const deleteAdmin = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا الحساب؟')) return;
    try {
      await supabase
        .from('admin_accounts')
        .delete()
        .eq('id', id);
      loadData();
    } catch (error) {
      console.error('Error deleting admin:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-900">إدارة المستخدمين</h2>
        {activeTab === 'admins' && (
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-emerald-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-emerald-700 transition-all flex items-center gap-2"
          >
            <UserPlus size={18} />
            إضافة مدير
          </button>
        )}
      </div>

      <div className="flex gap-2 bg-slate-100 rounded-xl p-1 w-fit">
        <button
          onClick={() => setActiveTab('admins')}
          className={`px-6 py-3 rounded-lg font-bold transition-all ${
            activeTab === 'admins'
              ? 'bg-white text-emerald-600 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <div className="flex items-center gap-2">
            <Shield size={18} />
            <span>المدراء ({admins.length})</span>
          </div>
        </button>
        <button
          onClick={() => setActiveTab('advertisers')}
          className={`px-6 py-3 rounded-lg font-bold transition-all ${
            activeTab === 'advertisers'
              ? 'bg-white text-emerald-600 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <div className="flex items-center gap-2">
            <Users size={18} />
            <span>المعلنين ({advertisers.length})</span>
          </div>
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {activeTab === 'admins' ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 text-right text-sm font-bold text-slate-700">الاسم</th>
                  <th className="px-6 py-4 text-right text-sm font-bold text-slate-700">البريد الإلكتروني</th>
                  <th className="px-6 py-4 text-center text-sm font-bold text-slate-700">الدور</th>
                  <th className="px-6 py-4 text-center text-sm font-bold text-slate-700">الحالة</th>
                  <th className="px-6 py-4 text-center text-sm font-bold text-slate-700">آخر دخول</th>
                  <th className="px-6 py-4 text-center text-sm font-bold text-slate-700">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {admins.map((admin) => (
                  <tr key={admin.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4">
                      <p className="font-semibold text-slate-900">{admin.full_name}</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Mail size={16} className="text-slate-400" />
                        <span className="text-slate-700" dir="ltr">{admin.email}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        admin.role === 'super_admin'
                          ? 'bg-purple-100 text-purple-700'
                          : 'bg-blue-100 text-blue-700'
                      }`}>
                        {admin.role === 'super_admin' ? 'مدير عام' : 'مدير'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        admin.is_active
                          ? 'bg-green-100 text-green-700'
                          : 'bg-red-100 text-red-700'
                      }`}>
                        {admin.is_active ? 'نشط' : 'معطل'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center text-sm text-slate-600">
                      {admin.last_login
                        ? new Date(admin.last_login).toLocaleString('ar-SA')
                        : 'لم يسجل دخول بعد'}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => toggleAdminStatus(admin.id, admin.is_active)}
                          className={`p-2 rounded-lg transition-colors ${
                            admin.is_active
                              ? 'bg-red-100 text-red-700 hover:bg-red-200'
                              : 'bg-green-100 text-green-700 hover:bg-green-200'
                          }`}
                          title={admin.is_active ? 'تعطيل' : 'تفعيل'}
                        >
                          {admin.is_active ? <X size={16} /> : <Check size={16} />}
                        </button>
                        {admin.role !== 'super_admin' && (
                          <button
                            onClick={() => deleteAdmin(admin.id)}
                            className="p-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                            title="حذف"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 text-right text-sm font-bold text-slate-700">البريد الإلكتروني</th>
                  <th className="px-6 py-4 text-center text-sm font-bold text-slate-700">عدد الحملات</th>
                  <th className="px-6 py-4 text-center text-sm font-bold text-slate-700">تاريخ التسجيل</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {advertisers.map((advertiser) => (
                  <tr key={advertiser.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Mail size={16} className="text-slate-400" />
                        <span className="text-slate-700" dir="ltr">{advertiser.email}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="px-4 py-1 bg-emerald-100 text-emerald-700 rounded-full font-bold">
                        {advertiser.campaigns_count}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center text-sm text-slate-600">
                      {new Date(advertiser.created_at).toLocaleDateString('ar-SA')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" dir="rtl">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8">
            <h3 className="text-2xl font-bold text-slate-900 mb-6">إضافة مدير جديد</h3>
            <form onSubmit={handleAddAdmin} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-900 mb-2">الاسم الكامل</label>
                <input
                  type="text"
                  value={newAdmin.full_name}
                  onChange={(e) => setNewAdmin({ ...newAdmin, full_name: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-slate-300 rounded-lg focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-900 mb-2">البريد الإلكتروني</label>
                <input
                  type="email"
                  value={newAdmin.email}
                  onChange={(e) => setNewAdmin({ ...newAdmin, email: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-slate-300 rounded-lg focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
                  dir="ltr"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-900 mb-2">كلمة المرور</label>
                <input
                  type="password"
                  value={newAdmin.password}
                  onChange={(e) => setNewAdmin({ ...newAdmin, password: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-slate-300 rounded-lg focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
                  dir="ltr"
                  required
                  minLength={6}
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-900 mb-2">الدور</label>
                <select
                  value={newAdmin.role}
                  onChange={(e) => setNewAdmin({ ...newAdmin, role: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-slate-300 rounded-lg focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
                >
                  <option value="admin">مدير</option>
                  <option value="super_admin">مدير عام</option>
                </select>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-emerald-600 text-white py-3 rounded-xl font-bold hover:bg-emerald-700 transition-all"
                >
                  إضافة
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 bg-slate-200 text-slate-700 py-3 rounded-xl font-bold hover:bg-slate-300 transition-all"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
