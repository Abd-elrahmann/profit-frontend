import React, { useState, useMemo } from 'react';
import {
  Table,
  TableHead,
  TableBody,
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
  ScrollableTableContainer,
} from '../layouts/tableLayout';
const formatCurrency = (amount) => amount?.toLocaleString() || '0';
const ClientCollectionsTable = ({ isLoading, clientsData, visibleColumns, isSmallScreen: isSmallScreenProp }) => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const isMobile = useMediaQuery('(max-width: 768px)');
  const isTablet = useMediaQuery('(max-width: 1024px)');
  const showCards = isSmallScreenProp ?? (isMobile || isTablet);
  const handleChangePage = (event, newPage) => setPage(newPage);
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };
  const totals = useMemo(() => {
    if (!clientsData?.data?.length) {
      return {
        totalDebit: 0,
        totalPaid: 0,
        remaining: 0,
        totalInterest: 0,
        averageMonthlyInstallment: 0,
      };
    }
    return {
      totalDebit: clientsData.data.reduce((sum, c) => sum + (c.financials?.totalDebit || 0), 0),
      totalPaid: clientsData.data.reduce((sum, c) => sum + (c.financials?.totalPaid || 0), 0),
      remaining: clientsData.data.reduce((sum, c) => sum + (Math.abs(c.financials?.remaining) || 0), 0),
      totalInterest: clientsData.data.reduce((sum, c) => sum + (c.financials?.totalInterestPaid || 0), 0),
      dueAmount: clientsData.data.reduce((sum, c) => sum + (c.financials?.dueAmount || 0), 0),
      averageMonthlyInstallment: clientsData.data.reduce(
        (sum, c) => sum + (c.financials?.averageMonthlyInstallment || 0),
        0
      ),
    };
  }, [clientsData]);
  const getColumnValue = (client, columnId, index) => {
    switch (columnId) {
      case 'id':
        return index + 1 + page * rowsPerPage;
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
        return formatCurrency(client.financials?.averageMonthlyInstallment || 0);
      case 'totalDebit':
        return formatCurrency(client.financials?.totalDebit);
      case 'totalPaid':
        return formatCurrency(client.financials?.totalPaid);
      case 'totalInterest':
        return formatCurrency(client.financials?.totalInterestPaid || 0);
      case 'dueAmount':
        return formatCurrency(client.financials?.dueAmount || 0);
      case 'totalDiscounts':
        return formatCurrency(client.financials?.totalDiscounts || 0);
      case 'remaining':
        return formatCurrency(Math.abs(client.financials?.remaining));
      case 'note':
        return '-';
      default:
        return '';
    }
  };
  const renderLoansCountWithChips = (client) => (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5 }}>
      <Chip
        label={`${client.loansSummary.loansCount} سلفة`}
        size="small"
        color="primary"
        variant="outlined"
      />
      <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', justifyContent: 'center' }}>
        <Chip label={`${client.loansSummary.activeLoans} نشط`} size="small" color="success" sx={{ fontSize: '0.7rem' }} />
        <Chip label={`${client.loansSummary.completedLoans} مكتمل`} size="small" color="primary" sx={{ fontSize: '0.7rem' }} />
        {client.loansSummary.overdueLoans > 0 && (
          <Chip label={`${client.loansSummary.overdueLoans} متأخر`} size="small" color="error" sx={{ fontSize: '0.7rem' }} />
        )}
      </Box>
    </Box>
  );
  const paginationProps = {
    rowsPerPageOptions: [5, 10, 20],
    component: 'div',
    count: clientsData?.totalClients || 0,
    rowsPerPage,
    page,
    onPageChange: handleChangePage,
    onRowsPerPageChange: handleChangeRowsPerPage,
    labelRowsPerPage: 'عدد الصفوف:',
    labelDisplayedRows: ({ from, to, count }) => `${from}-${to} من ${count}`,
  };
  const renderTotalCellContent = (col) => {
    if (col.id === 'id') return <Typography variant="body2" fontWeight="bold">الإجمالي</Typography>;
    if (col.id === 'monthlyInstallment') return <Typography variant="body2" fontWeight="bold" color="secondary.main">{formatCurrency(totals.averageMonthlyInstallment)}</Typography>;
    if (col.id === 'totalDebit') return <Typography variant="body2" fontWeight="bold" color="error.main">{formatCurrency(totals.totalDebit)}</Typography>;
    if (col.id === 'totalPaid') return <Typography variant="body2" fontWeight="bold" color="success.main">{formatCurrency(totals.totalPaid)}</Typography>;
    if (col.id === 'totalInterest') return <Typography variant="body2" fontWeight="bold" color="primary.main">{formatCurrency(totals.totalInterest)}</Typography>;
    if (col.id === 'dueAmount') return <Typography variant="body2" fontWeight="bold" color="error.main">{formatCurrency(totals.dueAmount)}</Typography>;
    if (col.id === 'remaining') return <Typography variant="body2" fontWeight="bold" color="warning.main">{formatCurrency(totals.remaining)}</Typography>;
    return <Typography variant="body2">-</Typography>;
  };
  const renderDesktopTable = () => (
    <>
      <ScrollableTableContainer maxHeight={650}>
        <Table stickyHeader sx={{ minWidth: 2000 }}>
          <TableHead>
            <StyledTableRow>
              {visibleColumns.map((col) => (
                <StyledTableCell key={col.id} align="center" sx={{ fontWeight: 'bold', minWidth: 100 }}>
                  {col.label}
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
            ) : !clientsData?.data?.length ? (
              <StyledTableRow>
                <StyledTableCell colSpan={visibleColumns.length} align="center">
                  لا توجد عملاء
                </StyledTableCell>
              </StyledTableRow>
            ) : (
              clientsData.data
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((client, index) => (
                  <StyledTableRow key={client.id}>
                    {visibleColumns.map((col) => (
                      <StyledTableCell key={col.id} align="center">
                        {col.id === 'loansCount' ? (
                          renderLoansCountWithChips(client)
                        ) : col.id === 'client' ? (
                          <Box sx={{ textAlign: 'center' }}>
                            <Typography variant="body2" sx={{ whiteSpace: 'pre-line' }}>
                              {getColumnValue(client, col.id, index)}
                            </Typography>
                          </Box>
                        ) : (
                          <Typography variant="body2">{getColumnValue(client, col.id, index)}</Typography>
                        )}
                      </StyledTableCell>
                    ))}
                  </StyledTableRow>
                ))
            )}
            {!isLoading && clientsData?.data?.length > 0 && (
              <StyledTableRow sx={{ backgroundColor: '#e8f5e9' }}>
                {visibleColumns.map((col) => (
                  <StyledTableCell key={`total-${col.id}`} align="center" sx={{ fontWeight: 'bold', fontSize: '0.95rem' }}>
                    {renderTotalCellContent(col)}
                  </StyledTableCell>
                ))}
              </StyledTableRow>
            )}
          </TableBody>
        </Table>
      </ScrollableTableContainer>
      {clientsData?.data?.length > 0 && <TablePagination {...paginationProps} />}
    </>
  );
  const renderMobileCards = () => (
    <Box sx={{ p: 1 }}>
      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress size={40} />
        </Box>
      ) : !clientsData?.data?.length ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <Typography variant="body1" color="textSecondary">
            لا توجد عملاء
          </Typography>
        </Box>
      ) : (
        <Stack spacing={1.5}>
          {clientsData.data
            .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
            .map((client, index) => (
              <Card
                key={client.id}
                sx={{
                  border: '1px solid #e0e0e0',
                  borderRadius: 2,
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                }}
              >
                <CardContent sx={{ p: 1.5 }}>
                  <Stack spacing={1.5} sx={{ alignItems: 'center', textAlign: 'center' }}>
                    <Typography variant="caption" color="textSecondary">
                      رقم: {index + 1 + page * rowsPerPage}
                    </Typography>
                    <Typography variant="subtitle2" fontWeight="bold" color="primary.main" sx={{ whiteSpace: 'pre-line', fontSize: '0.9rem' }}>
                      {client.name}
                      {'\n'}📞 {client.phone}
                    </Typography>
                    <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1.5 }}>
                      {visibleColumns
                        .filter((col) => !['id', 'client'].includes(col.id))
                        .map((col) =>
                          col.id === 'loansCount' ? (
                            <Box key={col.id} sx={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                              <Typography variant="caption" color="textSecondary" sx={{ mb: 0.5 }}>
                                السلف وعددها
                              </Typography>
                              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, justifyContent: 'center' }}>
                                <Chip label={`${client.loansSummary.loansCount} إجمالي`} color="primary" variant="outlined" size="small" sx={{ fontSize: '0.7rem' }} />
                                <Chip label={`${client.loansSummary.activeLoans} نشط`} color="success" size="small" sx={{ fontSize: '0.7rem' }} />
                                <Chip label={`${client.loansSummary.completedLoans} مكتمل`} color="primary" size="small" sx={{ fontSize: '0.7rem' }} />
                                {client.loansSummary.overdueLoans > 0 && (
                                  <Chip label={`${client.loansSummary.overdueLoans} متأخر`} color="error" size="small" sx={{ fontSize: '0.7rem' }} />
                                )}
                              </Box>
                            </Box>
                          ) : (
                            <Box key={col.id} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
                              <Typography variant="caption" color="textSecondary">{col.label}</Typography>
                              <Typography variant="body2" fontWeight="600" sx={{ fontSize: '0.85rem' }}>
                                {getColumnValue(client, col.id, index)}
                              </Typography>
                            </Box>
                          )
                        )}
                    </Box>
                    <Box sx={{ pt: 1, borderTop: '1px solid #e0e0e0', width: '100%', textAlign: 'center' }}>
                      <Typography variant="caption" color="textSecondary">ملاحظات: -</Typography>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            ))}
        </Stack>
      )}
      {clientsData?.data?.length > 0 && (
        <Box sx={{ mt: 2 }}>
          <TablePagination {...paginationProps} />
        </Box>
      )}
    </Box>
  );
  return showCards ? renderMobileCards() : renderDesktopTable();
};
export default ClientCollectionsTable;
