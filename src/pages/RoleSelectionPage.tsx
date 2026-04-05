import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { supabase } from '../lib/supabase';
import { User, Store, ArrowRight, Loader, Sparkles } from 'lucide-react';

export default function RoleSelectionPage() {
  const { user, refreshUserProfile } = useAuth();
  const { t, dir } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSelectRole = async (role: 'user' | 'advertiser') => {
    if (!user) return;
    setLoading(true);
    setError('');
    
    console.log('[V2-FIXED] Handling Selection for role:', role);
    console.log('[V2-FIXED] User ID:', user.id);

    try {
      // 1. Create/Update Profile
      console.log('[V2-FIXED] Updating user_profiles...');
      const { error: profileError } = await supabase
        .from('user_profiles')
        .upsert({
          id: user.id,
          email: user.email,
          full_name: user.user_metadata?.full_name || '',
          auth_provider: 'google',
          is_verified: true
        });

      if (profileError) {
        console.error('[V2-FIXED] Profile Update Error:', profileError);
        throw profileError;
      }

      // 2. Create Role Record
      // We always save the role to user_roles to ensure AuthContext can find it reliably.
      console.log('[V2-FIXED] Updating user_roles...');
      const { error: roleError } = await supabase
        .from('user_roles')
        .upsert({
          user_id: user.id,
          email: user.email,
          role: role,
          is_active: true
        }, { onConflict: 'email' });

      if (roleError) {
        console.error('[V2-FIXED] Role Update Error:', roleError);
        throw roleError;
      }

      // 3. Refresh Auth Context
      console.log('[V2-FIXED] Refreshing user profile context...');
      // Wait a tiny bit for DB propagation
      await new Promise(resolve => setTimeout(resolve, 800));
      await refreshUserProfile();
      
      console.log('[V2-FIXED] Flow complete.');
    } catch (err: any) {
      console.error('[V2-FIXED] Final Exception Catch:', err);
      setError(t('فشل في حفظ الاختيار، حاول مرة أخرى', 'Failed to save selection, try again'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 flex items-center justify-center p-4" dir={dir}>
      <div className="max-w-4xl w-full">
        <div className="text-center mb-12 animate-fade-in">
          <div className="inline-flex items-center gap-2 bg-primary-100 border border-primary-200 rounded-full px-4 py-2 mb-6">
            <Sparkles className="text-primary-600" size={16} />
            <span className="text-primary-800 font-bold text-sm">
              {t('مرحباً بك في حلول الحقيبة', 'Welcome to Bag Solutions')}
            </span>
          </div>
          <h1 className="text-5xl font-black text-gray-900 mb-4">
            {t('كيف ترغب في استخدام المنصة؟', 'How would you like to use the platform?')}
          </h1>
          <p className="text-xl text-gray-600">
            {t('اختر نوع الحساب المناسب لك لتبدأ تجربتك', 'Choose the account type that fits you to start')}
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* User Card */}
          <button
            onClick={() => handleSelectRole('user')}
            disabled={loading}
            role="button"
            className="group relative bg-white rounded-3xl p-8 shadow-xl border-4 border-transparent hover:border-primary-500 transition-all transform hover:scale-105 text-right flex flex-col items-center md:items-start"
          >
            <div className="w-20 h-20 bg-primary-100 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <User className="text-primary-600" size={40} />
            </div>
            <h3 className="text-3xl font-black text-gray-900 mb-3">
              {t('أريد ربح الجوائز', 'I want to win prizes')}
            </h3>
            <p className="text-gray-600 text-lg mb-8">
              {t('سجل كمستخدم لمسح الأكياس، جمع النقاط، والفوز بجوائز مذهلة من محلاتك المفضلة.', 'Register as a user to scan bags, collect points, and win amazing prizes from your favorite stores.')}
            </p>
            <div className="mt-auto w-full flex items-center justify-between text-primary-600 font-bold group-hover:gap-4 transition-all">
              <span>{t('ابدأ كمستخدم', 'Start as User')}</span>
              <ArrowRight size={24} className={dir === 'rtl' ? 'rotate-180' : ''} />
            </div>
          </button>

          {/* Business Card */}
          <button
            onClick={() => handleSelectRole('advertiser')}
            disabled={loading}
            role="button"
            className="group relative bg-white rounded-3xl p-8 shadow-xl border-4 border-transparent hover:border-secondary-500 transition-all transform hover:scale-105 text-right flex flex-col items-center md:items-start"
          >
            <div className="w-20 h-20 bg-secondary-100 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Store className="text-secondary-600" size={40} />
            </div>
            <h3 className="text-3xl font-black text-gray-900 mb-3">
              {t('أملك نشاطاً تجارياً', 'I have a business')}
            </h3>
            <p className="text-gray-600 text-lg mb-8">
              {t('أطلق حملات إعلانية ذكية على أكياس التسوق، تتبع أداء إعلاناتك، وضاعف وصولك للعملاء.', 'Launch smart advertising campaigns on shopping bags, track your ad performance, and double your customer reach.')}
            </p>
            <div className="mt-auto w-full flex items-center justify-between text-secondary-600 font-bold group-hover:gap-4 transition-all">
              <span>{t('ابدأ كمعلن', 'Start as Advertiser')}</span>
              <ArrowRight size={24} className={dir === 'rtl' ? 'rotate-180' : ''} />
            </div>
          </button>
        </div>

        {error && (
          <div className="mt-8 p-4 bg-red-50 border-2 border-red-200 rounded-xl text-red-700 text-center font-bold animate-shake">
            {error}
          </div>
        )}

        {loading && (
          <div className="fixed inset-0 bg-white/80 backdrop-blur-sm z-50 flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
              <Loader className="w-12 h-12 text-primary-600 animate-spin" />
              <p className="text-xl font-bold text-gray-900">{t('جاري إعداد حسابك...', 'Setting up your account...')}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
