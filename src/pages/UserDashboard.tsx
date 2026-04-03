import { useEffect, useState } from 'react';
import { Trophy, Gift, History, ArrowRight, ArrowLeft, User } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { supabase } from '../lib/supabase';
import { UserProfile, Scan, Prize } from '../types';

interface UserDashboardProps {
  userProfileId: string;
  onBack: () => void;
}

export default function UserDashboard({ userProfileId, onBack }: UserDashboardProps) {
  const { t, language, dir } = useLanguage();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [recentScans, setRecentScans] = useState<(Scan & { prize?: Prize })[]>([]);
  const [loading, setLoading] = useState(true);

  const BackIcon = dir === 'rtl' ? ArrowRight : ArrowLeft;

  useEffect(() => {
    loadUserData();
  }, [userProfileId]);

  const loadUserData = async () => {
    try {
      const { data: profileData } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userProfileId)
        .single();

      if (profileData) setProfile(profileData);

      const { data: scansData } = await supabase
        .from('scans')
        .select(`
          *,
          prize:prizes(*)
        `)
        .eq('user_profile_id', userProfileId)
        .order('scanned_at', { ascending: false })
        .limit(10);

      if (scansData) setRecentScans(scansData as any);
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">{t('جاري التحميل...', 'Loading...')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-8">
      <div className="container mx-auto px-4">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-700 hover:text-gray-900 mb-6 transition-colors"
        >
          <BackIcon className="w-5 h-5" />
          <span className="font-medium">{t('رجوع', 'Back')}</span>
        </button>

        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                <User className="w-8 h-8 text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {t('ملفي الشخصي', 'My Profile')}
                </h1>
                <p className="text-gray-600">{profile?.phone}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl p-6 border-2 border-yellow-200">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                    <Trophy className="w-5 h-5 text-yellow-600" />
                  </div>
                  <span className="text-sm font-medium text-gray-600">
                    {t('النقاط الكلية', 'Total Points')}
                  </span>
                </div>
                <p className="text-4xl font-bold text-orange-600">
                  {profile?.total_points || 0}
                </p>
              </div>

              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border-2 border-green-200">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <Gift className="w-5 h-5 text-green-600" />
                  </div>
                  <span className="text-sm font-medium text-gray-600">
                    {t('عدد الجوائز', 'Total Prizes')}
                  </span>
                </div>
                <p className="text-4xl font-bold text-green-600">
                  {recentScans.filter(s => s.prize_id).length}
                </p>
              </div>

              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border-2 border-blue-200">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <History className="w-5 h-5 text-blue-600" />
                  </div>
                  <span className="text-sm font-medium text-gray-600">
                    {t('عدد المسحات', 'Total Scans')}
                  </span>
                </div>
                <p className="text-4xl font-bold text-blue-600">
                  {profile?.total_scans || 0}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              {t('سجل المسحات', 'Scan History')}
            </h2>

            {recentScans.length === 0 ? (
              <div className="text-center py-12">
                <History className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">
                  {t('لا توجد مسحات بعد', 'No scans yet')}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {recentScans.map((scan) => (
                  <div
                    key={scan.id}
                    className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          {scan.prize_id && (
                            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                              <Gift className="w-5 h-5 text-green-600" />
                            </div>
                          )}
                          <div>
                            <h3 className="font-semibold text-gray-900">
                              {scan.prize_id && scan.prize
                                ? (language === 'ar' ? scan.prize.name_ar : scan.prize.name_en)
                                : t('مسح عادي', 'Regular Scan')}
                            </h3>
                            <p className="text-sm text-gray-500">
                              {new Date(scan.scanned_at).toLocaleDateString(
                                language === 'ar' ? 'ar-SA' : 'en-US',
                                { year: 'numeric', month: 'long', day: 'numeric' }
                              )}
                            </p>
                          </div>
                        </div>

                        {scan.claim_code && (
                          <div className="bg-gray-50 rounded px-3 py-2 inline-block">
                            <span className="text-sm text-gray-600">
                              {t('كود الاستلام:', 'Claim Code:')}
                            </span>
                            <span className="text-sm font-mono font-bold text-gray-900 ml-2">
                              {scan.claim_code}
                            </span>
                          </div>
                        )}
                      </div>

                      <div>
                        <span
                          className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                            scan.status === 'won'
                              ? 'bg-green-100 text-green-700'
                              : scan.status === 'claimed'
                              ? 'bg-blue-100 text-blue-700'
                              : scan.status === 'expired'
                              ? 'bg-red-100 text-red-700'
                              : 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          {scan.status === 'won' && t('فائز', 'Won')}
                          {scan.status === 'claimed' && t('مستلم', 'Claimed')}
                          {scan.status === 'expired' && t('منتهي', 'Expired')}
                          {scan.status === 'scanned' && t('ممسوح', 'Scanned')}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
