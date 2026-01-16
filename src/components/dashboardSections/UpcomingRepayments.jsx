import React, { useState, useMemo } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  TableBody,
  TableHead,
  TablePagination,
  CircularProgress,
  Table,
} from '@mui/material';
import { Schedule } from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';
import { getUpcomingRepayments } from '../../pages/dashboard/dashboardApi';
import { useTheme } from '@mui/material';
import { format } from 'date-fns';
import {StyledTableCell, StyledTableRow, ScrollableTableContainer} from '../layouts/tableLayout';
const UpcomingRepayments = React.memo(() => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const theme = useTheme();

  const { data: repayments, isLoading } = useQuery({
    queryKey: ['upcoming-repayments'],
    queryFn: getUpcomingRepayments,
  });

  const formatCurrency = (amount) => {
    return Math.round(amount || 0).toLocaleString();
  };

  const formatDate = (date) => {
    return format(new Date(date), 'dd/MM/yyyy');
  };

  const getDueDate = (repayment) => {
    return repayment.newDueDate || repayment.dueDate;
  };

  // Memoized pagination data
  const paginatedRepayments = useMemo(() => {
    if (!repayments) return [];
    const startIndex = page * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    return repayments.slice(startIndex, endIndex);
  }, [repayments, page, rowsPerPage]);

  // Handle pagination changes
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Card sx={{ maxWidth: { xs: '100%', sm: '100%', md: '100%', lg: '100%' }, width: '100%', mx: 'auto', boxShadow: 3 }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <Schedule sx={{ mr: 2, color: theme.palette.primary.main }} />
          <Typography variant="h5" component="h2" fontWeight="bold">
            الدفعات القادمة
          </Typography>
        </Box>

        {repayments && repayments.length > 0 ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
            <ScrollableTableContainer
              maxHeight={650}
            >
              <Table stickyHeader sx={{ minWidth: 1000 }}>
                <TableHead sx={{ bgcolor: theme.palette.grey[50] }}>
                  <StyledTableRow>
                    <StyledTableCell align="center">
                      اسم العميل
                    </StyledTableCell>
                    <StyledTableCell align="center">
                      تاريخ الاستحقاق
                    </StyledTableCell>
                    <StyledTableCell align="center">
                      إجمالي المبلغ
                    </StyledTableCell>
                 
                  </StyledTableRow>
                </TableHead>
                <TableBody>
                  {paginatedRepayments.map((repayment) => (
                    <StyledTableRow
                      key={repayment.id}
                      sx={{ '&:hover': { bgcolor: theme.palette.action.hover } }}
                    >
                      <StyledTableCell align="center">
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            {repayment.loan?.client?.name || 'غير محدد'}
                        </Box>
                      </StyledTableCell>
                      <StyledTableCell align="center">
                        <Typography variant="body2">
                          {formatDate(getDueDate(repayment))}
                        </Typography>
                      </StyledTableCell>
                      <StyledTableCell align="center">
                        <Typography variant="body2" fontWeight="bold">
                          {formatCurrency((repayment.principalAmount || 0) + (repayment.interestAmount || 0))}
                        </Typography>
                      </StyledTableCell>
                    </StyledTableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollableTableContainer>
          </Box>
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

        {/* Pagination */}
        {repayments && repayments.length > rowsPerPage && (
          <TablePagination
            component="div"
            count={repayments.length}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            rowsPerPageOptions={[5, 10, 25]}
            labelRowsPerPage="عدد الصفوف:"
            labelDisplayedRows={({ from, to, count }) =>
              `${from}-${to} من ${count}`
            }
          />
        )}
      </CardContent>
    </Card>
  );
});

export default UpcomingRepayments;
