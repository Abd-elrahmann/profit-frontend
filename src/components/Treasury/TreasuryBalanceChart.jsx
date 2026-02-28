import React from 'react';
import { Box, Grid, Paper, Typography } from '@mui/material';
export default function TreasuryBalanceChart({
  availableBalance,
  totalCredit,
  totalBalance,
  balancePercentage,
  strokeDasharray,
  isSmallScreen,
  isDarkMode,
}) {
  const formatValue = (val) => {
    if (val >= 1000000) return `${(val / 1000000).toFixed(1)}م`;
    if (val >= 1000) return `${(val / 1000).toFixed(0)} ألف`;
    return val.toLocaleString('en-US');
  };
  const size = isSmallScreen ? 150 : 200;
  return (
    <Grid container spacing={3} sx={{ mb: 4 }}>
      <Grid item xs={12}>
        <Paper
          sx={{
            p: isSmallScreen ? 2 : 3,
            borderRadius: 2,
            boxShadow: '0 2px 12px rgba(0,0,0,0.1)',
            width: isSmallScreen ? '100%' : 'calc(100vw - 240px)',
            bgcolor: 'background.paper',
          }}
        >
          <Typography variant="h6" fontWeight="bold" color="text.primary" sx={{ mb: 3 }}>
            رصيد الصندوق
          </Typography>
          <Box
            sx={{
              display: 'flex',
              flexDirection: isSmallScreen ? 'column' : 'row',
              alignItems: 'center',
              justifyContent: 'center',
              gap: isSmallScreen ? 3 : 6,
              flexWrap: 'wrap',
            }}
          >
            <Box
              sx={{
                position: 'relative',
                width: size,
                height: size,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <svg
                width={size}
                height={size}
                viewBox="0 0 100 100"
                style={{ transform: 'rotate(-90deg)' }}
              >
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  fill="transparent"
                  stroke={isDarkMode ? '#424242' : '#E5E7EB'}
                  strokeWidth="10"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  fill="transparent"
                  stroke="#2e7d32"
                  strokeWidth="10"
                  strokeDasharray={strokeDasharray}
                  strokeLinecap="round"
                  style={{ transition: 'stroke-dasharray 0.5s ease' }}
                />
              </svg>
              <Box
                sx={{
                  position: 'absolute',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Typography variant={isSmallScreen ? 'h5' : 'h4'} fontWeight="bold" sx={{ mb: 0.5, color: '#2e7d32' }}>
                  {formatValue(availableBalance)}
                </Typography>
              </Box>
            </Box>
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'row',
                gap: isSmallScreen ? 3 : 6,
                flex: 1,
                justifyContent: 'center',
                flexWrap: 'wrap',
              }}
            >
              <Box sx={{ textAlign: 'center', minWidth: 150 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, justifyContent: 'center', mb: 1 }}>
                  <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: 'error.main' }} />
                  <Typography variant="body1" fontWeight="medium" color="text.primary">
                    مُقرض
                  </Typography>
                </Box>
                <Typography variant="h6" fontWeight="semibold" color="text.secondary">
                  {formatValue(totalCredit)}
                </Typography>
              </Box>
              <Box sx={{ textAlign: 'center', minWidth: 150 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, justifyContent: 'center', mb: 1 }}>
                  <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: isDarkMode ? '#616161' : 'grey.300' }} />
                  <Typography variant="body1" fontWeight="medium" color="text.primary">
                    متاح
                  </Typography>
                </Box>
                <Typography variant="h6" fontWeight="semibold" color="text.secondary">
                  {formatValue(availableBalance)}
                </Typography>
              </Box>
            </Box>
          </Box>
        </Paper>
      </Grid>
    </Grid>
  );
}