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
  Stack,
  Grid,
  IconButton,
  TextField,
  InputAdornment,
  CircularProgress,
  Alert,
  MenuItem,
  Select,
  Autocomplete,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Tooltip,
  useTheme,
} from "@mui/material";
import {
  Print,
  FileUpload,
  CalendarToday,
  CalendarMonth,
  Payments,
  TrendingUp as TrendingUpIcon,
  MoneyOff,
  AccountBalanceWallet,
  TableChart,
  MonetizationOn,
  TrendingDown,
  ExpandMore,
  ExpandLess,
  Info,
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
  const theme = useTheme();
  const [periodType, setPeriodType] = useState("monthly");
  const [selectedMonth, setSelectedMonth] = useState(dayjs().month());
  const [selectedYear, setSelectedYear] = useState(dayjs().year());
  const [fromDate, setFromDate] = useState(dayjs().startOf('month'));
  const [toDate, setToDate] = useState(dayjs().endOf('month'));
  const [selectedPeriodId, setSelectedPeriodId] = useState("");

  // توليد السنوات من 2020 إلى 2050
  const years = Array.from({ length: 31 }, (_, i) => 2020 + i);

  // جلب الفترات المحاسبية
  const { data: accountingPeriods = [] } = useQuery({
    queryKey: ["accountingPeriods"],
    queryFn: () => incomeStatementApi.getAccountingPeriods(),
    enabled: periodType === "period",
  });

  // إعداد معلمات الاستعلام بناءً على الفترة المحددة
  const getQueryParams = () => {
    if (periodType === "period") {
      // استخدام معرف الفترة المحاسبية
      return { periodId: selectedPeriodId };
    } else if (periodType === "custom") {
      // استخدام التواريخ المخصصة
      return {
        from: fromDate.format('YYYY-MM-DD'),
        to: toDate.format('YYYY-MM-DD')
      };
    } else if (periodType === "monthly") {
      // استخدام فلترة الشهر والسنة
      return { month: selectedMonth + 1, year: selectedYear };
    } else {
      // سنوي
      return { year: selectedYear };
    }
  };

  const queryParams = getQueryParams();
  const { data: incomeData, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["incomeStatement", periodType, selectedMonth, selectedYear, fromDate, toDate, selectedPeriodId, queryParams],
    queryFn: () => incomeStatementApi.getIncomeStatement(queryParams),
    retry: 1,
    enabled: periodType !== "period" || !!selectedPeriodId,
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

  const getPeriodInfo = () => {
    if (!incomeData || !incomeData.period) return null;

    const period = incomeData.period;
    let periodText = "";

    if (period.source === "MONTH") {
      periodText = `${MONTHS[selectedMonth]} ${selectedYear}`;
    } else if (period.source === "CUSTOM") {
      periodText = `من ${dayjs(period.from).format('DD/MM/YYYY')} إلى ${dayjs(period.to).format('DD/MM/YYYY')}`;
    } else if (period.source === "CURRENT_PERIOD") {
      periodText = `الفترة الحالية (${dayjs(period.from).format('DD/MM/YYYY')} - ${dayjs(period.to).format('DD/MM/YYYY')})`;
    } else if (period.source === "PERIOD") {
      periodText = `فترة محاسبية محددة (${dayjs(period.from).format('DD/MM/YYYY')} - ${dayjs(period.to).format('DD/MM/YYYY')})`;
    } else {
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

     

        {/* Filters and Action Buttons */}
        <Grid container spacing={3} justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
          {/* Filters Section */}
          <Grid item xs={12} md={8}>
            <Paper
              elevation={0}
              sx={{
                p: 2,
                bgcolor: theme.palette.background.paper,
                borderRadius: 2,
                border: `1px solid ${theme.palette.divider}`,
                boxShadow: theme.palette.mode === 'dark' ? '0 1px 2px rgba(255,255,255,0.1)' : '0 1px 2px rgba(0,0,0,0.05)',
              }}
            >
              <Grid container spacing={2} alignItems="center">
                {/* Period Type */}
                <Grid item xs={12} md={3}>
                    <Select
                      fullWidth
                      size="small"
                      value={periodType}
                      onChange={(e) => {
                        setPeriodType(e.target.value);
                        if (e.target.value !== "period") {
                          setSelectedPeriodId("");
                        }
                      }}
                      sx={{
                        bgcolor: theme.palette.background.default,
                        '& .MuiSelect-select': {
                          fontWeight: 500,
                          color: theme.palette.text.primary,
                          textAlign: 'center'
                        }
                      }}
                    >
                    <MenuItem value="monthly" sx={{ textAlign: 'center' }}>شهري</MenuItem>
                    <MenuItem value="yearly" sx={{ textAlign: 'center' }}>سنوي</MenuItem>
                    <MenuItem value="custom" sx={{ textAlign: 'center' }}>فترة مخصصة</MenuItem>
                    <MenuItem value="period" sx={{ textAlign: 'center' }}>فترة محاسبية</MenuItem>
                  </Select>
                </Grid>

                {/* Month Selection */}
                {periodType === "monthly" && (
                  <Grid item xs={12} md={3}>
                    <Select
                      fullWidth
                      size="small"
                      value={selectedMonth}
                      onChange={(e) => setSelectedMonth(e.target.value)}
                      startAdornment={
                        <InputAdornment position="start">
                          <CalendarMonth sx={{ color: theme.palette.primary.main }} />
                        </InputAdornment>
                      }
                      sx={{
                        bgcolor: theme.palette.background.default,
                        '& .MuiSelect-select': {
                          fontWeight: 500,
                          color: theme.palette.text.primary,
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
                {periodType === "monthly" || periodType === "yearly" ? (
                  <Grid item xs={12} md={3} sx={{ width: '250px', maxWidth: '100%' }}>
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
                                <CalendarToday sx={{ color: theme.palette.primary.main }} />
                              </InputAdornment>
                            ),
                          }}
                          sx={{
                            bgcolor: theme.palette.background.default,
                            '& .MuiInputBase-input': {
                              fontWeight: 500,
                              color: theme.palette.text.primary,
                              textAlign: 'center'
                            }
                          }}
                        />
                      )}
                    />
                  </Grid>
                ) : null}

                {/* Accounting Period Selection */}
                {periodType === "period" && (
                  <Grid item xs={12} md={6}>
                    <Autocomplete
                      fullWidth
                      size="small"
                      value={accountingPeriods.find(p => p.id === selectedPeriodId) || null}
                      onChange={(event, newValue) => {
                        setSelectedPeriodId(newValue?.id || "");
                      }}
                      options={[{ id: "", name: "لا توجد فترة محددة", startDate: null, endDate: null }, ...accountingPeriods]}
                      getOptionLabel={(option) =>
                        option && option.name ? `${option.name} (${option.startDate ? dayjs(option.startDate).format('DD/MM/YYYY') : ''} - ${option.endDate ? dayjs(option.endDate).format('DD/MM/YYYY') : 'مفتوحة'})` : 'لا توجد فترة محددة'
                      }
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          placeholder="اختر الفترة المحاسبية"
                          InputProps={{
                            ...params.InputProps,
                            startAdornment: (
                              <InputAdornment position="start">
                                <CalendarMonth sx={{ color: theme.palette.primary.main }} />
                              </InputAdornment>
                            ),
                          }}
                          sx={{
                            bgcolor: theme.palette.background.default,
                            '& .MuiInputBase-input': {
                              fontWeight: 500,
                              color: theme.palette.text.primary,
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
                              bgcolor: theme.palette.background.default,
                              '& .MuiInputBase-input': {
                                fontWeight: 500,
                                color: theme.palette.text.primary,
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
                              bgcolor: theme.palette.background.default,
                              '& .MuiInputBase-input': {
                                fontWeight: 500,
                                color: theme.palette.text.primary,
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
          </Grid>

          {/* Action Buttons Section */}
          {!isLoading && !isError && incomeData && (
            <Grid item xs={12} md={3}>
           <Stack direction="row" justifyContent="flex-end" sx={{ gap: 1 }}>
  <Button
    variant="outlined"
    startIcon={<Print />}
    onClick={handlePrint}
    size="small"
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
    startIcon={<TableChart />}
    onClick={handleExportExcel}
    size="small"
    sx={{
      bgcolor: '#DC2626',
      fontWeight: 600,
      '&:hover': {
        bgcolor: '#B91C1C'
      }
    }}
  >
    Excel
  </Button>

  <Button
    variant="contained"
    startIcon={<FileUpload />}
    onClick={handleExportPDF}
    size="small"
    sx={{
      bgcolor: '#2E8B45',
      fontWeight: 600,
      '&:hover': {
        bgcolor: '#257239'
      }
    }}
  >
    PDF
  </Button>
</Stack>

            </Grid>
          )}
        </Grid>

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

        {/* Net Profit - King Card */}
        {!isLoading && !isError && incomeData && (
          <>
            {/* Period Info */}
            {periodInfo && (
              <Box sx={{ mb: 3, textAlign: 'center' }}>
                <Chip
                  label={`الفترة ${periodInfo.text}`}
                  color="primary"
                  variant="outlined"
                  sx={{ fontSize: '0.9rem', fontWeight: 600 }}
                />
              </Box>
            )}

            {/* Net Profit - King Card */}
            <Grid container justifyContent="center" sx={{ mb: 4, width: '100%' }}>
              <Grid item xs={12} md={8}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 4,
                    width: '100%',
                    color: 'white',
                    textAlign: 'center',
                    borderRadius: 3,
                    position: 'relative',
                    overflow: 'hidden',
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                    }
                  }}
                >
                  <Box sx={{ position: 'relative', zIndex: 1 }}>
                    <AccountBalanceWallet sx={{
                      fontSize: 48,
                      color: theme.palette.primary.main,
                      mb: 2,
                      opacity: 0.9
                    }} />
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
                      <Typography sx={{
                        fontSize: '1.25rem',
                        fontWeight: 'bold',
                        opacity: 0.9,
                        mr: 1
                      }}>
                        {incomeData.netProfit >= 0 ? 'صافي الربح القابل للتوزيع' : 'صافي الخسارة'}
                      </Typography>
                      <Tooltip title="صافي الربح = إجمالي الإيرادات - إجمالي المصروفات" arrow>
                        <Info sx={{ fontSize: 20, opacity: 0.7, cursor: 'help' }} />
                      </Tooltip>
                    </Box>
                    <Typography sx={{
                      fontSize: '3rem',
                      color:incomeData.netProfit >= 0 ? theme.palette.success.main : theme.palette.error.main,
                      fontWeight: 900,
                      mb: 1
                    }}>
                      {formatNumber(Math.abs(incomeData.netProfit))}
                    </Typography>
                    <Typography sx={{
                      fontSize: '0.875rem',
                      opacity: 0.8
                    }}>
                      المبلغ المتبقي بعد خصم جميع المصروفات - جاهز للتوزيع على المساهمين
                    </Typography>
                  </Box>
                </Paper>
              </Grid>
            </Grid>

            {/* Summary Cards */}
            <Grid container spacing={2} sx={{ mb: 4, textAlign: 'center' }} justifyContent="center">
              {/* Total Capital */}
              <Grid item xs={12} md={4} sx={{ width: '280px', maxWidth: '100%' }}>
                <Paper
                  elevation={1}
                  sx={{
                    p: 3,
                    bgcolor: theme.palette.background.paper,
                    borderRadius: 2,
                    border: `1px solid ${theme.palette.divider}`,
                    height: '100%',
                    transition: 'transform 0.2s',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: theme.palette.mode === 'dark' ? '0 4px 8px rgba(255,255,255,0.1)' : '0 4px 8px rgba(0,0,0,0.1)',
                    }
                  }}
                >
                  <MonetizationOn sx={{
                    color: theme.palette.primary.main,
                    fontSize: 32,
                    mb: 1
                  }} />
                  <Typography sx={{ color: theme.palette.primary.main, fontSize: '0.9rem', mb: 1, fontWeight: 600 }}>
                    رأس المال المدفوع الفعلي
                  </Typography>
                  <Typography sx={{
                    color: theme.palette.text.primary,
                    fontSize: '1.5rem',
                    fontWeight: 700
                  }}>
                    {formatNumber(incomeData.totalCapital)}
                  </Typography>
                </Paper>
              </Grid>

              {/* Total Revenue */}
              <Grid item xs={12} md={4} sx={{ width: '280px', maxWidth: '100%' }}>
                <Paper
                  elevation={1}
                  sx={{
                    p: 3,
                    bgcolor: theme.palette.background.paper,
                    borderRadius: 2,
                    border: `1px solid ${theme.palette.divider}`,
                    height: '100%',
                    transition: 'transform 0.2s',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: theme.palette.mode === 'dark' ? '0 4px 8px rgba(255,255,255,0.1)' : '0 4px 8px rgba(0,0,0,0.1)',
                    }
                  }}
                >
                  <TrendingUpIcon sx={{
                    color: theme.palette.success.main,
                    fontSize: 32,
                    mb: 1
                  }} />
                  <Typography sx={{ color: theme.palette.primary.main, fontSize: '0.9rem', mb: 1, fontWeight: 600 }}>
                    إجمالي الدخل المحقق خلال الفترة
                  </Typography>
                  <Typography sx={{
                    color: theme.palette.text.primary,
                    fontSize: '1.5rem',
                    fontWeight: 700
                  }}>
                    {formatNumber(incomeData.revenues?.total || 0)}
                  </Typography>
                  {/* Revenue Distribution Display */}
                  {incomeData.revenueByClient && incomeData.revenueByClient.length > 0 && (
                    <Box sx={{ mt: 2, fontSize: '0.75rem', pt: 2, borderTop: `1px solid ${theme.palette.divider}` }}>
                      {(() => {
                        const totalCompanyRevenue = incomeData.revenueByClient.reduce((sum, client) => sum + (client.companyRevenue || 0), 0);
                        const totalPartnersRevenue = incomeData.revenueByClient.reduce((sum, client) => sum + (client.partnersRevenue || 0), 0);
                        return (
                          <>
                            {totalPartnersRevenue > 0 && (
                              <Typography variant="caption" display="block" sx={{ color: theme.palette.primary.main, fontWeight: 'bold', mb: 0.5 }}>
                                حصة الشركاء: {formatNumber(totalPartnersRevenue)}
                              </Typography>
                            )}
                            {totalCompanyRevenue > 0 && (
                              <Typography variant="caption" display="block" sx={{ color: theme.palette.primary.main, fontWeight: 'bold' }}>
                                حصة الشركة: {formatNumber(totalCompanyRevenue)}
                              </Typography>
                            )}
                          </>
                        );
                      })()}
                    </Box>
                  )}
                </Paper>
              </Grid>

              {/* Total Expenses */}
              <Grid item xs={12} md={4} sx={{ width: '280px', maxWidth: '100%' }}>
                <Paper
                  elevation={1}
                  sx={{
                    p: 3,
                    bgcolor: theme.palette.background.paper,
                    borderRadius: 2,
                    border: `1px solid ${theme.palette.divider}`,
                    height: '100%',
                    transition: 'transform 0.2s',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: theme.palette.mode === 'dark' ? '0 4px 8px rgba(255,255,255,0.1)' : '0 4px 8px rgba(0,0,0,0.1)',
                    }
                  }}
                >
                  <MoneyOff sx={{
                    color: theme.palette.error.main,
                    fontSize: 32,
                    mb: 1
                  }} />
                  <Typography sx={{ color: theme.palette.primary.main, fontSize: '0.9rem', mb: 1, fontWeight: 600 }}>
                    إجمالي المصروفات التشغيلية
                  </Typography>
                  <Typography sx={{
                    color: theme.palette.error.main,
                    fontSize: '1.5rem',
                    fontWeight: 700
                  }}>
                    {formatNumber(incomeData.totalExpenses)}
                  </Typography>
                </Paper>
              </Grid>
            </Grid>

            {/* تفاصيل حساب الفترة */}
            <Box sx={{ mb: 3 }}>
              <Typography
                variant="h5"
                sx={{
                  textAlign: 'center',
                  mb: 3,
                  fontWeight: 700,
                  color: theme.palette.text.primary
                }}
              >
                من أين جاء الربح؟
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  textAlign: 'center',
                  mb: 4,
                  color: theme.palette.text.secondary
                }}
              >
                تفاصيل مصادر الدخل والمصروفات - اضغط على أي قسم لرؤية التفاصيل الكاملة
              </Typography>

              {/* Capital Section */}
              <Accordion
                defaultExpanded={false}
                sx={{
                  mb: 2,
                  borderRadius: 2,
                  '&:before': { display: 'none' },
                  boxShadow: theme.palette.mode === 'dark' ? '0 1px 3px rgba(255,255,255,0.1)' : '0 1px 3px rgba(0,0,0,0.1)',
                }}
              >
                <AccordionSummary
                  expandIcon={<ExpandMore />}
                  sx={{
                    bgcolor: theme.palette.primary.main + '08',
                    borderRadius: 2,
                    '&:hover': { bgcolor: theme.palette.primary.main + '12' }
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                    <MonetizationOn sx={{ color: theme.palette.primary.main, mr: 2, fontSize: 28 }} />
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography sx={{ fontWeight: 600, color: theme.palette.primary.main }}>
                        رأس المال المدفوع الفعلي
                      </Typography>
                      <Typography sx={{ fontSize: '0.875rem', color: theme.palette.text.secondary }}>
                        إجمالي رأس المال المساهم به في الشركة
                      </Typography>
                    </Box>
                    <Typography sx={{ fontWeight: 700, fontSize: '1.25rem', color: theme.palette.primary.main }}>
                      {formatNumber(incomeData.totalCapital)}
                    </Typography>
                  </Box>
                </AccordionSummary>
                <AccordionDetails sx={{ p: 0 }}>
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow sx={{ bgcolor: theme.palette.primary.main + '05' }}>
                          <TableCell sx={{ fontWeight: 600, textAlign: 'center' }}>الشريك</TableCell>
                          <TableCell sx={{ fontWeight: 600, textAlign: 'center' }}>رأس المال الأصلي</TableCell>
                          <TableCell sx={{ fontWeight: 600, textAlign: 'center' }}>الأرباح</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {incomeData.capitalByPartner?.map((partner, index) => (
                          <TableRow key={index} sx={{ '&:hover': { bgcolor: theme.palette.action.hover } }}>
                            <TableCell sx={{ textAlign: 'center', fontWeight: 500 }}>
                              {partner.partnerName}
                            </TableCell>
                            <TableCell sx={{ textAlign: 'center', fontWeight: 600, color: theme.palette.primary.main }}>
                              {formatNumber(partner.capitalAmount)}
                            </TableCell>
                            <TableCell sx={{ textAlign: 'center', fontWeight: 600, color: theme.palette.success.main }}>
                              {formatNumber(partner.totalProfit)}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </AccordionDetails>
              </Accordion>

              {/* Revenue Section */}
              <Accordion
                defaultExpanded={true}
                sx={{
                  mb: 2,
                  borderRadius: 2,
                  '&:before': { display: 'none' },
                  boxShadow: theme.palette.mode === 'dark' ? '0 1px 3px rgba(255,255,255,0.1)' : '0 1px 3px rgba(0,0,0,0.1)',
                }}
              >
                <AccordionSummary
                  expandIcon={<ExpandMore />}
                  sx={{
                    bgcolor: theme.palette.success.main + '08',
                    borderRadius: 2,
                    '&:hover': { bgcolor: theme.palette.success.main + '12' }
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                    <TrendingUpIcon sx={{ color: theme.palette.success.main, mr: 2, fontSize: 28 }} />
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography sx={{ fontWeight: 600, color: theme.palette.success.main }}>
                        الإيرادات التشغيلية
                      </Typography>
                      <Typography sx={{ fontSize: '0.875rem', color: theme.palette.text.secondary }}>
                        إجمالي الدخل المحقق من العملاء خلال الفترة
                      </Typography>
                    </Box>
                    <Typography sx={{ fontWeight: 700, fontSize: '1.25rem', color: theme.palette.success.main }}>
                      {formatNumber(incomeData.revenues?.total || 0)}
                    </Typography>
                  </Box>
                </AccordionSummary>
                <AccordionDetails sx={{ p: 0 }}>
                  <Box sx={{ p: 2, bgcolor: theme.palette.success.main + '03' }}>
                    <Typography sx={{ fontWeight: 600, mb: 2, color: theme.palette.success.main }}>
                      إيرادات العملاء
                    </Typography>
                    {incomeData.revenueByClient?.map((client, clientIndex) => (
                      <Accordion
                        key={clientIndex}
                        size="small"
                        sx={{
                          mb: 1,
                          '&:before': { display: 'none' },
                          boxShadow: 'none',
                          border: `1px solid ${theme.palette.divider}`,
                          borderRadius: 1
                        }}
                      >
                        <AccordionSummary expandIcon={<ExpandMore />} sx={{ minHeight: 48 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', pr: 2 }}>
                            <Typography sx={{ flexGrow: 1, fontWeight: 500 }}>
                              {client.clientName}
                            </Typography>
                            <Typography sx={{ fontWeight: 600, color: theme.palette.success.main }}>
                              {formatNumber(client.totalRevenue)}
                            </Typography>
                          </Box>
                        </AccordionSummary>
                        <AccordionDetails sx={{ p: 1 }}>
                          <TableContainer size="small">
                            <Table size="small">
                              <TableHead>
                                <TableRow>
                                  <TableCell sx={{ fontSize: '0.8rem', fontWeight: 600, textAlign: 'center' }}>الوصف</TableCell>
                                  <TableCell sx={{ fontSize: '0.8rem', fontWeight: 600, textAlign: 'center' }}>المبلغ</TableCell>
                                  <TableCell sx={{ fontSize: '0.8rem', fontWeight: 600, textAlign: 'center' }}>التاريخ</TableCell>
                                </TableRow>
                              </TableHead>
                              <TableBody>
                                {/* حصة الشركة */}
                                {client.companyRevenue > 0 && (
                                  <TableRow sx={{ bgcolor: theme.palette.primary.main + '05', '&:hover': { bgcolor: theme.palette.primary.main + '08' } }}>
                                    <TableCell sx={{ fontSize: '0.8rem', textAlign: 'center', fontWeight: 600, color: theme.palette.primary.main }}>
                                      حصة الشركة
                                    </TableCell>
                                    <TableCell sx={{ fontSize: '0.8rem', textAlign: 'center', fontWeight: 600, color: theme.palette.primary.main }}>
                                      {formatNumber(client.companyRevenue)}
                                    </TableCell>
                                    <TableCell sx={{ fontSize: '0.8rem', textAlign: 'center', color: theme.palette.text.secondary }}>
                                      -
                                    </TableCell>
                                  </TableRow>
                                )}
                                {/* حصة الشركاء */}
                                {client.partnersRevenue > 0 && (
                                  <TableRow sx={{ bgcolor: theme.palette.secondary.main + '05', '&:hover': { bgcolor: theme.palette.secondary.main + '08' } }}>
                                    <TableCell sx={{ fontSize: '0.8rem', textAlign: 'center', fontWeight: 600, color: theme.palette.secondary.main }}>
                                      حصة الشركاء
                                    </TableCell>
                                    <TableCell sx={{ fontSize: '0.8rem', textAlign: 'center', fontWeight: 600, color: theme.palette.secondary.main }}>
                                      {formatNumber(client.partnersRevenue)}
                                    </TableCell>
                                    <TableCell sx={{ fontSize: '0.8rem', textAlign: 'center', color: theme.palette.text.secondary }}>
                                      -
                                    </TableCell>
                                  </TableRow>
                                )}
                                {/* تفاصيل الإدخالات */}
                                {client.entries?.map((entry, entryIndex) => (
                                  <TableRow key={entryIndex} sx={{ '&:hover': { bgcolor: theme.palette.action.hover } }}>
                                    <TableCell sx={{ fontSize: '0.8rem', textAlign: 'center' }}>
                                      {entry.description}
                                    </TableCell>
                                    <TableCell sx={{ fontSize: '0.8rem', textAlign: 'center', fontWeight: 500 }}>
                                      {formatNumber(entry.rawShare || entry.amount)}
                                    </TableCell>
                                    <TableCell sx={{ fontSize: '0.8rem', textAlign: 'center' }}>
                                      {dayjs(entry.date).format('DD/MM/YYYY')}
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </TableContainer>
                        </AccordionDetails>
                      </Accordion>
                    ))}
                  </Box>
                </AccordionDetails>
              </Accordion>

              {/* Expenses Section */}
              <Accordion
                defaultExpanded={true}
                sx={{
                  mb: 2,
                  borderRadius: 2,
                  '&:before': { display: 'none' },
                  boxShadow: theme.palette.mode === 'dark' ? '0 1px 3px rgba(255,255,255,0.1)' : '0 1px 3px rgba(0,0,0,0.1)',
                }}
              >
                <AccordionSummary
                  expandIcon={<ExpandMore />}
                  sx={{
                    bgcolor: theme.palette.error.main + '08',
                    borderRadius: 2,
                    '&:hover': { bgcolor: theme.palette.error.main + '12' }
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                    <MoneyOff sx={{ color: theme.palette.error.main, mr: 2, fontSize: 28 }} />
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography sx={{ fontWeight: 600, color: theme.palette.error.main }}>
                        المصروفات التشغيلية
                      </Typography>
                      <Typography sx={{ fontSize: '0.875rem', color: theme.palette.text.secondary }}>
                        إجمالي المصروفات والنفقات خلال الفترة
                      </Typography>
                    </Box>
                    <Typography sx={{ fontWeight: 700, fontSize: '1.25rem', color: theme.palette.error.main }}>
                      {formatNumber(incomeData.totalExpenses)}
                    </Typography>
                  </Box>
                </AccordionSummary>
                <AccordionDetails sx={{ p: 0 }}>
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow sx={{ bgcolor: theme.palette.error.main + '05' }}>
                          <TableCell sx={{ fontWeight: 600, textAlign: 'center' }}>الوصف</TableCell>
                          <TableCell sx={{ fontWeight: 600, textAlign: 'center' }}>النوع</TableCell>
                          <TableCell sx={{ fontWeight: 600, textAlign: 'center' }}>الموظف</TableCell>
                          <TableCell sx={{ fontWeight: 600, textAlign: 'center' }}>المبلغ</TableCell>
                          <TableCell sx={{ fontWeight: 600, textAlign: 'center' }}>التاريخ</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {incomeData.detailedExpenses?.map((expense, index) => (
                          <TableRow key={index} sx={{ '&:hover': { bgcolor: theme.palette.action.hover } }}>
                            <TableCell sx={{ textAlign: 'center', fontSize: '0.875rem' }}>
                              {expense.description || expense.type}
                            </TableCell>
                            <TableCell sx={{ textAlign: 'center' }}>
                              <Chip
                                label={expense.type}
                                size="small"
                                color={getChipColor(expense.type)}
                                sx={{ fontSize: '0.7rem' }}
                              />
                            </TableCell>
                            <TableCell sx={{ textAlign: 'center', fontSize: '0.875rem' }}>
                              {expense.employee || '-'}
                            </TableCell>
                            <TableCell sx={{ textAlign: 'center', fontWeight: 600, color: theme.palette.error.main }}>
                              {formatNumber(expense.amount)}
                            </TableCell>
                            <TableCell sx={{ textAlign: 'center', fontSize: '0.875rem' }}>
                              {dayjs(expense.createdAt).format('DD/MM/YYYY')}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </AccordionDetails>
              </Accordion>

            </Box>

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