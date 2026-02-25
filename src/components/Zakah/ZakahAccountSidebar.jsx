import React from 'react';
import { Box, Typography, Stack, Button } from '@mui/material';
import { Paid as PaidIcon } from '@mui/icons-material';

const formatCurrency = (amount) => amount?.toLocaleString() ?? '0';

const ZakahAccountSidebar = ({
  accountReport,
  onWithdrawClick,
  permissions,
}) => {
  return (
    <div className="w-80 flex-shrink-0 border-r border-primary/10 bg-white dark:bg-background-dark p-6">
      <Typography variant="h6" color="primary" fontWeight="bold" mb={3}>
        ملخص حساب الزكاة
      </Typography>
      <Stack spacing={2}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Typography>رصيد الحساب:</Typography>
          <Typography fontWeight="bold" color="primary.main">
            {formatCurrency(accountReport?.account?.balance)}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Typography>الزكاة المدفوعة:</Typography>
          <Typography fontWeight="bold" color="primary.main">
            {formatCurrency(accountReport?.account?.credit)}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Typography>الزكاة المسحوبة:</Typography>
          <Typography fontWeight="bold" color="text.primary">
            {formatCurrency(accountReport?.account?.debit)}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Typography>إجمالي العمليات:</Typography>
          <Typography fontWeight="bold" color="primary.main">
            {accountReport?.totalJournalEntries || 0}
          </Typography>
        </Box>
        {permissions.includes('zakat_Add') && (
          <Button
            variant="contained"
            onClick={onWithdrawClick}
            disabled={
              !accountReport?.account?.balance || accountReport?.account?.balance <= 0
            }
            startIcon={<PaidIcon sx={{ marginLeft: '10px' }} />}
          >
            سحب الزكاة
          </Button>
        )}
      </Stack>
    </div>
  );
};

export default ZakahAccountSidebar;
