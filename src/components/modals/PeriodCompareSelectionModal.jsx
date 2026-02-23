import React, { useState, useCallback, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  IconButton,
  CircularProgress,
} from "@mui/material";
import { X, ArrowLeftRight, BarChart3, Info } from "lucide-react";
import dayjs from "dayjs";
import { findPeriodByDates } from "../../pages/periodClosing/periodApi";
import { notifyError } from "../../utilities/toastify";

const getThisMonth = () => {
  const start = dayjs().startOf("month");
  const end = dayjs().endOf("month");
  return { start: start.format("YYYY-MM-DD"), end: end.format("YYYY-MM-DD") };
};

const getCurrentQuarter = () => {
  const start = dayjs().startOf("quarter");
  const end = dayjs().endOf("quarter");
  return { start: start.format("YYYY-MM-DD"), end: end.format("YYYY-MM-DD") };
};

const getCurrentYear = () => {
  const start = dayjs().startOf("year");
  const end = dayjs().endOf("year");
  return { start: start.format("YYYY-MM-DD"), end: end.format("YYYY-MM-DD") };
};

const getLastMonth = () => {
  const start = dayjs().subtract(1, "month").startOf("month");
  const end = dayjs().subtract(1, "month").endOf("month");
  return { start: start.format("YYYY-MM-DD"), end: end.format("YYYY-MM-DD") };
};

const getSamePeriodLastYear = (period1Start, period1End) => {
  if (!period1Start || !period1End) return { start: "", end: "" };
  const start = dayjs(period1Start).subtract(1, "year");
  const end = dayjs(period1End).subtract(1, "year");
  return { start: start.format("YYYY-MM-DD"), end: end.format("YYYY-MM-DD") };
};

const getDaysCount = (start, end) => {
  if (!start || !end) return 0;
  return dayjs(end).diff(dayjs(start), "day") + 1;
};

const toDateStr = (d) => (d ? dayjs(d).format("YYYY-MM-DD") : "");

const PeriodCompareSelectionModal = ({
  open,
  onClose,
  onCompare,
  initialPeriod1,
  initialPeriod2,
}) => {
  const thisMonth = getThisMonth();
  const [period1, setPeriod1] = useState(thisMonth);
  const [period2, setPeriod2] = useState(getLastMonth());
  const [matchDuration, setMatchDuration] = useState(false);
  const [quickSelect1, setQuickSelect1] = useState("thisMonth");
  const [quickSelect2, setQuickSelect2] = useState("lastMonth");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;
    if (initialPeriod1 && initialPeriod2) {
      setPeriod1({
        start: toDateStr(initialPeriod1.startDate),
        end: toDateStr(initialPeriod1.endDate),
      });
      setPeriod2({
        start: toDateStr(initialPeriod2.startDate),
        end: toDateStr(initialPeriod2.endDate),
      });
      setQuickSelect1("custom");
      setQuickSelect2("custom");
    } else {
      setPeriod1(thisMonth);
      setPeriod2(getLastMonth());
      setQuickSelect1("thisMonth");
      setQuickSelect2("lastMonth");
    }
  }, [open, initialPeriod1?.id, initialPeriod2?.id]);

  const handlePeriod1QuickSelect = (key) => {
    setQuickSelect1(key);
    if (key === "thisMonth") setPeriod1(getThisMonth());
    else if (key === "quarter") setPeriod1(getCurrentQuarter());
    else if (key === "year") setPeriod1(getCurrentYear());
  };

  const handlePeriod2QuickSelect = (key) => {
    setQuickSelect2(key);
    if (key === "lastMonth") setPeriod2(getLastMonth());
    else if (key === "sameLastYear") {
      const range = getSamePeriodLastYear(period1.start, period1.end);
      if (range.start && range.end) setPeriod2(range);
    }
  };

  const handlePeriod1Change = (field, value) => {
    setPeriod1((p) => {
      const next = { ...p, [field]: value };
      if (matchDuration && next.start && next.end) {
        const days = getDaysCount(next.start, next.end);
        if (days > 0) {
          setPeriod2((p2) => ({
            ...p2,
            end: dayjs(p2.start || next.start).add(days - 1, "day").format("YYYY-MM-DD"),
          }));
        }
      }
      return next;
    });
    setQuickSelect1("custom");
  };

  const handlePeriod2Change = (field, value) => {
    setPeriod2((p) => ({ ...p, [field]: value }));
    setQuickSelect2("custom");
  };

  const handleMatchDurationChange = (checked) => {
    setMatchDuration(checked);
    if (checked && period1.start && period1.end) {
      const days = getDaysCount(period1.start, period1.end);
      const newEnd = dayjs(period2.start || period1.start).add(days - 1, "day").format("YYYY-MM-DD");
      setPeriod2((p) => ({ ...p, end: newEnd }));
    }
  };

  useEffect(() => {
    if (matchDuration && period1.start && period1.end && period2.start) {
      const days = getDaysCount(period1.start, period1.end);
      const newEnd = dayjs(period2.start).add(days - 1, "day").format("YYYY-MM-DD");
      setPeriod2((p) => (p.end !== newEnd ? { ...p, end: newEnd } : p));
    }
  }, [matchDuration, period1.start, period1.end, period2.start]);

  const handleSubmit = useCallback(async () => {
    if (!period1.start || !period1.end || !period2.start || !period2.end) {
      notifyError("يرجى تحديد تواريخ الفترتين");
      return;
    }
    setIsSubmitting(true);
    try {
      const [res1, res2] = await Promise.all([
        findPeriodByDates(period1.start, period1.end),
        findPeriodByDates(period2.start, period2.end),
      ]);
      const id1 = res1?.period?.id;
      const id2 = res2?.period?.id;
      if (!id1 || !id2) {
        notifyError("لم يتم العثور على فترات تطابق التواريخ المحددة");
        return;
      }
      onCompare(id1, id2);
      onClose();
    } catch (err) {
      notifyError(err?.response?.data?.message || "حدث خطأ أثناء البحث عن الفترات");
    } finally {
      setIsSubmitting(false);
    }
  }, [period1, period2, onCompare, onClose]);

  const daysCount1 = getDaysCount(period1.start, period1.end);
  const daysCount2 = getDaysCount(period2.start, period2.end);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: "1rem",
          maxHeight: "90vh",
          direction: "rtl",
        },
      }}
    >
      <div className="flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 dark:border-white/10 px-6 py-5 shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
              <ArrowLeftRight className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold leading-6 text-gray-900 dark:text-white">
                اختيار الفترات للمقارنة
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                حدد الفترات المالية التي ترغب في تحليلها ومقارنتها
              </p>
            </div>
          </div>
          <IconButton
            onClick={onClose}
            size="small"
            className="!text-gray-400 hover:!bg-gray-100 hover:!text-gray-500 dark:hover:!bg-white/10 dark:hover:!text-gray-300"
          >
            <X className="h-5 w-5" />
          </IconButton>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8">
          <div className="flex flex-col lg:flex-row gap-8 lg:divide-x lg:divide-x-reverse lg:divide-gray-100 dark:lg:divide-white/10">
            {/* Period 1 */}
            <div className="flex-1 flex flex-col gap-6">
              <div className="flex items-center gap-2 pb-2 border-b border-gray-100 dark:border-white/5">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-white text-xs font-bold">
                  1
                </span>
                <h2 className="text-gray-900 dark:text-white text-base font-bold">
                  الفترة الأولى (الأساس)
                </h2>
              </div>
              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => handlePeriod1QuickSelect("thisMonth")}
                  className={`flex h-9 items-center justify-center gap-x-2 rounded-lg px-4 transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
                    quickSelect1 === "thisMonth"
                      ? "bg-primary text-white hover:bg-primary/90"
                      : "bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/10"
                  }`}
                >
                  <span className="text-sm font-medium">هذا الشهر</span>
                </button>
                <button
                  type="button"
                  onClick={() => handlePeriod1QuickSelect("quarter")}
                  className={`flex h-9 items-center justify-center gap-x-2 rounded-lg px-4 transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
                    quickSelect1 === "quarter"
                      ? "bg-primary text-white hover:bg-primary/90"
                      : "bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/10"
                  }`}
                >
                  <span className="text-sm font-medium">الربع الحالي</span>
                </button>
                <button
                  type="button"
                  onClick={() => handlePeriod1QuickSelect("year")}
                  className={`flex h-9 items-center justify-center gap-x-2 rounded-lg px-4 transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
                    quickSelect1 === "year"
                      ? "bg-primary text-white hover:bg-primary/90"
                      : "bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/10"
                  }`}
                >
                  <span className="text-sm font-medium">السنة الحالية</span>
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <label className="flex flex-col gap-1.5">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">من تاريخ</span>
                  <input
                    type="date"
                    value={period1.start || ""}
                    onChange={(e) => handlePeriod1Change("start", e.target.value)}
                    className="block w-full rounded-lg border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 px-4 py-3 text-sm text-gray-900 dark:text-white focus:border-primary focus:ring-primary"
                  />
                </label>
                <label className="flex flex-col gap-1.5">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">إلى تاريخ</span>
                  <input
                    type="date"
                    value={period1.end || ""}
                    onChange={(e) => handlePeriod1Change("end", e.target.value)}
                    className="block w-full rounded-lg border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 px-4 py-3 text-sm text-gray-900 dark:text-white focus:border-primary focus:ring-primary"
                  />
                </label>
              </div>
              {daysCount1 > 0 && (
                <div className="rounded-lg bg-primary/5 border border-primary/10 p-3">
                  <p className="text-xs text-primary font-medium flex items-center gap-2">
                    <Info className="h-4 w-4" />
                    تم تحديد فترة {daysCount1} يوماً
                  </p>
                </div>
              )}
            </div>

            {/* Period 2 */}
            <div className="flex-1 flex flex-col gap-6 lg:pr-8">
              <div className="flex items-center gap-2 pb-2 border-b border-gray-100 dark:border-white/5">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-200 dark:bg-white/20 text-gray-600 dark:text-gray-300 text-xs font-bold">
                  2
                </span>
                <h2 className="text-gray-900 dark:text-white text-base font-bold">
                  الفترة الثانية (للمقارنة)
                </h2>
              </div>
              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => handlePeriod2QuickSelect("lastMonth")}
                  className={`flex h-9 items-center justify-center gap-x-2 rounded-lg px-4 transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
                    quickSelect2 === "lastMonth"
                      ? "bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20"
                      : "bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/10"
                  }`}
                >
                  <span className="text-sm font-medium">الشهر السابق</span>
                </button>
                <button
                  type="button"
                  onClick={() => handlePeriod2QuickSelect("sameLastYear")}
                  className={`flex h-9 items-center justify-center gap-x-2 rounded-lg px-4 transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
                    quickSelect2 === "sameLastYear"
                      ? "bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20"
                      : "bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/10"
                  }`}
                >
                  <span className="text-sm font-medium">نفس الفترة العام الماضي</span>
                </button>
                <button
                  type="button"
                  onClick={() => handlePeriod2QuickSelect("custom")}
                  className={`flex h-9 items-center justify-center gap-x-2 rounded-lg px-4 transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
                    quickSelect2 === "custom"
                      ? "bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20"
                      : "bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/10"
                  }`}
                >
                  <span className="text-sm font-medium">مخصص</span>
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <label className="flex flex-col gap-1.5">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">من تاريخ</span>
                  <input
                    type="date"
                    value={period2.start || ""}
                    onChange={(e) => handlePeriod2Change("start", e.target.value)}
                    className="block w-full rounded-lg border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 px-4 py-3 text-sm text-gray-900 dark:text-white focus:border-primary focus:ring-primary"
                  />
                </label>
                <label className="flex flex-col gap-1.5">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">إلى تاريخ</span>
                  <input
                    type="date"
                    value={period2.end || ""}
                    onChange={(e) => handlePeriod2Change("end", e.target.value)}
                    className="block w-full rounded-lg border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 px-4 py-3 text-sm text-gray-900 dark:text-white focus:border-primary focus:ring-primary"
                  />
                </label>
              </div>
              <div className="flex items-start gap-2 pt-2">
                <input
                  type="checkbox"
                  id="match-duration"
                  checked={matchDuration}
                  onChange={(e) => handleMatchDurationChange(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary mt-0.5"
                />
                <div className="text-sm leading-6">
                  <label htmlFor="match-duration" className="font-medium text-gray-700 dark:text-gray-300 cursor-pointer">
                    مطابقة المدة تلقائياً
                  </label>
                  <p className="text-gray-500 text-xs">
                    تعديل تاريخ الانتهاء تلقائياً ليتوافق مع عدد أيام الفترة الأولى.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 dark:bg-white/5 px-6 py-4 flex flex-col sm:flex-row sm:justify-end gap-3 border-t border-gray-100 dark:border-white/10 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto inline-flex justify-center items-center rounded-lg bg-white dark:bg-transparent border border-gray-300 dark:border-white/20 px-5 py-2.5 text-sm font-semibold text-gray-700 dark:text-white shadow-sm hover:bg-gray-50 dark:hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-gray-300"
          >
            إلغاء
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="w-full sm:w-auto inline-flex justify-center items-center gap-2 rounded-lg bg-primary px-8 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-primary/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:opacity-70"
          >
            {isSubmitting ? (
              <CircularProgress size={20} sx={{ color: "white" }} />
            ) : (
              <BarChart3 className="h-5 w-5" />
            )}
            مقارنة الفترات
          </button>
        </div>
      </div>
    </Dialog>
  );
};

export default PeriodCompareSelectionModal;
