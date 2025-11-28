import React, { useState } from "react";
import {
  Box,
  Grid,
  Typography,
  Paper,
  Tabs,
  Tab,
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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  useMediaQuery,
  Stack,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Pagination,
} from "@mui/material";
import {
  AccountBalance,
  TrendingUp,
  TrendingDown,
  Warning,
  Download,
  Print,
  Share,
  PictureAsPdf,
  TableChart,
  CheckCircle,
} from "@mui/icons-material";
import { useQuery } from "@tanstack/react-query";
import { Helmet } from "react-helmet-async";
import Api from "../../config/Api";
import dayjs from "dayjs";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
  ComposedChart,
} from "recharts";
import { StyledTableCell, StyledTableRow } from '../../components/layouts/tableLayout';
import { exportJournalsToPDF, exportJournalsToExcel } from '../../utilities/treasuryJournalsExporter';
import { notifySuccess, notifyError } from '../../utilities/toastify';


const getBankAccountData = async (month = null) => {
  const params = new URLSearchParams();
  if (month) {
    params.append('month', month);
  }

  const queryString = params.toString();
  const response = await Api.get(`/api/accounts/bank${queryString ? `?${queryString}` : ''}`);
  return response.data;
};



const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export default function Treasury() {
  const [tab, setTab] = useState(0);
  const [isExporting, setIsExporting] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState('');


  const isMobile = useMediaQuery("(max-width: 480px)");
  const isTablet = useMediaQuery("(max-width: 768px)");
  const isSmallScreen = isMobile || isTablet;

  const { data: bankData, isLoading, error } = useQuery({
    queryKey: ["bank-account", selectedMonth],
    queryFn: () => getBankAccountData(selectedMonth),
    retry: 1,
  });


  const handleTabChange = (event, newValue) => {
    setTab(newValue);
  };

  const handleMonthChange = (event) => {
    setSelectedMonth(event.target.value);
  };

  const handleExportPDF = async () => {
    if (!bankData) return;
    
    setIsExporting(true);
    try {
      await exportJournalsToPDF(bankData, 'النقد في البنك');
      notifySuccess('تم تصدير PDF بنجاح');
    } catch (error) {
      console.error('PDF Export Error:', error);
      notifyError('حدث خطأ أثناء تصدير PDF');
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportExcel = async () => {
    if (!bankData) return;

    setIsExporting(true);
    try {
      await exportJournalsToExcel(bankData, 'النقد في البنك');
      notifySuccess('تم تصدير Excel بنجاح');
    } catch (error) {
      console.error('Excel Export Error:', error);
      notifyError('حدث خطأ أثناء تصدير Excel');
    } finally {
      setIsExporting(false);
    }
  };


  const availableBalance = bankData?.account?.balance || 0;
  const totalDebit = bankData?.account?.debit || 0;
  const totalCredit = bankData?.account?.credit || 0;
  const totalTransactions = bankData?.totalJournalEntries || 0;
  
  // Repayments data
  const totalRepaymentsAmount = bankData?.repayments?.totalAmount || 0;
  const paidRepaymentsUntilNow = bankData?.repayments?.paidUntilNow || 0;
  const remainingRepayments = totalRepaymentsAmount - paidRepaymentsUntilNow;

  const lowBalanceThreshold = 10000;
  const highCreditThreshold = 50000;

  const hasLowBalance = availableBalance < lowBalanceThreshold;
  const hasHighCredit = totalCredit > highCreditThreshold;

  const monthlyBalanceData = bankData?.journalsByMonth ? 
    Object.entries(bankData.journalsByMonth)
      .map(([month, data]) => ({
        name: getMonthName(month),
        monthKey: month,
        الرصيد: data.totalBalance,
        الوارد: data.totalDebit,
        المقرض: data.totalCredit,
      }))
      .sort((a, b) => a.monthKey.localeCompare(b.monthKey)) : [];

  const transactionTypeData = [
    { name: 'الوارد', value: totalDebit, color: '#00C49F' },
    { name: 'المقرض', value: totalCredit, color: '#FF8042' },
  ];

  const currentJournals = selectedMonth && bankData?.journalsByMonth?.[selectedMonth] ? 
    bankData.journalsByMonth[selectedMonth].entries : 
    (bankData?.journalsByMonth ? 
      Object.values(bankData.journalsByMonth).flatMap(month => month.entries) : 
      []);

  const statusDistribution = [
    { name: 'مرحل', value: currentJournals.filter(j => j.status === 'POSTED').length || 0 },
    { name: 'مسودة', value: currentJournals.filter(j => j.status === 'DRAFT').length || 0 },
  ];

  const availableMonths = bankData?.journalsByMonth ? 
    Object.keys(bankData.journalsByMonth).sort().reverse() : [];

  const currentTotalTransactions = selectedMonth && bankData?.journalsByMonth?.[selectedMonth] ? 
    bankData.journalsByMonth[selectedMonth].entries.length : 
    totalTransactions;

  // حساب النسبة المئوية للرصيد المتاح
  const totalBalance = availableBalance + totalCredit;
  const balancePercentage = totalBalance > 0 ? (availableBalance / totalBalance) * 100 : 0;
  const circumference = 2 * Math.PI * 45; // نصف القطر 45
  const strokeDasharray = `${(balancePercentage / 100) * circumference} ${circumference}`;

  function getMonthName(monthKey) {
    const [year, month] = monthKey.split('-');
    const monthNames = [
      'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
      'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
    ];
    return `${monthNames[parseInt(month) - 1]} ${year}`;
  }

  // Render mobile journal cards
  const renderMobileJournalCards = () => (
    <Stack spacing={2} sx={{ p: 2 }}>
      {currentJournals.map((journal) => (
        <Card key={journal.id} variant="outlined" sx={{ borderRadius: 2 }}>
          <CardContent sx={{ p: 2 }}>
            <Stack spacing={1.5}>
              {/* Header */}
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                }}
              >
                <Box>
                  <Typography variant="subtitle2" fontWeight="bold" color="primary">
                    {journal.reference}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
                    {dayjs(journal.date).format('DD/MM/YYYY')}
                  </Typography>
                </Box>
                <Chip 
                  label={journal.status === 'POSTED' ? 'مرحل' : 'مسودة'} 
                  size="small"
                  color={journal.status === 'POSTED' ? 'success' : 'default'}
                  variant="outlined"
                  sx={{ 
                    fontWeight: 'bold',
                    fontSize: '0.7rem'
                  }}
                />
              </Box>

              {/* Description */}
              <Box>
                <Typography variant="body2" fontWeight="medium" sx={{ mb: 0.5 }}>
                  {journal.description}
                </Typography>
                {journal.postedBy && (
                  <Typography variant="caption" color="text.secondary">
                    بواسطة: {journal.postedBy}
                  </Typography>
                )}
              </Box>

              {/* Journal Details */}
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Typography variant="caption" color="text.secondary">
                    مدين
                  </Typography>
                  <Typography 
                    variant="body2" 
                    fontWeight="bold"
                    color={journal.debit > 0 ? "success.main" : "text.secondary"}
                  >
                    {journal.debit > 0 ? journal.debit.toLocaleString('en-US') : '0'}
                  </Typography>
                </Box>

                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Typography variant="caption" color="text.secondary">
                    دائن
                  </Typography>
                  <Typography 
                    variant="body2" 
                    fontWeight="bold"
                    color={journal.credit > 0 ? "error.main" : "text.secondary"}
                  >
                    {journal.credit > 0 ? journal.credit.toLocaleString('en-US') : '0'}
                  </Typography>
                </Box>

                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Typography variant="caption" color="text.secondary">
                    الرصيد
                  </Typography>
                  <Typography 
                    variant="body2" 
                    fontWeight="bold"
                    color={journal.balance >= 0 ? 'success.main' : 'error.main'}
                  >
                    {journal.balance.toLocaleString('en-US')}
                  </Typography>
                </Box>
              </Box>
            </Stack>
          </CardContent>
        </Card>
      ))}
    </Stack>
  );

  // Render desktop table
  const renderDesktopJournalTable = () => (
    <TableContainer>
      <Table>
        <TableHead>
          <StyledTableRow>
            <StyledTableCell align="center" sx={{ fontWeight: 'bold', width: '120px' }}>
              التاريخ
            </StyledTableCell>
            <StyledTableCell align="center" sx={{ fontWeight: 'bold', width: '200px' }}>
              المرجع
            </StyledTableCell>
            <StyledTableCell align="center" sx={{ fontWeight: 'bold', minWidth: '200px' }}>
              الوصف
            </StyledTableCell>
            <StyledTableCell align="center" sx={{ fontWeight: 'bold', width: '100px' }}>
              مدين
            </StyledTableCell>
            <StyledTableCell align="center" sx={{ fontWeight: 'bold', width: '100px' }}>
              دائن
            </StyledTableCell>
            <StyledTableCell align="center" sx={{ fontWeight: 'bold', width: '120px' }}>
              الرصيد
            </StyledTableCell>
            <StyledTableCell align="center" sx={{ fontWeight: 'bold', width: '100px' }}>
              الحالة
            </StyledTableCell>
          </StyledTableRow>
        </TableHead>
        <TableBody>
          {currentJournals.map((journal) => (
            <StyledTableRow key={journal.id} hover>
              <StyledTableCell align="center">
                <Typography variant="body2">
                  {dayjs(journal.date).format('DD/MM/YYYY')}
                </Typography>
              </StyledTableCell>
              <StyledTableCell align="center" sx={{ width: '200px' }}>
                <Typography variant="body2" fontWeight="500" color="primary">
                  {journal.reference}
                </Typography>
              </StyledTableCell>
              <StyledTableCell align="center">
                <Typography variant="body2" sx={{ mb: 0.5 }}>
                  {journal.description}
                </Typography>
                {journal.postedBy && (
                  <Typography variant="caption" color="text.secondary">
                    بواسطة: {journal.postedBy}
                  </Typography>
                )}
              </StyledTableCell>
              <StyledTableCell align="center" sx={{ fontWeight: 'bold', width: '100px' }}>
                {journal.debit > 0 ? (
                  <Typography 
                    variant="body2" 
                    fontWeight="bold"
                    color="success.main"
                  >
                    {journal.debit.toLocaleString('en-US')}
                  </Typography>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    0
                  </Typography>
                )}
              </StyledTableCell>
              <StyledTableCell align="center" sx={{ fontWeight: 'bold', width: '100px' }}>
                {journal.credit > 0 ? (
                  <Typography 
                    variant="body2" 
                    fontWeight="bold"
                    color="error.main"
                  >
                    {journal.credit.toLocaleString('en-US')}
                  </Typography>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    0
                  </Typography>
                )}
              </StyledTableCell>
              <StyledTableCell align="center" sx={{ fontWeight: 'bold', width: '120px' }}>
                <Typography 
                  variant="body2" 
                  fontWeight="bold"
                  color={journal.balance >= 0 ? 'success.main' : 'error.main'}
                >
                  {journal.balance.toLocaleString('en-US')}
                </Typography>
              </StyledTableCell>
              <StyledTableCell align="center" sx={{ fontWeight: 'bold', width: '100px' }}>
                <Chip 
                  label={journal.status === 'POSTED' ? 'مرحل' : 'مسودة'} 
                  size="small"
                  color={journal.status === 'POSTED' ? 'success' : 'default'}
                  variant="outlined"
                  sx={{ 
                    fontWeight: 'bold',
                    fontSize: '0.75rem'
                  }}
                />
              </StyledTableCell>
            </StyledTableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">
          حدث خطأ في تحميل بيانات الصندوق: {error.message}
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: "100vh" }}>
      <Helmet>
        <title>الصندوق</title>
        <meta name="description" content="إدارة الصندوق والنقدية" />
      </Helmet>

      <Box sx={{ p: isSmallScreen ? 2 : 3, mb: 3 }}>
        <Tabs
          value={tab}
          onChange={handleTabChange}
          textColor="primary"
          sx={{
            px: isSmallScreen ? 1 : 2,
            '& .MuiTab-root': {
              fontWeight: '600',
              fontSize: isSmallScreen ? '0.8rem' : '0.95rem',
              py: isSmallScreen ? 1 : 2,
              minHeight: isSmallScreen ? '48px' : '60px'
            }
          }}
        >
          <Tab
            label="إحصائيات الصندوق"
            icon={<TrendingUp />}
            iconPosition="start"
          />
          <Tab
            label="سجل القيود"
            icon={<AccountBalance />}
            iconPosition="start"
          />
        </Tabs>

        <Box sx={{ mt: isSmallScreen ? 2 : 4 }}>
          {isLoading ? (
            <Box sx={{ display: "flex", justifyContent: "center", p: 6 }}>
              <CircularProgress size={60} />
            </Box>
          ) : (
            <>
              {tab === 0 && (
                <Box>
                  <Box sx={{ 
                    display: 'flex', 
                    flexWrap: 'wrap', 
                    gap: isSmallScreen ? 2 : 3, 
                    mb: isSmallScreen ? 2 : 4,
                    justifyContent: 'center',
                    alignItems: 'stretch'
                  }}>
                    <Box sx={{ flex: isSmallScreen ? '1 1 100%' : '1 1 200px', minWidth: isSmallScreen ? '100%' : '200px', maxWidth: '100%' }}>
                      <Card sx={{ borderRadius: 2, boxShadow: '0 2px 12px rgba(0,0,0,0.1)', height: '100%' }}>
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
                                {availableBalance.toLocaleString('en-US')}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                الرصيد المتاح
                              </Typography>
                            </Box>
                          </Box>
                          <Chip 
                            label="متاح" 
                            size="small" 
                            color="primary"
                            variant="outlined"
                          />
                        </CardContent>
                      </Card>
                    </Box>

                    <Box sx={{ flex: '1 1 200px', minWidth: '200px', maxWidth: '100%' }}>
                      <Card sx={{ borderRadius: 2, boxShadow: '0 2px 12px rgba(0,0,0,0.1)', height: '100%' }}>
                        <CardContent sx={{ p: isSmallScreen ? 2 : 3 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                            <Box sx={{ 
                              p: 1, 
                              borderRadius: 2, 
                              mr: 2 
                            }}>
                              <TrendingUp sx={{ color: "#2e7d32", fontSize: 24 }} />
                            </Box>
                            <Box>
                              <Typography variant={isSmallScreen ? "h5" : "h4"} fontWeight="bold" color="success.main">
                                {totalDebit.toLocaleString('en-US')}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                إجمالي الوارد
                              </Typography>
                            </Box>
                          </Box>
                          <Chip 
                            label="وارد" 
                            size="small" 
                            color="success"
                            variant="outlined"
                          />
                        </CardContent>
                      </Card>
                    </Box>

                    <Box sx={{ flex: '1 1 200px', minWidth: '200px', maxWidth: '100%' }}>
                      <Card sx={{ borderRadius: 2, boxShadow: '0 2px 12px rgba(0,0,0,0.1)', height: '100%' }}>
                        <CardContent sx={{ p: isSmallScreen ? 2 : 3 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                            <Box sx={{ 
                              p: 1, 
                              borderRadius: 2, 
                              mr: 2 
                            }}>
                              <AccountBalance sx={{ color: "#ef6c00", fontSize: 24 }} />
                            </Box>
                            <Box>
                              <Typography variant={isSmallScreen ? "h5" : "h4"} fontWeight="bold" color="warning.main">
                                {currentTotalTransactions}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                إجمالي المعاملات
                              </Typography>
                            </Box>
                          </Box>
                          <Chip 
                            label="قيود" 
                            size="small" 
                            color="warning"
                            variant="outlined"
                          />
                        </CardContent>
                      </Card>
                    </Box>

                    <Box sx={{ flex: '1 1 200px', minWidth: '200px', maxWidth: '100%' }}>
                      <Card sx={{ borderRadius: 2, boxShadow: '0 2px 12px rgba(0,0,0,0.1)', height: '100%' }}>
                        <CardContent sx={{ p: isSmallScreen ? 2 : 3 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                            <Box sx={{ 
                              p: 1, 
                              borderRadius: 2, 
                              mr: 2 
                            }}>
                              <TrendingUp sx={{ color: "#9c27b0", fontSize: 24 }} />
                            </Box>
                            <Box>
                              <Typography variant={isSmallScreen ? "h5" : "h4"} fontWeight="bold" sx={{ color: "#9c27b0" }}>
                                {totalRepaymentsAmount.toLocaleString('en-US')}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                              إجمالي المطلوب تحصيله
                              </Typography>
                            </Box>
                          </Box>
                          <Chip 
                            label="مطلوب تحصيله" 
                            size="small" 
                            sx={{ 
                              bgcolor: "#9c27b0", 
                              color: "white",
                              '&:hover': { bgcolor: "#7b1fa2" }
                            }}
                            variant="filled"
                          />
                        </CardContent>
                      </Card>
                    </Box>

                    <Box sx={{ flex: '1 1 200px', minWidth: '200px', maxWidth: '100%' }}>
                      <Card sx={{ borderRadius: 2, boxShadow: '0 2px 12px rgba(0,0,0,0.1)', height: '100%' }}>
                        <CardContent sx={{ p: isSmallScreen ? 2 : 3 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                            <Box sx={{ 
                              p: 1, 
                              borderRadius: 2, 
                              mr: 2 
                            }}>
                              <CheckCircle sx={{ color: "#00C49F", fontSize: 24 }} />
                            </Box>
                            <Box>
                              <Typography variant={isSmallScreen ? "h5" : "h4"} fontWeight="bold" color="success.main">
                                {paidRepaymentsUntilNow.toLocaleString('en-US')}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                الواصل من المطلوب تحصيله حتى الآن
                              </Typography>
                            </Box>
                          </Box>
                          <Chip 
                            label="واصل" 
                            size="small" 
                            color="success"
                            variant="outlined"
                          />
                        </CardContent>
                      </Card>
                    </Box>
                  </Box>

                  {/* التصفية والملاحظات */}
                  {availableMonths.length > 0 && (
                    <Paper sx={{ p: 2, mb: 3, borderRadius: 2, boxShadow: '0 2px 12px rgba(0,0,0,0.1)' }}>
                      <Grid container spacing={2} alignItems="center">
                        <Grid item xs={12} md={2}>
                          <Typography variant="body2" color="text.secondary">
                            {selectedMonth ? `عرض بيانات ${getMonthName(selectedMonth)}` : 'عرض جميع البيانات'}
                          </Typography>
                        </Grid>
                        <Grid item xs={12} md={8}>
                          <FormControl fullWidth size="small">
                            <InputLabel>تصفية حسب الشهر</InputLabel>
                            <Select
                              value={selectedMonth}
                              onChange={handleMonthChange}
                              label="تصفية حسب الشهر"
                              sx={{ minWidth: 200 }}
                            >
                              <MenuItem value="">جميع الأشهر</MenuItem>
                              {availableMonths.map(month => (
                                <MenuItem key={month} value={month}>
                                  {getMonthName(month)}
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        </Grid>
                      </Grid>
                    </Paper>
                  )}

                  {(hasLowBalance || hasHighCredit) && (
                    <Box sx={{ mb: 3 }}>
                      {hasLowBalance && (
                        <Alert 
                          severity="warning" 
                          icon={<Warning />}
                          sx={{ mb: 1, borderRadius: 2 }}
                        >
                          <Typography variant="body1" fontWeight="bold">
                            تنبيه: رصيد الصندوق منخفض
                          </Typography>
                          <Typography variant="body2">
                            الرصيد الحالي ({availableBalance.toLocaleString('en-US')} ريال) أقل من الحد الأدنى المطلوب ({lowBalanceThreshold.toLocaleString('en-US')} ريال)
                          </Typography>
                        </Alert>
                      )}
                      {hasHighCredit && (
                        <Alert 
                          severity="info"
                          sx={{ mb: 1, borderRadius: 2 }}
                        >
                          <Typography variant="body1" fontWeight="bold">
                            ملاحظة: المبالغ المقترضة مرتفعة
                          </Typography>
                          <Typography variant="body2">
                            إجمالي المقر ض ({totalCredit.toLocaleString('en-US')} ريال) تجاوز الحد المسموح ({highCreditThreshold.toLocaleString('en-US')} ريال)
                          </Typography>
                        </Alert>
                      )}
                    </Box>
                  )}

                  {/* رسمة رصيد الصندوق الدائرية */}
                  <Grid container spacing={3} sx={{ mb: 4 }}>
                    <Grid item xs={12}>
                      <Paper sx={{ 
                        p: isSmallScreen ? 2 : 3, 
                        borderRadius: 2, 
                        boxShadow: '0 2px 12px rgba(0,0,0,0.1)',
                        width: isSmallScreen ? '100%' : 'calc(100vw - 240px)',
                      }}>
                        <Typography 
                          variant="h6" 
                          fontWeight="bold" 
                          color="text.primary"
                          sx={{ mb: 3 }}
                        >
                          رصيد الصندوق
                        </Typography>
                        
                        <Box sx={{ 
                          display: 'flex',
                          flexDirection: isSmallScreen ? 'column' : 'row',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: isSmallScreen ? 3 : 6,
                          flexWrap: 'wrap'
                        }}>
                          {/* الدائرة الدائرية */}
                          <Box sx={{ 
                            position: 'relative', 
                            width: isSmallScreen ? 150 : 200, 
                            height: isSmallScreen ? 150 : 200,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0
                          }}>
                            <svg 
                              width={isSmallScreen ? "150" : "200"} 
                              height={isSmallScreen ? "150" : "200"} 
                              viewBox="0 0 100 100"
                              style={{ transform: 'rotate(-90deg)' }}
                            >
                              {/* دائرة الخلفية */}
                              <circle
                                cx="50"
                                cy="50"
                                r="45"
                                fill="transparent"
                                stroke="#E5E7EB"
                                strokeWidth="10"
                              />
                              {/* دائرة الرصيد المتاح */}
                              <circle
                                cx="50"
                                cy="50"
                                r="45"
                                fill="transparent"
                                stroke="#1976d2"
                                strokeWidth="10"
                                strokeDasharray={strokeDasharray}
                                strokeLinecap="round"
                                style={{ transition: 'stroke-dasharray 0.5s ease' }}
                              />
                            </svg>
                            
                            {/* النص في المنتصف */}
                            <Box sx={{
                              position: 'absolute',
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}>
                              <Typography 
                                variant={isSmallScreen ? "h5" : "h4"} 
                                fontWeight="bold" 
                                color="primary"
                                sx={{ mb: 0.5 }}
                              >
                                {availableBalance >= 1000000 
                                  ? `${(availableBalance / 1000000).toFixed(1)}م`
                                  : availableBalance >= 1000
                                  ? `${(availableBalance / 1000).toFixed(0)} ألف`
                                  : availableBalance.toLocaleString('en-US')
                                }
                              </Typography>
                              <Typography 
                                variant="body2" 
                                color="text.secondary"
                              >
                                ريال سعودي
                              </Typography>
                            </Box>
                          </Box>

                          {/* إحصائيات المقرض والمتاح */}
                          <Box sx={{ 
                            display: 'flex', 
                            flexDirection: isSmallScreen ? 'row' : 'row',
                            gap: isSmallScreen ? 3 : 6,
                            flex: 1,
                            justifyContent: 'center',
                            flexWrap: 'wrap'
                          }}>
                            <Box sx={{ textAlign: 'center', minWidth: 150 }}>
                              <Box sx={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                gap: 1,
                                justifyContent: 'center',
                                mb: 1
                              }}>
                                <Box 
                                  sx={{ 
                                    width: 12, 
                                    height: 12, 
                                    borderRadius: '50%', 
                                    bgcolor: 'error.main' 
                                  }} 
                                />
                                <Typography variant="body1" fontWeight="medium" color="text.primary">
                                  مُقرض
                                </Typography>
                              </Box>
                              <Typography 
                                variant="h6" 
                                fontWeight="semibold" 
                                color="text.secondary"
                              >
                                {totalCredit >= 1000000 
                                  ? `${(totalCredit / 1000000).toFixed(1)}م ر.س`
                                  : totalCredit >= 1000
                                  ? `${(totalCredit / 1000).toFixed(0)} ألف ر.س`
                                  : `${totalCredit.toLocaleString('en-US')} ر.س`
                                }
                              </Typography>
                            </Box>
                            
                            <Box sx={{ textAlign: 'center', minWidth: 150 }}>
                              <Box sx={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                gap: 1,
                                justifyContent: 'center',
                                mb: 1
                              }}>
                                <Box 
                                  sx={{ 
                                    width: 12, 
                                    height: 12, 
                                    borderRadius: '50%', 
                                    bgcolor: 'grey.300' 
                                  }} 
                                />
                                <Typography variant="body1" fontWeight="medium" color="text.primary">
                                  متاح
                                </Typography>
                              </Box>
                              <Typography 
                                variant="h6" 
                                fontWeight="semibold" 
                                color="text.secondary"
                              >
                                {availableBalance >= 1000000 
                                  ? `${(availableBalance / 1000000).toFixed(1)}م ر.س`
                                  : availableBalance >= 1000
                                  ? `${(availableBalance / 1000).toFixed(0)} ألف ر.س`
                                  : `${availableBalance.toLocaleString('en-US')} ر.س`
                                }
                              </Typography>
                            </Box>
                          </Box>
                        </Box>
                      </Paper>
                    </Grid>
                  </Grid>

                  {/* رسمة Area Chart المكدسة لتطور الوارد والمقرض والرصيد */}
                  {monthlyBalanceData.length > 0 && (
                    <Grid container spacing={3} sx={{ mb: 3 }}>
                      <Grid item xs={12}>
                        <Paper sx={{ 
                          p: isSmallScreen ? 2 : 3, 
                          borderRadius: 2, 
                          boxShadow: '0 2px 12px rgba(0,0,0,0.1)',
                          width: isSmallScreen ? '100%' : 'calc(100vw - 240px)',
                        }}>
                          <Typography variant="h6" fontWeight="bold" mb={3}>
                            تطور الوارد والمقرض والرصيد
                          </Typography>
                          <ResponsiveContainer width="100%" height={isSmallScreen ? 300 : 400}>
                            <ComposedChart data={monthlyBalanceData}>
                              <defs>
                                <linearGradient id="colorDebit" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor="#00C49F" stopOpacity={0.8}/>
                                  <stop offset="95%" stopColor="#00C49F" stopOpacity={0.1}/>
                                </linearGradient>
                                <linearGradient id="colorCredit" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor="#FF8042" stopOpacity={0.8}/>
                                  <stop offset="95%" stopColor="#FF8042" stopOpacity={0.1}/>
                                </linearGradient>
                              </defs>
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="name" />
                              <YAxis />
                              <Tooltip 
                                formatter={(value, name) => [`${value.toLocaleString('en-US')} ريال`, name]} 
                                contentStyle={{ borderRadius: '8px' }}
                              />
                              <Legend />
                              <Area 
                                type="monotone" 
                                dataKey="الوارد" 
                                stackId="1"
                                stroke="#00C49F" 
                                fill="url(#colorDebit)" 
                                name="الوارد"
                                strokeWidth={2}
                              />
                              <Area 
                                type="monotone" 
                                dataKey="المقرض" 
                                stackId="1"
                                stroke="#FF8042" 
                                fill="url(#colorCredit)" 
                                name="المقرض"
                                strokeWidth={2}
                              />
                              <Line 
                                type="monotone" 
                                dataKey="الرصيد" 
                                stroke="#1976d2" 
                                strokeWidth={3}
                                name="الرصيد"
                                dot={{ fill: '#1976d2', r: 5 }}
                                activeDot={{ r: 7 }}
                              />
                            </ComposedChart>
                          </ResponsiveContainer>
                        </Paper>
                      </Grid>
                    </Grid>
                  )}

                  {/* رسمة Pie Chart لتوزيع المعاملات */}
                  <Box sx={{ mb: 3 }}>
                    <Paper sx={{ 
                      p: isSmallScreen ? 2 : 3, 
                      borderRadius: 2, 
                      boxShadow: '0 2px 12px rgba(0,0,0,0.1)',
                      width: isSmallScreen ? '100%' : 'calc(100vw - 240px)',
                    }}>
                      <Typography variant="h6" fontWeight="bold" mb={3}>
                        توزيع المعاملات
                      </Typography>
                      <ResponsiveContainer width="100%" height={isSmallScreen ? 300 : 400}>
                        <PieChart>
                          <Pie
                            data={transactionTypeData}
                            cx="50%"
                            cy="50%"
                            outerRadius={120}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            {transactionTypeData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value, name) => [`${value.toLocaleString('en-US')} ريال`, name]} />
                          <Legend 
                            verticalAlign="bottom" 
                            height={36}
                            formatter={(value, entry) => `${value}: ${entry.payload.value.toLocaleString('en-US')} ريال`}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </Paper>
                  </Box>

                  <Box sx={{ mb: 4 }}>
                    <Paper sx={{ 
                      p: isSmallScreen ? 2 : 3, 
                      borderRadius: 2, 
                      boxShadow: '0 2px 12px rgba(0,0,0,0.1)',
                      width: isSmallScreen ? '100%' : 'calc(100vw - 240px)',
                    }}>
                      <Typography variant="h6" fontWeight="bold" mb={3}>
                        توزيع حالات القيود
                      </Typography>
                      <ResponsiveContainer width="100%" height={isSmallScreen ? 300 : 400}>
                        <PieChart>
                          <Pie
                            data={statusDistribution}
                            cx="50%"
                            cy="50%"
                            outerRadius={120}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            {statusDistribution.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value, name) => [`${value} قيد`, name]} />
                          <Legend 
                            verticalAlign="bottom" 
                            height={36}
                            formatter={(value, entry) => `${value}: ${entry.payload.value} قيد`}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </Paper>
                  </Box>

                  {/* Repayments Chart */}
                  {totalRepaymentsAmount > 0 && (
                    <Box sx={{ mb: 4 }}>
                      <Paper sx={{ 
                        p: isSmallScreen ? 2 : 3, 
                        borderRadius: 2, 
                        boxShadow: '0 2px 12px rgba(0,0,0,0.1)',
                        width: isSmallScreen ? '100%' : 'calc(100vw - 240px)',
                      }}>
                        <Typography variant="h6" fontWeight="bold" mb={3}>
                          توزيع التحصيل المقترض
                        </Typography>
                        <ResponsiveContainer width="100%" height={isSmallScreen ? 300 : 400}>
                          <BarChart
                            data={[
                              {
                                name: 'الواصل حتى الآن',
                                value: paidRepaymentsUntilNow,
                                color: '#00C49F'
                              },
                              {
                                name: 'المتبقي',
                                value: remainingRepayments,
                                color: '#FF8042'
                              },
                              {
                                name: 'الإجمالي',
                                value: totalRepaymentsAmount,
                                color: '#9c27b0'
                              }
                            ]}
                            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis 
                              dataKey="name" 
                              tick={{ fill: '#666', fontSize: 14 }}
                            />
                            <YAxis 
                              tick={{ fill: '#666', fontSize: 14 }}
                              tickFormatter={(value) => `${value.toLocaleString('en-US')}`}
                            />
                            <Tooltip 
                              formatter={(value, name) => [`${value.toLocaleString('en-US')} ريال`, name]} 
                              contentStyle={{ 
                                borderRadius: '8px',
                                border: '1px solid #e0e0e0'
                              }}
                            />
                            <Legend 
                              verticalAlign="top"
                              height={36}
                            />
                            <Bar 
                              dataKey="value" 
                              name="المبلغ"
                              radius={[8, 8, 0, 0]}
                            >
                              {[
                                { name: 'الواصل حتى الآن', value: paidRepaymentsUntilNow, color: '#00C49F' },
                                { name: 'المتبقي', value: remainingRepayments, color: '#FF8042' },
                                { name: 'الإجمالي', value: totalRepaymentsAmount, color: '#9c27b0' }
                              ].map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                              ))}
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      </Paper>
                    </Box>
                  )}
                </Box>
              )}

              {tab === 1 && (
                <Box>
                  <Paper sx={{ borderRadius: 2, boxShadow: '0 2px 12px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
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
                        <Typography variant={isSmallScreen ? "subtitle1" : "h6"} fontWeight="bold" color="primary">
                          سجل القيود المحاسبية
                        </Typography>
                        {selectedMonth && (
                          <Typography variant="body2" color="text.secondary">
                            عرض بيانات شهر {getMonthName(selectedMonth)}
                          </Typography>
                        )}
                      </Box>
                      
                      <Box sx={{ 
                        display: 'flex', 
                        flexDirection: isSmallScreen ? 'column' : 'row',
                        alignItems: isSmallScreen ? 'stretch' : 'center', 
                        gap: 2,
                        width: isSmallScreen ? '100%' : 'auto'
                      }}>
                        <FormControl size="small" sx={{ minWidth: isSmallScreen ? '100%' : 250 }}>
                          <InputLabel>الشهر</InputLabel>
                          <Select
                            value={selectedMonth}
                            onChange={handleMonthChange}
                            label="الشهر"
                          >
                            <MenuItem value="">جميع الأشهر</MenuItem>
                            {availableMonths.map(month => (
                              <MenuItem key={month} value={month}>
                                {getMonthName(month)}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>

                        <Typography variant="body2" color="text.secondary" sx={{ alignSelf: isSmallScreen ? 'center' : 'auto' }}>
                          إجمالي {currentTotalTransactions} قيد
                        </Typography>
                        
                        <Box sx={{ display: 'flex', gap: 1, justifyContent: isSmallScreen ? 'center' : 'flex-start' }}>
                          <IconButton
                            onClick={handleExportPDF}
                            disabled={isExporting || currentJournals.length === 0}
                            size="small"
                            title="تصدير PDF"
                            sx={{
                              color: 'error.main',
                              '&:hover': { bgcolor: 'error.main', color: 'white' },
                              '&:disabled': { bgcolor: 'grey.200', color: 'grey.400' }
                            }}
                          >
                            {isExporting ? <CircularProgress size={16} /> : <PictureAsPdf fontSize="small" />}
                          </IconButton>
                          
                          <IconButton
                            onClick={handleExportExcel}
                            disabled={isExporting || currentJournals.length === 0}
                            size="small"
                            title="تصدير Excel"
                            sx={{
                              color: 'success.main',
                              '&:hover': { bgcolor: 'success.main', color: 'white' },
                              '&:disabled': { bgcolor: 'grey.200', color: 'grey.400' }
                            }}
                          >
                            {isExporting ? <CircularProgress size={16} /> : <TableChart fontSize="small" />}
                          </IconButton>
                        </Box>
                      </Box>
                    </Box>

                    {currentJournals.length === 0 ? (
                      <Box sx={{ textAlign: 'center', py: 6 }}>
                        <AccountBalance sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                        <Typography variant="h6" color="text.secondary" gutterBottom>
                          {selectedMonth ? `لا توجد قيود مسجلة لشهر ${getMonthName(selectedMonth)}` : 'لا توجد قيود مسجلة'}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          لم يتم تسجيل أي قيود محاسبية حتى الآن
                        </Typography>
                      </Box>
                    ) : (
                      <>
                        {isSmallScreen ? renderMobileJournalCards() : renderDesktopJournalTable()}
                      </>
                    )}
                  </Paper>
                </Box>
              )}

            </>
          )}
        </Box>
      </Box>
    </Box>
  );
}