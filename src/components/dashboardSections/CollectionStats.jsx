import React, { useMemo, useEffect } from 'react';
import {
  Calendar,
  TrendingUp,
  BarChart3,
  Wallet,
  Check,
  X,
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useDashboardFilter } from '../../pages/dashboard/DashboardFilterContext';
import {
  getMonthlyCollection,
  getDailyCollectionTrend,
  getPendingReviewRepayments,
} from '../../pages/dashboard/dashboardApi';
import { useCountUp } from '../../hooks/useCountUp';
import { Link } from 'react-router-dom';
import ResponsiveTable from './ResponsiveTable';

const MONTH_NAMES = [
  'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
  'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر',
];

const CollectionStats = React.memo(() => {
  const [hoveredBar, setHoveredBar] = React.useState(null);
  const { setTabSubtitle } = useDashboardFilter();
  
  const { data: stats, isLoading } = useQuery({
    queryKey: ['monthly-collection'],
    queryFn: () => getMonthlyCollection(),
  });

  const { data: dailyTrend = [], isLoading: dailyLoading } = useQuery({
    queryKey: ['dashboard', 'daily-collection-trend'],
    queryFn: () => getDailyCollectionTrend(7),
  });

  const { data: pendingItems = [], isLoading: pendingLoading } = useQuery({
    queryKey: ['dashboard', 'pending-review-repayments'],
    queryFn: () => getPendingReviewRepayments(10),
  });

  const collectionPct = stats?.currentMonth?.collectionPercentage ?? 0;
  const animatedPct = useCountUp(collectionPct, 600, !isLoading);
  const targetAmount = stats?.currentMonth?.totalAmount ?? 0;
  const achievedAmount = stats?.currentMonth?.paidUntilNow ?? 0;

  const formatAmount = (n) => {
    if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
    return Number(n).toLocaleString('en-US');
  };

  const formatDate = (d) => {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  };

  const maxDailyValue = useMemo(() => {
    const vals = dailyTrend.map((d) => d.collected).filter((v) => v > 0);
    return Math.max(...vals, 1);
  }, [dailyTrend]);

  const currentMonthName = useMemo(() => {
    if (stats?.month !== undefined) return MONTH_NAMES[stats.month];
    const d = stats?.range?.startDate ? new Date(stats.range.startDate) : new Date();
    return MONTH_NAMES[d.getMonth()];
  }, [stats?.month, stats?.range?.startDate]);

  const currentYear = stats?.year ?? new Date().getFullYear();

  useEffect(() => {
    if (!isLoading && stats) {
      setTabSubtitle(`متابعة أداء التحصيلات والتدفقات المالية - ${currentMonthName} ${currentYear}`);
    }
    return () => setTabSubtitle('');
  }, [isLoading, stats, currentMonthName, currentYear, setTabSubtitle]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="size-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Gauge & Comparison Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Gauge */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 flex flex-col items-center justify-center shadow-sm">
          <p className="text-slate-600 dark:text-slate-400 text-sm font-medium mb-6">
            نسبة التحصيل لهذا الشهر
          </p>
          <div className="relative w-[200px] h-[110px] mb-2">
            <svg viewBox="0 0 200 110" className="w-full h-full">
              {/* Background arc */}
              <path
                d="M 10 100 A 90 90 0 0 1 190 100"
                fill="none"
                stroke="#e2e8f0"
                strokeWidth="16"
                strokeLinecap="round"
                className="dark:stroke-slate-700"
              />
              {/* Filled arc based on percentage */}
              <path
                d="M 10 100 A 90 90 0 0 1 190 100"
                fill="none"
                stroke="#2e8a45"
                strokeWidth="16"
                strokeLinecap="round"
                strokeDasharray={`${(Math.min(collectionPct, 100) / 100) * 283} 283`}
              />
            </svg>
          </div>
          <div className="text-center">
            <p className="text-4xl font-bold text-slate-900 dark:text-white">{animatedPct}%</p>
            {stats?.changeFromLastMonth !== undefined && (
              <div className={`flex items-center justify-center gap-1 text-sm font-bold mt-1 ${stats.changeFromLastMonth >= 0 ? 'text-primary' : 'text-red-500'}`}>
                <TrendingUp className={`size-3.5 ${stats.changeFromLastMonth < 0 ? 'rotate-180' : ''}`} />
                {stats.changeFromLastMonth >= 0 ? '+' : ''}{stats.changeFromLastMonth}% عن الشهر الماضي
              </div>
            )}
          </div>
        </div>

        {/* Target & Achieved Cards */}
        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-slate-800 p-8 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm relative overflow-hidden group">
            <div className="absolute -right-4 -top-4 bg-primary/5 size-24 rounded-full group-hover:scale-110 transition-transform" />
            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-3">
              المبلغ المستهدف
            </p>
            <h3 className="text-3xl font-black text-slate-900 dark:text-white">
              {formatAmount(targetAmount)}
            </h3>
            <div className="mt-4 flex items-center gap-2">
              <div className="h-1.5 flex-1 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                <div className="bg-slate-300 dark:bg-slate-500 w-full h-full" />
              </div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                المستهدف
              </span>
            </div>
          </div>
          <div className="bg-primary/5 dark:bg-primary/10 p-8 rounded-xl border border-primary/20 shadow-sm relative overflow-hidden group">
            <div className="absolute -right-4 -top-4 bg-primary/10 size-24 rounded-full group-hover:scale-110 transition-transform" />
            <p className="text-primary/80 dark:text-primary/60 text-sm font-bold mb-3">
              المحقق فعلياً
            </p>
            <h3 className="text-3xl font-black text-primary dark:text-white">
              {formatAmount(achievedAmount)}
            </h3>
            <div className="mt-4 flex items-center gap-2">
              <div className="h-1.5 flex-1 bg-primary/20 rounded-full overflow-hidden">
                <div
                  className="bg-primary h-full rounded-full transition-all"
                  style={{ width: `${targetAmount > 0 ? Math.min((achievedAmount / targetAmount) * 100, 100) : 0}%` }}
                />
              </div>
              <span className="text-[10px] font-bold text-primary uppercase tracking-tighter">
                {targetAmount > 0 ? Math.round((achievedAmount / targetAmount) * 100) : 0}% مكتمل
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Daily Bar Chart */}
      <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
        <div className="flex justify-between items-center mb-8">
          <h4 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <BarChart3 className="size-5 text-primary" />
            التحصيل اليومي (آخر 7 أيام)
          </h4>
          <div className="flex gap-4">
            <div className="flex items-center gap-2">
              <div className="size-3 bg-primary rounded-full" />
              <span className="text-xs text-slate-500">المحصل</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="size-3 bg-slate-200 dark:bg-slate-600 rounded-full" />
              <span className="text-xs text-slate-500">المتوقع</span>
            </div>
          </div>
        </div>
        <div className="flex gap-4">
          {/* Y-Axis */}
          <div className="flex flex-col justify-between h-48 py-2 text-[10px] text-slate-400 text-right">
            <span>{formatAmount(maxDailyValue)}</span>
            <span>{formatAmount(maxDailyValue * 0.75)}</span>
            <span>{formatAmount(maxDailyValue * 0.5)}</span>
            <span>{formatAmount(maxDailyValue * 0.25)}</span>
            <span>0</span>
          </div>
          {/* Bars */}
          <div className="flex-1 grid grid-cols-7 gap-4 items-end h-48 px-4 relative">
            {dailyLoading ? (
              <div className="col-span-7 flex justify-center py-12">
                <div className="size-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
            ) : dailyTrend.length === 0 ? (
              <div className="col-span-7 text-center text-slate-500 py-8">لا توجد بيانات</div>
            ) : (
              dailyTrend.map((d, idx) => {
                const collectedH = maxDailyValue > 0 ? (d.collected / maxDailyValue) * 100 : 0;
                const hasData = d.collected > 0;
                return (
                  <div key={d.day} className="flex flex-col items-center gap-3 relative">
                    <div className="w-full flex flex-col items-center justify-end h-36">
                      {hasData ? (
                        <div
                          className="w-full bg-primary rounded-t-lg transition-all hover:opacity-80 min-h-[4px] cursor-pointer relative group"
                          style={{ height: `${Math.max(collectedH, 15)}%` }}
                          onMouseEnter={() => setHoveredBar(idx)}
                          onMouseLeave={() => setHoveredBar(null)}
                        >
                          {hoveredBar === idx && (
                            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 bg-slate-900 dark:bg-slate-700 text-white px-3 py-2 rounded-lg text-xs font-bold shadow-lg whitespace-nowrap z-10">
                              {formatAmount(d.collected)}
                              <div className="absolute top-full left-1/2 transform -translate-x-1/2">
                                <div className="border-4 border-transparent border-t-slate-900 dark:border-t-slate-700" />
                              </div>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-t-lg h-4" />
                      )}
                    </div>
                    <span className="text-xs font-medium text-slate-400">{d.day}</span>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Pending Table */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50">
          <h4 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Wallet className="size-5 text-primary" />
            دفعات بانتظار الموافقة
          </h4>
          <span className="bg-primary/10 text-primary text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider">
            {pendingItems.length} معاملة معلقة
          </span>
        </div>
        <div className="p-4 sm:p-6">
          <ResponsiveTable
            columns={[
              { id: 'clientName', label: 'العميل', render: (_, row) => (
                <span className="text-sm font-bold text-slate-900 dark:text-white">{row.clientName || '—'}</span>
              )},
              { id: 'reference', label: 'رقم المرجع' },
              { id: 'amount', label: 'المبلغ', format: (v) => formatAmount(v) },
              { id: 'dueDate', label: 'التاريخ', format: (v) => formatDate(v) },
              { id: 'status', label: 'الحالة', render: (_, row) => (
                <span className="inline-flex items-center gap-1.5 py-1 px-2 rounded-lg bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 text-[10px] font-bold">
                  <span className="size-1.5 rounded-full bg-amber-500 animate-pulse" />
                  {row.status}
                </span>
              )},
              { id: 'actions', label: 'الإجراءات', render: (_, row) => (
                <div className="flex gap-2">
                  <Link
                    to={`/installments/${row.loanId}`}
                    className="size-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center hover:bg-primary hover:text-white transition-all"
                  >
                    <Check className="size-4" />
                  </Link>
                  <button
                    type="button"
                    className="size-8 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-500 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all"
                  >
                    <X className="size-4" />
                  </button>
                </div>
              )},
            ]}
            data={pendingItems}
            isLoading={pendingLoading}
            emptyMessage="لا توجد معاملات معلقة"
            keyField="id"
          />
        </div>
        <div className="p-4 border-t border-slate-100 dark:border-slate-700 flex justify-center">
          <Link
            to="/loans"
            className="text-primary text-sm font-bold hover:underline"
          >
            عرض جميع المعاملات المعلقة
          </Link>
        </div>
      </div>
    </div>
  );
});

CollectionStats.displayName = 'CollectionStats';

export default CollectionStats;
