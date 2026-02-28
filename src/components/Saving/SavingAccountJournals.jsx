import React from 'react';
import { Box, Card, Typography, Stack, Table, TableBody, TableContainer } from '@mui/material';
import { StyledTableCell, StyledTableRow } from '../layouts/tableLayout';
import { formatCurrency, formatArabicDate } from './savingUtils';
const SavingAccountJournals = ({ accountReport, isMobile }) => {
  if (!accountReport?.journalsByMonth || Object.keys(accountReport.journalsByMonth).length === 0) {
    return null;
  }
  return (
    <Card sx={{ p: { xs: 2, sm: 3 }, overflow: 'hidden' }}>
      <Typography variant="h6" fontWeight="bold" color="primary" sx={{ mb: 3, textAlign: 'center', fontSize: { xs: '1rem', sm: '1.25rem' } }}>
        العمليات المالية
      </Typography>
      {Object.entries(accountReport.journalsByMonth).map(([month, data]) => (
        <Box key={month} sx={{ mb: 4 }}>
          <Typography variant="h6" color="primary" sx={{ mb: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1, fontSize: { xs: '0.95rem', sm: '1rem' } }}>
            شهر {month}
          </Typography>
          {isMobile ? (
            <Stack spacing={2}>
              {data.entries.map((entry) => (
                <Card key={entry.id} variant="outlined" sx={{ p: 2 }}>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>{formatArabicDate(entry.date)}</Typography>
                  <Typography variant="body1" fontWeight="medium" sx={{ mb: 1 }}>{entry.description}</Typography>
                  <Stack direction="row" spacing={2} flexWrap="wrap" sx={{ gap: 1 }}>
                    <Typography variant="body2">مدين: <strong>{formatCurrency(entry.debit)}</strong></Typography>
                    <Typography variant="body2">دائن: <strong>{formatCurrency(entry.credit)}</strong></Typography>
                    <Typography variant="body2">الرصيد: <strong>{formatCurrency(entry.balance)}</strong></Typography>
                  </Stack>
                </Card>
              ))}
              <Card sx={{ bgcolor: 'grey.100', p: 2 }}>
                <Typography variant="body2" fontWeight="bold">
                  الإجمالي - مدين: {formatCurrency(data.totalDebit)} | دائن: {formatCurrency(data.totalCredit)} | الرصيد: {formatCurrency(data.totalBalance)}
                </Typography>
              </Card>
            </Stack>
          ) : (
            <TableContainer sx={{ overflowX: 'auto' }}>
              <Table sx={{ minWidth: 400 }}>
                <TableHead>
                  <StyledTableRow>
                    <StyledTableCell align="center">التاريخ</StyledTableCell>
                    <StyledTableCell align="center">الوصف</StyledTableCell>
                    <StyledTableCell align="center">مدين</StyledTableCell>
                    <StyledTableCell align="center">دائن</StyledTableCell>
                    <StyledTableCell align="center">الرصيد</StyledTableCell>
                  </StyledTableRow>
                </TableHead>
                <TableBody>
                  {data.entries.map((entry) => (
                    <StyledTableRow key={entry.id}>
                      <StyledTableCell align="center">{formatArabicDate(entry.date)}</StyledTableCell>
                      <StyledTableCell align="center">{entry.description}</StyledTableCell>
                      <StyledTableCell align="center">{formatCurrency(entry.debit)}</StyledTableCell>
                      <StyledTableCell align="center">{formatCurrency(entry.credit)}</StyledTableCell>
                      <StyledTableCell align="center">{formatCurrency(entry.balance)}</StyledTableCell>
                    </StyledTableRow>
                  ))}
                  <StyledTableRow sx={{ bgcolor: 'grey.100', '& .MuiTableCell-root': { fontWeight: 'bold' } }}>
                    <StyledTableCell align="center" colSpan={2}>الإجمالي</StyledTableCell>
                    <StyledTableCell align="center">{formatCurrency(data.totalDebit)}</StyledTableCell>
                    <StyledTableCell align="center">{formatCurrency(data.totalCredit)}</StyledTableCell>
                    <StyledTableCell align="center">{formatCurrency(data.totalBalance)}</StyledTableCell>
                  </StyledTableRow>
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Box>
      ))}
    </Card>
  );
};
export default SavingAccountJournals;