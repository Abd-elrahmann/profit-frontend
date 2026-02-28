import React from 'react';
import { Box, Card, Typography } from '@mui/material';
import {
  AccountBalance as BalanceIcon,
  ArrowCircleDown as DepositIcon,
  ArrowCircleUp as WithdrawalIcon,
  CalendarMonth as CalendarIcon,
} from '@mui/icons-material';
import { formatCurrency } from './savingUtils';
const SavingAccountSummaryCards = ({ accountReport, theme }) => {
  if (!accountReport?.account) return null;
  const account = accountReport.account;
  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' },
        gap: 2,
        mb: 4,
        width: '100%',
      }}
    >
      <Card sx={{ bgcolor: 'primary.50', textAlign: 'center', p: 2, minWidth: 0 }}>
        <BalanceIcon color={theme.palette.primary.main} sx={{ fontSize: { xs: 32, sm: 40 }, mb: 1 }} />
        <Typography variant="h5" fontWeight="bold" color={theme.palette.primary.main} sx={{ wordBreak: 'break-word', fontSize: { xs: '1.1rem', sm: '1.5rem' } }}>
          {formatCurrency(account.balance)}
        </Typography>
        <Typography variant="body2" color={theme.palette.primary.main}>رصيد الصندوق</Typography>
      </Card>
      <Card sx={{ bgcolor: 'success.50', textAlign: 'center', p: 2, minWidth: 0 }}>
        <DepositIcon color="success" sx={{ fontSize: { xs: 32, sm: 40 }, mb: 1 }} />
        <Typography variant="h5" fontWeight="bold" color="success.main" sx={{ wordBreak: 'break-word', fontSize: { xs: '1.1rem', sm: '1.5rem' } }}>
          {formatCurrency(account.debit)}
        </Typography>
        <Typography variant="body2" color="success.main">إجمالي الإيداعات</Typography>
      </Card>
      <Card sx={{ bgcolor: 'warning.50', textAlign: 'center', p: 2, minWidth: 0 }}>
        <WithdrawalIcon color="warning" sx={{ fontSize: { xs: 32, sm: 40 }, mb: 1 }} />
        <Typography variant="h5" fontWeight="bold" color="warning.main" sx={{ wordBreak: 'break-word', fontSize: { xs: '1.1rem', sm: '1.5rem' } }}>
          {formatCurrency(account.credit)}
        </Typography>
        <Typography variant="body2" color="warning.main">إجمالي السحوبات</Typography>
      </Card>
      <Card sx={{ bgcolor: 'info.50', textAlign: 'center', p: 2, minWidth: 0 }}>
        <CalendarIcon color="info" sx={{ fontSize: { xs: 32, sm: 40 }, mb: 1 }} />
        <Typography variant="h5" fontWeight="bold" color="info.main" sx={{ wordBreak: 'break-word', fontSize: { xs: '1.1rem', sm: '1.5rem' } }}>
          {accountReport.totalJournalEntries || 0}
        </Typography>
        <Typography variant="body2" color="info.main">عدد العمليات</Typography>
      </Card>
    </Box>
  );
};
export default SavingAccountSummaryCards;