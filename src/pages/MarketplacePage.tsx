import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Store, Clock, Gift, Sparkles } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { SkeletonMarketplace } from '../components/SkeletonLoader';

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
  neighborhood_id?: string;
  neighborhoods?: {
    id: string;
    name_ar: string;
    name_en: string;
  };
  prizes: {
    name: string;
    prize_type: string;
  }[];
  can_play: boolean;
  attempts_today: number;
  daily_limit: number;
}

export default function MarketplacePage({ userId, onSelectCampaign }: {
  userId: string;
  onSelectCampaign: (campaignId: string) => void;
}) {
  const { language } = useLanguage();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedNeighborhood, setSelectedNeighborhood] = useState<string>('all');
  const [neighborhoods, setNeighborhoods] = useState<any[]>([]);

  useEffect(() => {
    loadData();
  }, [selectedNeighborhood]);


  const loadData = async () => {
    try {
      // Load neighborhoods
      const { data: nbData } = await supabase
        .from('neighborhoods')
        .select('*')
        .order('name_ar');

      if (nbData) setNeighborhoods(nbData);

      // Load campaigns with neighborhood info
      let query = supabase
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
          neighborhood_id,
          neighborhoods(
            id,
            name_ar,
            name_en
          ),
          prizes (
            name,
            prize_type,
            quantity_remaining
          )
        `)
        .eq('status', 'active')
        .gt('end_date', new Date().toISOString());

      if (selectedNeighborhood !== 'all') {
        query = query.eq('neighborhood_id', selectedNeighborhood);
      }

      const { data: campaignsData } = await query;

      if (campaignsData) {
        // Check if user has played ANY campaign today (one campaign per day limit)
        const { count: totalPlaysToday } = await supabase
          .from('game_attempts')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', userId)
          .gte('played_at', new Date(new Date().setHours(0, 0, 0, 0)).toISOString());

        const hasPlayedToday = (totalPlaysToday || 0) > 0;

        // Check play status for each campaign
        const campaignsWithStatus = await Promise.all(
          campaignsData.map(async (campaign) => {
            // Count today's attempts for this specific campaign
            const { count } = await supabase
              .from('game_attempts')
              .select('*', { count: 'exact', head: true })
              .eq('user_id', userId)
              .eq('campaign_id', campaign.id)
              .gte('played_at', new Date(new Date().setHours(0, 0, 0, 0)).toISOString());

            const attemptsToday = count || 0;
            const canPlay = !hasPlayedToday && attemptsToday < (campaign.daily_attempts_per_user || 1);

            return {
              ...campaign,
              can_play: canPlay,
              attempts_today: attemptsToday,
              daily_limit: campaign.daily_attempts_per_user || 1
            };
          })
        );

        setCampaigns(campaignsWithStatus as any);
      }
    } catch (error) {
      console.error('Error loading campaigns:', error);
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
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 p-4 animate-fade-in">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6 h-32 bg-white/50 rounded-2xl animate-pulse"></div>
          <SkeletonMarketplace />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 pb-20 animate-fade-in" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      {/* Neighborhood Filter - Mobile Sticky */}
      <div className="bg-white/60 backdrop-blur-sm sticky top-[64px] z-20 border-b border-green-100 px-4 py-3">
        <div className="max-w-6xl mx-auto flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          <button
            onClick={() => setSelectedNeighborhood('all')}
            className={`px-4 py-2 rounded-xl whitespace-nowrap transition-all duration-300 font-bold text-xs sm:text-sm transform hover:scale-105 active:scale-95 ${
              selectedNeighborhood === 'all'
                ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg shadow-green-500/30'
                : 'bg-white text-gray-600 border border-gray-100 hover:bg-green-50'
            }`}
          >
            {language === 'ar' ? 'الكل' : 'All'}
          </button>
          {neighborhoods.map((nb) => (
            <button
              key={nb.id}
              onClick={() => setSelectedNeighborhood(nb.id)}
              className={`px-4 py-2 rounded-xl whitespace-nowrap transition-all duration-300 font-bold text-xs sm:text-sm transform hover:scale-105 active:scale-95 ${
                selectedNeighborhood === nb.id
                  ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg shadow-green-500/30'
                  : 'bg-white text-gray-600 border border-gray-100 hover:bg-green-50'
              }`}
            >
              {language === 'ar' ? nb.name_ar : nb.name_en}
            </button>
          ))}
        </div>
      </div>

      {/* Campaigns Grid */}
      <div className="max-w-6xl mx-auto px-4 py-4">
        {campaigns.length === 0 ? (
          <div className="text-center py-12">
            <Store className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">
              {language === 'ar' ? 'لا توجد عروض متاحة في هذا الحي حالياً' : 'No offers available in this neighborhood'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {campaigns.map((campaign, index) => (
              <div
                key={campaign.id}
                onClick={() => onSelectCampaign(campaign.id)}
                className="bg-white rounded-2xl shadow-md hover:shadow-2xl transition-all duration-300 overflow-hidden border-2 border-gray-100 hover:border-green-400 cursor-pointer group transform hover:-translate-y-2 animate-fade-in"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <div className="h-28 bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center p-4 relative overflow-hidden group-hover:from-green-500 group-hover:to-emerald-600 transition-all duration-300">
                  <div className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-all duration-300"></div>
                  {campaign.logo_url ? (
                    <img
                      src={campaign.logo_url}
                      alt={campaign.store_name}
                      className="h-20 w-20 object-contain drop-shadow-2xl bg-white/95 rounded-xl p-2 transform group-hover:scale-110 transition-transform duration-300 relative z-10"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        const parent = target.parentElement;
                        if (parent) {
                          const fallback = document.createElement('div');
                          fallback.className = 'text-4xl relative z-10';
                          fallback.textContent = getBusinessTypeIcon(campaign.business_type);
                          parent.appendChild(fallback);
                        }
                      }}
                    />
                  ) : (
                    <div className="text-4xl transform group-hover:scale-110 transition-transform duration-300 relative z-10">
                      {getBusinessTypeIcon(campaign.business_type)}
                    </div>
                  )}
                </div>

                <div className="p-4">
                  <h3 className="text-sm font-bold text-gray-900 mb-2 line-clamp-1 group-hover:text-green-600 transition-colors">
                    {campaign.store_name}
                  </h3>

                  {campaign.neighborhoods && (
                    <div className="text-xs text-gray-500 mb-2 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                      {language === 'ar' ? campaign.neighborhoods.name_ar : campaign.neighborhoods.name_en}
                    </div>
                  )}

                  {campaign.prizes && campaign.prizes.length > 0 && (
                    <div className="flex items-center gap-1.5 text-xs text-green-600 mb-3 bg-green-50 rounded-lg px-2 py-1.5">
                      <Gift className="w-3.5 h-3.5" />
                      <span className="font-bold">
                        {campaign.prizes.length} {language === 'ar' ? 'جائزة' : 'prizes'}
                      </span>
                      <Sparkles className="w-3 h-3 ml-auto" />
                    </div>
                  )}

                  {campaign.can_play ? (
                    <div className="py-2.5 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl text-center text-xs font-bold shadow-lg group-hover:shadow-xl transition-all duration-300 relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                      <span className="relative z-10">
                        {language === 'ar' ? '⚡ العب الآن' : '⚡ Play Now'}
                      </span>
                    </div>
                  ) : (
                    <div className="py-2.5 bg-gray-100 text-gray-500 rounded-xl text-center text-xs font-semibold flex items-center justify-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" />
                      {language === 'ar' ? 'عد غداً' : 'Tomorrow'}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
