import React, { useMemo, useState } from 'react';
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  Clock,
  CheckCircle,
  Eye,
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import {
  getLoanStats,
  getLatestLoans,
  getLoanDistribution,
  getRepaymentTrend,
} from '../../pages/dashboard/dashboardApi';
import { useDashboardFilter } from '../../pages/dashboard/DashboardFilterContext';
import { useCountUp } from '../../hooks/useCountUp';
import { Link } from 'react-router-dom';
import ResponsiveTable from './ResponsiveTable';

const LoanStats = React.memo(() => {
  const { getApiFilter } = useDashboardFilter();
  const apiFilter = getApiFilter();
  const [repaymentPeriod, setRepaymentPeriod] = useState('first');

  const { data: stats, isLoading } = useQuery({
    queryKey: ['loan-stats', apiFilter],
    queryFn: () => getLoanStats(apiFilter),
  });

  const { data: latestLoans = [], isLoading: loansLoading } = useQuery({
    queryKey: ['dashboard', 'latest-loans'],
    queryFn: () => getLatestLoans(5),
  });

  const { data: distribution = [], isLoading: distLoading } = useQuery({
    queryKey: ['dashboard', 'loan-distribution'],
    queryFn: () => getLoanDistribution(),
  });

  const { data: repaymentTrend = [], isLoading: trendLoading } = useQuery({
    queryKey: ['dashboard', 'repayment-trend', repaymentPeriod],
    queryFn: () => getRepaymentTrend(6, repaymentPeriod),
  });

  const animatedTotalAmount = useCountUp(stats?.loans?.totalAmount || 0, 600, !isLoading);
  const animatedPending = useCountUp(stats?.loans?.byStatus?.PENDING || 0, 600, !isLoading);
  const animatedActive = useCountUp(stats?.loans?.byStatus?.ACTIVE || 0, 600, !isLoading);
  const animatedCompleted = useCountUp(stats?.loans?.byStatus?.COMPLETED || 0, 600, !isLoading);

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

  const getStatusClass = (status) => {
    if (status === 'نشط') return 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400';
    if (status === 'معلق') return 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400';
    if (status === 'مكتمل') return 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400';
    return 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400';
  };

  const maxTrendValue = Math.max(...repaymentTrend.map((d) => d.value), 1);

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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="flex flex-col gap-4 rounded-xl p-6 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-bl-full -mr-12 -mt-12 transition-transform group-hover:scale-110" />
          <div className="flex items-center justify-between">
            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">
              إجمالي قيمة السلف النشطة
            </p>
            <div className="bg-primary/10 text-primary p-2 rounded-lg">
              <Wallet className="size-5" />
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <p className="text-slate-900 dark:text-slate-100 text-2xl md:text-3xl font-black">
              {formatAmount(animatedTotalAmount)}
            </p>
            {stats?.loans?.totalAmountTrend !== undefined && stats?.loans?.totalAmountTrend !== 0 && (
              <div className={`flex items-center gap-1 text-sm font-bold ${
                stats.loans.totalAmountTrend >= 0 
                  ? 'text-emerald-600 dark:text-emerald-400' 
                  : 'text-red-600 dark:text-red-400'
              }`}>
                {stats.loans.totalAmountTrend >= 0 ? (
                  <TrendingUp className="size-3.5" />
                ) : (
                  <TrendingDown className="size-3.5" />
                )}
                {stats.loans.totalAmountTrend >= 0 ? '+' : ''}{stats.loans.totalAmountTrend}% {stats.loans.trendLabel || 'عن الشهر الماضي'}
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-4 rounded-xl p-6 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">
              سلف قيد الانتظار
            </p>
            <div className="bg-amber-500/10 text-amber-500 p-2 rounded-lg">
              <Clock className="size-5" />
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <p className="text-slate-900 dark:text-slate-100 text-2xl md:text-3xl font-black">
              {animatedPending}
            </p>
            <p className="text-slate-400 dark:text-slate-500 text-xs font-medium">
              بانتظار الموافقة النهائية
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-4 rounded-xl p-6 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm border-r-4 border-r-primary">
          <div className="flex items-center justify-between">
            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">
              سلف نشطة حالياً
            </p>
            <div className="bg-primary/10 text-primary p-2 rounded-lg">
              <CheckCircle className="size-5" />
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <p className="text-slate-900 dark:text-slate-100 text-2xl md:text-3xl font-black">
              {animatedActive}
            </p>
            <p className="text-slate-400 dark:text-slate-500 text-xs font-medium">
              يتم استقطاعها شهرياً
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-4 rounded-xl p-6 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">
              سلف مسددة بالكامل
            </p>
            <div className="bg-blue-500/10 text-blue-500 p-2 rounded-lg">
              <CheckCircle className="size-5" />
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <p className="text-slate-900 dark:text-slate-100 text-2xl md:text-3xl font-black">
              {animatedCompleted}
            </p>
            <p className="text-slate-400 dark:text-slate-500 text-xs font-medium">
              إجمالي السلف المكتملة
            </p>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Repayment Trend Area Chart */}
        <div className="lg:col-span-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm p-6 flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <div className="flex flex-col gap-1">
              <h3 className="text-slate-900 dark:text-slate-100 font-bold text-lg">
                معدل سداد السلف
              </h3>
              <p className="text-slate-500 text-xs">
                تحليل الالتزام بالسداد خلال {repaymentPeriod === 'first' ? 'أول 6 أشهر من السنة' : 'آخر 6 أشهر من السنة'}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setRepaymentPeriod('first')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  repaymentPeriod === 'first'
                    ? 'bg-primary text-white'
                    : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 hover:bg-primary/10 hover:text-primary'
                }`}
              >
                أول 6 أشهر
              </button>
              <button
                onClick={() => setRepaymentPeriod('last')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  repaymentPeriod === 'last'
                    ? 'bg-primary text-white'
                    : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 hover:bg-primary/10 hover:text-primary'
                }`}
              >
                آخر 6 أشهر
              </button>
            </div>
          </div>
          <div className="h-[300px] w-full relative mt-4">
            <div className="absolute left-0 h-full flex flex-col justify-between text-[10px] text-slate-400 pb-8">
              <span>100%</span>
              <span>75%</span>
              <span>50%</span>
              <span>25%</span>
              <span>0%</span>
            </div>
            <div className="h-full mr-10 relative flex flex-col justify-between">
              <div className="border-b border-slate-100 dark:border-slate-700 w-full flex-1" />
              <div className="border-b border-slate-100 dark:border-slate-700 w-full flex-1" />
              <div className="border-b border-slate-100 dark:border-slate-700 w-full flex-1" />
              <div className="border-b border-slate-100 dark:border-slate-700 w-full flex-1" />
              <div className="absolute inset-0 pb-8">
                {trendLoading ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="size-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : repaymentTrend.length > 0 ? (
                  <svg
                    className="w-full h-full"
                    preserveAspectRatio="none"
                    viewBox="0 0 600 200"
                  >
                    <defs>
                      <linearGradient id="loanChartGradient" x1="0" x2="0" y1="0" y2="1">
                        <stop offset="5%" stopColor="#2e8a45" stopOpacity="0.3" />
                        <stop offset="95%" stopColor="#2e8a45" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                    <path
                      d={(() => {
                        const pts = repaymentTrend
                          .map((d, i) => {
                            const x = (i / (repaymentTrend.length - 1 || 1)) * 600;
                            const y = 200 - (d.value / 100) * 180;
                            return `${x},${y}`;
                          })
                          .join(' L ');
                        return `M ${pts} V 200 H 0 Z`;
                      })()}
                      fill="url(#loanChartGradient)"
                    />
                    <path
                      d={(() => {
                        const pts = repaymentTrend
                          .map((d, i) => {
                            const x = (i / (repaymentTrend.length - 1 || 1)) * 600;
                            const y = 200 - (d.value / 100) * 180;
                            return `${x},${y}`;
                          })
                          .join(' L ');
                        return `M ${pts}`;
                      })()}
                      fill="none"
                      stroke="#2e8a45"
                      strokeLinecap="round"
                      strokeWidth="3"
                    />
                    {repaymentTrend.map((d, i) => {
                      const x = (i / (repaymentTrend.length - 1 || 1)) * 600;
                      const y = 200 - (d.value / 100) * 180;
                      return (
                        <circle
                          key={`point-${i}`}
                          cx={x}
                          cy={y}
                          r="4"
                          fill="#fff"
                          stroke="#2e8a45"
                          strokeWidth="2"
                        />
                      );
                    })}
                  </svg>                ) : (
                  <div className="flex items-center justify-center h-full text-slate-500 text-sm">
                    لا توجد بيانات
                  </div>
                )}
              </div>
              <div className="absolute bottom-0 w-full flex justify-between text-[11px] font-bold text-slate-500 pt-2">
                {repaymentTrend.map((d) => (
                  <span key={d.month}>{d.month}</span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Loan Distribution by Type */}
        <div className="rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm p-6 flex flex-col gap-6">
          <div className="flex flex-col gap-1">
            <h3 className="text-slate-900 dark:text-slate-100 font-bold text-lg">
              توزيع السلف حسب النوع
            </h3>
            <p className="text-slate-500 text-xs">نسبة توزيع السلف حسب مصدر التمويل</p>
          </div>
          <div className="flex flex-col gap-8 flex-1 justify-center">
            {distLoading ? (
              <div className="flex justify-center py-8">
                <div className="size-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
            ) : distribution.length === 0 ? (
              <p className="text-slate-500 text-sm text-center py-4">لا توجد بيانات</p>
            ) : (
              distribution.map((d, i) => (
                  <div key={d.label} className="flex flex-col gap-2">
                    <div className="flex justify-between items-end">
                      <span className="text-sm font-bold text-slate-700 dark:text-slate-300">
                        {d.label}
                      </span>
                      <span className="text-xs font-bold text-primary">
                        {d.percent}% ({formatAmount(d.amount)})
                      </span>
                    </div>
                    <div className="h-3 w-full bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          i === 0 ? 'bg-primary' : i === 1 ? 'bg-primary/70' : 'bg-primary/40'
                        }`}
                        style={{ width: `${d.percent}%` }}
                      />
                    </div>
                  </div>
                ))
            )}
          </div>
          <div className="pt-4 border-t border-slate-100 dark:border-slate-700">
            <Link
              to="/loans"
              className="block w-full text-center text-primary text-xs font-bold hover:underline"
            >
              عرض التفاصيل الكاملة
            </Link>
          </div>
        </div>
      </div>

      {/* Latest Loans Table */}
      <div className="rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
        <div className="p-4 sm:p-6 border-b border-slate-100 dark:border-slate-700 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
          <h3 className="text-slate-900 dark:text-slate-100 font-bold text-base sm:text-lg">
            أحدث عمليات السلف
          </h3>
          <Link
            to="/loans"
            className="text-primary text-sm font-bold hover:bg-primary/5 px-3 py-1 rounded-lg transition-colors"
          >
            عرض الكل
          </Link>
        </div>
        <div className="p-4 sm:p-6">
          <ResponsiveTable
            columns={[
              { id: 'clientName', label: 'العميل', render: (_, row) => (
                <span className="font-bold text-slate-900 dark:text-slate-100">{row.clientName || '—'}</span>
              )},
              { id: 'source', label: 'نوع السلفة' },
              { id: 'amount', label: 'القيمة', format: (v) => formatAmount(v) },
              { id: 'startDate', label: 'تاريخ البدء', format: (v) => formatDate(v) },
              { id: 'status', label: 'الحالة', render: (_, row) => (
                <span className={`px-2 py-1 rounded-full text-xs font-bold ${getStatusClass(row.status)}`}>
                  {row.status}
                </span>
              )},
              { id: 'actions', label: 'الإجراءات', render: (_, row) => (
                <Link to={`/installments/${row.id}`} className="text-slate-400 hover:text-primary transition-colors inline-flex">
                  <Eye className="size-5" />
                </Link>
              )},
            ]}
            data={latestLoans}
            isLoading={loansLoading}
            emptyMessage="لا توجد سلف"
            keyField="id"
          />
        </div>
      </div>
    </div>
  );
});

LoanStats.displayName = 'LoanStats';

export default LoanStats;
