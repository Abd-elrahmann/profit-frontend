import React, { useState, useCallback } from 'react';
import { Box, Typography, Paper, CircularProgress, Alert, useMediaQuery } from '@mui/material';
import { Search } from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { handleApiError } from '../../config/Api';
import { getAccountLedger } from './generalLedgerApi';
import GeneralLedgerSearch from '../../components/modals/GeneralLedgerSearch';
import {
  GeneralLedgerToolbar,
  GeneralLedgerSearchParams,
  GeneralLedgerSummaryCards,
  GeneralLedgerTable,
  GeneralLedgerCards,
  GeneralLedgerPagination,
} from '../../components/GeneralLedger';
import { exportGeneralLedgerToPDF, exportGeneralLedgerToExcel } from '../../utilities/GeneralLedgerExporter';
import { notifySuccess, notifyError } from '../../utilities/toastify';
import { usePermissions } from '../../components/Contexts/PermissionsContext';

export default function GeneralLedger() {
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [searchParams, setSearchParams] = useState(null);
  const [exportLoading, setExportLoading] = useState({ pdf: false, excel: false });
  const [currentPage, setCurrentPage] = useState(1);
  const [pageLimit] = useState(10);

  const isMobile = useMediaQuery('(max-width: 768px)');
  const isTablet = useMediaQuery('(max-width: 1024px)');
  const isSmallScreen = isMobile || isTablet;

  const { permissions } = usePermissions();

  const { data: ledgerData, isLoading: isLoadingLedger, error } = useQuery({
    queryKey: ['account-ledger', searchParams?.account?.id, searchParams?.fromDate, searchParams?.toDate, currentPage, pageLimit],
    queryFn: () =>
      searchParams
        ? getAccountLedger(searchParams.account.id, searchParams.fromDate, searchParams.toDate, currentPage, pageLimit)
        : null,
    enabled: !!searchParams,
    retry: 1,
  });

  const handleSearch = useCallback((params) => {
    setSearchParams(params);
    setCurrentPage(1);
  }, []);

  const handleReset = useCallback(() => {
    setSearchParams(null);
    setCurrentPage(1);
  }, []);

  const handlePageChange = (event, value) => setCurrentPage(value);

  const handleExportPDF = useCallback(async () => {
    if (!ledgerData || !searchParams) return;
    setExportLoading((prev) => ({ ...prev, pdf: true }));
    try {
      await exportGeneralLedgerToPDF(ledgerData, searchParams.account, searchParams);
      notifySuccess('تم تصدير دفتر الأستاذ بصيغة PDF بنجاح');
    } catch (err) {
      notifyError('حدث خطأ أثناء تصدير PDF');
      handleApiError(err);
    } finally {
      setExportLoading((prev) => ({ ...prev, pdf: false }));
    }
  }, [ledgerData, searchParams]);

  const handleExportExcel = useCallback(async () => {
    if (!ledgerData || !searchParams) return;
    setExportLoading((prev) => ({ ...prev, excel: true }));
    try {
      await exportGeneralLedgerToExcel(ledgerData, searchParams.account, searchParams);
      notifySuccess('تم تصدير دفتر الأستاذ بصيغة Excel بنجاح');
    } catch (err) {
      notifyError('حدث خطأ أثناء تصدير Excel');
      handleApiError(err);
    } finally {
      setExportLoading((prev) => ({ ...prev, excel: false }));
    }
  }, [ledgerData, searchParams]);

  const totalDebit =
    ledgerData?.journals?.reduce((sum, journal) => {
      return sum + journal.lines.reduce((lineSum, line) => lineSum + (line.debit || 0), 0);
    }, 0) || 0;

  const totalCredit =
    ledgerData?.journals?.reduce((sum, journal) => {
      return sum + journal.lines.reduce((lineSum, line) => lineSum + (line.credit || 0), 0);
    }, 0) || 0;

  const closingBalance = ledgerData?.account?.balance || 0;

  const hasExportPermission = permissions.includes('general-ledger_Export');
  const hasJournals = ledgerData?.journals && ledgerData.journals.length > 0;

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.paper' }}>
      <Helmet>
        <title>دفتر الأستاذ العام</title>
        <meta name="description" content="دفتر الأستاذ العام للمحاسبة" />
      </Helmet>

      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          minHeight: '100vh',
          p: isSmallScreen ? 2 : 3,
        }}
      >
        <Box sx={{ mb: 3 }}>
          <GeneralLedgerToolbar
            isSmallScreen={isSmallScreen}
            hasExportPermission={hasExportPermission}
            searchParams={searchParams}
            ledgerData={ledgerData}
            exportLoading={exportLoading}
            onExportPDF={handleExportPDF}
            onExportExcel={handleExportExcel}
            onReset={handleReset}
            onSearchClick={() => setSearchModalOpen(true)}
          />

          <GeneralLedgerSearchParams searchParams={searchParams} isSmallScreen={isSmallScreen} />
        </Box>

        <Box sx={{ flex: 1 }}>
          {!searchParams ? (
            <Paper
              sx={{
                borderRadius: 2,
                boxShadow: '0 2px 12px rgba(0,0,0,0.1)',
                overflow: 'hidden',
                textAlign: 'center',
                p: 6,
              }}
            >
              <Search sx={{ fontSize: 64, color: 'primary.main', mb: 2 }} />
              <Typography variant="body2">اختر حساباً للبحث</Typography>
            </Paper>
          ) : isLoadingLedger ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 6 }}>
              <CircularProgress size={60} />
            </Box>
          ) : error ? (
            <Alert severity="error" sx={{ borderRadius: 2 }}>
              حدث خطأ في تحميل بيانات الحساب: {error.message}
            </Alert>
          ) : (
            <Box>
              <GeneralLedgerSummaryCards
                totalDebit={totalDebit}
                totalCredit={totalCredit}
                totalJournals={ledgerData?.totalJournals}
                closingBalance={closingBalance}
                isSmallScreen={isSmallScreen}
              />

              <Paper
                sx={{
                  borderRadius: 2,
                  boxShadow: '0 2px 12px rgba(0,0,0,0.1)',
                  overflow: 'hidden',
                  p: isSmallScreen ? 2 : 3,
                }}
              >
                {isSmallScreen ? (
                  <GeneralLedgerCards journals={ledgerData?.journals} />
                ) : (
                  <GeneralLedgerTable journals={ledgerData?.journals} />
                )}

                {!hasJournals && (
                  <Box sx={{ textAlign: 'center', py: 6 }}>
                    <Typography variant="h6" color="text.secondary" gutterBottom>
                      لا توجد قيود في الفترة المحددة
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      لم يتم تسجيل أي قيود للحساب في الفترة المحددة
                    </Typography>
                  </Box>
                )}

                {(ledgerData?.totalPages ?? 0) > 1 && (
                  <GeneralLedgerPagination
                    currentPage={currentPage}
                    totalPages={ledgerData.totalPages}
                    onPageChange={handlePageChange}
                  />
                )}
              </Paper>
            </Box>
          )}
        </Box>
      </Box>

      <GeneralLedgerSearch open={searchModalOpen} onClose={() => setSearchModalOpen(false)} onSearch={handleSearch} />
    </Box>
  );
}