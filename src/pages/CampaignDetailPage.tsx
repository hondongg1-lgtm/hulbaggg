import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { ArrowLeft, MapPin, Gift, Clock, ExternalLink, Sparkles, Trophy } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface Prize {
  id: string;
  name: string;
  prize_type: string;
  quantity_remaining: number;
}

interface Campaign {
  id: string;
  store_name: string;
  business_type: string;
  description: string;
  logo_url?: string;
  latitude?: number;
  longitude?: number;
  neighborhood?: string;
  store_location?: string;
  daily_attempts_per_user: number;
  prizes: Prize[];
}

export default function CampaignDetailPage({
  campaignId,
  userId,
  onBack,
  onPlayGame
}: {
  campaignId: string;
  userId: string;
  onBack: () => void;
  onPlayGame: (campaignId: string) => void;
}) {
  const { language } = useLanguage();
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [loading, setLoading] = useState(true);
  const [canPlay, setCanPlay] = useState(false);

  useEffect(() => {
    loadCampaignDetails();
  }, [campaignId]);

  const loadCampaignDetails = async () => {
    try {
      const { data: campaignData } = await supabase
        .from('campaigns')
        .select(`
          id,
          store_name,
          business_type,
          description,
          store_location,
          logo_url,
          latitude,
          longitude,
          neighborhood,
          daily_attempts_per_user,
          prizes (
            id,
            name,
            prize_type,
            quantity_remaining
          )
        `)
        .eq('id', campaignId)
        .single();

      if (campaignData) {
        setCampaign(campaignData as Campaign);

        const { count: totalPlaysToday } = await supabase
          .from('game_attempts')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', userId)
          .gte('played_at', new Date().setHours(0, 0, 0, 0));

        const hasPlayedToday = (totalPlaysToday || 0) > 0;

        const { count } = await supabase
          .from('game_attempts')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', userId)
          .eq('campaign_id', campaignId)
          .gte('played_at', new Date().setHours(0, 0, 0, 0));

        const attemptsToday = count || 0;
        setCanPlay(!hasPlayedToday && attemptsToday < (campaignData.daily_attempts_per_user || 1));
      }
    } catch (error) {
      console.error('Error loading campaign:', error);
    } finally {
      setLoading(false);
    }
  };

  const getBusinessTypeIcon = (type: string) => {
    const icons: any = {
      restaurant: '🍽️',
      cafe: '☕',
      pharmacy: '💊',
      grocery: '🛒',
      fashion: '👗',
      electronics: '📱',
      furniture: '🛋️',
      other: '🏪'
    };
    return icons[type] || '🏪';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 p-4 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 p-4 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">{language === 'ar' ? 'لم يتم العثور على الحملة' : 'Campaign not found'}</p>
          <button onClick={onBack} className="mt-4 text-orange-600 font-semibold">
            {language === 'ar' ? 'العودة' : 'Go Back'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 pb-20" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      <div className="bg-white shadow-md sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-gray-700 hover:text-orange-600 transition-colors"
          >
            <ArrowLeft className={`w-5 h-5 ${language === 'ar' ? 'rotate-180' : ''}`} />
            <span className="font-semibold">{language === 'ar' ? 'العودة' : 'Back'}</span>
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="h-48 bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center p-6 relative">
            {campaign.logo_url ? (
              <img
                src={campaign.logo_url}
                alt={campaign.store_name}
                className="h-32 w-32 object-contain drop-shadow-2xl bg-white/90 rounded-2xl p-4"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  const parent = target.parentElement;
                  if (parent) {
                    const fallback = document.createElement('div');
                    fallback.className = 'text-7xl';
                    fallback.textContent = getBusinessTypeIcon(campaign.business_type);
                    parent.appendChild(fallback);
                  }
                }}
              />
            ) : (
              <div className="text-7xl">{getBusinessTypeIcon(campaign.business_type)}</div>
            )}
            <div className="absolute top-4 right-4">
              <div className="bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-full">
                <span className="text-white text-xs font-bold">{campaign.business_type}</span>
              </div>
            </div>
          </div>

          <div className="p-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {campaign.store_name}
            </h1>

            {(campaign.neighborhood || campaign.store_location) && (
              <button
                onClick={() => {
                  if (campaign.latitude && campaign.longitude) {
                    window.open(`https://www.google.com/maps?q=${campaign.latitude},${campaign.longitude}`, '_blank');
                  }
                }}
                className={`flex items-center gap-2 bg-orange-50 hover:bg-orange-100 px-4 py-2 rounded-lg text-sm font-semibold text-orange-700 transition-all mb-4 ${
                  campaign.latitude && campaign.longitude ? 'cursor-pointer' : ''
                }`}
                disabled={!campaign.latitude || !campaign.longitude}
              >
                <MapPin className="w-4 h-4" />
                <span>{campaign.neighborhood || campaign.store_location}</span>
                {campaign.latitude && campaign.longitude && (
                  <ExternalLink className="w-3.5 h-3.5" />
                )}
              </button>
            )}

            <div className="bg-gray-50 rounded-xl p-4 mb-6">
              <p className="text-gray-700 leading-relaxed">
                {campaign.description}
              </p>
            </div>

            <div className="border-t border-gray-200 pt-6 mb-6">
              <div className="flex items-center gap-2 mb-4">
                <Trophy className="w-6 h-6 text-orange-600" />
                <h2 className="text-xl font-bold text-gray-900">
                  {language === 'ar' ? 'الجوائز المتاحة' : 'Available Prizes'}
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {campaign.prizes && campaign.prizes.length > 0 ? (
                  campaign.prizes.map((prize) => (
                    <div
                      key={prize.id}
                      className="bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-orange-200 rounded-xl p-4 flex items-start gap-3"
                    >
                      <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center flex-shrink-0">
                        <Gift className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-gray-900 mb-1">{prize.name}</h3>
                        <div className="flex items-center gap-2 text-xs">
                          <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded-full font-semibold">
                            {prize.prize_type === 'discount'
                              ? (language === 'ar' ? 'خصم' : 'Discount')
                              : (language === 'ar' ? 'منتج' : 'Product')}
                          </span>
                          <span className="text-gray-600">
                            {language === 'ar' ? `${prize.quantity_remaining} متبقي` : `${prize.quantity_remaining} left`}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="col-span-2 text-center py-8 text-gray-500">
                    {language === 'ar' ? 'لا توجد جوائز متاحة حالياً' : 'No prizes available'}
                  </div>
                )}
              </div>
            </div>

            {canPlay ? (
              <button
                onClick={() => onPlayGame(campaign.id)}
                className="w-full py-4 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white rounded-xl font-bold text-lg transition-all shadow-lg flex items-center justify-center gap-2"
              >
                <Sparkles className="w-5 h-5" />
                {language === 'ar' ? 'جرّب حظك الآن!' : 'Try Your Luck Now!'}
              </button>
            ) : (
              <div className="w-full py-4 bg-gray-100 rounded-xl flex items-center justify-center gap-2">
                <Clock className="w-5 h-5 text-gray-500" />
                <span className="font-bold text-gray-600">
                  {language === 'ar' ? 'عد غداً للعب مرة أخرى' : 'Come back tomorrow to play again'}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
