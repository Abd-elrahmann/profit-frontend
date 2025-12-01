import React from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  CircularProgress,
  useMediaQuery,
} from '@mui/material';
import { Schedule, Person } from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';
import { getUpcomingRepayments } from '../../pages/dashboard/dashboardApi';
import { useTheme } from '@mui/material';
import moment from 'moment';
import {StyledTableCell, StyledTableRow} from '../layouts/tableLayout';
const UpcomingRepayments = () => {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));

  const { data: repayments, isLoading } = useQuery({
    queryKey: ['upcoming-repayments'],
    queryFn: getUpcomingRepayments,
  });

  // Format currency
  const formatCurrency = (amount) => {
    return amount?.toLocaleString() || '0';
  };

  // Format date
  const formatDate = (date) => {
    return moment(date).format('DD/MM/YYYY');
  };

  // Get due date (prefer newDueDate if exists)
  const getDueDate = (repayment) => {
    return repayment.newDueDate || repayment.dueDate;
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Card sx={{ maxWidth: 1200, mx: 'auto', boxShadow: 3 }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <Schedule sx={{ mr: 2, color: theme.palette.primary.main }} />
          <Typography variant="h5" component="h2" fontWeight="bold">
            الدفعات القادمة
          </Typography>
        </Box>

        {repayments && repayments.length > 0 ? (
          <TableContainer component={Paper} sx={{ boxShadow: 2 }}>
            <Table sx={{ minWidth: 650 }}>
              <TableHead sx={{ bgcolor: theme.palette.grey[50] }}>
                <StyledTableRow>
                  <StyledTableCell>
                    اسم العميل
                  </StyledTableCell>
                  <StyledTableCell>
                    تاريخ الاستحقاق
                  </StyledTableCell>
                  <StyledTableCell>
                    المبلغ الأصلي
                  </StyledTableCell>
                  {!isSmallScreen && (
                    <StyledTableCell>
                      الفوائد
                    </StyledTableCell>
                  )}
                  <StyledTableCell>
                    إجمالي المبلغ
                  </StyledTableCell>
                  <StyledTableCell>
                    الحالة
                  </StyledTableCell>
                </StyledTableRow>
              </TableHead>
              <TableBody>
                {repayments.map((repayment) => (
                  <StyledTableRow
                    key={repayment.id}
                    sx={{ '&:hover': { bgcolor: theme.palette.action.hover } }}
                  >
                    <StyledTableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Person sx={{ mr: 1, color: theme.palette.text.secondary, fontSize: '1rem' }} />
                        <Typography variant="body2">
                          {repayment.loan?.client?.name || 'غير محدد'}
                        </Typography>
                      </Box>
                    </StyledTableCell>
                    <StyledTableCell>
                      <Typography variant="body2">
                        {formatDate(getDueDate(repayment))}
                      </Typography>
                    </StyledTableCell>
                    <StyledTableCell>
                      <Typography variant="body2">
                        {formatCurrency(repayment.principalAmount)}
                      </Typography>
                    </StyledTableCell>
                    {!isSmallScreen && (
                      <StyledTableCell>
                        <Typography variant="body2">
                          {formatCurrency(repayment.interestAmount)}
                        </Typography>
                      </StyledTableCell>
                    )}
                    <StyledTableCell>
                      <Typography variant="body2" fontWeight="bold">
                        {formatCurrency((repayment.principalAmount || 0) + (repayment.interestAmount || 0))}
                      </Typography>
                    </StyledTableCell>
                    <StyledTableCell>
                      <Chip
                        label="معلق"
                        size="small"
                        sx={{
                          bgcolor: theme.palette.warning.light,
                          color: theme.palette.warning.contrastText,
                          fontSize: '0.75rem'
                        }}
                      />
                    </StyledTableCell>
                  </StyledTableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        ) : (
          <Box sx={{ textAlign: 'center', py: 6 }}>
            <Schedule sx={{ fontSize: 64, color: theme.palette.grey[300], mb: 2 }} />
            <Typography variant="h6" color="text.secondary">
              لا توجد دفعات قادمة
            </Typography>
            <Typography variant="body2" color="text.secondary">
              جميع الدفعات تم تحصيلها أو لا توجد دفعات معلقة
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default UpcomingRepayments;
