import React from 'react';
import { Box, Grid, Paper, Typography } from '@mui/material';
import { MonetizationOn, TrendingUp as TrendingUpIcon, MoneyOff } from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import { formatNumber } from './incomeStatementUtils';
const cardSx = (theme, isSmallScreen) => ({
  p: isSmallScreen ? 2 : 3,
  bgcolor: theme.palette.background.paper,
  borderRadius: 2,
  border: `1px solid ${theme.palette.divider}`,
  height: '100%',
  transition: 'transform 0.2s',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: theme.palette.mode === 'dark' ? '0 4px 8px rgba(255,255,255,0.1)' : '0 4px 8px rgba(0,0,0,0.1)',
  },
});
const IncomeStatementSummaryCards = ({ incomeData, isSmallScreen = false }) => {
  const theme = useTheme();
  const cardWidth = isSmallScreen ? '100%' : '280px';
  const totalCompanyRevenue = incomeData.revenueByClient?.reduce((sum, c) => sum + (c.companyRevenue || 0), 0) || 0;
  const totalPartnersRevenue = incomeData.revenueByClient?.reduce((sum, c) => sum + (c.partnersRevenue || 0), 0) || 0;
  return (
    <Grid container spacing={2} sx={{ mb: 4, textAlign: 'center' }} justifyContent="center">
      <Grid item xs={12} sm={6} md={4} sx={{ width: cardWidth, maxWidth: '100%', minWidth: 0 }}>
        <Paper elevation={1} sx={cardSx(theme, isSmallScreen)}>
          <MonetizationOn sx={{ color: theme.palette.primary.main, fontSize: 32, mb: 1 }} />
          <Typography sx={{ color: theme.palette.primary.main, fontSize: '0.9rem', mb: 1, fontWeight: 600 }}>
            رأس المال المدفوع الفعلي
          </Typography>
          <Typography sx={{ color: theme.palette.text.primary, fontSize: '1.5rem', fontWeight: 700 }}>
            {formatNumber(incomeData.totalCapital)}
          </Typography>
        </Paper>
      </Grid>
      <Grid item xs={12} sm={6} md={4} sx={{ width: cardWidth, maxWidth: '100%', minWidth: 0 }}>
        <Paper elevation={1} sx={cardSx(theme, isSmallScreen)}>
          <TrendingUpIcon sx={{ color: theme.palette.success.main, fontSize: 32, mb: 1 }} />
          <Typography sx={{ color: theme.palette.primary.main, fontSize: '0.9rem', mb: 1, fontWeight: 600 }}>
            إجمالي الدخل المحقق خلال الفترة
          </Typography>
          <Typography sx={{ color: theme.palette.text.primary, fontSize: '1.5rem', fontWeight: 700 }}>
            {formatNumber(incomeData.revenues?.total || 0)}
          </Typography>
          {incomeData.revenueByClient?.length > 0 && (
            <Box sx={{ mt: 2, fontSize: '0.75rem', pt: 2, borderTop: `1px solid ${theme.palette.divider}` }}>
              {totalPartnersRevenue > 0 && (
                <Typography variant="caption" display="block" sx={{ color: theme.palette.primary.main, fontWeight: 'bold', mb: 0.5 }}>
                  حصة الشركاء: {formatNumber(totalPartnersRevenue)}
                </Typography>
              )}
              {totalCompanyRevenue > 0 && (
                <Typography variant="caption" display="block" sx={{ color: theme.palette.primary.main, fontWeight: 'bold' }}>
                  حصة الشركة: {formatNumber(totalCompanyRevenue)}
                </Typography>
              )}
            </Box>
          )}
        </Paper>
      </Grid>
      <Grid item xs={12} sm={6} md={4} sx={{ width: cardWidth, maxWidth: '100%', minWidth: 0 }}>
        <Paper elevation={1} sx={cardSx(theme, isSmallScreen)}>
          <MoneyOff sx={{ color: theme.palette.error.main, fontSize: 32, mb: 1 }} />
          <Typography sx={{ color: theme.palette.primary.main, fontSize: '0.9rem', mb: 1, fontWeight: 600 }}>
            إجمالي المصروفات التشغيلية
          </Typography>
          <Typography sx={{ color: theme.palette.error.main, fontSize: '1.5rem', fontWeight: 700 }}>
            {formatNumber(incomeData.totalExpenses)}
          </Typography>
        </Paper>
      </Grid>
    </Grid>
  );
};
export default React.memo(IncomeStatementSummaryCards);