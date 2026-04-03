import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { BarChart3, Users, Gift, Eye, TrendingUp, CheckCircle } from 'lucide-react';

interface CampaignStats {
  campaign_id: string;
  campaign_name: string;
  total_scans: number;
  total_plays: number;
  total_wins: number;
  total_redeemed: number;
  win_rate: number;
  redemption_rate: number;
}

export default function AdvertiserDashboard({ userId }: { userId: string }) {
  const [stats, setStats] = useState<CampaignStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalStats, setTotalStats] = useState({
    totalScans: 0,
    totalPlays: 0,
    totalWins: 0,
    totalRedeemed: 0
  });

  useEffect(() => {
    loadStats();
  }, [userId]);

  const loadStats = async () => {
    try {
      const { data: campaigns } = await supabase
        .from('campaigns')
        .select('id, store_name')
        .eq('user_id', userId);

      if (!campaigns) return;

      const statsPromises = campaigns.map(async (campaign) => {
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
          campaign_id: campaign.id,
          campaign_name: campaign.store_name,
          total_scans: plays,
          total_plays: plays,
          total_wins: wins,
          total_redeemed: redeemed,
          win_rate: plays > 0 ? (wins / plays) * 100 : 0,
          redemption_rate: wins > 0 ? (redeemed / wins) * 100 : 0
        };
      });

      const campaignStats = await Promise.all(statsPromises);
      setStats(campaignStats);

      const totals = campaignStats.reduce(
        (acc, stat) => ({
          totalScans: acc.totalScans + stat.total_scans,
          totalPlays: acc.totalPlays + stat.total_plays,
          totalWins: acc.totalWins + stat.total_wins,
          totalRedeemed: acc.totalRedeemed + stat.total_redeemed
        }),
        { totalScans: 0, totalPlays: 0, totalWins: 0, totalRedeemed: 0 }
      );

      setTotalStats(totals);
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6" dir="rtl">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">لوحة التحكم</h1>
          <p className="text-gray-600">تتبع أداء حملاتك الإعلانية</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Eye className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">إجمالي المسحات</p>
                <p className="text-2xl font-bold text-gray-900">{totalStats.totalScans}</p>
              </div>
            </div>
            <div className="flex items-center gap-1 text-sm text-green-600">
              <TrendingUp className="w-4 h-4" />
              <span>نشط</span>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">مرات اللعب</p>
                <p className="text-2xl font-bold text-gray-900">{totalStats.totalPlays}</p>
              </div>
            </div>
            <p className="text-sm text-gray-600">
              معدل اللعب: {totalStats.totalScans > 0 ? ((totalStats.totalPlays / totalStats.totalScans) * 100).toFixed(1) : 0}%
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Gift className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">الفائزين</p>
                <p className="text-2xl font-bold text-gray-900">{totalStats.totalWins}</p>
              </div>
            </div>
            <p className="text-sm text-gray-600">
              معدل الفوز: {totalStats.totalPlays > 0 ? ((totalStats.totalWins / totalStats.totalPlays) * 100).toFixed(1) : 0}%
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">الجوائز المستلمة</p>
                <p className="text-2xl font-bold text-gray-900">{totalStats.totalRedeemed}</p>
              </div>
            </div>
            <p className="text-sm text-gray-600">
              معدل الاستلام: {totalStats.totalWins > 0 ? ((totalStats.totalRedeemed / totalStats.totalWins) * 100).toFixed(1) : 0}%
            </p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <BarChart3 className="w-6 h-6 text-blue-600" />
              <h2 className="text-xl font-bold text-gray-900">أداء الحملات</h2>
            </div>
          </div>

          <div className="overflow-x-auto">
            {stats.length === 0 ? (
              <div className="p-12 text-center">
                <p className="text-gray-500">لا توجد حملات نشطة حالياً</p>
                <p className="text-sm text-gray-400 mt-2">ابدأ حملتك الأولى لرؤية الإحصائيات</p>
              </div>
            ) : (
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-right text-sm font-medium text-gray-600">الحملة</th>
                    <th className="px-6 py-4 text-center text-sm font-medium text-gray-600">المسحات</th>
                    <th className="px-6 py-4 text-center text-sm font-medium text-gray-600">مرات اللعب</th>
                    <th className="px-6 py-4 text-center text-sm font-medium text-gray-600">الفائزين</th>
                    <th className="px-6 py-4 text-center text-sm font-medium text-gray-600">المستلمة</th>
                    <th className="px-6 py-4 text-center text-sm font-medium text-gray-600">معدل الفوز</th>
                    <th className="px-6 py-4 text-center text-sm font-medium text-gray-600">معدل الاستلام</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {stats.map((stat) => (
                    <tr key={stat.campaign_id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <p className="font-medium text-gray-900">{stat.campaign_name}</p>
                      </td>
                      <td className="px-6 py-4 text-center text-gray-900">{stat.total_scans}</td>
                      <td className="px-6 py-4 text-center text-gray-900">{stat.total_plays}</td>
                      <td className="px-6 py-4 text-center text-gray-900">{stat.total_wins}</td>
                      <td className="px-6 py-4 text-center text-gray-900">{stat.total_redeemed}</td>
                      <td className="px-6 py-4 text-center">
                        <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                          {stat.win_rate.toFixed(1)}%
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                          {stat.redemption_rate.toFixed(1)}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mt-8">
          <h3 className="font-bold text-blue-900 mb-3">💡 نصائح لتحسين الأداء</h3>
          <ul className="space-y-2 text-sm text-blue-800">
            <li>• اختر جوائز جذابة لزيادة نسبة اللعب</li>
            <li>• حدد موقع محلك بدقة لاستهداف الحي الصحيح</li>
            <li>• راقب معدل الاستلام - إذا كان منخفضاً، تواصل مع الفائزين</li>
            <li>• استخدم فترة صلاحية مناسبة للجوائز (24-48 ساعة)</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
