import React from 'react';
import { Box, Stack, Typography } from '@mui/material';
import { AccountBalance, TrendingUp, TrendingDown, CheckCircle } from '@mui/icons-material';
import TreasuryStatCard from './TreasuryStatCard';

export default function TreasuryCapitalSummaryCards({
  animatedAvailableBalance,
  animatedTotalDebit,
  animatedTotalCredit,
  totalRepaymentsAmount,
  paidRepaymentsUntilNow,
  repaymentsProgress,
  isSmallScreen,
  isDarkMode = false,
}) {
  const cardBoxSx = {
    flex: isSmallScreen ? '1 1 100%' : '1 1 200px',
    minWidth: isSmallScreen ? '100%' : '350px',
    maxWidth: '100%',
  };

  const progressBar = (progress) => (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
        <Typography variant="caption" color="text.secondary">
          النسبة
        </Typography>
        <Typography variant="caption" fontWeight="bold" color="success.main">
          {progress.toFixed(1)}%
        </Typography>
      </Box>
      <Box sx={{ position: 'relative', height: 10, borderRadius: 999, bgcolor: isDarkMode ? '#424242' : '#e0e0e0' }}>
        <Box
          sx={{
            position: 'absolute',
            left: 0,
            top: 0,
            height: '100%',
            width: `${progress}%`,
            borderRadius: 999,
            bgcolor: 'success.main',
            transition: 'width 0.4s ease',
          }}
        />
      </Box>
    </Box>
  );

  const repaymentDetails = (
    <Stack spacing={1}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <Typography variant="caption" color="text.secondary">
          تم التحصيل
        </Typography>
        <Typography variant="body2" fontWeight="bold" color="success.main">
          {paidRepaymentsUntilNow.toLocaleString('en-US')}
        </Typography>
      </Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <Typography variant="caption" color="text.secondary">
          النسبة
        </Typography>
        <Typography variant="body2" fontWeight="bold" color="success.main">
          {repaymentsProgress.toFixed(1)}%
        </Typography>
      </Box>
      {progressBar(repaymentsProgress)}
    </Stack>
  );

  return (
    <Box
      sx={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: isSmallScreen ? 2 : 3,
        mb: isSmallScreen ? 2 : 4,
        justifyContent: 'center',
        alignItems: 'stretch',
      }}
    >
      <Box sx={cardBoxSx}>
        <TreasuryStatCard
          icon={AccountBalance}
          iconColor="#1976d2"
          value={animatedAvailableBalance}
          label="الرصيد المتاح"
          chipLabel="رؤوس أموال"
          chipColor="primary"
          isSmallScreen={isSmallScreen}
        />
      </Box>

      <Box sx={cardBoxSx}>
        <TreasuryStatCard
          icon={TrendingUp}
          iconColor="#2e7d32"
          value={animatedTotalDebit}
          label="إجمالي الوارد"
          chipLabel="إيداعات"
          chipColor="success"
          isSmallScreen={isSmallScreen}
        />
      </Box>

      <Box sx={cardBoxSx}>
        <TreasuryStatCard
          icon={TrendingDown}
          iconColor="#d32f2f"
          value={animatedTotalCredit}
          label="إجمالي الصادر"
          chipLabel="سحوبات"
          chipColor="error"
          isSmallScreen={isSmallScreen}
        />
      </Box>

      {totalRepaymentsAmount > 0 && (
        <Box sx={cardBoxSx}>
          <TreasuryStatCard
            icon={CheckCircle}
            iconColor="#2e7d32"
            value={totalRepaymentsAmount}
            label="تحصيلات رؤوس الأموال"
            chipLabel="تحصيلات"
            chipColor="success"
            isSmallScreen={isSmallScreen}
          >
            {repaymentDetails}
          </TreasuryStatCard>
        </Box>
      )}
    </Box>
  );
}
