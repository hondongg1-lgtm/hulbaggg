import { useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import UnifiedAuthModal from '../components/UnifiedAuthModal';
import { supabase } from '../lib/supabase';

interface UserLoginPageProps {
  onVerified: (userId: string) => void;
  onBack: () => void;
}

export default function UserLoginPage({ onVerified, onBack }: UserLoginPageProps) {
  const { t, language } = useLanguage();

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session) {
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('user_id', session.user.id)
          .maybeSingle();

        if (profile) {
          await supabase
            .from('user_profiles')
            .update({ last_login: new Date().toISOString() })
            .eq('id', profile.id);

          onVerified(profile.id);
        } else {
          const { data: newProfile, error: profileError } = await supabase
            .from('user_profiles')
            .insert({
              user_id: session.user.id,
              email: session.user.email,
              full_name: session.user.user_metadata?.full_name || '',
              auth_provider: session.user.app_metadata?.provider || 'email',
              is_verified: true
            })
            .select()
            .single();

          if (!profileError && newProfile) {
            onVerified(newProfile.id);
          }
        }
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [onVerified]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 py-8" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      <div className="container mx-auto px-4">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-700 hover:text-gray-900 mb-6 transition-colors"
        >
          <ArrowLeft className={`w-5 h-5 ${language === 'ar' ? 'rotate-180' : ''}`} />
          <span className="font-medium">{t('العودة للصفحة الرئيسية', 'Back to Home')}</span>
        </button>

        <div className="text-center mb-8">
          <img
            src="/Gemini_Generated_Image_sfh2jysfh2jysfh2_(1).png"
            alt="Bag Solutions"
            className="h-20 w-auto mx-auto mb-4"
          />
          <h1 className="text-5xl font-black text-gray-900 mb-2">
            {t('حلول الحقيبة', 'Bag Solutions')}
          </h1>
          <h2 className="text-2xl font-bold text-gray-700 mb-2">
            {t('مرحباً بك', 'Welcome')}
          </h2>
          <p className="text-gray-600 text-lg">
            {t('سجل دخولك للحصول على الجوائز والعروض', 'Sign in to get prizes and offers')}
          </p>
        </div>

        <UnifiedAuthModal onSuccess={onVerified} userType="user" />
      </div>
    </div>
  );
}
