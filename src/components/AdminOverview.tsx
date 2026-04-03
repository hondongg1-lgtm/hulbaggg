import { BarChart3, Users, Gift, Eye, TrendingUp, CheckCircle, ShoppingBag, Store, Activity } from 'lucide-react';

interface OverviewStats {
  totalCampaigns: number;
  totalAdvertisers: number;
  totalScans: number;
  totalPlays: number;
  totalWins: number;
  totalRedeemed: number;
  activeCampaigns: number;
  totalUsers: number;
}

interface AdminOverviewProps {
  stats: OverviewStats;
}

export default function AdminOverview({ stats }: AdminOverviewProps) {
  const statsCards = [
    {
      title: 'إجمالي الحملات',
      value: stats.totalCampaigns,
      activeValue: stats.activeCampaigns,
      icon: ShoppingBag,
      color: 'emerald',
      subtext: `${stats.activeCampaigns} نشطة`
    },
    {
      title: 'المعلنين',
      value: stats.totalAdvertisers,
      icon: Store,
      color: 'blue'
    },
    {
      title: 'المستخدمين',
      value: stats.totalUsers,
      icon: Users,
      color: 'orange'
    },
    {
      title: 'مرات اللعب',
      value: stats.totalPlays,
      icon: Activity,
      color: 'purple'
    },
    {
      title: 'الفائزين',
      value: stats.totalWins,
      icon: Gift,
      color: 'green'
    },
    {
      title: 'الجوائز المستلمة',
      value: stats.totalRedeemed,
      icon: CheckCircle,
      color: 'yellow'
    }
  ];

  const playRate = stats.totalPlays > 0 ? ((stats.totalPlays / Math.max(stats.totalScans, 1)) * 100).toFixed(1) : 0;
  const winRate = stats.totalPlays > 0 ? ((stats.totalWins / stats.totalPlays) * 100).toFixed(1) : 0;
  const redeemRate = stats.totalWins > 0 ? ((stats.totalRedeemed / stats.totalWins) * 100).toFixed(1) : 0;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {statsCards.map((stat) => (
          <div key={stat.title} className="bg-white rounded-xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
            <div className="flex flex-col items-center text-center">
              <div className={`w-12 h-12 bg-${stat.color}-100 rounded-lg flex items-center justify-center mb-3`}>
                <stat.icon className={`w-6 h-6 text-${stat.color}-600`} />
              </div>
              <p className="text-sm text-slate-600 mb-1">{stat.title}</p>
              <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
              {stat.subtext && (
                <p className="text-xs text-slate-500 mt-1">{stat.subtext}</p>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border-2 border-emerald-200 rounded-xl p-6">
          <h3 className="font-bold text-emerald-900 mb-4 flex items-center gap-2">
            <TrendingUp size={20} />
            معدلات الأداء
          </h3>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm text-emerald-800">معدل اللعب</span>
                <span className="text-lg font-bold text-emerald-900">{playRate}%</span>
              </div>
              <div className="w-full bg-emerald-200 rounded-full h-2">
                <div className="bg-emerald-600 h-2 rounded-full" style={{ width: `${playRate}%` }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm text-emerald-800">معدل الفوز</span>
                <span className="text-lg font-bold text-emerald-900">{winRate}%</span>
              </div>
              <div className="w-full bg-emerald-200 rounded-full h-2">
                <div className="bg-emerald-600 h-2 rounded-full" style={{ width: `${winRate}%` }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm text-emerald-800">معدل الاستلام</span>
                <span className="text-lg font-bold text-emerald-900">{redeemRate}%</span>
              </div>
              <div className="w-full bg-emerald-200 rounded-full h-2">
                <div className="bg-emerald-600 h-2 rounded-full" style={{ width: `${redeemRate}%` }}></div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-200 rounded-xl p-6">
          <h3 className="font-bold text-blue-900 mb-4 flex items-center gap-2">
            <BarChart3 size={20} />
            متوسطات الحملات
          </h3>
          <div className="space-y-3 text-blue-800">
            <div className="flex justify-between items-center p-2 bg-white/50 rounded-lg">
              <span className="text-sm">حملات لكل معلن</span>
              <span className="font-bold text-lg">
                {stats.totalAdvertisers > 0 ? (stats.totalCampaigns / stats.totalAdvertisers).toFixed(1) : 0}
              </span>
            </div>
            <div className="flex justify-between items-center p-2 bg-white/50 rounded-lg">
              <span className="text-sm">لعب لكل حملة</span>
              <span className="font-bold text-lg">
                {stats.totalCampaigns > 0 ? (stats.totalPlays / stats.totalCampaigns).toFixed(0) : 0}
              </span>
            </div>
            <div className="flex justify-between items-center p-2 bg-white/50 rounded-lg">
              <span className="text-sm">فائزين لكل حملة</span>
              <span className="font-bold text-lg">
                {stats.totalCampaigns > 0 ? (stats.totalWins / stats.totalCampaigns).toFixed(0) : 0}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200 rounded-xl p-6">
          <h3 className="font-bold text-purple-900 mb-4 flex items-center gap-2">
            <Gift size={20} />
            إحصائيات الجوائز
          </h3>
          <div className="space-y-3 text-purple-800">
            <div className="flex justify-between items-center p-2 bg-white/50 rounded-lg">
              <span className="text-sm">جوائز مسلمة</span>
              <span className="font-bold text-lg">{stats.totalRedeemed}</span>
            </div>
            <div className="flex justify-between items-center p-2 bg-white/50 rounded-lg">
              <span className="text-sm">بانتظار الاستلام</span>
              <span className="font-bold text-lg">{stats.totalWins - stats.totalRedeemed}</span>
            </div>
            <div className="flex justify-between items-center p-2 bg-white/50 rounded-lg">
              <span className="text-sm">نسبة الاستلام</span>
              <span className="font-bold text-lg">{redeemRate}%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
