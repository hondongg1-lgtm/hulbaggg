import { useState, useRef } from 'react';
import { ShoppingBag, Store, Phone, MapPin, CheckCircle, Rocket, Target, TrendingUp, Users, Upload, Sparkles, Menu, X } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { supabase } from './lib/supabase';

const WhatsAppIcon = ({ size = 20, className = "" }: { size?: number; className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    width={size}
    height={size}
    fill="currentColor"
    className={className}
  >
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
  </svg>
);

function App() {
  const [activeTab, setActiveTab] = useState<'advertiser' | 'store'>('advertiser');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToSection = (id: string, tab?: 'advertiser' | 'store') => {
    if (tab) {
      setActiveTab(tab);
    }

    setTimeout(() => {
      const element = document.getElementById(id);
      if (element) {
        const headerOffset = 100;
        const elementPosition = element.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
        setMobileMenuOpen(false);
      }
    }, 100);
  };

  const scrollToForm = () => {
    setMobileMenuOpen(false);
    setTimeout(() => {
      const formSection = document.querySelector('.bg-white.rounded-2xl.shadow-xl.p-8.border.border-slate-200.sticky');
      if (formSection) {
        const headerHeight = 100;
        const yPosition = formSection.getBoundingClientRect().top + window.pageYOffset - headerHeight;
        window.scrollTo({ top: yPosition, behavior: 'smooth' });
      }
    }, 100);
  };

  const [advertiserData, setAdvertiserData] = useState({
    businessName: '',
    businessType: '',
    phone: '',
    description: '',
    website: '',
    logo: ''
  });

  const [storeData, setStoreData] = useState({
    storeName: '',
    ownerName: '',
    location: '',
    expectedBags: '',
    phone: ''
  });

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAdvertiserData({ ...advertiserData, logo: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePayment = () => {
    if (!advertiserData.businessName || !advertiserData.phone) {
      alert('الرجاء ملء اسم النشاط ورقم الجوال على الأقل');
      return;
    }

    const message = `مرحباً، أرغب بطلب حملة إعلانية:\n\nاسم النشاط: ${advertiserData.businessName}\nنوع النشاط: ${advertiserData.businessType || 'غير محدد'}\nرقم الجوال: ${advertiserData.phone}\nالموقع الإلكتروني: ${advertiserData.website || 'غير متوفر'}\nالوصف: ${advertiserData.description || 'غير متوفر'}`;

    const whatsappUrl = `https://wa.me/YOUR_PHONE_NUMBER?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const sendStoreToWhatsApp = () => {
    const message = `*طلب تسجيل بقالة*\n\n` +
      `🏪 *اسم البقالة:* ${storeData.storeName || 'غير محدد'}\n` +
      `👤 *اسم المالك:* ${storeData.ownerName || 'غير محدد'}\n` +
      `📍 *موقع البقالة:* ${storeData.location || 'غير محدد'}\n` +
      `📦 *عدد الأكياس المتوقع شهرياً:* ${storeData.expectedBags || 'غير محدد'}\n` +
      `📱 *رقم الجوال:* ${storeData.phone || 'غير محدد'}`;

    const whatsappUrl = `https://wa.me/966549408500?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <div className="min-h-screen bg-slate-50" dir="rtl">
      <header className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img
                src="/Gemini_Generated_Image_sfh2jysfh2jysfh2_(1).png"
                alt="حلول الحقيبة"
                className="h-16 w-auto"
              />
              <div className="flex flex-col">
                <h1 className="text-2xl font-black text-slate-900">حلول الحقيبة</h1>
                <p className="text-xs text-slate-600">إعلانك في يد كل عميل</p>
              </div>
            </div>
            <nav className="hidden md:flex items-center gap-6">
              <button
                onClick={() => {
                  setActiveTab('advertiser');
                  scrollToForm();
                }}
                className="text-slate-700 hover:text-emerald-600 font-semibold transition-colors"
              >
                ابدأ الآن
              </button>
              <button
                onClick={() => scrollToSection('benefits')}
                className="text-slate-700 hover:text-emerald-600 font-semibold transition-colors"
              >
                المميزات
              </button>
              <button
                onClick={() => scrollToSection('comparison')}
                className="text-slate-700 hover:text-emerald-600 font-semibold transition-colors"
              >
                المقارنة
              </button>
              <button
                onClick={() => scrollToSection('who-benefits')}
                className="text-slate-700 hover:text-emerald-600 font-semibold transition-colors"
              >
                من يستفيد
              </button>
              <a
                href="/?admin=true"
                className="text-slate-700 hover:text-emerald-600 font-semibold transition-colors"
              >
                لوحة الإدارة
              </a>
              <a
                href="/?user=true"
                className="text-slate-700 hover:text-emerald-600 font-semibold transition-colors"
              >
                تطبيق المستخدمين
              </a>
            </nav>
            <div className="flex items-center gap-3">
              <a
                href="https://wa.me/966549408500"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-[#25D366] text-white px-5 py-2.5 rounded-lg font-semibold hover:bg-[#1da851] transition-all flex items-center gap-2 shadow-md hover:shadow-lg"
              >
                <WhatsAppIcon size={18} />
                <span className="hidden sm:inline">تواصل معنا</span>
              </a>
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden text-slate-700 p-2"
              >
                {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>

          {mobileMenuOpen && (
            <nav className="md:hidden mt-4 pb-4 border-t border-slate-200 pt-4">
              <div className="flex flex-col gap-3">
                <button
                  onClick={() => {
                    setActiveTab('advertiser');
                    scrollToForm();
                  }}
                  className="text-slate-700 hover:text-emerald-600 font-semibold transition-colors text-right py-2"
                >
                  ابدأ الآن
                </button>
                <button
                  onClick={() => scrollToSection('benefits')}
                  className="text-slate-700 hover:text-emerald-600 font-semibold transition-colors text-right py-2"
                >
                  المميزات
                </button>
                <button
                  onClick={() => scrollToSection('comparison')}
                  className="text-slate-700 hover:text-emerald-600 font-semibold transition-colors text-right py-2"
                >
                  المقارنة
                </button>
                <button
                  onClick={() => scrollToSection('who-benefits')}
                  className="text-slate-700 hover:text-emerald-600 font-semibold transition-colors text-right py-2"
                >
                  من يستفيد
                </button>
                <a
                  href="/?admin=true"
                  className="text-slate-700 hover:text-emerald-600 font-semibold transition-colors text-right py-2"
                >
                  لوحة الإدارة
                </a>
                <a
                  href="/?user=true"
                  className="text-slate-700 hover:text-emerald-600 font-semibold transition-colors text-right py-2"
                >
                  تطبيق المستخدمين
                </a>
              </div>
            </nav>
          )}
        </div>
      </header>

      <section id="registration" className="py-20 bg-gradient-to-b from-emerald-50 to-white">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-4xl mx-auto mb-12">
            <div className="inline-flex items-center gap-2 bg-emerald-100 border border-emerald-300 rounded-full px-5 py-2 mb-6">
              <Rocket className="text-emerald-700" size={16} />
              <span className="text-emerald-800 font-semibold text-sm">منصة الإعلان على الأكياس</span>
            </div>

            <h1 className="text-5xl md:text-6xl font-black text-slate-900 mb-6 leading-tight">
              إعلانك في يد كل عميل
            </h1>

            <p className="text-xl text-slate-600 mb-10 leading-relaxed">
              نربط بين الأنشطة التجارية والبقالات لتحويل أكياس التسوق إلى وسيلة إعلانية ذكية تصل لكل بيت
            </p>

            <div className="max-w-2xl mx-auto mb-10">
              <div className="bg-white rounded-2xl p-8 shadow-xl border border-slate-200">
                <h3 className="text-2xl font-bold text-slate-900 mb-6 text-center">شاهد كيف يبدو الإعلان</h3>
                <div className="relative">
                  <img
                    src="/Gemini_Generated_Image_osua1vosua1vosua.png"
                    alt="مثال على كيس إعلاني"
                    className="w-full rounded-xl shadow-lg"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-center gap-4 mb-12">
            <button
              onClick={() => {
                setActiveTab('advertiser');
                scrollToForm();
              }}
              className={`px-8 py-4 rounded-xl font-bold text-lg transition-all ${
                activeTab === 'advertiser'
                  ? 'bg-emerald-600 text-white shadow-lg'
                  : 'bg-white text-slate-700 border-2 border-slate-200 hover:border-emerald-300'
              }`}
            >
              أريد الإعلان
            </button>
            <button
              onClick={() => {
                setActiveTab('store');
                scrollToForm();
              }}
              className={`px-8 py-4 rounded-xl font-bold text-lg transition-all ${
                activeTab === 'store'
                  ? 'bg-emerald-600 text-white shadow-lg'
                  : 'bg-white text-slate-700 border-2 border-slate-200 hover:border-emerald-300'
              }`}
            >
              أملك بقالة
            </button>
          </div>

          {activeTab === 'advertiser' ? (
            <div className="max-w-6xl mx-auto">
              <div className="grid lg:grid-cols-2 gap-12 items-start">
                <div>
                  <div className="mb-8">
                    <div className="flex items-center gap-2 mb-4">
                      <Sparkles className="text-emerald-600" size={24} />
                      <h2 className="text-4xl font-black text-slate-900">
                        املأ بيانات إعلانك
                      </h2>
                    </div>
                    <p className="text-slate-600">املأ البيانات وشاهد إعلانك مباشرة على الكيس</p>
                  </div>

                  <div className="bg-white rounded-2xl shadow-xl p-8 border border-slate-200 sticky top-24">
                    <form className="space-y-5">
                      <div>
                        <label className="block text-sm font-bold text-slate-900 mb-2">الشعار</label>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleLogoUpload}
                          className="hidden"
                        />
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="w-full px-4 py-3 bg-slate-50 border-2 border-dashed border-slate-300 rounded-lg hover:border-emerald-500 hover:bg-emerald-50 transition-all flex items-center justify-center gap-2 font-semibold text-slate-700"
                        >
                          <Upload size={20} />
                          {advertiserData.logo ? 'تغيير الشعار' : 'رفع الشعار'}
                        </button>
                        {advertiserData.logo && (
                          <div className="mt-2 flex justify-center">
                            <img src={advertiserData.logo} alt="Preview" className="h-16 w-16 object-contain rounded-lg border-2 border-slate-200" />
                          </div>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-bold text-slate-900 mb-2">اسم النشاط *</label>
                        <input
                          type="text"
                          value={advertiserData.businessName}
                          onChange={(e) => setAdvertiserData({ ...advertiserData, businessName: e.target.value })}
                          className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-300 rounded-lg focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200 transition-all"
                          placeholder="مثال: مطعم الذواق"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-bold text-slate-900 mb-2">نوع النشاط *</label>
                        <input
                          type="text"
                          value={advertiserData.businessType}
                          onChange={(e) => setAdvertiserData({ ...advertiserData, businessType: e.target.value })}
                          className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-300 rounded-lg focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200 transition-all"
                          placeholder="مثال: مطاعم"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-bold text-slate-900 mb-2">وصف قصير *</label>
                        <textarea
                          value={advertiserData.description}
                          onChange={(e) => setAdvertiserData({ ...advertiserData, description: e.target.value })}
                          rows={2}
                          maxLength={50}
                          className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-300 rounded-lg focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200 resize-none transition-all"
                          placeholder="وصف مختصر (50 حرف)"
                        />
                        <p className="text-xs text-slate-500 mt-1">{advertiserData.description.length}/50</p>
                      </div>

                      <div>
                        <label className="block text-sm font-bold text-slate-900 mb-2">رقم الجوال *</label>
                        <input
                          type="tel"
                          value={advertiserData.phone}
                          onChange={(e) => setAdvertiserData({ ...advertiserData, phone: e.target.value })}
                          className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-300 rounded-lg focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200 transition-all"
                          placeholder="05XXXXXXXX"
                          dir="ltr"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-bold text-slate-900 mb-2">الموقع أو حساب تواصل اجتماعي</label>
                        <input
                          type="text"
                          value={advertiserData.website}
                          onChange={(e) => setAdvertiserData({ ...advertiserData, website: e.target.value })}
                          className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-300 rounded-lg focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200 transition-all"
                          placeholder="https://example.com"
                          dir="ltr"
                        />
                        <p className="text-xs text-slate-500 mt-1">سيتم تحويله لرمز QR</p>
                      </div>

                      <button
                        type="button"
                        onClick={handlePayment}
                        className="w-full bg-green-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-green-700 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                      >
                        <WhatsAppIcon size={20} />
                        تواصل عبر واتساب
                      </button>

                      <p className="text-xs text-center text-slate-600">
                        سيتم إنشاء رابط دفع آمن عبر بوابة الدفع
                      </p>
                    </form>
                  </div>
                </div>

                <div>
                  <div className="mb-8">
                    <h2 className="text-4xl font-black text-slate-900 mb-2">
                      شاهد إعلانك الآن
                    </h2>
                    <p className="text-slate-600">معاينة حية لإعلانك على الكيس</p>
                  </div>

                  <div className="bg-white rounded-2xl shadow-xl p-6 mb-8 border-2 border-slate-200 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-100 rounded-bl-full opacity-50"></div>
                    <div className="absolute bottom-0 left-0 w-24 h-24 bg-emerald-100 rounded-tr-full opacity-50"></div>

                    <div className="relative bg-gradient-to-br from-slate-50 to-white rounded-xl p-6 border-2 border-slate-300 shadow-inner">
                      <div className="text-center mb-4">
                        <div className="inline-block bg-emerald-600 text-white px-4 py-1 rounded-full text-xs font-bold mb-2 shadow-md">
                          خلف الكيس
                        </div>
                        <p className="text-slate-600 text-sm font-semibold">إعلانك سيظهر في أحد هذه المربعات</p>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        {[1, 2, 3, 4].map((slot) => {
                          const isYourAd = slot === 1;
                          return (
                            <div
                              key={slot}
                              className={`rounded-lg p-4 transition-all ${
                                isYourAd
                                  ? 'bg-white border-2 border-emerald-500 shadow-lg ring-2 ring-emerald-200'
                                  : 'bg-white border-2 border-slate-200 opacity-60'
                              }`}
                            >
                              <div className="flex flex-col items-center text-center space-y-2">
                                {isYourAd && advertiserData.logo ? (
                                  <img src={advertiserData.logo} alt="Logo" className="w-14 h-14 object-contain rounded-lg" />
                                ) : (
                                  <div className="w-14 h-14 bg-slate-200 rounded-lg flex items-center justify-center">
                                    <ShoppingBag className="text-slate-400" size={24} />
                                  </div>
                                )}

                                <h4 className="font-bold text-slate-900 text-sm leading-tight">
                                  {isYourAd && advertiserData.businessName ? advertiserData.businessName : 'اسم المحل'}
                                </h4>

                                <p className="text-xs text-slate-600 leading-tight min-h-[2rem]">
                                  {isYourAd && advertiserData.description ? advertiserData.description : 'وصف قصير عن المحل'}
                                </p>

                                <div className="w-16 h-16 bg-white rounded-lg flex items-center justify-center shadow-md p-1">
                                  <QRCodeSVG
                                    value={
                                      isYourAd && (advertiserData.website || advertiserData.phone)
                                        ? (advertiserData.website || `tel:${advertiserData.phone}`)
                                        : 'https://example.com'
                                    }
                                    size={56}
                                    level="M"
                                    includeMargin={false}
                                  />
                                </div>

                                <div className="flex items-center gap-1 text-xs text-slate-700 font-semibold">
                                  <Phone size={12} />
                                  <span dir="ltr">{isYourAd && advertiserData.phone ? advertiserData.phone : '05XXXXXXXX'}</span>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 border-2 border-emerald-300 rounded-xl p-6 shadow-lg">
                    <h3 className="font-bold text-emerald-900 mb-4 flex items-center gap-2 text-lg">
                      <CheckCircle size={20} />
                      ما الذي ستحصل عليه:
                    </h3>
                    <ul className="space-y-3 text-slate-700">
                      <li className="flex items-start gap-2">
                        <span className="text-emerald-600 font-bold text-lg">✓</span>
                        <span>مربع إعلاني واضح ومميز في خلف الكيس</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-emerald-600 font-bold text-lg">✓</span>
                        <span>شعارك + اسم محلك + وصف قصير</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-emerald-600 font-bold text-lg">✓</span>
                        <span>رمز QR يربط العميل بموقعك أو حسابك</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-emerald-600 font-bold text-lg">✓</span>
                        <span>رقم جوالك للتواصل المباشر</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-emerald-600 font-bold text-lg">✓</span>
                        <span>وصول لآلاف العملاء يومياً</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="max-w-5xl mx-auto">
              <div className="grid lg:grid-cols-2 gap-12 items-start">
                <div>
                  <div className="text-center lg:text-right mb-8">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-emerald-100 rounded-full mb-4">
                      <Store className="text-emerald-600" size={40} />
                    </div>
                    <h2 className="text-4xl font-black text-slate-900 mb-4">
                      أكياس مجانية لبقالتك
                    </h2>
                    <p className="text-xl text-slate-600">
                      سجل الآن واحصل على أكياس بلاستيكية عالية الجودة بدون أي تكلفة
                    </p>
                  </div>

                  <div className="grid gap-6 mb-8">
                    {[
                      {
                        icon: ShoppingBag,
                        title: 'أكياس مجانية بالكامل',
                        description: 'بدون أي رسوم أو تكاليف خفية، شحن مجاني لبابك'
                      },
                      {
                        icon: Target,
                        title: 'جودة عالية ومتينة',
                        description: 'أكياس قوية بتصاميم احترافية ومطبوعة بجودة عالية'
                      },
                      {
                        icon: Rocket,
                        title: 'توصيل سريع',
                        description: 'نوصل الأكياس لبقالتك في أسرع وقت ممكن'
                      }
                    ].map((item, index) => {
                      const Icon = item.icon;
                      return (
                        <div key={index} className="flex items-start gap-4 p-5 bg-white rounded-xl border-2 border-slate-200 hover:border-emerald-400 transition-all shadow-sm">
                          <div className="flex-shrink-0 w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
                            <Icon className="text-emerald-600" size={24} />
                          </div>
                          <div>
                            <h3 className="font-bold text-slate-900 mb-1">{item.title}</h3>
                            <p className="text-sm text-slate-600">{item.description}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <div className="bg-white rounded-2xl shadow-xl p-8 border border-slate-200 sticky top-24">
                    <h3 className="text-2xl font-black text-slate-900 mb-2">سجل بقالتك الآن</h3>
                    <p className="text-slate-600 text-sm mb-6">املأ البيانات وسنتواصل معك لترتيب التوصيل</p>

                    <form className="space-y-5">
                      <div>
                        <label className="block text-sm font-bold text-slate-900 mb-2">اسم البقالة *</label>
                        <input
                          type="text"
                          value={storeData.storeName}
                          onChange={(e) => setStoreData({ ...storeData, storeName: e.target.value })}
                          className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-300 rounded-lg focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200 transition-all"
                          placeholder="بقالة السعادة"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-bold text-slate-900 mb-2">اسم المالك *</label>
                        <input
                          type="text"
                          value={storeData.ownerName}
                          onChange={(e) => setStoreData({ ...storeData, ownerName: e.target.value })}
                          className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-300 rounded-lg focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200 transition-all"
                          placeholder="أحمد محمد"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-bold text-slate-900 mb-2">موقع البقالة (رابط خرائط جوجل) *</label>
                        <input
                          type="url"
                          value={storeData.location}
                          onChange={(e) => setStoreData({ ...storeData, location: e.target.value })}
                          className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-300 rounded-lg focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200 transition-all"
                          placeholder="https://maps.app.goo.gl/..."
                          dir="ltr"
                        />
                        <p className="text-xs text-slate-500 mt-1">الصق رابط الموقع من خرائط جوجل</p>
                      </div>

                      <div>
                        <label className="block text-sm font-bold text-slate-900 mb-2">عدد الأكياس المتوقع شهرياً *</label>
                        <input
                          type="number"
                          value={storeData.expectedBags}
                          onChange={(e) => setStoreData({ ...storeData, expectedBags: e.target.value })}
                          className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-300 rounded-lg focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200 transition-all"
                          placeholder="1000"
                          min="0"
                        />
                        <p className="text-xs text-slate-500 mt-1">كم كيس تستخدم في الشهر تقريباً؟</p>
                      </div>

                      <div>
                        <label className="block text-sm font-bold text-slate-900 mb-2">رقم الجوال *</label>
                        <input
                          type="tel"
                          value={storeData.phone}
                          onChange={(e) => setStoreData({ ...storeData, phone: e.target.value })}
                          className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-300 rounded-lg focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200 transition-all"
                          placeholder="05XXXXXXXX"
                          dir="ltr"
                        />
                      </div>

                      <button
                        type="button"
                        onClick={sendStoreToWhatsApp}
                        className="w-full bg-[#25D366] text-white py-4 rounded-xl font-bold text-lg hover:bg-[#1da851] transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                      >
                        <WhatsAppIcon size={20} />
                        إرسال الطلب عبر واتساب
                      </button>

                      <p className="text-xs text-center text-slate-600">
                        سنتواصل معك خلال 24 ساعة لترتيب التوصيل
                      </p>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      <section id="benefits" className="py-16 bg-slate-100">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-black text-slate-900 mb-4">
              لماذا الإعلان على الأكياس؟
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              {
                icon: Users,
                title: 'وصول مضمون',
                description: 'كل كيس يصل لعميل حقيقي في منطقتك'
              },
              {
                icon: TrendingUp,
                title: 'انتشار واسع',
                description: 'الكيس ينتقل من المحل للبيت ويبقى أياماً'
              },
              {
                icon: Target,
                title: 'تكلفة منخفضة',
                description: 'أقل تكلفة من الإعلانات التقليدية'
              }
            ].map((item, index) => {
              const Icon = item.icon;
              return (
                <div key={index} className="bg-white rounded-xl p-8 border border-slate-200 hover:shadow-lg transition-all">
                  <Icon className="text-emerald-600 mb-4" size={36} />
                  <h3 className="text-xl font-bold text-slate-900 mb-3">{item.title}</h3>
                  <p className="text-slate-600">{item.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section id="comparison" className="py-16 bg-slate-900 text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-black mb-4">
                قارن بين وسائل الإعلان
              </h2>
              <p className="text-slate-300 text-lg">
                الإعلان على الأكياس أذكى من الطرق التقليدية
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-slate-800 rounded-xl p-8 border-2 border-slate-700">
                <h3 className="text-2xl font-bold mb-6 text-slate-200">الإعلانات التقليدية</h3>
                <ul className="space-y-3">
                  {[
                    'تكلفة عالية جداً',
                    'مدة عرض قصيرة',
                    'صعوبة قياس النتائج',
                    'جمهور غير مستهدف'
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-3 text-slate-400">
                      <span className="text-red-500 mt-1">✗</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-emerald-600 rounded-xl p-8 border-2 border-emerald-500 shadow-2xl transform md:scale-105">
                <h3 className="text-2xl font-bold mb-6">الإعلان على الأكياس</h3>
                <ul className="space-y-3">
                  {[
                    'تكلفة منخفضة للغاية',
                    'يبقى أياماً في البيت',
                    'تقارير دقيقة شهرية',
                    'يصل لعملاء حقيقيين'
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <CheckCircle className="text-white mt-1" size={20} />
                      <span className="font-medium">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="mt-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl p-8 text-center shadow-2xl">
              <p className="text-2xl font-bold mb-2">وفر حتى 80% من ميزانيتك الإعلانية</p>
              <p className="text-emerald-100 text-lg">مع نتائج أفضل ووصول مضمون</p>
            </div>
          </div>
        </div>
      </section>

      <section id="who-benefits" className="py-16 bg-gradient-to-b from-slate-50 to-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-black text-slate-900 mb-4">
              من يستفيد من خدماتنا؟
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {[
              {
                title: 'المطاعم والمقاهي',
                description: 'وصل لعملاء جدد في كل حي',
                examples: ['عروض الوجبات', 'خدمة التوصيل', 'القوائم الجديدة']
              },
              {
                title: 'المحلات التجارية',
                description: 'انشر اسمك في كل مكان',
                examples: ['افتتاح فروع', 'التخفيضات', 'المنتجات الجديدة']
              },
              {
                title: 'الخدمات المنزلية',
                description: 'اوصل لكل بيت مباشرة',
                examples: ['صيانة وتنظيف', 'توصيل غاز', 'خدمات السباكة']
              }
            ].map((category, index) => (
              <div key={index} className="bg-white rounded-xl p-8 border border-slate-200 hover:shadow-xl transition-all">
                <h3 className="text-2xl font-bold text-slate-900 mb-3">{category.title}</h3>
                <p className="text-emerald-600 font-semibold mb-4">{category.description}</p>
                <ul className="space-y-2">
                  {category.examples.map((example, i) => (
                    <li key={i} className="flex items-center gap-2 text-slate-600 text-sm">
                      <CheckCircle className="text-emerald-500" size={16} />
                      {example}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="bg-slate-900 py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-8 mb-8 max-w-3xl mx-auto">
            <div>
              <img
                src="/Gemini_Generated_Image_sfh2jysfh2jysfh2_(1).png"
                alt="حلول الحقيبة"
                className="h-12 w-auto mb-4 brightness-0 invert"
              />
              <p className="text-slate-400 text-sm">
                منصة إعلانية مبتكرة توصل رسالتك لآلاف العملاء
              </p>
            </div>

            <div>
              <h4 className="text-white font-bold mb-4">تواصل معنا</h4>
              <ul className="space-y-3 text-slate-400 text-sm">
                <li className="flex items-center gap-2">
                  <Phone size={16} />
                  <span dir="ltr">0549408500</span>
                </li>
                <li className="flex items-center gap-2">
                  <MapPin size={16} />
                  <span>الأحساء - السعودية</span>
                </li>
              </ul>
              <a
                href="https://wa.me/966549408500"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-[#25D366] text-white px-5 py-2.5 rounded-lg font-semibold hover:bg-[#1da851] transition-all shadow-md hover:shadow-lg mt-4"
              >
                <WhatsAppIcon size={18} />
                <span>واتساب</span>
              </a>
            </div>
          </div>

          <div className="border-t border-slate-800 pt-8 text-center text-slate-400 text-sm">
            <p>© 2024 حلول الحقيبة - جميع الحقوق محفوظة</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
