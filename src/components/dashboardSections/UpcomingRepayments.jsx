import React from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Table,
  TableBody,
  TableContainer,
  TableHead,
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
import {StyledTableCell, StyledTableRow, ScrollableTableContainer} from '../layouts/tableLayout';
const UpcomingRepayments = () => {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));

  const { data: repayments, isLoading } = useQuery({
    queryKey: ['upcoming-repayments'],
    queryFn: getUpcomingRepayments,
  });

  const formatCurrency = (amount) => {
    return amount?.toLocaleString() || '0';
  };

  const formatDate = (date) => {
    return moment(date).format('DD/MM/YYYY');
  };

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
              minWidth={1200}
            >
                <TableHead sx={{ bgcolor: theme.palette.grey[50] }}>
                  <StyledTableRow>
                    <StyledTableCell align="center" sx={{ minWidth: { md: 250, lg: 300 }, width: { md: '25%', lg: '30%' } }}>
                      اسم العميل
                    </StyledTableCell>
                    <StyledTableCell align="center" sx={{ minWidth: { md: 180, lg: 200 }, width: { md: '15%', lg: '15%' } }}>
                      تاريخ الاستحقاق
                    </StyledTableCell>
                    <StyledTableCell align="center" sx={{ minWidth: { md: 180, lg: 200 }, width: { md: '15%', lg: '15%' } }}>
                      المبلغ الأصلي
                    </StyledTableCell>
                    {!isSmallScreen && (
                      <StyledTableCell align="center" sx={{ minWidth: { md: 180, lg: 200 }, width: { md: '15%', lg: '15%' } }}>
                        الفوائد
                      </StyledTableCell>
                    )}
                    <StyledTableCell align="center" sx={{ minWidth: { md: 180, lg: 200 }, width: { md: '15%', lg: '15%' } }}>
                      إجمالي المبلغ
                    </StyledTableCell>
                    <StyledTableCell align="center" sx={{ minWidth: { md: 150, lg: 180 }, width: { md: '10%', lg: '10%' } }}>
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
                      <StyledTableCell align="center" sx={{ minWidth: { md: 250, lg: 300 }, width: { md: '25%', lg: '30%' } }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Person sx={{ mr: 1, color: theme.palette.text.secondary, fontSize: '1rem' }} />
                          <Typography variant="body2">
                            {repayment.loan?.client?.name || 'غير محدد'}
                          </Typography>
                        </Box>
                      </StyledTableCell>
                      <StyledTableCell align="center" sx={{ minWidth: { md: 180, lg: 200 }, width: { md: '15%', lg: '15%' } }}>
                        <Typography variant="body2">
                          {formatDate(getDueDate(repayment))}
                        </Typography>
                      </StyledTableCell>
                      <StyledTableCell align="center" sx={{ minWidth: { md: 180, lg: 200 }, width: { md: '15%', lg: '15%' } }}>
                        <Typography variant="body2">
                          {formatCurrency(repayment.principalAmount)}
                        </Typography>
                      </StyledTableCell>
                      {!isSmallScreen && (
                        <StyledTableCell align="center" sx={{ minWidth: { md: 180, lg: 200 }, width: { md: '15%', lg: '15%' } }}>
                          <Typography variant="body2">
                            {formatCurrency(repayment.interestAmount)}
                          </Typography>
                        </StyledTableCell>
                      )}
                      <StyledTableCell align="center" sx={{ minWidth: { md: 180, lg: 200 }, width: { md: '15%', lg: '15%' } }}>
                        <Typography variant="body2" fontWeight="bold">
                          {formatCurrency((repayment.principalAmount || 0) + (repayment.interestAmount || 0))}
                        </Typography>
                      </StyledTableCell>
                      <StyledTableCell align="center" sx={{ minWidth: { md: 150, lg: 180 }, width: { md: '10%', lg: '10%' } }}>
                        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                          <Chip
                            label="معلق"
                            size="small"
                            sx={{
                              bgcolor: theme.palette.warning.light,
                              color: theme.palette.warning.contrastText,
                              fontSize: '0.75rem'
                            }}
                          />
                        </Box>
                      </StyledTableCell>
                    </StyledTableRow>
                  ))}
                </TableBody>
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
      </CardContent>
    </Card>
  );
};

export default UpcomingRepayments;
