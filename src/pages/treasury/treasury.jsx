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
} from "recharts";
import { StyledTableCell, StyledTableRow } from '../../components/layouts/tableLayout';
import { exportJournalsToPDF, exportJournalsToExcel } from '../../utilities/treasuryJournalsExporter';
import { notifySuccess, notifyError } from '../../utilities/toastify';

// API function to get bank account data
const getBankAccountData = async () => {
  const response = await Api.get("/api/accounts/bank");
  return response.data;
};

// Colors for charts
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export default function Treasury() {
  const [tab, setTab] = useState(0);
  const [isExporting, setIsExporting] = useState(false);

  const { data: bankData, isLoading, error } = useQuery({
    queryKey: ["bank-account"],
    queryFn: getBankAccountData,
    retry: 1,
  });

  const handleTabChange = (event, newValue) => {
    setTab(newValue);
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

  // Calculate statistics
  const availableBalance = bankData?.account?.balance || 0;
  const totalDebit = bankData?.account?.debit || 0;
  const totalCredit = bankData?.account?.credit || 0;
  const totalTransactions = bankData?.totalJournalEntries || 0;

  // Alert thresholds
  const lowBalanceThreshold = 10000;
  const highCreditThreshold = 50000;

  // Check for alerts
  const hasLowBalance = availableBalance < lowBalanceThreshold;
  const hasHighCredit = totalCredit > highCreditThreshold;

  // Prepare chart data
  const balanceOverTimeData = bankData?.journals?.slice(0, 10).map(journal => ({
    name: dayjs(journal.date).format('DD/MM'),
    balance: journal.balance,
    debit: journal.debit,
    credit: journal.credit
  })).reverse() || [];

  const transactionTypeData = [
    { name: 'الوارد', value: totalDebit, color: '#00C49F' },
    { name: 'المقرض', value: totalCredit, color: '#FF8042' },
  ];

  const monthlyData = [
    { name: 'يناير', الوارد: 4000, المقرض: 2400 },
    { name: 'فبراير', الوارد: 3000, المقرض: 1398 },
    { name: 'مارس', الوارد: 2000, المقرض: 9800 },
    { name: 'أبريل', الوارد: 2780, المقرض: 3908 },
    { name: 'مايو', الوارد: 1890, المقرض: 4800 },
  ];

  const statusDistribution = [
    { name: 'مرحل', value: bankData?.journals?.filter(j => j.status === 'POSTED').length || 0 },
    { name: 'مسودة', value: bankData?.journals?.filter(j => j.status === 'DRAFT').length || 0 },
  ];

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

     
      <Box sx={{ p: 3,mb: 3 }}>
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

        {/* Add spacing between tabs and content */}
        <Box sx={{ mt: 4 }}>
        {isLoading ? (
          <Box sx={{ display: "flex", justifyContent: "center", p: 6 }}>
            <CircularProgress size={60} />
          </Box>
        ) : (
          <>
            {/* Tab 1: Statistics Dashboard */}
            {tab === 0 && (
              <Box>
                {/* Alerts Section */}
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

                {/* Main Statistics Cards */}
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
                              {totalTransactions}
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

                {/* Balance Trend Chart - Full Row */}
                <Grid container spacing={3} sx={{ mb: 3 }}>
                  <Grid item xs={12}>
                    <Paper sx={{ 
                      p: 3, 
                      borderRadius: 2, 
                      boxShadow: '0 2px 12px rgba(0,0,0,0.1)',
                      width: 'calc(100vw - 240px)',
                    }}>
                      <Typography variant="h6" fontWeight="bold" mb={3}>
                        تطور الرصيد over Time
                      </Typography>
                      <ResponsiveContainer width="100%" height={400}>
                        <LineChart data={balanceOverTimeData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Line 
                            type="monotone" 
                            dataKey="balance" 
                            stroke="#1976d2" 
                            strokeWidth={2}
                            name="الرصيد"
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </Paper>
                  </Grid>
                </Grid>

                {/* Transaction Types Pie Chart - Full Row */}
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

                {/* Monthly Comparison - Full Row */}
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
                        <BarChart data={monthlyData}>
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

                {/* Status Distribution - Full Row */}
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

            {/* Tab 2: Journal Entries Table */}
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
                    <Typography variant="h6" fontWeight="bold" color="primary">
                      سجل القيود المحاسبية
                    </Typography>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Typography variant="body2" color="text.secondary">
                        إجمالي {totalTransactions} قيد
                      </Typography>
                      
                      {/* Export Buttons */}
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <IconButton
                          onClick={handleExportPDF}
                          disabled={isExporting || !bankData?.journals?.length}
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
                          disabled={isExporting || !bankData?.journals?.length}
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
                        {bankData?.journals?.map((journal) => (
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

                  {(!bankData?.journals || bankData.journals.length === 0) && (
                    <Box sx={{ textAlign: 'center', py: 6 }}>
                      <AccountBalance sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                      <Typography variant="h6" color="text.secondary" gutterBottom>
                        لا توجد قيود مسجلة
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