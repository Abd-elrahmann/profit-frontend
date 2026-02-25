import React, { useState, useEffect, useMemo } from "react";
import {
  Box,
  Typography,
  Paper,
  Alert,
  CircularProgress,
  useMediaQuery,
  Button,
  Pagination,
} from "@mui/material";
import { AccountBalance } from "@mui/icons-material";
import { useQuery } from "@tanstack/react-query";
import { Helmet } from "react-helmet-async";
import { exportJournalsToPDF, exportJournalsToExcel, exportStatisticsToPDF, exportStatisticsToExcel } from '../../utilities/treasuryJournalsExporter';
import { notifySuccess, notifyError } from '../../utilities/toastify';
import { usePermissions } from '../../components/Contexts/PermissionsContext';
import { useCountUp } from '../../hooks/useCountUp';
import { useTheme } from '../../theme/ThemeContext';
import {
  TreasuryTabs,
  TreasuryExportButtons,
  TreasuryMonthYearFilter,
  TreasuryJournalTable,
  TreasuryJournalCards,
  TreasuryBankSummaryCards,
  TreasuryCapitalSummaryCards,
  TreasuryBalanceChart,
  TreasuryMonthlyBalanceChart,
  TreasuryTransactionTypeChart,
  TreasuryStatusDistributionChart,
  TreasuryRepaymentsChart,
  getBankAccountData,
  getYears,
  getMonthName,
  getCurrentJournals,
} from '../../components/Treasury';

export default function Treasury() {
  const [tab, setTab] = useState(0);
  const [isExporting, setIsExporting] = useState(false);

  // تعيين القيم الافتراضية للشهر والسنة الحالية
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth() + 1; // getMonth() يعيد 0-11

  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const { isDarkMode } = useTheme();

  const isMobile = useMediaQuery("(max-width: 480px)");
  const isTablet = useMediaQuery("(max-width: 768px)");
  const isSmallScreen = isMobile || isTablet;

  const { permissions } = usePermissions();

  // تجهيز قيمة month لإرسالها للـ API
  const monthParam = selectedYear && selectedMonth
    ? `${selectedYear}-${String(selectedMonth).padStart(2, '0')}`
    : null;

  const { data: bankData, isLoading, error } = useQuery({
    queryKey: ["bank-account", tab, monthParam, selectedYear, page, limit],
    queryFn: () => getBankAccountData(tab === 1 ? 'capital' : 'bank', monthParam, selectedYear, page, limit),
    retry: 1,
    enabled: tab === 0 || tab === 1 || tab === 2,
  });

  useEffect(() => {
    const prefersDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
    console.log('System prefers dark mode:', prefersDarkMode);
  }, []);

  const currentData = bankData;

  const availableBalance = currentData?.account?.balance || 0;
  const totalDebit = currentData?.account?.debit || 0;
  const totalCredit = currentData?.account?.credit || 0;
  const totalTransactions = currentData?.totalJournalEntries || 0;
  const loansBalance = currentData?.loansBalance || 0;
  const loansInterest = currentData?.loansInterest || 0;
  const total = currentData?.total || 0;

  const totalRepaymentsAmount = currentData?.repayments?.totalAmount || 0;
  const paidRepaymentsUntilNow = currentData?.repayments?.paidUntilNow || 0;
  const totalDiscount = currentData?.repayments?.discount || 0;
  const remainingRepayments = totalRepaymentsAmount - paidRepaymentsUntilNow;
  const totalPaid = paidRepaymentsUntilNow + totalDiscount;
  const repaymentsProgress = totalRepaymentsAmount > 0
    ? Math.min(100, Math.max(0, (totalPaid / totalRepaymentsAmount) * 100))
    : 0;

  const currentMonthTotalAmount = currentData?.currentMonth?.totalAmount || 0;
  const currentMonthPaidUntilNow = currentData?.currentMonth?.paidUntilNow || 0;
  const currentMonthRemainingRepayment = currentData?.currentMonth?.remaining || 0;
  const currentMonthDiscount = currentData?.currentMonth?.discount || 0;
  const currentTotalPaid = currentMonthPaidUntilNow + totalDiscount;
  const currentMonthProgress = currentMonthTotalAmount > 0
    ? Math.max(0, (currentTotalPaid / currentMonthTotalAmount) * 100)
    : 0;

  const animatedAvailableBalance = useCountUp(availableBalance, 600, !isLoading);
  const animatedTotalDebit = useCountUp(totalDebit, 600, !isLoading);
  const animatedTotalCredit = useCountUp(totalCredit, 600, !isLoading);
  const animatedLoansBalance = useCountUp(loansBalance, 600, !isLoading);
  const animatedLoansInterest = useCountUp(loansInterest, 600, !isLoading);
  const animatedTotal = useCountUp(total, 600, !isLoading);
  const animatedCurrentMonthTotal = useCountUp(currentMonthTotalAmount, 600, !isLoading);

  const monthlyBalanceData = tab === 0 && currentData?.journalsByMonth ?
    Object.entries(currentData.journalsByMonth)
      .map(([month, data]) => ({
        name: getMonthName(month),
        monthKey: month,
        الرصيد: data.totalBalance,
        الوارد: data.totalDebit,
        الصادر: data.totalCredit,
      }))
      .sort((a, b) => a.monthKey.localeCompare(b.monthKey)) : [];

  const transactionTypeData = tab === 0 ? [
    { name: 'الوارد', value: totalDebit, color: '#00C49F' },
    { name: 'الصادر', value: totalCredit, color: '#FF8042' },
  ] : [];

  const currentJournals = getCurrentJournals(currentData, monthParam);

  const statusDistribution = tab === 0 && currentJournals.length > 0 ? [
    { name: 'مرحل', value: currentJournals.filter(j => j.status === 'POSTED').length || 0 },
    { name: 'مسودة', value: currentJournals.filter(j => j.status === 'DRAFT').length || 0 },
  ] : [];

  const pagination = currentData?.pagination || {
    page: 1,
    limit: limit,
    totalJournals: totalTransactions,
    totalPages: 1,
  };

  const currentTotalTransactions = pagination.totalJournals || totalTransactions;

  const totalBalance = availableBalance + totalCredit;
  const balancePercentage = totalBalance > 0 ? (availableBalance / totalBalance) * 100 : 0;
  const circumference = 2 * Math.PI * 45;
  const strokeDasharray = `${(balancePercentage / 100) * circumference} ${circumference}`;

  const allYears = useMemo(() => getYears(), []);

  const handleTabChange = (event, newValue) => {
    setTab(newValue);
  };

  const handleMonthChange = (event, newValue) => {
    setSelectedMonth(newValue?.value || null);
    setPage(1);
  };

  const handleYearChange = (event, newValue) => {
    setSelectedYear(newValue?.value || null);
    setPage(1);
  };

  const handlePageChange = (event, newPage) => {
    setPage(newPage);
  };

  const handleExportPDF = async () => {
    if (!bankData) return;

    setIsExporting(true);
    try {
      await exportJournalsToPDF(bankData, 'النقد في الصندوق');
      notifySuccess('تم تصدير PDF بنجاح');
    } catch (error) {
      console.error('PDF Export Error:', error);
      notifyError('حدث خطأ أثناء تصدير PDF');
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportExcel = async () => {
    if (!bankData) return;

    setIsExporting(true);
    try {
      await exportJournalsToExcel(bankData, 'النقد في الصندوق');
      notifySuccess('تم تصدير Excel بنجاح');
    } catch (error) {
      console.error('Excel Export Error:', error);
      notifyError('حدث خطأ أثناء تصدير Excel');
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportStatisticsPDF = async () => {
    if (!bankData) return;

    setIsExporting(true);
    try {
      await exportStatisticsToPDF(bankData, 'النقد في الصندوق');
      notifySuccess('تم تصدير إحصائيات PDF بنجاح');
    } catch (error) {
      console.error('Statistics PDF Export Error:', error);
      notifyError('حدث خطأ أثناء تصدير إحصائيات PDF');
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportStatisticsExcel = async () => {
    if (!bankData) return;

    setIsExporting(true);
    try {
      await exportStatisticsToExcel(bankData, 'النقد في الصندوق');
      notifySuccess('تم تصدير إحصائيات Excel بنجاح');
    } catch (error) {
      console.error('Statistics Excel Export Error:', error);
      notifyError('حدث خطأ أثناء تصدير إحصائيات Excel');
    } finally {
      setIsExporting(false);
    }
  };

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">
          حدث خطأ في تحميل بيانات الصندوق: {error.message}
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{
      minHeight: "100vh",
    }}>
      <Helmet>
        <title>الصندوق</title>
        <meta name="description" content="إدارة الصندوق والنقدية" />
      </Helmet>

      <Box sx={{ p: isSmallScreen ? 2 : 3, mb: 3 }}>
        <Box sx={{
          display: 'flex',
          flexDirection: isSmallScreen ? 'column' : 'row',
          alignItems: isSmallScreen ? 'stretch' : 'center',
          justifyContent: 'space-between',
          gap: isSmallScreen ? 2 : 0,
          mb: 2
        }}>
          <TreasuryTabs
            value={tab}
            onChange={handleTabChange}
            isSmallScreen={isSmallScreen}
            isDarkMode={isDarkMode}
          />

          {permissions.includes("treasury_Export") && (
            <Box sx={{
              display: 'flex',
              gap: 1,
              alignItems: 'center',
              justifyContent: isSmallScreen ? 'center' : 'flex-end',
              flexShrink: 0
            }}>
              <TreasuryExportButtons
                tab={tab}
                isExporting={isExporting}
                hasData={!!bankData}
                hasJournals={currentJournals.length > 0}
                onExportStatisticsPDF={handleExportStatisticsPDF}
                onExportStatisticsExcel={handleExportStatisticsExcel}
                onExportPDF={handleExportPDF}
                onExportExcel={handleExportExcel}
                isSmallScreen={isSmallScreen}
              />
            </Box>
          )}
        </Box>

        <Box sx={{ mt: isSmallScreen ? 2 : 4 }}>
          {isLoading ? (
            <Box sx={{ display: "flex", justifyContent: "center", p: 6 }}>
              <CircularProgress size={60} />
            </Box>
          ) : (
            <>
              {tab === 0 && (
                <Box>
                  <TreasuryMonthYearFilter
                    selectedMonth={selectedMonth}
                    selectedYear={selectedYear}
                    allYears={allYears}
                    onMonthChange={handleMonthChange}
                    onYearChange={handleYearChange}
                    isDarkMode={isDarkMode}
                    isSmallScreen={isSmallScreen}
                  />

                  <TreasuryBankSummaryCards
                    animatedAvailableBalance={animatedAvailableBalance}
                    animatedTotalDebit={animatedTotalDebit}
                    animatedTotalCredit={animatedTotalCredit}
                    animatedLoansInterest={animatedLoansInterest}
                    animatedLoansBalance={animatedLoansBalance}
                    animatedTotal={animatedTotal}
                    currentMonthTotalAmount={animatedCurrentMonthTotal}
                    currentMonthPaidUntilNow={currentMonthPaidUntilNow}
                    currentMonthRemainingRepayment={currentMonthRemainingRepayment}
                    currentMonthDiscount={currentMonthDiscount}
                    currentMonthProgress={currentMonthProgress}
                    totalRepaymentsAmount={totalRepaymentsAmount}
                    paidRepaymentsUntilNow={paidRepaymentsUntilNow}
                    remainingRepayments={remainingRepayments}
                    totalDiscount={totalDiscount}
                    repaymentsProgress={repaymentsProgress}
                    isSmallScreen={isSmallScreen}
                    isDarkMode={isDarkMode}
                  />

                  {totalBalance > 0 && (
                    <TreasuryBalanceChart
                      availableBalance={availableBalance}
                      totalCredit={totalCredit}
                      totalBalance={totalBalance}
                      balancePercentage={balancePercentage}
                      strokeDasharray={strokeDasharray}
                      isSmallScreen={isSmallScreen}
                      isDarkMode={isDarkMode}
                    />
                  )}

                  {monthlyBalanceData.length > 0 && (
                    <TreasuryMonthlyBalanceChart
                      data={monthlyBalanceData}
                      isSmallScreen={isSmallScreen}
                      isDarkMode={isDarkMode}
                    />
                  )}

                  {transactionTypeData.length > 0 && (
                    <TreasuryTransactionTypeChart
                      data={transactionTypeData}
                      isSmallScreen={isSmallScreen}
                      isDarkMode={isDarkMode}
                    />
                  )}

                  {statusDistribution.length > 0 && (
                    <TreasuryStatusDistributionChart
                      data={statusDistribution}
                      isSmallScreen={isSmallScreen}
                      isDarkMode={isDarkMode}
                    />
                  )}

                  {totalRepaymentsAmount > 0 && (
                    <TreasuryRepaymentsChart
                      paidRepaymentsUntilNow={paidRepaymentsUntilNow}
                      remainingRepayments={remainingRepayments}
                      totalRepaymentsAmount={totalRepaymentsAmount}
                      isSmallScreen={isSmallScreen}
                      isDarkMode={isDarkMode}
                    />
                  )}

                </Box>
              )}

              {tab === 1 && (
                <Box>
                  <TreasuryCapitalSummaryCards
                    animatedAvailableBalance={animatedAvailableBalance}
                    animatedTotalDebit={animatedTotalDebit}
                    animatedTotalCredit={animatedTotalCredit}
                    totalRepaymentsAmount={totalRepaymentsAmount}
                    paidRepaymentsUntilNow={paidRepaymentsUntilNow}
                    repaymentsProgress={repaymentsProgress}
                    isSmallScreen={isSmallScreen}
                    isDarkMode={isDarkMode}
                  />
                </Box>
              )}

              {tab === 2 && (
                <Box>
                  <TreasuryMonthYearFilter
                    selectedMonth={selectedMonth}
                    selectedYear={selectedYear}
                    allYears={allYears}
                    onMonthChange={handleMonthChange}
                    onYearChange={handleYearChange}
                    isDarkMode={isDarkMode}
                    isSmallScreen={isSmallScreen}
                    showTransactionCount
                    transactionCount={currentTotalTransactions}
                  />

                  <Paper sx={{
                    borderRadius: 2,
                    boxShadow: '0 2px 12px rgba(0,0,0,0.1)',
                    overflow: 'hidden',
                    bgcolor: isDarkMode ? 'background.paper' : 'background.paper'
                  }}>
                    <Box sx={{
                      display: 'flex',
                      flexDirection: isSmallScreen ? 'column' : 'row',
                      justifyContent: 'space-between',
                      alignItems: isSmallScreen ? 'flex-start' : 'center',
                      p: isSmallScreen ? 2 : 3,
                      gap: isSmallScreen ? 2 : 0,
                      borderBottom: isDarkMode ? '1px solid #424242' : '1px solid #e0e0e0',
                      bgcolor: isDarkMode ? '#2a2a2a' : '#fafafa'
                    }}>
                      <Box>
                        <Typography variant={isSmallScreen ? "subtitle1" : "h6"} fontWeight="bold" color="primary">
                          سجل القيود المحاسبية
                        </Typography>
                        {monthParam && (
                          <Typography variant="body2" color={isDarkMode ? 'text.secondary' : 'text.secondary'}>
                            عرض بيانات شهر {getMonthName(monthParam)}
                          </Typography>
                        )}
                      </Box>
                    </Box>

                    {currentJournals.length === 0 ? (
                      <Box sx={{ textAlign: 'center', py: 6 }}>
                        <AccountBalance sx={{ fontSize: 48, color: isDarkMode ? 'text.secondary' : 'text.secondary', mb: 2 }} />
                        <Typography variant="h6" color={isDarkMode ? 'text.secondary' : 'text.secondary'} gutterBottom>
                          {selectedMonth ? `لا توجد قيود مسجلة لشهر ${getMonthName(selectedMonth)}` : 'لا توجد قيود مسجلة'}
                        </Typography>
                        <Typography variant="body2" color={isDarkMode ? 'text.secondary' : 'text.secondary'}>
                          لم يتم تسجيل أي قيود محاسبية حتى الآن
                        </Typography>
                      </Box>
                    ) : (
                      <>
                        {isSmallScreen ? (
                          <TreasuryJournalCards journals={currentJournals} isDarkMode={isDarkMode} />
                        ) : (
                          <TreasuryJournalTable journals={currentJournals} isDarkMode={isDarkMode} />
                        )}

                        {pagination.totalPages > 1 && (
                          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mt: 3, mb: 2 }}>
                            <Pagination
                              count={pagination.totalPages}
                              page={pagination.page}
                              onChange={handlePageChange}
                              color="primary"
                              size={isSmallScreen ? "small" : "medium"}
                              showFirstButton
                              showLastButton
                              sx={{
                                '& .MuiPaginationItem-root': {
                                  fontSize: isSmallScreen ? '0.875rem' : '1rem',
                                  color: isDarkMode ? 'text.primary' : 'inherit'
                                }
                              }}
                            />
                          </Box>
                        )}
                      </>
                    )}
                  </Paper>
                </Box>
              )}
            </>
          )}
        </Box>
      </Box>
    </Box>
  );
}