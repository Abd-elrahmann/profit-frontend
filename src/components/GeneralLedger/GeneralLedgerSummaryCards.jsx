import { Grid, Card, CardContent, Typography } from '@mui/material';
import React from 'react';

// Card configuration
const CARD_CONFIG = [
  { key: 'debit', valueKey: 'totalDebit', label: 'إجمالي مدين', color: 'primary', bgColor: 'white' },
  { key: 'credit', valueKey: 'totalCredit', label: 'إجمالي دائن', color: 'error', bgColor: 'white' },
  { key: 'journals', valueKey: 'totalJournals', label: 'عدد القيود', color: 'info', bgColor: 'white' },
  { key: 'balance', valueKey: 'closingBalance', label: 'الرصيد الحالي', color: 'primary', bgColor: 'transparent' },
];

const GeneralLedgerSummaryCards = ({ 
  totalDebit = 0, 
  totalCredit = 0, 
  totalJournals = 0, 
  closingBalance = 0, 
  isSmallScreen = false 
}) => {
  const values = {
    totalDebit,
    totalCredit,
    totalJournals,
    closingBalance,
  };

  return (
    <Grid container spacing={2} justifyContent="center" alignItems="center" sx={{ mb: 3 }}>
      {CARD_CONFIG.map(({ key, valueKey, label, color, bgColor }) => {
        const value = values[valueKey];
        const isBalance = key === 'balance';
        const balanceColor = closingBalance >= 0 ? 'primary.main' : 'error.main';

        return (
          <Grid item xs={6} md={3} key={key} sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <Card
              sx={{
                width: '100%',
                borderRadius: 2,
                boxShadow: '0 2px 12px rgba(0,0,0,0.1)',
                textAlign: 'center',
                bgcolor: bgColor,
              }}
            >
              <CardContent sx={{ p: isSmallScreen ? 1 : 2 }}>
                <Typography
                  variant={isSmallScreen ? 'h6' : 'h5'}
                  fontWeight="bold"
                  color={isBalance ? balanceColor : `${color}.main`}
                >
                  {(typeof value === 'number' ? value : 0).toLocaleString('en-US', { 
                    minimumFractionDigits: 2, 
                    maximumFractionDigits: 2 
                  })}
                </Typography>
                <Typography variant={isSmallScreen ? 'caption' : 'body2'} color="text.secondary">
                  {label}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        );
      })}
    </Grid>
  );
};

export default React.memo(GeneralLedgerSummaryCards);