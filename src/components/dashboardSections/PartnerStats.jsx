import React, { useMemo, useState } from 'react';
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  Users,
  PieChart,
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { getPartnerStats, getPartnerDetails, getPartnerProfitGrowth } from '../../pages/dashboard/dashboardApi';
import { useDashboardFilter } from '../../pages/dashboard/DashboardFilterContext';
import { useCountUp } from '../../hooks/useCountUp';
import { Link } from 'react-router-dom';
import ResponsiveTable from './ResponsiveTable';

const MONTHS_FIRST = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو'];
const MONTHS_LAST = ['يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];

const PartnerStats = React.memo(() => {
  const { getApiFilter } = useDashboardFilter();
  const apiFilter = getApiFilter();
  const [profitChartPeriod, setProfitChartPeriod] = useState('first');
  const [hoveredProfitBar, setHoveredProfitBar] = useState(null);

  const { data: stats, isLoading } = useQuery({
    queryKey: ['partner-stats', apiFilter],
    queryFn: () => getPartnerStats(apiFilter),
  });

  const { data: partnerDetails = [], isLoading: detailsLoading } = useQuery({
    queryKey: ['dashboard', 'partner-details'],
    queryFn: () => getPartnerDetails(10),
  });

  const { data: profitGrowth = [] } = useQuery({
    queryKey: ['dashboard', 'partner-profit-growth', profitChartPeriod],
    queryFn: () => getPartnerProfitGrowth(6, profitChartPeriod),
  });

  const animatedCapital = useCountUp(stats?.totalCapitalAmount || 0, 600, !isLoading);
  const animatedProfit = useCountUp(stats?.totalProfit || 0, 600, !isLoading);
  const animatedActivePartners = useCountUp(stats?.activePartners || 0, 600, !isLoading);

  const formatAmount = (n) => {
    if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
    return Number(n).toLocaleString('en-US');
  };

  const pieData = useMemo(() => {
    if (partnerDetails.length === 0) {
      return [];
    }
    
    // Group by partner type (old vs new)
    const oldPartners = partnerDetails.filter(p => !p.isNewPartner);
    const newPartners = partnerDetails.filter(p => p.isNewPartner);
    
    const oldTotal = oldPartners.reduce((s, p) => s + p.sharePercent, 0);
    const newTotal = newPartners.reduce((s, p) => s + p.sharePercent, 0);
    
    const result = [];
    
    if (oldTotal > 0) {
      result.push({
        label: `الشركاء القدامي (${oldPartners.length})`,
        value: oldTotal,
        color: '#2e8a45',
        partners: oldPartners,
      });
    }
    
    if (newTotal > 0) {
      result.push({
        label: `الشركاء الجدد (${newPartners.length})`,
        value: newTotal,
        color: '#6ee7b7',
        partners: newPartners,
      });
    }
    
    return result;
  }, [partnerDetails]);

  const profitChartData = useMemo(() => {
    if (profitGrowth?.length > 0) {
      return profitGrowth.map((item) => ({
        month: item.month,
        value: item.totalProfit ?? 0,
      }));
    }
    return (profitChartPeriod === 'last' ? MONTHS_LAST : MONTHS_FIRST).map((m) => ({ month: m, value: 0 }));
  }, [profitGrowth, profitChartPeriod]);

  const formatDate = (d) => {
    if (!d) return '—';
    const date = new Date(d);
    return date.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="size-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <p className="text-slate-500 text-sm font-medium">إجمالي رأس المال</p>
            <div className="bg-primary/10 text-primary p-2 rounded-lg">
              <Wallet className="size-5" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-black text-slate-900 dark:text-white">
              {formatAmount(animatedCapital)}
            </h3>
            {stats?.capitalTrend !== undefined && stats?.capitalTrend !== 0 && (
              <p className={`text-xs font-bold mt-1 flex items-center gap-1 ${
                stats.capitalTrend >= 0 ? 'text-emerald-600' : 'text-red-600'
              }`}>
                {stats.capitalTrend >= 0 ? (
                  <TrendingUp className="size-3.5" />
                ) : (
                  <TrendingDown className="size-3.5" />
                )}
                {stats.capitalTrend >= 0 ? '+' : ''}{stats.capitalTrend}% {stats.trendLabel || 'منذ الشهر الماضي'}
              </p>
            )}
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <p className="text-slate-500 text-sm font-medium">إجمالي الأرباح الموزعة</p>
            <div className="bg-blue-500/10 text-blue-500 p-2 rounded-lg">
              <TrendingUp className="size-5" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-black text-slate-900 dark:text-white">
              {formatAmount(animatedProfit)}
            </h3>
            {stats?.profitTrend !== undefined && stats?.profitTrend !== 0 && (
              <p className={`text-xs font-bold mt-1 flex items-center gap-1 ${
                stats.profitTrend >= 0 ? 'text-emerald-600' : 'text-red-600'
              }`}>
                {stats.profitTrend >= 0 ? (
                  <TrendingUp className="size-3.5" />
                ) : (
                  <TrendingDown className="size-3.5" />
                )}
                {stats.profitTrend >= 0 ? '+' : ''}{stats.profitTrend}% {stats.trendLabel || 'منذ الشهر الماضي'}
              </p>
            )}
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <p className="text-slate-500 text-sm font-medium">عدد الشركاء النشطين</p>
            <div className="bg-purple-500/10 text-purple-500 p-2 rounded-lg">
              <Users className="size-5" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-black text-slate-900 dark:text-white">
              {animatedActivePartners} شريك
            </h3>
            <p className="text-slate-400 text-xs font-medium mt-1">تحديث: منذ ساعتين</p>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Share Distribution Donut */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h4 className="font-bold text-slate-900 dark:text-white">توزيع حصص الشركاء</h4>
            <PieChart className="size-5 text-slate-400" />
          </div>
          <div className="flex items-center justify-center py-4 relative">
            {pieData.length === 0 ? (
              <div className="text-center text-slate-500 py-8">
                لا يوجد شركاء
              </div>
            ) : (
              <div className="relative flex items-center justify-center">
                <svg className="w-48 h-48 -rotate-90" viewBox="0 0 256 256">
                  <circle cx="128" cy="128" fill="transparent" r="100" stroke="#e2e8f0" strokeWidth="25" className="dark:stroke-slate-700" />
                  {pieData.map((item, i) => {
                    const prev = pieData.slice(0, i).reduce((s, x) => s + x.value, 0);
                    const circumference = 2 * Math.PI * 100;
                    const offset = (prev / 100) * circumference;
                    const pct = (item.value / 100) * circumference;
                    return (
                      <circle
                        key={item.label}
                        cx="128"
                        cy="128"
                        r="100"
                        fill="transparent"
                        stroke={item.color}
                        strokeWidth="25"
                        strokeDasharray={`${pct} ${circumference}`}
                        strokeDashoffset={-offset}
                      />
                    );
                  })}
                </svg>
                <div className="absolute flex flex-col items-center">
                  <p className="text-2xl font-black text-slate-900 dark:text-white leading-tight">
                    {pieData.reduce((s, x) => s + x.value, 0).toFixed(0)}%
                  </p>
                  <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">إجمالي الحصص</p>
                </div>
              </div>
            )}
          </div>
          <div className="space-y-3 mt-8">
            {pieData.map((item) => (
              <div key={item.label} className="border border-slate-100 dark:border-slate-700 rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div
                      className="size-3 rounded-full shrink-0"
                      style={{ backgroundColor: item.color }}
                    />
                    <p className="text-sm font-bold text-slate-900 dark:text-white">
                      {item.label}
                    </p>
                  </div>
                  <p className="text-lg font-black text-primary">{item.value.toFixed(1)}%</p>
                </div>
                {item.partners && item.partners.length > 0 && (
                  <div className="text-xs text-slate-500 mr-5">
                    {item.partners.slice(0, 3).map(p => p.name).join(' • ')}
                    {item.partners.length > 3 && ` • +${item.partners.length - 3}`}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Profit Growth Bar Chart */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <h4 className="font-bold text-lg text-slate-900 dark:text-white">نمو أرباح الشركاء</h4>
              <p className="text-xs text-slate-500 mt-1">
                {profitChartPeriod === 'first' ? 'أول 6 أشهر من السنة الحالية' : 'آخر 6 أشهر من السنة الحالية'}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setProfitChartPeriod('first')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  profitChartPeriod === 'first'
                    ? 'bg-primary text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-primary/10 hover:text-primary'
                }`}
              >
                أول 6 أشهر
              </button>
              <button
                type="button"
                onClick={() => setProfitChartPeriod('last')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  profitChartPeriod === 'last'
                    ? 'bg-primary text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-primary/10 hover:text-primary'
                }`}
              >
                آخر 6 أشهر
              </button>
            </div>
          </div>
          <div className="space-y-4">
            {profitChartData.map((item) => {
              const maxVal = Math.max(...profitChartData.map((d) => d.value), 1);
              const pct = maxVal > 0 ? (item.value / maxVal) * 100 : 0;
              const formatAmount = (n) => {
                if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
                if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
                return n.toLocaleString('en-US');
              };
              return (
                <div key={item.month} className="flex items-center gap-3 relative group">
                  <span className="w-16 text-sm font-medium text-slate-700 dark:text-slate-300 shrink-0">{item.month}</span>
                  <div 
                    className="flex-1 h-8 bg-slate-100 dark:bg-slate-800 rounded-lg overflow-hidden cursor-pointer"
                    onMouseEnter={() => setHoveredProfitBar(item.month)}
                    onMouseLeave={() => setHoveredProfitBar(null)}
                  >
                    <div
                      className="h-full bg-primary rounded-lg transition-all duration-300"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="w-20 text-sm font-bold text-slate-900 dark:text-slate-100 text-left shrink-0">
                    {formatAmount(item.value)}
                  </span>
                  {hoveredProfitBar === item.month && (
                    <div className="absolute left-1/2 top-full mt-2 transform -translate-x-1/2 bg-slate-900 dark:bg-slate-700 text-white px-3 py-2 rounded-lg text-xs font-bold shadow-lg z-10 whitespace-nowrap">
                      {item.month}: {item.value.toLocaleString('en-US')}
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2">
                        <div className="border-4 border-transparent border-b-slate-900 dark:border-b-slate-700" />
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Table: تفاصيل أرصدة الشركاء */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <h4 className="font-bold text-slate-900 dark:text-white">تفاصيل أرصدة الشركاء</h4>
          <Link to="/investors" className="text-primary text-sm font-bold hover:underline">
            عرض الكل
          </Link>
        </div>
        <div className="p-4 sm:p-6">
          <ResponsiveTable
            columns={[
              { id: 'name', label: 'اسم الشريك', render: (_, row) => (
                <span className="font-bold text-slate-900 dark:text-white">{row.name}</span>
              )},
              { id: 'sharePercent', label: 'الحصة (%)', format: (v) => `${v}%` },
              { id: 'balance', label: 'الرصيد الحالي', format: (v) => Number(v || 0).toLocaleString('en-US') },
              { id: 'lastProfit', label: 'آخر دفعة أرباح', render: (_, row) => (
                <div className="text-sm">
                  <p className="font-medium text-slate-900 dark:text-white">
                    {Number(row.lastProfitAmount || 0).toLocaleString('en-US')}
                  </p>
                  <p className="text-[10px] text-slate-500">{formatDate(row.lastProfitDate)}</p>
                </div>
              )},
              { id: 'status', label: 'الحالة', render: (_, row) => (
                <span
                  className={`inline-flex items-center px-2 py-1 rounded-full text-[10px] font-bold ${
                    row.status === 'نشط'
                      ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400'
                      : row.status === 'قيد المراجعة'
                      ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  {row.status}
                </span>
              )},
            ]}
            data={partnerDetails}
            isLoading={detailsLoading}
            emptyMessage="لا يوجد شركاء"
            keyField="id"
          />
        </div>
      </div>
    </div>
  );
});

PartnerStats.displayName = 'PartnerStats';

export default PartnerStats;
