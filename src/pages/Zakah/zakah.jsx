import React, { useState, useCallback, useEffect } from 'react';
import { Box, IconButton, Typography, Alert, CircularProgress } from '@mui/material';
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import { useMediaQuery } from '@mui/material';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getPartnerZakah, getZakatAccountReport, withdrawZakat } from './zakahApi';
import { Helmet } from 'react-helmet-async';
import { notifySuccess, notifyError } from '../../utilities/toastify';
import { usePermissions } from '../../components/Contexts/PermissionsContext';
import WithdrawZakah from '../../components/modals/WithdrawZakah';
import {
  ZakahStatsCards,
  ZakahTabs,
  ZakahPartnersTable,
  ZakahPartnerDetails,
  ZakahAccountTab,
  ZakahPartnerSidebar,
  ZakahAccountSidebar,
} from '../../components/Zakah';

const Zakah = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [selectedPartner, setSelectedPartner] = useState(null);
  const [selectedYear, setSelectedYear] = useState(null);
  const [tableYear, setTableYear] = useState(new Date().getFullYear());
  const [statsTotals, setStatsTotals] = useState(null);
  const [withdrawDialogOpen, setWithdrawDialogOpen] = useState(false);
  const [selectedFilterMonth, setSelectedFilterMonth] = useState(
    new Date().getMonth() + 1
  );
  const [selectedFilterYear, setSelectedFilterYear] = useState(
    new Date().getFullYear()
  );
  const [isExporting, setIsExporting] = useState(false);

  const { permissions } = usePermissions();
  const queryClient = useQueryClient();

  const [debouncedMonth, setDebouncedMonth] = useState(selectedFilterMonth);
  const [debouncedYear, setDebouncedYear] = useState(selectedFilterYear);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedMonth(selectedFilterMonth);
      setDebouncedYear(selectedFilterYear);
    }, 300);
    return () => clearTimeout(timer);
  }, [selectedFilterMonth, selectedFilterYear]);

  const isMobile = useMediaQuery('(max-width: 480px)');
  const isTablet = useMediaQuery('(max-width: 768px)');
  const isSmallScreen = isMobile || isTablet;

  const { data: partnerZakahData, isLoading: isPartnerLoading } = useQuery({
    queryKey: ['partner-zakah', selectedPartner],
    queryFn: () => getPartnerZakah(selectedPartner),
    enabled: !!selectedPartner && activeTab === 1,
  });

  const {
    data: accountReport,
    isLoading: isAccountLoading,
    error: accountError,
  } = useQuery({
    queryKey: ['zakat-account', debouncedMonth, debouncedYear],
    queryFn: () =>
      getZakatAccountReport(
        `${debouncedYear}-${debouncedMonth.toString().padStart(2, '0')}`
      ),
    enabled: activeTab === 2,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
  });

  const handleViewDetails = useCallback((partnerId, year) => {
    setSelectedPartner(partnerId);
    setSelectedYear(year);
    setActiveTab(1);
  }, []);

  const handleBackToList = useCallback(() => {
    setActiveTab(0);
    setSelectedPartner(null);
    setSelectedYear(null);
  }, []);

  const handleTabChange = useCallback((newTab) => {
    setActiveTab(newTab);
    if (newTab === 0) {
      setSelectedPartner(null);
      setSelectedYear(null);
    }
  }, []);

  const handleWithdraw = useCallback(
    async (amount) => {
      try {
        await withdrawZakat(amount);
        notifySuccess(`تم سحب مبلغ ${amount} بنجاح`);
        queryClient.invalidateQueries(['zakat-account']);
      } catch (error) {
        notifyError(
          error.response?.data?.message || 'حدث خطأ أثناء سحب الزكاة'
        );
        throw error;
      }
    },
    [queryClient]
  );

  const handleExportPDF = useCallback(async () => {
    let exportData, filters;
    if (activeTab === 2 && accountReport) {
      exportData = accountReport;
      filters = {
        month: selectedFilterMonth.toString().padStart(2, '0'),
        year: selectedFilterYear,
      };
    } else if (activeTab === 1 && partnerZakahData) {
      exportData = partnerZakahData;
      filters = { partner: selectedPartner, year: selectedYear };
    } else return;

    setIsExporting(true);
    try {
      const { exportZakahToPDF } = await import('../../utilities/zakahExporter');
      await exportZakahToPDF(exportData, filters);
      notifySuccess('تم تصدير تقرير الزكاة إلى PDF بنجاح');
    } catch (error) {
      notifyError('حدث خطأ أثناء تصدير PDF');
      console.error('PDF export error:', error);
    } finally {
      setIsExporting(false);
    }
  }, [
    activeTab,
    accountReport,
    partnerZakahData,
    selectedFilterMonth,
    selectedFilterYear,
    selectedPartner,
    selectedYear,
  ]);

  const handleExportExcel = useCallback(async () => {
    let exportData, filters;
    if (activeTab === 2 && accountReport) {
      exportData = accountReport;
      filters = {
        month: selectedFilterMonth.toString().padStart(2, '0'),
        year: selectedFilterYear,
      };
    } else if (activeTab === 1 && partnerZakahData) {
      exportData = partnerZakahData;
      filters = { partner: selectedPartner, year: selectedYear };
    } else return;

    setIsExporting(true);
    try {
      const { exportZakahToExcel } = await import(
        '../../utilities/zakahExporter'
      );
      await exportZakahToExcel(exportData, filters);
      notifySuccess('تم تصدير تقرير الزكاة إلى Excel بنجاح');
    } catch (error) {
      notifyError('حدث خطأ أثناء تصدير Excel');
      console.error('Excel export error:', error);
    } finally {
      setIsExporting(false);
    }
  }, [
    activeTab,
    accountReport,
    partnerZakahData,
    selectedFilterMonth,
    selectedFilterYear,
    selectedPartner,
    selectedYear,
  ]);

  const handleTotalsChange = useCallback((totals) => {
    setStatsTotals(totals);
  }, []);

  const hasAccountExportData =
    accountReport?.journalsByMonth &&
    Object.values(accountReport.journalsByMonth).some(
      (month) => Array.isArray(month.entries) && month.entries.length > 0
    );

  const hasPartnerExportData =
    (Array.isArray(partnerZakahData) && partnerZakahData.length > 0) ||
    (partnerZakahData && typeof partnerZakahData === 'object');

  return (
    <div
      dir="rtl"
      className="min-h-screen  dark:bg-background-dark text-slate-900 dark:text-slate-100"
    >
      <Helmet>
        <title>الزكاة</title>
        <meta name="description" content="إدارة الزكاة" />
      </Helmet>

      <div
        className={`flex ${isSmallScreen ? 'flex-col' : 'flex-row-reverse'} flex-1 w-full`}
      >
        {!isSmallScreen && activeTab === 1 && partnerZakahData && (
          <ZakahPartnerSidebar
            partnerZakahData={partnerZakahData}
            selectedYear={selectedYear}
            onYearChange={setSelectedYear}
          />
        )}

        {!isSmallScreen && activeTab === 2 && accountReport && (
          <ZakahAccountSidebar
            accountReport={accountReport}
            onWithdrawClick={() => setWithdrawDialogOpen(true)}
            permissions={permissions}
          />
        )}

        <div className="flex-1 p-4 md:p-8 overflow-y-auto w-full">
          <div className="max-w-7xl mx-auto w-full space-y-8">
            {isSmallScreen && activeTab === 1 && (
              <div className="flex items-center gap-2 mb-4">
                <IconButton onClick={handleBackToList} size="small">
                  <ArrowBackIcon />
                </IconButton>
                <Typography variant="h6" fontWeight="bold">
                  تفاصيل الزكاة
                </Typography>
              </div>
            )}

            <ZakahTabs
              activeTab={activeTab}
              onTabChange={handleTabChange}
              selectedPartner={selectedPartner}
              isCompact={isSmallScreen}
            />

            {activeTab === 0 && (
              <>
                {statsTotals && (
                  <ZakahStatsCards totals={statsTotals} />
                )}
                <div className="bg-white dark:bg-background-dark rounded-xl border border-primary/10 shadow-sm overflow-hidden">
                  <div className="p-6 border-b border-primary/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">
                        تفاصيل زكاة الشركاء
                      </h3>
                      <p className="text-sm text-slate-500 mt-1">
                        عرض حالة دفع الزكاة لجميع الشركاء المسجلين
                      </p>
                    </div>
                  </div>
                  <div className="p-6">
                    <ZakahPartnersTable
                      onViewDetails={handleViewDetails}
                      isMobile={isMobile}
                      selectedYear={tableYear}
                      onYearChange={setTableYear}
                      onTotalsChange={handleTotalsChange}
                    />
                  </div>
                </div>
              </>
            )}

            {activeTab === 1 && (
              <>
                {!selectedPartner ? (
                  <Alert severity="info" className="mt-4">
                    يرجى اختيار شريك لعرض تفاصيل زكاته
                  </Alert>
                ) : isPartnerLoading ? (
                  <div className="flex justify-center items-center min-h-[200px]">
                    <CircularProgress size={40} />
                  </div>
                ) : partnerZakahData ? (
                  <ZakahPartnerDetails
                    partnerZakahData={partnerZakahData}
                    selectedYear={selectedYear}
                    isSmallScreen={isSmallScreen}
                    isPartnerLoading={isPartnerLoading}
                    isExporting={isExporting}
                    hasPartnerExportData={hasPartnerExportData}
                    onExportPDF={handleExportPDF}
                    onExportExcel={handleExportExcel}
                    onBackToRoot={handleBackToList}
                    permissions={permissions}
                  />
                ) : (
                  <Alert severity="error">
                    حدث خطأ في تحميل بيانات الزكاة
                  </Alert>
                )}
              </>
            )}

            {activeTab === 2 && (
              <ZakahAccountTab
                accountReport={accountReport}
                isAccountLoading={isAccountLoading}
                accountError={accountError}
                selectedFilterMonth={selectedFilterMonth}
                selectedFilterYear={selectedFilterYear}
                onMonthChange={setSelectedFilterMonth}
                onYearChange={setSelectedFilterYear}
                onWithdrawClick={() => setWithdrawDialogOpen(true)}
                handleExportPDF={handleExportPDF}
                handleExportExcel={handleExportExcel}
                isExporting={isExporting}
                hasAccountExportData={hasAccountExportData}
                permissions={permissions}
                isSmallScreen={isSmallScreen}
              />
            )}
          </div>
        </div>
      </div>

      <WithdrawZakah
        open={withdrawDialogOpen}
        onClose={() => setWithdrawDialogOpen(false)}
        onWithdraw={handleWithdraw}
        accountBalance={accountReport?.account?.balance}
      />
    </div>
  );
};

export default Zakah;
