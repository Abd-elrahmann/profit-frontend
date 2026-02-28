import React, { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { TrendingUp, TrendingDown, Wallet, CreditCard, CheckCircle } from 'lucide-react';
import { getClientStats, getLoanStats, getTopCommittedClients, getClientRegistrationGrowth } from '../../pages/dashboard/dashboardApi';
import { useDashboardFilter } from '../../pages/dashboard/DashboardFilterContext';
import { useCountUp } from '../../hooks/useCountUp';
import { Link } from 'react-router-dom';
import ResponsiveTable from './ResponsiveTable';
const MONTHS_FIRST = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو'];
const MONTHS_LAST = ['يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];
const ClientStats = React.memo(() => {
  const { getApiFilter } = useDashboardFilter();
  const [chartPeriod, setChartPeriod] = useState('first');
  const [hoveredBar, setHoveredBar] = useState(null);
  const apiFilter = getApiFilter();
  const { data: stats, isLoading } = useQuery({
    queryKey: ['client-stats', apiFilter],
    queryFn: () => getClientStats(apiFilter),
  });
  const { data: loanStats } = useQuery({
    queryKey: ['dashboard', 'loan-stats', apiFilter],
    queryFn: () => getLoanStats(apiFilter),
  });
  const { data: topClients = [], isLoading: clientsLoading } = useQuery({
    queryKey: ['dashboard', 'top-committed-clients'],
    queryFn: () => getTopCommittedClients(5),
  });
  const { data: clientGrowth = [] } = useQuery({
    queryKey: ['dashboard', 'client-registration-growth', chartPeriod],
    queryFn: () => getClientRegistrationGrowth(6, chartPeriod),
  });
  const animatedCount = useCountUp(stats?.count || 0, 600, !isLoading);
  const animatedActiveLoans = useCountUp(loanStats?.loans?.byStatus?.ACTIVE || 0, 600, !isLoading);
  const animatedTotalAmount = useCountUp(loanStats?.loans?.totalAmount || 0, 600, !isLoading);
  const pieData = useMemo(() => {
    const total = stats?.count || 1;
    const active = stats?.activeCount || 0;
    const completed = stats?.completedCount || 0;
    const defaulted = stats?.overdueCount || 0;
    return [
      { label: 'نشط', value: Math.round((active / total) * 100) || 0, color: '#2e8a45' },
      { label: 'منتهي', value: Math.round((completed / total) * 100) || 0, color: '#f59e0b' },
      { label: 'متعثر', value: Math.round((defaulted / total) * 100) || 0, color: '#ef4444' },
    ];
  }, [stats]);
  const barChartData = useMemo(() => {
    if (clientGrowth?.length > 0) {
      return clientGrowth.map((item) => ({
        month: item.month,
        value: item.count ?? item.value ?? 0,
      }));
    }
    return (chartPeriod === 'last' ? MONTHS_LAST : MONTHS_FIRST).map((m) => ({ month: m, value: 0 }));
  }, [clientGrowth, chartPeriod]);
  const formatAmount = (n) => {
    if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
    return Number(n).toLocaleString('en-US');
  };
  const getCommitmentLabel = (pct) => {
    if (pct >= 95) return 'ملتزم تماماً';
    if (pct >= 85) return 'ملتزم';
    return 'جيد';
  };
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="size-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }
  return (
    <div className="space-y-4 sm:space-y-6">
      {}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
        <div className="bg-white dark:bg-[#141e16] p-4 sm:p-6 rounded-xl border border-primary/10 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-slate-500 text-sm font-medium mb-1">إجمالي العملاء</p>
            <h3 className="text-3xl font-bold text-slate-900 dark:text-slate-100">{animatedCount}</h3>
          </div>
          <div className="flex flex-col items-end">
            {stats?.clientsTrend !== undefined && stats?.clientsTrend !== 0 && (
              <>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  stats.clientsTrend >= 0 
                    ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400'
                    : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400'
                }`}>
                  {stats.clientsTrend >= 0 ? (
                    <TrendingUp className="size-3.5 ml-1" />
                  ) : (
                    <TrendingDown className="size-3.5 ml-1" />
                  )}
                  {stats.clientsTrend >= 0 ? '+' : ''}{stats.clientsTrend}%
                </span>
                <p className="text-[11px] text-slate-400 mt-2">{stats.trendLabel || 'منذ الشهر الماضي'}</p>
              </>
            )}
            {(stats?.clientsTrend === undefined || stats?.clientsTrend === 0) && (
              <div className="size-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <TrendingUp className="size-5 text-primary" />
              </div>
            )}
          </div>
        </div>
        <div className="bg-white dark:bg-[#141e16] p-4 sm:p-6 rounded-xl border border-primary/10 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-slate-500 text-sm font-medium mb-1">السلف النشطة</p>
            <h3 className="text-3xl font-bold text-slate-900 dark:text-slate-100">{animatedActiveLoans}</h3>
          </div>
          <div className="flex flex-col items-end">
            {loanStats?.loans?.activeLoansTrend !== undefined && loanStats?.loans?.activeLoansTrend !== 0 && (
              <>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  loanStats.loans.activeLoansTrend >= 0 
                    ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400'
                    : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400'
                }`}>
                  {loanStats.loans.activeLoansTrend >= 0 ? (
                    <TrendingUp className="size-3.5 ml-1" />
                  ) : (
                    <TrendingDown className="size-3.5 ml-1" />
                  )}
                  {loanStats.loans.activeLoansTrend >= 0 ? '+' : ''}{loanStats.loans.activeLoansTrend}%
                </span>
                <p className="text-[11px] text-slate-400 mt-2">{loanStats.loans.trendLabel || 'منذ الشهر الماضي'}</p>
              </>
            )}
            {(loanStats?.loans?.activeLoansTrend === undefined || loanStats?.loans?.activeLoansTrend === 0) && (
              <div className="size-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <CreditCard className="size-5 text-primary" />
              </div>
            )}
          </div>
        </div>
        <div className="bg-white dark:bg-[#141e16] p-4 sm:p-6 rounded-xl border border-primary/10 shadow-sm flex items-center justify-between sm:col-span-2 md:col-span-1">
          <div>
            <p className="text-slate-500 text-sm font-medium mb-1">إجمالي المبالغ المصروفة</p>
            <h3 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
              {formatAmount(animatedTotalAmount)}
            </h3>
          </div>
          <div className="flex flex-col items-end">
            {loanStats?.loans?.totalAmountTrend !== undefined && loanStats?.loans?.totalAmountTrend !== 0 && (
              <>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  loanStats.loans.totalAmountTrend >= 0 
                    ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400'
                    : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400'
                }`}>
                  {loanStats.loans.totalAmountTrend >= 0 ? (
                    <TrendingUp className="size-3.5 ml-1" />
                  ) : (
                    <TrendingDown className="size-3.5 ml-1" />
                  )}
                  {loanStats.loans.totalAmountTrend >= 0 ? '+' : ''}{loanStats.loans.totalAmountTrend}%
                </span>
                <p className="text-[11px] text-slate-400 mt-2">{loanStats.loans.trendLabel || 'منذ الشهر الماضي'}</p>
              </>
            )}
            {(loanStats?.loans?.totalAmountTrend === undefined || loanStats?.loans?.totalAmountTrend === 0) && (
              <div className="size-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <Wallet className="size-5 text-primary" />
              </div>
            )}
          </div>
        </div>
      </div>
      {}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {}
        <div className="bg-white dark:bg-[#141e16] p-4 sm:p-6 rounded-xl border border-primary/10 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between mb-6">
            <h4 className="font-bold text-lg text-slate-900 dark:text-slate-100">تصنيف العملاء</h4>
          </div>
          <div className="flex items-center justify-center py-4 relative">
            <svg className="w-48 h-48 sm:w-56 sm:h-56 md:w-64 md:h-64 transform -rotate-90" viewBox="0 0 256 256">
              <circle cx="128" cy="128" fill="transparent" r="100" stroke="#e2e8f0" strokeWidth="25" />
              <circle
                cx="128"
                cy="128"
                fill="transparent"
                r="100"
                stroke={pieData[0]?.color || '#2e8a45'}
                strokeDasharray={`${(pieData[0]?.value || 0) * 6.28} 628`}
                strokeWidth="25"
              />
              <circle
                cx="128"
                cy="128"
                fill="transparent"
                r="100"
                stroke={pieData[1]?.color || '#f59e0b'}
                strokeDasharray={`${(pieData[1]?.value || 0) * 6.28} 628`}
                strokeDashoffset={-((pieData[0]?.value || 0) * 6.28)}
                strokeWidth="25"
              />
              <circle
                cx="128"
                cy="128"
                fill="transparent"
                r="100"
                stroke={pieData[2]?.color || '#ef4444'}
                strokeDasharray={`${(pieData[2]?.value || 0) * 6.28} 628`}
                strokeDashoffset={-(((pieData[0]?.value || 0) + (pieData[1]?.value || 0)) * 6.28)}
                strokeWidth="25"
              />
            </svg>
            <div className="absolute flex flex-col items-center">
              <span className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                {stats?.count?.toLocaleString('en-US') || 0}
              </span>
              <span className="text-xs text-slate-500">إجمالي الحالات</span>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2 mt-6">
            {pieData.map((item) => (
              <div
                key={item.label}
                className={`flex flex-col items-center p-3 rounded-lg border ${
                  item.color === '#2e8a45'
                    ? 'bg-primary/5 border-primary/10'
                    : item.color === '#f59e0b'
                    ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-100 dark:border-amber-800'
                    : 'bg-red-50 dark:bg-red-900/20 border-red-100 dark:border-red-800'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="size-2 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-xs font-medium">{item.label}</span>
                </div>
                <span className="font-bold">{item.value}%</span>
              </div>
            ))}
          </div>
        </div>
        {}
        <div className="bg-white dark:bg-[#141e16] p-4 sm:p-6 rounded-xl border border-primary/10 shadow-sm overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <h4 className="font-bold text-lg text-slate-900 dark:text-slate-100">نمو تسجيل العملاء</h4>
              <p className="text-xs text-slate-500 mt-1">
                {chartPeriod === 'first' ? 'أول 6 أشهر من السنة الحالية' : 'آخر 6 أشهر من السنة الحالية'}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setChartPeriod('first')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  chartPeriod === 'first'
                    ? 'bg-primary text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-primary/10 hover:text-primary'
                }`}
              >
                أول 6 أشهر
              </button>
              <button
                type="button"
                onClick={() => setChartPeriod('last')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  chartPeriod === 'last'
                    ? 'bg-primary text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-primary/10 hover:text-primary'
                }`}
              >
                آخر 6 أشهر
              </button>
            </div>
          </div>
          <div className="space-y-4">
            {barChartData.map((item) => {
              const maxVal = Math.max(...barChartData.map((d) => d.value), 1);
              const pct = maxVal > 0 ? (item.value / maxVal) * 100 : 0;
              return (
                <div key={item.month} className="flex items-center gap-3 relative group">
                  <span className="w-16 text-sm font-medium text-slate-700 dark:text-slate-300 shrink-0">{item.month}</span>
                  <div 
                    className="flex-1 h-8 bg-slate-100 dark:bg-slate-800 rounded-lg overflow-hidden cursor-pointer"
                    onMouseEnter={() => setHoveredBar(item.month)}
                    onMouseLeave={() => setHoveredBar(null)}
                  >
                    <div
                      className="h-full bg-primary rounded-lg transition-all duration-300 min-w-[4px]"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="w-8 text-sm font-bold text-slate-900 dark:text-slate-100 text-left shrink-0">{item.value}</span>
                  {hoveredBar === item.month && (
                    <div className="absolute left-1/2 top-full mt-2 transform -translate-x-1/2 bg-slate-900 dark:bg-slate-700 text-white px-3 py-2 rounded-lg text-xs font-bold shadow-lg z-10 whitespace-nowrap">
                      {item.month}: {item.value} عميل
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
      {}
      <div className="bg-white dark:bg-[#141e16] rounded-xl border border-primary/10 shadow-sm overflow-hidden">
        <div className="p-4 sm:p-6 border-b border-primary/10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-primary/5">
          <h4 className="font-bold text-base sm:text-lg text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <CheckCircle className="size-5 text-primary shrink-0" />
            أفضل 5 عملاء ملتزمين
          </h4>
          <Link to="/clients" className="text-sm text-primary font-bold hover:underline">
            عرض الكل
          </Link>
        </div>
        <div className="p-4 sm:p-6">
          <ResponsiveTable
            columns={[
              { id: 'name', label: 'العميل', render: (_, row) => (
                <div className="flex justify-center">
                  <span className="font-bold text-sm text-slate-900 dark:text-slate-100">{row.name}</span>
                </div>
              )},
              { id: 'commitment', label: 'نقاط الالتزام', render: (_, row) => (
                <div className="flex justify-center">
                  <div className="flex items-center gap-2">
                    <div className="w-16 h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div className="bg-primary h-full rounded-full" style={{ width: `${row.commitment}%` }} />
                    </div>
                    <span className="text-sm font-bold">{row.commitment}%</span>
                  </div>
                </div>
              )},
              {
                id: 'loans',
                label: 'السلف',
                render: (_, row) => (
                  <div className="flex justify-center">
                    <span className="text-sm">
                      {row.completedLoansCount ?? 0} مكتملة من {row.loansCount ?? 0}
                    </span>
                  </div>
                ),
              },
              {
                id: 'totalPaid',
                label: 'المسدد لكل سلفة',
                render: (_, row) => {
                  const items = (row.loansPayments || []).slice(0, 3);
                  return (
                    <div className="flex justify-center">
                      <div className="flex flex-col gap-1 items-center">
                        {items.map((lp, i) => (
                          <span key={i} className="inline-flex items-center gap-1 text-sm">
                            <span className="text-slate-500 text-xs">سلفة {i + 1}:</span>
                            <span className="font-bold">{formatAmount(lp.paidAmount ?? 0)}</span>
                          </span>
                        ))}
                        {items.length === 0 && <span className="text-slate-500">—</span>}
                      </div>
                    </div>
                  );
                },
              },
              {
                id: 'loansPayments',
                label: 'دفعات كل سلفة',
                render: (_, row) => {
                  const items = (row.loansPayments || []).slice(0, 3);
                  return (
                    <div className="flex justify-center">
                      <div className="flex flex-col gap-1 items-center">
                        {items.map((lp, i) => (
                          <span key={i} className="inline-flex items-center gap-1 text-sm">
                            <span className="text-slate-500 text-xs">سلفة {i + 1}:</span>
                            <span className="font-bold">{lp.paidCount}/{lp.paymentsCount}</span>
                          </span>
                        ))}
                        {items.length === 0 && <span className="text-slate-500">—</span>}
                      </div>
                    </div>
                  );
                },
              },
              { id: 'status', label: 'الحالة', render: (_, row) => (
                <div className="flex justify-center">
                  <span className="inline-flex px-3 py-1 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-bold">
                    {getCommitmentLabel(row.commitment)}
                  </span>
                </div>
              )},
            ]}
            data={topClients}
            isLoading={clientsLoading}
            emptyMessage="لا يوجد عملاء"
            keyField="id"
          />
        </div>
      </div>
    </div>
  );
});
ClientStats.displayName = 'ClientStats';
export default ClientStats;