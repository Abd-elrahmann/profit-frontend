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
  IconButton,
} from '@mui/material';
import {
  StyledTableCell,
  StyledTableRow,
} from '../../components/layouts/tableLayout';
import { Visibility as VisibilityIcon } from '@mui/icons-material';

const SavingTable = ({ onViewDetails, isLoading, savingData }) => {
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
                مبلغ الادخار
            </StyledTableCell>
            <StyledTableCell align="center" sx={{ fontWeight: 'bold' }}>
              حالة الادخار
            </StyledTableCell>
            <StyledTableCell align="center" sx={{ fontWeight: 'bold' }}>
              الإجراءات
            </StyledTableCell>
          </StyledTableRow>
        </TableHead>
        <TableBody>
          {isLoading ? (
            <StyledTableRow>
              <StyledTableCell colSpan={7} align="center">
                <CircularProgress size={30} />
                <Typography variant="body2" sx={{ mt: 1 }}>
                  جاري تحميل البيانات...
                </Typography>
              </StyledTableCell>
            </StyledTableRow>
          ) : !savingData?.data || savingData?.data?.length === 0 ? (
            <StyledTableRow>
              <StyledTableCell colSpan={7} align="center">
                <Typography variant="body1" color="primary.main">
                  لا توجد مدخرات للشركاء
                </Typography>
              </StyledTableCell>
            </StyledTableRow>
          ) : (
            savingData?.data
              ?.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((partner) => {
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
                        color={hasSavings ? "primary" : "default"}
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
                        <Typography variant="body2" color="textSecondary">
                          لا توجد
                        </Typography>
                      )}
                    </StyledTableCell>
                    <StyledTableCell align="center">
                      {lastPeriod ? (
                        <Typography variant="body2" fontWeight="bold" color="success.main">
                          {formatCurrency(lastPeriod.total)}
                        </Typography>
                      ) : (
                        <Typography variant="body2" color="textSecondary">
                          -
                        </Typography>
                      )}
                    </StyledTableCell>
                    <StyledTableCell align="center">
                      <Chip
                        label={hasSavings ? "لديه مدخرات" : "لا يوجد مدخرات"}
                        color={hasSavings ? "success" : "default"}
                        size="small"
                      />
                    </StyledTableCell>
                    <StyledTableCell align="center">
                      <IconButton
                        title="عرض التفاصيل"
                        size="small"
                        color="primary"
                        onClick={(e) => {
                          e.stopPropagation();
                          onViewDetails(partner.partnerId);
                        }}
                      >
                        <VisibilityIcon fontSize="small" />
                      </IconButton>
                    </StyledTableCell>
                  </StyledTableRow>
                );
              })
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
          <Typography variant="h6" color="primary.main">
            لا توجد مدخرات للشركاء
          </Typography>
        </Box>
      ) : (
        <Stack spacing={2}>
          {savingData?.data
            ?.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
            .map((partner) => {
              const lastPeriod = partner.periods[0];
              const hasSavings = partner.periods.length > 0;

              return (
                <Card
                  key={partner.partnerId}
                  sx={{
                    border: '1px solid #e0e0e0',
                    borderRadius: 2,
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                  }}
                >
                  <CardContent sx={{ p: 2 }}>
                    <Stack spacing={2}>
                      {/* Header */}
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <Typography variant="h6" fontWeight="bold" color="primary.main">
                          {partner.partnerName}
                        </Typography>
                        <Chip
                          label={hasSavings ? "لديه مدخرات" : "لا يوجد مدخرات"}
                          color={hasSavings ? "success" : "default"}
                          size="small"
                        />
                      </Box>

                      {/* Savings Summary */}
                      <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1 }}>
                        <Box sx={{ textAlign: 'center' }}>
                          <Typography variant="body2" color="primary.main">
                            فترات الادخار
                          </Typography>
                          <Chip
                            label={partner.periods.length}
                            color={hasSavings ? "primary" : "default"}
                            variant="outlined"
                            size="small"
                          />
                        </Box>
                        <Box sx={{ textAlign: 'center' }}>
                          <Typography variant="body2" color="primary.main">
                            إجمالي المدخرات
                          </Typography>
                          <Typography 
                            variant="h6" 
                            fontWeight="bold" 
                            color={lastPeriod.total > 0 ? "success.main" : "text.secondary"}
                          >
                            {formatCurrency(lastPeriod.total)}
                          </Typography>
                        </Box>
                      </Box>

                      {/* Last Period */}
                      {lastPeriod && (
                        <Box sx={{ p: 1, bgcolor: 'grey.50', borderRadius: 1 }}>
                          <Typography variant="body2" color="primary.main">
                            آخر فترة: {lastPeriod.period.name}
                          </Typography>
                          <Typography variant="body2" fontWeight="bold">
                            المبلغ: {formatCurrency(lastPeriod.total)}
                          </Typography>
                        </Box>
                      )}

                      {/* Action */}
                      <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                        <IconButton
                          title="عرض التفاصيل"
                          size="small"
                          color="primary"
                          onClick={(e) => {
                            e.stopPropagation();
                            onViewDetails(partner.partnerId);
                          }}
                        >
                          <VisibilityIcon fontSize="small" />
                        </IconButton>
                      </Box>
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