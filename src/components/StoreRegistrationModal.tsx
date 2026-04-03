import { useState } from 'react';
import { X, Store, MapPin, Phone, Package } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface StoreRegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function StoreRegistrationModal({
  isOpen,
  onClose,
  onSuccess
}: StoreRegistrationModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    owner_name: '',
    phone: '',
    city: '',
    neighborhood: '',
    bags_needed_monthly: 1000
  });

  const cities = [
    'الرياض',
    'جدة',
    'مكة',
    'المدينة',
    'الدمام',
    'الخبر',
    'الظهران',
    'الطائف',
    'تبوك',
    'بريدة',
    'خميس مشيط',
    'حائل',
    'نجران',
    'جازان',
    'أبها',
    'الأحساء',
    'القطيف',
    'ينبع'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);
    try {
      const { error } = await supabase.from('grocery_stores').insert({
        ...formData,
        status: 'pending'
      });

      if (error) throw error;

      alert(
        'تم تسجيل بقالتك بنجاح! سنتواصل معك قريباً لترتيب توزيع الأكياس المجانية'
      );
      onSuccess();
      onClose();
      setFormData({
        name: '',
        owner_name: '',
        phone: '',
        city: '',
        neighborhood: '',
        bags_needed_monthly: 1000
      });
    } catch (error) {
      alert('حدث خطأ، يرجى المحاولة مرة أخرى');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-gradient-to-r from-teal-600 to-emerald-600 text-white p-6 rounded-t-3xl flex items-center justify-between z-10">
          <div>
            <h2 className="text-3xl font-bold">سجل بقالتك معنا</h2>
            <p className="text-teal-100 mt-1">احصل على أكياس مجانية</p>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-8">
          <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-6 mb-8 border-2 border-emerald-200">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-md flex-shrink-0">
                <Package className="text-emerald-600" size={24} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-800 mb-2">
                  لماذا تنضم لشبكتنا؟
                </h3>
                <ul className="text-sm text-slate-700 space-y-1">
                  <li>✓ أكياس بلاستيكية مجانية بجودة عالية</li>
                  <li>✓ توصيل منتظم حسب احتياجك</li>
                  <li>✓ لا توجد أي تكاليف على البقالة</li>
                  <li>✓ تحمل شعار "حلول الحقيبة" بتصميم احترافي</li>
                </ul>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                <Store className="inline ml-2" size={16} />
                اسم البقالة *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-teal-500 focus:outline-none transition-colors"
                placeholder="مثال: بقالة النور"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                اسم صاحب البقالة *
              </label>
              <input
                type="text"
                required
                value={formData.owner_name}
                onChange={(e) =>
                  setFormData({ ...formData, owner_name: e.target.value })
                }
                className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-teal-500 focus:outline-none transition-colors"
                placeholder="اسمك الكامل"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                <Phone className="inline ml-2" size={16} />
                رقم الجوال *
              </label>
              <input
                type="tel"
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-teal-500 focus:outline-none transition-colors"
                placeholder="05XXXXXXXX"
                dir="ltr"
              />
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  <MapPin className="inline ml-2" size={16} />
                  المدينة *
                </label>
                <select
                  required
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-teal-500 focus:outline-none transition-colors bg-white"
                >
                  <option value="">اختر المدينة</option>
                  {cities.map((city) => (
                    <option key={city} value={city}>
                      {city}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  الحي *
                </label>
                <input
                  type="text"
                  required
                  value={formData.neighborhood}
                  onChange={(e) =>
                    setFormData({ ...formData, neighborhood: e.target.value })
                  }
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-teal-500 focus:outline-none transition-colors"
                  placeholder="مثال: النرجس"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                <Package className="inline ml-2" size={16} />
                عدد الأكياس المطلوبة شهرياً *
              </label>
              <select
                required
                value={formData.bags_needed_monthly}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    bags_needed_monthly: parseInt(e.target.value)
                  })
                }
                className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-teal-500 focus:outline-none transition-colors bg-white"
              >
                <option value={500}>500 كيس</option>
                <option value={1000}>1000 كيس</option>
                <option value={1500}>1500 كيس</option>
                <option value={2000}>2000 كيس</option>
                <option value={2500}>2500 كيس</option>
                <option value={3000}>3000 كيس</option>
                <option value={4000}>4000 كيس</option>
                <option value={5000}>5000 كيس</option>
              </select>
              <p className="text-xs text-slate-500 mt-1">
                تقدير تقريبي - سنحدد الكمية المناسبة عند التواصل
              </p>
            </div>

            <div className="bg-amber-50 border-2 border-amber-200 rounded-xl p-4">
              <p className="text-sm text-amber-800">
                📦 بعد التسجيل، سيتواصل معك فريقنا خلال 48 ساعة لتأكيد الطلب وترتيب
                التوصيل الأول
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-teal-600 to-emerald-600 text-white py-4 rounded-xl font-bold text-lg hover:from-teal-700 hover:to-emerald-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50"
            >
              {loading ? 'جاري التسجيل...' : 'سجل الآن - مجاناً'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
