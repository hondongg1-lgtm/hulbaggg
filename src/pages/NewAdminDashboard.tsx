import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Users, Store, Package, CheckCircle, XCircle, Clock, PlusCircle, CreditCard as Edit, Trash2, MapPin, TrendingUp, Eye } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface NewAdminDashboardProps {
  adminId: string;
  onLogout: () => void;
}

interface Advertiser {
  id: string;
  email: string;
  username: string;
  business_name: string;
  phone: string;
  is_active: boolean;
  created_at: string;
}

interface Campaign {
  id: string;
  store_name: string;
  business_type: string;
  description: string;
  status: string;
  advertiser_id: string;
  bags_distributed: number;
  distribution_locations: any[];
  start_date: string;
  end_date: string;
  created_at: string;
  advertiser_accounts?: {
    business_name: string;
    email: string;
  };
}

export default function NewAdminDashboard({ adminId, onLogout }: NewAdminDashboardProps) {
  const { language } = useLanguage();
  const [activeTab, setActiveTab] = useState<'overview' | 'advertisers' | 'campaigns'>('overview');
  const [advertisers, setAdvertisers] = useState<Advertiser[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);

  // Add advertiser modal
  const [showAddAdvertiser, setShowAddAdvertiser] = useState(false);
  const [newAdvertiser, setNewAdvertiser] = useState({
    username: '',
    email: '',
    password: '',
    business_name: '',
    phone: ''
  });

  // Campaign modal
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [showCampaignModal, setShowCampaignModal] = useState(false);
  const [distributionInput, setDistributionInput] = useState({
    location_name: '',
    bags_count: 0
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Load advertisers from advertiser_accounts
      const { data: advData } = await supabase
        .from('advertiser_accounts')
        .select('*')
        .order('created_at', { ascending: false });

      // Load campaigns with advertiser info
      const { data: campData } = await supabase
        .from('campaigns')
        .select(`
          *,
          advertiser_accounts!campaigns_advertiser_id_fkey (
            business_name,
            email
          )
        `)
        .order('created_at', { ascending: false });

      if (campData) setCampaigns(campData as any);

      // Update advertiser status based on active campaigns
      if (advData) {
        const updatedAdvertisers = advData.map(adv => {
          const hasActiveCampaign = campData?.some(
            camp => camp.advertiser_id === adv.id && camp.status === 'active'
          );
          return {
            ...adv,
            is_active: hasActiveCampaign || false
          };
        });

        // Update status in database for each advertiser
        for (const adv of updatedAdvertisers) {
          const originalAdv = advData.find(a => a.id === adv.id);
          if (originalAdv && originalAdv.is_active !== adv.is_active) {
            await supabase
              .from('advertiser_accounts')
              .update({ is_active: adv.is_active })
              .eq('id', adv.id);
          }
        }

        setAdvertisers(updatedAdvertisers);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddAdvertiser = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newAdvertiser.username.trim() || !newAdvertiser.email.trim() || !newAdvertiser.password.trim()) {
      alert(language === 'ar'
        ? 'الرجاء ملء جميع الحقول المطلوبة (اسم المستخدم، البريد، كلمة المرور)'
        : 'Please fill all required fields (username, email, password)');
      return;
    }

    if (!newAdvertiser.business_name.trim()) {
      alert(language === 'ar' ? 'الرجاء إدخال اسم النشاط التجاري' : 'Please enter business name');
      return;
    }

    try {
      const { error } = await supabase
        .from('advertiser_accounts')
        .insert({
          username: newAdvertiser.username,
          email: newAdvertiser.email,
          password: newAdvertiser.password,
          business_name: newAdvertiser.business_name,
          phone: newAdvertiser.phone,
          is_active: true
        });

      if (error) {
        if (error.code === '23505') {
          alert(language === 'ar'
            ? 'البريد الإلكتروني أو اسم المستخدم موجود بالفعل'
            : 'Email or username already exists');
        } else {
          throw error;
        }
        return;
      }

      alert(language === 'ar' ? 'تم إضافة المعلن بنجاح' : 'Advertiser added successfully');
      setShowAddAdvertiser(false);
      setNewAdvertiser({ username: '', email: '', password: '', business_name: '', phone: '' });
      loadData();
    } catch (error: any) {
      console.error('Add advertiser error:', error);
      alert(language === 'ar'
        ? `حدث خطأ في إضافة المعلن: ${error.message}`
        : `Error adding advertiser: ${error.message}`);
    }
  };

  const handleDeleteAdvertiser = async (id: string) => {
    if (!confirm(language === 'ar' ? 'هل تريد حذف هذا المعلن؟' : 'Delete this advertiser?')) return;

    try {
      const { error } = await supabase
        .from('advertiser_accounts')
        .delete()
        .eq('id', id);

      if (error) throw error;
      loadData();
    } catch (error: any) {
      alert(language === 'ar' ? 'حدث خطأ في الحذف' : 'Error deleting');
      console.error(error);
    }
  };

  const handleToggleAdvertiserStatus = async (advertiser: Advertiser) => {
    try {
      const newStatus = !advertiser.is_active;
      const { error } = await supabase
        .from('advertiser_accounts')
        .update({ is_active: newStatus })
        .eq('id', advertiser.id);

      if (error) throw error;
      loadData();
    } catch (error: any) {
      alert(language === 'ar' ? 'حدث خطأ' : 'Error occurred');
      console.error(error);
    }
  };

  const handleApproveCampaign = async (campaignId: string) => {
    try {
      const { error } = await supabase
        .from('campaigns')
        .update({
          status: 'active',
          approved_by_admin_id: adminId,
          approved_at: new Date().toISOString()
        })
        .eq('id', campaignId);

      if (error) throw error;
      loadData();
    } catch (error: any) {
      alert(language === 'ar' ? 'حدث خطأ' : 'Error occurred');
      console.error(error);
    }
  };

  const handleRejectCampaign = async (campaignId: string) => {
    const notes = prompt(language === 'ar' ? 'سبب الرفض:' : 'Rejection reason:');
    if (!notes) return;

    try {
      const { error } = await supabase
        .from('campaigns')
        .update({
          status: 'rejected',
          approval_notes: notes,
          approved_by_admin_id: adminId,
          approved_at: new Date().toISOString()
        })
        .eq('id', campaignId);

      if (error) throw error;
      loadData();
    } catch (error: any) {
      alert(language === 'ar' ? 'حدث خطأ' : 'Error occurred');
      console.error(error);
    }
  };

  const handleDeleteCampaign = async (campaignId: string) => {
    const confirmMsg = language === 'ar'
      ? 'هل أنت متأكد من حذف هذه الحملة الإعلانية؟ سيتم حذف جميع البيانات المرتبطة بها (الجوائز، المحاولات، الاستحقاقات). لا يمكن التراجع عن هذا الإجراء.'
      : 'Are you sure you want to delete this campaign? All related data (prizes, attempts, claims) will be deleted. This action cannot be undone.';

    if (!confirm(confirmMsg)) return;

    try {
      const { data: prizes } = await supabase
        .from('prizes')
        .select('id')
        .eq('campaign_id', campaignId);

      if (prizes && prizes.length > 0) {
        const prizeIds = prizes.map(p => p.id);

        const { error: prizeAttemptsError } = await supabase
          .from('game_attempts')
          .delete()
          .in('prize_id', prizeIds);

        if (prizeAttemptsError) throw prizeAttemptsError;

        const { error: prizeClaimsError } = await supabase
          .from('prize_claims')
          .delete()
          .in('prize_id', prizeIds);

        if (prizeClaimsError) throw prizeClaimsError;
      }

      const { error: campaignClaimsError } = await supabase
        .from('prize_claims')
        .delete()
        .eq('campaign_id', campaignId);

      if (campaignClaimsError) throw campaignClaimsError;

      const { error: campaignAttemptsError } = await supabase
        .from('game_attempts')
        .delete()
        .eq('campaign_id', campaignId);

      if (campaignAttemptsError) throw campaignAttemptsError;

      const { error: prizesError } = await supabase
        .from('prizes')
        .delete()
        .eq('campaign_id', campaignId);

      if (prizesError) throw prizesError;

      const { error: campaignError } = await supabase
        .from('campaigns')
        .delete()
        .eq('id', campaignId);

      if (campaignError) throw campaignError;

      alert(language === 'ar' ? 'تم حذف الحملة بنجاح' : 'Campaign deleted successfully');
      loadData();
    } catch (error: any) {
      const errorMsg = language === 'ar'
        ? `حدث خطأ في الحذف: ${error.message || 'خطأ غير معروف'}`
        : `Error deleting campaign: ${error.message || 'Unknown error'}`;
      alert(errorMsg);
      console.error('Delete campaign error:', error);
    }
  };

  const handleAddDistribution = async () => {
    if (!selectedCampaign || !distributionInput.location_name || distributionInput.bags_count <= 0) {
      alert(language === 'ar' ? 'أدخل البيانات كاملة' : 'Fill all fields');
      return;
    }

    try {
      const currentLocations = selectedCampaign.distribution_locations || [];
      const newLocation = {
        name: distributionInput.location_name,
        bags: distributionInput.bags_count,
        date: new Date().toISOString()
      };

      const { error } = await supabase
        .from('campaigns')
        .update({
          distribution_locations: [...currentLocations, newLocation],
          bags_distributed: (selectedCampaign.bags_distributed || 0) + distributionInput.bags_count
        })
        .eq('id', selectedCampaign.id);

      if (error) throw error;

      setDistributionInput({ location_name: '', bags_count: 0 });
      loadData();

      // Refresh selected campaign
      const updated = campaigns.find(c => c.id === selectedCampaign.id);
      if (updated) setSelectedCampaign(updated);
    } catch (error: any) {
      alert(language === 'ar' ? 'حدث خطأ' : 'Error occurred');
      console.error(error);
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      active: 'bg-green-100 text-green-800',
      inactive: 'bg-gray-100 text-gray-800',
      pending: 'bg-yellow-100 text-yellow-800',
      rejected: 'bg-red-100 text-red-800',
      draft: 'bg-blue-100 text-blue-800',
      paused: 'bg-orange-100 text-orange-800',
      completed: 'bg-purple-100 text-purple-800'
    };

    const labels: any = {
      active: language === 'ar' ? 'نشط' : 'Active',
      inactive: language === 'ar' ? 'غير نشط' : 'Inactive',
      pending: language === 'ar' ? 'قيد المراجعة' : 'Pending',
      rejected: language === 'ar' ? 'مرفوض' : 'Rejected',
      draft: language === 'ar' ? 'مسودة' : 'Draft',
      paused: language === 'ar' ? 'متوقف' : 'Paused',
      completed: language === 'ar' ? 'مكتمل' : 'Completed'
    };

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status as keyof typeof styles] || styles.pending}`}>
        {labels[status] || status}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-green-700 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const stats = {
    totalAdvertisers: advertisers.length,
    activeAdvertisers: advertisers.filter(a => a.is_active).length,
    totalCampaigns: campaigns.length,
    pendingCampaigns: campaigns.filter(c => c.status === 'pending').length,
    activeCampaigns: campaigns.filter(c => c.status === 'active').length,
    totalBagsDistributed: campaigns.reduce((sum, c) => sum + (c.bags_distributed || 0), 0)
  };

  return (
    <div className="min-h-screen bg-gray-50" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">
              {language === 'ar' ? 'لوحة تحكم الإدارة' : 'Admin Dashboard'}
            </h1>
            <button
              onClick={onLogout}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
            >
              {language === 'ar' ? 'تسجيل خروج' : 'Logout'}
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-4 mt-4">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === 'overview'
                  ? 'bg-green-700 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <TrendingUp className="w-4 h-4 inline-block ml-1" />
              {language === 'ar' ? 'نظرة عامة' : 'Overview'}
            </button>
            <button
              onClick={() => setActiveTab('advertisers')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === 'advertisers'
                  ? 'bg-green-700 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Users className="w-4 h-4 inline-block ml-1" />
              {language === 'ar' ? 'المعلنين' : 'Advertisers'}
            </button>
            <button
              onClick={() => setActiveTab('campaigns')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === 'campaigns'
                  ? 'bg-green-700 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Package className="w-4 h-4 inline-block ml-1" />
              {language === 'ar' ? 'الحملات' : 'Campaigns'}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-2">
                  <Users className="w-8 h-8 text-green-700" />
                  <div>
                    <p className="text-sm text-gray-600">{language === 'ar' ? 'إجمالي المعلنين' : 'Total Advertisers'}</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.totalAdvertisers}</p>
                  </div>
                </div>
                <p className="text-sm text-green-700">
                  {stats.activeAdvertisers} {language === 'ar' ? 'نشط' : 'active'}
                </p>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-2">
                  <Package className="w-8 h-8 text-green-700" />
                  <div>
                    <p className="text-sm text-gray-600">{language === 'ar' ? 'إجمالي الحملات' : 'Total Campaigns'}</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.totalCampaigns}</p>
                  </div>
                </div>
                <p className="text-sm text-yellow-700">
                  {stats.pendingCampaigns} {language === 'ar' ? 'قيد المراجعة' : 'pending'}
                </p>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-2">
                  <Store className="w-8 h-8 text-green-700" />
                  <div>
                    <p className="text-sm text-gray-600">{language === 'ar' ? 'أكياس موزعة' : 'Bags Distributed'}</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.totalBagsDistributed}</p>
                  </div>
                </div>
                <p className="text-sm text-green-700">
                  {stats.activeCampaigns} {language === 'ar' ? 'حملة نشطة' : 'active campaigns'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Advertisers Tab */}
        {activeTab === 'advertisers' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900">
                {language === 'ar' ? 'إدارة المعلنين' : 'Manage Advertisers'}
              </h2>
              <button
                onClick={() => setShowAddAdvertiser(true)}
                className="px-4 py-2 bg-green-700 hover:bg-green-800 text-white rounded-lg flex items-center gap-2"
              >
                <PlusCircle className="w-5 h-5" />
                {language === 'ar' ? 'إضافة معلن' : 'Add Advertiser'}
              </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                      {language === 'ar' ? 'الشركة' : 'Company'}
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                      {language === 'ar' ? 'البريد' : 'Email'}
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                      {language === 'ar' ? 'الجوال' : 'Phone'}
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                      {language === 'ar' ? 'الحالة' : 'Status'}
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                      {language === 'ar' ? 'الإجراءات' : 'Actions'}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {advertisers.map((advertiser) => (
                    <tr key={advertiser.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-medium text-gray-900">{advertiser.business_name}</div>
                        <div className="text-xs text-gray-500">@{advertiser.username}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-700">{advertiser.email}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-700">{advertiser.phone}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(advertiser.is_active ? 'active' : 'inactive')}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleToggleAdvertiserStatus(advertiser)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                            title={language === 'ar' ? 'تغيير الحالة' : 'Toggle status'}
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteAdvertiser(advertiser.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded"
                            title={language === 'ar' ? 'حذف' : 'Delete'}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Campaigns Tab */}
        {activeTab === 'campaigns' && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-gray-900">
              {language === 'ar' ? 'إدارة الحملات' : 'Manage Campaigns'}
            </h2>

            <div className="grid gap-4">
              {campaigns.map((campaign) => (
                <div key={campaign.id} className="bg-white rounded-xl shadow-sm p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">{campaign.store_name}</h3>
                      <p className="text-sm text-gray-600">
                        {campaign.advertiser_accounts?.business_name} ({campaign.advertiser_accounts?.email})
                      </p>
                    </div>
                    <div className="flex gap-2 items-center">
                      {getStatusBadge(campaign.status)}
                      <button
                        onClick={() => {
                          setSelectedCampaign(campaign);
                          setShowCampaignModal(true);
                        }}
                        className="p-2 text-green-700 hover:bg-green-50 rounded"
                      >
                        <Eye className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDeleteCampaign(campaign.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded"
                        title={language === 'ar' ? 'حذف الحملة' : 'Delete Campaign'}
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  <p className="text-gray-700 mb-4">{campaign.description}</p>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div className="bg-emerald-50 rounded-lg p-3 border-2 border-emerald-200">
                      <p className="text-xs text-emerald-700 font-medium mb-1">{language === 'ar' ? 'عدد الأكياس الموزعة' : 'Bags Distributed'}</p>
                      <p className="text-2xl font-black text-emerald-900">{campaign.bags_distributed || 0}</p>
                      <p className="text-xs text-emerald-600 mt-1">{language === 'ar' ? 'كيس' : 'bags'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">{language === 'ar' ? 'مواقع التوزيع' : 'Locations'}</p>
                      <p className="text-lg font-bold text-gray-900">{campaign.distribution_locations?.length || 0}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">{language === 'ar' ? 'تاريخ البدء' : 'Start Date'}</p>
                      <p className="text-sm text-gray-700">{new Date(campaign.start_date).toLocaleDateString('ar-SA')}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">{language === 'ar' ? 'تاريخ الانتهاء' : 'End Date'}</p>
                      <p className="text-sm text-gray-700">{new Date(campaign.end_date).toLocaleDateString('ar-SA')}</p>
                    </div>
                  </div>

                  {campaign.status === 'pending' && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleApproveCampaign(campaign.id)}
                        className="flex-1 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center justify-center gap-2"
                      >
                        <CheckCircle className="w-4 h-4" />
                        {language === 'ar' ? 'موافقة' : 'Approve'}
                      </button>
                      <button
                        onClick={() => handleRejectCampaign(campaign.id)}
                        className="flex-1 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg flex items-center justify-center gap-2"
                      >
                        <XCircle className="w-4 h-4" />
                        {language === 'ar' ? 'رفض' : 'Reject'}
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Add Advertiser Modal */}
      {showAddAdvertiser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              {language === 'ar' ? 'إضافة معلن جديد' : 'Add New Advertiser'}
            </h3>
            <form onSubmit={handleAddAdvertiser} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {language === 'ar' ? 'اسم المستخدم' : 'Username'}
                </label>
                <input
                  type="text"
                  value={newAdvertiser.username}
                  onChange={(e) => setNewAdvertiser({ ...newAdvertiser, username: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-700"
                  placeholder="advertiser1"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {language === 'ar' ? 'اسم الشركة' : 'Business Name'}
                </label>
                <input
                  type="text"
                  value={newAdvertiser.business_name}
                  onChange={(e) => setNewAdvertiser({ ...newAdvertiser, business_name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-700"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {language === 'ar' ? 'البريد الإلكتروني' : 'Email'}
                </label>
                <input
                  type="email"
                  value={newAdvertiser.email}
                  onChange={(e) => setNewAdvertiser({ ...newAdvertiser, email: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-700"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {language === 'ar' ? 'كلمة المرور' : 'Password'}
                </label>
                <input
                  type="text"
                  value={newAdvertiser.password}
                  onChange={(e) => setNewAdvertiser({ ...newAdvertiser, password: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-700"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {language === 'ar' ? 'رقم الجوال' : 'Phone'}
                </label>
                <input
                  type="tel"
                  value={newAdvertiser.phone}
                  onChange={(e) => setNewAdvertiser({ ...newAdvertiser, phone: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-700"
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="flex-1 py-2 bg-green-700 hover:bg-green-800 text-white rounded-lg"
                >
                  {language === 'ar' ? 'إضافة' : 'Add'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddAdvertiser(false)}
                  className="flex-1 py-2 bg-gray-200 hover:bg-gray-300 text-gray-900 rounded-lg"
                >
                  {language === 'ar' ? 'إلغاء' : 'Cancel'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Campaign Details Modal */}
      {showCampaignModal && selectedCampaign && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-bold text-gray-900">{selectedCampaign.store_name}</h3>
              <button
                onClick={() => setShowCampaignModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              {/* Campaign Information */}
              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <h4 className="font-bold text-gray-900 mb-2">
                  {language === 'ar' ? 'معلومات الحملة' : 'Campaign Information'}
                </h4>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-gray-600">{language === 'ar' ? 'اسم المحل:' : 'Store Name:'}</span>
                    <p className="font-semibold">{selectedCampaign.store_name}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">{language === 'ar' ? 'نوع النشاط:' : 'Business Type:'}</span>
                    <p className="font-semibold">{selectedCampaign.business_type}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">{language === 'ar' ? 'الوصف:' : 'Description:'}</span>
                    <p className="font-semibold">{selectedCampaign.description || '-'}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">{language === 'ar' ? 'تاريخ البداية:' : 'Start Date:'}</span>
                    <p className="font-semibold">{selectedCampaign.start_date}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">{language === 'ar' ? 'تاريخ النهاية:' : 'End Date:'}</span>
                    <p className="font-semibold">{selectedCampaign.end_date}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">{language === 'ar' ? 'اسم المعلن:' : 'Advertiser:'}</span>
                    <p className="font-semibold">{selectedCampaign.advertiser_accounts?.business_name || '-'}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">{language === 'ar' ? 'البريد الإلكتروني:' : 'Email:'}</span>
                    <p className="font-semibold text-xs">{selectedCampaign.advertiser_accounts?.email || '-'}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">{language === 'ar' ? 'إجمالي الأكياس الموزعة:' : 'Total Bags Distributed:'}</span>
                    <p className="font-semibold text-green-700">{selectedCampaign.bags_distributed || 0}</p>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-gray-900 mb-2">
                  {language === 'ar' ? 'إضافة توزيع جديد' : 'Add New Distribution'}
                </h4>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder={language === 'ar' ? 'اسم البقالة' : 'Store name'}
                    value={distributionInput.location_name}
                    onChange={(e) => setDistributionInput({ ...distributionInput, location_name: e.target.value })}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg"
                  />
                  <input
                    type="number"
                    placeholder={language === 'ar' ? 'عدد الأكياس' : 'Bags count'}
                    value={distributionInput.bags_count || ''}
                    onChange={(e) => setDistributionInput({ ...distributionInput, bags_count: parseInt(e.target.value) || 0 })}
                    className="w-32 px-4 py-2 border border-gray-300 rounded-lg"
                  />
                  <button
                    onClick={handleAddDistribution}
                    className="px-4 py-2 bg-green-700 hover:bg-green-800 text-white rounded-lg"
                  >
                    <PlusCircle className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-gray-900 mb-2">
                  {language === 'ar' ? 'سجل التوزيع' : 'Distribution History'}
                </h4>
                <div className="space-y-2">
                  {selectedCampaign.distribution_locations?.map((loc: any, index: number) => (
                    <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-gray-500" />
                        <span className="font-medium">{loc.name}</span>
                      </div>
                      <div className="text-sm">
                        <span className="font-bold text-green-700">{loc.bags}</span> {language === 'ar' ? 'كيس' : 'bags'}
                        <span className="text-gray-500 mr-2">
                          {new Date(loc.date).toLocaleDateString('ar-SA')}
                        </span>
                      </div>
                    </div>
                  ))}
                  {(!selectedCampaign.distribution_locations || selectedCampaign.distribution_locations.length === 0) && (
                    <p className="text-gray-500 text-center py-4">
                      {language === 'ar' ? 'لا يوجد توزيعات بعد' : 'No distributions yet'}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
