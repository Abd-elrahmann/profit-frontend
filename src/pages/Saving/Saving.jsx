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
} from "@mui/material";
import {
  ArrowBack as ArrowBackIcon,
  AccountBalance as BalanceIcon,
  Savings as SavingsIcon,
  CalendarMonth as CalendarIcon,
} from "@mui/icons-material";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { getAllPartnerSavings, getPartnerSavingDetails, getSavingAccountReport } from "./savingApi";
import SavingTable from "../../components/modals/SavingTable";
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
  const [selectedPartner, setSelectedPartner] = useState(null);
  const [page] = useState(1);
  const [limit] = useState(10);
  const navigate = useNavigate();

  const isMobile = useMediaQuery("(max-width: 480px)");
  const isTablet = useMediaQuery("(max-width: 768px)");
  const isSmallScreen = isMobile || isTablet;

  // Query for all partners savings
  const { data: savingData, isLoading: isSavingLoading } = useQuery({
    queryKey: ["partners-savings", page],
    queryFn: () => getAllPartnerSavings(page, limit),
  });

  // Query for partner saving details when selected
  const { data: partnerSavingDetails, isLoading: isPartnerLoading } = useQuery({
    queryKey: ["partner-saving-details", selectedPartner],
    queryFn: () => getPartnerSavingDetails(selectedPartner),
    enabled: !!selectedPartner && activeTab === 1,
  });

  // Query for saving account report
  const { data: accountReport, isLoading: isAccountLoading } = useQuery({
    queryKey: ["saving-account"],
    queryFn: () => getSavingAccountReport(),
    enabled: activeTab === 2,
  });

  const handleViewDetails = (partnerId) => {
    setSelectedPartner(partnerId);
    setActiveTab(1);
  };

  const handleBackToList = () => {
    setActiveTab(0);
    setSelectedPartner(null);
  };

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
  // Calculate total savings for partner
  const calculateTotalPartnerSavings = () => {
    if (!partnerSavingDetails) return 0;
    return partnerSavingDetails.reduce((total, period) => total + (period.totalSaving || 0), 0);
  };

  // Render saving account summary
  const renderAccountSummary = () => (
    <Grid container spacing={3} sx={{ mb: 4, justifyContent: "center" }}>
      <Grid item xs={12} sm={6} md={3}>
        <Card sx={{ bgcolor: "primary.50", textAlign: "center", p: 2 }}>
          <BalanceIcon color="primary" sx={{ fontSize: 40, mb: 1 }} />
          <Typography variant="h5" fontWeight="bold" color="primary.main">
            {formatCurrency(accountReport?.account?.balance)}
          </Typography>
          <Typography variant="body2" color="primary.main">
            رصيد الصندوق
          </Typography>
        </Card>
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <Card sx={{ bgcolor: "success.50", textAlign: "center", p: 2 }}>
          <SavingsIcon color="success" sx={{ fontSize: 40, mb: 1 }} />
          <Typography variant="h5" fontWeight="bold" color="success.main">
            {formatCurrency(accountReport?.account?.credit)}
          </Typography>
          <Typography variant="body2" color="success.main">
            إجمالي الإيداعات
          </Typography>
        </Card>
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <Card sx={{ bgcolor: "warning.50", textAlign: "center", p: 2 }}>
          <SavingsIcon color="warning" sx={{ fontSize: 40, mb: 1 }} />
          <Typography variant="h5" fontWeight="bold" color="warning.main">
            {formatCurrency(accountReport?.account?.debit)}
          </Typography>
          <Typography variant="body2" color="warning.main">
            إجمالي السحوبات
          </Typography>
        </Card>
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <Card sx={{ bgcolor: "info.50", textAlign: "center", p: 2 }}>
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

  // Render partner saving summary
  const renderPartnerSavingSummary = () => {
    const totalSavings = calculateTotalPartnerSavings();
    
    return (
      <Grid container spacing={3} sx={{ mb: 4, justifyContent: "center" }}>
        <Grid item xs={12} sm={6} md={4}>
          <Card sx={{ bgcolor: "primary.50", textAlign: "center", p: 2 }}>
            <SavingsIcon color="primary" sx={{ fontSize: 40, mb: 1 }} />
            <Typography variant="h5" fontWeight="bold" color="primary.main">
              {formatCurrency(totalSavings)}
            </Typography>
            <Typography variant="body2" color="primary.main">
              إجمالي المدخرات
            </Typography>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <Card sx={{ bgcolor: "success.50", textAlign: "center", p: 2 }}>
            <CalendarIcon color="success" sx={{ fontSize: 40, mb: 1 }} />
            <Typography variant="h5" fontWeight="bold" color="success.main">
              {partnerSavingDetails?.length || 0}
            </Typography>
            <Typography variant="body2" color="success.main">
              عدد فترات الادخار
            </Typography>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <Card sx={{ bgcolor: "warning.50", textAlign: "center", p: 2 }}>
            <BalanceIcon color="warning" sx={{ fontSize: 40, mb: 1 }} />
            <Typography variant="h5" fontWeight="bold" color="warning.main">
              {partnerSavingDetails?.reduce((total, period) => total + (period.accruals?.length || 0), 0) || 0}
            </Typography>
            <Typography variant="body2" color="warning.main">
              عدد عمليات الادخار
            </Typography>
          </Card>
        </Grid>
      </Grid>
    );
  };

  // Render combined saving periods and accruals table
  const renderSavingPeriodsTable = () => (
    <Card sx={{ p: 3 }}>
      <Typography variant="h6" fontWeight="bold" color="primary" sx={{ mb: 3, textAlign: "center" }}>
        فترات الادخار وعملياتها
      </Typography>
      <TableContainer>
        <Table>
          <TableHead>
            <StyledTableRow>
              <StyledTableCell align="center">اسم الفترة</StyledTableCell>
              <StyledTableCell align="center">رقم العملية</StyledTableCell>
              <StyledTableCell align="center">المبلغ</StyledTableCell>
              <StyledTableCell align="center">التاريخ</StyledTableCell>
              <StyledTableCell align="center">التفاصيل</StyledTableCell>
            </StyledTableRow>
          </TableHead>
          <TableBody>
            {partnerSavingDetails?.map((period) => {
              const accruals = period.accruals || [];
              const hasAccruals = accruals.length > 0;
              
              // If no accruals, show period summary row
              if (!hasAccruals) {
                return (
                  <StyledTableRow key={period.periodId}>
                    <StyledTableCell align="center">
                      {period.periodName}
                    </StyledTableCell>
                    <StyledTableCell align="center" colSpan={2}>
                      <Typography variant="body2" color="text.secondary">
                        لا توجد عمليات
                      </Typography>
                    </StyledTableCell>
                    <StyledTableCell align="center">-</StyledTableCell>
                    <StyledTableCell align="center">
                      <Chip
                        label="عرض التفاصيل"
                        color="info"
                        variant="outlined"
                        size="small"
                        onClick={() => navigate(`/profit-distribution?periodId=${period.periodId}`)}
                        sx={{ cursor: 'pointer' }}
                      />
                    </StyledTableCell>
                  </StyledTableRow>
                );
              }
              
              // Render rows with accruals
              return accruals.map((accrual, index) => (
                <StyledTableRow key={`${period.periodId}-${accrual.savingId}`}>
                  {index === 0 && (
                    <StyledTableCell align="center" rowSpan={accruals.length}>
                      {period.periodName}
                    </StyledTableCell>
                  )}
                  <StyledTableCell align="center">
                    #{accrual.savingId}
                  </StyledTableCell>
                  <StyledTableCell align="center">
                    {formatCurrency(accrual.savingAmount)}
                  </StyledTableCell>
                  <StyledTableCell align="center">
                    {formatArabicDate(accrual.date)}
                  </StyledTableCell>
                  {index === 0 && (
                    <StyledTableCell align="center" rowSpan={accruals.length}>
                      <Chip
                        label="عرض التفاصيل"
                        color="info"
                        variant="outlined"
                        size="small"
                        onClick={() => navigate(`/profit-distribution?periodId=${period.periodId}`)}
                        sx={{ cursor: 'pointer' }}
                      />
                    </StyledTableCell>
                  )}
                </StyledTableRow>
              ));
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </Card>
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

  // Render mobile partner details
  const renderMobilePartnerDetails = () => (
    <Box sx={{ textAlign: "center" }}>
      {/* Partner Summary */}
      {renderPartnerSavingSummary()}

      {/* Saving Periods */}
      <Card sx={{ p: 2, mb: 2 }}>
        <Typography variant="h6" fontWeight="bold" color="primary" sx={{ mb: 2, textAlign: "center" }}>
          فترات الادخار
        </Typography>
        <Stack spacing={2}>
          {partnerSavingDetails?.map((period) => (
            <Card key={period.periodId} variant="outlined">
              <CardContent>
                <Stack spacing={1} sx={{ alignItems: "center" }}>
                  <Typography variant="subtitle1" fontWeight="bold" color="primary">
                    {period.periodName}
                  </Typography>
                  <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1, width: "100%" }}>
                    <Box>
                      <Typography variant="body2" color="textSecondary">المدخرات</Typography>
                      <Typography variant="body2" fontWeight="bold" color="success.main">
                        {formatCurrency(period.totalSaving)}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="body2" color="textSecondary">العمليات</Typography>
                      <Chip
                        label={period.accruals?.length || 0}
                        color="primary"
                        size="small"
                      />
                    </Box>
                  </Box>
                  <Box sx={{ mt: 1, width: "100%" }}>
                    <Chip
                      label="عرض التفاصيل"
                      color="info"
                      variant="outlined"
                      size="small"
                      onClick={() => navigate(`/profit-distribution?periodId=${period.periodId}`)}
                      sx={{ cursor: 'pointer' }}
                    />
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          ))}
        </Stack>
      </Card>
    </Box>
  );

  // Render desktop partner details
  const renderDesktopPartnerDetails = () => (
    <Box sx={{ textAlign: "center" }}>
      {renderPartnerSavingSummary()}
      {renderSavingPeriodsTable()}
    </Box>
  );

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
            الإيداعات: data.totalCredit || 0,
            السحوبات: data.totalDebit || 0,
          }))
          .sort((a, b) => a.monthKey.localeCompare(b.monthKey))
      : [];

    // Transaction type distribution
    const transactionData = [
      { name: 'الإيداعات', value: accountReport.account?.credit || 0, color: '#00C49F' },
      { name: 'السحوبات', value: accountReport.account?.debit || 0, color: '#FF8042' },
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
                  <ResponsiveContainer width="100%" height={isSmallScreen ? 300 : 400}>
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
                        formatter={(value, name) => [`${value.toLocaleString('en-US')} ريال`, name]} 
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
              <Grid item xs={12} md={6}>
                <Paper sx={{ 
                  p: isSmallScreen ? 2 : 3, 
                  borderRadius: 2, 
                  boxShadow: '0 2px 12px rgba(0,0,0,0.1)',
                }}>
                  <Typography variant="h6" fontWeight="bold" mb={3}>
                    توزيع الإيداعات والسحوبات
                  </Typography>
                  <ResponsiveContainer width="100%" height={isSmallScreen ? 300 : 400}>
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
                        formatter={(value, name) => [`${value.toLocaleString('en-US')} ريال`, name]} 
                        contentStyle={{ borderRadius: '8px' }}
                      />
                      <Legend 
                        verticalAlign="bottom" 
                        height={36}
                        formatter={(value, entry) => `${value}: ${entry.payload.value.toLocaleString('en-US')} ريال`}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </Paper>
              </Grid>
            )}

            {/* Monthly Transactions Bar Chart */}
            {monthlyData.length > 0 && (
              <Grid item xs={12} md={6}>
                <Paper sx={{ 
                  p: isSmallScreen ? 2 : 3, 
                  borderRadius: 2, 
                  boxShadow: '0 2px 12px rgba(0,0,0,0.1)',
                }}>
                  <Typography variant="h6" fontWeight="bold" mb={3}>
                    عدد العمليات الشهرية
                  </Typography>
                  <ResponsiveContainer width="100%" height={isSmallScreen ? 300 : 400}>
                    <BarChart data={monthlyData.map(month => ({
                      ...month,
                      العمليات: accountReport.journalsByMonth[month.monthKey]?.entries?.length || 0
                    }))}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip 
                        formatter={(value, name) => [name === 'العمليات' ? `${value} عملية` : `${value.toLocaleString('en-US')} ريال`, name]} 
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
        bgcolor: "#f6f6f8",
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
          bgcolor: "#fff",
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
                  if (newValue === 0) {
                    setSelectedPartner(null);
                  }
                }}
              >
                <Tab
                  label="كشف المدخرات العام"
                  sx={{
                    fontWeight: "bold",
                    borderBottom: activeTab === 0 ? "3px solid #0d40a5" : "none",
                    color: activeTab === 0 ? "#0d40a5" : "text.secondary",
                  }}
                />
                <Tab
                  label={selectedPartner ? "كشف مدخرات محدد" : "مدخرات محددة"}
                  sx={{
                    fontWeight: "bold",
                    borderBottom: activeTab === 1 ? "3px solid #0d40a5" : "none",
                    color: activeTab === 1 ? "#0d40a5" : "text.secondary",
                  }}
                />
                <Tab
                  label="صندوق الادخار"
                  sx={{
                    fontWeight: "bold",
                    borderBottom: activeTab === 2 ? "3px solid #0d40a5" : "none",
                    color: activeTab === 2 ? "#0d40a5" : "text.secondary",
                  }}
                />
              </Tabs>
            </Box>
          ) : (
            // Mobile header
            <Box sx={{ mb: 3 }}>
              {activeTab === 1 ? (
                // Back button for mobile details view
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <IconButton onClick={handleBackToList} size="small">
                    <ArrowBackIcon />
                  </IconButton>
                  <Typography variant="h6" fontWeight="bold" sx={{ ml: 1 }}>
                    مدخرات الشريك
                  </Typography>
                </Box>
              ) : activeTab === 2 ? (
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

          {activeTab === 0 || (isSmallScreen && !selectedPartner && activeTab !== 2) ? (
            <Paper
              sx={{
                flex: 1,
                width: "100%",
                overflow: "hidden",
                borderRadius: 2,
              }}
            >
              <SavingTable
                onViewDetails={handleViewDetails}
                isLoading={isSavingLoading}
                savingData={savingData}
              />
            </Paper>
          ) : activeTab === 1 ? (
            <Box sx={{ textAlign: "center" }}>
              {!selectedPartner ? (
                <Alert severity="info" sx={{ mt: 2 }}>
                  يرجى اختيار شريك لعرض تفاصيل مدخراته
                </Alert>
              ) : isPartnerLoading ? (
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    height: "100%",
                    py: 4,
                  }}
                >
                  <CircularProgress size={40} />
                </Box>
              ) : partnerSavingDetails ? (
                isSmallScreen ? (
                  renderMobilePartnerDetails()
                ) : (
                  renderDesktopPartnerDetails()
                )
              ) : (
                <Alert severity="error">حدث خطأ في تحميل بيانات المدخرات</Alert>
              )}
            </Box>
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