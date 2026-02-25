import React from 'react';
import { Box, Typography, Paper, Tooltip } from '@mui/material';
import { AccountBalanceWallet, Info } from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import { formatNumber } from './incomeStatementUtils';

const IncomeStatementNetProfitCard = ({ incomeData }) => {
  const theme = useTheme();

  return (
    <Paper
      elevation={0}
      sx={{
        p: 4,
        width: '100%',
        color: 'white',
        textAlign: 'center',
        borderRadius: 3,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <Box sx={{ position: 'relative', zIndex: 1 }}>
        <AccountBalanceWallet
          sx={{
            fontSize: 48,
            color: theme.palette.primary.main,
            mb: 2,
            opacity: 0.9,
          }}
        />
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
          <Typography sx={{ fontSize: '1.25rem', fontWeight: 'bold', opacity: 0.9, mr: 1 }}>
            {incomeData.netProfit >= 0 ? 'صافي الربح القابل للتوزيع' : 'صافي الخسارة'}
          </Typography>
          <Tooltip title="صافي الربح = إجمالي الإيرادات - إجمالي المصروفات" arrow>
            <Info sx={{ fontSize: 20, opacity: 0.7, cursor: 'help' }} />
          </Tooltip>
        </Box>
        <Typography
          sx={{
            fontSize: '3rem',
            color: incomeData.netProfit >= 0 ? theme.palette.success.main : theme.palette.error.main,
            fontWeight: 900,
            mb: 1,
          }}
        >
          {formatNumber(Math.abs(incomeData.netProfit))}
        </Typography>
        <Typography sx={{ fontSize: '0.875rem', opacity: 0.8 }}>
          المبلغ المتبقي بعد خصم جميع المصروفات - جاهز للتوزيع على المساهمين
        </Typography>
      </Box>
    </Paper>
  );
};

export default React.memo(IncomeStatementNetProfitCard);
