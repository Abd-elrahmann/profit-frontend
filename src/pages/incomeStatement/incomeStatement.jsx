import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Box, Typography, Paper, Chip, CircularProgress, Button, Grid } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import { incomeStatementApi } from './incomeStatementApi';
import { notifyError, notifySuccess } from '../../utilities/toastify';
import {
  exportIncomeStatementToPDF,
  exportIncomeStatementToExcel,
  printIncomeStatement,
} from '../../utilities/IncomeStatementExporter';
import {
  IncomeStatementPeriodFilter,
  IncomeStatementToolbar,
  IncomeStatementNetProfitCard,
  IncomeStatementSummaryCards,
  IncomeStatementDetailsSection,
  getPeriodInfo,
} from '../../components/IncomeStatement';

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
    return { year: selectedYear };
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

  const showContent = !isLoading && !isInitializing && !isError && incomeData;
  const showEmpty = !isLoading && !isInitializing && !isError && !incomeData && (periodType !== 'period' || selectedPeriodId);

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="ar">
      <Helmet>
        <title>قائمة الدخل - نظام المحاسبة</title>
      </Helmet>

      <Box sx={{ maxWidth: 1200, margin: '0 auto', padding: { xs: 2, md: 3, lg: 1 } }}>
        <Grid container spacing={3} justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
          <Grid item xs={12} md={8}>
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
            />
          </Grid>

          {showContent && (
            <Grid item xs={12} md={3}>
              <IncomeStatementToolbar
                onPrint={handlePrint}
                onExportExcel={handleExportExcel}
                onExportPDF={handleExportPDF}
              />
            </Grid>
          )}
        </Grid>

        {(isLoading || isInitializing) && (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 8 }}>
            <CircularProgress size={60} />
          </Box>
        )}

        {isError && (
          <Paper sx={{ p: 4, textAlign: 'center', bgcolor: 'error.light', mb: 3 }}>
            <Typography color="error" variant="h6">
              حدث خطأ في تحميل البيانات
            </Typography>
            <Typography variant="body2" sx={{ mt: 1 }}>
              {error?.message}
            </Typography>
            <Button variant="outlined" onClick={() => refetch()} sx={{ mt: 2 }}>
              إعادة المحاولة
            </Button>
          </Paper>
        )}

        {showContent && (
          <>
            {periodInfo && (
              <Box sx={{ mb: 3, textAlign: 'center' }}>
                <Chip
                  label={`الفترة ${periodInfo.text}`}
                  color="primary"
                  variant="outlined"
                  sx={{ fontSize: '0.9rem', fontWeight: 600 }}
                />
              </Box>
            )}

            <Grid container justifyContent="center" sx={{ mb: 4, width: '100%' }}>
              <Grid item xs={12} md={8}>
                <IncomeStatementNetProfitCard incomeData={incomeData} />
              </Grid>
            </Grid>

            <IncomeStatementSummaryCards incomeData={incomeData} />
            <IncomeStatementDetailsSection incomeData={incomeData} />
          </>
        )}

        {showEmpty && (
          <Paper sx={{ p: 6, textAlign: 'center' }}>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              لا توجد بيانات للفترة المحددة
            </Typography>
            <Typography variant="body2" color="text.secondary">
              قم بتحديد فترة أخرى واضغط على "عرض التقرير"
            </Typography>
          </Paper>
        )}
      </Box>
    </LocalizationProvider>
  );
};

export default IncomeStatement;
