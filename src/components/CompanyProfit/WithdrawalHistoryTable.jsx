import React from 'react';
import {
  Box,
  Typography,
  Table,
  TableContainer,
  TableHead,
  TableBody,
  Pagination,
} from '@mui/material';
import { AccountBalance } from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import { StyledTableCell, StyledTableRow } from '../layouts/tableLayout';
import dayjs from 'dayjs';
import 'dayjs/locale/ar';

const formatArabicDate = (date) => {
  return (
    dayjs(date).locale('ar').format('D [من] MMMM [الساعة] h:mm') +
    ' ' +
    (dayjs(date).hour() < 12 ? 'صباحًا' : 'مساءً')
  );
};

const WithdrawalHistoryTable = ({
  withdrawals,
  totalPages,
  currentPage,
  onPageChange,
  isSmallScreen,
}) => {
  const theme = useTheme();

  if (!withdrawals?.length) {
    return (
      <Box sx={{ p: isSmallScreen ? 2 : 3 }}>
        <Typography variant="h6" fontWeight="bold" mb={3}>
          سجل السحوبات
        </Typography>
        <Box sx={{ textAlign: 'center', py: 6 }}>
          <AccountBalance sx={{ fontSize: 48, color: theme.palette.text.secondary, mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            لا توجد عمليات سحب حتى الآن
          </Typography>
          <Typography variant="body2" color="text.secondary">
            لم يتم إجراء أي عمليات سحب من أرباح الشركة
          </Typography>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ p: isSmallScreen ? 2 : 3 }}>
      <Typography variant="h6" fontWeight="bold" mb={3}>
        سجل السحوبات
      </Typography>

      <TableContainer>
        <Table>
          <TableHead>
            <StyledTableRow>
              <StyledTableCell align="center" sx={{ fontWeight: 'bold' }}>
                التاريخ
              </StyledTableCell>
              <StyledTableCell align="center" sx={{ fontWeight: 'bold' }}>
                الوصف
              </StyledTableCell>
              <StyledTableCell align="center" sx={{ fontWeight: 'bold' }}>
                المبلغ
              </StyledTableCell>
            </StyledTableRow>
          </TableHead>
          <TableBody>
            {withdrawals.map((withdrawal) => (
              <StyledTableRow key={withdrawal.id} hover>
                <StyledTableCell align="center">
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 'medium', mb: 0.5 }}>
                      {formatArabicDate(withdrawal.date)}
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{ color: 'primary.main', fontWeight: 'bold', fontSize: '0.75rem' }}
                    >
                      {withdrawal.hijriDate}
                    </Typography>
                  </Box>
                </StyledTableCell>
                <StyledTableCell align="center">
                  <Typography variant="body2">{withdrawal.description}</Typography>
                </StyledTableCell>
                <StyledTableCell align="center" sx={{ fontWeight: 'bold' }}>
                  <Typography variant="body2" fontWeight="bold" color="error.main">
                    {(withdrawal.amount || 0).toLocaleString('en-US')}
                  </Typography>
                </StyledTableCell>
              </StyledTableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {totalPages > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
          <Pagination count={totalPages} page={currentPage} onChange={onPageChange} color="primary" />
        </Box>
      )}
    </Box>
  );
};

export default React.memo(WithdrawalHistoryTable);
