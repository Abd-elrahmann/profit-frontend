import React, { useState, useCallback } from 'react';
import {
  TrendingUp,
  Analytics,
  PieChart,
  AccountBalanceWallet,
  Download,
  ChevronRight,
  ChevronLeft,
  North,
  ArrowUpward,
  Pending,
  TableChart,
} from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { notifySuccess, notifyError } from '../../utilities/toastify';
import { getCompanyProfitReport } from './CompanyProfitApi';
import { exportCompanyProfitToPDF, exportCompanyProfitToExcel } from '../../utilities/companyProfitExporter';
import { usePermissions } from '../../components/Contexts/PermissionsContext';
import WithdrawCompanyProfitModal from '../../components/modals/WithdrawCompanyProfitModal';
import dayjs from 'dayjs';
import 'dayjs/locale/ar';

const formatNum = (v) => (v ?? 0).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
const formatDateAr = (dateStr) => dayjs(dateStr).locale('ar').format('D MMMM YYYY');

export default function CompanyProfit() {
  const [withdrawModalOpen, setWithdrawModalOpen] = useState(false);
  const [profitPage, setProfitPage] = useState(1);
  const [isExporting, setIsExporting] = useState(false);

  const { permissions } = usePermissions();

  const { data: profitData, isLoading, error, refetch } = useQuery({
    queryKey: ['company-profit', profitPage],
    queryFn: () => getCompanyProfitReport(profitPage),
    retry: 1,
  });

  const handleWithdrawModalOpen = () => setWithdrawModalOpen(true);
  const handleWithdrawModalClose = () => setWithdrawModalOpen(false);

  const handleExportPDF = useCallback(async () => {
    if (!profitData) return;
    setIsExporting(true);
    try {
      await exportCompanyProfitToPDF(profitData);
      notifySuccess('تم تصدير PDF بنجاح');
    } catch (e) {
      notifyError('حدث خطأ أثناء تصدير PDF');
    } finally {
      setIsExporting(false);
    }
  }, [profitData]);

  const handleExportExcel = useCallback(async () => {
    if (!profitData) return;
    setIsExporting(true);
    try {
      await exportCompanyProfitToExcel(profitData);
      notifySuccess('تم تصدير Excel بنجاح');
    } catch (e) {
      notifyError('حدث خطأ أثناء تصدير Excel');
    } finally {
      setIsExporting(false);
    }
  }, [profitData]);

  const chartData = profitData?.balanceChartData || [];
  const maxBalance = Math.max(...chartData.map((d) => d.balance), 1);
  const withdrawals = profitData?.data || [];
  const totalPages = profitData?.totalPages || 1;
  const limit = profitData?.limit || 10;
  const totalWithdrawals = profitData?.totalWithdrawals || 0;
  const from = (profitPage - 1) * limit + 1;
  const to = Math.min(profitPage * limit, totalWithdrawals);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="w-12 h-12 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4">
          <p className="text-red-700 dark:text-red-400">
            حدث خطأ في تحميل بيانات أرباح الشركة: {error.message}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <Helmet>
        <title>أرباح الشركة</title>
        <meta name="description" content="إدارة أرباح الشركة وسحب الأرباح" />
      </Helmet>

      <div className="space-y-8">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white">أرباح الشركة</h2>
            <p className="text-slate-500 text-sm mt-1">متابعة العوائد المالية وعمليات السحب الخاصة بالمؤسسة</p>
          </div>
          {permissions?.includes('company_Add') && (
            <button
              onClick={handleWithdrawModalOpen}
              disabled={!profitData?.availableAmount || profitData.availableAmount <= 0}
              className="flex items-center gap-2 bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg shadow-primary/30"
            >
              <AccountBalanceWallet sx={{ fontSize: 22 }} />
              طلب سحب أرباح
            </button>
          )}
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-primary/5 shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-bold">
                أرباح قادمة
              </span>
              <TrendingUp className="text-primary" sx={{ fontSize: 24 }} />
            </div>
            <p className="text-slate-500 text-sm font-medium">صافي الأرباح القادمة</p>
            <div className="flex items-baseline gap-1 mt-1">
              <h3 className="text-3xl font-black text-slate-900 dark:text-white">
                {formatNum(profitData?.upcomingProfit)}
              </h3>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-primary/5 shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <span className="bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 px-3 py-1 rounded-full text-xs font-bold">
                باقي الأرباح
              </span>
              <Analytics className="text-slate-400" sx={{ fontSize: 24 }} />
            </div>
            <p className="text-slate-500 text-sm font-medium">باقي أرباح الشركاء</p>
            <div className="flex items-baseline gap-1 mt-1">
              <h3 className="text-3xl font-black text-slate-900 dark:text-white">
                {formatNum(profitData?.cents)}
              </h3>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-primary/5 shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-bold">إجمالي</span>
              <PieChart className="text-primary/60" sx={{ fontSize: 24 }} />
            </div>
            <p className="text-slate-500 text-sm font-medium">إجمالي الأرباح</p>
            <div className="flex items-baseline gap-1 mt-1">
              <h3 className="text-3xl font-black text-slate-900 dark:text-white">
                {formatNum(profitData?.periodsProfit?.totalCompanyProfit)}
              </h3>
            </div>
          </div>

          <div className="bg-primary p-6 rounded-2xl border border-primary shadow-xl shadow-primary/20">
            <div className="flex justify-between items-start mb-4">
              <span className="bg-white/20 text-white px-3 py-1 rounded-full text-xs font-bold">متاح للسحب</span>
              <AccountBalanceWallet className="text-white/60" sx={{ fontSize: 24 }} />
            </div>
            <p className="text-white/80 text-sm font-medium">الرصيد المتاح للسحب</p>
            <div className="flex items-baseline gap-1 mt-1">
              <h3 className="text-3xl font-black text-white">{formatNum(profitData?.availableAmount)}</h3>
            </div>
          </div>
        </div>

        {/* Chart & Summary */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white dark:bg-slate-800 p-6 rounded-2xl border border-primary/5 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h4 className="text-lg font-bold">تطور الرصيد المتاح للسحب</h4>
                <p className="text-slate-400 text-xs">تحليل السيولة خلال آخر 7 أيام</p>
              </div>
              {chartData.length >= 2 && chartData[chartData.length - 1]?.balance > chartData[0]?.balance && (
                <div className="flex items-center gap-2 text-primary bg-primary/5 px-3 py-1 rounded-lg">
                  <North sx={{ fontSize: 18 }} />
                  <span className="text-sm font-bold">+</span>
                </div>
              )}
            </div>
            <div className="h-64 w-full flex items-end gap-1">
              {chartData.length ? (
                chartData.map((d, i) => (
                  <div key={d.date} className="flex-1 flex flex-col items-center gap-1">
                    <div
                      className="w-full rounded-t bg-primary/30 min-h-[4px] transition-all"
                      style={{
                        height: `${Math.max(4, (d.balance / maxBalance) * 100)}%`,
                      }}
                    />
                    <span className="text-[10px] text-slate-400 font-bold">{d.label}</span>
                  </div>
                ))
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-400 text-sm">
                  لا توجد بيانات للرسم
                </div>
              )}
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-primary/5 shadow-sm">
            <h4 className="text-lg font-bold mb-6">ملخص العمليات</h4>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl border border-slate-100 dark:border-slate-600">
                <div className="flex items-center gap-3">
                  <ArrowUpward className="text-primary" sx={{ fontSize: 22 }} />
                  <div>
                    <p className="text-xs text-slate-400">إجمالي السحوبات</p>
                    <p className="text-sm font-bold">{formatNum(profitData?.totalWithdrawnAmount)}</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl border border-slate-100 dark:border-slate-600">
                <div className="flex items-center gap-3">
                  <Pending className="text-amber-500" sx={{ fontSize: 22 }} />
                  <div>
                    <p className="text-xs text-slate-400">عمليات معلقة</p>
                    <p className="text-sm font-bold">0</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-8">
              <p className="text-xs text-slate-400 mb-2">حالة الحساب</p>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                <span className="text-sm font-medium">نشط ومحدث</span>
              </div>
            </div>
          </div>
        </div>

        {/* Sources Table */}
        {profitData?.periodsProfit?.periods?.length > 0 && (
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-primary/5 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-primary/5">
              <h4 className="text-lg font-bold">مصادر أرباح الشركة</h4>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-right">
                <thead className="bg-primary/5 text-primary text-sm font-bold">
                  <tr>
                    <th className="px-6 py-4">الفترة</th>
                    <th className="px-6 py-4">إجمالي الأرباح</th>
                    <th className="px-6 py-4">نسبة الشركة</th>
                    <th className="px-6 py-4">أرباح الشركة</th>
                    <th className="px-6 py-4">باقي أرباح الشركاء</th>
                    <th className="px-6 py-4">إجمالي أرباح الشركة</th>
                  </tr>
                </thead>
                <tbody className="text-sm divide-y divide-primary/5">
                  {profitData.periodsProfit.periods.map((p, i) => (
                    <tr key={i} className="hover:bg-primary/5 transition-colors">
                      <td className="px-6 py-4 font-bold">{p.periodName}</td>
                      <td className="px-6 py-4 text-slate-500">{formatNum(p.totalPeriodProfit)}</td>
                      <td className="px-6 py-4 text-slate-500">{p.companyPercentage || 0}%</td>
                      <td className="px-6 py-4 font-bold">{formatNum(p.companyProfit)}</td>
                      <td className="px-6 py-4 text-slate-500">{formatNum(p.cents)}</td>
                      <td className="px-6 py-4 font-bold text-primary">{formatNum(p.totalCompany)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Withdrawal Log */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-primary/5 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-primary/5 flex items-center justify-between flex-wrap gap-4">
            <h4 className="text-lg font-bold">سجل السحوبات</h4>
            <div className="flex gap-2">
              {permissions?.includes('company_Export') && (
                <>
                  <button
                    onClick={handleExportPDF}
                    disabled={isExporting}
                    className="p-2 border border-primary/10 rounded-lg hover:bg-primary/5 transition-colors disabled:opacity-50"
                    title="تصدير PDF"
                  >
                    <Download sx={{ fontSize: 20 }} className="text-red-500" />
                  </button>
                  <button
                    onClick={handleExportExcel}
                    disabled={isExporting}
                    className="p-2 border border-primary/10 rounded-lg hover:bg-primary/5 transition-colors disabled:opacity-50"
                    title="تصدير Excel"
                  >
                    <TableChart sx={{ fontSize: 20, color: 'var(--color-primary)' }} />
                  </button>
                </>
              )}
            </div>
          </div>

          {!withdrawals.length ? (
            <div className="p-12 text-center">
              <AccountBalanceWallet sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} className="text-slate-400" />
              <p className="text-slate-600 dark:text-slate-400 font-bold">لا توجد عمليات سحب حتى الآن</p>
              <p className="text-sm text-slate-500 mt-1">لم يتم إجراء أي عمليات سحب من أرباح الشركة</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-right">
                  <thead className="bg-primary/5 text-primary text-sm font-bold">
                    <tr>
                      <th className="px-6 py-4">رقم العملية</th>
                      <th className="px-6 py-4">التاريخ</th>
                      <th className="px-6 py-4">المبلغ المسحوب</th>
                      <th className="px-6 py-4">طريقة السحب</th>
                      <th className="px-6 py-4">الحالة</th>
                      <th className="px-6 py-4">المستخدم المسؤول</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm divide-y divide-primary/5">
                    {withdrawals.map((w) => (
                      <tr key={w.id} className="hover:bg-primary/5 transition-colors">
                        <td className="px-6 py-4 font-bold">#{w.reference?.replace('COMPANY-WITHDRAW-', '') || w.id}</td>
                        <td className="px-6 py-4 text-slate-500">{formatDateAr(w.date)}</td>
                        <td className="px-6 py-4 font-black">{formatNum(w.amount)}</td>
                        <td className="px-6 py-4">{w.description || 'سحب أرباح'}</td>
                        <td className="px-6 py-4">
                          <span className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-3 py-1 rounded-full text-xs font-bold">
                            تمت بنجاح
                          </span>
                        </td>
                        <td className="px-6 py-4 flex items-center gap-2">
                          <div
                            className="w-7 h-7 rounded-full bg-slate-200 dark:bg-slate-600 flex items-center justify-center overflow-hidden"
                            style={
                              w.userProfileImage
                                ? { backgroundImage: `url(${w.userProfileImage})`, backgroundSize: 'cover' }
                                : {}
                            }
                          >
                            {!w.userProfileImage && (
                              <span className="text-xs font-bold text-slate-600">
                                {w.userName?.charAt(0) || '?'}
                              </span>
                            )}
                          </div>
                          <span>{w.userName}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="p-4 bg-primary/5 flex items-center justify-between flex-wrap gap-2">
                <span className="text-xs font-medium text-slate-500">
                  عرض {from}-{to} من أصل {totalWithdrawals} عملية
                </span>
                {totalPages > 1 && (
                  <div className="flex gap-1">
                    <button
                      onClick={() => setProfitPage((p) => Math.min(totalPages, p + 1))}
                      disabled={profitPage >= totalPages}
                      className="w-8 h-8 flex items-center justify-center rounded-lg border border-primary/10 text-primary hover:bg-white dark:hover:bg-slate-800 transition-colors disabled:opacity-50"
                    >
                      <ChevronRight sx={{ fontSize: 18 }} />
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                      .filter((p) => p <= 5)
                      .map((p) => (
                        <button
                          key={p}
                          onClick={() => setProfitPage(p)}
                          className={`w-8 h-8 flex items-center justify-center rounded-lg text-xs font-bold transition-colors ${
                            p === profitPage
                              ? 'bg-primary text-white'
                              : 'border border-primary/10 text-slate-400 hover:bg-white dark:hover:bg-slate-800'
                          }`}
                        >
                          {p}
                        </button>
                      ))}
                    <button
                      onClick={() => setProfitPage((p) => Math.max(1, p - 1))}
                      disabled={profitPage <= 1}
                      className="w-8 h-8 flex items-center justify-center rounded-lg border border-primary/10 text-primary hover:bg-white dark:hover:bg-slate-800 transition-colors disabled:opacity-50"
                    >
                      <ChevronLeft sx={{ fontSize: 18 }} />
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      <WithdrawCompanyProfitModal
        open={withdrawModalOpen}
        onClose={handleWithdrawModalClose}
        availableAmount={profitData?.availableAmount}
        onSuccess={refetch}
      />
    </div>
  );
}
