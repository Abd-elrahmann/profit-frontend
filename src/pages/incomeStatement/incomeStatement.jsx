import React, { useState } from "react";
import {
  Box,
  Typography,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Divider,
  Stack,
  Grid,
  IconButton,
  TextField,
  InputAdornment,
  CircularProgress,
  Alert,
  MenuItem,
  Select,
  Collapse,
  Card,
  CardContent,
  Autocomplete,
} from "@mui/material";
import {
  Print,
  FileUpload,
  Lock,
  CalendarToday,
  CalendarMonth,
  Payments,
  TrendingUp as TrendingUpIcon,
  MoneyOff,
  AccountBalanceWallet,
  CheckCircle,
  TableChart,
  Fullscreen,
  MonetizationOn,
  TrendingDown,
  Person,
  ExpandMore,
  ExpandLess,
} from "@mui/icons-material";
import { useQuery } from "@tanstack/react-query";
import { Helmet } from "react-helmet-async";
import dayjs from "dayjs";
import "dayjs/locale/ar";
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { incomeStatementApi } from "./incomeStatementApi";
import { notifyError, notifySuccess } from "../../utilities/toastify";
import {
  exportIncomeStatementToPDF,
  exportIncomeStatementToExcel,
  printIncomeStatement
} from "../../utilities/IncomeStatementExporter";

const MONTHS = [
  "يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو",
  "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"
];

const IncomeStatement = () => {
  const [periodType, setPeriodType] = useState("monthly");
  const [selectedMonth, setSelectedMonth] = useState(dayjs().month());
  const [selectedYear, setSelectedYear] = useState(dayjs().year());
  const [fromDate, setFromDate] = useState(dayjs().startOf('month'));
  const [toDate, setToDate] = useState(dayjs().endOf('month'));
  const [expandedClients, setExpandedClients] = useState({});
  const [expandedCapital, setExpandedCapital] = useState(false);
  const [expandedRevenues, setExpandedRevenues] = useState(true);
  const [expandedExpenses, setExpandedExpenses] = useState(true);

  // توليد السنوات من 2020 إلى 2050
  const years = Array.from({ length: 31 }, (_, i) => 2020 + i);

  // إعداد معلمات الاستعلام بناءً على الفترة المحددة
  const getQueryParams = () => {
    if (periodType === "custom") {
      // استخدام التواريخ المخصصة
      return {
        from: fromDate.format('YYYY-MM-DD'),
        to: toDate.format('YYYY-MM-DD')
      };
    } else if (periodType === "monthly") {
      // استخدام فلترة الشهر والسنة المباشرة في الخادم
      return { month: selectedMonth + 1, year: selectedYear }; // month is 0-based in dayjs, 1-based in backend
    } else {
      // سنوي - إرسال السنة فقط للحصول على السنة الكاملة
      return { year: selectedYear };
    }
  };

  const queryParams = getQueryParams();
  const { data: incomeData, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["incomeStatement", periodType, selectedMonth, selectedYear, fromDate, toDate, queryParams],
    queryFn: () => incomeStatementApi.getIncomeStatement(queryParams),
    retry: 1,
    onError: (error) => {
      notifyError(error.response?.data?.message || "حدث خطأ أثناء تحميل قائمة الدخل");
    },
  });

  const handlePrint = async () => {
    if (!incomeData) {
      notifyError("لا توجد بيانات للطباعة");
      return;
    }

    try {
      await printIncomeStatement(incomeData, periodType, selectedMonth, selectedYear, fromDate, toDate);
    } catch (error) {
      notifyError(error.message || "حدث خطأ أثناء الطباعة");
    }
  };

  const handleExportPDF = async () => {
    if (!incomeData) {
      notifyError("لا توجد بيانات للتصدير");
      return;
    }

    try {
      await exportIncomeStatementToPDF(incomeData, periodType, selectedMonth, selectedYear, fromDate, toDate);
      notifySuccess("تم تصدير التقرير بنجاح");
    } catch (error) {
      notifyError(error.message || "حدث خطأ أثناء تصدير PDF");
    }
  };

  const handleExportExcel = async () => {
    if (!incomeData) {
      notifyError("لا توجد بيانات للتصدير");
      return;
    }

    try {
      await exportIncomeStatementToExcel(incomeData, periodType, selectedMonth, selectedYear, fromDate, toDate);
      notifySuccess("تم تصدير التقرير بنجاح");
    } catch (error) {
      notifyError(error.message || "حدث خطأ أثناء تصدير Excel");
    }
  };


  const formatNumber = (amount) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(Math.abs(amount || 0));
  };

  // تنسيق الأرقام مع الأقواس للقيم السلبية
  const formatAmount = (amount) => {
    if (amount < 0) {
      return `(${formatNumber(amount)})`;
    }
    return formatNumber(amount);
  };

  // تبديل تفاصيل العميل
  const toggleClientDetails = (clientId) => {
    setExpandedClients(prev => ({
      ...prev,
      [clientId]: !prev[clientId]
    }));
  };

  // تبديل تفاصيل رأس المال
  const toggleCapitalDetails = () => {
    setExpandedCapital(prev => !prev);
  };

  // تبديل تفاصيل الإيرادات
  const toggleRevenueDetails = () => {
    setExpandedRevenues(prev => !prev);
  };

  // تبديل تفاصيل المصروفات
  const toggleExpenseDetails = () => {
    setExpandedExpenses(prev => !prev);
  };

  // تحويل البيانات الحقيقية إلى هيكل الجدول
  const getTableData = () => {
    if (!incomeData) return [];

    const data = [];

    // رأس المال
    data.push({
      id: 0,
      name: "إجمالي رأس المال المدفوع الفعلي",
      code: "CAP-001",
      amount: incomeData.totalCapital || 0,
      type: "capital",
      icon: <MonetizationOn />,
      capitalDetails: incomeData.capitalByPartner || []
    });

    // رأس جدول رأس المال
    if (incomeData.capitalByPartner && incomeData.capitalByPartner.length > 0) {
      data.push({
        id: 0.5,
        name: "اسم المستثمر",
        code: "المبلغ",
        type: "capital-table-header"
      });
    }

    // تفاصيل رأس المال عند التوسع
    if (expandedCapital && incomeData.capitalByPartner && incomeData.capitalByPartner.length > 0) {
      incomeData.capitalByPartner.forEach((partner, index) => {
        data.push({
          id: `capital-${index}`,
          name: partner.partnerName,
          code: `PRT-${partner.partnerId}`,
          amount: partner.capitalAmount,
          type: "capital-detail",
          indent: true,
          profitPercentage: partner.profitPercentage
        });
      });
    }

    // إضافة مسافة
    data.push({ id: 0.75, type: "spacer" });

    // عنوان الإيرادات
    data.push({
      id: 1,
      name: "الإيرادات التشغيلية",
      type: "revenue-header",
      icon: <TrendingUpIcon />
    });

    // رأس جدول الإيرادات
    if (incomeData.revenueByClient && incomeData.revenueByClient.length > 0) {
      data.push({
        id: 1.5,
        name: "اسم العميل",
        code: "المبلغ",
        type: "revenue-table-header"
      });
    }

    // إيرادات العملاء
    if (expandedRevenues && incomeData.revenueByClient && incomeData.revenueByClient.length > 0) {
      incomeData.revenueByClient.forEach((client, clientIndex) => {
        // إيرادات العميل
        data.push({
          id: `client-${clientIndex}`,
          name: client.clientName,
          code: `REV-CLIENT-${clientIndex + 1}`,
          amount: client.totalAmount,
          type: "client-revenue",
          clientId: client.clientId,
          entries: client.entries
        });

        // تفاصيل إدخالات العميل
        if (expandedClients[client.clientId]) {
          client.entries.forEach((entry, entryIndex) => {
            data.push({
              id: `client-${clientIndex}-entry-${entryIndex}`,
              name: entry.description,
              code: `JRN-${entry.journalId}`,
              amount: entry.amount,
              type: "revenue-detail",
              indent: true,
              date: entry.date
            });
          });
        }
      });
    }

    // إجمالي الإيرادات
    data.push({
      id: 2.5,
      name: "إجمالي إيرادات الفترة",
      amount: incomeData.totalRevenue || 0,
      type: "revenue-total"
    });

    // إضافة مسافة
    data.push({ id: 2.75, type: "spacer" });

    // عنوان المصروفات
    data.push({
      id: 3,
      name: "المصروفات التشغيلية",
      type: "expense-header",
      icon: <TrendingDown />
    });

    // رأس جدول المصروفات
    if (incomeData.detailedExpenses && incomeData.detailedExpenses.length > 0) {
      data.push({
        id: 3.5,
        name: "وصف المصروف",
        code: "المبلغ",
        type: "expense-table-header"
      });
    }

    // المصروفات التفصيلية
    if (expandedExpenses && incomeData.detailedExpenses && incomeData.detailedExpenses.length > 0) {
      incomeData.detailedExpenses.forEach((expense, index) => {
        data.push({
          id: 4 + index,
          name: expense.description || expense.type,
          code: `EXP-${index + 1}`,
          amount: -expense.amount, // سالب لأنها مصروفات
          type: "expense",
          indent: true,
          expenseType: expense.type,
          employee: expense.employee,
          date: expense.createdAt
        });
      });
    }

    // إجمالي المصروفات
    data.push({
      id: 100,
      name: "إجمالي المصروفات التشغيلية",
      amount: -(incomeData.totalExpenses || 0),
      type: "expense-total"
    });

    // إضافة مسافة
    data.push({ id: 100.75, type: "spacer" });

    // صافي الربح النهائي
    data.push({
      id: 101,
      name: "صافي الربح القابل للتوزيع بعد الإغلاق",
      code: "FIN-FINAL",
      amount: incomeData.netProfit || 0,
      type: "final-profit"
    });

    return data;
  };

  const tableData = getTableData();

  // الحصول على لون الشرائح بناءً على نوع المصروف
  const getChipColor = (expenseType) => {
    switch (expenseType) {
      case 'مصروف رواتب':
        return 'primary';
      case 'مصروف بنزين':
        return 'warning';
      case 'مصروفات انترنت':
        return 'info';
      case 'مصروفات ورقية':
        return 'default';
      case 'مصروفات كهرباء':
        return 'secondary';
      case 'مصروفات تشغيلية':
        return 'success';
      default:
        return 'default';
    }
  };

  // الحصول على معلومات الفترة
  const getPeriodInfo = () => {
    if (!incomeData || !incomeData.period) return null;

    const period = incomeData.period;
    let periodText = "";

    // استخدام معلومات الفترة المُرجعة من الخادم
    if (period.source === "MONTH") {
      periodText = `${MONTHS[selectedMonth]} ${selectedYear}`;
    } else if (period.source === "CUSTOM") {
      periodText = `من ${dayjs(period.from).format('DD/MM/YYYY')} إلى ${dayjs(period.to).format('DD/MM/YYYY')}`;
    } else if (period.source === "CURRENT_PERIOD") {
      periodText = `الفترة الحالية (${dayjs(period.from).format('DD/MM/YYYY')} - ${dayjs(period.to).format('DD/MM/YYYY')})`;
    } else if (period.source === "PERIOD") {
      periodText = `فترة محاسبية محددة (${dayjs(period.from).format('DD/MM/YYYY')} - ${dayjs(period.to).format('DD/MM/YYYY')})`;
    } else {
      // سنوي أو غير محدد
      periodText = `من ${dayjs(period.from).format('DD/MM/YYYY')} إلى ${dayjs(period.to).format('DD/MM/YYYY')}`;
    }

    return {
      text: periodText,
      from: period.from,
      to: period.to,
      source: period.source
    };
  };

  const periodInfo = getPeriodInfo();

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="ar">
      <Helmet>
        <title>قائمة الدخل - نظام المحاسبة</title>
      </Helmet>

      <Box sx={{ 
        maxWidth: 1200,
        margin: '0 auto',
        padding: { xs: 2, md: 3, lg: 1 },
      }}>

        {/* Header */}
        <Box sx={{ 
          textAlign: 'center',
          mb: 2,
          pb: 2,
          borderBottom: '1px solid',
          borderColor: 'divider'
        }}>
          <Typography 
            variant="h4" 
            sx={{ 
              fontWeight: 700,
              color: '#101812',
              fontSize: { xs: '1.75rem', md: '2.25rem' },
              mb: 1
            }}
          >
            قائمة الدخل
          </Typography>
          <Typography 
            variant="body1" 
            sx={{ 
              color: '#5c8a67',
              textAlign: 'center'
            }}
          >
            تقرير مالي رسمي - أساس لتوزيع الأرباح على المساهمين
          </Typography>
        </Box>

        {/* Period Selection */}
        <Paper 
          elevation={0}
          sx={{
            p: 2,
            mb: 3,
            bgcolor: 'white',
            borderRadius: 2,
            border: '1px solid #eaf1eb',
            boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
            textAlign: 'center'
          }}
        >
          <Grid container spacing={2} alignItems="center" justifyContent="center">
            {/* Period Type */}
            <Grid item xs={12} md={4}>
              <Select
                fullWidth
                size="small"
                value={periodType}
                onChange={(e) => setPeriodType(e.target.value)}
                sx={{
                  bgcolor: '#f6f8f6',
                  '& .MuiSelect-select': { 
                    fontWeight: 500,
                    color: '#101812',
                    textAlign: 'center'
                  }
                }}
              >
                <MenuItem value="monthly" sx={{ textAlign: 'center' }}>شهري</MenuItem>
                <MenuItem value="yearly" sx={{ textAlign: 'center' }}>سنوي</MenuItem>
                <MenuItem value="custom" sx={{ textAlign: 'center' }}>فترة مخصصة</MenuItem>
              </Select>
            </Grid>

            {/* Month Selection */}
            {periodType === "monthly" && (
              <Grid item xs={12} md={4}>
                <Select
                  fullWidth
                  size="small"
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  startAdornment={
                    <InputAdornment position="start">
                      <CalendarMonth sx={{ color: '#5c8a67' }} />
                    </InputAdornment>
                  }
                  sx={{
                    bgcolor: '#f6f8f6',
                    '& .MuiSelect-select': { 
                      fontWeight: 500,
                      color: '#101812',
                      textAlign: 'center'
                    }
                  }}
                >
                  {MONTHS.map((month, index) => (
                    <MenuItem key={index} value={index} sx={{ textAlign: 'center' }}>
                      {month}
                    </MenuItem>
                  ))}
                </Select>
              </Grid>
            )}

            {/* Year Selection */}
            {periodType !== "custom" && (
              <Grid item xs={12} md={4}>
                <Autocomplete
                  fullWidth
                  size="small"
                  value={selectedYear}
                  onChange={(event, newValue) => {
                    setSelectedYear(newValue);
                  }}
                  options={years}
                  getOptionLabel={(option) => option.toString()}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      placeholder="اختر السنة"
                      InputProps={{
                        ...params.InputProps,
                        startAdornment: (
                          <InputAdornment position="start">
                            <CalendarToday sx={{ color: '#5c8a67' }} />
                          </InputAdornment>
                        ),
                      }}
                      sx={{
                        bgcolor: '#f6f8f6',
                        width:"200px",
                        '& .MuiInputBase-input': {
                          fontWeight: 500,
                          color: '#101812',
                          textAlign: 'center'
                        }
                      }}
                    />
                  )}
                />
              </Grid>
            )}

            {/* Custom Date Range */}
            {periodType === "custom" && (
              <>
                <Grid item xs={12} md={3}>
                  <DatePicker
                    label="من تاريخ"
                    value={fromDate}
                    onChange={(newValue) => setFromDate(newValue)}
                    format="DD/MM/YYYY"
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        size: "small",
                        sx: {
                          bgcolor: '#f6f8f6',
                          '& .MuiInputBase-input': {
                            fontWeight: 500,
                            color: '#101812',
                          }
                        }
                      }
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={3}>
                  <DatePicker
                    label="إلى تاريخ"
                    value={toDate}
                    onChange={(newValue) => setToDate(newValue)}
                    format="DD/MM/YYYY"
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        size: "small",
                        sx: {
                          bgcolor: '#f6f8f6',
                          '& .MuiInputBase-input': {
                            fontWeight: 500,
                            color: '#101812',
                          }
                        }
                      }
                    }}
                  />
                </Grid>
              </>
            )}

          </Grid>
        </Paper>

        {/* Action Buttons */}
        {!isLoading && !isError && (
          <Stack direction="row" justifyContent="space-around" sx={{ mb: 3 }}>
            <Button
              variant="outlined"
              startIcon={<Print sx={{marginLeft: '10px'}} />}
              onClick={handlePrint}
              sx={{
                borderColor: '#F97316',
                color: '#F97316',
                fontWeight: 600,
                '&:hover': {
                  borderColor: '#EA580C',
                  bgcolor: '#FEF3C7',
                  color: '#EA580C'
                }
              }}
            >
              طباعة
            </Button>
            <Button
              variant="contained"
              startIcon={<TableChart sx={{marginLeft: '10px'}} />}
              onClick={handleExportExcel}
              sx={{
                bgcolor: '#DC2626',
                fontWeight: 600,
                '&:hover': {
                  bgcolor: '#B91C1C'
                }
              }}
            >
              تصدير Excel
            </Button>
            <Button
              variant="contained"
              startIcon={<FileUpload sx={{marginLeft: '10px'}} />}
              onClick={handleExportPDF}
              sx={{
                bgcolor: '#2E8B45',
                fontWeight: 600,
                '&:hover': {
                  bgcolor: '#257239'
                }
              }}
            >
              تصدير PDF
            </Button>
          </Stack>
        )}

        {/* Loading State */}
        {isLoading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 8 }}>
            <CircularProgress size={60} />
          </Box>
        )}

        {/* Error State */}
        {isError && (
          <Paper sx={{ p: 4, textAlign: 'center', bgcolor: 'error.light', mb: 3 }}>
            <Typography color="error" variant="h6">
              حدث خطأ في تحميل البيانات
            </Typography>
            <Typography variant="body2" sx={{ mt: 1 }}>
              {error?.message}
            </Typography>
            <Button variant="outlined" onClick={() => refetch()} sx={{ mt: 2 }}>
              إعادة المحاولة
            </Button>
          </Paper>
        )}

        {/* Summary Cards */}
        {!isLoading && !isError && incomeData && (
          <>
            {/* Period Info */}
            {periodInfo && (
              <Box sx={{ mb: 3, textAlign: 'center' }}>
                <Chip
                  label={`الفترة: ${periodInfo.text}`}
                  color="primary"
                  variant="outlined"
                  sx={{ fontSize: '0.9rem', fontWeight: 600 }}
                />
              </Box>
            )}

            <Grid container spacing={2} sx={{ mb: 3, textAlign: 'center' }} justifyContent="center">
              {/* Total Capital */}
              <Grid item xs={12} md={3} sx={{ width: '250px', maxWidth: '100%' }}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 2,
                    bgcolor: 'white',
                    borderRadius: 2,
                    border: '1px solid #eaf1eb',
                    height: '100%'
                  }}
                >
                  <MonetizationOn sx={{
                    color: '#2E8B45',
                    fontSize: 30,
                    mb: 1
                  }} />
                  <Typography sx={{ color: '#5c8a67', fontSize: '0.875rem', mb: 1 }}>
                    رأس المال الفعلي
                  </Typography>
                  <Typography sx={{
                    color: '#101812',
                    fontSize: '1.25rem',
                    fontWeight: 700
                  }}>
                    {formatNumber(incomeData.totalCapital)}
                  </Typography>
                </Paper>
              </Grid>

              {/* Total Revenue */}
              <Grid item xs={12} md={3} sx={{ width: '250px', maxWidth: '100%' }}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 2,
                    bgcolor: 'white',
                    borderRadius: 2,
                    border: '1px solid #eaf1eb',
                    height: '100%'
                  }}
                >
                  <Payments sx={{ 
                    color: '#2E8B45', 
                    fontSize: 30,
                    mb: 1 
                  }} />
                  <Typography sx={{ color: '#5c8a67', fontSize: '0.875rem', mb: 1 }}>
                    إجمالي الإيرادات
                  </Typography>
                  <Typography sx={{ 
                    color: '#101812',
                    fontSize: '1.25rem',
                    fontWeight: 700
                  }}>
                    {formatNumber(incomeData.totalRevenue)}
                  </Typography>
                </Paper>
              </Grid>

              {/* Total Expenses */}
              <Grid item xs={12} md={3} sx={{ width: '250px', maxWidth: '100%' }}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 2,
                    bgcolor: 'white',
                    borderRadius: 2,
                    border: '1px solid #eaf1eb',
                    height: '100%'
                  }}
                >
                  <MoneyOff sx={{ 
                    color: '#DC2626', 
                    fontSize: 30,
                    mb: 1 
                  }} />
                  <Typography sx={{ color: '#5c8a67', fontSize: '0.875rem', mb: 1 }}>
                    المصروفات التشغيلية
                  </Typography>
                  <Typography sx={{ 
                    color: '#DC2626',
                    fontSize: '1.25rem',
                    fontWeight: 700
                  }}>
                    {formatNumber(incomeData.totalExpenses)}
                  </Typography>
                </Paper>
              </Grid>

              {/* Net Profit/Loss */}
              <Grid item xs={12} md={3} sx={{ width: '250px', maxWidth: '100%' }}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 2,
                    bgcolor: incomeData.netProfit >= 0 ? 'rgba(220, 252, 231, 0.5)' : 'rgba(254, 226, 226, 0.5)',
                    borderRadius: 2,
                    border: `1px solid ${incomeData.netProfit >= 0 ? '#2E8B45' : '#DC2626'}`,
                    height: '100%'
                  }}
                >
                  <AccountBalanceWallet sx={{ 
                    color: incomeData.netProfit >= 0 ? '#2E8B45' : '#DC2626', 
                    fontSize: 30,
                    mb: 1 
                  }} />
                  <Typography sx={{ 
                    color: incomeData.netProfit >= 0 ? '#2E8B45' : '#DC2626', 
                    fontSize: '0.875rem', 
                    mb: 1,
                    fontWeight: 600
                  }}>
                    {incomeData.netProfit >= 0 ? 'صافي الربح' : 'صافي الخسارة'}
                  </Typography>
                  <Typography sx={{ 
                    color: incomeData.netProfit >= 0 ? '#2E8B45' : '#DC2626',
                    fontSize: '1.25rem',
                    fontWeight: 700
                  }}>
                    {formatNumber(Math.abs(incomeData.netProfit))}
                  </Typography>
                </Paper>
              </Grid>
            </Grid>


            {/* Detailed Statement */}
            <Paper
              elevation={0}
              sx={{
                bgcolor: 'white',
                borderRadius: 2,
                border: '1px solid #eaf1eb',
                overflow: 'hidden',
                mb: 3
              }}
            >
              {/* Table Header */}
              <Box sx={{ 
                p: 3,
                borderBottom: '1px solid #eaf1eb',
                bgcolor: 'rgba(249, 251, 249, 0.5)',
                textAlign: 'center'
              }}>
                <TableChart sx={{ 
                  color: '#2E8B45', 
                  fontSize: 30,
                  mb: 1 
                }} />
                <Typography sx={{ 
                  fontSize: '1.25rem',
                  fontWeight: 700,
                  color: '#101812'
                }}>
                  البيان التفصيلي
                </Typography>
                {periodInfo && (
                  <Typography sx={{ 
                    fontSize: '0.875rem',
                    color: '#5c8a67',
                    mt: 0.5
                  }}>
                    للفترة: {periodInfo.text}
                  </Typography>
                )}
              </Box>

              {/* Table */}
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow sx={{ bgcolor: 'rgba(234, 241, 235, 0.5)' }}>
                      <TableCell sx={{ 
                        py: 2,
                        px: 3,
                        color: '#5c8a67',
                        fontSize: '0.875rem',
                        fontWeight: 600,
                        textAlign: 'center'
                      }}>
                        البند
                      </TableCell>
                      <TableCell align="center" sx={{ 
                        py: 2,
                        px: 3,
                        color: '#5c8a67',
                        fontSize: '0.875rem',
                        fontWeight: 600,
                        textAlign: 'center'
                      }}>
                        الرمز المرجعي
                      </TableCell>
                      <TableCell align="center" sx={{ 
                        py: 2,
                        px: 3,
                        color: '#5c8a67',
                        fontSize: '0.875rem',
                        fontWeight: 600,
                        textAlign: 'center'
                      }}>
                        المبلغ
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {tableData.map((row) => {
                      if (row.type === "spacer") {
                        return (
                          <TableRow key={row.id}>
                            <TableCell colSpan={3} sx={{ py: 1, bgcolor: 'rgba(0,0,0,0.02)' }} />
                          </TableRow>
                        );
                      }

                      if (row.type === "revenue-header") {
                        return (
                          <TableRow key={row.id} sx={{ bgcolor: 'rgba(220, 252, 231, 0.3)' }}>
                            <TableCell colSpan={3} sx={{ py: 2, px: 3 }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Typography sx={{
                                  fontSize: '0.875rem',
                                  fontWeight: 700,
                                  color: '#2E8B45',
                                  mr: 1
                                }}>
                                  {row.name}
                                </Typography>
                                {incomeData.revenueByClient && incomeData.revenueByClient.length > 0 && (
                                  <IconButton
                                    size="small"
                                    onClick={toggleRevenueDetails}
                                    sx={{ color: '#2E8B45' }}
                                  >
                                    {expandedRevenues ? <ExpandLess /> : <ExpandMore />}
                                  </IconButton>
                                )}
                              </Box>
                            </TableCell>
                          </TableRow>
                        );
                      }

                      if (row.type === "expense-header") {
                        return (
                          <TableRow key={row.id} sx={{ bgcolor: 'rgba(254, 226, 226, 0.3)' }}>
                            <TableCell colSpan={3} sx={{ py: 2, px: 3 }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Typography sx={{
                                  fontSize: '0.875rem',
                                  fontWeight: 700,
                                  color: '#DC2626',
                                  mr: 1
                                }}>
                                  {row.name}
                                </Typography>
                                {incomeData.detailedExpenses && incomeData.detailedExpenses.length > 0 && (
                                  <IconButton
                                    size="small"
                                    onClick={toggleExpenseDetails}
                                    sx={{ color: '#DC2626' }}
                                  >
                                    {expandedExpenses ? <ExpandLess /> : <ExpandMore />}
                                  </IconButton>
                                )}
                              </Box>
                            </TableCell>
                          </TableRow>
                        );
                      }

                      if (row.type === "client-revenue") {
                        return (
                          <React.Fragment key={row.id}>
                            <TableRow sx={{ '&:hover': { bgcolor: 'rgba(0,0,0,0.02)' } }}>
                              <TableCell sx={{ py: 2, px: 3, textAlign: 'center' }}>
                                <Stack direction="row" alignItems="center" justifyContent="center" spacing={1}>
                                  <Typography>
                                    {row.name}
                                  </Typography>
                                  <IconButton
                                    size="small"
                                    onClick={() => toggleClientDetails(row.clientId)}
                                    sx={{ p: 0.5 }}
                                  >
                                    {expandedClients[row.clientId] ? <ExpandLess /> : <ExpandMore />}
                                  </IconButton>
                                </Stack>
                              </TableCell>
                              <TableCell align="center" sx={{ py: 2, px: 3 }}>
                                <Typography sx={{ 
                                  fontSize: '0.75rem',
                                  color: '#5c8a67'
                                }}>
                                  {row.code}
                                </Typography>
                              </TableCell>
                              <TableCell align="center" sx={{ py: 2, px: 3 }}>
                                <Typography sx={{ 
                                  fontWeight: 600,
                                  color: '#101812'
                                }}>
                                  {formatAmount(row.amount)}
                                </Typography>
                              </TableCell>
                            </TableRow>
                          </React.Fragment>
                        );
                      }

                      if (row.type === "revenue-table-header") {
                        return (
                          <TableRow key={row.id} sx={{ bgcolor: 'rgba(220, 252, 231, 0.2)' }}>
                            <TableCell sx={{ py: 1, px: 3, textAlign: 'center', fontWeight: 600, color: '#2E8B45' }}>
                              {row.name}
                            </TableCell>
                            <TableCell align="center" sx={{ py: 1, px: 3, fontWeight: 600, color: '#2E8B45' }}>
                              الرمز المرجعي
                            </TableCell>
                            <TableCell align="center" sx={{ py: 1, px: 3, fontWeight: 600, color: '#2E8B45' }}>
                              {row.code}
                            </TableCell>
                          </TableRow>
                        );
                      }

                      if (row.type === "revenue-detail") {
                        return (
                          <TableRow key={row.id} sx={{ bgcolor: 'rgba(220, 252, 231, 0.1)', '&:hover': { bgcolor: 'rgba(0,0,0,0.02)' } }}>
                            <TableCell sx={{ py: 2, px: 3, textAlign: 'center', pl: 6 }}>
                              <Typography sx={{ fontSize: '0.875rem' }}>
                                {row.name}
                              </Typography>
                              {row.date && (
                                <Typography variant="caption" color="text.secondary" display="block">
                                  {dayjs(row.date).format('DD/MM/YYYY')}
                                </Typography>
                              )}
                            </TableCell>
                            <TableCell align="center" sx={{ py: 2, px: 3 }}>
                              <Typography sx={{
                                fontSize: '0.75rem',
                                color: '#5c8a67'
                              }}>
                                {row.code}
                              </Typography>
                            </TableCell>
                            <TableCell align="center" sx={{ py: 2, px: 3 }}>
                              <Typography sx={{
                                fontWeight: 500,
                                color: '#101812'
                              }}>
                                {formatAmount(row.amount)}
                              </Typography>
                            </TableCell>
                          </TableRow>
                        );
                      }

                      if (row.type === "capital-table-header") {
                        return (
                          <TableRow key={row.id} sx={{ bgcolor: 'rgba(46, 139, 69, 0.1)' }}>
                            <TableCell sx={{ py: 1, px: 3, textAlign: 'center', fontWeight: 600, color: '#2E8B45' }}>
                              {row.name}
                            </TableCell>
                            <TableCell align="center" sx={{ py: 1, px: 3, fontWeight: 600, color: '#2E8B45' }}>
                              الرمز المرجعي
                            </TableCell>
                            <TableCell align="center" sx={{ py: 1, px: 3, fontWeight: 600, color: '#2E8B45' }}>
                              {row.code}
                            </TableCell>
                          </TableRow>
                        );
                      }

                      if (row.type === "capital-detail") {
                        return (
                          <TableRow key={row.id} sx={{ bgcolor: 'rgba(46, 139, 69, 0.05)', '&:hover': { bgcolor: 'rgba(0,0,0,0.02)' } }}>
                            <TableCell sx={{ py: 2, px: 3, textAlign: 'center', pl: 6 }}>
                              <Stack direction="row" alignItems="center" justifyContent="center" spacing={1}>
                                <Typography sx={{ fontSize: '0.875rem',fontWeight: 700 }}>
                                  {row.name}
                                </Typography>
                              </Stack>
                            </TableCell>
                            <TableCell align="center" sx={{ py: 2, px: 3 }}>
                              <Typography sx={{
                                fontSize: '0.75rem',
                                color: '#5c8a67'
                              }}>
                                {row.code}
                              </Typography>
                            </TableCell>
                            <TableCell align="center" sx={{ py: 2, px: 3 }}>
                              <Typography sx={{
                                fontWeight: 500,
                                color: '#2E8B45'
                              }}>
                                {formatAmount(row.amount)}
                              </Typography>
                            </TableCell>
                          </TableRow>
                        );
                      }

                      if (row.type === "revenue-total" || row.type === "expense-total") {
                        return (
                          <TableRow key={row.id} sx={{ 
                            borderTop: '1px dashed rgba(0,0,0,0.1)',
                            bgcolor: row.type === "revenue-total" 
                              ? 'rgba(220, 252, 231, 0.3)' 
                              : 'rgba(254, 226, 226, 0.2)'
                          }}>
                            <TableCell sx={{ 
                              py: 2, 
                              px: 3, 
                              fontWeight: 600, 
                              color: '#101812',
                              textAlign: 'center'
                            }}>
                              {row.name}
                            </TableCell>
                            <TableCell sx={{ py: 2, px: 3, textAlign: 'center' }} />
                            <TableCell align="center" sx={{ 
                              py: 2, 
                              px: 3,
                              color: row.type === "expense-total" ? '#DC2626' : '#101812',
                              fontWeight: 600
                            }}>
                              {formatAmount(row.amount)}
                            </TableCell>
                          </TableRow>
                        );
                      }

                      if (row.type === "final-profit") {
                        const isProfit = row.amount >= 0;
                        return (
                          <TableRow key={row.id} sx={{ 
                            bgcolor: isProfit ? '#2E8B45' : '#DC2626',
                            borderTop: `2px solid ${isProfit ? '#166534' : '#991B1B'}`
                          }}>
                            <TableCell sx={{ py: 3, px: 3, textAlign: 'center' }}>
                              <Typography sx={{ 
                                color: 'white',
                                fontSize: '1.125rem',
                                fontWeight: 700
                              }}>
                                {row.name}
                              </Typography>
                            </TableCell>
                            <TableCell align="center" sx={{ py: 3, px: 3 }}>
                              <Typography sx={{ 
                                fontSize: '0.875rem',
                                color: 'rgba(255,255,255,0.8)'
                              }}>
                                {row.code}
                              </Typography>
                            </TableCell>
                            <TableCell align="center" sx={{ py: 3, px: 3 }}>
                              <Typography sx={{ 
                                fontWeight: 900,
                                color: 'white',
                                fontSize: '1.25rem'
                              }}>
                                {formatAmount(row.amount)}
                              </Typography>
                            </TableCell>
                          </TableRow>
                        );
                      }

                      // صف رأس المال
                      if (row.type === "capital") {
                        return (
                          <TableRow key={row.id} sx={{ '&:hover': { bgcolor: 'rgba(0,0,0,0.02)' } }}>
                            <TableCell sx={{ py: 2, px: 3, textAlign: 'center' }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Typography sx={{ fontWeight: 700 }}>
                                  {row.name}
                                </Typography>
                                {incomeData.capitalByPartner && incomeData.capitalByPartner.length > 0 && (
                                  <IconButton
                                    size="small"
                                    onClick={toggleCapitalDetails}
                                    sx={{ ml: 1, color: '#5c8a67' }}
                                  >
                                    {expandedCapital ? <ExpandLess /> : <ExpandMore />}
                                  </IconButton>
                                )}
                              </Box>
                            </TableCell>
                            <TableCell align="center" sx={{ py: 2, px: 3 }}>
                              {row.code && (
                                <Typography sx={{
                                  fontSize: '0.75rem',
                                  color: '#5c8a67'
                                }}>
                                  {row.code}
                                </Typography>
                              )}
                            </TableCell>
                            <TableCell align="center" sx={{ py: 2, px: 3 }}>
                              <Typography sx={{
                                fontWeight: 700,
                                color: row.amount >= 0 ? '#101812' : '#DC2626'
                              }}>
                                {formatAmount(row.amount)}
                              </Typography>
                            </TableCell>
                          </TableRow>
                        );
                      }

                      if (row.type === "expense-table-header") {
                        return (
                          <TableRow key={row.id} sx={{ bgcolor: 'rgba(254, 226, 226, 0.2)' }}>
                            <TableCell sx={{ py: 1, px: 3, textAlign: 'center', fontWeight: 600, color: '#DC2626' }}>
                              {row.name}
                            </TableCell>
                            <TableCell align="center" sx={{ py: 1, px: 3, fontWeight: 600, color: '#DC2626' }}>
                              الرمز المرجعي
                            </TableCell>
                            <TableCell align="center" sx={{ py: 1, px: 3, fontWeight: 600, color: '#DC2626' }}>
                              {row.code}
                            </TableCell>
                          </TableRow>
                        );
                      }

                      // الصفوف العادية
                      return (
                        <TableRow key={row.id} sx={{ '&:hover': { bgcolor: 'rgba(0,0,0,0.02)' } }}>
                          <TableCell sx={{ py: 2, px: 3, textAlign: 'center' }}>
                            <Typography>
                              {row.name}
                            </Typography>
                            {row.expenseType && (
                              <Box sx={{ mt: 1 }}>
                                <Chip
                                  label={row.expenseType}
                                  size="small"
                                  color={getChipColor(row.expenseType)}
                                  sx={{ fontSize: '0.75rem' }}
                                />
                                {row.employee && (
                                  <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.5 }}>
                                    للموظف: {row.employee}
                                  </Typography>
                                )}
                              </Box>
                            )}
                          </TableCell>
                          <TableCell align="center" sx={{ py: 2, px: 3 }}>
                            {row.code && (
                              <Typography sx={{
                                fontSize: '0.75rem',
                                color: '#5c8a67'
                              }}>
                                {row.code}
                              </Typography>
                            )}
                          </TableCell>
                          <TableCell align="center" sx={{ py: 2, px: 3 }}>
                            <Typography sx={{
                              fontWeight: row.type === "capital" ? 700 : 500,
                              color: row.amount >= 0 ? '#101812' : '#DC2626'
                            }}>
                              {formatAmount(row.amount)}
                            </Typography>
                            {row.date && (
                              <Typography variant="caption" color="text.secondary" display="block">
                                {dayjs(row.date).format('DD/MM/YYYY')}
                              </Typography>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>

          </>
        )}

        {/* Empty State */}
        {!isLoading && !isError && !incomeData && (
          <Paper sx={{ p: 6, textAlign: 'center' }}>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              لا توجد بيانات للفترة المحددة
            </Typography>
            <Typography variant="body2" color="text.secondary">
              قم بتحديد فترة أخرى واضغط على "عرض التقرير"
            </Typography>
          </Paper>
        )}
      </Box>
    </LocalizationProvider>
  );
};

export default IncomeStatement;