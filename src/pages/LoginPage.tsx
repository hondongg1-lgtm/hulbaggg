import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Lock, Mail, Shield, Users, ArrowRight, Eye, EyeOff, UserPlus } from 'lucide-react';

interface LoginPageProps {
  onLoginSuccess: (userId: string, role: 'admin' | 'advertiser') => void;
}

export default function LoginPage({ onLoginSuccess }: LoginPageProps) {
  const [loginType, setLoginType] = useState<'admin' | 'advertiser'>('advertiser');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: ''
  });


  const handleGoogleLogin = async () => {
    setLoading(true);
    setError('');

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          }
        }
      });

      if (error) throw error;
    } catch (err: any) {
      setError('فشل تسجيل الدخول بقوقل');
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (loginType === 'admin') {
        if (isSignUp) {
          setError('لا يمكن إنشاء حساب إداري جديد');
          setLoading(false);
          return;
        }

        if (formData.email !== 'hondongg1@gmail.com') {
          setError('غير مصرح لك بالدخول كمدير');
          setLoading(false);
          return;
        }

        const { data, error: signInError } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        });

        if (signInError) {
          setError('البريد الإلكتروني أو كلمة المرور غير صحيحة');
          setLoading(false);
          return;
        }

        if (data.user) {
          const { data: roleData } = await supabase
            .from('user_roles')
            .select('role')
            .eq('user_id', data.user.id)
            .maybeSingle();

          if (roleData?.role === 'admin') {
            onLoginSuccess(data.user.id, 'admin');
          } else {
            setError('غير مصرح لك بالدخول كمدير');
            await supabase.auth.signOut();
          }
        }
      } else {
        if (isSignUp) {
          console.log('Starting signup...');
          const { data: authData, error: signUpError } = await supabase.auth.signUp({
            email: formData.email,
            password: formData.password,
            options: {
              data: {
                full_name: formData.fullName,
                user_type: 'advertiser'
              },
              emailRedirectTo: undefined
            }
          });

          console.log('Signup completed:', authData?.user?.id);

          if (signUpError) {
            console.error('Signup error:', signUpError);
            setError(signUpError.message || 'فشل إنشاء الحساب');
            setLoading(false);
            return;
          }

          if (authData.user) {
            console.log('Creating profile and role...');
            try {
              await Promise.all([
                supabase.from('user_profiles').insert({
                  user_id: authData.user.id,
                  email: formData.email,
                  full_name: formData.fullName,
                  auth_provider: 'email',
                  is_verified: true
                }),
                supabase.from('user_roles').insert({
                  user_id: authData.user.id,
                  email: formData.email,
                  role: 'advertiser',
                  is_active: true
                })
              ]);

              console.log('Profile and role created, calling onLoginSuccess');
              onLoginSuccess(authData.user.id, 'advertiser');
            } catch (insertError) {
              console.error('Insert error:', insertError);
              setError('فشل في حفظ البيانات');
              setLoading(false);
            }
          }
        } else {
          const { data, error: signInError } = await supabase.auth.signInWithPassword({
            email: formData.email,
            password: formData.password,
          });

          if (signInError) {
            setError('البريد الإلكتروني أو كلمة المرور غير صحيحة');
            setLoading(false);
            return;
          }

          if (data.user) {
            const { data: roleData } = await supabase
              .from('user_roles')
              .select('role')
              .eq('user_id', data.user.id)
              .maybeSingle();

            if (roleData?.role === 'advertiser') {
              onLoginSuccess(data.user.id, 'advertiser');

              supabase
                .from('user_roles')
                .update({ last_login: new Date().toISOString() })
                .eq('user_id', data.user.id)
                .then(() => {});
            } else {
              setError('هذا الحساب غير مصرح له بالدخول');
              await supabase.auth.signOut();
              setLoading(false);
            }
          }
        }
      }
    } catch (err: any) {
      setError(err.message || 'حدث خطأ، حاول مرة أخرى');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-emerald-900 to-slate-900 flex items-center justify-center p-4" dir="rtl">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <img
            src="/Gemini_Generated_Image_sfh2jysfh2jysfh2_(1).png"
            alt="حلول الحقيبة"
            className="h-20 w-auto mx-auto mb-4"
          />
          <h1 className="text-3xl font-black text-white mb-2">تسجيل الدخول</h1>
          <p className="text-emerald-200">ادخل إلى لوحة التحكم الخاصة بك</p>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <div className="flex gap-2 mb-6 bg-slate-100 rounded-xl p-1">
            <button
              onClick={() => setLoginType('advertiser')}
              className={`flex-1 py-3 rounded-lg font-bold transition-all ${
                loginType === 'advertiser'
                  ? 'bg-emerald-600 text-white shadow-lg'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <Users size={18} />
                <span>معلن</span>
              </div>
            </button>
            <button
              onClick={() => setLoginType('admin')}
              className={`flex-1 py-3 rounded-lg font-bold transition-all ${
                loginType === 'admin'
                  ? 'bg-emerald-600 text-white shadow-lg'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <Shield size={18} />
                <span>إدارة</span>
              </div>
            </button>
          </div>

          {loginType === 'advertiser' && (
            <>
              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={loading}
                className="w-full px-6 py-3 bg-white border-2 border-slate-300 hover:border-emerald-500 hover:bg-emerald-50 text-slate-700 rounded-lg font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 mb-4 shadow-sm hover:shadow-md"
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
                <span>تسجيل الدخول بحساب قوقل</span>
              </button>

              <div className="relative mb-5">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white text-slate-500 font-semibold">أو</span>
                </div>
              </div>
            </>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {isSignUp && loginType === 'advertiser' && (
              <div>
                <label className="block text-sm font-bold text-slate-900 mb-2">
                  الاسم الكامل
                </label>
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-slate-300 rounded-lg focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200 transition-all"
                  placeholder="أدخل اسمك الكامل"
                  required
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-bold text-slate-900 mb-2">
                البريد الإلكتروني
              </label>
              <div className="relative">
                <Mail className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full pr-12 pl-4 py-3 border-2 border-slate-300 rounded-lg focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200 transition-all"
                  placeholder="email@example.com"
                  dir="ltr"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-900 mb-2">
                كلمة المرور
              </label>
              <div className="relative">
                <Lock className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full pr-12 pl-12 py-3 border-2 border-slate-300 rounded-lg focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200 transition-all"
                  placeholder="••••••••"
                  dir="ltr"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border-2 border-red-200 rounded-lg p-3 text-red-700 text-sm font-semibold text-center">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-emerald-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <span>{isSignUp ? 'جاري إنشاء الحساب...' : 'جاري تسجيل الدخول...'}</span>
              ) : (
                <>
                  <span>{isSignUp ? 'إنشاء حساب' : 'دخول'}</span>
                  {isSignUp ? <UserPlus size={20} /> : <ArrowRight size={20} />}
                </>
              )}
            </button>
          </form>

          {loginType === 'advertiser' && (
            <div className="mt-6 text-center">
              <button
                onClick={() => {
                  setIsSignUp(!isSignUp);
                  setError('');
                  setFormData({ email: '', password: '', fullName: '' });
                }}
                className="text-emerald-600 hover:text-emerald-700 font-bold transition-colors"
              >
                {isSignUp ? 'لديك حساب بالفعل؟ سجل دخول' : 'ليس لديك حساب؟ أنشئ حساب'}
              </button>
            </div>
          )}

          <div className="mt-4 text-center">
            <a
              href="/"
              className="text-sm text-slate-600 hover:text-emerald-600 font-semibold transition-colors"
            >
              العودة للصفحة الرئيسية
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
