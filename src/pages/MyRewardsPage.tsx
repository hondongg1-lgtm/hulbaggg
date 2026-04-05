import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Gift, Calendar, ChevronLeft, MapPin } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface Reward {
  id: string;
  prize_id: string;
  played_at: string;
  claim_code: string;
  is_claimed: boolean;
  prize: {
    name: string;
    description_ar: string;
    description_en: string;
    image_url: string;
  };
  campaign: {
    store_name: string;
    store_location: string;
  };
}

export default function MyRewardsPage({ userId, onBack }: { userId: string; onBack: () => void }) {
  const { language, t, dir } = useLanguage();
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRewards();
  }, [userId]);

  const loadRewards = async () => {
    try {
      setLoading(true);
      // Fetch prize claims for the user
      const { data, error } = await supabase
        .from('prize_claims')
        .select(`
          id,
          prize_id,
          claimed_at,
          claim_code,
          status,
          prize:prizes (
            name,
            description_ar,
            description_en,
            image_url
          ),
          campaign:campaigns (
            store_name,
            store_location
          )
        `)
        .eq('user_id', userId)
        .order('claimed_at', { ascending: false });

      if (error) throw error;
      
      // Map data to match the Reward interface
      const mappedRewards = (data || []).map((item: any) => ({
        ...item,
        played_at: item.claimed_at,
        is_claimed: item.status === 'redeemed'
      }));

      setRewards(mappedRewards);
    } catch (err) {
      console.error('Error loading rewards:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-700"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8" dir={dir}>
      <div className="flex items-center gap-4 mb-8">
        <button 
          onClick={onBack}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <ChevronLeft className={language === 'ar' ? 'rotate-180' : ''} />
        </button>
        <h1 className="text-2xl font-black text-gray-900">
          {t('جوائزي', 'My Rewards')}
        </h1>
      </div>

      {rewards.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl shadow-sm border border-gray-100">
          <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Gift className="w-10 h-10 text-gray-300" />
          </div>
          <p className="text-gray-500 font-medium">
            {t('لم تفز بأي جوائز بعد. استمر في اللعب!', "You haven't won any prizes yet. Keep playing!")}
          </p>
        </div>
      ) : (
        <div className="grid gap-6">
          {rewards.map((reward) => (
            <div 
              key={reward.id} 
              className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow relative overflow-hidden"
            >
              {/* Status Ribbon */}
              <div className={`absolute top-0 ${language === 'ar' ? 'left-0' : 'right-0'} px-4 py-1 text-xs font-bold text-white rounded-bl-xl ${reward.is_claimed ? 'bg-green-600' : 'bg-orange-500'}`}>
                {reward.is_claimed ? t('تم الاستلام', 'Claimed') : t('بانتظار الاستلام', 'Pending')}
              </div>

              <div className="flex flex-col md:flex-row gap-6">
                {/* Prize Image */}
                <div className="w-full md:w-32 h-32 bg-gray-50 rounded-xl flex items-center justify-center flex-shrink-0">
                  {reward.prize.image_url ? (
                    <img src={reward.prize.image_url} alt="" className="w-full h-full object-contain p-2" />
                  ) : (
                    <Gift className="w-12 h-12 text-green-700 opacity-20" />
                  )}
                </div>

                {/* Details */}
                <div className="flex-1 space-y-3">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">{reward.prize.name}</h3>
                    <p className="text-sm text-green-700 font-medium">{reward.campaign.store_name}</p>
                  </div>

                  <p className="text-gray-600 text-sm line-clamp-2">
                    {language === 'ar' ? reward.prize.description_ar : reward.prize.description_en}
                  </p>

                  <div className="flex flex-wrap gap-4 text-xs text-gray-500">
                    <div className="flex items-center gap-1">
                      <Calendar size={14} />
                      {new Date(reward.played_at).toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US')}
                    </div>
                    {reward.campaign.store_location && (
                      <a 
                        href={reward.campaign.store_location} 
                        target="_blank" 
                        rel="noreferrer"
                        className="flex items-center gap-1 text-blue-600 hover:underline"
                      >
                        <MapPin size={14} />
                        {t('موقع المتجر', 'Store Location')}
                      </a>
                    )}
                  </div>
                </div>

                {/* Claim Section */}
                <div className="md:w-48 bg-gray-50 rounded-xl p-4 flex flex-col justify-center items-center text-center space-y-2">
                  <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">
                    {t('كود الاستلام', 'Claim Code')}
                  </span>
                  <span className="text-xl font-black text-green-700 tracking-widest bg-white px-4 py-1 rounded-lg border border-green-100 shadow-sm">
                    {reward.claim_code}
                  </span>
                  <p className="text-[10px] text-gray-500 leading-tight">
                    {t('أظهر هذا الكود للموظف في المتجر لاستلام جائزتك', 'Show this code to the store staff to claim your prize')}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Info Section */}
      <div className="mt-12 bg-green-50 rounded-3xl p-8 border border-green-100">
        <h2 className="text-lg font-bold text-green-900 mb-4">{t('كيفية استلام الجوائز؟', 'How to claim prizes?')}</h2>
        <ul className="space-y-3">
          {[
            t('توجه إلى مقر المتجر المذكور أعلاه', 'Go to the store location mentioned above'),
            t('أخبر الموظف أنك فزت بجائزة من "حلول الحقيبة"', 'Tell the staff you won a prize from "Bag Solutions"'),
            t('أظهر له كود الاستلام الخاص بك', 'Show them your claim code'),
            t('سيقوم الموظف بتسليمك الجائزة وتأكيد الاستلام', 'The staff will hand over the prize and confirm receipt')
          ].map((step, i) => (
            <li key={i} className="flex gap-3 text-sm text-green-800">
              <span className="flex-shrink-0 w-5 h-5 bg-green-700 text-white rounded-full flex items-center justify-center text-[10px] font-bold">
                {i + 1}
              </span>
              {step}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
