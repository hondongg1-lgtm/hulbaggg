import { Gift, QrCode, Trophy, Sparkles, ShoppingBag, Zap, Star } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface LandingPageProps {
  onStart: () => void;
  onNavigateToPrivacy?: () => void;
  onNavigateToTerms?: () => void;
}

export default function LandingPage({ onStart, onNavigateToPrivacy, onNavigateToTerms }: LandingPageProps) {
  const { language, setLanguage, t, dir } = useLanguage();

  return (
    <div className={`min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 animate-fade-in ${dir === 'rtl' ? 'font-arabic' : ''}`}>
      <div className="absolute top-6 right-6 z-10 animate-slide-down">
        <div className="flex gap-2 bg-white/90 backdrop-blur-md rounded-xl shadow-lg p-1 border border-primary-100">
          <button
            onClick={() => setLanguage('ar')}
            className={`px-5 py-2.5 rounded-lg text-sm font-bold transition-all transform hover:scale-105 ${
              language === 'ar'
                ? 'bg-primary-600 text-white shadow-md'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            عربي
          </button>
          <button
            onClick={() => setLanguage('en')}
            className={`px-5 py-2.5 rounded-lg text-sm font-bold transition-all transform hover:scale-105 ${
              language === 'en'
                ? 'bg-primary-600 text-white shadow-md'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            English
          </button>
        </div>
      </div>

      <div className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center mb-8 animate-bounce-slow">
              <img
                src="/Gemini_Generated_Image_osua1vosua1vosua.png"
                alt="Logo"
                className="w-64 h-64 object-contain drop-shadow-2xl"
              />
            </div>

            <h1 className="text-7xl font-black text-gray-900 mb-4 animate-fade-in-up leading-tight">
              {t('حلول الحقيبة', 'Bag Solutions')}
            </h1>

            <h2 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-success-600 mb-6 animate-fade-in-up leading-tight">
              {t('امسح الكيس واربح جوائز فورية!', 'Scan the Bag and Win Instant Prizes!')}
            </h2>

            <p className="text-2xl text-gray-700 mb-10 animate-fade-in-up max-w-3xl mx-auto leading-relaxed">
              {t(
                'اشتر من محلك المفضل، امسح الكود، واربح جوائز مذهلة كل يوم',
                'Shop at your favorite store, scan the code, and win amazing prizes every day'
              )}
            </p>

            <button
              onClick={onStart}
              className="bg-gradient-to-r from-primary-600 to-success-600 hover:from-primary-700 hover:to-success-700 text-white px-12 py-5 rounded-2xl text-xl font-black shadow-2xl hover:shadow-glow-primary transition-all transform hover:scale-110 active:scale-95 animate-scale-in flex items-center gap-3 mx-auto"
            >
              <Zap className="w-6 h-6" />
              {t('ابدأ الآن', 'Start Now')}
              <Sparkles className="w-6 h-6" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-20">
            <div className="bg-white/80 backdrop-blur-md rounded-3xl p-8 shadow-2xl hover:shadow-glow-primary transition-all border-4 border-primary-200 hover:border-primary-400 transform hover:scale-105 animate-fade-in-up group">
              <div className="w-16 h-16 bg-gradient-to-br from-primary-100 to-primary-200 rounded-2xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <Gift className="w-8 h-8 text-primary-700" />
              </div>
              <h3 className="text-2xl font-black text-gray-900 mb-3">
                {t('جوائز فورية', 'Instant Prizes')}
              </h3>
              <p className="text-gray-700 text-lg leading-relaxed">
                {t(
                  'اربح خصومات وهدايا فورية عند كل مسح للكود',
                  'Win discounts and instant gifts with every code scan'
                )}
              </p>
            </div>

            <div className="bg-white/80 backdrop-blur-md rounded-3xl p-8 shadow-2xl hover:shadow-glow-secondary transition-all border-4 border-secondary-200 hover:border-secondary-400 transform hover:scale-105 animate-fade-in-up group" style={{ animationDelay: '0.1s' }}>
              <div className="w-16 h-16 bg-gradient-to-br from-secondary-100 to-secondary-200 rounded-2xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <Star className="w-8 h-8 text-secondary-700" />
              </div>
              <h3 className="text-2xl font-black text-gray-900 mb-3">
                {t('نقاط مكافآت', 'Reward Points')}
              </h3>
              <p className="text-gray-700 text-lg leading-relaxed">
                {t(
                  'اجمع النقاط واستبدلها بجوائز أكبر',
                  'Collect points and redeem them for bigger prizes'
                )}
              </p>
            </div>

            <div className="bg-white/80 backdrop-blur-md rounded-3xl p-8 shadow-2xl hover:shadow-glow-success transition-all border-4 border-success-200 hover:border-success-400 transform hover:scale-105 animate-fade-in-up group" style={{ animationDelay: '0.2s' }}>
              <div className="w-16 h-16 bg-gradient-to-br from-success-100 to-success-200 rounded-2xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <Trophy className="w-8 h-8 text-success-700" />
              </div>
              <h3 className="text-2xl font-black text-gray-900 mb-3">
                {t('سحوبات شهرية', 'Monthly Raffles')}
              </h3>
              <p className="text-gray-700 text-lg leading-relaxed">
                {t(
                  'ادخل في سحوبات على جوائز كبرى كل شهر',
                  'Enter monthly draws for grand prizes'
                )}
              </p>
            </div>
          </div>

          <div className="mt-20 bg-gradient-to-br from-white to-primary-50 rounded-3xl p-10 shadow-2xl border-4 border-primary-300 animate-fade-in-up">
            <h2 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-success-600 mb-10 text-center">
              {t('كيف يعمل؟', 'How It Works?')}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div className="text-center group">
                <div className="w-16 h-16 bg-gradient-to-br from-primary-600 to-primary-700 text-white rounded-2xl flex items-center justify-center mx-auto mb-4 text-2xl font-black shadow-lg group-hover:scale-110 transition-transform">
                  1
                </div>
                <p className="text-gray-900 font-bold text-lg">
                  {t('اشتر من المحل', 'Shop at Store')}
                </p>
              </div>

              <div className="text-center group">
                <div className="w-16 h-16 bg-gradient-to-br from-secondary-600 to-secondary-700 text-white rounded-2xl flex items-center justify-center mx-auto mb-4 text-2xl font-black shadow-lg group-hover:scale-110 transition-transform">
                  2
                </div>
                <p className="text-gray-900 font-bold text-lg">
                  {t('امسح رمز QR على الكيس', 'Scan QR on Bag')}
                </p>
              </div>

              <div className="text-center group">
                <div className="w-16 h-16 bg-gradient-to-br from-success-600 to-success-700 text-white rounded-2xl flex items-center justify-center mx-auto mb-4 text-2xl font-black shadow-lg group-hover:scale-110 transition-transform">
                  3
                </div>
                <p className="text-gray-900 font-bold text-lg">
                  {t('تحقق برقم الجوال', 'Verify Phone')}
                </p>
              </div>

              <div className="text-center group">
                <div className="w-16 h-16 bg-gradient-to-br from-primary-600 to-success-600 text-white rounded-2xl flex items-center justify-center mx-auto mb-4 text-2xl font-black shadow-lg group-hover:scale-110 transition-transform">
                  4
                </div>
                <p className="text-gray-900 font-bold text-lg">
                  {t('اربح جائزتك!', 'Win Your Prize!')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <footer className="bg-white border-t border-gray-200 py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-600">
            <button
              onClick={onNavigateToPrivacy}
              className="hover:text-primary-600 transition-colors font-medium"
            >
              {t('سياسة الخصوصية', 'Privacy Policy')}
            </button>
            <span className="text-gray-400">|</span>
            <button
              onClick={onNavigateToTerms}
              className="hover:text-primary-600 transition-colors font-medium"
            >
              {t('شروط الخدمة', 'Terms of Service')}
            </button>
          </div>
          <p className="text-center text-gray-500 mt-4 text-xs">
            {t('© 2026 جميع الحقوق محفوظة', '© 2026 All Rights Reserved')}
          </p>
        </div>
      </footer>
    </div>
  );
}
