import React, { useState, useEffect } from "react";
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
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  useMediaQuery,
  Stack,
  Button,
  Pagination,
} from "@mui/material";
import {
  AccountBalance,
  TrendingUp,
  TrendingDown,
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
  Area,
  ComposedChart,
} from "recharts";
import { StyledTableCell, StyledTableRow } from '../../components/layouts/tableLayout';
import { exportJournalsToPDF, exportJournalsToExcel, exportStatisticsToPDF, exportStatisticsToExcel } from '../../utilities/treasuryJournalsExporter';
import { notifySuccess, notifyError } from '../../utilities/toastify';
import { usePermissions } from '../../components/Contexts/PermissionsContext';
import { useCountUp } from '../../hooks/useCountUp';
import { useTheme } from '../../theme/ThemeContext';

const getBankAccountData = async (accountType = 'bank', month = null, page = 1, limit = 20) => {
  const params = new URLSearchParams();
  if (month) {
    params.append('month', month);
  }
  params.append('limit', limit.toString());

  const queryString = params.toString();
  const endpoint = accountType === 'capital' ? 'NewBank' : 'bank';
  const response = await Api.get(`/api/accounts/${endpoint}/${page}${queryString ? `?${queryString}` : ''}`);
  return response.data;
};

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export default function Treasury() {
  const [tab, setTab] = useState(0);
  const [isExporting, setIsExporting] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState('');
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const { isDarkMode } = useTheme();

  const isMobile = useMediaQuery("(max-width: 480px)");
  const isTablet = useMediaQuery("(max-width: 768px)");
  const isSmallScreen = isMobile || isTablet;

  const { permissions } = usePermissions();

  const { data: bankData, isLoading, error } = useQuery({
    queryKey: ["bank-account", tab, selectedMonth, page, limit],
    queryFn: () => getBankAccountData(tab === 1 ? 'capital' : 'bank', selectedMonth, page, limit),
    retry: 1,
    enabled: tab === 0 || tab === 1 || tab === 2,
  });

  // اكتشاف الوضع المظلم تلقائياً
  useEffect(() => {
    const prefersDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
    console.log('System prefers dark mode:', prefersDarkMode);
  }, []);

  // استخراج البيانات من response بشكل ديناميكي
  const currentData = bankData;
  
  // حساب القيم من البيانات المسترجعة فقط
  const availableBalance = currentData?.account?.balance || 0;
  const totalDebit = currentData?.account?.debit || 0;
  const totalCredit = currentData?.account?.credit || 0;
  const totalTransactions = currentData?.totalJournalEntries || 0;
  const loansBalance = currentData?.loansBalance || 0;
  const total = currentData?.total || 0;
  
  const totalRepaymentsAmount = currentData?.repayments?.totalAmount || 0;
  const paidRepaymentsUntilNow = currentData?.repayments?.paidUntilNow || 0;
  const remainingRepayments = totalRepaymentsAmount - paidRepaymentsUntilNow;
  const repaymentsProgress = totalRepaymentsAmount > 0
    ? Math.min(100, Math.max(0, (paidRepaymentsUntilNow / totalRepaymentsAmount) * 100))
    : 0;

  const currentMonthTotalAmount = currentData?.currentMonth?.totalAmount || 0;
  const currentMonthPaidUntilNow = currentData?.currentMonth?.paidUntilNow || 0;
  const currentMonthRemaining = currentMonthTotalAmount - currentMonthPaidUntilNow;
  const currentMonthProgress = currentMonthTotalAmount > 0
    ? Math.min(100, Math.max(0, (currentMonthPaidUntilNow / currentMonthTotalAmount) * 100))
    : 0;

  const animatedAvailableBalance = useCountUp(availableBalance, 600, !isLoading);
  const animatedTotalDebit = useCountUp(totalDebit, 600, !isLoading);
  const animatedTotalCredit = useCountUp(totalCredit, 600, !isLoading);
  const animatedLoansBalance = useCountUp(loansBalance, 600, !isLoading);
  const animatedTotal = useCountUp(total, 600, !isLoading);
  const animatedCurrentMonthTotal = useCountUp(currentMonthTotalAmount, 600, !isLoading);

  // الرسومات تظهر فقط في الصندوق العام (tab === 0)
  const monthlyBalanceData = tab === 0 && currentData?.journalsByMonth ?
    Object.entries(currentData.journalsByMonth)
      .map(([month, data]) => ({
        name: getMonthName(month),
        monthKey: month,
        الرصيد: data.totalBalance,
        الوارد: data.totalDebit,
        الصادر: data.totalCredit,
      }))
      .sort((a, b) => a.monthKey.localeCompare(b.monthKey)) : [];

  const transactionTypeData = tab === 0 ? [
    { name: 'الوارد', value: totalDebit, color: '#00C49F' },
    { name: 'الصادر', value: totalCredit, color: '#FF8042' },
  ] : [];

  // الحصول على القيود الحالية بناءً على الشهر المحدد
  const getCurrentJournals = () => {
    if (!currentData?.journalsByMonth) return [];
    
    if (selectedMonth && currentData.journalsByMonth[selectedMonth]) {
      return currentData.journalsByMonth[selectedMonth].entries;
    } else {
      // إذا لم يكن هناك شهر محدد، نرجع جميع القييدات من جميع الأشهر
      return Object.values(currentData.journalsByMonth)
        .flatMap(month => month.entries)
        .sort((a, b) => new Date(b.date) - new Date(a.date)); // ترتيب تنازلي حسب التاريخ
    }
  };

  const currentJournals = getCurrentJournals();

  const statusDistribution = tab === 0 && currentJournals.length > 0 ? [
    { name: 'مرحل', value: currentJournals.filter(j => j.status === 'POSTED').length || 0 },
    { name: 'مسودة', value: currentJournals.filter(j => j.status === 'DRAFT').length || 0 },
  ] : [];

  const pagination = currentData?.pagination || {
    page: 1,
    limit: limit,
    totalJournals: totalTransactions,
    totalPages: 1,
  };

  const availableMonths = currentData?.journalsByMonth ?
    Object.keys(currentData.journalsByMonth)
      .sort((a, b) => b.localeCompare(a)) // ترتيب تنازلي
      .filter(month => {
        const monthData = currentData.journalsByMonth[month];
        return monthData && monthData.entries && monthData.entries.length > 0;
      }) : [];

  const currentTotalTransactions = pagination.totalJournals || totalTransactions;

  const totalBalance = availableBalance + Math.abs(loansBalance);
  const balancePercentage = totalBalance > 0 ? (Math.abs(loansBalance) / totalBalance) * 100 : 0;
  const circumference = 2 * Math.PI * 45;
  const strokeDasharray = `${(balancePercentage / 100) * circumference} ${circumference}`;

  function getMonthName(monthKey) {
    try {
      const [year, month] = monthKey.split('-');
      const monthNames = [
        'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
        'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
      ];
      const monthIndex = parseInt(month) - 1;
      if (monthIndex >= 0 && monthIndex < 12) {
        return `${monthNames[monthIndex]} ${year}`;
      }
      return monthKey;
    } catch (error) {
      console.error('Error getting month name:', error);
      return monthKey;
    }
  }

  const handleTabChange = (event, newValue) => {
    setTab(newValue);
  };

  const handleMonthChange = (event) => {
    setSelectedMonth(event.target.value);
    setPage(1);
  };

  const handlePageChange = (event, newPage) => {
    setPage(newPage);
  };

  const handleExportPDF = async () => {
    if (!bankData) return;
    
    setIsExporting(true);
    try {
      await exportJournalsToPDF(bankData, 'النقد في الصندوق');
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
      await exportJournalsToExcel(bankData, 'النقد في الصندوق');
      notifySuccess('تم تصدير Excel بنجاح');
    } catch (error) {
      console.error('Excel Export Error:', error);
      notifyError('حدث خطأ أثناء تصدير Excel');
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportStatisticsPDF = async () => {
    if (!bankData) return;
    
    setIsExporting(true);
    try {
      await exportStatisticsToPDF(bankData, 'النقد في الصندوق');
      notifySuccess('تم تصدير إحصائيات PDF بنجاح');
    } catch (error) {
      console.error('Statistics PDF Export Error:', error);
      notifyError('حدث خطأ أثناء تصدير إحصائيات PDF');
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportStatisticsExcel = async () => {
    if (!bankData) return;

    setIsExporting(true);
    try {
      await exportStatisticsToExcel(bankData, 'النقد في الصندوق');
      notifySuccess('تم تصدير إحصائيات Excel بنجاح');
    } catch (error) {
      console.error('Statistics Excel Export Error:', error);
      notifyError('حدث خطأ أثناء تصدير إحصائيات Excel');
    } finally {
      setIsExporting(false);
    }
  };

  const renderMobileJournalCards = () => (
    <Stack spacing={2} sx={{ p: 2 }}>
      {currentJournals.map((journal) => (
        <Card 
          key={journal.id} 
          variant="outlined" 
          sx={{ 
            borderRadius: 2,
            bgcolor: isDarkMode ? '#2a2a2a' : 'background.paper',
            borderColor: isDarkMode ? '#424242' : '#e0e0e0'
          }}
        >
          <CardContent sx={{ p: 2 }}>
            <Stack spacing={1.5}>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <Box>
                  <Typography variant="subtitle2" fontWeight="bold" color="primary">
                    {journal.reference}
                  </Typography>
                  <Typography variant="caption" color={isDarkMode ? 'text.secondary' : 'text.secondary'} sx={{ mt: 0.5 }}>
                    {dayjs(journal.date).format('DD/MM/YYYY')}
                  </Typography>
                </Box>
                <Chip 
                  label={journal.status === 'POSTED' ? 'مرحل' : 'مسودة'} 
                  size="small"
                  color={journal.status === 'POSTED' ? 'success' : 'default'}
                  variant="outlined"
                  sx={{ fontWeight: 'bold', fontSize: '0.7rem' }}
                />
              </Box>

              <Box>
                <Typography variant="body2" fontWeight="medium" sx={{ mb: 0.5, color: isDarkMode ? 'text.primary' : 'text.primary' }}>
                  {journal.description}
                </Typography>
                {journal.postedBy && (
                  <Typography variant="caption" color={isDarkMode ? 'text.secondary' : 'text.secondary'}>
                    بواسطة: {journal.postedBy}
                  </Typography>
                )}
              </Box>

              <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Typography variant="caption" color={isDarkMode ? 'text.secondary' : 'text.secondary'}>
                    مدين
                  </Typography>
                  <Typography variant="body2" fontWeight="bold" color={journal.debit > 0 ? "success.main" : (isDarkMode ? 'text.secondary' : 'text.secondary')}>
                    {journal.debit > 0 ? journal.debit.toLocaleString('en-US') : '0'}
                  </Typography>
                </Box>

                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Typography variant="caption" color={isDarkMode ? 'text.secondary' : 'text.secondary'}>
                    دائن
                  </Typography>
                  <Typography variant="body2" fontWeight="bold" color={journal.credit > 0 ? "error.main" : (isDarkMode ? 'text.secondary' : 'text.secondary')}>
                    {journal.credit > 0 ? journal.credit.toLocaleString('en-US') : '0'}
                  </Typography>
                </Box>

                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Typography variant="caption" color={isDarkMode ? 'text.secondary' : 'text.secondary'}>
                    الرصيد
                  </Typography>
                  <Typography variant="body2" fontWeight="bold" color={journal.balance >= 0 ? 'success.main' : 'error.main'}>
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
                <Typography variant="body2" color={isDarkMode ? 'text.primary' : 'text.primary'}>
                  {dayjs(journal.date).format('DD/MM/YYYY')}
                </Typography>
              </StyledTableCell>
              <StyledTableCell align="center" sx={{ width: '200px' }}>
                <Typography variant="body2" fontWeight="500" color="primary">
                  {journal.reference}
                </Typography>
              </StyledTableCell>
              <StyledTableCell align="center">
                <Typography variant="body2" sx={{ mb: 0.5, color: isDarkMode ? 'text.primary' : 'text.primary' }}>
                  {journal.description}
                </Typography>
                {journal.postedBy && (
                  <Typography variant="caption" color={isDarkMode ? 'text.secondary' : 'text.secondary'}>
                    بواسطة: {journal.postedBy}
                  </Typography>
                )}
              </StyledTableCell>
              <StyledTableCell align="center" sx={{ fontWeight: 'bold', width: '100px' }}>
                {journal.debit > 0 ? (
                  <Typography variant="body2" fontWeight="bold" color="success.main">
                    {journal.debit.toLocaleString('en-US')}
                  </Typography>
                ) : (
                  <Typography variant="body2" color={isDarkMode ? 'text.secondary' : 'text.secondary'}>
                    0
                  </Typography>
                )}
              </StyledTableCell>
              <StyledTableCell align="center" sx={{ fontWeight: 'bold', width: '100px' }}>
                {journal.credit > 0 ? (
                  <Typography variant="body2" fontWeight="bold" color="error.main">
                    {journal.credit.toLocaleString('en-US')}
                  </Typography>
                ) : (
                  <Typography variant="body2" color={isDarkMode ? 'text.secondary' : 'text.secondary'}>
                    0
                  </Typography>
                )}
              </StyledTableCell>
              <StyledTableCell align="center" sx={{ fontWeight: 'bold', width: '120px' }}>
                <Typography variant="body2" fontWeight="bold" color={journal.balance >= 0 ? 'success.main' : 'error.main'}>
                  {journal.balance.toLocaleString('en-US')}
                </Typography>
              </StyledTableCell>
              <StyledTableCell align="center" sx={{ fontWeight: 'bold', width: '100px' }}>
                <Chip 
                  label={journal.status === 'POSTED' ? 'مرحل' : 'مسودة'} 
                  size="small"
                  color={journal.status === 'POSTED' ? 'success' : 'default'}
                  variant="outlined"
                  sx={{ fontWeight: 'bold', fontSize: '0.75rem' }}
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
    <Box sx={{ 
      minHeight: "100vh", 
      bgcolor: isDarkMode ? 'background.default' : 'background.default' 
    }}>
      <Helmet>
        <title>الصندوق</title>
        <meta name="description" content="إدارة الصندوق والنقدية" />
      </Helmet>

      <Box sx={{ p: isSmallScreen ? 2 : 3, mb: 3 }}>
        <Box sx={{ 
          display: 'flex', 
          flexDirection: isSmallScreen ? 'column' : 'row',
          alignItems: isSmallScreen ? 'stretch' : 'center',
          justifyContent: 'space-between',
          gap: isSmallScreen ? 2 : 0,
          mb: 2
        }}>
          <Tabs
            value={tab}
            onChange={handleTabChange}
            textColor="primary"
            sx={{
              flex: 1,
              px: isSmallScreen ? 1 : 2,
              '& .MuiTab-root': {
                fontWeight: '600',
                fontSize: isSmallScreen ? '0.8rem' : '0.95rem',
                py: isSmallScreen ? 1 : 2,
                minHeight: isSmallScreen ? '48px' : '60px',
              }
            }}
          >
            <Tab
              label="الصندوق العام"
              icon={<TrendingUp />}
              iconPosition="start"
              sx={{
                color: tab === 0 ? 'primary.main' : (isDarkMode ? 'text.secondary' : 'black'),
              }}
            />
            <Tab
              label="الصندوق الخاص (رؤوس الأموال الجديدة)"
              icon={<AccountBalance />}
              iconPosition="start"
              sx={{
                color: tab === 1 ? 'primary.main' : (isDarkMode ? 'text.secondary' : 'black'),
              }}
            />
            <Tab
              label="سجل القيود"
              icon={<AccountBalance />}
              iconPosition="start"
              sx={{
                color: tab === 2 ? 'primary.main' : (isDarkMode ? 'text.secondary' : 'black'),
              }}
            />
          </Tabs>

          {permissions.includes("treasury_Export") && (
            <Box sx={{ 
              display: 'flex', 
              gap: 1,
              alignItems: 'center',
              justifyContent: isSmallScreen ? 'center' : 'flex-end',
              flexShrink: 0
            }}>
              {(tab === 0 || tab === 1) ? (
                <>
                  <Button
                    variant="outlined"
                    startIcon={isExporting ? <CircularProgress size={16} /> : <PictureAsPdf sx={{marginLeft: '5px'}} />}
                    onClick={handleExportStatisticsPDF}
                    disabled={isExporting || !bankData}
                    size={isSmallScreen ? "small" : "medium"}
                    sx={{
                      color: 'error.main',
                      borderColor: 'error.main',
                    }}
                  >
                    {isSmallScreen ? 'PDF' : 'تصدير إحصائيات PDF'}
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={isExporting ? <CircularProgress size={16} /> : <TableChart sx={{marginLeft: '5px'}} />}
                    onClick={handleExportStatisticsExcel}
                    disabled={isExporting || !bankData}
                    size={isSmallScreen ? "small" : "medium"}
                    sx={{
                      color: 'success.main',
                      borderColor: 'success.main',
                    }}
                  >
                    {isSmallScreen ? 'Excel' : 'تصدير إحصائيات Excel'}
                  </Button>
                </>
              ) : tab === 2 ? (
                <>
                  <Button
                    variant="outlined"
                    startIcon={isExporting ? <CircularProgress size={16} /> : <PictureAsPdf sx={{marginLeft: '5px'}} />}
                    onClick={handleExportPDF}
                    disabled={isExporting || currentJournals.length === 0}
                    size={isSmallScreen ? "small" : "medium"}
                    sx={{
                      color: 'error.main',
                      borderColor: 'error.main',
                    }}
                  >
                    {isSmallScreen ? 'PDF' : 'تصدير PDF'}
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={isExporting ? <CircularProgress size={16} /> : <TableChart sx={{marginLeft: '5px'}} />}
                    onClick={handleExportExcel}
                    disabled={isExporting || currentJournals.length === 0}
                    size={isSmallScreen ? "small" : "medium"}
                    sx={{
                      color: 'success.main',
                      borderColor: 'success.main',
                    }}
                  >
                    {isSmallScreen ? 'Excel' : 'تصدير Excel'}
                  </Button>
                </>
              ) : null}
            </Box>
          )}
        </Box>

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
                    {/* البطاقات الإحصائية لـ tab 0 */}
                    <Box sx={{ flex: isSmallScreen ? '1 1 100%' : '1 1 200px', minWidth: isSmallScreen ? '100%' : '350px', maxWidth: '100%' }}>
                      <Card sx={{ 
                        borderRadius: 2, 
                        boxShadow: '0 2px 12px rgba(0,0,0,0.1)', 
                        height: '100%',
                        bgcolor: isDarkMode ? 'background.paper' : 'background.paper'
                      }}>
                        <CardContent sx={{ p: isSmallScreen ? 2 : 3 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                            <Box sx={{ p: 1, borderRadius: 2, mr: 2 }}>
                              <AccountBalance sx={{ color: "#1976d2", fontSize: 24 }} />
                            </Box>
                            <Box>
                              <Typography variant={isSmallScreen ? "h5" : "h4"} fontWeight="bold" color="primary">
                                {animatedAvailableBalance.toLocaleString('en-US')}
                              </Typography>
                              <Typography variant="body2" color={isDarkMode ? 'text.secondary' : 'text.secondary'}>
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

                    <Box sx={{ flex: '1 1 200px', minWidth: '350px', maxWidth: '100%' }}>
                      <Card sx={{ 
                        borderRadius: 2, 
                        boxShadow: '0 2px 12px rgba(0,0,0,0.1)', 
                        height: '100%',
                        bgcolor: isDarkMode ? 'background.paper' : 'background.paper'
                      }}>
                        <CardContent sx={{ p: isSmallScreen ? 2 : 3 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                            <Box sx={{ p: 1, borderRadius: 2, mr: 2 }}>
                              <TrendingUp sx={{ color: "#2e7d32", fontSize: 24 }} />
                            </Box>
                            <Box>
                              <Typography variant={isSmallScreen ? "h5" : "h4"} fontWeight="bold" color="success.main">
                                {animatedTotalDebit.toLocaleString('en-US')}
                              </Typography>
                              <Typography variant="body2" color={isDarkMode ? 'text.secondary' : 'text.secondary'}>
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

                    <Box sx={{ flex: '1 1 200px', minWidth: '350px', maxWidth: '100%' }}>
                      <Card sx={{ 
                        borderRadius: 2, 
                        boxShadow: '0 2px 12px rgba(0,0,0,0.1)', 
                        height: '100%',
                        bgcolor: isDarkMode ? 'background.paper' : 'background.paper'
                      }}>
                        <CardContent sx={{ p: isSmallScreen ? 2 : 3 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                            <Box sx={{ p: 1, borderRadius: 2, mr: 2 }}>
                              <TrendingDown sx={{ color: "#d32f2f", fontSize: 24 }} />
                            </Box>
                            <Box>
                              <Typography variant={isSmallScreen ? "h5" : "h4"} fontWeight="bold" color="error.main">
                                {animatedTotalCredit.toLocaleString('en-US')}
                              </Typography>
                              <Typography variant="body2" color={isDarkMode ? 'text.secondary' : 'text.secondary'}>
                                إجمالي الصادر
                              </Typography>
                            </Box>
                          </Box>
                          <Chip
                            label="صادر"
                            size="small"
                            color="error"
                            variant="outlined"
                          />
                        </CardContent>
                      </Card>
                    </Box>

                    <Box sx={{ flex: '1 1 200px', minWidth: '350px', maxWidth: '100%' }}>
                      <Card sx={{ 
                        borderRadius: 2, 
                        boxShadow: '0 2px 12px rgba(0,0,0,0.1)', 
                        height: '100%',
                        bgcolor: isDarkMode ? 'background.paper' : 'background.paper'
                      }}>
                        <CardContent sx={{ p: isSmallScreen ? 2 : 3 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                            <Box sx={{ p: 1, borderRadius: 2, mr: 2 }}>
                              <AccountBalance sx={{ color: "#1976d2", fontSize: 24 }} />
                            </Box>
                            <Box>
                              <Typography variant={isSmallScreen ? "h5" : "h4"} fontWeight="bold" color="primary">
                                {animatedLoansBalance.toLocaleString('en-US')}
                              </Typography>
                              <Typography variant="body2" color={isDarkMode ? 'text.secondary' : 'text.secondary'}>
                                الرصيد في السوق
                              </Typography>
                            </Box>
                          </Box>
                          <Chip
                            label="في السوق"
                            size="small"
                            color="primary"
                            variant="outlined"
                          />
                        </CardContent>
                      </Card>
                    </Box>

                    <Box sx={{ flex: '1 1 200px', minWidth: '350px', maxWidth: '100%' }}>
                      <Card sx={{ 
                        borderRadius: 2, 
                        boxShadow: '0 2px 12px rgba(0,0,0,0.1)', 
                        height: '100%',
                        bgcolor: isDarkMode ? 'background.paper' : 'background.paper'
                      }}>
                        <CardContent sx={{ p: isSmallScreen ? 2 : 3 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                            <Box sx={{ p: 1, borderRadius: 2, mr: 2 }}>
                              <AccountBalance sx={{ color: "#9c27b0", fontSize: 24 }} />
                            </Box>
                            <Box>
                              <Typography variant={isSmallScreen ? "h5" : "h4"} fontWeight="bold" sx={{ color: "#9c27b0" }}>
                                {animatedTotal.toLocaleString('en-US')}
                              </Typography>
                              <Typography variant="body2" color={isDarkMode ? 'text.secondary' : 'text.secondary'}>
                                الإجمالي (المتاح + في السوق)
                              </Typography>
                            </Box>
                          </Box>
                          <Chip
                            label="إجمالي"
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

                    {totalRepaymentsAmount > 0 && (
                      <Box sx={{ flex: '1 1 200px', minWidth: '350px', maxWidth: '100%' }}>
                        <Card sx={{ 
                          borderRadius: 2, 
                          boxShadow: '0 2px 12px rgba(0,0,0,0.1)', 
                          height: '100%',
                          bgcolor: isDarkMode ? 'background.paper' : 'background.paper'
                        }}>
                          <CardContent sx={{ p: isSmallScreen ? 2 : 3 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                              <Box sx={{ p: 1, borderRadius: 2, mr: 2 }}>
                                <CheckCircle sx={{ color: "#2e7d32", fontSize: 24 }} />
                              </Box>
                              <Box>
                                <Typography variant={isSmallScreen ? "h5" : "h4"} fontWeight="bold" color="success.main">
                                  {totalRepaymentsAmount.toLocaleString('en-US')}
                                </Typography>
                                <Typography variant="body2" color={isDarkMode ? 'text.secondary' : 'text.secondary'}>
                                  إجمالي التحصيلات
                                </Typography>
                              </Box>
                            </Box>

                            <Stack spacing={1}>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                <Typography variant="caption" color={isDarkMode ? 'text.secondary' : 'text.secondary'}>
                                  واصل حتى الآن
                                </Typography>
                                <Typography variant="body2" fontWeight="bold" color="success.main">
                                  {paidRepaymentsUntilNow.toLocaleString('en-US')}
                                </Typography>
                              </Box>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                <Typography variant="caption" color={isDarkMode ? 'text.secondary' : 'text.secondary'}>
                                  متبقي
                                </Typography>
                                <Typography variant="body2" fontWeight="bold" color="warning.main">
                                  {remainingRepayments.toLocaleString('en-US')}
                                </Typography>
                              </Box>

                              <Box>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                                  <Typography variant="caption" color={isDarkMode ? 'text.secondary' : 'text.secondary'}>
                                    نسبة التحصيل
                                  </Typography>
                                  <Typography variant="caption" fontWeight="bold" color="success.main">
                                    {repaymentsProgress.toFixed(1)}%
                                  </Typography>
                                </Box>
                                <Box sx={{ position: 'relative', height: 10, borderRadius: 999, bgcolor: isDarkMode ? '#424242' : '#e0e0e0' }}>
                                  <Box
                                    sx={{
                                      position: 'absolute',
                                      left: 0,
                                      top: 0,
                                      height: '100%',
                                      width: `${repaymentsProgress}%`,
                                      borderRadius: 999,
                                      bgcolor: 'success.main',
                                      transition: 'width 0.4s ease'
                                    }}
                                  />
                                </Box>
                              </Box>
                            </Stack>

                            <Chip
                              label="تحصيلات"
                              size="small"
                              color="success"
                              variant="outlined"
                              sx={{ mt: 2 }}
                            />
                          </CardContent>
                        </Card>
                      </Box>
                    )}

                    {currentMonthTotalAmount > 0 && (
                      <Box sx={{ flex: '1 1 200px', minWidth: '350px', maxWidth: '100%' }}>
                        <Card sx={{ 
                          borderRadius: 2, 
                          boxShadow: '0 2px 12px rgba(0,0,0,0.1)', 
                          height: '100%',
                          bgcolor: isDarkMode ? 'background.paper' : 'background.paper'
                        }}>
                          <CardContent sx={{ p: isSmallScreen ? 2 : 3 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                              <Box sx={{ p: 1, borderRadius: 2, mr: 2 }}>
                                <CheckCircle sx={{ color: "#ff9800", fontSize: 24 }} />
                              </Box>
                              <Box>
                                <Typography variant={isSmallScreen ? "h5" : "h4"} fontWeight="bold" color="warning.main">
                                  {animatedCurrentMonthTotal.toLocaleString('en-US')}
                                </Typography>
                                <Typography variant="body2" color={isDarkMode ? 'text.secondary' : 'text.secondary'}>
                                  تحصيل لهذا الشهر
                                </Typography>
                              </Box>
                            </Box>

                            <Stack spacing={1}>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                <Typography variant="caption" color={isDarkMode ? 'text.secondary' : 'text.secondary'}>
                                  واصل حتى الآن
                                </Typography>
                                <Typography variant="body2" fontWeight="bold" color="success.main">
                                  {currentMonthPaidUntilNow.toLocaleString('en-US')}
                                </Typography>
                              </Box>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                <Typography variant="caption" color={isDarkMode ? 'text.secondary' : 'text.secondary'}>
                                  متبقي
                                </Typography>
                                <Typography variant="body2" fontWeight="bold" color="warning.main">
                                  {currentMonthRemaining.toLocaleString('en-US')}
                                </Typography>
                              </Box>

                              <Box>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                                  <Typography variant="caption" color={isDarkMode ? 'text.secondary' : 'text.secondary'}>
                                    نسبة التحصيل
                                  </Typography>
                                  <Typography variant="caption" fontWeight="bold" color="warning.main">
                                    {currentMonthProgress.toFixed(1)}%
                                  </Typography>
                                </Box>
                                <Box sx={{ position: 'relative', height: 10, borderRadius: 999, bgcolor: isDarkMode ? '#424242' : '#e0e0e0' }}>
                                  <Box
                                    sx={{
                                      position: 'absolute',
                                      left: 0,
                                      top: 0,
                                      height: '100%',
                                      width: `${currentMonthProgress}%`,
                                      borderRadius: 999,
                                      bgcolor: 'warning.main',
                                      transition: 'width 0.4s ease'
                                    }}
                                  />
                                </Box>
                              </Box>
                            </Stack>

                            <Chip
                              label="تحصيل شهري"
                              size="small"
                              color="warning"
                              variant="outlined"
                              sx={{ mt: 2 }}
                            />
                          </CardContent>
                        </Card>
                      </Box>
                    )}
                  </Box>

                  {/* الرسومات الخاصة بالصندوق العام فقط */}
                  {availableMonths.length > 0 && (
                    <Paper sx={{ 
                      p: 2, 
                      mb: 3, 
                      borderRadius: 2, 
                      boxShadow: '0 2px 12px rgba(0,0,0,0.1)',
                      bgcolor: isDarkMode ? 'background.paper' : 'background.paper'
                    }}>
                      <Grid container spacing={2} alignItems="center">
                        <Grid item xs={12} md={2}>
                          <Typography variant="body2" color={isDarkMode ? 'text.secondary' : 'text.secondary'}>
                            {selectedMonth ? `عرض بيانات ${getMonthName(selectedMonth)}` : 'عرض جميع البيانات'}
                          </Typography>
                        </Grid>
                        <Grid item xs={12} md={8}>
                          <FormControl fullWidth size="small">
                            <InputLabel sx={{ color: isDarkMode ? 'text.secondary' : 'inherit' }}>تصفية حسب الشهر</InputLabel>
                            <Select
                              value={selectedMonth}
                              onChange={handleMonthChange}
                              label="تصفية حسب الشهر"
                              sx={{ 
                                minWidth: 200,
                                '& .MuiSelect-select': {
                                  color: isDarkMode ? 'text.primary' : 'inherit'
                                }
                              }}
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

                  {/* رسمة رصيد الصندوق الدائرية */}
                  {totalBalance > 0 && (
                    <Grid container spacing={3} sx={{ mb: 4 }}>
                      <Grid item xs={12}>
                        <Paper sx={{ 
                          p: isSmallScreen ? 2 : 3, 
                          borderRadius: 2, 
                          boxShadow: '0 2px 12px rgba(0,0,0,0.1)',
                          width: isSmallScreen ? '100%' : 'calc(100vw - 240px)',
                          bgcolor: isDarkMode ? 'background.paper' : 'background.paper'
                        }}>
                          <Typography 
                            variant="h6" 
                            fontWeight="bold" 
                            color={isDarkMode ? 'text.primary' : 'text.primary'}
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
                                <circle
                                  cx="50"
                                  cy="50"
                                  r="45"
                                  fill="transparent"
                                  stroke={isDarkMode ? "#424242" : "#E5E7EB"}
                                  strokeWidth="10"
                                />
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
                              
                              <Box sx={{ position: 'absolute', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                                <Typography
                                  variant={isSmallScreen ? "h5" : "h4"}
                                  fontWeight="bold"
                                  color="primary"
                                  sx={{ mb: 0.5 }}
                                >
                                  {(availableBalance + loansBalance).toLocaleString('en-US')}
                                </Typography>
                              </Box>
                            </Box>

                            <Box sx={{ 
                              display: 'flex', 
                              flexDirection: isSmallScreen ? 'row' : 'row',
                              gap: isSmallScreen ? 3 : 6,
                              flex: 1,
                              justifyContent: 'center',
                              flexWrap: 'wrap'
                            }}>
                              <Box sx={{ textAlign: 'center', minWidth: 150 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, justifyContent: 'center', mb: 1 }}>
                                  <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: 'error.main' }} />
                                  <Typography variant="body1" fontWeight="medium" color={isDarkMode ? 'text.primary' : 'text.primary'}>
                                    مُقرض
                                  </Typography>
                                </Box>
                                <Typography variant="h6" fontWeight="semibold" color={isDarkMode ? 'text.secondary' : 'text.secondary'}>
                                  {Math.abs(loansBalance).toLocaleString('en-US')}
                                </Typography>
                              </Box>
                              
                              <Box sx={{ textAlign: 'center', minWidth: 150 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, justifyContent: 'center', mb: 1 }}>
                                  <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: isDarkMode ? '#616161' : 'grey.300' }} />
                                  <Typography variant="body1" fontWeight="medium" color={isDarkMode ? 'text.primary' : 'text.primary'}>
                                    متاح
                                  </Typography>
                                </Box>
                                <Typography variant="h6" fontWeight="semibold" color={isDarkMode ? 'text.secondary' : 'text.secondary'}>
                                  {(availableBalance - Math.abs(loansBalance)).toLocaleString('en-US')}
                                </Typography>
                              </Box>
                            </Box>
                          </Box>
                        </Paper>
                      </Grid>
                    </Grid>
                  )}

                  {/* رسمة Area Chart المكدسة */}
                  {monthlyBalanceData.length > 0 && (
                    <Grid container spacing={3} sx={{ mb: 3 }}>
                      <Grid item xs={12}>
                        <Paper sx={{ 
                          p: isSmallScreen ? 2 : 3, 
                          borderRadius: 2, 
                          boxShadow: '0 2px 12px rgba(0,0,0,0.1)',
                          width: isSmallScreen ? '100%' : 'calc(100vw - 240px)',
                          bgcolor: isDarkMode ? 'background.paper' : 'background.paper'
                        }}>
                          <Typography variant="h6" fontWeight="bold" mb={3} color={isDarkMode ? 'text.primary' : 'text.primary'}>
                            تطور الوارد والصادر والرصيد
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
                              <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? "#424242" : "#e0e0e0"} />
                              <XAxis dataKey="name" stroke={isDarkMode ? "#ffffff" : "#666"} />
                              <YAxis stroke={isDarkMode ? "#ffffff" : "#666"} />
                              <Tooltip 
                                formatter={(value, name) => [`${value.toLocaleString('en-US')}`, name]} 
                                contentStyle={{ 
                                  borderRadius: '8px',
                                  backgroundColor: isDarkMode ? '#2a2a2a' : '#ffffff',
                                  border: isDarkMode ? '1px solid #424242' : '1px solid #e0e0e0',
                                  color: isDarkMode ? '#ffffff' : '#333'
                                }}
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
                                dataKey="الصادر" 
                                stackId="1"
                                stroke="#FF8042" 
                                fill="url(#colorCredit)" 
                                name="الصادر"
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
                  {transactionTypeData.length > 0 && transactionTypeData.some(item => item.value > 0) && (
                    <Box sx={{ mb: 3 }}>
                      <Paper sx={{ 
                        p: isSmallScreen ? 2 : 3, 
                        borderRadius: 2, 
                        boxShadow: '0 2px 12px rgba(0,0,0,0.1)',
                        width: isSmallScreen ? '100%' : 'calc(100vw - 240px)',
                        bgcolor: isDarkMode ? 'background.paper' : 'background.paper'
                      }}>
                        <Typography variant="h6" fontWeight="bold" mb={3} color={isDarkMode ? 'text.primary' : 'text.primary'}>
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
                            <Tooltip 
                              formatter={(value, name) => [`${value.toLocaleString('en-US')}`, name]} 
                              contentStyle={{ 
                                borderRadius: '8px',
                                backgroundColor: isDarkMode ? '#2a2a2a' : '#ffffff',
                                border: isDarkMode ? '1px solid #424242' : '1px solid #e0e0e0',
                                color: isDarkMode ? '#ffffff' : '#333'
                              }}
                            />
                            <Legend 
                              verticalAlign="bottom" 
                              height={36}
                              formatter={(value, entry) => `${value}: ${entry.payload.value.toLocaleString('en-US')}`}
                            />
                          </PieChart>
                        </ResponsiveContainer>
                      </Paper>
                    </Box>
                  )}

                  {/* توزيع حالات القيود */}
                  {statusDistribution.length > 0 && statusDistribution.some(item => item.value > 0) && (
                    <Box sx={{ mb: 4 }}>
                      <Paper sx={{ 
                        p: isSmallScreen ? 2 : 3, 
                        borderRadius: 2, 
                        boxShadow: '0 2px 12px rgba(0,0,0,0.1)',
                        width: isSmallScreen ? '100%' : 'calc(100vw - 240px)',
                        bgcolor: isDarkMode ? 'background.paper' : 'background.paper'
                      }}>
                        <Typography variant="h6" fontWeight="bold" mb={3} color={isDarkMode ? 'text.primary' : 'text.primary'}>
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
                            <Tooltip 
                              formatter={(value, name) => [`${value} قيد`, name]} 
                              contentStyle={{ 
                                borderRadius: '8px',
                                backgroundColor: isDarkMode ? '#2a2a2a' : '#ffffff',
                                border: isDarkMode ? '1px solid #424242' : '1px solid #e0e0e0',
                                color: isDarkMode ? '#ffffff' : '#333'
                              }}
                            />
                            <Legend 
                              verticalAlign="bottom" 
                              height={36}
                              formatter={(value, entry) => `${value}: ${entry.payload.value} قيد`}
                            />
                          </PieChart>
                        </ResponsiveContainer>
                      </Paper>
                    </Box>
                  )}

                  {/* Repayments Chart */}
                  {totalRepaymentsAmount > 0 && (
                    <Box sx={{ mb: 4 }}>
                      <Paper sx={{ 
                        p: isSmallScreen ? 2 : 3, 
                        borderRadius: 2, 
                        boxShadow: '0 2px 12px rgba(0,0,0,0.1)',
                        width: isSmallScreen ? '100%' : 'calc(100vw - 240px)',
                        bgcolor: isDarkMode ? 'background.paper' : 'background.paper'
                      }}>
                        <Typography variant="h6" fontWeight="bold" mb={3} color={isDarkMode ? 'text.primary' : 'text.primary'}>
                          توزيع التحصيل المقترض
                        </Typography>
                        <ResponsiveContainer width="100%" height={isSmallScreen ? 300 : 400}>
                          <BarChart
                            data={[
                              { name: 'الواصل حتى الآن', value: paidRepaymentsUntilNow, color: '#00C49F' },
                              { name: 'المتبقي', value: remainingRepayments, color: '#FF8042' },
                              { name: 'الإجمالي', value: totalRepaymentsAmount, color: '#9c27b0' }
                            ]}
                            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? "#424242" : "#e0e0e0"} />
                            <XAxis 
                              dataKey="name" 
                              tick={{ fill: isDarkMode ? '#ffffff' : '#666', fontSize: 14 }}
                            />
                            <YAxis 
                              tick={{ fill: isDarkMode ? '#ffffff' : '#666', fontSize: 14 }}
                              tickFormatter={(value) => `${value.toLocaleString('en-US')}`}
                            />
                            <Tooltip 
                              formatter={(value, name) => [`${value.toLocaleString('en-US')}`, name]} 
                              contentStyle={{ 
                                borderRadius: '8px',
                                backgroundColor: isDarkMode ? '#2a2a2a' : '#ffffff',
                                border: isDarkMode ? '1px solid #424242' : '1px solid #e0e0e0',
                                color: isDarkMode ? '#ffffff' : '#333'
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
                  <Box sx={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: isSmallScreen ? 2 : 3,
                    mb: isSmallScreen ? 2 : 4,
                    justifyContent: 'center',
                    alignItems: 'stretch'
                  }}>
                    {/* الصندوق الخاص - فقط البطاقات الإحصائية بدون رسومات */}
                    <Box sx={{ flex: isSmallScreen ? '1 1 100%' : '1 1 200px', minWidth: isSmallScreen ? '100%' : '350px', maxWidth: '100%' }}>
                      <Card sx={{ 
                        borderRadius: 2, 
                        boxShadow: '0 2px 12px rgba(0,0,0,0.1)', 
                        height: '100%',
                        bgcolor: isDarkMode ? 'background.paper' : 'background.paper'
                      }}>
                        <CardContent sx={{ p: isSmallScreen ? 2 : 3 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                            <Box sx={{ p: 1, borderRadius: 2, mr: 2 }}>
                              <AccountBalance sx={{ color: "#1976d2", fontSize: 24 }} />
                            </Box>
                            <Box>
                              <Typography variant={isSmallScreen ? "h5" : "h4"} fontWeight="bold" color="primary">
                                {animatedAvailableBalance.toLocaleString('en-US')}
                              </Typography>
                              <Typography variant="body2" color={isDarkMode ? 'text.secondary' : 'text.secondary'}>
                                الرصيد المتاح
                              </Typography>
                            </Box>
                          </Box>
                          <Chip
                            label="رؤوس أموال"
                            size="small"
                            color="primary"
                            variant="outlined"
                          />
                        </CardContent>
                      </Card>
                    </Box>

                    <Box sx={{ flex: '1 1 200px', minWidth: '350px', maxWidth: '100%' }}>
                      <Card sx={{ 
                        borderRadius: 2, 
                        boxShadow: '0 2px 12px rgba(0,0,0,0.1)', 
                        height: '100%',
                        bgcolor: isDarkMode ? 'background.paper' : 'background.paper'
                      }}>
                        <CardContent sx={{ p: isSmallScreen ? 2 : 3 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                            <Box sx={{ p: 1, borderRadius: 2, mr: 2 }}>
                              <TrendingUp sx={{ color: "#2e7d32", fontSize: 24 }} />
                            </Box>
                            <Box>
                              <Typography variant={isSmallScreen ? "h5" : "h4"} fontWeight="bold" color="success.main">
                                {animatedTotalDebit.toLocaleString('en-US')}
                              </Typography>
                              <Typography variant="body2" color={isDarkMode ? 'text.secondary' : 'text.secondary'}>
                                إجمالي الوارد
                              </Typography>
                            </Box>
                          </Box>
                          <Chip
                            label="إيداعات"
                            size="small"
                            color="success"
                            variant="outlined"
                          />
                        </CardContent>
                      </Card>
                    </Box>

                    <Box sx={{ flex: '1 1 200px', minWidth: '350px', maxWidth: '100%' }}>
                      <Card sx={{ 
                        borderRadius: 2, 
                        boxShadow: '0 2px 12px rgba(0,0,0,0.1)', 
                        height: '100%',
                        bgcolor: isDarkMode ? 'background.paper' : 'background.paper'
                      }}>
                        <CardContent sx={{ p: isSmallScreen ? 2 : 3 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                            <Box sx={{ p: 1, borderRadius: 2, mr: 2 }}>
                              <TrendingDown sx={{ color: "#d32f2f", fontSize: 24 }} />
                            </Box>
                            <Box>
                              <Typography variant={isSmallScreen ? "h5" : "h4"} fontWeight="bold" color="error.main">
                                {animatedTotalCredit.toLocaleString('en-US')}
                              </Typography>
                              <Typography variant="body2" color={isDarkMode ? 'text.secondary' : 'text.secondary'}>
                                إجمالي الصادر
                              </Typography>
                            </Box>
                          </Box>
                          <Chip
                            label="سحوبات"
                            size="small"
                            color="error"
                            variant="outlined"
                          />
                        </CardContent>
                      </Card>
                    </Box>

                    {totalRepaymentsAmount > 0 && (
                      <Box sx={{ flex: '1 1 200px', minWidth: '350px', maxWidth: '100%' }}>
                        <Card sx={{ 
                          borderRadius: 2, 
                          boxShadow: '0 2px 12px rgba(0,0,0,0.1)', 
                          height: '100%',
                          bgcolor: isDarkMode ? 'background.paper' : 'background.paper'
                        }}>
                          <CardContent sx={{ p: isSmallScreen ? 2 : 3 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                              <Box sx={{ p: 1, borderRadius: 2, mr: 2 }}>
                                <CheckCircle sx={{ color: "#2e7d32", fontSize: 24 }} />
                              </Box>
                              <Box>
                                <Typography variant={isSmallScreen ? "h5" : "h4"} fontWeight="bold" color="success.main">
                                  {totalRepaymentsAmount.toLocaleString('en-US')}
                                </Typography>
                                <Typography variant="body2" color={isDarkMode ? 'text.secondary' : 'text.secondary'}>
                                  تحصيلات رؤوس الأموال
                                </Typography>
                              </Box>
                            </Box>

                            <Stack spacing={1}>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                <Typography variant="caption" color={isDarkMode ? 'text.secondary' : 'text.secondary'}>
                                  تم التحصيل
                                </Typography>
                                <Typography variant="body2" fontWeight="bold" color="success.main">
                                  {paidRepaymentsUntilNow.toLocaleString('en-US')}
                                </Typography>
                              </Box>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                <Typography variant="caption" color={isDarkMode ? 'text.secondary' : 'text.secondary'}>
                                  النسبة
                                </Typography>
                                <Typography variant="body2" fontWeight="bold" color="success.main">
                                  {repaymentsProgress.toFixed(1)}%
                                </Typography>
                              </Box>

                              <Box>
                                <Box sx={{ position: 'relative', height: 10, borderRadius: 999, bgcolor: isDarkMode ? '#424242' : '#e0e0e0' }}>
                                  <Box
                                    sx={{
                                      position: 'absolute',
                                      left: 0,
                                      top: 0,
                                      height: '100%',
                                      width: `${repaymentsProgress}%`,
                                      borderRadius: 999,
                                      bgcolor: 'success.main',
                                      transition: 'width 0.4s ease'
                                    }}
                                  />
                                </Box>
                              </Box>
                            </Stack>

                            <Chip
                              label="تحصيلات"
                              size="small"
                              color="success"
                              variant="outlined"
                              sx={{ mt: 2 }}
                            />
                          </CardContent>
                        </Card>
                      </Box>
                    )}
                  </Box>

                  {/* لا توجد رسومات في الصندوق الخاص */}
                  <Paper sx={{ 
                    p: 3, 
                    borderRadius: 2, 
                    boxShadow: '0 2px 12px rgba(0,0,0,0.1)',
                    textAlign: 'center',
                    bgcolor: isDarkMode ? 'background.paper' : 'background.paper'
                  }}>
                    <AccountBalance sx={{ fontSize: 48, color: isDarkMode ? 'text.secondary' : 'text.secondary', mb: 2 }} />
                    <Typography variant="h6" color={isDarkMode ? 'text.primary' : 'text.primary'} gutterBottom>
                      الصندوق الخاص (رؤوس الأموال الجديدة)
                    </Typography>
                    <Typography variant="body2" color={isDarkMode ? 'text.secondary' : 'text.secondary'}>
                      هذه الصفحة تعرض فقط الإحصائيات الأساسية للصندوق الخاص
                    </Typography>
                  </Paper>
                </Box>
              )}

              {tab === 2 && (
                <Box>
                  <Paper sx={{ 
                    borderRadius: 2, 
                    boxShadow: '0 2px 12px rgba(0,0,0,0.1)', 
                    overflow: 'hidden',
                    bgcolor: isDarkMode ? 'background.paper' : 'background.paper'
                  }}>
                    <Box sx={{ 
                      display: 'flex', 
                      flexDirection: isSmallScreen ? 'column' : 'row',
                      justifyContent: 'space-between', 
                      alignItems: isSmallScreen ? 'flex-start' : 'center', 
                      p: isSmallScreen ? 2 : 3,
                      gap: isSmallScreen ? 2 : 0,
                      borderBottom: isDarkMode ? '1px solid #424242' : '1px solid #e0e0e0',
                      bgcolor: isDarkMode ? '#2a2a2a' : '#fafafa'
                    }}>
                      <Box>
                        <Typography variant={isSmallScreen ? "subtitle1" : "h6"} fontWeight="bold" color="primary">
                          سجل القيود المحاسبية
                        </Typography>
                        {selectedMonth && (
                          <Typography variant="body2" color={isDarkMode ? 'text.secondary' : 'text.secondary'}>
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
                          <InputLabel sx={{ color: isDarkMode ? 'text.secondary' : 'inherit' }}>الشهر</InputLabel>
                          <Select
                            value={selectedMonth}
                            onChange={handleMonthChange}
                            label="الشهر"
                            sx={{
                              '& .MuiSelect-select': {
                                color: isDarkMode ? 'text.primary' : 'inherit'
                              }
                            }}
                          >
                            <MenuItem value="">جميع الأشهر</MenuItem>
                            {availableMonths.map(month => (
                              <MenuItem key={month} value={month}>
                                {getMonthName(month)}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>

                        <Typography variant="body2" color={isDarkMode ? 'text.secondary' : 'text.secondary'} sx={{ alignSelf: isSmallScreen ? 'center' : 'auto' }}>
                          إجمالي {currentTotalTransactions} قيد
                        </Typography>
                      </Box>
                    </Box>

                    {currentJournals.length === 0 ? (
                      <Box sx={{ textAlign: 'center', py: 6 }}>
                        <AccountBalance sx={{ fontSize: 48, color: isDarkMode ? 'text.secondary' : 'text.secondary', mb: 2 }} />
                        <Typography variant="h6" color={isDarkMode ? 'text.secondary' : 'text.secondary'} gutterBottom>
                          {selectedMonth ? `لا توجد قيود مسجلة لشهر ${getMonthName(selectedMonth)}` : 'لا توجد قيود مسجلة'}
                        </Typography>
                        <Typography variant="body2" color={isDarkMode ? 'text.secondary' : 'text.secondary'}>
                          لم يتم تسجيل أي قيود محاسبية حتى الآن
                        </Typography>
                      </Box>
                    ) : (
                      <>
                        {isSmallScreen ? renderMobileJournalCards() : renderDesktopJournalTable()}
                        
                        {pagination.totalPages > 1 && (
                          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mt: 3, mb: 2 }}>
                            <Pagination
                              count={pagination.totalPages}
                              page={pagination.page}
                              onChange={handlePageChange}
                              color="primary"
                              size={isSmallScreen ? "small" : "medium"}
                              showFirstButton
                              showLastButton
                              sx={{
                                '& .MuiPaginationItem-root': {
                                  fontSize: isSmallScreen ? '0.875rem' : '1rem',
                                  color: isDarkMode ? 'text.primary' : 'inherit'
                                }
                              }}
                            />
                          </Box>
                        )}
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