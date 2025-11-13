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

  const lowBalanceThreshold = 10000;
  const highCreditThreshold = 50000;

  const hasLowBalance = availableBalance < lowBalanceThreshold;
  const hasHighCredit = totalCredit > highCreditThreshold;

  const monthlySummaryData = bankData?.journalsByMonth ? 
    Object.entries(bankData.journalsByMonth)
      .map(([month, data]) => ({
        name: getMonthName(month),
        monthKey: month,
        الوارد: data.totalDebit,
        المقرض: data.totalCredit,
        الرصيد: data.totalBalance,
        عدد_المعاملات: data.entries?.length || 0,
      }))
      .sort((a, b) => a.monthKey.localeCompare(b.monthKey)) : [];

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

  function getMonthName(monthKey) {
    const [year, month] = monthKey.split('-');
    const monthNames = [
      'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
      'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
    ];
    return `${monthNames[parseInt(month) - 1]} ${year}`;
  }

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

      <Box sx={{ p: 3, mb: 3 }}>
        <Tabs
          value={tab}
          onChange={handleTabChange}
          textColor="primary"
          sx={{ 
            px: 2,
            '& .MuiTab-root': {
              fontWeight: '600',
              fontSize: '0.95rem',
              py: 2,
              minHeight: '60px'
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

        <Box sx={{ mt: 4 }}>
          {isLoading ? (
            <Box sx={{ display: "flex", justifyContent: "center", p: 6 }}>
              <CircularProgress size={60} />
            </Box>
          ) : (
            <>
              {tab === 0 && (
                <Box>
                  <Grid container spacing={3} justifyContent="center" alignItems="center" sx={{ mb: 4 }}>
                    <Grid item xs={12} md={3}>
                      <Card sx={{ borderRadius: 2, boxShadow: '0 2px 12px rgba(0,0,0,0.1)' }}>
                        <CardContent sx={{ p: 3 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                            <Box sx={{ 
                              p: 1, 
                              borderRadius: 2, 
                              mr: 2 
                            }}>
                              <AccountBalance sx={{ color: "#1976d2", fontSize: 24 }} />
                            </Box>
                            <Box>
                              <Typography variant="h4" fontWeight="bold" color="primary">
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
                    </Grid>

                    <Grid item xs={12} md={3}>
                      <Card sx={{ borderRadius: 2, boxShadow: '0 2px 12px rgba(0,0,0,0.1)' }}>
                        <CardContent sx={{ p: 3 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                            <Box sx={{ 
                              p: 1, 
                              borderRadius: 2, 
                              mr: 2 
                            }}>
                              <TrendingUp sx={{ color: "#2e7d32", fontSize: 24 }} />
                            </Box>
                            <Box>
                              <Typography variant="h4" fontWeight="bold" color="success.main">
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
                    </Grid>

                    <Grid item xs={12} md={3}>
                      <Card sx={{ borderRadius: 2, boxShadow: '0 2px 12px rgba(0,0,0,0.1)' }}>
                        <CardContent sx={{ p: 3 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                            <Box sx={{ 
                              p: 1, 
                              borderRadius: 2,   
                              mr: 2 
                            }}>
                              <TrendingDown sx={{ color: "#d32f2f", fontSize: 24 }} />
                            </Box>
                            <Box>
                              <Typography variant="h4" fontWeight="bold" color="error.main">
                                {totalCredit.toLocaleString('en-US')}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                إجمالي المقرض
                              </Typography>
                            </Box>
                          </Box>
                          <Chip 
                            label="مقرض" 
                            size="small" 
                            color="error"
                            variant="outlined"
                          />
                        </CardContent>
                      </Card>
                    </Grid>

                    <Grid item xs={12} md={3}>
                      <Card sx={{ borderRadius: 2, boxShadow: '0 2px 12px rgba(0,0,0,0.1)' }}>
                        <CardContent sx={{ p: 3 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                            <Box sx={{ 
                              p: 1, 
                              borderRadius: 2, 
                              mr: 2 
                            }}>
                              <AccountBalance sx={{ color: "#ef6c00", fontSize: 24 }} />
                            </Box>
                            <Box>
                              <Typography variant="h4" fontWeight="bold" color="warning.main">
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
                    </Grid>
                  </Grid>

                  {availableMonths.length > 0 && (
                    <Paper sx={{ p: 2, mb: 3, borderRadius: 2, boxShadow: '0 2px 12px rgba(0,0,0,0.1)' }}>
                      <Grid container spacing={2} alignItems="center">
                        <Grid item xs={12} md={4}>
                          <Typography variant="body2" color="text.secondary">
                            {selectedMonth ? `عرض بيانات ${getMonthName(selectedMonth)}` : ''}
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

                  <Grid container spacing={3} sx={{ mb: 3 }}>
                    <Grid item xs={12}>
                      <Paper sx={{ 
                        p: 3, 
                        borderRadius: 2, 
                        boxShadow: '0 2px 12px rgba(0,0,0,0.1)',
                        width: 'calc(100vw - 240px)',
                      }}>
                        <Typography variant="h6" fontWeight="bold" mb={3}>
                          تطور رصيد الصندوق 
                        </Typography>
                        <ResponsiveContainer width="100%" height={400}>
                          <LineChart data={monthlyBalanceData.length > 0 ? monthlyBalanceData : []}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip formatter={(value) => `${value.toLocaleString('en-US')} ريال`} />
                            <Legend />
                            <Line 
                              type="monotone" 
                              dataKey="الرصيد" 
                              stroke="#1976d2" 
                              strokeWidth={2}
                              name="الرصيد"
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </Paper>
                    </Grid>
                  </Grid>

                  <Grid container spacing={3} sx={{ mb: 3 }}>
                    <Grid item xs={12}>
                      <Paper sx={{ 
                        p: 3, 
                        borderRadius: 2, 
                        boxShadow: '0 2px 12px rgba(0,0,0,0.1)',
                        width: 'calc(100vw - 240px)',
                      }}>
                        <Typography variant="h6" fontWeight="bold" mb={3}>
                          توزيع المعاملات
                        </Typography>
                        <ResponsiveContainer width="100%" height={400}>
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
                    </Grid>
                  </Grid>

                  {monthlySummaryData.length > 0 && (
                    <Grid container spacing={3} sx={{ mb: 3 }}>
                      <Grid item xs={12}>
                        <Paper sx={{ 
                          p: 3, 
                          borderRadius: 2, 
                          boxShadow: '0 2px 12px rgba(0,0,0,0.1)',
                          width: 'calc(100vw - 240px)',
                        }}>
                          <Typography variant="h6" fontWeight="bold" mb={3}>
                            المقارنة الشهرية
                          </Typography>
                          <ResponsiveContainer width="100%" height={400}>
                            <BarChart data={monthlySummaryData}>
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="name" />
                              <YAxis />
                              <Tooltip />
                              <Legend />
                              <Bar dataKey="الوارد" fill="#00C49F" />
                              <Bar dataKey="المقرض" fill="#FF8042" />
                            </BarChart>
                          </ResponsiveContainer>
                        </Paper>
                      </Grid>
                    </Grid>
                  )}

                  <Grid container spacing={3} sx={{ mb: 4 }}>
                    <Grid item xs={12}>
                      <Paper sx={{ 
                        p: 3, 
                        borderRadius: 2, 
                        boxShadow: '0 2px 12px rgba(0,0,0,0.1)',
                        width: 'calc(100vw - 240px)',
                      }}>
                        <Typography variant="h6" fontWeight="bold" mb={3}>
                          توزيع حالات القيود
                        </Typography>
                        <ResponsiveContainer width="100%" height={400}>
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
                    </Grid>
                  </Grid>
                </Box>
              )}

              {tab === 1 && (
                <Box>
                  <Paper sx={{ borderRadius: 2, boxShadow: '0 2px 12px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
                    <Box sx={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center', 
                      p: 3,
                      borderBottom: '1px solid #e0e0e0',
                      bgcolor: '#fafafa'
                    }}>
                      <Box>
                        <Typography variant="h6" fontWeight="bold" color="primary">
                          سجل القيود المحاسبية
                        </Typography>
                        {selectedMonth && (
                          <Typography variant="body2" color="text.secondary">
                            عرض بيانات شهر {getMonthName(selectedMonth)}
                          </Typography>
                        )}
                      </Box>
                      
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <FormControl size="small" sx={{ minWidth: 250 }}>
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

                        <Typography variant="body2" color="text.secondary">
                          إجمالي {currentTotalTransactions} قيد
                        </Typography>
                        
                        <Box sx={{ display: 'flex', gap: 1 }}>
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

                    {currentJournals.length === 0 && (
                      <Box sx={{ textAlign: 'center', py: 6 }}>
                        <AccountBalance sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                        <Typography variant="h6" color="text.secondary" gutterBottom>
                          {selectedMonth ? `لا توجد قيود مسجلة لشهر ${getMonthName(selectedMonth)}` : 'لا توجد قيود مسجلة'}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          لم يتم تسجيل أي قيود محاسبية حتى الآن
                        </Typography>
                      </Box>
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