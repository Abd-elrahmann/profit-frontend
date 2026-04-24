import React, { useMemo } from 'react';
import { Box, Card, CardContent, Typography, Chip, Stack } from '@mui/material';
import dayjs from 'dayjs';
const getJournalTypeArabic = (type) => {
  const typeMap = {
    GENERAL: 'عام',
    OPENING: 'افتتاحي',
    LOAN_DISBURSEMENT: 'صرف سلفة',
    REPAYMENT: 'سداد',
    CAPITAL: 'رأس المال',
    WITHDRAWAL: 'سحب',
    DEPOSIT: 'إيداع',
  };
  return typeMap[type] || type || '-';
};
export default function TreasuryJournalCards({
  journals,
  isDarkMode,
  monthFooterTotals = null,
}) {
  const { totalDebit, totalCredit, closingBalance } = useMemo(() => {
    if (
      monthFooterTotals &&
      monthFooterTotals.totalDebit != null &&
      monthFooterTotals.totalCredit != null &&
      monthFooterTotals.totalBalance != null
    ) {
      return {
        totalDebit: Number(monthFooterTotals.totalDebit),
        totalCredit: Number(monthFooterTotals.totalCredit),
        closingBalance: Number(monthFooterTotals.totalBalance),
      };
    }
    const td = journals.reduce((s, j) => s + (Number(j.debit) || 0), 0);
    const tc = journals.reduce((s, j) => s + (Number(j.credit) || 0), 0);
    const chrono = [...journals].sort(
      (a, b) => new Date(a.date) - new Date(b.date)
    );
    const lastBal =
      chrono.length > 0 ? Number(chrono[chrono.length - 1].balance) || 0 : 0;
    return { totalDebit: td, totalCredit: tc, closingBalance: lastBal };
  }, [journals, monthFooterTotals]);
  const footerBg = isDarkMode ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)';
  return (
    <Stack spacing={1.5} sx={{ p: 1, width: '100%' }}>
      {journals.map((journal) => (
        <Card
          key={journal.id}
          variant="outlined"
          sx={{
            width: '100%',
            borderRadius: 2,
            bgcolor: isDarkMode ? '#2a2a2a' : 'background.paper',
            border: '1px solid',
            borderColor: isDarkMode ? '#424242' : 'divider',
            boxShadow: '0 2px 4px rgba(0,0,0,0.08)',
          }}
        >
          <CardContent sx={{ p: 2 }}>
            <Stack spacing={1.5}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box>
                  <Typography variant="subtitle2" fontWeight="bold" color="primary">
                    {getJournalTypeArabic(journal.type)}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
                    {dayjs(journal.date).format('DD/MM/YYYY')}
                  </Typography>
                </Box>
                <Chip
                  label={journal.status === 'POSTED' ? 'مرحل' : 'مسودة'}
                  size="small"
                  color={journal.status === 'POSTED' ? 'success' : 'default'}
                  variant="outlined"
                  sx={{ fontWeight: 'bold', fontSize: '0.7rem' }}
                />
              </Box>
              <Box>
                <Typography variant="body2" fontWeight="medium" sx={{ mb: 0.5 }}>
                  {journal.description}
                </Typography>
                {journal.postedBy && (
                  <Typography variant="caption" color="text.secondary">
                    بواسطة: {journal.postedBy}
                  </Typography>
                )}
              </Box>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="caption" color="text.secondary">
                    مدين
                  </Typography>
                  <Typography
                    variant="body2"
                    fontWeight="bold"
                    color={journal.debit > 0 ? 'success.main' : 'text.secondary'}
                  >
                    {journal.debit > 0 ? journal.debit.toLocaleString('en-US') : '0'}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="caption" color="text.secondary">
                    دائن
                  </Typography>
                  <Typography
                    variant="body2"
                    fontWeight="bold"
                    color={journal.credit > 0 ? 'error.main' : 'text.secondary'}
                  >
                    {journal.credit > 0 ? journal.credit.toLocaleString('en-US') : '0'}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="caption" color="text.secondary">
                    الرصيد
                  </Typography>
                  <Typography
                    variant="body2"
                    fontWeight="bold"
                    color={journal.balance >= 0 ? 'success.main' : 'error.main'}
                  >
                    {journal.balance.toLocaleString('en-US')}
                  </Typography>
                </Box>
              </Box>
            </Stack>
          </CardContent>
        </Card>
      ))}
      <Card
        variant="outlined"
        sx={{
          borderRadius: 2,
          bgcolor: footerBg,
          border: '1px solid',
          borderColor: isDarkMode ? '#424242' : 'divider',
        }}
      >
        <CardContent sx={{ p: 2 }}>
          <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1.5 }}>
            الإجمالي
          </Typography>
          <Stack spacing={1}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="caption" color="text.secondary">
                مدين
              </Typography>
              <Typography variant="body2" fontWeight="bold" color="success.main">
                {totalDebit.toLocaleString('en-US')} ر.س
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="caption" color="text.secondary">
                دائن
              </Typography>
              <Typography variant="body2" fontWeight="bold" color="error.main">
                {totalCredit.toLocaleString('en-US')} ر.س
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="caption" color="text.secondary">
                الرصيد
              </Typography>
              <Typography
                variant="body2"
                fontWeight="bold"
                color={closingBalance >= 0 ? 'success.main' : 'error.main'}
              >
                {closingBalance.toLocaleString('en-US')} ر.س
              </Typography>
            </Box>
          </Stack>
        </CardContent>
      </Card>
    </Stack>
  );
}
