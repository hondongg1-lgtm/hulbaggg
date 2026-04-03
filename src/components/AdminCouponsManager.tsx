import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Gift, QrCode, Phone, Calendar, CheckCircle, Clock, XCircle, Search, Filter } from 'lucide-react';

interface PrizeClaim {
  id: string;
  claim_code: string;
  qr_code: string | null;
  user_phone: string | null;
  status: string;
  claimed_at: string;
  redeemed_at: string | null;
  redeemed_by: string | null;
  expires_at: string;
  campaign: {
    store_name: string;
    business_type: string;
  };
  prize: {
    name: string;
    name_ar: string;
    description: string;
    value: number;
  };
  user: {
    email: string;
  };
}

export default function AdminCouponsManager() {
  const [coupons, setCoupons] = useState<PrizeClaim[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'redeemed' | 'expired'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadCoupons();
  }, []);

  const loadCoupons = async () => {
    setLoading(true);
    try {
      const { data } = await supabase
        .from('prize_claims')
        .select(`
          *,
          campaign:campaigns(store_name, business_type),
          prize:prizes(name, name_ar, description, value),
          user:user_id(email)
        `)
        .order('claimed_at', { ascending: false });

      if (data) {
        setCoupons(data as any);
      }
    } catch (error) {
      console.error('Error loading coupons:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredCoupons = coupons.filter((coupon) => {
    const matchesFilter =
      filter === 'all' ||
      coupon.status === filter ||
      (filter === 'expired' && new Date(coupon.expires_at) < new Date());

    const matchesSearch =
      searchTerm === '' ||
      coupon.claim_code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      coupon.user_phone?.includes(searchTerm) ||
      coupon.campaign?.store_name?.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  const stats = {
    total: coupons.length,
    pending: coupons.filter((c) => c.status === 'pending').length,
    redeemed: coupons.filter((c) => c.status === 'redeemed').length,
    expired: coupons.filter((c) => new Date(c.expires_at) < new Date() && c.status !== 'redeemed').length,
  };

  const getStatusBadge = (coupon: PrizeClaim) => {
    const isExpired = new Date(coupon.expires_at) < new Date();

    if (coupon.status === 'redeemed') {
      return (
        <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold">
          <CheckCircle size={14} />
          مستلمة
        </span>
      );
    } else if (isExpired) {
      return (
        <span className="inline-flex items-center gap-1 px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-bold">
          <XCircle size={14} />
          منتهية
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center gap-1 px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-bold">
          <Clock size={14} />
          قيد الانتظار
        </span>
      );
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
        <h2 className="text-2xl font-bold text-slate-900">إدارة الكوبونات والجوائز</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 mb-1">إجمالي الكوبونات</p>
              <p className="text-2xl font-bold text-slate-900">{stats.total}</p>
            </div>
            <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center">
              <Gift className="text-slate-600" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 mb-1">قيد الانتظار</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Clock className="text-yellow-600" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 mb-1">مستلمة</p>
              <p className="text-2xl font-bold text-green-600">{stats.redeemed}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="text-green-600" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 mb-1">منتهية</p>
              <p className="text-2xl font-bold text-red-600">{stats.expired}</p>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <XCircle className="text-red-600" size={24} />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
            <input
              type="text"
              placeholder="بحث بالكود أو رقم الجوال أو اسم المحل..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pr-12 pl-4 py-3 border-2 border-slate-300 rounded-lg focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
            />
          </div>
          <div className="flex gap-2 bg-slate-100 rounded-lg p-1">
            {(['all', 'pending', 'redeemed', 'expired'] as const).map((filterOption) => (
              <button
                key={filterOption}
                onClick={() => setFilter(filterOption)}
                className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
                  filter === filterOption
                    ? 'bg-white text-emerald-600 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {filterOption === 'all' && 'الكل'}
                {filterOption === 'pending' && 'قيد الانتظار'}
                {filterOption === 'redeemed' && 'مستلمة'}
                {filterOption === 'expired' && 'منتهية'}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          {filteredCoupons.length === 0 ? (
            <div className="py-12 text-center text-slate-500">
              لا توجد كوبونات
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3 text-right text-sm font-bold text-slate-700">كود الكوبون</th>
                  <th className="px-4 py-3 text-right text-sm font-bold text-slate-700">الجائزة</th>
                  <th className="px-4 py-3 text-right text-sm font-bold text-slate-700">الحملة</th>
                  <th className="px-4 py-3 text-center text-sm font-bold text-slate-700">الفائز</th>
                  <th className="px-4 py-3 text-center text-sm font-bold text-slate-700">الحالة</th>
                  <th className="px-4 py-3 text-center text-sm font-bold text-slate-700">تاريخ الفوز</th>
                  <th className="px-4 py-3 text-center text-sm font-bold text-slate-700">صلاحية الكوبون</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredCoupons.map((coupon) => (
                  <tr key={coupon.id} className="hover:bg-slate-50">
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <QrCode size={16} className="text-emerald-600" />
                        <span className="font-mono font-bold text-emerald-700">{coupon.claim_code}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <p className="font-semibold text-slate-900">{coupon.prize?.name_ar || coupon.prize?.name}</p>
                      <p className="text-xs text-slate-500">{coupon.prize?.description}</p>
                      {coupon.prize?.value > 0 && (
                        <p className="text-xs text-emerald-600 font-bold mt-1">قيمة: {coupon.prize.value} ريال</p>
                      )}
                    </td>
                    <td className="px-4 py-4">
                      <p className="font-semibold text-slate-900">{coupon.campaign?.store_name}</p>
                      <p className="text-xs text-slate-500">{coupon.campaign?.business_type}</p>
                    </td>
                    <td className="px-4 py-4">
                      <div className="text-center">
                        {coupon.user_phone && (
                          <div className="flex items-center justify-center gap-1 text-sm text-slate-700">
                            <Phone size={14} />
                            <span dir="ltr">{coupon.user_phone}</span>
                          </div>
                        )}
                        {coupon.user?.email && (
                          <p className="text-xs text-slate-500 mt-1" dir="ltr">{coupon.user.email}</p>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-4 text-center">
                      {getStatusBadge(coupon)}
                      {coupon.redeemed_at && (
                        <p className="text-xs text-slate-500 mt-1">
                          {new Date(coupon.redeemed_at).toLocaleString('ar-SA')}
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-4 text-center text-sm text-slate-600">
                      <div className="flex items-center justify-center gap-1">
                        <Calendar size={14} />
                        {new Date(coupon.claimed_at).toLocaleDateString('ar-SA')}
                      </div>
                    </td>
                    <td className="px-4 py-4 text-center text-sm text-slate-600">
                      <div className="flex items-center justify-center gap-1">
                        <Calendar size={14} />
                        {new Date(coupon.expires_at).toLocaleDateString('ar-SA')}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
