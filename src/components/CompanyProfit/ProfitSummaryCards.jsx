import React from 'react';
import { Grid, Card, CardContent, Typography, Box, Chip } from '@mui/material';
import { TrendingUp, AccountBalance } from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';

const CARD_CONFIG = [
  {
    key: 'upcomingProfit',
    icon: TrendingUp,
    color: 'success',
    label: 'صافي الأرباح القادمة للشركة',
    chipLabel: 'أرباح قادمة',
  },
  {
    key: 'cents',
    icon: AccountBalance,
    color: 'warning',
    label: 'باقي أرباح الشركاء',
    chipLabel: 'باقي الأرباح',
  },
  {
    key: 'totalUpcoming',
    icon: TrendingUp,
    color: 'primary',
    label: 'إجمالي الأرباح',
    chipLabel: 'إجمالي',
  },
  {
    key: 'availableAmount',
    icon: AccountBalance,
    color: 'primary',
    label: 'الرصيد المتاح للسحب',
    chipLabel: 'متاح للسحب',
  },
];

const ProfitSummaryCards = ({ profitData, isSmallScreen }) => {
  const theme = useTheme();

  return (
    <Grid container spacing={3} sx={{ p: isSmallScreen ? 2 : 3, justifyContent: 'center' }}>
      {CARD_CONFIG.map(({ key, icon: Icon, color, label, chipLabel }) => (
        <Grid item xs={12} md={3} key={key}>
          <Card sx={{ borderRadius: 2, boxShadow: '0 2px 12px rgba(0,0,0,0.1)' }}>
            <CardContent sx={{ p: isSmallScreen ? 2 : 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Box sx={{ p: 1, borderRadius: 2, mr: 2 }}>
                  <Icon sx={{ color: theme.palette[color]?.main || theme.palette.primary.main, fontSize: 24 }} />
                </Box>
                <Box>
                  <Typography
                    variant={isSmallScreen ? 'h5' : 'h4'}
                    fontWeight="bold"
                    color={theme.palette[color]?.main || theme.palette.primary.main}
                  >
                    {profitData?.[key]}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {label}
                  </Typography>
                </Box>
              </Box>
              <Chip label={chipLabel} size="small" color={color} variant="outlined" />
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
};

export default React.memo(ProfitSummaryCards);
