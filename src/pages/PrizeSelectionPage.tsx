import { useState, useEffect } from 'react';
import { Gift, Sparkles, Trophy, Loader, PartyPopper } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { supabase } from '../lib/supabase';
import { Prize, Campaign } from '../types';

interface PrizeSelectionPageProps {
  campaignCode: string;
  userProfileId: string;
  onPrizeWon: (prizeId: string, claimCode: string) => void;
}

export default function PrizeSelectionPage({ campaignCode, userProfileId, onPrizeWon }: PrizeSelectionPageProps) {
  const { t, language } = useLanguage();
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [prizes, setPrizes] = useState<Prize[]>([]);
  const [loading, setLoading] = useState(true);
  const [spinning, setSpinning] = useState(false);
  const [wonPrize, setWonPrize] = useState<Prize | null>(null);

  useEffect(() => {
    loadCampaignAndPrizes();
  }, [campaignCode]);

  const loadCampaignAndPrizes = async () => {
    try {
      const { data: campaignData, error: campaignError } = await supabase
        .from('campaigns')
        .select('*')
        .eq('campaign_code', campaignCode)
        .eq('status', 'active')
        .maybeSingle();

      if (campaignError || !campaignData) {
        console.error('Campaign not found');
        return;
      }

      setCampaign(campaignData);

      const { data: prizesData, error: prizesError } = await supabase
        .from('prizes')
        .select('*')
        .eq('campaign_id', campaignData.id)
        .eq('is_active', true)
        .gt('remaining_quantity', 0);

      if (prizesError) throw prizesError;

      setPrizes(prizesData || []);
    } catch (error) {
      console.error('Error loading campaign:', error);
    } finally {
      setLoading(false);
    }
  };

  const determinePrize = (): Prize | null => {
    const random = Math.random();
    let cumulativeProbability = 0;

    const instantPrizes = prizes.filter(p => p.type === 'instant');
    const totalProbability = instantPrizes.reduce((sum, p) => sum + (0.1), 0);

    for (const prize of instantPrizes) {
      cumulativeProbability += 0.1;
      if (random < cumulativeProbability / totalProbability && prize.remaining_quantity > 0) {
        return prize;
      }
    }

    const pointsPrize = prizes.find(p => p.type === 'points');
    if (pointsPrize && pointsPrize.remaining_quantity > 0) {
      return pointsPrize;
    }

    return null;
  };

  const handleSpin = async () => {
    if (!campaign) return;

    setSpinning(true);

    await new Promise(resolve => setTimeout(resolve, 2000));

    const prize = determinePrize();

    if (prize) {
      try {
        const { data: qrCode } = await supabase
          .from('qr_codes')
          .select('*')
          .eq('campaign_id', campaign.id)
          .eq('is_active', true)
          .maybeSingle();

        const { data: scanData, error: scanError } = await supabase
          .from('scans')
          .insert({
            user_profile_id: userProfileId,
            campaign_id: campaign.id,
            qr_code_id: qrCode?.id,
            prize_id: prize.id,
            claim_code: Math.random().toString(36).substring(2, 10).toUpperCase(),
            status: 'won',
          })
          .select()
          .single();

        if (scanError) throw scanError;

        await supabase
          .from('prizes')
          .update({ remaining_quantity: prize.remaining_quantity - 1 })
          .eq('id', prize.id);

        if (prize.type === 'points') {
          await supabase
            .from('user_profiles')
            .update({
              total_points: supabase.raw('total_points + ?', [prize.points_value]),
              total_scans: supabase.raw('total_scans + 1'),
            })
            .eq('id', userProfileId);
        } else {
          await supabase
            .from('user_profiles')
            .update({ total_scans: supabase.raw('total_scans + 1') })
            .eq('id', userProfileId);
        }

        setWonPrize(prize);
        onPrizeWon(prize.id, scanData.claim_code);
      } catch (error) {
        console.error('Error recording win:', error);
      }
    }

    setSpinning(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
        <Loader className="w-12 h-12 animate-spin text-blue-600" />
      </div>
    );
  }

  if (wonPrize) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="mb-6">
            <PartyPopper className="w-24 h-24 text-yellow-500 mx-auto animate-bounce" />
          </div>

          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {t('مبروك!', 'Congratulations!')}
          </h1>

          <p className="text-xl text-gray-700 mb-6">
            {t('لقد ربحت:', 'You won:')}
          </p>

          <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl p-6 mb-6 border-2 border-yellow-200">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {language === 'ar' ? wonPrize.name_ar : wonPrize.name_en}
            </h2>
            {wonPrize.type === 'points' && (
              <p className="text-4xl font-bold text-orange-600">
                {wonPrize.points_value} {t('نقطة', 'Points')}
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              {language === 'ar' ? campaign?.name_ar : campaign?.name_en}
            </h1>
            <p className="text-lg text-gray-600">
              {language === 'ar' ? campaign?.description_ar : campaign?.description_en}
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                {t('الجوائز المتاحة', 'Available Prizes')}
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {prizes.filter(p => p.type === 'instant').map((prize) => (
                <div
                  key={prize.id}
                  className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border-2 border-green-200"
                >
                  <div className="flex justify-center mb-4">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                      <Gift className="w-8 h-8 text-green-600" />
                    </div>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 text-center mb-2">
                    {language === 'ar' ? prize.name_ar : prize.name_en}
                  </h3>
                  <p className="text-sm text-gray-600 text-center">
                    {t('جائزة فورية', 'Instant Prize')}
                  </p>
                  <div className="mt-4 text-center">
                    <span className="inline-block px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                      {prize.remaining_quantity} {t('متبقي', 'remaining')}
                    </span>
                  </div>
                </div>
              ))}

              {prizes.filter(p => p.type === 'points').map((prize) => (
                <div
                  key={prize.id}
                  className="bg-gradient-to-br from-yellow-50 to-amber-50 rounded-xl p-6 border-2 border-yellow-200"
                >
                  <div className="flex justify-center mb-4">
                    <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center">
                      <Sparkles className="w-8 h-8 text-yellow-600" />
                    </div>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 text-center mb-2">
                    {language === 'ar' ? prize.name_ar : prize.name_en}
                  </h3>
                  <p className="text-2xl font-bold text-orange-600 text-center mb-2">
                    {prize.points_value} {t('نقطة', 'Points')}
                  </p>
                  <p className="text-sm text-gray-600 text-center">
                    {t('نقاط تراكمية', 'Accumulative Points')}
                  </p>
                </div>
              ))}

              {prizes.filter(p => p.type === 'raffle').map((prize) => (
                <div
                  key={prize.id}
                  className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 border-2 border-purple-200"
                >
                  <div className="flex justify-center mb-4">
                    <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center">
                      <Trophy className="w-8 h-8 text-purple-600" />
                    </div>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 text-center mb-2">
                    {language === 'ar' ? prize.name_ar : prize.name_en}
                  </h3>
                  <p className="text-sm text-gray-600 text-center">
                    {t('سحب شهري', 'Monthly Raffle')}
                  </p>
                </div>
              ))}
            </div>

            <div className="text-center">
              <button
                onClick={handleSpin}
                disabled={spinning}
                className="px-12 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl text-xl font-bold shadow-lg hover:shadow-xl transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {spinning ? (
                  <span className="flex items-center gap-3">
                    <Loader className="w-6 h-6 animate-spin" />
                    {t('جاري السحب...', 'Spinning...')}
                  </span>
                ) : (
                  <span>{t('اسحب الآن!', 'Spin Now!')}</span>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
