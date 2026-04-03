import { useState, useEffect } from 'react';
import { X, CreditCard as Edit, Trash2, Eye, MapPin } from 'lucide-react';
import { supabase, type Ad } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface MyAdsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MyAdsModal({ isOpen, onClose }: MyAdsModalProps) {
  const { user } = useAuth();
  const [ads, setAds] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen && user) {
      loadMyAds();
    }
  }, [isOpen, user]);

  const loadMyAds = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('ads')
      .select('*')
      .eq('user_id', user?.id)
      .order('created_at', { ascending: false });

    if (data) setAds(data);
    setLoading(false);
  };

  const handleDelete = async (adId: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا الإعلان؟')) return;

    const { error } = await supabase.from('ads').delete().eq('id', adId);

    if (!error) {
      setAds(ads.filter(ad => ad.id !== adId));
    }
  };

  const toggleStatus = async (ad: Ad) => {
    const newStatus = ad.status === 'active' ? 'sold' : 'active';
    const { error } = await supabase
      .from('ads')
      .update({ status: newStatus })
      .eq('id', ad.id);

    if (!error) {
      setAds(ads.map(a => a.id === ad.id ? { ...a, status: newStatus } : a));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-white rounded-3xl max-w-5xl w-full max-h-[90vh] overflow-y-auto shadow-2xl animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-gradient-to-r from-teal-600 to-emerald-600 text-white rounded-t-3xl p-6 flex items-center justify-between z-10">
          <h2 className="text-2xl font-bold">إعلاناتي</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-full transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="text-center py-20">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-teal-600 border-t-transparent"></div>
            </div>
          ) : ads.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-xl text-slate-500">لم تقم بإضافة أي إعلانات بعد</p>
            </div>
          ) : (
            <div className="space-y-4">
              {ads.map((ad) => (
                <div
                  key={ad.id}
                  className="bg-white border-2 border-slate-200 rounded-2xl overflow-hidden hover:shadow-lg transition-all"
                >
                  <div className="flex flex-col md:flex-row gap-4 p-4">
                    {ad.image_url && (
                      <div className="w-full md:w-48 h-32 rounded-xl overflow-hidden bg-slate-100 flex-shrink-0">
                        <img
                          src={ad.image_url}
                          alt={ad.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4 mb-2">
                        <h3 className="text-xl font-bold text-slate-800 line-clamp-1">
                          {ad.title}
                        </h3>
                        <span className={`px-3 py-1 rounded-full text-sm font-semibold whitespace-nowrap ${
                          ad.status === 'active'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-slate-100 text-slate-700'
                        }`}>
                          {ad.status === 'active' ? 'نشط' : 'مباع'}
                        </span>
                      </div>

                      <p className="text-slate-600 text-sm mb-3 line-clamp-2">
                        {ad.description}
                      </p>

                      <div className="flex items-center gap-4 text-sm text-slate-500 mb-4">
                        <div className="flex items-center gap-1">
                          <MapPin size={16} />
                          <span>{ad.location}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Eye size={16} />
                          <span>{ad.views} مشاهدة</span>
                        </div>
                        <span className="text-lg font-bold text-teal-600">
                          {ad.price.toLocaleString('ar-SA')} ر.س
                        </span>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => toggleStatus(ad)}
                          className={`px-4 py-2 rounded-xl font-semibold transition-all text-sm ${
                            ad.status === 'active'
                              ? 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                              : 'bg-green-100 text-green-700 hover:bg-green-200'
                          }`}
                        >
                          {ad.status === 'active' ? 'تم البيع' : 'تفعيل'}
                        </button>

                        <button
                          className="px-4 py-2 bg-blue-100 text-blue-700 rounded-xl font-semibold hover:bg-blue-200 transition-all text-sm flex items-center gap-2"
                        >
                          <Edit size={16} />
                          <span>تعديل</span>
                        </button>

                        <button
                          onClick={() => handleDelete(ad.id)}
                          className="px-4 py-2 bg-red-100 text-red-700 rounded-xl font-semibold hover:bg-red-200 transition-all text-sm flex items-center gap-2"
                        >
                          <Trash2 size={16} />
                          <span>حذف</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
