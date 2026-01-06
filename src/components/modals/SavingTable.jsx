import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableContainer,
  TableHead,
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
  useTheme,
} from '@mui/material';
import {
  StyledTableCell,
  StyledTableRow,
} from '../../components/layouts/tableLayout';

const SavingTable = ({ isLoading, savingData }) => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const theme = useTheme();
  const isMobile = useMediaQuery('(max-width: 768px)');

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Format currency
  const formatCurrency = (amount) => {
    return amount?.toLocaleString() || '0';
  };

  // Render desktop table
  const renderDesktopTable = () => (
    <TableContainer component={Paper} sx={{ boxShadow: '0 2px 12px rgba(0,0,0,0.1)' }}>
      <Table>
        <TableHead>
          <StyledTableRow>
            <StyledTableCell align="center" sx={{ fontWeight: 'bold' }}>
                الشريك
            </StyledTableCell>
            <StyledTableCell align="center" sx={{ fontWeight: 'bold' }}>
              عدد فترات الادخار
            </StyledTableCell>
            <StyledTableCell align="center" sx={{ fontWeight: 'bold' }}>
              آخر فترة ادخار
            </StyledTableCell>
            <StyledTableCell align="center" sx={{ fontWeight: 'bold' }}>
                إجمالي المدخرات
            </StyledTableCell>
            <StyledTableCell align="center" sx={{ fontWeight: 'bold' }}>
                إجمالي السحوبات
            </StyledTableCell>
            <StyledTableCell align="center" sx={{ fontWeight: 'bold' }}>
                الرصيد الحالي
            </StyledTableCell>
          </StyledTableRow>
        </TableHead>
        <TableBody>
          {isLoading ? (
            <StyledTableRow>
              <StyledTableCell colSpan={5} align="center">
                <CircularProgress size={30} />
                <Typography variant="body2" sx={{ mt: 1 }}>
                  جاري تحميل البيانات...
                </Typography>
              </StyledTableCell>
            </StyledTableRow>
          ) : !savingData?.data || savingData?.data?.length === 0 ? (
            <StyledTableRow>
              <StyledTableCell colSpan={5} align="center">
                <Typography variant="body1" color={theme.palette.primary.main}>
                  لا توجد مدخرات للشركاء
                </Typography>
              </StyledTableCell>
            </StyledTableRow>
          ) : (
            (() => {
              const currentPageData = savingData?.data
                ?.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
              const totalSavings = currentPageData?.reduce((total, partner) => {
                const lastPeriod = partner.periods[0];
                return total + (lastPeriod ? Number(lastPeriod.currentBalance) : 0);
              }, 0) || 0;

              return (
                <>
                  {currentPageData.map((partner) => {
                    const lastPeriod = partner.periods[0];
                    const hasSavings = partner.periods.length > 0;

                    return (
                      <StyledTableRow
                        key={partner.partnerId}
                      >
                        <StyledTableCell align="center">
                            {partner.partnerName}
                        </StyledTableCell>
                        <StyledTableCell align="center">
                          <Chip
                            label={partner.periods.length}
                            color={hasSavings ? theme.palette.primary.main : theme.palette.text.primary}
                            variant="outlined"
                            size="small"
                          />
                        </StyledTableCell>
                        <StyledTableCell align="center">
                          {lastPeriod ? (
                            <Typography variant="body2" fontWeight="medium">
                              {lastPeriod.period.name}
                            </Typography>
                          ) : (
                            <Typography variant="body2" color={theme.palette.text.secondary}>
                              لا توجد
                            </Typography>
                          )}
                        </StyledTableCell>
                        <StyledTableCell align="center">
                          {lastPeriod ? (
                            <Typography variant="body2" fontWeight="bold" color={theme.palette.success.main}>
                              {formatCurrency(lastPeriod.totalSavings)}
                            </Typography>
                          ) : (
                            <Typography variant="body2" color={theme.palette.text.secondary}>
                              -
                            </Typography>
                          )}
                        </StyledTableCell>
                        <StyledTableCell align="center">
                          {lastPeriod ? (
                            <Typography variant="body2" fontWeight="bold" color={theme.palette.warning.main}>
                              {formatCurrency(lastPeriod.totalWithdrawals)}
                            </Typography>
                          ) : (
                            <Typography variant="body2" color={theme.palette.text.secondary}>
                              -
                            </Typography>
                          )}
                        </StyledTableCell>
                        <StyledTableCell align="center">
                          {lastPeriod ? (
                            <Typography variant="body2" fontWeight="bold" color={lastPeriod.currentBalance > 0 ? theme.palette.primary.main : theme.palette.error.main}>
                              {formatCurrency(lastPeriod.currentBalance)}
                            </Typography>
                          ) : (
                            <Typography variant="body2" color={theme.palette.text.secondary}>
                              -
                            </Typography>
                          )}
                        </StyledTableCell>
                      </StyledTableRow>
                    );
                  })}
                  {/* Total Row */}
                  <StyledTableRow sx={{ bgcolor: 'primary.50', '&:hover': { bgcolor: 'primary.50' } }}>
                    <StyledTableCell align="center" sx={{ fontWeight: 'bold', fontSize: '1.1rem', color: 'primary.main' }}>
                      الإجمالي
                    </StyledTableCell>
                    <StyledTableCell align="center">
                      {/* Empty cell for periods count */}
                    </StyledTableCell>
                    <StyledTableCell align="center">
                      {/* Empty cell for last period */}
                    </StyledTableCell>
                    <StyledTableCell align="center" sx={{ fontWeight: 'bold', fontSize: '1.1rem', color: 'success.main' }}>
                      {formatCurrency(
                        currentPageData?.reduce((total, partner) => {
                          const lastPeriod = partner.periods[0];
                          return total + (lastPeriod ? Number(lastPeriod.totalSavings) : 0);
                        }, 0) || 0
                      )}
                    </StyledTableCell>
                    <StyledTableCell align="center" sx={{ fontWeight: 'bold', fontSize: '1.1rem', color: 'warning.main' }}>
                      {formatCurrency(
                        currentPageData?.reduce((total, partner) => {
                          const lastPeriod = partner.periods[0];
                          return total + (lastPeriod ? Number(lastPeriod.totalWithdrawals) : 0);
                        }, 0) || 0
                      )}
                    </StyledTableCell>
                    <StyledTableCell align="center" sx={{ fontWeight: 'bold', fontSize: '1.2rem', color: 'primary.main' }}>
                      {formatCurrency(totalSavings)}
                    </StyledTableCell>
                  </StyledTableRow>
                </>
              );
            })()
          )}
        </TableBody>
      </Table>
      {savingData?.data?.length > 0 && (
        <TablePagination
          rowsPerPageOptions={[5, 10, 20]}
          component="div"
          count={savingData.pagination?.totalPartners || 0}
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
    </TableContainer>
  );

  // Render mobile cards
  const renderMobileCards = () => (
    <Box sx={{ p: 1 }}>
      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress size={40} />
        </Box>
      ) : !savingData?.data || savingData?.data?.length === 0 ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <Typography variant="h6" color={theme.palette.primary.main}>
            لا توجد مدخرات للشركاء
          </Typography>
        </Box>
      ) : (
        <Stack spacing={2}>
          {            savingData?.data
              ?.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((partner) => {
                const lastPeriod = partner.periods[0];
                const hasSavings = lastPeriod && lastPeriod.currentBalance > 0;

              return (
                <Card
                  key={partner.partnerId}
                  sx={{
                      border: `1px solid ${theme.palette.divider}`,
                      borderRadius: 2,
                      boxShadow: `0 2px 4px ${theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
                  }}
                >
                  <CardContent sx={{ p: 2 }}>
                    <Stack spacing={2}>
                      {/* Header */}
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <Typography variant="h6" fontWeight="bold" color={theme.palette.primary.main}>
                          {partner.partnerName}
                        </Typography>
                        <Chip
                          label={hasSavings ? "لديه مدخرات" : "لا يوجد مدخرات"}
                          color={hasSavings ? theme.palette.primary.main : theme.palette.text.primary}
                          size="small"
                        />
                      </Box>

                      {/* Savings Summary */}
                      <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 1 }}>
                        <Box sx={{ textAlign: 'center' }}>
                          <Typography variant="body2" color={theme.palette.primary.main}>
                            فترات الادخار
                          </Typography>
                          <Chip
                            label={partner.periods.length}
                            color={hasSavings ? theme.palette.primary.main : theme.palette.text.primary}
                            variant="outlined"
                            size="small"
                          />
                        </Box>
                        <Box sx={{ textAlign: 'center' }}>
                          <Typography variant="body2" color={theme.palette.success.main}>
                            إجمالي المدخرات
                          </Typography>
                          <Typography
                            variant="body1"
                            fontWeight="bold"
                            color={theme.palette.success.main}
                          >
                            {formatCurrency(lastPeriod.totalSavings)}
                          </Typography>
                        </Box>
                        <Box sx={{ textAlign: 'center' }}>
                          <Typography variant="body2" color={theme.palette.primary.main}>
                            الرصيد الحالي
                          </Typography>
                          <Typography
                            variant="h6"
                            fontWeight="bold"
                            color={lastPeriod.currentBalance > 0 ? theme.palette.primary.main : theme.palette.error.main}
                          >
                            {formatCurrency(lastPeriod.currentBalance)}
                          </Typography>
                        </Box>
                      </Box>

                      {/* Withdrawals Info */}
                      {lastPeriod.totalWithdrawals > 0 && (
                        <Box sx={{ textAlign: 'center', pt: 1 }}>
                          <Typography variant="body2" color={theme.palette.warning.main}>
                            إجمالي السحوبات: <strong>{formatCurrency(lastPeriod.totalWithdrawals)}</strong>
                          </Typography>
                        </Box>
                      )}

                      {/* Last Period */}
                      {lastPeriod && (
                        <Box sx={{ p: 1, bgcolor: theme.palette.background.default, borderRadius: 1 }}>
                          <Typography variant="body2" color={theme.palette.primary.main}>
                            آخر فترة: {lastPeriod.period.name}
                          </Typography>
                          <Typography variant="body2" fontWeight="bold">
                            الرصيد الحالي: {formatCurrency(lastPeriod.currentBalance)}
                          </Typography>
                        </Box>
                      )}
                    </Stack>
                  </CardContent>
                </Card>
              );
            })
          }
        </Stack>
      )}
      
      {savingData?.data?.length > 0 && (
        <Box sx={{ mt: 2 }}>
          <TablePagination
            rowsPerPageOptions={[5, 10, 20]}
            component="div"
            count={savingData.pagination?.totalPartners || 0}
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

  return isMobile ? renderMobileCards() : renderDesktopTable();
};

export default SavingTable;