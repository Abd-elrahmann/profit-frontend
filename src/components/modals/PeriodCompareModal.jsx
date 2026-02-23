import React from "react";
import {
  Dialog,
  DialogContent,
  IconButton,
  CircularProgress,
} from "@mui/material";
import { X, TrendingUp, TrendingDown, CheckCircle, BarChart3, PieChart } from "lucide-react";
import dayjs from "dayjs";

const PeriodCompareModal = ({ open, onClose, data, isLoading }) => {
  if (!open) return null;

  const comparison = data?.comparison;
  const period1 = comparison?.period1;
  const period2 = comparison?.period2;
  const changes = comparison?.changes;
  const performance = comparison?.performance;

  const formatDate = (d) => (d ? dayjs(d).format("DD/MM/YYYY") : "-");
  const formatNum = (n) => (n ?? 0).toLocaleString();

  const getSummaryText = () => {
    if (!changes || !performance) return "جاري تحميل النتائج...";
    const profitText = changes.netProfitChange >= 0
      ? `الربحية زادت بمقدار ${formatNum(changes.netProfitChange)} ريال`
      : `الربحية انخفضت بمقدار ${formatNum(Math.abs(changes.netProfitChange))} ريال`;
    const delText = changes.delinquencyChange <= 0
      ? `بينما انخفض مستوى التعثر بنسبة ${Math.abs(changes.delinquencyChangePercent || 0).toFixed(1)}%`
      : `بينما ارتفع مستوى التعثر بنسبة ${(changes.delinquencyChangePercent || 0).toFixed(1)}%`;
    return `${profitText}، ${delText}.`;
  };

  const getOverallStatus = () => {
    if (!performance) return "نتيجة المقارنة";
    if (performance.profitabilityImproved && performance.delinquencyImproved)
      return "نتيجة المقارنة: تحسن ملحوظ في الأداء";
    if (!performance.profitabilityImproved && !performance.delinquencyImproved)
      return "نتيجة المقارنة: تراجع في الأداء";
    return "نتيجة المقارنة: أداء متوازن";
  };

  const getScore = () => {
    if (!performance) return 85;
    let s = 50;
    if (performance.profitabilityImproved) s += 20;
    if (performance.delinquencyImproved) s += 15;
    return Math.min(100, s);
  };

  const score = getScore();
  const scoreDiff = performance?.profitabilityImproved ? 5 : performance?.delinquencyImproved ? 3 : -5;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: "1rem",
          maxHeight: "95vh",
          direction: "rtl",
        },
      }}
    >
      <DialogContent className="bg-[#f6f8f6] dark:bg-[#141e16] p-0 overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-200 dark:border-white/10 bg-white dark:bg-[#1a261c] px-6 py-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            مقارنة الأداء المالي للفترات
          </h2>
          <IconButton onClick={onClose} size="small" className="!text-gray-500 hover:!text-primary">
            <X className="h-5 w-5" />
          </IconButton>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-24">
            <CircularProgress size={48} sx={{ color: "#2e8a45" }} />
          </div>
        ) : comparison ? (
          <div className="p-4 md:p-6 space-y-6">
            {/* Summary Card */}
            <div className="bg-white dark:bg-[#1a261c] rounded-xl shadow-sm border-r-4 border-r-primary p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-32 h-32 bg-primary/5 rounded-full -translate-x-1/2 -translate-y-1/2" />
              <div className="relative z-10 flex items-start gap-4">
                <div className="p-3 rounded-full bg-primary/10 text-primary shrink-0">
                  <BarChart3 className="h-8 w-8" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                    {getOverallStatus()}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                    {getSummaryText()}
                  </p>
                  <p className="text-sm text-primary mt-2 font-bold flex items-center gap-1">
                    <CheckCircle className="h-4 w-4" />
                    يدل على كفاءة سياسات التحصيل واتخاذ قرار بزيادة التمويل.
                  </p>
                </div>
              </div>
              <div className="relative z-10 hidden md:flex flex-col gap-2 min-w-[200px] bg-gray-50 dark:bg-white/5 p-4 rounded-lg">
                <div className="flex justify-between items-center text-sm text-gray-500 dark:text-gray-400">
                  <span>مؤشر الأداء العام</span>
                  <span className="text-primary font-bold">{score}/100</span>
                </div>
                <div className="h-2 w-full bg-gray-200 dark:bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-all"
                    style={{ width: `${score}%` }}
                  />
                </div>
                <div
                  className={`text-xs text-right font-medium mt-1 ${
                    scoreDiff >= 0 ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {scoreDiff >= 0 ? "+" : ""}
                  {scoreDiff} نقاط عن السابق
                </div>
              </div>
            </div>

            {/* Two Period Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Period 1 - Primary */}
              <div className="bg-white dark:bg-[#1a261c] rounded-2xl shadow-sm border border-gray-100 dark:border-white/5 overflow-hidden flex flex-col h-full ring-1 ring-primary/10">
                <div className="bg-primary/5 border-b border-primary/10 p-5 relative">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-l from-primary to-transparent" />
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary text-white mb-2 shadow-sm">
                        الفترة الأولى (الحالية)
                      </span>
                      <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                        {period1?.name || "-"}
                      </h2>
                    </div>
                    <div className="text-left bg-white/50 dark:bg-white/5 p-2 rounded-lg backdrop-blur-sm border border-primary/5">
                      <span className="block text-[10px] text-gray-500 uppercase tracking-wider">من</span>
                      <span className="block text-sm font-bold text-gray-900 dark:text-white font-mono">
                        {formatDate(period1?.startDate)}
                      </span>
                      <span className="block text-[10px] text-gray-500 uppercase tracking-wider mt-1">إلى</span>
                      <span className="block text-sm font-bold text-gray-900 dark:text-white font-mono">
                        {formatDate(period1?.endDate)}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="p-6 space-y-6 flex-1">
                  <div className="p-5 rounded-xl bg-gradient-to-br from-gray-50 to-white dark:from-white/5 dark:to-transparent border border-gray-100 dark:border-white/5 shadow-sm">
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-gray-600 dark:text-gray-300 text-sm font-medium">صافي الربح</span>
                      <div className="bg-primary/10 p-2 rounded-lg">
                        <TrendingUp className="h-5 w-5 text-primary" />
                      </div>
                    </div>
                    <div className="flex items-baseline gap-2 mb-2">
                      <span className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
                        {formatNum(period1?.netProfit)}
                      </span>
                      <span className="text-sm text-gray-500 font-medium">ريال</span>
                    </div>
                    {changes && period2?.netProfit && (
                      <div
                        className={`flex items-center gap-1 text-xs font-bold w-fit px-2.5 py-1 rounded-md ${
                          (period1?.netProfit || 0) >= (period2?.netProfit || 0)
                            ? "text-green-600 bg-green-500/10"
                            : "text-red-600 bg-red-500/10"
                        }`}
                      >
                        {(period1?.netProfit || 0) >= (period2?.netProfit || 0) ? (
                          <TrendingUp className="h-3.5 w-3.5" />
                        ) : (
                          <TrendingDown className="h-3.5 w-3.5" />
                        )}
                        {((period1?.netProfit || 0) >= (period2?.netProfit || 0) ? "+" : "")}
                        {(
                          ((period1?.netProfit || 0) - (period2?.netProfit || 0)) /
                          Math.max(period2?.netProfit || 0, 1) *
                          100
                        ).toFixed(1)}
                        % مقارنة بالفترة الأخرى
                      </div>
                    )}
                  </div>
                  <div className="p-5 rounded-xl bg-gradient-to-br from-gray-50 to-white dark:from-white/5 dark:to-transparent border border-gray-100 dark:border-white/5 shadow-sm">
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-gray-600 dark:text-gray-300 text-sm font-medium">مستوى التعثر</span>
                      <div className="bg-orange-50 dark:bg-orange-900/20 p-2 rounded-lg">
                        <PieChart className="h-5 w-5 text-orange-500" />
                      </div>
                    </div>
                    <div className="flex items-baseline gap-2 mb-2">
                      <span className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
                        {formatNum(period1?.delinquency)}
                        {(period1?.delinquency ?? 0) <= 100 ? "%" : " ريال"}
                      </span>
                    </div>
                    {changes && (period1?.delinquency || period2?.delinquency) !== undefined && (
                      <div
                        className={`flex items-center gap-1 text-xs font-bold w-fit px-2.5 py-1 rounded-md ${
                          (period1?.delinquency || 0) <= (period2?.delinquency || 0)
                            ? "text-green-600 bg-green-500/10"
                            : "text-red-600 bg-red-500/10"
                        }`}
                      >
                        {(period1?.delinquency || 0) <= (period2?.delinquency || 0) ? (
                          <TrendingDown className="h-3.5 w-3.5" />
                        ) : (
                          <TrendingUp className="h-3.5 w-3.5" />
                        )}
                        {(period1?.delinquency || 0) <= (period2?.delinquency || 0)
                          ? `-${(
                              ((period2?.delinquency || 0) - (period1?.delinquency || 0)) /
                              Math.max(period2?.delinquency || 1, 1) *
                              100
                            ).toFixed(1)}% تحسن (انخفاض)`
                          : `+${(
                              ((period1?.delinquency || 0) - (period2?.delinquency || 0)) /
                              Math.max(period2?.delinquency || 1, 1) *
                              100
                            ).toFixed(1)}% ارتفاع`}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Period 2 - Comparison */}
              <div className="bg-white dark:bg-[#1a261c] rounded-2xl shadow-sm border border-gray-100 dark:border-white/5 overflow-hidden flex flex-col h-full opacity-90 hover:opacity-100 transition-opacity">
                <div className="bg-gray-50 dark:bg-white/5 border-b border-gray-200 dark:border-white/10 p-5">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-500 text-white mb-2">
                        الفترة الثانية (للمقارنة)
                      </span>
                      <h2 className="text-xl font-bold text-gray-700 dark:text-gray-200">
                        {period2?.name || "-"}
                      </h2>
                    </div>
                    <div className="text-left bg-gray-100 dark:bg-white/10 p-2 rounded-lg border border-gray-200 dark:border-white/5">
                      <span className="block text-[10px] text-gray-500 uppercase tracking-wider">من</span>
                      <span className="block text-sm font-bold text-gray-700 dark:text-gray-300 font-mono">
                        {formatDate(period2?.startDate)}
                      </span>
                      <span className="block text-[10px] text-gray-500 uppercase tracking-wider mt-1">إلى</span>
                      <span className="block text-sm font-bold text-gray-700 dark:text-gray-300 font-mono">
                        {formatDate(period2?.endDate)}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="p-6 space-y-6 flex-1">
                  <div className="p-5 rounded-xl bg-white dark:bg-white/5 border border-dashed border-gray-300 dark:border-white/20">
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-gray-500 dark:text-gray-400 text-sm font-medium">صافي الربح</span>
                      <div className="bg-gray-100 dark:bg-white/10 p-2 rounded-lg">
                        <TrendingUp className="h-5 w-5 text-gray-400" />
                      </div>
                    </div>
                    <div className="flex items-baseline gap-2 mb-2">
                      <span className="text-3xl font-bold text-gray-600 dark:text-gray-300 tracking-tight">
                        {formatNum(period2?.netProfit)}
                      </span>
                      <span className="text-sm text-gray-400 font-medium">ريال</span>
                    </div>
                  </div>
                  <div className="p-5 rounded-xl bg-white dark:bg-white/5 border border-dashed border-gray-300 dark:border-white/20">
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-gray-500 dark:text-gray-400 text-sm font-medium">مستوى التعثر</span>
                      <div className="bg-gray-100 dark:bg-white/10 p-2 rounded-lg">
                        <PieChart className="h-5 w-5 text-gray-400" />
                      </div>
                    </div>
                    <div className="flex items-baseline gap-2 mb-2">
                      <span className="text-3xl font-bold text-gray-600 dark:text-gray-300 tracking-tight">
                        {formatNum(period2?.delinquency)}
                        {(period2?.delinquency ?? 0) <= 100 ? "%" : " ريال"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-6">
              <div className="bg-white dark:bg-[#1a261c] rounded-2xl p-6 border border-gray-100 dark:border-white/5 shadow-sm">
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-primary" />
                    مقارنة صافي الربح
                  </h3>
                  <span className="text-xs text-gray-400">ريال سعودي</span>
                </div>
                <div className="relative h-48 w-full flex items-end justify-center gap-16 px-8 border-b border-gray-200 dark:border-white/10 pb-2">
                  <div className="flex flex-col items-center gap-2 group w-24 z-10">
                    <span className="opacity-0 group-hover:opacity-100 transition-opacity text-xs font-bold text-primary mb-1">
                      {formatNum(period1?.netProfit)}
                    </span>
                    <div
                      className="w-full bg-primary rounded-t-lg relative group-hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20"
                      style={{
                        height: `${Math.min(
                          100,
                          ((period1?.netProfit || 0) /
                            Math.max(period1?.netProfit || 1, period2?.netProfit || 1, 1)) *
                            100
                        )}%`,
                        minHeight: "24px",
                      }}
                    />
                    <span className="text-xs font-bold text-gray-900 dark:text-white mt-2">الفترة الأولى</span>
                  </div>
                  <div className="flex flex-col items-center gap-2 group w-24 z-10">
                    <span className="opacity-0 group-hover:opacity-100 transition-opacity text-xs font-bold text-gray-500 mb-1">
                      {formatNum(period2?.netProfit)}
                    </span>
                    <div
                      className="w-full bg-gray-300 dark:bg-gray-600 rounded-t-lg relative group-hover:bg-gray-400 transition-colors"
                      style={{
                        height: `${Math.min(
                          100,
                          ((period2?.netProfit || 0) /
                            Math.max(period1?.netProfit || 1, period2?.netProfit || 1, 1)) *
                            100
                        )}%`,
                        minHeight: "24px",
                      }}
                    />
                    <span className="text-xs font-medium text-gray-500 mt-2">الفترة الثانية</span>
                  </div>
                </div>
              </div>
              <div className="bg-white dark:bg-[#1a261c] rounded-2xl p-6 border border-gray-100 dark:border-white/5 shadow-sm">
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <PieChart className="h-5 w-5 text-orange-500" />
                    مقارنة نسب التعثر
                  </h3>
                  <span className="text-xs text-gray-400">نسبة مئوية %</span>
                </div>
                <div className="relative h-48 w-full flex items-end justify-center gap-16 px-8 border-b border-gray-200 dark:border-white/10 pb-2">
                  <div className="flex flex-col items-center gap-2 group w-24 z-10">
                    <span className="opacity-0 group-hover:opacity-100 transition-opacity text-xs font-bold text-primary mb-1">
                      {formatNum(period1?.delinquency)}%
                    </span>
                    <div
                      className="w-full bg-primary rounded-t-lg relative group-hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20"
                      style={{
                        height: `${Math.min(
                          100,
                          ((period1?.delinquency || 0) /
                            Math.max(period1?.delinquency || 1, period2?.delinquency || 1, 1)) *
                            100
                        )}%`,
                        minHeight: "24px",
                      }}
                    />
                    <span className="text-xs font-bold text-gray-900 dark:text-white mt-2">الفترة الأولى</span>
                  </div>
                  <div className="flex flex-col items-center gap-2 group w-24 z-10">
                    <span className="opacity-0 group-hover:opacity-100 transition-opacity text-xs font-bold text-red-500 mb-1">
                      {formatNum(period2?.delinquency)}
                      {(period2?.delinquency ?? 0) <= 100 ? "%" : ""}
                    </span>
                    <div
                      className="w-full bg-red-400/50 rounded-t-lg relative group-hover:bg-red-400/70 transition-colors"
                      style={{
                        height: `${Math.min(
                          100,
                          ((period2?.delinquency || 0) /
                            Math.max(period1?.delinquency || 1, period2?.delinquency || 1, 1)) *
                            100
                        )}%`,
                        minHeight: "24px",
                      }}
                    />
                    <span className="text-xs font-medium text-gray-500 mt-2">الفترة الثانية</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="py-12 text-center text-gray-500">لا توجد بيانات للمقارنة</div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default PeriodCompareModal;
