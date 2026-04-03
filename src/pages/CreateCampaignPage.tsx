import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Rocket, MapPin, ExternalLink } from 'lucide-react';

interface CreateCampaignPageProps {
  onSuccess?: () => void;
}

export default function CreateCampaignPage({ onSuccess }: CreateCampaignPageProps) {
  const [userId, setUserId] = useState('');
  const [neighborhoods, setNeighborhoods] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    storeName: '',
    businessType: 'restaurant',
    neighborhood: '',
    storeLocation: '',
    latitude: '',
    longitude: '',
    bagCount: '1000',
    prizeType: 'discount',
    prizeName: '',
    prizeDescription: '',
    campaignDuration: '30',
    winProbability: '10',
    consolationPrize: 'خصم 2 ريال',
    consolationDiscount: '2'
  });

  useEffect(() => {
    checkAuth();
    loadNeighborhoods();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      setUserId(session.user.id);
    } else {
      window.location.href = '/?admin=true';
    }
  };

  const loadNeighborhoods = async () => {
    const { data } = await supabase
      .from('neighborhoods')
      .select('*')
      .order('name_ar');

    if (data) setNeighborhoods(data);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + parseInt(formData.campaignDuration));

      const { data: campaign, error: campError } = await supabase
        .from('campaigns')
        .insert({
          user_id: userId,
          store_name: formData.storeName,
          business_type: formData.businessType,
          neighborhood_id: formData.neighborhood,
          store_location: formData.storeLocation,
          latitude: formData.latitude ? parseFloat(formData.latitude) : null,
          longitude: formData.longitude ? parseFloat(formData.longitude) : null,
          description: formData.prizeDescription,
          total_prize_pool: parseInt(formData.bagCount),
          win_probability: parseFloat(formData.winProbability),
          consolation_prize: formData.consolationPrize,
          consolation_discount: parseFloat(formData.consolationDiscount),
          status: 'active',
          start_date: new Date().toISOString(),
          end_date: endDate.toISOString()
        })
        .select()
        .single();

      if (campError) throw campError;

      const prizeQuantity = Math.floor(
        (parseInt(formData.bagCount) * parseFloat(formData.winProbability)) / 100
      );

      const { error: prizeError } = await supabase
        .from('prizes')
        .insert({
          campaign_id: campaign.id,
          name: formData.prizeName,
          description: formData.prizeDescription,
          prize_type: formData.prizeType,
          quantity_total: prizeQuantity,
          quantity_remaining: prizeQuantity
        });

      if (prizeError) throw prizeError;

      alert('تم إنشاء الحملة بنجاح!');

      setFormData({
        storeName: '',
        businessType: 'restaurant',
        neighborhood: '',
        storeLocation: '',
        latitude: '',
        longitude: '',
        bagCount: '1000',
        prizeType: 'discount',
        prizeName: '',
        prizeDescription: '',
        campaignDuration: '30',
        winProbability: '10',
        consolationPrize: 'خصم 2 ريال',
        consolationDiscount: '2'
      });

      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Error creating campaign:', error);
      alert('حدث خطأ، حاول مرة أخرى');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 p-6" dir="rtl">
      <div className="max-w-3xl mx-auto">

        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
              <Rocket className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">إنشاء حملة جديدة</h1>
              <p className="text-gray-600">املأ البيانات لإطلاق حملتك الإعلانية</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">اسم النشاط التجاري</label>
              <input
                type="text"
                value={formData.storeName}
                onChange={(e) => setFormData({ ...formData, storeName: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">نوع النشاط</label>
              <select
                value={formData.businessType}
                onChange={(e) => setFormData({ ...formData, businessType: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg"
              >
                <option value="restaurant">مطعم</option>
                <option value="cafe">كافيه</option>
                <option value="pharmacy">صيدلية</option>
                <option value="grocery">بقالة</option>
                <option value="fashion">أزياء</option>
                <option value="electronics">إلكترونيات</option>
                <option value="furniture">أثاث</option>
                <option value="other">أخرى</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">الحي</label>
              <select
                value={formData.neighborhood}
                onChange={(e) => setFormData({ ...formData, neighborhood: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                required
              >
                <option value="">اختر الحي</option>
                {neighborhoods.map((nb) => (
                  <option key={nb.id} value={nb.id}>{nb.name_ar}</option>
                ))}
              </select>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <MapPin className="w-5 h-5 text-blue-600" />
                <label className="text-sm font-medium text-blue-900">موقع المحل</label>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs text-gray-600 mb-1">عنوان المحل (اختياري)</label>
                  <input
                    type="text"
                    value={formData.storeLocation}
                    onChange={(e) => setFormData({ ...formData, storeLocation: e.target.value })}
                    placeholder="مثال: شارع الملك فهد، بجوار البنك"
                    className="w-full px-3 py-2 border border-blue-300 rounded-lg text-sm"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">خط العرض</label>
                    <input
                      type="number"
                      step="any"
                      value={formData.latitude}
                      onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                      placeholder="25.4139"
                      className="w-full px-3 py-2 border border-blue-300 rounded-lg text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">خط الطول</label>
                    <input
                      type="number"
                      step="any"
                      value={formData.longitude}
                      onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                      placeholder="49.5937"
                      className="w-full px-3 py-2 border border-blue-300 rounded-lg text-sm"
                    />
                  </div>
                </div>

                <a
                  href="https://www.google.com/maps"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-all"
                >
                  <MapPin className="w-4 h-4" />
                  <span>حدد موقعك من خرائط جوجل</span>
                  <ExternalLink className="w-4 h-4" />
                </a>

                <p className="text-xs text-gray-600 leading-relaxed">
                  💡 في خرائط جوجل: اضغط على موقع محلك، ثم انسخ الإحداثيات من الرابط أو من تفاصيل الموقع
                </p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">عدد الأكياس المتوقعة</label>
              <select
                value={formData.bagCount}
                onChange={(e) => setFormData({ ...formData, bagCount: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg"
              >
                <option value="500">500 كيس</option>
                <option value="1000">1000 كيس</option>
                <option value="2000">2000 كيس</option>
                <option value="5000">5000 كيس</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">نوع الجائزة</label>
              <select
                value={formData.prizeType}
                onChange={(e) => setFormData({ ...formData, prizeType: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg"
              >
                <option value="discount">خصم</option>
                <option value="free_item">منتج مجاني</option>
                <option value="grand_prize">سحب على جائزة كبرى</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">اسم الجائزة</label>
              <input
                type="text"
                value={formData.prizeName}
                onChange={(e) => setFormData({ ...formData, prizeName: e.target.value })}
                placeholder="مثال: خصم 50% على الوجبة"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">وصف الجائزة</label>
              <textarea
                value={formData.prizeDescription}
                onChange={(e) => setFormData({ ...formData, prizeDescription: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                rows={3}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                نسبة الفوز ({formData.winProbability}%)
              </label>
              <input
                type="range"
                min="1"
                max="50"
                value={formData.winProbability}
                onChange={(e) => setFormData({ ...formData, winProbability: e.target.value })}
                className="w-full"
              />
              <p className="text-xs text-gray-500 mt-1">
                عدد الجوائز المتوقع: {Math.floor((parseInt(formData.bagCount) * parseFloat(formData.winProbability)) / 100)}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">مدة الحملة (أيام)</label>
              <select
                value={formData.campaignDuration}
                onChange={(e) => setFormData({ ...formData, campaignDuration: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg"
              >
                <option value="7">أسبوع</option>
                <option value="14">أسبوعين</option>
                <option value="30">شهر</option>
                <option value="60">شهرين</option>
                <option value="90">3 أشهر</option>
              </select>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm font-medium text-blue-900 mb-2">جائزة الترضية</p>
              <p className="text-xs text-blue-700 mb-3">للمستخدمين الذين لا يفوزون</p>
              <input
                type="text"
                value={formData.consolationPrize}
                onChange={(e) => setFormData({ ...formData, consolationPrize: e.target.value })}
                className="w-full px-3 py-2 border border-blue-300 rounded-lg text-sm"
                placeholder="مثال: خصم 2 ريال"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl font-bold text-lg disabled:opacity-50 transition-all"
            >
              {loading ? 'جاري الإنشاء...' : 'إطلاق الحملة 🚀'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
