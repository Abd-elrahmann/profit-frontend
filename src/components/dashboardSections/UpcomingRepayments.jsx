import React, { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { getRepaymentsByMonth } from '../../pages/dashboard/dashboardApi';
import { useCountUp } from '../../hooks/useCountUp';
import { Link } from 'react-router-dom';
import ResponsiveTable from './ResponsiveTable';
const MONTH_NAMES = [
  'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
  'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر',
];
const DAY_ABBR = ['ح', 'ن', 'ث', 'ر', 'خ', 'ج', 'س'];
const UpcomingRepayments = React.memo(() => {
  const [viewDate, setViewDate] = useState(() => new Date());
  const selectedYear = viewDate.getFullYear();
  const selectedMonth = viewDate.getMonth() + 1;
  const { data, isLoading } = useQuery({
    queryKey: ['repayments-by-month', selectedYear, selectedMonth],
    queryFn: () => getRepaymentsByMonth(selectedYear, selectedMonth),
  });
  const repayments = data?.repayments ?? [];
  const totalExpected = data?.totalExpected ?? 0;
  const totalPaid = data?.totalPaid ?? 0;
  const totalRemaining = data?.totalRemaining ?? 0;
  const animatedTotal = useCountUp(totalExpected, 600, !isLoading);
  const animatedPaid = useCountUp(totalPaid, 600, !isLoading);
  const animatedRemaining = useCountUp(totalRemaining, 600, !isLoading);
  const formatAmount = (n) => Number(n || 0).toLocaleString('en-US', { minimumFractionDigits: 2 });
  const formatDueDate = (d) => {
    if (!d) return '—';
    const date = new Date(d);
    return `${date.getDate()} ${MONTH_NAMES[date.getMonth()]}`;
  };
  const calendarDays = useMemo(() => {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const first = new Date(year, month, 1);
    const last = new Date(year, month + 1, 0);
    const startPad = (first.getDay() + 6) % 7;
    const days = [];
    for (let i = 0; i < startPad; i++) days.push(null);
    for (let d = 1; d <= last.getDate(); d++) days.push(d);
    return days;
  }, [viewDate]);
  const today = new Date();
  const isToday = (d) =>
    d &&
    viewDate.getMonth() === today.getMonth() &&
    viewDate.getFullYear() === today.getFullYear() &&
    d === today.getDate();
  const hasRepaymentOnDay = (d) => {
    if (!d) return false;
    const y = viewDate.getFullYear();
    const m = viewDate.getMonth();
    return repayments.some((r) => {
      const due = new Date(r.dueDate);
      return due.getFullYear() === y && due.getMonth() === m && due.getDate() === d;
    });
  };
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="size-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }
  return (
    <div className="flex flex-col gap-6">
      {}
      <section className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100 mb-1">
              الدفعات القادمة
            </h1>
            <p className="text-slate-500 text-sm">
              نظرة عامة على التدفقات النقدية لشهر {MONTH_NAMES[viewDate.getMonth()]} {viewDate.getFullYear()}
            </p>
          </div>
          <div className="mt-6 grid grid-cols-3 gap-4">
            <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg">
              <p className="text-xs font-bold text-slate-400 mb-1">إجمالي المستحق</p>
              <p className="text-xl font-black text-slate-900 dark:text-white">{formatAmount(animatedTotal)}</p>
            </div>
            <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
              <p className="text-xs font-bold text-green-600 dark:text-green-400 mb-1">تم السداد</p>
              <p className="text-xl font-black text-green-600 dark:text-green-400">{formatAmount(animatedPaid)}</p>
            </div>
            <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg">
              <p className="text-xs font-bold text-orange-600 dark:text-orange-400 mb-1">المتبقي</p>
              <p className="text-xl font-black text-orange-600 dark:text-orange-400">{formatAmount(animatedRemaining)}</p>
            </div>
          </div>
          {totalExpected > 0 && (
            <div className="mt-4">
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-500">نسبة السداد</span>
                <span className="font-bold text-primary">{Math.round((totalPaid / totalExpected) * 100)}%</span>
              </div>
              <div className="h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary rounded-full transition-all"
                  style={{ width: `${Math.min((totalPaid / totalExpected) * 100, 100)}%` }}
                />
              </div>
            </div>
          )}
        </div>
        {}
        <div className="w-full md:w-80 bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-4 px-2">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              {MONTH_NAMES[viewDate.getMonth()]} {viewDate.getFullYear()}
            </h3>
            <div className="flex gap-1">
              <button
                type="button"
                onClick={() => setViewDate((d) => new Date(d.getFullYear(), d.getMonth() - 1))}
                className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors"
              >
                <ChevronRight className="size-4" />
              </button>
              <button
                type="button"
                onClick={() => setViewDate((d) => new Date(d.getFullYear(), d.getMonth() + 1))}
                className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors"
              >
                <ChevronLeft className="size-4" />
              </button>
            </div>
          </div>
          <div className="grid grid-cols-7 gap-1 text-center">
            {DAY_ABBR.map((abbr) => (
              <span key={abbr} className="text-[10px] font-bold text-slate-400">
                {abbr}
              </span>
            ))}
            {calendarDays.map((d, i) => (
              <div
                key={i}
                className={`p-1 text-xs rounded-full ${
                  !d
                    ? 'text-slate-300 dark:text-slate-600'
                    : isToday(d)
                    ? 'bg-primary text-white font-bold'
                    : hasRepaymentOnDay(d)
                    ? 'bg-primary/20 text-primary font-bold'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                {d || ''}
              </div>
            ))}
          </div>
        </div>
      </section>
      {}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800">
          <h3 className="font-bold text-slate-900 dark:text-slate-100">
            دفعات شهر {MONTH_NAMES[viewDate.getMonth()]} {viewDate.getFullYear()}
          </h3>
        </div>
        <div className="p-4 sm:p-6">
          <ResponsiveTable
            columns={[
              { id: 'clientName', label: 'اسم العميل', render: (_, row) => (
                <span className="text-sm font-bold text-slate-900 dark:text-slate-100">{row.clientName || '—'}</span>
              )},
              { id: 'source', label: 'المصدر' },
              { id: 'dueDate', label: 'تاريخ الاستحقاق', format: (v) => formatDueDate(v) },
              { id: 'amount', label: 'المبلغ', format: (v) => formatAmount(v) },
              { id: 'status', label: 'الحالة', render: (_, row) => (
                <span
                  className={`px-2 py-1 rounded-full text-[10px] font-bold ${
                    row.status === 'قيد المراجعة'
                      ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'
                      : 'bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary'
                  }`}
                >
                  {row.status}
                </span>
              )},
              { id: 'link', label: 'الإجراءات', render: (_, row) => (
                <Link to={`/installments/${row.loanId}`} className="text-primary text-xs font-bold hover:underline">
                  التفاصيل
                </Link>
              )},
            ]}
            data={repayments}
            emptyMessage="لا توجد دفعات قادمة"
            keyField="id"
          />
        </div>
        <div className="p-4 bg-slate-50 dark:bg-slate-800/30 flex justify-center">
          <Link
            to="/loans"
            className="text-sm font-bold text-slate-500 hover:text-primary transition-colors flex items-center gap-2"
          >
            عرض جميع الدفعات القادمة
          </Link>
        </div>
      </div>
    </div>
  );
});
UpcomingRepayments.displayName = 'UpcomingRepayments';
export default UpcomingRepayments;