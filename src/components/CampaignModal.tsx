import { useState } from 'react';
import { X, Upload, CheckCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';

const WhatsAppIcon = ({ size = 24 }: { size?: number }) => (
  <svg
    viewBox="0 0 24 24"
    width={size}
    height={size}
    fill="currentColor"
  >
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
  </svg>
);

interface CampaignModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function CampaignModal({ isOpen, onClose, onSuccess }: CampaignModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    business_name: '',
    business_type: '',
    ad_text: '',
    logo_url: '',
    phone: '',
    website: '',
    slots_count: 4,
    duration_months: 1
  });
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string>('');

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('حجم الصورة يجب أن يكون أقل من 5 ميجابايت');
        return;
      }
      if (!file.type.startsWith('image/')) {
        alert('يجب اختيار صورة فقط');
        return;
      }
      setLogoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadLogo = async (): Promise<string | null> => {
    if (!logoFile) return null;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('يجب تسجيل الدخول');

    const fileExt = logoFile.name.split('.').pop();
    const fileName = `${user.id}/${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('campaign-logos')
      .upload(fileName, logoFile, {
        contentType: logoFile.type,
        upsert: false
      });

    if (uploadError) throw uploadError;

    const { data } = supabase.storage
      .from('campaign-logos')
      .getPublicUrl(fileName);

    return data.publicUrl;
  };

  const calculatePrice = () => {
    const basePrice = 500;
    const slotPrice = formData.slots_count * basePrice;

    if (formData.duration_months === 3) {
      return slotPrice * 3 * 0.9;
    } else if (formData.duration_months === 6) {
      return slotPrice * 6 * 0.85;
    }
    return slotPrice;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!logoFile) {
      alert('يجب رفع شعار المحل');
      return;
    }

    const totalPrice = calculatePrice();
    const message = `مرحباً، أرغب بطلب حملة إعلانية:\n\nاسم المحل: ${formData.business_name}\nنوع النشاط: ${formData.business_type}\nرقم الجوال: ${formData.phone}\nالموقع الإلكتروني: ${formData.website || 'غير متوفر'}\nنص الإعلان: ${formData.ad_text}\nعدد المساحات: ${formData.slots_count}\nمدة الحملة: ${formData.duration_months === 1 ? 'شهر واحد' : `${formData.duration_months} أشهر`}\nالمبلغ الإجمالي: ${totalPrice} ريال`;

    const whatsappUrl = `https://wa.me/YOUR_PHONE_NUMBER?text=${encodeURIComponent(message)}`;

    window.open(whatsappUrl, '_blank');
    onSuccess();
    onClose();

    setLogoFile(null);
    setLogoPreview('');
    setFormData({
      business_name: '',
      business_type: '',
      ad_text: '',
      logo_url: '',
      phone: '',
      website: '',
      slots_count: 4,
      duration_months: 1
    });
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
            <h2 className="text-3xl font-bold">اطلب حملتك الإعلانية</h2>
            <p className="text-teal-100 mt-1">املأ البيانات وادفع مباشرة</p>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  اسم المحل أو الشركة *
                </label>
                <input
                  type="text"
                  required
                  value={formData.business_name}
                  onChange={(e) =>
                    setFormData({ ...formData, business_name: e.target.value })
                  }
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-teal-500 focus:outline-none transition-colors"
                  placeholder="مثال: مطعم الذواق"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  نوع النشاط *
                </label>
                <input
                  type="text"
                  required
                  value={formData.business_type}
                  onChange={(e) =>
                    setFormData({ ...formData, business_type: e.target.value })
                  }
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-teal-500 focus:outline-none transition-colors"
                  placeholder="مثال: مطاعم"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  رقم الجوال *
                </label>
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-teal-500 focus:outline-none transition-colors"
                  placeholder="05XXXXXXXX"
                  dir="ltr"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  الموقع الإلكتروني (اختياري)
                </label>
                <input
                  type="url"
                  value={formData.website}
                  onChange={(e) =>
                    setFormData({ ...formData, website: e.target.value })
                  }
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-teal-500 focus:outline-none transition-colors"
                  placeholder="www.example.com"
                  dir="ltr"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                شعار المحل *
              </label>
              <div className="border-2 border-dashed border-slate-300 rounded-xl p-6 text-center hover:border-teal-500 transition-colors">
                {logoPreview ? (
                  <div className="space-y-4">
                    <img
                      src={logoPreview}
                      alt="Logo preview"
                      className="max-h-32 mx-auto rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setLogoFile(null);
                        setLogoPreview('');
                      }}
                      className="text-red-600 hover:text-red-700 text-sm font-semibold"
                    >
                      إزالة الصورة
                    </button>
                  </div>
                ) : (
                  <label className="cursor-pointer block">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoChange}
                      className="hidden"
                      required
                    />
                    <Upload className="mx-auto mb-2 text-slate-400" size={32} />
                    <p className="text-slate-600 font-semibold">اضغط لرفع الشعار</p>
                    <p className="text-xs text-slate-500 mt-1">PNG, JPG, GIF حتى 5MB</p>
                  </label>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                نص الإعلان *
              </label>
              <textarea
                required
                value={formData.ad_text}
                onChange={(e) =>
                  setFormData({ ...formData, ad_text: e.target.value })
                }
                rows={3}
                className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-teal-500 focus:outline-none transition-colors resize-none"
                placeholder="وصف مختصر لخدماتك أو منتجاتك (مثال: أشهى المأكولات - توصيل مجاني)"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                عدد المساحات الإعلانية *
              </label>
              <div className="grid grid-cols-4 gap-3">
                {[1, 2, 3, 4].map((num) => (
                  <label
                    key={num}
                    className={`border-3 rounded-xl p-4 cursor-pointer transition-all text-center hover:shadow-lg ${
                      formData.slots_count === num
                        ? 'border-teal-600 bg-teal-50 shadow-lg'
                        : 'border-slate-200 hover:border-teal-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="slots"
                      value={num}
                      checked={formData.slots_count === num}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          slots_count: parseInt(e.target.value)
                        })
                      }
                      className="hidden"
                    />
                    <div className="text-2xl font-bold text-slate-800 mb-1">{num}</div>
                    <div className="text-xs text-slate-600">
                      {num === 1 ? 'مساحة' : 'مساحات'}
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                مدة الحملة *
              </label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { months: 1, label: 'شهر واحد' },
                  { months: 3, label: '3 أشهر' },
                  { months: 6, label: '6 أشهر' }
                ].map((option) => (
                  <label
                    key={option.months}
                    className={`border-3 rounded-xl p-4 cursor-pointer transition-all text-center hover:shadow-lg ${
                      formData.duration_months === option.months
                        ? 'border-teal-600 bg-teal-50 shadow-lg'
                        : 'border-slate-200 hover:border-teal-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="duration"
                      value={option.months}
                      checked={formData.duration_months === option.months}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          duration_months: parseInt(e.target.value)
                        })
                      }
                      className="hidden"
                    />
                    <p className="font-bold text-slate-800">{option.label}</p>
                  </label>
                ))}
              </div>
            </div>

            <div className="bg-gradient-to-br from-teal-50 to-emerald-50 border-2 border-teal-200 rounded-2xl p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-teal-600 rounded-xl flex items-center justify-center flex-shrink-0">
                  <CheckCircle className="text-white" size={24} />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-slate-800 mb-3">
                    ملخص الطلب والسعر
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600">عدد المساحات:</span>
                      <span className="font-semibold text-slate-800">{formData.slots_count} مساحات</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600">المدة:</span>
                      <span className="font-semibold text-slate-800">
                        {formData.duration_months === 1 ? 'شهر واحد' : `${formData.duration_months} أشهر`}
                      </span>
                    </div>
                    {formData.duration_months > 1 && (
                      <div className="flex justify-between items-center text-teal-700">
                        <span>الخصم:</span>
                        <span className="font-semibold">
                          {formData.duration_months === 3 ? '10%' : '15%'}
                        </span>
                      </div>
                    )}
                    <div className="border-t border-teal-200 pt-2 mt-2">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-slate-800">المبلغ الإجمالي:</span>
                        <span className="font-bold text-teal-700 text-xl">{calculatePrice()} ريال</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white py-4 rounded-xl font-bold text-lg hover:from-green-700 hover:to-green-800 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <WhatsAppIcon size={24} />
              {loading ? 'جاري التحضير...' : 'إرسال الطلب عبر واتساب'}
            </button>

            <p className="text-sm text-center text-slate-600 mt-4">
              سنتواصل معك خلال 24 ساعة لتأكيد الطلب
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
