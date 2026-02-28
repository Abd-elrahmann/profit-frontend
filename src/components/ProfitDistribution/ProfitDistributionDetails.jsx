import React from "react";
import { Alert, Button } from "@mui/material";
import {
  Business as BusinessIcon,
  People as PeopleIcon,
  AccountBalanceWallet as AccountBalanceWalletIcon,
  HistoryEdu as HistoryEduIcon,
  FileDownload as FileDownloadIcon,
  Visibility as VisibilityIcon,
} from "@mui/icons-material";
import ProfitDistributionActions from "./ProfitDistributionActions";
import {
  formatNumber,
  hasDistribution,
  calculateProfitAfterSaving,
  getJournalStatusText,
} from "./profitDistributionUtils";
export default function ProfitDistributionDetails({
  periodData,
  theme,
  isSmallScreen,
  enableSaving,
  savingPercentage,
  permissions,
  isExporting,
  onExportPDF,
  onExportExcel,
  onViewJournal,
  onEnableSavingChange,
  onOpenSavingDialog,
  onOpenDistributionDialog,
  selectedPeriod,
  onBackToList,
}) {
  const profitAfterSaving = calculateProfitAfterSaving(
    periodData,
    enableSaving,
    savingPercentage
  );
  const partnerProfitDisplay =
    enableSaving && savingPercentage > 0
      ? formatNumber(profitAfterSaving.partnerProfit)
      : formatNumber(
          periodData?.totalAfterSaving ||
            periodData?.partners?.reduce(
              (sum, p) => sum + (p.totalAfterSaving || p.totalProfit || 0),
              0
            ) ||
            0
        );
  const savedAmountDisplay =
    enableSaving && savingPercentage > 0
      ? profitAfterSaving.savedAmount
      : periodData?.totalSaving ||
        periodData?.partners?.reduce((sum, p) => sum + (p.savingAmount || 0), 0) ||
        0;
  const showSavingCard =
    (enableSaving && savingPercentage > 0) ||
    (periodData?.totalSaving > 0) ||
    periodData?.partners?.some((p) => (p.savingAmount || 0) > 0);
  const distributed = hasDistribution(periodData);
  const partners = periodData?.partners || [];
  const distributionJournal = periodData?.distributionJournal;
  const fmt = (n) => (n ?? 0).toLocaleString("en-US");
  const formatDateDisplay = (dateStr, hijriStr) => {
    if (!dateStr) return "-";
    const g = new Date(dateStr).toISOString().slice(0, 10).replace(/-/g, "/");
    return hijriStr ? `${g} (${hijriStr})` : g;
  };
  return (
    <div className="flex flex-col gap-4 sm:gap-6 md:gap-8 max-w-7xl mx-auto w-full px-2 sm:px-4">
      {}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-1 min-w-0">
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100">
            تفاصيل التوزيع
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm sm:text-base">
            تقرير توزيع الأرباح على الشركاء للفترة ({periodData?.name || "-"})
            {periodData?.startDate && periodData?.endDate && (
              <span className="block mt-1 text-xs sm:text-sm">
                {formatDateDisplay(periodData.startDate, periodData.startdateHijri)} -{" "}
                {formatDateDisplay(periodData.endDate, periodData.enddateHijri)}
              </span>
            )}
          </p>
        </div>
        {permissions?.includes("distribution_Export") && (
          <div className="flex flex-wrap gap-2 flex-shrink-0">
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
          </div>
        )}
      </div>
      {}
      {distributed && (
        <Alert severity="success" sx={{ flex: 1 }}>
          تم توزيع الأرباح بنجاح
        </Alert>
      )}
      {}
      {!distributed && permissions?.includes("distribution_Post") && (
        <ProfitDistributionActions
          periodData={periodData}
          theme={theme}
          permissions={permissions}
          enableSaving={enableSaving}
          savingPercentage={savingPercentage}
          onEnableSavingChange={onEnableSavingChange}
          onOpenSavingDialog={onOpenSavingDialog}
          onOpenDistributionDialog={onOpenDistributionDialog}
          selectedPeriod={selectedPeriod}
        />
      )}
      {}
      <div
        className={`grid grid-cols-2 sm:grid-cols-2 gap-3 sm:gap-4 ${
          showSavingCard ? "lg:grid-cols-4" : "lg:grid-cols-3"
        }`}
      >
        <div className="bg-white dark:bg-background-dark/50 p-4 sm:p-6 rounded-xl border border-primary/10 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start mb-2">
            <p className="text-slate-500 text-sm font-medium">أرباح الشركة</p>
            <BusinessIcon className="text-primary/60" sx={{ fontSize: 24 }} />
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100">
            {fmt(periodData?.companyProfit)}
          </p>
        </div>
        <div className="bg-white dark:bg-background-dark/50 p-4 sm:p-6 rounded-xl border border-primary/10 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start mb-2">
            <p className="text-slate-500 text-sm font-medium">إجمالي أرباح الشركاء</p>
            <PeopleIcon className="text-primary/60" sx={{ fontSize: 24 }} />
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-primary">
            {partnerProfitDisplay}
          </p>
          {enableSaving && savingPercentage > 0 && (
            <p className="text-slate-500 text-xs mt-2">
              (بعد ادخار {savingPercentage.toFixed(2)}%)
            </p>
          )}
        </div>
        {showSavingCard && (
          <div className="bg-white dark:bg-background-dark/50 p-4 sm:p-6 rounded-xl border border-primary/10 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-2">
              <p className="text-slate-500 text-xs sm:text-sm font-medium">المبلغ المدخر</p>
              <AccountBalanceWalletIcon className="text-amber-500/60" sx={{ fontSize: 24 }} />
            </div>
            <p className="text-2xl sm:text-3xl font-bold text-amber-600">
              {fmt(savedAmountDisplay)}
            </p>
          </div>
        )}
        <div className="bg-white dark:bg-background-dark/50 p-4 sm:p-6 rounded-xl border border-primary/10 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start mb-2">
            <p className="text-slate-500 text-sm font-medium">عدد الشركاء</p>
            <PeopleIcon className="text-primary/60" sx={{ fontSize: 24 }} />
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100">
            {partners.length}
          </p>
        </div>
      </div>
      {}
      {(enableSaving && savingPercentage > 0) || (periodData?.totalSaving > 0) ? (
        <Alert severity="info">
          <div className="space-y-1">
            {enableSaving && savingPercentage > 0 && (
              <p className="font-bold">نسبة الادخار: {savingPercentage.toFixed(2)}%</p>
            )}
            <p className="font-bold">المبلغ المدخر: {fmt(savedAmountDisplay)}</p>
            {enableSaving && savingPercentage > 0 && (
              <>
                <p>أرباح الشركاء قبل الادخار: {fmt(profitAfterSaving.originalPartnerProfit)}</p>
                <p>أرباح الشركاء بعد الادخار: {fmt(profitAfterSaving.partnerProfit)}</p>
                <p className="text-slate-600 dark:text-slate-400">
                  أرباح الشركة: {fmt(periodData?.companyProfit)} (لا تتأثر بالادخار)
                </p>
              </>
            )}
          </div>
        </Alert>
      ) : null}
      {}
      {partners.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <PeopleIcon className="text-primary" sx={{ fontSize: 24 }} />
            <h2 className="text-lg font-bold text-slate-800 dark:text-slate-200">
              توزيع الأرباح على الشركاء
            </h2>
          </div>
          <div className="bg-white dark:bg-background-dark/50 rounded-xl border border-primary/10 overflow-x-auto shadow-sm">
            {}
            <div className="md:hidden divide-y divide-primary/5">
              {partners.map((partner) => (
                <div key={partner.partnerId} className="p-4">
                  <p className="font-bold text-slate-900 dark:text-white mb-2">
                    {partner.partnerName}
                  </p>
                  <div className="grid grid-cols-2 gap-2 text-sm text-slate-600 dark:text-slate-400 mb-2">
                    <span>الرقم القومي: {partner.nationalId || "-"}</span>
                    <span>الهاتف: {partner.phone || "-"}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">قبل الادخار:</span>
                    <span className="font-bold">{fmt(partner.finalProfit)}</span>
                  </div>
                  {(periodData?.partners?.some((p) => p.savingAmount) || enableSaving) && (
                    <div className="flex justify-between items-center mt-1">
                      <span className="text-slate-500">بعد الادخار:</span>
                      <span className="font-bold text-primary">
                        {fmt(
                          enableSaving && savingPercentage > 0
                            ? partner.finalProfit * (1 - savingPercentage / 100)
                            : partner.totalAfterSaving || partner.finalProfit || 0
                        )}
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
            {}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-center text-sm">
                <thead className="bg-primary/5 text-primary border-b border-primary/10">
                  <tr>
                    <th className="px-4 py-3 font-bold">اسم الشريك</th>
                    <th className="px-4 py-3 font-bold">الرقم القومي</th>
                    <th className="px-4 py-3 font-bold">الهاتف</th>
                    <th className="px-4 py-3 font-bold">المبلغ قبل الادخار</th>
                    {(periodData?.partners?.some((p) => p.savingAmount) || enableSaving) && (
                      <th className="px-4 py-3 font-bold">المبلغ بعد الادخار</th>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-primary/5">
                  {partners.map((partner) => (
                    <tr key={partner.partnerId} className="hover:bg-primary/5 transition-colors">
                      <td className="px-4 py-3 font-medium text-slate-900 dark:text-white">
                        {partner.partnerName}
                      </td>
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-400">
                        {partner.nationalId || "-"}
                      </td>
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-400">
                        {partner.phone || "-"}
                      </td>
                      <td className="px-4 py-3 font-bold text-slate-900 dark:text-white">
                        {fmt(partner.finalProfit)}
                      </td>
                      {(periodData?.partners?.some((p) => p.savingAmount) || enableSaving) && (
                        <td className="px-4 py-3 font-bold text-primary">
                          {fmt(
                            enableSaving && savingPercentage > 0
                              ? partner.finalProfit * (1 - savingPercentage / 100)
                              : partner.totalAfterSaving || partner.finalProfit || 0
                          )}
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-primary/5 font-bold border-t border-primary/10">
                  <tr>
                    <td colSpan={3} className="px-4 py-3">
                      الإجمالي
                    </td>
                    <td className="px-4 py-3 text-primary">
                      {fmt(
                        partners.reduce((sum, p) => sum + (p.finalProfit || 0), 0)
                      )}
                    </td>
                    {(periodData?.partners?.some((p) => p.savingAmount) || enableSaving) && (
                      <td className="px-4 py-3 text-primary">
                        {enableSaving && savingPercentage > 0
                          ? fmt(profitAfterSaving.partnerProfit)
                          : fmt(
                              partners.reduce(
                                (sum, p) => sum + (p.totalAfterSaving || 0),
                                0
                              )
                            )}
                      </td>
                    )}
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>
      )}
      {}
      {distributionJournal && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <HistoryEduIcon className="text-primary" sx={{ fontSize: 24 }} />
            <h2 className="text-lg font-bold text-slate-800 dark:text-slate-200">
              قيد توزيع الأرباح
            </h2>
          </div>
          <div className="bg-white dark:bg-background-dark/50 rounded-xl border border-primary/10 overflow-x-auto shadow-sm">
            <div className="p-4">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-primary">
                      {distributionJournal.reference}
                    </span>
                    <span
                      className={`text-xs px-2 py-0.5 rounded ${
                        distributionJournal.status === "POSTED"
                          ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                          : "bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300"
                      }`}
                    >
                      {getJournalStatusText(distributionJournal.status)}
                    </span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-400 text-sm">
                    {distributionJournal.description}
                  </p>
                  <p className="text-slate-500 text-xs">
                    {distributionJournal.date
                      ? new Date(distributionJournal.date)
                          .toISOString()
                          .slice(0, 10)
                          .replace(/-/g, "/")
                      : "-"}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => onViewJournal?.(distributionJournal.id)}
                  className="flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-lg text-sm font-bold hover:bg-primary/20 transition-all self-start"
                >
                  <VisibilityIcon sx={{ fontSize: 18 }} />
                  عرض القيد
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}