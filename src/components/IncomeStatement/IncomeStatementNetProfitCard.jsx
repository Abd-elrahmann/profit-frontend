import React from 'react';
import { Box, Typography, Paper, Tooltip } from '@mui/material';
import { AccountBalanceWallet, Info } from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import { formatNumber } from './incomeStatementUtils';
const IncomeStatementNetProfitCard = ({ incomeData, isSmallScreen = false }) => {
  const theme = useTheme();
  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 2, sm: 3, md: 4 },
        width: '100%',
        bgcolor: 'transparent',
        color: 'text.primary',
        textAlign: 'center',
        borderRadius: 3,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <Box sx={{ position: 'relative', zIndex: 1 }}>
        <AccountBalanceWallet
          sx={{
            fontSize: { xs: 36, sm: 42, md: 48 },
            color: theme.palette.primary.main,
            mb: 2,
            opacity: 0.9,
          }}
        />
        <Box
          sx={{
            display: 'flex',
            flexDirection: isSmallScreen ? 'column' : 'row',
            alignItems: 'center',
            justifyContent: 'center',
            mb: 2,
            gap: 0.5,
          }}
        >
          <Typography sx={{ fontSize: { xs: '1rem', sm: '1.1rem', md: '1.25rem' }, fontWeight: 'bold', mr: isSmallScreen ? 0 : 1 }}>
            {incomeData.netProfit >= 0 ? 'صافي الربح القابل للتوزيع' : 'صافي الخسارة'}
          </Typography>
          <Tooltip title="صافي الربح = إجمالي الإيرادات - إجمالي المصروفات" arrow>
            <Info sx={{ fontSize: 20, opacity: 0.7, cursor: 'help' }} />
          </Tooltip>
        </Box>
        <Typography
          sx={{
            fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' },
            color: incomeData.netProfit >= 0 ? theme.palette.success.main : theme.palette.error.main,
            fontWeight: 900,
            mb: 1,
          }}
        >
          {formatNumber(Math.abs(incomeData.netProfit))}
        </Typography>
        <Typography
          sx={{
            fontSize: { xs: '0.75rem', sm: '0.8rem', md: '0.875rem' },
            color: 'text.secondary',
            px: { xs: 1, md: 0 },
          }}
        >
          المبلغ المتبقي بعد خصم جميع المصروفات - جاهز للتوزيع على المساهمين
        </Typography>
      </Box>
    </Paper>
  );
};
export default React.memo(IncomeStatementNetProfitCard);