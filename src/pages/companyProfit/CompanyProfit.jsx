import React, { useState } from "react";
import {
  Box,
  Grid,
  Typography,
  Paper,
  Card,
  CardContent,
  Alert,
  Table,
  TableContainer,
  TableHead,
  TableBody,
  Chip,
  IconButton,
  CircularProgress,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Pagination,
  useMediaQuery,
} from "@mui/material";
import {
  AccountBalance,
  TrendingDown,
  Download,
  Print,
  PictureAsPdf,
  TableChart,
} from "@mui/icons-material";
import { useQuery } from "@tanstack/react-query";
import { Helmet } from "react-helmet-async";
import dayjs from "dayjs";
import { StyledTableCell, StyledTableRow } from '../../components/layouts/tableLayout';
import { notifySuccess, notifyError } from '../../utilities/toastify';
import { getCompanyProfitReport, withdrawCompanyProfit } from './CompanyProfitApi';
import { exportCompanyProfitToPDF, exportCompanyProfitToExcel } from '../../utilities/companyProfitExporter';
import { usePermissions } from "../../components/Contexts/PermissionsContext";
export default function CompanyProfit() {
  const [withdrawModalOpen, setWithdrawModalOpen] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawError, setWithdrawError] = useState('');
  const [profitPage, setProfitPage] = useState(1);
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const { permissions } = usePermissions();
  const isMobile = useMediaQuery("(max-width: 480px)");
  const isTablet = useMediaQuery("(max-width: 768px)");
  const isSmallScreen = isMobile || isTablet;

  const { data: profitData, isLoading: profitLoading, error: profitError, refetch: refetchProfit } = useQuery({
    queryKey: ["company-profit", profitPage],
    queryFn: () => getCompanyProfitReport(profitPage),
    retry: 1,
  });

  const handleWithdrawModalOpen = () => {
    setWithdrawModalOpen(true);
  };

  const handleWithdrawModalClose = () => {
    setWithdrawModalOpen(false);
    setWithdrawAmount('');
    setWithdrawError('');
  };

  const handleWithdrawAmountChange = (e) => {
    const value = e.target.value;
    setWithdrawAmount(value);

    if (value && profitData?.availableAmount) {
      const amount = parseFloat(value);
      if (amount > profitData.availableAmount) {
        setWithdrawError(`المبلغ المدخل (${amount.toLocaleString('en-US')} ريال) يتجاوز الرصيد المتاح (${profitData.availableAmount.toLocaleString('en-US')} ريال)`);
      } else if (amount <= 0) {
        setWithdrawError('يجب أن يكون المبلغ أكبر من صفر');
      } else {
        setWithdrawError('');
      }
    } else {
      setWithdrawError('');
    }
  };

  const handleWithdrawSubmit = async () => {
    const amount = parseFloat(withdrawAmount);
    if (!amount || amount <= 0) {
      notifyError('يرجى إدخال مبلغ صحيح');
      return;
    }

    if (withdrawError) {
      notifyError('يرجى تصحيح الأخطاء قبل المتابعة');
      return;
    }

    setIsWithdrawing(true);
    try {
      await withdrawCompanyProfit(amount);
      notifySuccess('تم سحب الأرباح بنجاح');
      handleWithdrawModalClose();
      refetchProfit();
    } catch (error) {
      console.error('Withdraw Error:', error);
      notifyError(error.response?.data?.message || 'حدث خطأ أثناء سحب الأرباح');
    } finally {
      setIsWithdrawing(false);
    }
  };

  const handleProfitPageChange = (event, value) => {
    setProfitPage(value);
  };

  const handleExportPDF = async () => {
    if (!profitData) return;

    setIsExporting(true);
    try {
      await exportCompanyProfitToPDF(profitData);
      notifySuccess('تم تصدير PDF بنجاح');
    } catch (error) {
      console.error('PDF Export Error:', error);
      notifyError('حدث خطأ أثناء تصدير PDF');
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportExcel = async () => {
    if (!profitData) return;

    setIsExporting(true);
    try {
      await exportCompanyProfitToExcel(profitData);
      notifySuccess('تم تصدير Excel بنجاح');
    } catch (error) {
      console.error('Excel Export Error:', error);
      notifyError('حدث خطأ أثناء تصدير Excel');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Box sx={{ minHeight: "100vh" }}>
      <Helmet>
        <title>أرباح الشركة</title>
        <meta name="description" content="إدارة أرباح الشركة وسحب الأرباح" />
      </Helmet>

      <Box sx={{ p: isSmallScreen ? 2 : 3, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
          <Paper sx={{
            borderRadius: 2,
            boxShadow: '0 2px 12px rgba(0,0,0,0.1)',
            overflow: 'hidden',
            width: isSmallScreen ? '100%' : 'calc(100vw - 240px)',
            maxWidth: '100%'
          }}>
            <Box sx={{
              display: 'flex',
              flexDirection: isSmallScreen ? 'column' : 'row',
              justifyContent: 'space-between',
              alignItems: isSmallScreen ? 'flex-start' : 'center',
              p: isSmallScreen ? 2 : 3,
              gap: isSmallScreen ? 2 : 0,
              borderBottom: '1px solid #e0e0e0',
              bgcolor: '#fafafa'
            }}>
              <Box>
                <Typography variant={isSmallScreen ? "subtitle1" : "h6"} fontWeight="bold" color="black">
                  أرباح الشركة
                </Typography>
              </Box>
              {permissions.includes('company_Add') && (
              <Button
                variant="contained"
                color="primary"
                onClick={handleWithdrawModalOpen}
                disabled={!profitData || profitData.availableAmount <= 0}
                sx={{ minWidth: isSmallScreen ? '100%' : 'auto', fontWeight: "bold" }}
              >
                سحب أرباح
              </Button>
              )}
            </Box>

            {profitLoading ? (
              <Box sx={{ display: "flex", justifyContent: "center", p: 6 }}>
                <CircularProgress size={60} />
              </Box>
            ) : profitError ? (
              <Box sx={{ p: 3 }}>
                <Alert severity="error">
                  حدث خطأ في تحميل بيانات أرباح الشركة: {profitError.message}
                </Alert>
              </Box>
            ) : (
              <>
                {/* Profit Summary Cards */}
                <Grid container spacing={3} sx={{ p: isSmallScreen ? 2 : 3, justifyContent: 'center' }}>
                  <Grid item xs={12} md={6}>
                    <Card sx={{ borderRadius: 2, boxShadow: '0 2px 12px rgba(0,0,0,0.1)' }}>
                      <CardContent sx={{ p: isSmallScreen ? 2 : 3 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                          <Box sx={{
                            p: 1,
                            borderRadius: 2,
                            mr: 2
                          }}>
                            <AccountBalance sx={{ color: "#1976d2", fontSize: 24 }} />
                          </Box>
                          <Box>
                            <Typography variant={isSmallScreen ? "h5" : "h4"} fontWeight="bold" color="primary">
                              {profitData?.availableAmount?.toLocaleString('en-US') || 0}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              الرصيد المتاح للسحب
                            </Typography>
                          </Box>
                        </Box>
                        <Chip
                          label="متاح للسحب"
                          size="small"
                          color="primary"
                          variant="outlined"
                        />
                      </CardContent>
                    </Card>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Card sx={{ borderRadius: 2, boxShadow: '0 2px 12px rgba(0,0,0,0.1)' }}>
                      <CardContent sx={{ p: isSmallScreen ? 2 : 3 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                          <Box sx={{
                            p: 1,
                            borderRadius: 2,
                            mr: 2
                          }}>
                            <TrendingDown sx={{ color: "#2e7d32", fontSize: 24 }} />
                          </Box>
                          <Box>
                            <Typography variant={isSmallScreen ? "h5" : "h4"} fontWeight="bold" color="success.main">
                              {profitData?.totalWithdrawals || 0}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              إجمالي عمليات السحب
                            </Typography>
                          </Box>
                        </Box>
                        <Chip
                          label="عمليات سحب"
                          size="small"
                          color="success"
                          variant="outlined"
                        />
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>

                {/* Withdrawal History */}
                <Box sx={{ p: isSmallScreen ? 2 : 3 }}>
                  <Typography variant="h6" fontWeight="bold" mb={3}>
                    سجل السحوبات
                  </Typography>

                  {profitData?.withdrawals?.length === 0 ? (
                    <Box sx={{ textAlign: 'center', py: 6 }}>
                      <AccountBalance sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                      <Typography variant="h6" color="text.secondary" gutterBottom>
                        لا توجد عمليات سحب حتى الآن
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        لم يتم إجراء أي عمليات سحب من أرباح الشركة
                      </Typography>
                    </Box>
                  ) : (
                    <>
                      <TableContainer>
                        <Table>
                          <TableHead>
                            <StyledTableRow>
                              <StyledTableCell align="center" sx={{ fontWeight: 'bold' }}>
                                التاريخ
                              </StyledTableCell>
                              <StyledTableCell align="center" sx={{ fontWeight: 'bold' }}>
                                المرجع
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
                            {profitData?.withdrawals?.map((withdrawal) => (
                              <StyledTableRow key={withdrawal.id} hover>
                                <StyledTableCell align="center">
                                  <Typography variant="body2">
                                    {dayjs(withdrawal.date).format('DD/MM/YYYY')}
                                  </Typography>
                                </StyledTableCell>
                                <StyledTableCell align="center">
                                  <Typography variant="body2" fontWeight="500" color="primary">
                                    {withdrawal.reference}
                                  </Typography>
                                </StyledTableCell>
                                <StyledTableCell align="center">
                                  <Typography variant="body2">
                                    {withdrawal.description}
                                  </Typography>
                                </StyledTableCell>
                                <StyledTableCell align="center" sx={{ fontWeight: 'bold' }}>
                                  <Typography variant="body2" fontWeight="bold" color="error.main">
                                    {withdrawal.amount.toLocaleString('en-US')}
                                  </Typography>
                                </StyledTableCell>
                              </StyledTableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>

                      {/* Pagination */}
                      {profitData && profitData.totalPages > 1 && (
                        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                          <Pagination
                            count={profitData.totalPages}
                            page={profitData.currentPage}
                            onChange={handleProfitPageChange}
                            color="primary"
                          />
                        </Box>
                      )}

                      {/* Export Buttons */}
                      <Box sx={{
                        display: 'flex',
                        gap: 2,
                        justifyContent: 'center',
                        mt: 3,
                        p: 2,
                        borderTop: '1px solid #e0e0e0'
                      }}>
                        <Button
                          variant="outlined"
                          startIcon={<PictureAsPdf />}
                          onClick={handleExportPDF}
                          disabled={isExporting}
                          sx={{
                            color: 'error.main',
                            borderColor: 'error.main',
                            '&:hover': {
                              bgcolor: 'error.main',
                              color: 'white',
                              borderColor: 'error.main'
                            },
                            '&:disabled': {
                              bgcolor: 'grey.200',
                              color: 'grey.400',
                              borderColor: 'grey.400'
                            }
                          }}
                        >
                          {isExporting ? <CircularProgress size={16} /> : 'تصدير PDF'}
                        </Button>

                        <Button
                          variant="outlined"
                          startIcon={<TableChart />}
                          onClick={handleExportExcel}
                          disabled={isExporting}
                          sx={{
                            color: 'success.main',
                            borderColor: 'success.main',
                            '&:hover': {
                              bgcolor: 'success.main',
                              color: 'white',
                              borderColor: 'success.main'
                            },
                            '&:disabled': {
                              bgcolor: 'grey.200',
                              color: 'grey.400',
                              borderColor: 'grey.400'
                            }
                          }}
                        >
                          {isExporting ? <CircularProgress size={16} /> : 'تصدير Excel'}
                        </Button>
                      </Box>
                    </>
                  )}
                </Box>
              </>
            )}
          </Paper>
        </Box>
      </Box>

      {/* Withdraw Profit Modal */}
      <Dialog
        open={withdrawModalOpen}
        onClose={handleWithdrawModalClose}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Typography variant="h6" fontWeight="bold">
            سحب أرباح الشركة
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            <Typography variant="body2" color="text.secondary" mb={2}>
              الرصيد المتاح: {profitData?.availableAmount?.toLocaleString('en-US') || 0} ريال
            </Typography>
            <TextField
              fullWidth
              label="مبلغ السحب"
              type="number"
              value={withdrawAmount}
              onChange={handleWithdrawAmountChange}
              inputProps={{ min: 0, step: 0.01 }}
              helperText={withdrawError || "أدخل المبلغ المراد سحبه من أرباح الشركة"}
              error={!!withdrawError}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ display: 'flex', justifyContent: 'space-between', gap: 2, flexDirection: 'row-reverse' }}>
          <Button onClick={handleWithdrawModalClose} color="inherit">
            إلغاء
          </Button>
          <Button
            onClick={handleWithdrawSubmit}
            variant="contained"
            color="primary"
            disabled={isWithdrawing || !withdrawAmount || parseFloat(withdrawAmount) <= 0 || !!withdrawError}
          >
            {isWithdrawing ? <CircularProgress size={20} /> : 'سحب'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
