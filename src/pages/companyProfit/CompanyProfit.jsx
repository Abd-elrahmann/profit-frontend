import React, { useState, useCallback } from 'react';
import { Box, Paper, Alert, CircularProgress, Typography, useMediaQuery, useTheme } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { notifySuccess, notifyError } from '../../utilities/toastify';
import { getCompanyProfitReport } from './CompanyProfitApi';
import { exportCompanyProfitToPDF, exportCompanyProfitToExcel } from '../../utilities/companyProfitExporter';
import { usePermissions } from '../../components/Contexts/PermissionsContext';
import WithdrawCompanyProfitModal from '../../components/modals/WithdrawCompanyProfitModal';
import {
  ProfitSummaryCards,
  CompanyProfitSourcesTable,
  WithdrawalHistoryTable,
  CompanyProfitToolbar,
} from '../../components/CompanyProfit';

export default function CompanyProfit() {
  const theme = useTheme();
  const [withdrawModalOpen, setWithdrawModalOpen] = useState(false);
  const [profitPage, setProfitPage] = useState(1);
  const [isExporting, setIsExporting] = useState(false);

  const { permissions } = usePermissions();
  const isMobile = useMediaQuery('(max-width: 480px)');
  const isTablet = useMediaQuery('(max-width: 768px)');
  const isSmallScreen = isMobile || isTablet;

  const { data: profitData, isLoading: profitLoading, error: profitError, refetch: refetchProfit } = useQuery({
    queryKey: ['company-profit', profitPage],
    queryFn: () => getCompanyProfitReport(profitPage),
    retry: 1,
  });

  const handleWithdrawModalOpen = () => setWithdrawModalOpen(true);
  const handleWithdrawModalClose = () => setWithdrawModalOpen(false);

  const handleProfitPageChange = (event, value) => setProfitPage(value);

  const handleExportPDF = useCallback(async () => {
    if (!profitData) return;
    setIsExporting(true);
    try {
      await exportCompanyProfitToPDF(profitData);
      notifySuccess('تم تصدير PDF بنجاح');
    } catch (error) {
      console.error('PDF Export Error:', error);
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
    } catch (error) {
      console.error('Excel Export Error:', error);
      notifyError('حدث خطأ أثناء تصدير Excel');
    } finally {
      setIsExporting(false);
    }
  }, [profitData]);

  return (
    <Box sx={{ minHeight: '100vh' }}>
      <Helmet>
        <title>أرباح الشركة</title>
        <meta name="description" content="إدارة أرباح الشركة وسحب الأرباح" />
      </Helmet>

      <Box sx={{ p: isSmallScreen ? 2 : 3, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
          <Paper
            sx={{
              borderRadius: 2,
              boxShadow: '0 2px 12px rgba(0,0,0,0.1)',
              overflow: 'hidden',
              width: isSmallScreen ? '100%' : 'calc(100vw - 240px)',
              maxWidth: '100%',
            }}
          >
            <Box
              sx={{
                display: 'flex',
                flexDirection: isSmallScreen ? 'column' : 'row',
                justifyContent: 'space-between',
                alignItems: isSmallScreen ? 'flex-start' : 'center',
                p: isSmallScreen ? 2 : 3,
                gap: isSmallScreen ? 2 : 0,
                borderBottom: `1px solid ${theme.palette.divider}`,
                bgcolor: theme.palette.background.default,
              }}
            >
              <Box>
                <Typography
                  variant={isSmallScreen ? 'subtitle1' : 'h6'}
                  fontWeight="bold"
                  color={theme.palette.text.primary}
                >
                  أرباح الشركة
                </Typography>
              </Box>
              <CompanyProfitToolbar
                isSmallScreen={isSmallScreen}
                hasWithdrawPermission={permissions.includes('company_Add')}
                hasExportPermission={permissions.includes('company_Export')}
                profitData={profitData}
                isExporting={isExporting}
                onWithdrawClick={handleWithdrawModalOpen}
                onExportPDF={handleExportPDF}
                onExportExcel={handleExportExcel}
                theme={theme}
              />
            </Box>

            {profitLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 6 }}>
                <CircularProgress size={60} />
              </Box>
            ) : profitError ? (
              <Box sx={{ p: 3 }}>
                <Alert severity="error">
                  حدث خطأ في تحميل بيانات أرباح الشركة: {profitError.message}
                </Alert>
              </Box>
            ) : (
              <>
                <ProfitSummaryCards profitData={profitData} isSmallScreen={isSmallScreen} />

                <CompanyProfitSourcesTable
                  periods={profitData?.periodsProfit?.periods}
                  isSmallScreen={isSmallScreen}
                />

                <WithdrawalHistoryTable
                  withdrawals={profitData?.data}
                  totalPages={profitData?.totalPages}
                  currentPage={profitData?.currentPage}
                  onPageChange={handleProfitPageChange}
                  isSmallScreen={isSmallScreen}
                />
              </>
            )}
          </Paper>
        </Box>
      </Box>

      <WithdrawCompanyProfitModal
        open={withdrawModalOpen}
        onClose={handleWithdrawModalClose}
        availableAmount={profitData?.availableAmount}
        onSuccess={refetchProfit}
      />
    </Box>
  );
}
