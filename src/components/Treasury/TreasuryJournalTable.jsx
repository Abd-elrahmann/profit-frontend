import React, { useMemo } from 'react';
import {
  Table,
  TableContainer,
  TableHead,
  TableBody,
  TableFooter,
  Typography,
  Chip,
} from '@mui/material';
import dayjs from 'dayjs';
import { StyledTableCell, StyledTableRow } from '../layouts/tableLayout';
export default function TreasuryJournalTable({
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
    <TableContainer>
      <Table>
        <TableHead>
          <StyledTableRow>
            <StyledTableCell align="center" sx={{ fontWeight: 'bold', width: '120px' }}>
              التاريخ
            </StyledTableCell>
            <StyledTableCell align="center" sx={{ fontWeight: 'bold', width: '200px' }}>
              المرجع
            </StyledTableCell>
            <StyledTableCell align="center" sx={{ fontWeight: 'bold', minWidth: '200px' }}>
              الوصف
            </StyledTableCell>
            <StyledTableCell align="center" sx={{ fontWeight: 'bold', width: '100px' }}>
              مدين
            </StyledTableCell>
            <StyledTableCell align="center" sx={{ fontWeight: 'bold', width: '100px' }}>
              دائن
            </StyledTableCell>
            <StyledTableCell align="center" sx={{ fontWeight: 'bold', width: '120px' }}>
              الرصيد
            </StyledTableCell>
            <StyledTableCell align="center" sx={{ fontWeight: 'bold', width: '100px' }}>
              الحالة
            </StyledTableCell>
          </StyledTableRow>
        </TableHead>
        <TableBody>
          {journals.map((journal) => (
            <StyledTableRow key={journal.id} hover>
              <StyledTableCell align="center">
                <Typography variant="body2" color="text.primary">
                  {dayjs(journal.date).format('DD/MM/YYYY')}
                </Typography>
              </StyledTableCell>
              <StyledTableCell align="center" sx={{ width: '200px' }}>
                <Typography variant="body2" fontWeight="500" color="primary">
                  {journal.reference}
                </Typography>
              </StyledTableCell>
              <StyledTableCell align="center">
                <Typography variant="body2" sx={{ mb: 0.5 }} color="text.primary">
                  {journal.description}
                </Typography>
                {journal.postedBy && (
                  <Typography variant="caption" color="text.secondary">
                    بواسطة: {journal.postedBy}
                  </Typography>
                )}
              </StyledTableCell>
              <StyledTableCell align="center" sx={{ fontWeight: 'bold', width: '100px' }}>
                {journal.debit > 0 ? (
                  <Typography variant="body2" fontWeight="bold" color="success.main">
                    {journal.debit.toLocaleString('en-US')}
                  </Typography>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    0
                  </Typography>
                )}
              </StyledTableCell>
              <StyledTableCell align="center" sx={{ fontWeight: 'bold', width: '100px' }}>
                {journal.credit > 0 ? (
                  <Typography variant="body2" fontWeight="bold" color="error.main">
                    {journal.credit.toLocaleString('en-US')}
                  </Typography>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    0
                  </Typography>
                )}
              </StyledTableCell>
              <StyledTableCell align="center" sx={{ fontWeight: 'bold', width: '120px' }}>
                <Typography
                  variant="body2"
                  fontWeight="bold"
                  color={journal.balance >= 0 ? 'success.main' : 'error.main'}
                >
                  {journal.balance.toLocaleString('en-US')}
                </Typography>
              </StyledTableCell>
              <StyledTableCell align="center" sx={{ fontWeight: 'bold', width: '100px' }}>
                <Chip
                  label={journal.status === 'POSTED' ? 'مرحل' : 'مسودة'}
                  size="small"
                  color={journal.status === 'POSTED' ? 'success' : 'default'}
                  variant="outlined"
                  sx={{ fontWeight: 'bold', fontSize: '0.75rem' }}
                />
              </StyledTableCell>
            </StyledTableRow>
          ))}
        </TableBody>
        <TableFooter>
          <StyledTableRow sx={{ bgcolor: footerBg }}>
            <StyledTableCell colSpan={3} align="center" sx={{ fontWeight: 'bold' }}>
              <Typography variant="body2" fontWeight="bold">
                الإجمالي
              </Typography>
            </StyledTableCell>
            <StyledTableCell align="center" sx={{ fontWeight: 'bold' }}>
              <Typography variant="body2" fontWeight="bold" color="success.main">
                {totalDebit > 0 ? totalDebit.toLocaleString('en-US') : '0'}
              </Typography>
            </StyledTableCell>
            <StyledTableCell align="center" sx={{ fontWeight: 'bold' }}>
              <Typography variant="body2" fontWeight="bold" color="error.main">
                {totalCredit > 0 ? totalCredit.toLocaleString('en-US') : '0'}
              </Typography>
            </StyledTableCell>
            <StyledTableCell align="center" sx={{ fontWeight: 'bold' }}>
              <Typography
                variant="body2"
                fontWeight="bold"
                color={closingBalance >= 0 ? 'success.main' : 'error.main'}
              >
                {closingBalance.toLocaleString('en-US')}
              </Typography>
            </StyledTableCell>
            <StyledTableCell align="center" />
          </StyledTableRow>
        </TableFooter>
      </Table>
    </TableContainer>
  );
}
