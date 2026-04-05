import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import {
  Package, PlusCircle, TrendingUp, Users, Eye, MapPin,
  Clock, CheckCircle, XCircle, PlayCircle, PauseCircle, Trash2, Gift, CreditCard, QrCode
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { QRCodeSVG } from 'qrcode.react';

interface NewAdvertiserDashboardProps {
  advertiserId: string;
}

interface Campaign {
  id: string;
  store_name: string;
  business_type: string;
  description: string;
  status: string;
  bags_distributed: number;
  distribution_locations: any[];
  start_date: string;
  end_date: string;
  created_at: string;
  approval_notes: string;
  approved_at: string;
}

interface CampaignStats {
  total_plays: number;
  total_wins: number;
  total_redeemed: number;
  win_rate: number;
}

export default function NewAdvertiserDashboard({ advertiserId }: NewAdvertiserDashboardProps) {
  const { language } = useLanguage();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [campaignStats, setCampaignStats] = useState<Record<string, CampaignStats>>({});
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentData, setPaymentData] = useState({
    clientName: '',
    clientMobile: '',
    amount: 0
  });

  const [newCampaign, setNewCampaign] = useState({
    store_name: '',
    business_type: 'grocery',
    description: '',
    store_location: '',
    logo_url: '',
    latitude: null as number | null,
    longitude: null as number | null,
    neighborhood: '',
    start_date: '',
    end_date: '',
    bags_count: 1000,
    duration_preset: 'month',
    win_probability: 10,
    consolation_prize: 'خصم 2 ريال',
    consolation_discount: 2,
    total_prize_pool: 100
  });

  const [neighborhoods, setNeighborhoods] = useState<string[]>([]);

  const [prizes, setPrizes] = useState<Array<{
    name_ar: string;
    name_en: string;
    description_ar: string;
    description_en: string;
    quantity: number;
    value: number;
  }>>([]);

  useEffect(() => {
    loadData();
  }, []);

  const handleDurationPresetChange = (preset: string) => {
    const today = new Date();
    const startDate = today.toISOString().split('T')[0];
    let endDate = new Date(today);

    switch (preset) {
      case 'week':
        endDate.setDate(today.getDate() + 7);
        break;
      case 'month':
        endDate.setMonth(today.getMonth() + 1);
        break;
      case '3months':
        endDate.setMonth(today.getMonth() + 3);
        break;
    }

    setNewCampaign({
      ...newCampaign,
      duration_preset: preset,
      start_date: startDate,
      end_date: endDate.toISOString().split('T')[0]
    });
  };

  const addPrize = () => {
    setPrizes([...prizes, {
      name_ar: '',
      name_en: '',
      description_ar: '',
      description_en: '',
      quantity: 10,
      value: 50
    }]);
  };

  const removePrize = (index: number) => {
    setPrizes(prizes.filter((_, i) => i !== index));
  };

  const updatePrize = (index: number, field: string, value: any) => {
    const updated = [...prizes];
    updated[index] = { ...updated[index], [field]: value };
    setPrizes(updated);
  };

  const addNeighborhood = () => {
    const maxNeighborhoods = Math.floor(newCampaign.bags_count / 1000);
    if (neighborhoods.length < maxNeighborhoods) {
      setNeighborhoods([...neighborhoods, '']);
    }
  };

  const removeNeighborhood = (index: number) => {
    setNeighborhoods(neighborhoods.filter((_, i) => i !== index));
  };

  const updateNeighborhood = (index: number, value: string) => {
    const updated = [...neighborhoods];
    updated[index] = value;
    setNeighborhoods(updated);
  };

  const getMaxNeighborhoods = () => Math.floor(newCampaign.bags_count / 1000);

  const handlePayment = async (campaign: Campaign) => {
    setSelectedCampaign(campaign);
    setPaymentData({
      clientName: '',
      clientMobile: '',
      amount: 0
    });
    setShowPaymentModal(true);
  };

  const processPayment = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedCampaign) return;

    if (!paymentData.clientName.trim() || !paymentData.clientMobile.trim() || paymentData.amount <= 0) {
      alert(language === 'ar' ? 'الرجاء ملء جميع الحقول' : 'Please fill all fields');
      return;
    }

    const message = language === 'ar'
      ? `مرحباً، أود الاستفسار عن الحملة الإعلانية:\n\nالاسم: ${paymentData.clientName}\nرقم الجوال: ${paymentData.clientMobile}\nاسم المتجر: ${selectedCampaign.store_name}\nالمبلغ: ${paymentData.amount} ريال`
      : `Hello, I would like to inquire about the advertising campaign:\n\nName: ${paymentData.clientName}\nMobile: ${paymentData.clientMobile}\nStore Name: ${selectedCampaign.store_name}\nAmount: ${paymentData.amount} SAR`;

    const whatsappUrl = `https://wa.me/YOUR_PHONE_NUMBER?text=${encodeURIComponent(message)}`;

    window.open(whatsappUrl, '_blank');
    setShowPaymentModal(false);
  };

  const loadData = async () => {
    try {
      // 1. Verify/Create advertiser profile automatically
      const { data: profileCheck, error: checkError } = await supabase
        .from('advertiser_accounts')
        .select('*')
        .eq('id', advertiserId)
        .maybeSingle();

      if (checkError) console.error('Profile check error:', checkError);

      if (!profileCheck) {
        // If not found, fetch from user_profiles to sync
        const { data: userData } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('id', advertiserId)
          .maybeSingle();

        if (userData) {
          await supabase.from('advertiser_accounts').insert({
            id: advertiserId,
            username: userData.email,
            email: userData.email,
            full_name: userData.full_name || '',
            business_name: userData.full_name || '',
            password: 'PROMOTED_AUTO_SYNC',
            is_active: true
          });
        }
      }

      // 2. Load campaigns
      const { data: campData } = await supabase
        .from('campaigns')
        .select('*')
        .eq('advertiser_id', advertiserId)
        .order('created_at', { ascending: false });

      if (campData) {
        setCampaigns(campData);

        // Load stats for each campaign
        const statsPromises = campData.map(async (campaign) => {
          const { count: totalPlays } = await supabase
            .from('game_attempts')
            .select('*', { count: 'exact', head: true })
            .eq('campaign_id', campaign.id);

          const { count: totalWins } = await supabase
            .from('game_attempts')
            .select('*', { count: 'exact', head: true })
            .eq('campaign_id', campaign.id)
            .eq('won', true);

          const { count: totalRedeemed } = await supabase
            .from('prize_claims')
            .select('*', { count: 'exact', head: true })
            .eq('campaign_id', campaign.id)
            .eq('status', 'redeemed');

          const plays = totalPlays || 0;
          const wins = totalWins || 0;
          const redeemed = totalRedeemed || 0;

          return {
            campaignId: campaign.id,
            stats: {
              total_plays: plays,
              total_wins: wins,
              total_redeemed: redeemed,
              win_rate: plays > 0 ? (wins / plays) * 100 : 0
            }
          };
        });

        const statsResults = await Promise.all(statsPromises);
        const statsMap: Record<string, CampaignStats> = {};
        statsResults.forEach(({ campaignId, stats }) => {
          statsMap[campaignId] = stats;
        });
        setCampaignStats(statsMap);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCampaign = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newCampaign.store_name.trim()) {
      alert(language === 'ar' ? 'الرجاء إدخال اسم المحل' : 'Please enter store name');
      return;
    }


    if (!newCampaign.store_location.trim()) {
      alert(language === 'ar' ? 'الرجاء إدخال رابط خرائط قوقل' : 'Please enter Google Maps link');
      return;
    }

    if (!newCampaign.neighborhood.trim()) {
      alert(language === 'ar' ? 'الرجاء إدخال اسم الحي' : 'Please enter neighborhood name');
      return;
    }

    if (!newCampaign.start_date || !newCampaign.end_date) {
      alert(language === 'ar' ? 'الرجاء تحديد تاريخ البدء والانتهاء' : 'Please select start and end dates');
      return;
    }

    if (prizes.length > 0) {
      const invalidPrize = prizes.find(p =>
        !p.name_ar.trim() || !p.name_en.trim() ||
        !p.description_ar.trim() || !p.description_en.trim() ||
        p.quantity <= 0 || p.value <= 0
      );

      if (invalidPrize) {
        alert(language === 'ar' ? 'الرجاء ملء جميع حقول الجوائز بشكل صحيح' : 'Please fill all prize fields correctly');
        return;
      }
    }

    try {
      // Verify advertiser exists
      const { data: advertiserCheck, error: advertiserError } = await supabase
        .from('advertiser_accounts')
        .select('id')
        .eq('id', advertiserId)
        .maybeSingle();

      if (advertiserError) {
        console.error('Advertiser check error:', advertiserError);
        throw new Error('حدث خطأ في التحقق من حساب المعلن');
      }

      if (!advertiserCheck) {
        alert(language === 'ar'
          ? 'حساب المعلن غير موجود. الرجاء تسجيل الدخول مرة أخرى'
          : 'Advertiser account not found. Please login again');
        window.location.reload();
        return;
      }

      const { data: campaignData, error: campaignError } = await supabase
        .from('campaigns')
        .insert({
          advertiser_id: advertiserId,
          store_name: newCampaign.store_name,
          business_type: newCampaign.business_type,
          description: newCampaign.description,
          store_location: newCampaign.store_location,
          logo_url: newCampaign.logo_url,
          latitude: newCampaign.latitude,
          longitude: newCampaign.longitude,
          neighborhood: newCampaign.neighborhood,
          neighborhoods: neighborhoods.filter(n => n.trim() !== ''),
          name_ar: newCampaign.store_name,
          name_en: newCampaign.store_name,
          description_ar: newCampaign.description,
          description_en: newCampaign.description,
          bag_color: '#22c55e',
          campaign_code: `CAMP-${Date.now()}`,
          code: `CAMP-${Date.now()}`,
          start_date: newCampaign.start_date,
          end_date: newCampaign.end_date,
          win_probability: newCampaign.win_probability,
          total_prize_pool: newCampaign.total_prize_pool,
          consolation_prize: newCampaign.consolation_prize,
          consolation_discount: newCampaign.consolation_discount,
          status: 'pending',
          bags_distributed: 0,
          distribution_locations: []
        })
        .select()
        .single();

      if (campaignError) {
        console.error('Campaign creation error:', campaignError);
        alert(language === 'ar'
          ? `فشل في إنشاء الحملة: ${campaignError.message}`
          : `Failed to create campaign: ${campaignError.message}`);
        return;
      }

      if (prizes.length > 0) {
        const prizesWithCampaignId = prizes.map(prize => ({
          campaign_id: campaignData.id,
          name_ar: prize.name_ar,
          name_en: prize.name_en,
          description_ar: prize.description_ar,
          description_en: prize.description_en,
          type: 'product',
          value: prize.value,
          points_value: Math.floor(prize.value * 10),
          total_quantity: prize.quantity,
          remaining_quantity: prize.quantity,
          quantity: prize.quantity,
          icon: 'gift',
          is_active: true,
          image_url: ''
        }));

        const { error: prizesError } = await supabase
          .from('prizes')
          .insert(prizesWithCampaignId);

        if (prizesError) {
          console.error('Prizes insert error:', prizesError);
          alert(language === 'ar'
            ? `فشل في إضافة الجوائز: ${prizesError.message}`
            : `Failed to add prizes: ${prizesError.message}`);
          return;
        }
      }

      alert(language === 'ar'
        ? 'تم إنشاء الحملة بنجاح! في انتظار موافقة الإدارة'
        : 'Campaign created successfully! Awaiting admin approval');

      setShowCreateModal(false);
      setNewCampaign({
        store_name: '',
        business_type: 'grocery',
        description: '',
        store_location: '',
        logo_url: '',
        latitude: null,
        longitude: null,
        neighborhood: '',
        start_date: '',
        end_date: '',
        bags_count: 1000,
        duration_preset: 'month',
        win_probability: 10,
        consolation_prize: 'خصم 2 ريال',
        consolation_discount: 2,
        total_prize_pool: 100
      });
      setPrizes([]);
      setNeighborhoods([]);
      loadData();
    } catch (error: any) {
      console.error('Full error:', error);
      let errorMsg = error?.message || error?.error_description || 'Unknown error';

      if (error?.code === '23502') {
        const missingField = error?.details?.match(/column "(.+?)"/)?.[1];
        errorMsg = language === 'ar'
          ? `حقل مطلوب لم يتم ملؤه${missingField ? ': ' + missingField : ''}. تأكد من ملء جميع الحقول المطلوبة`
          : `Required field missing${missingField ? ': ' + missingField : ''}. Please fill all required fields`;
      } else if (error?.code === '23505') {
        errorMsg = language === 'ar'
          ? 'هذه الحملة موجودة بالفعل'
          : 'This campaign already exists';
      } else if (error?.code === '23503' || errorMsg.includes('foreign key')) {
        errorMsg = language === 'ar'
          ? 'حساب المعلن غير صحيح. الرجاء تسجيل الخروج والدخول مرة أخرى'
          : 'Advertiser account is invalid. Please logout and login again';
      }

      alert(language === 'ar' ? `خطأ: ${errorMsg}` : `Error: ${errorMsg}`);
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      active: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      rejected: 'bg-red-100 text-red-800',
      draft: 'bg-blue-100 text-blue-800',
      paused: 'bg-orange-100 text-orange-800',
      completed: 'bg-purple-100 text-purple-800'
    };

    const labels: any = {
      active: language === 'ar' ? 'نشطة' : 'Active',
      pending: language === 'ar' ? 'قيد المراجعة' : 'Pending Review',
      rejected: language === 'ar' ? 'مرفوضة' : 'Rejected',
      draft: language === 'ar' ? 'مسودة' : 'Draft',
      paused: language === 'ar' ? 'متوقفة' : 'Paused',
      completed: language === 'ar' ? 'مكتملة' : 'Completed'
    };

    const icons: any = {
      active: <PlayCircle className="w-4 h-4 inline-block ml-1" />,
      pending: <Clock className="w-4 h-4 inline-block ml-1" />,
      rejected: <XCircle className="w-4 h-4 inline-block ml-1" />,
      completed: <CheckCircle className="w-4 h-4 inline-block ml-1" />,
      paused: <PauseCircle className="w-4 h-4 inline-block ml-1" />
    };

    return (
      <span className={`px-3 py-1 rounded-full text-sm font-medium ${styles[status as keyof typeof styles] || styles.pending}`}>
        {icons[status]}
        {labels[status] || status}
      </span>
    );
  };

  const getStatusMessage = (campaign: Campaign) => {
    if (campaign.status === 'pending') {
      return {
        text: language === 'ar' ? 'حملتك قيد المراجعة من قبل الإدارة' : 'Your campaign is under review by admin',
        color: 'text-yellow-700 bg-yellow-50'
      };
    } else if (campaign.status === 'rejected') {
      return {
        text: `${language === 'ar' ? 'تم رفض الحملة:' : 'Campaign rejected:'} ${campaign.approval_notes || ''}`,
        color: 'text-red-700 bg-red-50'
      };
    } else if (campaign.status === 'active') {
      return {
        text: language === 'ar' ? 'الحملة نشطة وجارية حالياً' : 'Campaign is active and running',
        color: 'text-green-700 bg-green-50'
      };
    }
    return null;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-green-700 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const totalStats = Object.values(campaignStats).reduce(
    (acc, stats) => ({
      plays: acc.plays + stats.total_plays,
      wins: acc.wins + stats.total_wins,
      redeemed: acc.redeemed + stats.total_redeemed
    }),
    { plays: 0, wins: 0, redeemed: 0 }
  );

  const totalBagsDistributed = campaigns.reduce((sum, c) => sum + (c.bags_distributed || 0), 0);

  return (
    <div className="min-h-screen bg-gray-50 overflow-x-hidden" dir={language === 'ar' ? 'rtl' : 'ltr'}>

      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6">
        {/* Stats Overview */}
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6 mb-6 sm:mb-8">
          <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm">
            <div className="flex items-center gap-2 sm:gap-3">
              <Package className="w-6 h-6 sm:w-8 sm:h-8 text-green-700 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-xs sm:text-sm text-gray-600 truncate">{language === 'ar' ? 'إجمالي الحملات' : 'Total Campaigns'}</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900">{campaigns.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm">
            <div className="flex items-center gap-2 sm:gap-3">
              <MapPin className="w-6 h-6 sm:w-8 sm:h-8 text-green-700 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-xs sm:text-sm text-gray-600 truncate">{language === 'ar' ? 'أكياس موزعة' : 'Bags Distributed'}</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900">{totalBagsDistributed}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm">
            <div className="flex items-center gap-2 sm:gap-3">
              <Users className="w-6 h-6 sm:w-8 sm:h-8 text-green-700 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-xs sm:text-sm text-gray-600 truncate">{language === 'ar' ? 'إجمالي المشاركات' : 'Total Plays'}</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900">{totalStats.plays}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm">
            <div className="flex items-center gap-2 sm:gap-3">
              <TrendingUp className="w-6 h-6 sm:w-8 sm:h-8 text-green-700 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-xs sm:text-sm text-gray-600 truncate">{language === 'ar' ? 'جوائز مستبدلة' : 'Prizes Redeemed'}</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900">{totalStats.redeemed}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Campaigns List */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-900">
              {language === 'ar' ? 'حملاتك الإعلانية' : 'Your Campaigns'}
            </h2>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 bg-green-700 hover:bg-green-800 text-white rounded-lg flex items-center gap-2 text-sm transition-colors shadow-sm"
            >
              <PlusCircle className="w-5 h-5" />
              {language === 'ar' ? 'حملة جديدة' : 'New Campaign'}
            </button>
          </div>

          {campaigns.length === 0 ? (
            <div className="bg-white rounded-xl p-12 text-center">
              <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-4">
                {language === 'ar' ? 'لم تنشئ أي حملة بعد' : 'You haven\'t created any campaigns yet'}
              </p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-6 py-3 bg-green-700 hover:bg-green-800 text-white rounded-lg inline-flex items-center gap-2"
              >
                <PlusCircle className="w-5 h-5" />
                {language === 'ar' ? 'إنشاء أول حملة' : 'Create First Campaign'}
              </button>
            </div>
          ) : (
            <div className="grid gap-6">
              {campaigns.map((campaign) => {
                const stats = campaignStats[campaign.id] || {
                  total_plays: 0,
                  total_wins: 0,
                  total_redeemed: 0,
                  win_rate: 0
                };
                const statusMsg = getStatusMessage(campaign);

                return (
                  <div key={campaign.id} className="bg-white rounded-xl shadow-sm p-4 sm:p-6 overflow-hidden">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 mb-4">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg sm:text-xl font-bold text-gray-900 truncate">{campaign.store_name}</h3>
                        <p className="text-sm text-gray-600">{campaign.business_type}</p>
                        {(campaign as any).store_location && (
                          <a
                            href={(campaign as any).store_location}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 mt-1 text-sm text-blue-600 hover:text-blue-800 transition-colors"
                          >
                            <MapPin className="w-4 h-4 flex-shrink-0" />
                            <span className="truncate">{language === 'ar' ? 'عرض الموقع على الخريطة' : 'View on Map'}</span>
                          </a>
                        )}
                        {(campaign as any).neighborhoods && Array.isArray((campaign as any).neighborhoods) && (campaign as any).neighborhoods.length > 0 && (
                          <div className="flex items-center gap-2 mt-2 flex-wrap">
                            {(campaign as any).neighborhoods.map((neighborhood: string, idx: number) => (
                              <span key={idx} className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                                {neighborhood}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="flex gap-2 items-center flex-shrink-0 flex-wrap">
                        {getStatusBadge(campaign.status)}
                        <button
                          onClick={() => handlePayment(campaign)}
                          className="p-2 text-blue-700 hover:bg-blue-50 rounded-lg"
                          title={language === 'ar' ? 'الدفع' : 'Payment'}
                        >
                          <CreditCard className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedCampaign(campaign);
                            setShowDetailsModal(true);
                          }}
                          className="p-2 text-green-700 hover:bg-green-50 rounded-lg"
                        >
                          <Eye className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedCampaign(campaign);
                            setShowQRModal(true);
                          }}
                          className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg"
                          title={language === 'ar' ? 'عرض الكود' : 'Show QR'}
                        >
                          <QrCode className="w-5 h-5" />
                        </button>
                      </div>
                    </div>

                    {statusMsg && (
                      <div className={`mb-4 p-3 rounded-lg ${statusMsg.color}`}>
                        <p className="text-sm font-medium">{statusMsg.text}</p>
                      </div>
                    )}

                    {campaign.description && (
                      <p className="text-gray-700 mb-4 text-sm sm:text-base break-words">{campaign.description}</p>
                    )}

                    <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 sm:gap-4 mb-4 p-3 sm:p-4 bg-gray-50 rounded-lg">
                      <div className="text-center sm:text-start">
                        <p className="text-[10px] sm:text-xs text-gray-500">{language === 'ar' ? 'أكياس موزعة' : 'Bags'}</p>
                        <p className="text-base sm:text-lg font-bold text-gray-900">{campaign.bags_distributed || 0}</p>
                      </div>
                      <div className="text-center sm:text-start">
                        <p className="text-[10px] sm:text-xs text-gray-500">{language === 'ar' ? 'مشاركات' : 'Plays'}</p>
                        <p className="text-base sm:text-lg font-bold text-gray-900">{stats.total_plays}</p>
                      </div>
                      <div className="text-center sm:text-start">
                        <p className="text-[10px] sm:text-xs text-gray-500">{language === 'ar' ? 'فائزين' : 'Winners'}</p>
                        <p className="text-base sm:text-lg font-bold text-gray-900">{stats.total_wins}</p>
                      </div>
                      <div className="text-center sm:text-start">
                        <p className="text-[10px] sm:text-xs text-gray-500">{language === 'ar' ? 'مستبدل' : 'Redeemed'}</p>
                        <p className="text-base sm:text-lg font-bold text-gray-900">{stats.total_redeemed}</p>
                      </div>
                      <div className="text-center sm:text-start">
                        <p className="text-[10px] sm:text-xs text-gray-500">{language === 'ar' ? 'نسبة الفوز' : 'Win Rate'}</p>
                        <p className="text-base sm:text-lg font-bold text-green-700">{stats.win_rate.toFixed(1)}%</p>
                      </div>
                    </div>

                    <div className="flex flex-wrap justify-between items-center text-xs sm:text-sm text-gray-600 gap-2">
                      <span>
                        {language === 'ar' ? 'من' : 'From'} {new Date(campaign.start_date).toLocaleDateString('ar-SA')}
                      </span>
                      <span>
                        {language === 'ar' ? 'إلى' : 'To'} {new Date(campaign.end_date).toLocaleDateString('ar-SA')}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Create Campaign Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-xl p-6 max-w-4xl w-full my-8 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              {language === 'ar' ? 'إنشاء حملة جديدة' : 'Create New Campaign'}
            </h3>
            <form onSubmit={handleCreateCampaign} className="space-y-6">
              {/* Basic Info */}
              <div className="border-b pb-4">
                <h4 className="font-bold text-gray-900 mb-3">
                  {language === 'ar' ? 'معلومات أساسية' : 'Basic Information'}
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {language === 'ar' ? 'اسم المحل' : 'Store Name'}
                    </label>
                    <input
                      type="text"
                      value={newCampaign.store_name}
                      onChange={(e) => setNewCampaign({ ...newCampaign, store_name: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-700"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {language === 'ar' ? 'نوع النشاط' : 'Business Type'}
                    </label>
                    <select
                      value={newCampaign.business_type}
                      onChange={(e) => setNewCampaign({ ...newCampaign, business_type: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-700"
                    >
                      <option value="grocery">{language === 'ar' ? 'بقالة' : 'Grocery'}</option>
                      <option value="restaurant">{language === 'ar' ? 'مطعم' : 'Restaurant'}</option>
                      <option value="cafe">{language === 'ar' ? 'مقهى' : 'Cafe'}</option>
                      <option value="pharmacy">{language === 'ar' ? 'صيدلية' : 'Pharmacy'}</option>
                      <option value="other">{language === 'ar' ? 'أخرى' : 'Other'}</option>
                    </select>
                  </div>
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {language === 'ar' ? 'رابط الشعار (Logo URL)' : 'Logo URL'}
                  </label>
                  <input
                    type="url"
                    value={newCampaign.logo_url}
                    onChange={(e) => setNewCampaign({ ...newCampaign, logo_url: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-700"
                    placeholder="https://example.com/logo.png"
                  />
                  {newCampaign.logo_url && (
                    <div className="mt-2">
                      <img
                        src={newCampaign.logo_url}
                        alt="Logo Preview"
                        className="h-16 w-16 object-contain rounded-lg border border-gray-200"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    </div>
                  )}
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {language === 'ar' ? 'وصف الحملة' : 'Campaign Description'}
                  </label>
                  <textarea
                    value={newCampaign.description}
                    onChange={(e) => setNewCampaign({ ...newCampaign, description: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-700"
                    rows={3}
                    placeholder={language === 'ar' ? 'اكتب وصف الحملة (اختياري)' : 'Campaign description (optional)'}
                  />
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {language === 'ar' ? 'رابط خرائط قوقل (Google Maps Link)' : 'Google Maps Link'}
                    <span className="text-red-500 mr-1">*</span>
                  </label>
                  <input
                    type="url"
                    value={newCampaign.store_location}
                    onChange={(e) => {
                      const url = e.target.value;
                      setNewCampaign({ ...newCampaign, store_location: url });

                      // Extract coordinates from Google Maps URL
                      const coordMatch = url.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
                      if (coordMatch) {
                        setNewCampaign(prev => ({
                          ...prev,
                          store_location: url,
                          latitude: parseFloat(coordMatch[1]),
                          longitude: parseFloat(coordMatch[2])
                        }));
                      }
                    }}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-700"
                    placeholder="https://maps.google.com/?q=24.7136,46.6753"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {language === 'ar' ? 'الصق رابط خرائط قوقل للموقع' : 'Paste the Google Maps link for your location'}
                  </p>
                  {newCampaign.latitude && newCampaign.longitude && (
                    <p className="text-xs text-green-600 mt-1">
                      ✓ {language === 'ar' ? 'تم استخراج الإحداثيات' : 'Coordinates extracted'}: {newCampaign.latitude.toFixed(6)}, {newCampaign.longitude.toFixed(6)}
                    </p>
                  )}
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {language === 'ar' ? 'الحي' : 'Neighborhood'}
                    <span className="text-red-500 mr-1">*</span>
                  </label>
                  <input
                    type="text"
                    value={newCampaign.neighborhood}
                    onChange={(e) => setNewCampaign({ ...newCampaign, neighborhood: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-700"
                    placeholder={language === 'ar' ? 'مثال: الملقا' : 'Example: Al Malqa'}
                    required
                  />
                </div>
              </div>

              {/* Duration & Bags */}
              <div className="border-b pb-4">
                <h4 className="font-bold text-gray-900 mb-3">
                  {language === 'ar' ? 'مدة الحملة والأكياس' : 'Duration & Bags'}
                </h4>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {language === 'ar' ? 'اختر المدة' : 'Select Duration'}
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => handleDurationPresetChange('week')}
                      className={`py-2 px-4 rounded-lg border-2 transition ${
                        newCampaign.duration_preset === 'week'
                          ? 'border-green-700 bg-green-50 text-green-700'
                          : 'border-gray-300 hover:border-green-700'
                      }`}
                    >
                      {language === 'ar' ? 'أسبوع' : 'Week'}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDurationPresetChange('month')}
                      className={`py-2 px-4 rounded-lg border-2 transition ${
                        newCampaign.duration_preset === 'month'
                          ? 'border-green-700 bg-green-50 text-green-700'
                          : 'border-gray-300 hover:border-green-700'
                      }`}
                    >
                      {language === 'ar' ? 'شهر' : 'Month'}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDurationPresetChange('3months')}
                      className={`py-2 px-4 rounded-lg border-2 transition ${
                        newCampaign.duration_preset === '3months'
                          ? 'border-green-700 bg-green-50 text-green-700'
                          : 'border-gray-300 hover:border-green-700'
                      }`}
                    >
                      {language === 'ar' ? '3 شهور' : '3 Months'}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {language === 'ar' ? 'تاريخ البدء' : 'Start Date'}
                      <span className="text-red-500 mr-1">*</span>
                    </label>
                    <input
                      type="date"
                      value={newCampaign.start_date}
                      onChange={(e) => setNewCampaign({ ...newCampaign, start_date: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-700"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {language === 'ar' ? 'تاريخ الانتهاء' : 'End Date'}
                      <span className="text-red-500 mr-1">*</span>
                    </label>
                    <input
                      type="date"
                      value={newCampaign.end_date}
                      onChange={(e) => setNewCampaign({ ...newCampaign, end_date: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-700"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {language === 'ar' ? 'عدد الأكياس المتوقع' : 'Expected Bags Count'}
                    </label>
                    <input
                      type="number"
                      value={newCampaign.bags_count}
                      onChange={(e) => {
                        const count = parseInt(e.target.value) || 1000;
                        setNewCampaign({ ...newCampaign, bags_count: count });
                        const maxN = Math.floor(count / 1000);
                        if (neighborhoods.length > maxN) {
                          setNeighborhoods(neighborhoods.slice(0, maxN));
                        }
                      }}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-700"
                      min="1000"
                      step="1000"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      {language === 'ar'
                        ? `يمكنك تحديد ${getMaxNeighborhoods()} ${getMaxNeighborhoods() === 1 ? 'حي' : 'أحياء'} للتوزيع`
                        : `You can select ${getMaxNeighborhoods()} neighborhood${getMaxNeighborhoods() > 1 ? 's' : ''} for distribution`
                      }
                    </p>
                  </div>
                </div>
              </div>

              {/* Neighborhoods Distribution */}
              <div className="border-b pb-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h4 className="font-bold text-gray-900">
                      {language === 'ar' ? 'أحياء التوزيع' : 'Distribution Neighborhoods'}
                    </h4>
                    <p className="text-sm text-gray-600 mt-1">
                      {language === 'ar'
                        ? 'كل 1000 كيس تسمح لك باختيار حي واحد للتوزيع'
                        : 'Every 1000 bags allows you to select one neighborhood'
                      }
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={addNeighborhood}
                    disabled={neighborhoods.length >= getMaxNeighborhoods()}
                    className="flex items-center gap-2 px-4 py-2 bg-green-700 text-white rounded-lg hover:bg-green-800 disabled:bg-gray-300 disabled:cursor-not-allowed transition"
                  >
                    <MapPin className="w-4 h-4" />
                    {language === 'ar' ? 'إضافة حي' : 'Add Neighborhood'}
                  </button>
                </div>

                {neighborhoods.length === 0 ? (
                  <div className="text-center py-8 bg-gray-50 rounded-lg">
                    <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-600">
                      {language === 'ar' ? 'لم تحدد أحياء التوزيع بعد' : 'No neighborhoods added yet'}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      {language === 'ar'
                        ? `يمكنك إضافة حتى ${getMaxNeighborhoods()} ${getMaxNeighborhoods() === 1 ? 'حي' : 'أحياء'}`
                        : `You can add up to ${getMaxNeighborhoods()} neighborhood${getMaxNeighborhoods() > 1 ? 's' : ''}`
                      }
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {neighborhoods.map((neighborhood, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <div className="flex-1">
                          <input
                            type="text"
                            value={neighborhood}
                            onChange={(e) => updateNeighborhood(index, e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-700"
                            placeholder={language === 'ar' ? `اسم الحي ${index + 1}` : `Neighborhood ${index + 1}`}
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => removeNeighborhood(index)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Game Settings */}
              <div className="border-b pb-4">
                <h4 className="font-bold text-gray-900 mb-3">
                  {language === 'ar' ? 'إعدادات اللعبة' : 'Game Settings'}
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {language === 'ar' ? 'نسبة الفوز %' : 'Win Probability %'}
                    </label>
                    <input
                      type="number"
                      value={newCampaign.win_probability}
                      onChange={(e) => setNewCampaign({ ...newCampaign, win_probability: parseFloat(e.target.value) || 0 })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-700"
                      min="1"
                      max="100"
                      step="0.1"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {language === 'ar' ? 'إجمالي الجوائز' : 'Total Prize Pool'}
                    </label>
                    <input
                      type="number"
                      value={newCampaign.total_prize_pool}
                      onChange={(e) => setNewCampaign({ ...newCampaign, total_prize_pool: parseInt(e.target.value) || 0 })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-700"
                      min="10"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {language === 'ar' ? 'قيمة خصم الترضية (ريال)' : 'Consolation Discount (SAR)'}
                    </label>
                    <input
                      type="number"
                      value={newCampaign.consolation_discount}
                      onChange={(e) => setNewCampaign({ ...newCampaign, consolation_discount: parseFloat(e.target.value) || 0 })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-700"
                      min="0"
                      step="0.5"
                    />
                  </div>
                </div>
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {language === 'ar' ? 'نص جائزة الترضية' : 'Consolation Prize Text'}
                  </label>
                  <input
                    type="text"
                    value={newCampaign.consolation_prize}
                    onChange={(e) => setNewCampaign({ ...newCampaign, consolation_prize: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-700"
                    placeholder={language === 'ar' ? 'مثال: خصم 2 ريال' : 'Example: 2 SAR discount'}
                  />
                </div>
              </div>

              {/* Prizes */}
              <div className="border-b pb-4">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="font-bold text-gray-900">
                    {language === 'ar' ? 'الجوائز' : 'Prizes'}
                  </h4>
                  <button
                    type="button"
                    onClick={addPrize}
                    className="px-4 py-2 bg-green-700 hover:bg-green-800 text-white rounded-lg flex items-center gap-2 text-sm"
                  >
                    <Gift className="w-4 h-4" />
                    {language === 'ar' ? 'إضافة جائزة' : 'Add Prize'}
                  </button>
                </div>

                {prizes.length === 0 ? (
                  <div className="text-center py-8 bg-gray-50 rounded-lg">
                    <Gift className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-600">
                      {language === 'ar' ? 'لم تضف أي جائزة بعد' : 'No prizes added yet'}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      {language === 'ar' ? 'الجوائز اختيارية. يمكنك إنشاء الحملة بجائزة الترضية فقط أو إضافة جوائز إضافية' : 'Prizes are optional. You can create a campaign with consolation prize only or add extra prizes'}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {prizes.map((prize, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                        <div className="flex justify-between items-center mb-3">
                          <span className="font-medium text-gray-900">
                            {language === 'ar' ? `جائزة ${index + 1}` : `Prize ${index + 1}`}
                          </span>
                          <button
                            type="button"
                            onClick={() => removePrize(index)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <input
                            type="text"
                            placeholder={language === 'ar' ? 'اسم الجائزة بالعربي' : 'Prize Name (Arabic)'}
                            value={prize.name_ar}
                            onChange={(e) => updatePrize(index, 'name_ar', e.target.value)}
                            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-700"
                          />
                          <input
                            type="text"
                            placeholder={language === 'ar' ? 'اسم الجائزة بالإنجليزي' : 'Prize Name (English)'}
                            value={prize.name_en}
                            onChange={(e) => updatePrize(index, 'name_en', e.target.value)}
                            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-700"
                          />
                          <input
                            type="text"
                            placeholder={language === 'ar' ? 'وصف الجائزة بالعربي' : 'Description (Arabic)'}
                            value={prize.description_ar}
                            onChange={(e) => updatePrize(index, 'description_ar', e.target.value)}
                            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-700"
                          />
                          <input
                            type="text"
                            placeholder={language === 'ar' ? 'وصف الجائزة بالإنجليزي' : 'Description (English)'}
                            value={prize.description_en}
                            onChange={(e) => updatePrize(index, 'description_en', e.target.value)}
                            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-700"
                          />
                          <input
                            type="number"
                            placeholder={language === 'ar' ? 'الكمية' : 'Quantity'}
                            value={prize.quantity}
                            onChange={(e) => updatePrize(index, 'quantity', parseInt(e.target.value) || 0)}
                            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-700"
                            min="1"
                          />
                          <input
                            type="number"
                            placeholder={language === 'ar' ? 'القيمة (ريال)' : 'Value (SAR)'}
                            value={prize.value}
                            onChange={(e) => updatePrize(index, 'value', parseFloat(e.target.value) || 0)}
                            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-700"
                            min="0"
                            step="0.5"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <button
                  type="submit"
                  className="flex-1 py-3 bg-green-700 hover:bg-green-800 text-white rounded-lg font-medium"
                >
                  {language === 'ar' ? 'إنشاء الحملة' : 'Create Campaign'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    setPrizes([]);
                  }}
                  className="flex-1 py-3 bg-gray-200 hover:bg-gray-300 text-gray-900 rounded-lg font-medium"
                >
                  {language === 'ar' ? 'إلغاء' : 'Cancel'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {showPaymentModal && selectedCampaign && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xl font-bold text-gray-900">
                  {language === 'ar' ? 'الدفع' : 'Payment'}
                </h3>
                <p className="text-sm text-gray-600 mt-1">{selectedCampaign.store_name}</p>
              </div>
              <button
                onClick={() => setShowPaymentModal(false)}
                className="text-gray-500 hover:text-gray-700"
                disabled={paymentLoading}
              >
                ✕
              </button>
            </div>

            <form onSubmit={processPayment} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {language === 'ar' ? 'الاسم' : 'Name'}
                  <span className="text-red-500 mr-1">*</span>
                </label>
                <input
                  type="text"
                  value={paymentData.clientName}
                  onChange={(e) => setPaymentData({ ...paymentData, clientName: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-700"
                  placeholder={language === 'ar' ? 'أدخل اسمك' : 'Enter your name'}
                  required
                  disabled={paymentLoading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {language === 'ar' ? 'رقم الجوال' : 'Mobile Number'}
                  <span className="text-red-500 mr-1">*</span>
                </label>
                <input
                  type="tel"
                  value={paymentData.clientMobile}
                  onChange={(e) => setPaymentData({ ...paymentData, clientMobile: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-700"
                  placeholder="05XXXXXXXX"
                  dir="ltr"
                  required
                  disabled={paymentLoading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {language === 'ar' ? 'المبلغ (ريال)' : 'Amount (SAR)'}
                  <span className="text-red-500 mr-1">*</span>
                </label>
                <input
                  type="number"
                  value={paymentData.amount}
                  onChange={(e) => setPaymentData({ ...paymentData, amount: parseFloat(e.target.value) || 0 })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-700"
                  placeholder="0.00"
                  min="1"
                  step="0.01"
                  required
                  disabled={paymentLoading}
                />
              </div>

              <div className="flex gap-2 pt-4">
                <button
                  type="submit"
                  disabled={paymentLoading}
                  className="flex-1 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all"
                >
                  {paymentLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      {language === 'ar' ? 'جاري المعالجة...' : 'Processing...'}
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                      </svg>
                      {language === 'ar' ? 'تواصل عبر واتساب' : 'Contact via WhatsApp'}
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setShowPaymentModal(false)}
                  disabled={paymentLoading}
                  className="flex-1 py-3 bg-gray-200 hover:bg-gray-300 text-gray-900 rounded-lg font-medium disabled:bg-gray-100 disabled:cursor-not-allowed"
                >
                  {language === 'ar' ? 'إلغاء' : 'Cancel'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* QR Code Modal */}
      {showQRModal && selectedCampaign && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-8 max-w-sm w-full text-center">
            <h3 className="text-xl font-bold mb-4">{selectedCampaign.store_name}</h3>
            <div className="bg-white p-4 rounded-xl border-2 border-dashed border-gray-200 inline-block mb-6 shadow-sm">
              <QRCodeSVG 
                value={`${window.location.origin}/game?c=${selectedCampaign.id}`} 
                size={200}
                level="H"
              />
            </div>
            <p className="text-sm text-gray-500 mb-6">
              {language === 'ar' 
                ? 'قم بطباعة هذا الكود ووضعه على أكياس التسوق ليقوم العملاء بمسحه.' 
                : 'Print this code and place it on shopping bags for customers to scan.'}
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => window.print()}
                className="flex-1 py-2 bg-green-700 text-white rounded-lg hover:bg-green-800 transition-colors"
              >
                {language === 'ar' ? 'طباعة' : 'Print'}
              </button>
              <button
                onClick={() => setShowQRModal(false)}
                className="flex-1 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                {language === 'ar' ? 'إغلاق' : 'Close'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Campaign Details Modal */}
      {showDetailsModal && selectedCampaign && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-bold text-gray-900">{selectedCampaign.store_name}</h3>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <h4 className="font-bold text-gray-900 mb-2">
                  {language === 'ar' ? 'سجل التوزيع' : 'Distribution History'}
                </h4>
                {selectedCampaign.distribution_locations && selectedCampaign.distribution_locations.length > 0 ? (
                  <div className="space-y-2">
                    {selectedCampaign.distribution_locations.map((loc: any, index: number) => (
                      <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-gray-500" />
                          <span className="font-medium">{loc.name}</span>
                        </div>
                        <div className="text-sm">
                          <span className="font-bold text-green-700">{loc.bags}</span>{' '}
                          {language === 'ar' ? 'كيس' : 'bags'}
                          <span className="text-gray-500 mr-2">
                            {new Date(loc.date).toLocaleDateString('ar-SA')}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <MapPin className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>{language === 'ar' ? 'لم يتم توزيع أكياس بعد' : 'No bags distributed yet'}</p>
                    <p className="text-sm mt-1">
                      {language === 'ar'
                        ? 'سيتم تحديث سجل التوزيع من قبل الإدارة'
                        : 'Distribution will be updated by admin'}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
