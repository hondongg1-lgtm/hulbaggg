import { useState } from 'react';
import { Mail, Lock, Loader, Eye, EyeOff } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { supabase } from '../lib/supabase';

interface UnifiedAuthModalProps {
  onSuccess: (userId: string) => void;
  userType?: 'user' | 'advertiser' | 'admin';
  isSignUp?: boolean;
}

export default function UnifiedAuthModal({ onSuccess, userType = 'user', isSignUp: initialIsSignUp = false }: UnifiedAuthModalProps) {
  const { t, language } = useLanguage();
  const [isSignUp, setIsSignUp] = useState(initialIsSignUp);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmailSent, setResetEmailSent] = useState(false);

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isSignUp) {
        const { data: authData, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
              user_type: userType
            }
          }
        });

        if (signUpError) throw signUpError;

        if (authData.user) {
          const promises = [
            supabase.from('user_profiles').insert({
              user_id: authData.user.id,
              email: email,
              full_name: fullName,
              auth_provider: 'email',
              is_verified: true
            }).select().single()
          ];

          if (userType !== 'user') {
            promises.push(
              supabase.from('user_roles').insert({
                user_id: authData.user.id,
                email: email,
                role: userType,
                is_active: true
              })
            );
          }

          const results = await Promise.all(promises);
          const profile = results[0].data;

          if (results[0].error) throw results[0].error;
          if (profile) onSuccess(profile.id);
        }
      } else {
        const { data: authData, error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password
        });

        if (signInError) throw signInError;

        if (authData.user) {
          const { data: profile } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('user_id', authData.user.id)
            .maybeSingle();

          if (profile) {
            supabase
              .from('user_profiles')
              .update({ last_login: new Date().toISOString() })
              .eq('id', profile.id)
              .then(() => {});

            onSuccess(profile.id);
          } else {
            const { data: newProfile, error: profileError } = await supabase
              .from('user_profiles')
              .insert({
                user_id: authData.user.id,
                email: email,
                auth_provider: 'email',
                is_verified: true
              })
              .select()
              .single();

            if (profileError) throw profileError;
            onSuccess(newProfile.id);
          }
        }
      }
    } catch (err: any) {
      setError(err.message || t('فشل في العملية', 'Operation failed'));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setLoading(true);
    setError('');

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          }
        }
      });

      if (error) throw error;
    } catch (err: any) {
      setError(err.message || t('فشل تسجيل الدخول بقوقل', 'Google login failed'));
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;

      setResetEmailSent(true);
    } catch (err: any) {
      setError(err.message || t('فشل في إرسال رابط إعادة التعيين', 'Failed to send reset link'));
    } finally {
      setLoading(false);
    }
  };

  if (showForgotPassword) {
    return (
      <div className="w-full max-w-md mx-auto bg-white rounded-2xl shadow-2xl p-8">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            {t('إعادة تعيين كلمة المرور', 'Reset Password')}
          </h2>
          <p className="text-gray-600 mt-2">
            {t('أدخل بريدك الالكتروني لإرسال رابط إعادة التعيين', 'Enter your email to receive a reset link')}
          </p>
        </div>

        {resetEmailSent ? (
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-green-700 mb-4">
            {t('تم إرسال رابط إعادة التعيين إلى بريدك الالكتروني', 'Reset link sent to your email')}
          </div>
        ) : (
          <form onSubmit={handleForgotPassword}>
            {error && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {error}
              </div>
            )}

            <div className="mb-6">
              <label className="block text-gray-700 font-medium mb-2">
                {t('البريد الالكتروني', 'Email')}
              </label>
              <div className="relative">
                <Mail className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading && <Loader className="w-5 h-5 animate-spin" />}
              {t('إرسال رابط إعادة التعيين', 'Send Reset Link')}
            </button>
          </form>
        )}

        <button
          onClick={() => {
            setShowForgotPassword(false);
            setResetEmailSent(false);
            setError('');
          }}
          className="w-full mt-4 text-blue-600 hover:text-blue-700 font-medium"
        >
          {t('العودة لتسجيل الدخول', 'Back to Login')}
        </button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto bg-white rounded-2xl shadow-2xl p-8">
      <div className="text-center mb-6">
        <h1 className="text-4xl font-black text-gray-900 mb-2">
          {t('حلول الحقيبة', 'Bag Solutions')}
        </h1>
        <h2 className="text-2xl font-bold text-gray-700 mb-2">
          {isSignUp ? t('إنشاء حساب', 'Sign Up') : t('تسجيل الدخول', 'Sign In')}
        </h2>
        <p className="text-gray-600">
          {isSignUp
            ? t('أنشئ حسابك الجديد', 'Create your new account')
            : t('مرحباً بعودتك', 'Welcome back')
          }
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      <button
        onClick={handleGoogleAuth}
        disabled={loading}
        className="w-full px-6 py-3 bg-white border-2 border-gray-300 hover:border-blue-500 hover:bg-blue-50 text-gray-700 rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 mb-6 shadow-sm hover:shadow-md"
      >
        <svg className="w-5 h-5" viewBox="0 0 24 24">
          <path
            fill="#4285F4"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="#34A853"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="#FBBC05"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
          />
          <path
            fill="#EA4335"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
          />
        </svg>
        <span>{t('تسجيل الدخول بحساب قوقل', 'Sign in with Google')}</span>
      </button>

      <div className="relative mb-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-4 bg-white text-gray-500">
            {t('أو', 'or')}
          </span>
        </div>
      </div>

      <form onSubmit={handleEmailAuth}>
        {isSignUp && (
          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2">
              {t('الاسم الكامل', 'Full Name')}
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>
        )}

        <div className="mb-4">
          <label className="block text-gray-700 font-medium mb-2">
            {t('البريد الالكتروني', 'Email')}
          </label>
          <div className="relative">
            <Mail className={`absolute ${language === 'ar' ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400`} />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`w-full px-4 py-3 ${language === 'ar' ? 'pr-12' : 'pl-12'} border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
              required
            />
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-gray-700 font-medium mb-2">
            {t('كلمة المرور', 'Password')}
          </label>
          <div className="relative">
            <Lock className={`absolute ${language === 'ar' ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400`} />
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`w-full px-4 py-3 ${language === 'ar' ? 'pr-12 pl-12' : 'pl-12 pr-12'} border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
              required
              minLength={6}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className={`absolute ${language === 'ar' ? 'left-3' : 'right-3'} top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600`}
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {!isSignUp && (
          <button
            type="button"
            onClick={() => setShowForgotPassword(true)}
            className="text-blue-600 hover:text-blue-700 text-sm font-medium mb-4 block"
          >
            {t('نسيت كلمة المرور؟', 'Forgot password?')}
          </button>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
        >
          {loading && <Loader className="w-5 h-5 animate-spin" />}
          {isSignUp ? t('إنشاء حساب', 'Sign Up') : t('تسجيل الدخول', 'Sign In')}
        </button>
      </form>

      <div className="mt-6 text-center">
        <button
          onClick={() => {
            setIsSignUp(!isSignUp);
            setError('');
          }}
          className="text-blue-600 hover:text-blue-700 font-medium"
        >
          {isSignUp
            ? t('لديك حساب بالفعل؟ سجل دخول', 'Already have an account? Sign in')
            : t('ليس لديك حساب؟ أنشئ حساب', "Don't have an account? Sign up")
          }
        </button>
      </div>

      <div className="mt-4 text-center text-sm text-gray-500">
        {t('بالتسجيل، أنت توافق على شروط الخدمة', 'By signing in, you agree to our Terms of Service')}
      </div>
    </div>
  );
}
