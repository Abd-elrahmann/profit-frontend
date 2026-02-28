import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { Popover } from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import { Calendar, ChevronDown, FileText, Table2, Printer } from 'lucide-react';
import { incomeStatementApi } from './incomeStatementApi';
import { notifyError, notifySuccess } from '../../utilities/toastify';
import {
  exportIncomeStatementToPDF,
  exportIncomeStatementToExcel,
  printIncomeStatement,
} from '../../utilities/IncomeStatementExporter';
import {
  IncomeStatementPeriodFilter,
  IncomeStatementKPICards,
  IncomeStatementLineItemsTable,
  IncomeStatementChartsSection,
  getPeriodInfo,
} from '../../components/IncomeStatement';
import { MONTHS } from '../../components/IncomeStatement/constants';
const years = Array.from({ length: 21 }, (_, i) => 2020 + i);
const IncomeStatement = () => {
  const [periodType, setPeriodType] = useState('period');
  const [selectedMonth, setSelectedMonth] = useState(dayjs().month());
  const [selectedYear, setSelectedYear] = useState(dayjs().year());
  const [fromDate, setFromDate] = useState(dayjs().startOf('month'));
  const [toDate, setToDate] = useState(dayjs().endOf('month'));
  const [selectedPeriodId, setSelectedPeriodId] = useState('');
  const [isInitializing, setIsInitializing] = useState(true);
  const { data: accountingPeriods = [] } = useQuery({
    queryKey: ['accountingPeriods'],
    queryFn: () => incomeStatementApi.getAccountingPeriods(1, 1),
  });
  useEffect(() => {
    if (accountingPeriods.length > 0 && !selectedPeriodId) {
      const activePeriod = accountingPeriods.find(
        (p) => p.status === 'open' || p.isActive || !p.endDate
      );
      if (activePeriod) {
        setSelectedPeriodId(activePeriod.id);
      } else if (accountingPeriods[0]) {
        setSelectedPeriodId(accountingPeriods[0].id);
      }
      setIsInitializing(false);
    } else if (accountingPeriods.length === 0 && periodType === 'period') {
      setIsInitializing(false);
    }
  }, [accountingPeriods, selectedPeriodId, periodType]);
  const getQueryParams = useCallback(() => {
    if (periodType === 'period') return { periodId: selectedPeriodId };
    if (periodType === 'custom') return { from: fromDate.format('YYYY-MM-DD'), to: toDate.format('YYYY-MM-DD') };
    if (periodType === 'monthly') return { month: selectedMonth + 1, year: selectedYear };
    return {};
  }, [periodType, selectedPeriodId, fromDate, toDate, selectedMonth, selectedYear]);
  const queryParams = getQueryParams();
  const { data: incomeData, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['incomeStatement', periodType, selectedMonth, selectedYear, fromDate, toDate, selectedPeriodId, queryParams],
    queryFn: () => incomeStatementApi.getIncomeStatement(queryParams),
    retry: 1,
    enabled: periodType !== 'period' || !!selectedPeriodId,
    onError: (err) => {
      notifyError(err.response?.data?.message || 'حدث خطأ أثناء تحميل قائمة الدخل');
    },
  });
  const handlePrint = useCallback(async () => {
    if (!incomeData) {
      notifyError('لا توجد بيانات للطباعة');
      return;
    }
    try {
      await printIncomeStatement(incomeData, periodType, selectedMonth, selectedYear, fromDate, toDate);
    } catch (err) {
      notifyError(err.message || 'حدث خطأ أثناء الطباعة');
    }
  }, [incomeData, periodType, selectedMonth, selectedYear, fromDate, toDate]);
  const handleExportPDF = useCallback(async () => {
    if (!incomeData) {
      notifyError('لا توجد بيانات للتصدير');
      return;
    }
    try {
      await exportIncomeStatementToPDF(incomeData, periodType, selectedMonth, selectedYear, fromDate, toDate);
      notifySuccess('تم تصدير التقرير بنجاح');
    } catch (err) {
      notifyError(err.message || 'حدث خطأ أثناء تصدير PDF');
    }
  }, [incomeData, periodType, selectedMonth, selectedYear, fromDate, toDate]);
  const handleExportExcel = useCallback(async () => {
    if (!incomeData) {
      notifyError('لا توجد بيانات للتصدير');
      return;
    }
    try {
      await exportIncomeStatementToExcel(incomeData, periodType, selectedMonth, selectedYear, fromDate, toDate);
      notifySuccess('تم تصدير التقرير بنجاح');
    } catch (err) {
      notifyError(err.message || 'حدث خطأ أثناء تصدير Excel');
    }
  }, [incomeData, periodType, selectedMonth, selectedYear, fromDate, toDate]);
  const handlePeriodTypeChange = useCallback((value) => {
    setPeriodType(value);
    if (value !== 'period') {
      setSelectedPeriodId('');
      setIsInitializing(false);
    }
  }, []);
  const periodInfo = useMemo(
    () => getPeriodInfo(incomeData, selectedMonth, selectedYear),
    [incomeData, selectedMonth, selectedYear]
  );
  const [periodAnchorEl, setPeriodAnchorEl] = useState(null);
  const periodLabel = useMemo(() => {
    if (periodInfo?.source === 'MONTH') return `${MONTHS[selectedMonth]} ${selectedYear}`;
    if (periodInfo?.source === 'CUSTOM' && periodInfo?.from && periodInfo?.to) {
      return `من ${dayjs(periodInfo.from).format('DD/MM/YYYY')} إلى ${dayjs(periodInfo.to).format('DD/MM/YYYY')}`;
    }
    if (periodInfo?.source === 'PERIOD' && periodInfo?.from && periodInfo?.to) {
      return `${dayjs(periodInfo.from).format('DD/MM/YYYY')} - ${dayjs(periodInfo.to).format('DD/MM/YYYY')}`;
    }
    if (periodInfo?.source === 'CURRENT_PERIOD' && periodInfo?.from && periodInfo?.to) {
      return `الفترة الحالية (${dayjs(periodInfo.from).format('DD/MM/YYYY')} - ${dayjs(periodInfo.to).format('DD/MM/YYYY')})`;
    }
    if (periodType === 'period' && selectedPeriodId) {
      const p = accountingPeriods.find((ap) => ap.id === selectedPeriodId);
      if (p?.startDate) {
        return `${dayjs(p.startDate).format('DD/MM/YYYY')} - ${p.endDate ? dayjs(p.endDate).format('DD/MM/YYYY') : 'مفتوحة'}`;
      }
    }
    return periodInfo?.text || 'اختر الفترة';
  }, [periodInfo, periodType, selectedPeriodId, accountingPeriods, selectedMonth, selectedYear]);
  const showContent = !isLoading && !isInitializing && !isError && incomeData;
  const showEmpty = !isLoading && !isInitializing && !isError && !incomeData && (periodType !== 'period' || selectedPeriodId);
  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="ar">
      <Helmet>
        <title>قائمة الدخل التقديرية - نظام إدارة السلف</title>
      </Helmet>
      <div className="flex flex-col w-full max-w-full">
        {}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
              قائمة الدخل التقديرية
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">
              عرض الأداء المالي المفصل للمؤسسة للفترة الحالية
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={(e) => setPeriodAnchorEl(e.currentTarget)}
              className="flex items-center gap-2 px-4 py-2 bg-transparent border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-bold hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all"
            >
              <Calendar className="size-4 text-primary" />
              <span>{periodLabel}</span>
              <ChevronDown className="size-4 text-slate-400" />
            </button>
            <Popover
              open={Boolean(periodAnchorEl)}
              anchorEl={periodAnchorEl}
              onClose={() => setPeriodAnchorEl(null)}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
              transformOrigin={{ vertical: 'top', horizontal: 'right' }}
              slotProps={{ paper: { className: 'mt-2 p-4 max-w-md bg-background-light dark:bg-background-dark border border-slate-200 dark:border-slate-700' } }}
            >
              <IncomeStatementPeriodFilter
                periodType={periodType}
                onPeriodTypeChange={handlePeriodTypeChange}
                selectedMonth={selectedMonth}
                onMonthChange={setSelectedMonth}
                selectedYear={selectedYear}
                onYearChange={setSelectedYear}
                fromDate={fromDate}
                onFromDateChange={setFromDate}
                toDate={toDate}
                onToDateChange={setToDate}
                selectedPeriodId={selectedPeriodId}
                onPeriodChange={setSelectedPeriodId}
                accountingPeriods={accountingPeriods}
                years={years}
                isSmallScreen={false}
              />
            </Popover>
            {showContent && (
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleExportPDF}
                  className="px-4 py-2 bg-transparent border border-red-500 rounded-lg text-sm font-bold flex items-center gap-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
                >
                  <FileText className="size-4" />
                  PDF
                </button>
                <button
                  type="button"
                  onClick={handleExportExcel}
                  className="px-4 py-2 bg-transparent border border-emerald-500 rounded-lg text-sm font-bold flex items-center gap-2 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-all"
                >
                  <Table2 className="size-4" />
                  Excel
                </button>
                <button
                  type="button"
                  onClick={handlePrint}
                  className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-bold flex items-center gap-2 shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all"
                >
                  <Printer className="size-4" />
                  طباعة
                </button>
              </div>
            )}
          </div>
        </div>
        {}
        {(isLoading || isInitializing) && (
          <div className="flex justify-center items-center py-20">
            <div className="w-14 h-14 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        )}
        {}
        {isError && (
          <div className="bg-red-50 dark:bg-red-900/20 p-6 rounded-xl border border-red-200 dark:border-red-800 text-center mb-6">
            <p className="text-red-700 dark:text-red-300 font-semibold mb-2">حدث خطأ في تحميل البيانات</p>
            <p className="text-red-600 dark:text-red-400 text-sm mb-4">{error?.message}</p>
            <button
              type="button"
              onClick={() => refetch()}
              className="px-4 py-2 border border-red-500 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
            >
              إعادة المحاولة
            </button>
          </div>
        )}
        {}
        {showContent && (
          <>
            <IncomeStatementKPICards incomeData={incomeData} />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <IncomeStatementLineItemsTable incomeData={incomeData} />
              </div>
              <div className="space-y-6">
                <IncomeStatementChartsSection incomeData={incomeData} />
              </div>
            </div>
          </>
        )}
        {}
        {showEmpty && (
          <div className="bg-white dark:bg-slate-800 p-12 rounded-xl border border-slate-200 dark:border-slate-700 text-center">
            <p className="text-lg font-semibold text-slate-600 dark:text-slate-400 mb-2">لا توجد بيانات للفترة المحددة</p>
            <p className="text-sm text-slate-500 dark:text-slate-500">قم بتحديد فترة أخرى واضغط على عرض التقرير</p>
          </div>
        )}
      </div>
    </LocalizationProvider>
  );
};
export default IncomeStatement;