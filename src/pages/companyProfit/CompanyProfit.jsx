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
import 'dayjs/locale/ar';
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

  const formatArabicDate = (date) => {
    return dayjs(date)
      .locale("ar")
      .format("D [من] MMMM [الساعة] h:mm") // format without A
      + " "
      + (dayjs(date).hour() < 12 ? "صباحًا" : "مساءً");
  };

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
        setWithdrawError(`المبلغ المدخل (${Math.round(amount).toLocaleString('en-US')}) يتجاوز الرصيد المتاح (${Math.round(profitData.availableAmount).toLocaleString('en-US')})`);
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
              <Box sx={{ display: 'flex', gap: 1, flexDirection: isSmallScreen ? 'column' : 'row' }}>
                {permissions.includes('company_Add') && (
                <Button
                  variant="contained"
                  onClick={handleWithdrawModalOpen}
                  disabled={!profitData || profitData.availableAmount <= 0}
                  sx={{ minWidth: isSmallScreen ? '100%' : 'auto', fontWeight: "bold",
                    '&:hover': {
                      bgcolor: 'primary.main',
                      color: 'white',
                      borderColor: 'primary.main'
                    },
                   }}
                >
                  سحب أرباح
                </Button>
                )}
                {permissions.includes("company_Export") && (
                  <>
                    <Button
                      variant="outlined"
                      startIcon={<PictureAsPdf sx={{marginLeft: "10px"}} />}
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
                        },
                        minWidth: isSmallScreen ? '100%' : 'auto'
                      }}
                    >
                      {isExporting ? <CircularProgress size={16} /> : 'تصدير PDF'}
                    </Button>

                    <Button
                      variant="outlined"
                      startIcon={<TableChart sx={{marginLeft: "10px"}} />}
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
                        },
                        minWidth: isSmallScreen ? '100%' : 'auto'
                      }}
                    >
                      {isExporting ? <CircularProgress size={16} /> : 'تصدير Excel'}
                    </Button>
                  </>
                )}
              </Box>
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
                              {Math.round(profitData?.availableAmount || 0).toLocaleString('en-US')}
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
                              {profitData?.data?.length || 0}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              عدد عمليات السحب
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

                {/* Company Profit Sources */}
                {profitData?.periodsProfit?.periods && profitData.periodsProfit.periods.length > 0 && (
                  <Box sx={{ p: isSmallScreen ? 2 : 3 }}>
                    <Typography variant="h6" fontWeight="bold" mb={3}>
                      مصادر أرباح الشركة
                    </Typography>

                    <TableContainer sx={{ mb: 4 }}>
                      <Table>
                        <TableHead>
                          <StyledTableRow>
                            <StyledTableCell align="center" sx={{ fontWeight: 'bold' }}>
                              الفترة
                            </StyledTableCell>
                            <StyledTableCell align="center" sx={{ fontWeight: 'bold' }}>
                              إجمالي الأرباح
                            </StyledTableCell>
                            <StyledTableCell align="center" sx={{ fontWeight: 'bold' }}>
                              نسبة الشركة
                            </StyledTableCell>
                            <StyledTableCell align="center" sx={{ fontWeight: 'bold' }}>
                              أرباح الشركة
                            </StyledTableCell>
                          </StyledTableRow>
                        </TableHead>
                        <TableBody>
                          {profitData.periodsProfit.periods.map((period, index) => (
                            <StyledTableRow key={index} hover>
                              <StyledTableCell align="center">
                                <Typography variant="body2" fontWeight="medium">
                                  {period.periodName || `الفترة ${index + 1}`}
                                </Typography>
                              </StyledTableCell>
                              <StyledTableCell align="center">
                                <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                                  {Math.round(period.totalPeriodProfit || 0).toLocaleString('en-US')}
                                </Typography>
                              </StyledTableCell>
                              <StyledTableCell align="center">
                                <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                                  {period.companyPercentage || 0}%
                                </Typography>
                              </StyledTableCell>
                              <StyledTableCell align="center">
                                <Typography variant="body2" fontWeight="bold" color="primary.main">
                                  {Math.round(period.companyProfit || 0).toLocaleString('en-US')}
                                </Typography>
                              </StyledTableCell>
                            </StyledTableRow>
                          ))}
                          {/* Total Row */}
                          <StyledTableRow sx={{ bgcolor: 'grey.50' }}>
                            <StyledTableCell align="center">
                              <Typography variant="body2" fontWeight="bold">
                                الإجمالي
                              </Typography>
                            </StyledTableCell>
                            <StyledTableCell align="center">-</StyledTableCell>
                            <StyledTableCell align="center">-</StyledTableCell>
                            <StyledTableCell align="center">
                              <Typography variant="body2" fontWeight="bold" color="primary.main">
                                {Math.round(profitData.periodsProfit.totalCompanyProfit || 0).toLocaleString('en-US')}
                              </Typography>
                            </StyledTableCell>
                          </StyledTableRow>
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Box>
                )}

                {/* Withdrawal History */}
                <Box sx={{ p: isSmallScreen ? 2 : 3 }}>
                  <Typography variant="h6" fontWeight="bold" mb={3}>
                    سجل السحوبات
                  </Typography>

                  {profitData?.data?.length === 0 ? (
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
                                الوصف
                              </StyledTableCell>
                              <StyledTableCell align="center" sx={{ fontWeight: 'bold' }}>
                                المبلغ
                              </StyledTableCell>
                            </StyledTableRow>
                          </TableHead>
                          <TableBody>
                            {profitData?.data?.map((withdrawal) => (
                              <StyledTableRow key={withdrawal.id} hover>
                                <StyledTableCell align="center">
                                  <Box>
                                    <Typography variant="body2" sx={{ fontWeight: 'medium', mb: 0.5 }}>
                                      {formatArabicDate(withdrawal.date)}
                                    </Typography>
                                    <Typography variant="caption" sx={{ color: 'primary.main', fontWeight: 'bold', fontSize: '0.75rem' }}>
                                      {withdrawal.hijriDate}
                                    </Typography>
                                  </Box>
                                </StyledTableCell>
                                <StyledTableCell align="center">
                                  <Typography variant="body2">
                                    {withdrawal.description}
                                  </Typography>
                                </StyledTableCell>
                                <StyledTableCell align="center" sx={{ fontWeight: 'bold' }}>
                                  <Typography variant="body2" fontWeight="bold" color="error.main">
                                    {Math.round(withdrawal.amount).toLocaleString('en-US')}
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
            <Typography variant="body1" color="text.secondary" mb={2} fontWeight="bold">
              الرصيد المتاح: {Math.round(profitData?.availableAmount || 0).toLocaleString('en-US')}
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
            sx={{
              '&:hover': {
                bgcolor: 'primary.main',
                color: 'white',
                borderColor: 'primary.main'
              },
            }}
          >
            {isWithdrawing ? <CircularProgress size={20} /> : 'سحب'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
