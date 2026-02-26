import React, { useState } from "react";
import {
  Alert,
  Button,
} from "@mui/material";
import {
  ListAlt as ListAltIcon,
  AccountBalanceWallet as AccountBalanceWalletIcon,
  Payments as PaymentsIcon,
  Balance as BalanceIcon,
  Analytics as AnalyticsIcon,
  TrendingUp as TrendingUpIcon,
  RemoveCircle as RemoveCircleIcon,
  VerifiedUser as VerifiedUserIcon,
  Business as BusinessIcon,
  HistoryEdu as HistoryEduIcon,
  FileDownload as FileDownloadIcon,
  ChevronRight as ChevronRightIcon,
  ChevronLeft as ChevronLeftIcon,
} from "@mui/icons-material";
import {
  calculateJournalTotals,
  formatNumber,
  getJournalTypeText,
  getJournalStatusText,
} from "./periodClosingUtils.jsx";

const PAGE_SIZE = 5;

export default function PeriodClosingDetails({
  periodData,
  theme,
  isSmallScreen,
  showDraftAlert,
  draftCount,
  permissions,
  isExporting,
  onExportPDF,
  onExportExcel,
  onClosePeriod,
  onUnpostClosing,
  onNavigateToJournalEntries,
  onNavigateToProfitDistribution,
  onViewJournal,
  onBackToList,
}) {
  const journals = periodData?.journals || [];
  const calculatedTotals = calculateJournalTotals(journals);
  const totalDebit = periodData?.totalDebit ?? calculatedTotals.totalDebit;
  const totalCredit = periodData?.totalCredit ?? calculatedTotals.totalCredit;
  const totalBalance = periodData?.totalBalance ?? calculatedTotals.totalBalance;

  const [journalPage, setJournalPage] = useState(0);
  const totalJournalPages = Math.ceil(journals.length / PAGE_SIZE) || 1;
  const paginatedJournals = journals.slice(
    journalPage * PAGE_SIZE,
    journalPage * PAGE_SIZE + PAGE_SIZE
  );

  const formatAmount = (amount) => {
    const abs = Math.abs(amount);
    const formatted = abs.toLocaleString("en-US");
    return amount >= 0 ? formatted : `-${formatted}`;
  };

  const fmt = (n) => (n ?? 0).toLocaleString("en-US");

  const companyProfitBreakdown = [
    { label: "أرباح الشركة", amount: periodData?.grossProfit?.companyTotal || 0 },
  ];

  const hasExpenses = (periodData?.expenseDistribution?.totalExpenses ?? 0) > 0;
  const partnerProfits = periodData?.partnerProfits || [];

  const formatDateDisplay = (dateStr, hijriStr) => {
    if (!dateStr) return "-";
    const g = new Date(dateStr).toISOString().slice(0, 10).replace(/-/g, "/");
    return hijriStr ? `${g} (${hijriStr})` : g;
  };

  return (
    <div className="flex flex-col gap-4 sm:gap-6 md:gap-8 max-w-7xl mx-auto w-full px-2 sm:px-4">
      {/* Title & Export & Actions */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-1 min-w-0">
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100">
            تفاصيل الفترة
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm sm:text-base">
            تقرير شامل للملخص المالي والقيود المحاسبية لهذه الفترة (
            {periodData?.name || "-"})
            {periodData?.startDate && periodData?.endDate && (
              <span className="block mt-1 text-xs sm:text-sm">
                {formatDateDisplay(periodData.startDate, periodData.startDateHijri)} -{" "}
                {formatDateDisplay(periodData.endDate, periodData.endDateHijri)}
              </span>
            )}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 flex-shrink-0">
          {permissions?.includes("period_Export") && (
            <>
              <button
                type="button"
                onClick={onExportPDF}
                disabled={isExporting}
                className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-red-600 text-white rounded-lg text-xs sm:text-sm font-bold hover:bg-red-700 transition-all shadow-sm"
              >
                <FileDownloadIcon sx={{ fontSize: 16 }} />
                <span>PDF</span>
              </button>
              <button
                type="button"
                onClick={onExportExcel}
                disabled={isExporting}
                className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-primary/10 text-primary rounded-lg text-xs sm:text-sm font-bold hover:bg-primary/20 transition-all"
              >
                <FileDownloadIcon sx={{ fontSize: 16 }} />
                <span>Excel</span>
              </button>
            </>
          )}
          {permissions?.includes("period_Post") && (
            <>
              {!periodData?.isClosed && (
                <button
                  type="button"
                  onClick={onClosePeriod}
                  className="flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-primary text-white rounded-lg text-xs sm:text-sm font-bold hover:bg-primary/90 transition-all"
                >
                  تقفيل الفترة
                </button>
              )}
              {periodData?.isClosed && (
                <button
                  type="button"
                  onClick={onUnpostClosing}
                  className="flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 border-2 border-red-500 text-red-600 rounded-lg text-xs sm:text-sm font-bold hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
                >
                  إلغاء التقفيل
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {/* Closed Period Alert - at top */}
      {periodData?.isClosed && (
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <Alert
            severity={
              periodData?.totalPartnerProfit || periodData?.companyProfit
                ? "success"
                : "info"
            }
            sx={{ flex: 1 }}
          >
            {periodData?.totalPartnerProfit || periodData?.companyProfit
              ? "تم إغلاق الفترة وتوزيعها"
              : "تم اغلاق الفترة ولكن تحتاج الي توزيع ارباحها"}
          </Alert>
          <Button
            variant="outlined"
            color={
              periodData?.totalPartnerProfit || periodData?.companyProfit
                ? "success"
                : "warning"
            }
            onClick={onNavigateToProfitDistribution}
            sx={{
              fontWeight: "bold",
              fontSize: "0.9rem",
              borderRadius: 1,
              minHeight: "auto",
              py: 0.75,
              px: 2,
            }}
          >
            الذهاب للتوزيع
          </Button>
        </div>
      )}

      {/* Draft Alert */}
      {showDraftAlert && !periodData?.isClosed && (
        <Alert
          severity="warning"
          action={
            <Button
              color="inherit"
              size="small"
              onClick={onNavigateToJournalEntries}
              sx={{ fontWeight: "bold" }}
            >
              انتقل للقيود
            </Button>
          }
        >
          لا يمكنك إغلاق هذه الفترة لأن هناك {draftCount} قيد غير معتمد.
          برجاء اعتمادها أولاً.
        </Alert>
      )}

      {/* 1. Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white dark:bg-background-dark/50 p-4 sm:p-6 rounded-xl border border-primary/10 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start mb-2">
            <p className="text-slate-500 text-sm font-medium">عدد القيود</p>
            <ListAltIcon className="text-primary/60" sx={{ fontSize: 24 }} />
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100">
            {journals.length}
          </p>
          <p className="text-primary text-xs mt-2 font-medium flex items-center gap-1">
            <TrendingUpIcon sx={{ fontSize: 14 }} />
            مقارنة بالشهر الماضي
          </p>
        </div>
        <div className="bg-white dark:bg-background-dark/50 p-4 sm:p-6 rounded-xl border border-primary/10 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start mb-2">
            <p className="text-slate-500 text-sm font-medium">إجمالي المدين</p>
            <AccountBalanceWalletIcon
              className="text-primary/60"
              sx={{ fontSize: 24 }}
            />
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100">
            {formatNumber(totalDebit)}
          </p>
          <p className="text-primary text-xs mt-2 font-medium flex items-center gap-1">
            <TrendingUpIcon sx={{ fontSize: 14 }} />
            إجمالي المدين
          </p>
        </div>
        <div className="bg-white dark:bg-background-dark/50 p-4 sm:p-6 rounded-xl border border-primary/10 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start mb-2">
            <p className="text-slate-500 text-sm font-medium">إجمالي الدائن</p>
            <PaymentsIcon className="text-primary/60" sx={{ fontSize: 24 }} />
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100">
            {formatNumber(totalCredit)}
          </p>
          <p className="text-primary text-xs mt-2 font-medium flex items-center gap-1">
            <TrendingUpIcon sx={{ fontSize: 14 }} />
            إجمالي الدائن
          </p>
        </div>
        <div className="bg-white dark:bg-background-dark/50 p-4 sm:p-6 rounded-xl border border-primary/10 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start mb-2">
            <p className="text-slate-500 text-sm font-medium">إجمالي الرصيد</p>
            <BalanceIcon className="text-primary/60" sx={{ fontSize: 24 }} />
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-primary">
            {formatNumber(totalBalance)}
          </p>
          <p className="text-slate-400 text-xs mt-2 font-medium">
            {totalBalance === 0 ? "متزن محاسبياً" : "الرصيد"}
          </p>
        </div>
      </div>

      {/* 2. Profit Breakdown Section */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 pb-2">
          <AnalyticsIcon className="text-primary" sx={{ fontSize: 28 }} />
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200">
            {hasExpenses ? "ملخص الأرباح والمصروفات" : "الأرباح الإجمالية"}
          </h2>
        </div>
        <div
          className={`grid grid-cols-1 gap-6 ${
            hasExpenses ? "lg:grid-cols-[1fr_auto_1fr] items-center" : "w-full"
          }`}
        >
          {/* Gross Profit Card */}
          <div className="bg-white dark:bg-background-dark/50 rounded-xl border border-primary/10 overflow-hidden shadow-sm">
            <div className="bg-primary/5 p-4 border-b border-primary/10">
              <h3 className="font-bold text-primary flex items-center gap-2">
                <TrendingUpIcon />
                {hasExpenses ? "الأرباح الإجمالية (قبل الخصم)" : "الأرباح الإجمالية"}
              </h3>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-slate-600 dark:text-slate-400">
                  أرباح الشركاء
                </span>
                <span className="font-bold text-slate-900 dark:text-white">
                  {fmt(periodData?.grossProfit?.partnerTotal)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-600 dark:text-slate-400">
                  أرباح الشركة
                </span>
                <span className="font-bold text-slate-900 dark:text-white">
                  {fmt(periodData?.grossProfit?.companyTotal)}
                </span>
              </div>
              {(periodData?.grossProfit?.totalCents ?? 0) > 0 && (
                <div className="flex justify-between items-center">
                  <span className="text-slate-600 dark:text-slate-400">
                    باقي أرباح (سنتات)
                  </span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    {fmt(periodData?.grossProfit?.totalCents)}
                  </span>
                </div>
              )}
              <hr className="border-primary/10" />
              <div className="flex justify-between items-center pt-2">
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  الإجمالي العام
                </span>
                <span className="text-2xl font-black text-primary">
                  {fmt(periodData?.grossProfit?.total)}
                </span>
              </div>
            </div>
          </div>

          {/* Divider with Deductions - only when has expenses */}
          {hasExpenses && (
            <>
              <div className="flex flex-col items-center justify-center gap-2">
                <div className="h-12 w-px bg-slate-200 hidden lg:block" />
                <div className="bg-red-50 dark:bg-red-900/20 text-red-600 px-6 py-3 rounded-full border border-red-200 dark:border-red-800 font-bold flex items-center gap-2 whitespace-nowrap shadow-sm">
                  <RemoveCircleIcon />
                  المصروفات المخصومة: -{fmt(periodData?.expenseDistribution?.totalExpenses)}
                </div>
                <div className="h-12 w-px bg-slate-200 hidden lg:block" />
              </div>

              {/* Net Profit Card */}
              <div className="bg-white dark:bg-background-dark/50 rounded-xl border border-primary/10 overflow-hidden shadow-sm">
                <div className="bg-primary p-4 border-b border-primary/10">
                  <h3 className="font-bold text-white flex items-center gap-2">
                    <VerifiedUserIcon />
                    صافي الأرباح (بعد الخصم)
                  </h3>
                </div>
                <div className="p-6 space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600 dark:text-slate-400">
                      أرباح الشركاء
                    </span>
                    <span className="font-bold text-slate-900 dark:text-white">
                      {fmt(periodData?.totalPartnerProfit)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600 dark:text-slate-400">
                      باقي أرباح الشركاء
                    </span>
                    <span className="font-bold text-slate-900 dark:text-white">
                      {fmt(periodData?.centCollected)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600 dark:text-slate-400">
                      أرباح الشركة
                    </span>
                    <span className="font-bold text-slate-900 dark:text-white">
                      {fmt(periodData?.companyProfit)}
                    </span>
                  </div>
                  <hr className="border-primary/10" />
                  <div className="flex justify-between items-center pt-2">
                    <span className="font-bold text-slate-800 dark:text-slate-200">
                      الإجمالي النهائي
                    </span>
                    <span
                      className={`text-2xl font-black ${
                        (periodData?.totalProfit ?? 0) < 0 ? "text-red-600" : "text-primary"
                      }`}
                    >
                      {fmt(periodData?.totalProfit)}
                    </span>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </section>

      {/* 3. Detail Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Partner Profits Table - when closed and has partner profits */}
        {partnerProfits.length > 0 && (
          <div className="lg:col-span-3 space-y-4">
            <div className="flex items-center gap-2">
              <BusinessIcon className="text-primary" sx={{ fontSize: 24 }} />
              <h2 className="text-lg font-bold text-slate-800 dark:text-slate-200">
                جدول أرباح الشركاء
              </h2>
            </div>
            <div className="bg-white dark:bg-background-dark/50 rounded-xl border border-primary/10 overflow-x-auto shadow-sm">
              <table className="w-full text-center text-sm min-w-[280px]">
                <thead className="bg-primary/5 text-primary border-b border-primary/10">
                  <tr>
                    <th className="px-4 py-3 font-bold">اسم الشريك</th>
                    <th className="px-4 py-3 font-bold">الربح الإجمالي</th>
                    <th className="px-4 py-3 font-bold">حصة المصروفات</th>
                    <th className="px-4 py-3 font-bold">صافي الربح</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-primary/5">
                  {partnerProfits.map((p) => (
                    <tr key={p.partnerId} className="hover:bg-primary/5 transition-colors">
                      <td className="px-4 py-3 font-medium text-slate-900 dark:text-white">
                        {p.partnerName}
                      </td>
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-400">
                        {fmt(p.grossProfit)}
                      </td>
                      <td className="px-4 py-3 text-red-600">
                        -{fmt(p.expenseShare)}
                      </td>
                      <td className="px-4 py-3 font-bold text-primary">
                        {fmt(p.netProfit)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-primary/5 font-bold">
                  <tr>
                    <td className="px-4 py-3">الإجمالي</td>
                    <td className="px-4 py-3">
                      {fmt(periodData?.grossProfit?.partnerTotal)}
                    </td>
                    <td className="px-4 py-3 text-red-600">
                      -{fmt(periodData?.expenseDistribution?.partnersShare)}
                    </td>
                    <td className="px-4 py-3 text-primary">
                      {fmt(periodData?.totalPartnerProfit)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        )}

        {/* Table 1: Company Profits Breakdown */}
        <div className="lg:col-span-1 space-y-4">
          <div className="flex items-center gap-2">
            <BusinessIcon className="text-primary" sx={{ fontSize: 24 }} />
            <h2 className="text-lg font-bold text-slate-800 dark:text-slate-200">
              جدول أرباح الشركة
            </h2>
          </div>
          <div className="bg-white dark:bg-background-dark/50 rounded-xl border border-primary/10 overflow-hidden shadow-sm">
            <table className="w-full text-center text-sm">
              <thead className="bg-primary/5 text-primary border-b border-primary/10">
                <tr>
                  <th className="px-4 py-3 font-bold">بند الربح</th>
                  <th className="px-4 py-3 font-bold">المبلغ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-primary/5">
                {companyProfitBreakdown.map((row) => (
                  <tr
                    key={row.label}
                    className="hover:bg-primary/5 transition-colors"
                  >
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-400">
                      {row.label}
                    </td>
                    <td className="px-4 py-3 font-bold text-slate-900 dark:text-white">
                      {fmt(row.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-primary/5 font-bold">
                <tr>
                  <td className="px-4 py-3">الإجمالي</td>
                  <td className="px-4 py-3 text-primary">
                    {fmt(
                      companyProfitBreakdown.reduce((s, r) => s + (r.amount || 0), 0)
                    )}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* Table 2: Period Entries (Vouchers) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center gap-2">
            <HistoryEduIcon className="text-primary" sx={{ fontSize: 24 }} />
            <h2 className="text-lg font-bold text-slate-800 dark:text-slate-200">
              جدول قيود الفترة
            </h2>
          </div>
          <div className="bg-white dark:bg-background-dark/50 rounded-xl border border-primary/10 overflow-x-auto shadow-sm">
            {/* Mobile: Cards */}
            <div className="md:hidden divide-y divide-primary/5">
              {paginatedJournals.length === 0 ? (
                <div className="px-4 py-8 text-center text-slate-500">
                  لا توجد قيود في هذه الفترة
                </div>
              ) : (
                paginatedJournals.map((journal) => {
                  const debit = journal.totalDebit ?? 0;
                  const credit = journal.totalCredit ?? 0;
                  const balance = debit - credit;
                  return (
                    <button
                      key={journal.id}
                      type="button"
                      onClick={() => onViewJournal?.(journal.id)}
                      className="w-full text-right p-4 hover:bg-primary/5 transition-colors"
                    >
                      <div className="flex justify-between items-start gap-2 mb-2">
                        <span className="font-medium text-slate-900 dark:text-white">
                          #{journal.reference || journal.id}
                        </span>
                        <div className="flex flex-col gap-0.5 text-xs shrink-0 text-right">
                          <span className="text-red-600 font-bold">
                            مدين: {fmt(debit)}
                          </span>
                          <span className="text-primary font-bold">
                            دائن: {fmt(credit)}
                          </span>
                          <span
                            className={`font-bold ${
                              balance >= 0 ? "text-primary" : "text-red-600"
                            }`}
                          >
                            رصيد: {formatAmount(balance)}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2 mb-1 text-xs">
                        <span className="text-slate-500">
                          {getJournalTypeText(journal.type)}
                        </span>
                        <span
                          className={
                            journal.status === "DRAFT"
                              ? "text-amber-600"
                              : "text-slate-500"
                          }
                        >
                          {getJournalStatusText(journal.status)}
                        </span>
                      </div>
                      <p className="text-slate-600 dark:text-slate-400 text-sm mb-1 line-clamp-2">
                        {journal.description || "-"}
                      </p>
                      <p className="text-slate-500 text-xs">
                        {journal.date
                          ? new Date(journal.date)
                              .toISOString()
                              .slice(0, 10)
                              .replace(/-/g, "/")
                          : "-"}
                      </p>
                    </button>
                  );
                })
              )}
            </div>

            {/* Desktop: Table */}
            <div className="hidden md:block">
              <table className="w-full text-center text-sm">
                <thead className="bg-primary/5 text-primary border-b border-primary/10">
                  <tr>
                    <th className="px-4 py-3 font-bold">التاريخ</th>
                    <th className="px-4 py-3 font-bold">رقم القيد</th>
                    <th className="px-4 py-3 font-bold">النوع</th>
                    <th className="px-4 py-3 font-bold">الحالة</th>
                    <th className="px-4 py-3 font-bold">البيان</th>
                    <th className="px-4 py-3 font-bold">مدين</th>
                    <th className="px-4 py-3 font-bold">دائن</th>
                    <th className="px-4 py-3 font-bold">الرصيد</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-primary/5">
                  {paginatedJournals.length === 0 ? (
                    <tr>
                      <td
                        colSpan={8}
                        className="px-4 py-8 text-center text-slate-500"
                      >
                        لا توجد قيود في هذه الفترة
                      </td>
                    </tr>
                  ) : (
                    paginatedJournals.map((journal) => {
                      const debit = journal.totalDebit ?? 0;
                      const credit = journal.totalCredit ?? 0;
                      const balance = debit - credit;
                      return (
                        <tr
                          key={journal.id}
                          className="hover:bg-primary/5 transition-colors cursor-pointer"
                          onClick={() => onViewJournal?.(journal.id)}
                        >
                          <td className="px-4 py-3 text-slate-600 dark:text-slate-400">
                            {journal.date
                              ? new Date(journal.date)
                                  .toISOString()
                                  .slice(0, 10)
                                  .replace(/-/g, "/")
                              : "-"}
                          </td>
                          <td className="px-4 py-3 font-medium text-slate-900 dark:text-white">
                            #{journal.reference || journal.id}
                          </td>
                          <td className="px-4 py-3 text-slate-600 dark:text-slate-400">
                            {getJournalTypeText(journal.type)}
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`text-xs px-2 py-0.5 rounded ${
                                journal.status === "DRAFT"
                                  ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                                  : journal.status === "POSTED"
                                    ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                                    : "bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300"
                              }`}
                            >
                              {getJournalStatusText(journal.status)}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-slate-600 dark:text-slate-400">
                            {journal.description || "-"}
                          </td>
                          <td className="px-4 py-3 font-bold text-red-600">
                            {fmt(debit)}
                          </td>
                          <td className="px-4 py-3 font-bold text-primary">
                            {fmt(credit)}
                          </td>
                          <td
                            className={`px-4 py-3 font-bold ${
                              balance >= 0 ? "text-primary" : "text-red-600"
                            }`}
                          >
                            {formatAmount(balance)}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
                {journals.length > 0 && (
                  <tfoot className="bg-primary/5 font-bold border-t border-primary/10">
                    <tr>
                      <td colSpan={5} className="px-4 py-3">
                        الإجمالي
                      </td>
                      <td className="px-4 py-3 text-red-600">
                        {fmt(totalDebit)}
                      </td>
                      <td className="px-4 py-3 text-primary">
                        {fmt(totalCredit)}
                      </td>
                      <td
                        className={`px-4 py-3 ${
                          totalBalance >= 0 ? "text-primary" : "text-red-600"
                        }`}
                      >
                        {formatAmount(totalBalance)}
                      </td>
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>

            {journals.length > 0 && (
              <div className="p-4 bg-slate-50 dark:bg-background-dark/80 flex justify-between items-center text-xs text-slate-500">
                <p>
                  عرض {journalPage * PAGE_SIZE + 1} -{" "}
                  {Math.min(
                    journalPage * PAGE_SIZE + PAGE_SIZE,
                    journals.length
                  )}{" "}
                  من أصل {journals.length} قيود
                </p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      setJournalPage((p) => Math.max(0, p - 1))
                    }
                    disabled={journalPage === 0}
                    className="w-8 h-8 rounded border border-slate-200 flex items-center justify-center disabled:opacity-50 hover:bg-slate-100 transition-colors"
                  >
                    <ChevronRightIcon sx={{ fontSize: 16 }} />
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setJournalPage((p) =>
                        Math.min(totalJournalPages - 1, p + 1)
                      )
                    }
                    disabled={journalPage >= totalJournalPages - 1}
                    className="w-8 h-8 rounded border border-slate-200 flex items-center justify-center disabled:opacity-50 hover:bg-slate-100 transition-colors"
                  >
                    <ChevronLeftIcon sx={{ fontSize: 16 }} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
