import React, { useMemo, useState } from 'react';
import { Clock, Receipt } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { getExpenseStats } from '../../pages/dashboard/dashboardApi';
import { useDashboardFilter } from '../../pages/dashboard/DashboardFilterContext';
import { useCountUp } from '../../hooks/useCountUp';
import { Link } from 'react-router-dom';
import ResponsiveTable from './ResponsiveTable';
const MONTHS_FIRST = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو'];
const MONTHS_LAST = ['يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];
const ExpenseStats = React.memo(() => {
  const { getApiFilter } = useDashboardFilter();
  const apiFilter = getApiFilter();
  const [chartPeriod, setChartPeriod] = useState('first');
  const [hoveredBar, setHoveredBar] = useState(null);
  const { data: stats, isLoading } = useQuery({
    queryKey: ['expense-stats', apiFilter, chartPeriod],
    queryFn: () => getExpenseStats(apiFilter, chartPeriod),
  });
  const animatedTotal = useCountUp(stats?.totalExpenses || 0, 600, !isLoading);
  const animatedPending = useCountUp(stats?.pendingAmount || 0, 600, !isLoading);
  const formatAmount = (n) => {
    if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
    return Number(n).toLocaleString('en-US');
  };
  const formatDate = (d) => {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('ar-EG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };
  const barChartData = useMemo(() => {
    if (stats?.monthlyTrend?.length > 0) {
      return stats.monthlyTrend.map((item) => ({
        month: item.month,
        value: item.amount ?? 0,
      }));
    }
    return (chartPeriod === 'last' ? MONTHS_LAST : MONTHS_FIRST).map((m) => ({ month: m, value: 0 }));
  }, [stats?.monthlyTrend, chartPeriod]);
  const maxMonthlyValue = useMemo(() => {
    const vals = barChartData.map((d) => d.value);
    return Math.max(...vals, 1);
  }, [barChartData]);
  const getStatusClass = (status) => {
    if (status === 'مكتمل') return 'text-green-600 dark:text-green-400';
    if (status === 'معلق') return 'text-red-600 dark:text-red-400';
    return 'text-amber-600 dark:text-amber-400';
  };
  const getTypeBadgeClass = (type) => {
    const map = {
      'مصروف رواتب': 'bg-primary/10 text-primary',
      'مصروف بنزين': 'bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400',
      'مصروفات انترنت': 'bg-primary/10 dark:bg-primary/20 text-primary dark:text-primary',
      'مصروفات ورقية': 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400',
      'مصروفات كهرباء': 'bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400',
      'مصروفات تشغيلية': 'bg-primary/10 text-primary',
      'مصروفات اخرى': 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400',
    };
    return map[type] || 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400';
  };
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="size-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }
  return (
    <div className="space-y-8">
      {}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-primary/10 shadow-sm flex flex-col gap-2">
          <div className="flex justify-between items-start">
            <p className="text-sm font-medium text-slate-500">إجمالي مصاريف الفترة</p>
            {stats?.totalTrend !== undefined && stats?.totalTrend !== 0 && (
              <span
                className={`text-xs font-bold px-2 py-1 rounded-full ${
                  stats.totalTrend >= 0
                    ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                    : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                }`}
              >
                {stats.totalTrend >= 0 ? '+' : ''}
                {stats.totalTrend}%
              </span>
            )}
          </div>
          <p className="text-3xl font-extrabold text-slate-900 dark:text-white">
            {formatAmount(animatedTotal)}
          </p>
          <div className="w-full bg-slate-100 dark:bg-slate-700 h-1.5 rounded-full mt-2 overflow-hidden">
            <div
              className="bg-primary h-full rounded-full transition-all"
              style={{
                width: `${Math.min((stats?.totalExpenses || 0) / Math.max(maxMonthlyValue, 1) * 100, 100)}%`,
              }}
            />
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-primary/10 shadow-sm flex flex-col gap-2">
          <div className="flex justify-between items-start">
            <p className="text-sm font-medium text-slate-500">المصاريف المعلقة</p>
            {stats?.pendingTrend !== undefined && stats?.pendingTrend !== 0 && (
              <span
                className={`text-xs font-bold px-2 py-1 rounded-full ${
                  stats.pendingTrend >= 0
                    ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                    : 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                }`}
              >
                {stats.pendingTrend >= 0 ? '+' : ''}
                {stats.pendingTrend}%
              </span>
            )}
          </div>
          <p className="text-3xl font-extrabold text-slate-900 dark:text-white">
            {formatAmount(animatedPending)}
          </p>
          <div className="flex items-center gap-1 text-xs text-slate-400 mt-2">
            <Clock className="size-3.5" />
            انتظار الموافقة
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-primary/10 shadow-sm flex flex-col gap-2">
          <div className="flex justify-between items-start">
            <p className="text-sm font-medium text-slate-500">أعلى فئة صرف</p>
          </div>
          {stats?.topCategory ? (
            <>
              <p className="text-2xl font-extrabold text-slate-900 dark:text-white">
                {stats.topCategory.type}
              </p>
              <p className="text-sm text-primary font-medium mt-2">
                {formatAmount(stats.topCategory.amount)} ({stats.topCategory.percentage}%)
              </p>
            </>
          ) : (
            <p className="text-slate-500 text-sm mt-2">لا توجد بيانات</p>
          )}
        </div>
      </div>
      {}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-primary/10 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <h3 className="font-bold text-slate-800 dark:text-slate-100">
                نمو المصاريف الشهرية
              </h3>
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
                  <span className="w-16 text-sm font-medium text-slate-700 dark:text-slate-300 shrink-0">
                    {item.month}
                  </span>
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
                  <span className="w-16 text-sm font-bold text-slate-900 dark:text-slate-100 text-left shrink-0">
                    {formatAmount(item.value)}
                  </span>
                  {hoveredBar === item.month && (
                    <div className="absolute left-1/2 top-full mt-2 transform -translate-x-1/2 bg-slate-900 dark:bg-slate-700 text-white px-3 py-2 rounded-lg text-xs font-bold shadow-lg z-10 whitespace-nowrap">
                      {item.month}: {formatAmount(item.value)}
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
        {}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-primary/10 shadow-sm">
          <h3 className="font-bold text-slate-800 dark:text-slate-100 mb-6">
            توزيع المصاريف حسب الفئة
          </h3>
          <div className="flex items-center gap-8 h-48">
            <div className="relative size-40 flex-shrink-0">
              <svg className="size-full -rotate-90" viewBox="0 0 36 36">
                <circle
                  className="stroke-slate-100 dark:stroke-slate-700"
                  cx="18"
                  cy="18"
                  fill="none"
                  r="16"
                  strokeWidth="4"
                />
                {(stats?.categoryBreakdown || []).map((item, i) => {
                  const circumference = 100;
                  const pct = item.percentage / 100;
                  const dashLength = pct * circumference;
                  const offset = (stats?.categoryBreakdown || [])
                    .slice(0, i)
                    .reduce((s, c) => s + (c.percentage / 100) * circumference, 0);
                  const colors = ['#2e8a45', '#f59e0b', '#60a5fa', '#818cf8', '#10b981', '#f43f5e', '#06b6d4'];
                  return (
                    <circle
                      key={item.type}
                      cx="18"
                      cy="18"
                      fill="none"
                      r="16"
                      strokeDasharray={`${dashLength} ${circumference}`}
                      strokeDashoffset={-offset}
                      strokeLinecap="round"
                      strokeWidth="4"
                      stroke={colors[i % colors.length]}
                    />
                  );
                })}
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                  {stats?.categoryBreakdown?.reduce((s, c) => s + c.percentage, 0) || 0}%
                </span>
                <span className="text-[10px] text-slate-400">إجمالي</span>
              </div>
            </div>
            <div className="flex flex-col gap-3 flex-1">
              {(stats?.categoryBreakdown || []).map((item, idx) => {
                const colors = ['#2e8a45', '#f59e0b', '#60a5fa', '#818cf8', '#10b981', '#f43f5e', '#06b6d4'];
                return (
                  <div key={item.type} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div
                        className="size-3 rounded-full shrink-0"
                        style={{ backgroundColor: colors[idx % colors.length] }}
                      />
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                        {item.type}
                      </span>
                    </div>
                    <span className="text-sm font-bold text-slate-900 dark:text-slate-100">
                      {item.percentage}%
                    </span>
                  </div>
                );
              })}
              {(!stats?.categoryBreakdown || stats.categoryBreakdown.length === 0) && (
                <p className="text-slate-500 text-sm">لا توجد بيانات</p>
              )}
            </div>
          </div>
        </div>
      </div>
      {}
      <div className="bg-white dark:bg-[#141e16] rounded-xl border border-primary/10 shadow-sm overflow-hidden">
        <div className="p-4 sm:p-6 border-b border-primary/10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-primary/5">
          <h4 className="font-bold text-base sm:text-lg text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Receipt className="size-5 text-primary shrink-0" />
            آخر المصاريف المسجلة
          </h4>
          <Link to="/expenses" className="text-sm text-primary font-bold hover:underline">
            عرض الكل
          </Link>
        </div>
        <div className="p-4 sm:p-6">
          <ResponsiveTable
            columns={[
              {
                id: 'description',
                label: 'الوصف',
                render: (_, row) => (
                  <div>
                    <span className="font-bold text-sm text-slate-900 dark:text-slate-100 block">
                      {row.description || row.type}
                    </span>
                    <span className="text-[10px] text-slate-400">{row.reference}</span>
                  </div>
                ),
              },
              {
                id: 'type',
                label: 'الفئة',
                render: (_, row) => (
                  <span className={`px-2 py-1 text-[11px] font-bold rounded ${getTypeBadgeClass(row.type)}`}>
                    {row.type}
                  </span>
                ),
              },
              { id: 'amount', label: 'المبلغ', format: (v) => formatAmount(v) },
              { id: 'createdAt', label: 'التاريخ', format: (v) => formatDate(v) },
              {
                id: 'status',
                label: 'الحالة',
                render: (_, row) => (
                  <div className={`flex items-center gap-1.5 font-bold ${getStatusClass(row.status)}`}>
                    <span
                      className={`size-1.5 rounded-full ${
                        row.status === 'مكتمل' ? 'bg-green-600' : row.status === 'معلق' ? 'bg-red-600' : 'bg-amber-600'
                      }`}
                    />
                    <span className="text-[11px]">{row.status}</span>
                  </div>
                ),
              },
            ]}
            data={stats?.recentExpenses || []}
            isLoading={isLoading}
            emptyMessage="لا توجد مصاريف"
            keyField="id"
          />
        </div>
      </div>
    </div>
  );
});
ExpenseStats.displayName = 'ExpenseStats';
export default ExpenseStats;