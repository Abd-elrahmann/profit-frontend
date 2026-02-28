import React from 'react';
import { Box, Stack, Typography } from '@mui/material';
import { AccountBalance, TrendingUp, TrendingDown, CheckCircle } from '@mui/icons-material';
import TreasuryStatCard from './TreasuryStatCard';
export default function TreasuryBankSummaryCards({
  animatedAvailableBalance,
  animatedTotalDebit,
  animatedTotalCredit,
  animatedLoansInterest,
  animatedLoansBalance,
  animatedTotal,
  currentMonthTotalAmount,
  currentMonthPaidUntilNow,
  currentMonthRemainingRepayment,
  currentMonthDiscount,
  currentMonthProgress,
  totalRepaymentsAmount,
  paidRepaymentsUntilNow,
  remainingRepayments,
  totalDiscount,
  repaymentsProgress,
  isSmallScreen,
  isDarkMode = false,
}) {
  const cardBoxSx = {
    flex: isSmallScreen ? '1 1 100%' : '1 1 200px',
    minWidth: isSmallScreen ? '100%' : '350px',
    maxWidth: '100%',
  };
  const progressBar = (progress, colorKey) => (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
        <Typography variant="caption" color="text.secondary">
          نسبة التحصيل
        </Typography>
        <Typography variant="caption" fontWeight="bold" color={`${colorKey}.main`}>
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
            bgcolor: `${colorKey}.main`,
            transition: 'width 0.4s ease',
          }}
        />
      </Box>
    </Box>
  );
  const repaymentDetails = (paid, remaining, discount, progress, color) => (
    <Stack spacing={1}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <Typography variant="caption" color="text.secondary">
          واصل حتى الآن
        </Typography>
        <Typography variant="body2" fontWeight="bold" color="success.main">
          {paid.toLocaleString('en-US')}
        </Typography>
      </Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <Typography variant="caption" color="text.secondary">
          متبقي
        </Typography>
        <Typography variant="body2" fontWeight="bold" color="warning.main">
          {remaining.toLocaleString('en-US')}
        </Typography>
      </Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <Typography variant="caption" color="text.secondary">
          خصم
        </Typography>
        <Typography variant="body2" fontWeight="bold" color="error.main">
          {discount.toLocaleString('en-US')}
        </Typography>
      </Box>
      {progressBar(progress, color)}
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
          chipLabel="متاح"
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
          chipLabel="وارد"
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
          chipLabel="صادر"
          chipColor="error"
          isSmallScreen={isSmallScreen}
        />
      </Box>
      <Box sx={cardBoxSx}>
        <TreasuryStatCard
          icon={TrendingUp}
          iconColor="#ed6c02"
          value={animatedLoansInterest}
          label="الأرباح من السلف"
          chipLabel="أرباح"
          chipColor="warning"
          isSmallScreen={isSmallScreen}
        />
      </Box>
      <Box sx={cardBoxSx}>
        <TreasuryStatCard
          icon={AccountBalance}
          iconColor="#1976d2"
          value={animatedLoansBalance}
          label="الرصيد في السوق"
          chipLabel="في السوق"
          chipColor="primary"
          isSmallScreen={isSmallScreen}
        />
      </Box>
      <Box sx={cardBoxSx}>
        <TreasuryStatCard
          icon={AccountBalance}
          iconColor="#9c27b0"
          value={animatedTotal}
          label="الإجمالي (المتاح + في السوق)"
          chipLabel="إجمالي"
          chipColor="primary"
          chipVariant="filled"
          chipSx={{ bgcolor: '#9c27b0', color: 'white', '&:hover': { bgcolor: '#7b1fa2' } }}
          isSmallScreen={isSmallScreen}
        />
      </Box>
      {currentMonthTotalAmount > 0 && (
        <Box sx={cardBoxSx}>
          <TreasuryStatCard
            icon={CheckCircle}
            iconColor="#ff9800"
            value={currentMonthTotalAmount}
            label="تحصيل لهذا الشهر"
            chipLabel="تحصيل شهري"
            chipColor="warning"
            isSmallScreen={isSmallScreen}
          >
            {repaymentDetails(
              currentMonthPaidUntilNow,
              currentMonthRemainingRepayment,
              currentMonthDiscount,
              currentMonthProgress,
              'warning'
            )}
          </TreasuryStatCard>
        </Box>
      )}
      {totalRepaymentsAmount > 0 && (
        <Box sx={cardBoxSx}>
          <TreasuryStatCard
            icon={CheckCircle}
            iconColor="#2e7d32"
            value={totalRepaymentsAmount}
            label="إجمالي التحصيلات"
            chipLabel="تحصيلات"
            chipColor="success"
            isSmallScreen={isSmallScreen}
          >
            {repaymentDetails(
              paidRepaymentsUntilNow,
              remainingRepayments,
              totalDiscount,
              repaymentsProgress,
              'success'
            )}
          </TreasuryStatCard>
        </Box>
      )}
    </Box>
  );
}