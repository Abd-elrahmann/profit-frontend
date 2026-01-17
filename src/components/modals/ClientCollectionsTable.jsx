import React, { useState, useMemo } from 'react';
import {
  Table,
  TableBody,
  TableContainer,
  TableHead,
  TableFooter,
  Paper,
  Typography,
  Box,
  Chip,
  CircularProgress,
  TablePagination,
  useMediaQuery,
  Card,
  CardContent,
  Stack,
} from '@mui/material';
import {
  StyledTableCell,
  StyledTableRow,
  ScrollableTableContainer
} from '../../components/layouts/tableLayout';

const ClientCollectionsTable = ({ isLoading, clientsData, visibleColumns }) => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const isMobile = useMediaQuery('(max-width: 768px)');

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const formatCurrency = (amount) => {
    return amount?.toLocaleString() || '0';
  };

  const totals = useMemo(() => {
    if (!clientsData?.data || clientsData.data.length === 0) {
      return { totalDebit: 0, totalPaid: 0, remaining: 0, totalInterest: 0, averageMonthlyInstallment: 0 };
    }
    return {
      totalDebit: clientsData.data.reduce((sum, c) => sum + (c.financials?.totalDebit || 0), 0),
      totalPaid: clientsData.data.reduce((sum, c) => sum + (c.financials?.totalPaid || 0), 0),
      remaining: clientsData.data.reduce((sum, c) => sum + (Math.abs(c.financials?.remaining) || 0), 0),
      totalInterest: clientsData.data.reduce((sum, c) => sum + (c.financials?.totalInterestPaid || 0), 0),
      averageMonthlyInstallment: clientsData.data.reduce((sum, c) => sum + (c.financials?.averageMonthlyInstallment || 0), 0),
    };
  }, [clientsData]);

  const getColumnValue = (client, columnId, index) => {
    switch(columnId) {
      case 'id':
        return index + 1 + (page * rowsPerPage);
      case 'client':
        return `${client.name}\n${client.phone}`;
      case 'address':
        return client.address || '-';
      case 'loansCount':
        return client.loansSummary.loansCount;
      case 'paidRepayments':
        return client.repaymentSummary.paidRepayments;
      case 'remainingRepayments':
        return client.repaymentSummary.remainingRepayments;
      case 'monthlyInstallment':
        return formatCurrency(client.financials.averageMonthlyInstallment || 0);
      case 'totalDebit':
        return formatCurrency(client.financials.totalDebit);
      case 'totalPaid':
        return formatCurrency(client.financials.totalPaid);
      case 'totalInterest':
        return formatCurrency(client.financials.totalInterestPaid || 0);
      case 'totalDiscounts':
        return formatCurrency(client.financials.totalDiscounts || 0);
      case 'remaining':
        return formatCurrency(Math.abs(client.financials.remaining));
      case 'note':
        return '-';
      default:
        return '';
    }
  };

  const renderLoansCountWithChips = (client) => {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5 }}>
        <Chip 
          label={`${client.loansSummary.loansCount} سلفة`} 
          size="small" 
          color="primary" 
          variant="outlined" 
        />
        <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', justifyContent: 'center' }}>
          <Chip 
            label={`${client.loansSummary.activeLoans} نشط`} 
            size="small" 
            color="success" 
            sx={{ fontSize: '0.7rem' }} 
          />
          <Chip 
            label={`${client.loansSummary.completedLoans} مكتمل`} 
            size="small" 
            color="info" 
            sx={{ fontSize: '0.7rem' }} 
          />
          {client.loansSummary.overdueLoans > 0 && (
            <Chip 
              label={`${client.loansSummary.overdueLoans} متأخر`} 
              size="small" 
              color="error" 
              sx={{ fontSize: '0.7rem' }} 
            />
          )}
        </Box>
      </Box>
    );
  };

  const renderDesktopTable = () => (
    <>
      <ScrollableTableContainer maxHeight={650}>
        <Table stickyHeader sx={{ minWidth: 2000 }}>
          <TableHead>
            <StyledTableRow>
              {visibleColumns.map((column) => (
                <StyledTableCell
                  key={column.id}
                  align="center"
                  sx={{ fontWeight: 'bold', minWidth: 100 }}
                >
                  {column.label}
                </StyledTableCell>
              ))}
            </StyledTableRow>
          </TableHead>
          <TableBody>
            {isLoading ? (
              <StyledTableRow>
                <StyledTableCell colSpan={visibleColumns.length} align="center">
                  <CircularProgress size={30} />
                  جاري تحميل البيانات...
                </StyledTableCell>
              </StyledTableRow>
            ) : clientsData?.data?.length === 0 ? (
              <StyledTableRow>
                <StyledTableCell colSpan={visibleColumns.length} align="center">
                  لا توجد عملاء
                </StyledTableCell>
              </StyledTableRow>
            ) : (
              clientsData?.data
                ?.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((client, index) => (
                  <StyledTableRow key={client.id}>
                    {visibleColumns.map((column) => (
                      <StyledTableCell key={column.id} align="center">
                        {column.id === 'loansCount' ? (
                          renderLoansCountWithChips(client)
                        ) : column.id === 'client' ? (
                          <Box sx={{ textAlign: 'center' }}>
                            <Typography variant="body2" sx={{ whiteSpace: 'pre-line' }}>
                              {getColumnValue(client, column.id, index)}
                            </Typography>
                          </Box>
                        ) : (
                          <Typography variant="body2">
                            {getColumnValue(client, column.id, index)}
                          </Typography>
                        )}
                      </StyledTableCell>
                    ))}
                  </StyledTableRow>
                ))
            )}
            {!isLoading && clientsData?.data?.length > 0 && (
              <StyledTableRow sx={{ backgroundColor: '#e8f5e9' }}>
                {visibleColumns.map((column) => (
                  <StyledTableCell
                    key={`total-${column.id}`}
                    align="center"
                    sx={{ fontWeight: 'bold', fontSize: '0.95rem' }}
                  >
                    {column.id === 'id' ? (
                      <Typography variant="body2" fontWeight="bold">الإجمالي</Typography>
                    ) : column.id === 'monthlyInstallment' ? (
                      <Typography variant="body2" fontWeight="bold" color="secondary.main">
                        {formatCurrency(totals.averageMonthlyInstallment)}
                      </Typography>
                    ) : column.id === 'totalDebit' ? (
                      <Typography variant="body2" fontWeight="bold" color="error.main">
                        {formatCurrency(totals.totalDebit)}
                      </Typography>
                    ) : column.id === 'totalPaid' ? (
                      <Typography variant="body2" fontWeight="bold" color="success.main">
                        {formatCurrency(totals.totalPaid)}
                      </Typography>
                    ) : column.id === 'totalInterest' ? (
                      <Typography variant="body2" fontWeight="bold" color="primary.main">
                        {formatCurrency(totals.totalInterest)}
                      </Typography>
                    ) : column.id === 'remaining' ? (
                      <Typography variant="body2" fontWeight="bold" color="warning.main">
                        {formatCurrency(totals.remaining)}
                      </Typography>
                    ) : (
                      <Typography variant="body2">-</Typography>
                    )}
                  </StyledTableCell>
                ))}
              </StyledTableRow>
            )}
          </TableBody>
        </Table>
      </ScrollableTableContainer>
      
      {clientsData?.data?.length > 0 && (
        <TablePagination
          rowsPerPageOptions={[5, 10, 20]}
          component="div"
          count={clientsData.totalClients || 0}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="عدد الصفوف:"
          labelDisplayedRows={({ from, to, count }) => 
            `${from}-${to} من ${count}`
          }
        />
      )}
    </>
  );

  const renderMobileCards = () => (
    <Box sx={{ p: 1 }}>
      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress size={40} />
        </Box>
      ) : clientsData?.data?.length === 0 ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <Typography variant="h6" color="textSecondary">
            لا توجد عملاء
          </Typography>
        </Box>
      ) : (
        <Stack spacing={2}>
          {clientsData?.data
            ?.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
            .map((client, index) => (
              <Card
                key={client.id}
                sx={{
                  border: '1px solid #e0e0e0',
                  borderRadius: 2,
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                }}
              >
                <CardContent sx={{ p: 2 }}>
                  <Stack spacing={2}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="body2" color="textSecondary">
                        رقم: {index + 1 + (page * rowsPerPage)}
                      </Typography>
                    </Box>

                    <Box>
                      <Typography variant="h6" fontWeight="bold" color="primary.main" sx={{ whiteSpace: 'pre-line' }}>
                        {client.name}\n📞 {client.phone}
                      </Typography>
                    </Box>

                    {visibleColumns.map(column => {
                      if (['id', 'client'].includes(column.id)) return null;
                      
                      if (column.id === 'loansCount') {
                        return (
                          <Box key={column.id} sx={{ textAlign: 'center' }}>
                            <Typography variant="body2" color="textSecondary" gutterBottom>
                              عدد السلف:
                            </Typography>
                            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 1 }}>
                              <Box sx={{ textAlign: 'center' }}>
                                <Typography variant="body2" color="textSecondary">
                                  إجمالي
                                </Typography>
                                <Chip
                                  label={client.loansSummary.loansCount}
                                  color="primary"
                                  variant="outlined"
                                  size="small"
                                />
                              </Box>
                              <Box sx={{ textAlign: 'center' }}>
                                <Typography variant="body2" color="textSecondary">
                                  النشطة
                                </Typography>
                                <Chip
                                  label={client.loansSummary.activeLoans}
                                  color="success"
                                  size="small"
                                />
                              </Box>
                              <Box sx={{ textAlign: 'center' }}>
                                <Typography variant="body2" color="textSecondary">
                                  المكتملة
                                </Typography>
                                <Chip
                                  label={client.loansSummary.completedLoans}
                                  color="info"
                                  size="small"
                                />
                              </Box>
                            </Box>
                            {client.loansSummary.overdueLoans > 0 && (
                              <Box sx={{ mt: 1, textAlign: 'center' }}>
                                <Chip
                                  label={`${client.loansSummary.overdueLoans} متأخر`}
                                  color="error"
                                  size="small"
                                />
                              </Box>
                            )}
                          </Box>
                        );
                      }
                      
                      return (
                        <Box key={column.id} sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography variant="body2" color="textSecondary">
                            {column.label}:
                          </Typography>
                          <Typography variant="body2" fontWeight="bold">
                            {getColumnValue(client, column.id, index)}
                          </Typography>
                        </Box>
                      );
                    })}
  
                    <Box sx={{ pt: 1, borderTop: '1px solid #e0e0e0', textAlign: 'right' }}>
                      <Typography variant="body2" color="textSecondary">
                        ملاحظات: -
                      </Typography>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            ))
          }
        </Stack>
      )}
      
      {clientsData?.data?.length > 0 && (
        <Box sx={{ mt: 2 }}>
          <TablePagination
            rowsPerPageOptions={[5, 10, 20]}
            component="div"
            count={clientsData.totalClients || 0}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            labelRowsPerPage="عدد الصفوف:"
            labelDisplayedRows={({ from, to, count }) => 
              `${from}-${to} من ${count}`
            }
          />
        </Box>
      )}
    </Box>
  );

  return (
    <>
      {isMobile ? renderMobileCards() : renderDesktopTable()}
    </>
  );
};

export default ClientCollectionsTable;