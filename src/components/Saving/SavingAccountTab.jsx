import React from 'react';
import { Box, Alert, CircularProgress } from '@mui/material';
import SavingAccountSummaryCards from './SavingAccountSummaryCards';
import SavingAccountJournals from './SavingAccountJournals';
const SavingAccountTab = ({ accountReport, isAccountLoading, isMobile, theme }) => {
  if (isAccountLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress size={40} />
      </Box>
    );
  }
  if (!accountReport?.journalsByMonth || Object.keys(accountReport.journalsByMonth).length === 0) {
    return (
      <Box sx={{ textAlign: 'center' }}>
        <SavingAccountSummaryCards accountReport={accountReport} theme={theme} />
        <Alert severity="info" sx={{ mt: 2 }}>
          لا توجد عمليات مالية لحساب الادخار
        </Alert>
      </Box>
    );
  }
  return (
    <Box sx={{ textAlign: 'center' }}>
      <SavingAccountSummaryCards accountReport={accountReport} theme={theme} />
      <SavingAccountJournals accountReport={accountReport} isMobile={isMobile} />
    </Box>
  );
};
export default SavingAccountTab;