import React, { useState } from "react";
import {
  Box,
  Typography,
  Tabs,
  Tab,
  Paper,
  Grid,
  Stack,
  Divider,
  Alert,
  CircularProgress,
  useMediaQuery,
  Card,
  CardContent,
  IconButton,
  Chip,
  Table,
  TableBody,
  TableContainer,
  TableHead,
  Button,
  useTheme,
} from "@mui/material";
import {
  AccountBalance as BalanceIcon,
  Savings as SavingsIcon,
  CalendarMonth as CalendarIcon,
  ArrowCircleDown as DepositIcon,
  ArrowCircleUp as WithdrawalIcon,
} from "@mui/icons-material";
import { useQuery } from "@tanstack/react-query";
import { getAllPartnerSavings, getSavingAccountReport } from "./savingApi";
import SavingTable from "../../components/modals/SavingTable";
import { exportSavingsToPDF, exportSavingsToExcel } from "../../utilities/savingExporter";
import {
  StyledTableCell,
  StyledTableRow,
} from "../../components/layouts/tableLayout";
import { Helmet } from "react-helmet-async";
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
import dayjs from "dayjs";
import "dayjs/locale/ar";
const Saving = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [page] = useState(1);
  const [limit] = useState(10);

  const isMobile = useMediaQuery("(max-width: 480px)");
  const isTablet = useMediaQuery("(max-width: 768px)");
  const isSmallScreen = isMobile || isTablet;
  const theme = useTheme();
  // Query for all partners savings
  const { data: savingData, isLoading: isSavingLoading } = useQuery({
    queryKey: ["partners-savings", page],
    retry: 1,
    queryFn: () => getAllPartnerSavings(page, limit),
  });

  // Query for saving account report
  const { data: accountReport, isLoading: isAccountLoading } = useQuery({
    queryKey: ["saving-account"],
    retry: 1,
    queryFn: () => getSavingAccountReport(),
    enabled: activeTab === 1,
  });


  // Format currency
  const formatCurrency = (amount) => {
    return amount?.toLocaleString() || "0";
  };

  const formatArabicDate = (date) => {
    return dayjs(date)
      .locale("ar")
      .format("D [من] MMMM [الساعة] h:mm") // format without A
      + " "
      + (dayjs(date).hour() < 12 ? "صباحًا" : "مساءً");
  };

  // Render saving account summary
  const renderAccountSummary = () => (
    <Grid container spacing={3} sx={{ mb: 4, justifyContent: "center" }}>
      <Grid item xs={12} sm={6} md={3}>
        <Card sx={{ bgcolor: "primary.50", textAlign: "center", p: 2,width: "350px" }}>
          <BalanceIcon color={theme.palette.primary.main} sx={{ fontSize: 40, mb: 1 }} />
          <Typography variant="h5" fontWeight="bold" color={theme.palette.primary.main}>
            {formatCurrency(accountReport?.account?.balance)}
          </Typography>
          <Typography variant="body2" color={theme.palette.primary.main}>
            رصيد الصندوق
          </Typography>
        </Card>
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <Card sx={{ bgcolor: "success.50", textAlign: "center", p: 2,width: "350px" }}>
          <DepositIcon color="success" sx={{ fontSize: 40, mb: 1 }} />
          <Typography variant="h5" fontWeight="bold" color="success.main">
            {formatCurrency(accountReport?.account?.debit)}
          </Typography>
          <Typography variant="body2" color="success.main">
            إجمالي الإيداعات
          </Typography>
        </Card>
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <Card sx={{ bgcolor: "warning.50", textAlign: "center", p: 2,width: "350px" }}>
          <WithdrawalIcon color="warning" sx={{ fontSize: 40, mb: 1 }} />
          <Typography variant="h5" fontWeight="bold" color="warning.main">
            {formatCurrency(accountReport?.account?.credit)}
          </Typography>
          <Typography variant="body2" color="warning.main">
            إجمالي السحوبات
          </Typography>
        </Card>
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <Card sx={{ bgcolor: "info.50", textAlign: "center", p: 2,width: "350px" }}>
          <CalendarIcon color="info" sx={{ fontSize: 40, mb: 1 }} />
          <Typography variant="h5" fontWeight="bold" color="info.main">
            {accountReport?.totalJournalEntries || 0}
          </Typography>
          <Typography variant="body2" color="info.main">
            عدد العمليات
          </Typography>
        </Card>
      </Grid>
    </Grid>
  );



  // Render account journal entries
  const renderAccountJournals = () => {
    if (!accountReport?.journalsByMonth || Object.keys(accountReport.journalsByMonth).length === 0) {
      return (
        <Alert severity="info" sx={{ mt: 2 }}>
          لا توجد عمليات مالية لحساب الادخار
        </Alert>
      );
    }

    return (
      <Card sx={{ p: 3 }}>
        <Typography variant="h6" fontWeight="bold" color="primary" sx={{ mb: 3, textAlign: "center" }}>
          العمليات المالية
        </Typography>
        
        {Object.entries(accountReport.journalsByMonth).map(([month, data]) => (
          <Box key={month} sx={{ mb: 4 }}>
            <Typography variant="h6" color="primary" sx={{ mb: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
              شهر {month}
            </Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <StyledTableRow>
                    <StyledTableCell align="center">التاريخ</StyledTableCell>
                    <StyledTableCell align="center">الوصف</StyledTableCell>
                    <StyledTableCell align="center">مدين</StyledTableCell>
                    <StyledTableCell align="center">دائن</StyledTableCell>
                    <StyledTableCell align="center">الرصيد</StyledTableCell>
                  </StyledTableRow>
                </TableHead>
                <TableBody>
                  {data.entries.map((entry) => (
                    <StyledTableRow key={entry.id}>
                      <StyledTableCell align="center">
                        {formatArabicDate(entry.date)}
                      </StyledTableCell>
                      <StyledTableCell align="center">
                        {entry.description}
                      </StyledTableCell>
                      <StyledTableCell align="center">
                        {formatCurrency(entry.debit)}
                      </StyledTableCell>
                      <StyledTableCell align="center">
                        {formatCurrency(entry.credit)}
                      </StyledTableCell>
                      <StyledTableCell align="center">
                        {formatCurrency(entry.balance)}
                      </StyledTableCell>
                    </StyledTableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        ))}
      </Card>
    );
  };


  // Helper function to get month name
  const getMonthName = (monthKey) => {
    if (!monthKey) return "";
    const [year, month] = monthKey.split('-');
    const monthNames = [
      'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
      'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
    ];
    return `${monthNames[parseInt(month) - 1]} ${year}`;
  };

  // Prepare chart data
  const prepareChartData = () => {
    if (!accountReport) return { monthlyData: [], transactionData: [] };

    // Monthly balance data
    const monthlyData = accountReport.journalsByMonth
      ? Object.entries(accountReport.journalsByMonth)
          .map(([month, data]) => ({
            name: getMonthName(month),
            monthKey: month,
            الرصيد: data.totalBalance || 0,
            الإيداعات: data.totalDebit || 0,
            السحوبات: data.totalCredit || 0,
          }))
          .sort((a, b) => a.monthKey.localeCompare(b.monthKey))
      : [];

    // Transaction type distribution
    const transactionData = [
      { name: 'الإيداعات', value: accountReport.account?.debit || 0, color: '#00C49F' },
      { name: 'السحوبات', value: accountReport.account?.credit || 0, color: '#FF8042' },
    ];

    return { monthlyData, transactionData };
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];
  const { monthlyData, transactionData } = prepareChartData();

  // Render saving account tab
  const renderSavingAccountTab = () => {
    if (isAccountLoading) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress size={40} />
        </Box>
      );
    }

    return (
      <Box sx={{ textAlign: "center" }}>
        {renderAccountSummary()}
        
        {/* Charts Section */}
        {accountReport && (
          <Grid container spacing={3} sx={{ mb: 4 }}>
            {/* Monthly Balance Trend Chart */}
            {monthlyData.length > 0 && (
              <Grid item xs={12}>
                <Paper sx={{ 
                  p: isSmallScreen ? 2 : 3, 
                  borderRadius: 2, 
                  boxShadow: '0 2px 12px rgba(0,0,0,0.1)',
                }}>
                  <Typography variant="h6" fontWeight="bold" mb={3}>
                    تطور الرصيد والإيداعات والسحوبات
                  </Typography>
                  <ResponsiveContainer width={1200} height={isSmallScreen ? 300 : 400}>
                    <ComposedChart data={monthlyData}>
                      <defs>
                        <linearGradient id="colorCredit" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#00C49F" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#00C49F" stopOpacity={0.1}/>
                        </linearGradient>
                        <linearGradient id="colorDebit" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#FF8042" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#FF8042" stopOpacity={0.1}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip 
                        formatter={(value, name) => [`${value.toLocaleString('en-US')}`, name]} 
                        contentStyle={{ borderRadius: '8px' }}
                      />
                      <Legend />
                      <Area 
                        type="monotone" 
                        dataKey="الإيداعات" 
                        stackId="1"
                        stroke="#00C49F" 
                        fill="url(#colorCredit)" 
                        name="الإيداعات"
                        strokeWidth={2}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="السحوبات" 
                        stackId="1"
                        stroke="#FF8042" 
                        fill="url(#colorDebit)" 
                        name="السحوبات"
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
            )}

            {/* Transaction Distribution Pie Chart */}
            {transactionData.some(t => t.value > 0) && (
              <Grid item xs={12}>
                <Paper sx={{
                  p: isSmallScreen ? 2 : 3,
                  borderRadius: 2,
                  boxShadow: '0 2px 12px rgba(0,0,0,0.1)',
                }}>
                  <Typography variant="h6" fontWeight="bold" mb={3}>
                    توزيع الإيداعات والسحوبات
                  </Typography>
                  <ResponsiveContainer width={1200} height={isSmallScreen ? 300 : 400}>
                    <PieChart>
                      <Pie
                        data={transactionData}
                        cx="50%"
                        cy="50%"
                        outerRadius={isSmallScreen ? 80 : 120}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
                      >
                        {transactionData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value, name) => [`${value.toLocaleString('en-US')}`, name]}
                        contentStyle={{ borderRadius: '8px' }}
                      />
                      <Legend
                        verticalAlign="bottom"
                        height={36}
                        formatter={(value, entry) => `${value}: ${entry.payload.value.toLocaleString('en-US')}`}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </Paper>
              </Grid>
            )}

            {/* Monthly Transactions Bar Chart */}
            {monthlyData.length > 0 && (
              <Grid item xs={12}>
                <Paper sx={{ 
                  p: isSmallScreen ? 2 : 3, 
                  borderRadius: 2, 
                  boxShadow: '0 2px 12px rgba(0,0,0,0.1)',
                }}>
                  <Typography variant="h6" fontWeight="bold" mb={3}>
                    عدد العمليات الشهرية
                  </Typography>
                  <ResponsiveContainer width={1200} height={isSmallScreen ? 300 : 400}>
                    <BarChart data={monthlyData.map(month => ({
                      ...month,
                      العمليات: accountReport.journalsByMonth[month.monthKey]?.entries?.length || 0
                    }))}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip 
                        formatter={(value, name) => [name === 'العمليات' ? `${value} عملية` : `${value.toLocaleString('en-US')}`, name]} 
                        contentStyle={{ borderRadius: '8px' }}
                      />
                      <Legend />
                      <Bar 
                        dataKey="العمليات" 
                        fill="#8884D8"
                        radius={[8, 8, 0, 0]}
                        name="عدد العمليات"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </Paper>
              </Grid>
            )}
          </Grid>
        )}

        {renderAccountJournals()}
      </Box>
    );
  };

  return (
    <Box
      sx={{
        bgcolor: theme.palette.background.default,
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Helmet>
        <title>إدارة المدخرات</title>
        <meta name="description" content="إدارة مدخرات الشركاء وصندوق الادخار" />
      </Helmet>

      <Box
        sx={{
          flex: 1,
          p: isSmallScreen ? 2 : 4,
          bgcolor: theme.palette.background.paper,
        }}
      >
        <Box sx={{ width: "100%" }}>
          {/* Tabs for desktop, simple navigation for mobile */}
          {!isSmallScreen ? (
            <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 4 }}>
              <Tabs
                value={activeTab}
                onChange={(e, newValue) => {
                  setActiveTab(newValue);
                }}
              >
                <Tab
                  label="كشف المدخرات العام"
                  sx={{
                    fontWeight: "bold",
                    borderBottom: activeTab === 0 ? `3px solid ${theme.palette.primary.main}` : "none",
                    color: activeTab === 0 ? theme.palette.primary.main : theme.palette.text.primary,
                  }}
                />
                <Tab
                  label="صندوق الادخار"
                  sx={{
                    fontWeight: "bold",
                    borderBottom: activeTab === 1 ? `3px solid ${theme.palette.primary.main}` : "none",
                    color: activeTab === 1 ? theme.palette.primary.main : theme.palette.text.primary,
                  }}
                />
              </Tabs>
            </Box>
          ) : (
            // Mobile header
            <Box sx={{ mb: 3 }}>
              {activeTab === 1 ? (
                <Typography variant="h6" fontWeight="bold" mb={2}>
                  صندوق الادخار
                </Typography>
              ) : (
                // Title for mobile list view
                <Typography variant="h6" fontWeight="bold" mb={2}>
                  إدارة المدخرات
                </Typography>
              )}
            </Box>
          )}

          {activeTab === 0 ? (
            <Paper
              sx={{
                flex: 1,
                width: "100%",
                overflow: "hidden",
                borderRadius: 2,
              }}
            >
              {/* Export Buttons */}
              <Box sx={{ p: 2, display: 'flex', gap: 2, justifyContent: 'center' }}>
                <Button
                  variant="outlined"
                  color="error"
                  onClick={() => exportSavingsToPDF(savingData)}
                  disabled={isSavingLoading || !savingData?.data?.length}
                  sx={{ minWidth: 120,fontWeight: 'bold' }}
                >
                  تصدير PDF
                </Button>
                <Button
                  variant="outlined"
                  color="success"
                  onClick={() => exportSavingsToExcel(savingData)}
                  disabled={isSavingLoading || !savingData?.data?.length}
                  sx={{ minWidth: 120,fontWeight: 'bold' }}
                >
                  تصدير Excel
                </Button>
              </Box>

              <SavingTable
                isLoading={isSavingLoading}
                savingData={savingData}
              />
            </Paper>
          ) : (
            // Saving Account Tab
            renderSavingAccountTab()
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default Saving;