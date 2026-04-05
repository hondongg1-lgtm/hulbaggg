import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { LogOut, User, Globe, Menu, X, Gift, Sparkles } from 'lucide-react';
import { useState } from 'react';

export default function Navbar({ onNavigate }: { onNavigate?: (step: any) => void }) {
  const { user, userRole, userProfile, signOut } = useAuth();
  const { language, setLanguage, t, dir } = useLanguage();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = async () => {
    await signOut();
    window.location.href = '/';
  };

  const toggleLanguage = () => {
    setLanguage(language === 'ar' ? 'en' : 'ar');
  };

  return (
    <nav className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-gray-100 shadow-sm" dir={dir}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo & Title */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => onNavigate?.('marketplace')}>
            <img 
              src="/Gemini_Generated_Image_osua1vosua1vosua.png" 
              alt="Logo" 
              className="w-10 h-10 object-contain hover:rotate-12 transition-transform"
            />
            <span className="text-xl font-black bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent hidden sm:block">
              {t('حلول الحقيبة', 'Bag Solutions')}
            </span>
          </div>

          {/* Desktop Nav Items */}
          <div className="hidden md:flex items-center gap-4 flex-1 justify-center">
            {userRole === 'user' && (
              <button 
                onClick={() => onNavigate?.('myRewards')}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-green-700 font-bold hover:bg-green-50 transition-all border border-green-100"
              >
                <Gift size={20} />
                <span>{t('جوائزي', 'My Rewards')}</span>
              </button>
            )}
            {userRole === 'user' && (
              <button 
                onClick={() => onNavigate?.('marketplace')}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-emerald-700 font-bold hover:bg-emerald-50 transition-all border border-emerald-100"
              >
                <Sparkles size={20} />
                <span>{t('العروض', 'Offers')}</span>
              </button>
            )}
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-6">
            {/* Language Switcher */}
            <button 
              onClick={toggleLanguage}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full hover:bg-gray-100 transition-colors text-gray-600 font-medium"
            >
              <Globe size={18} />
              <span>{language === 'ar' ? 'English' : 'عربي'}</span>
            </button>

            {/* Role Badge */}
            {userRole && (
              <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                userRole === 'admin' ? 'bg-purple-100 text-purple-700' : 
                userRole === 'advertiser' ? 'bg-blue-100 text-blue-700' : 
                'bg-green-100 text-green-700'
              }`}>
                {userRole === 'admin' ? t('مدير', 'Admin') : 
                 userRole === 'advertiser' ? t('معلن', 'Advertiser') : 
                 t('مستخدم', 'User')}
              </span>
            )}

            {/* Profile Info */}
            <div className="flex items-center gap-3 pl-4 border-l border-gray-100">
               <div className="text-right hidden lg:block">
                  <p className="text-sm font-bold text-gray-900">{userProfile?.full_name || user?.email?.split('@')[0]}</p>
                  <p className="text-xs text-gray-500">{user?.email}</p>
               </div>
               <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center text-white font-bold shadow-md">
                 <User size={20} />
               </div>
            </div>

            {/* Logout */}
            <button 
              onClick={handleLogout}
              className="p-2 rounded-xl text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all group"
              title={t('خروج', 'Logout')}
            >
              <LogOut size={22} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-4">
             <button onClick={toggleLanguage} className="p-2 text-gray-600">
               <Globe size={20} />
             </button>
             <button 
               onClick={() => setIsMenuOpen(!isMenuOpen)}
               className="p-2 rounded-lg text-gray-600 hover:bg-gray-100"
             >
               {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
             </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-b border-gray-100 animate-slide-down">
          <div className="px-4 pt-2 pb-6 space-y-4">
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-2xl">
               <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center text-white">
                 <User size={24} />
               </div>
               <div>
                  <p className="font-bold text-gray-900">{userProfile?.full_name || user?.email?.split('@')[0]}</p>
                  <p className="text-sm text-gray-500">{user?.email}</p>
               </div>
            </div>

            {userRole === 'user' && (
              <div className="grid grid-cols-2 gap-3">
                <button 
                  onClick={() => { onNavigate?.('marketplace'); setIsMenuOpen(false); }}
                  className="flex flex-col items-center justify-center gap-2 p-4 bg-emerald-50 text-emerald-700 rounded-2xl border border-emerald-100"
                >
                  <Sparkles size={24} />
                  <span className="text-xs font-bold">{t('العروض', 'Offers')}</span>
                </button>
                <button 
                  onClick={() => { onNavigate?.('myRewards'); setIsMenuOpen(false); }}
                  className="flex flex-col items-center justify-center gap-2 p-4 bg-green-50 text-green-700 rounded-2xl border border-green-100"
                >
                  <Gift size={24} />
                  <span className="text-xs font-bold">{t('جوائزي', 'My Rewards')}</span>
                </button>
              </div>
            )}

            <button 
              onClick={handleLogout}
              className="w-full flex items-center gap-3 p-3 text-red-600 font-bold hover:bg-red-50 rounded-xl transition-colors"
            >
              <LogOut size={20} />
              <span>{t('تسجيل الخروج', 'Logout')}</span>
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
