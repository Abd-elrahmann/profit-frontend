import React, { useState } from "react";
import {
  Box,
  Typography,
  Tabs,
  Tab,
  Paper,
  Grid,
  Button,
  Stack,
  Divider,
  Alert,
  Table,
  TableBody,
  TableContainer,
  TableHead,
  CircularProgress,
  useMediaQuery,
  Card,
  CardContent,
  IconButton,
  Chip,
  Autocomplete,
  TextField,
} from "@mui/material";
import {
  ArrowBack as ArrowBackIcon,
  AccountBalance as BalanceIcon,
  Paid as PaidIcon,
  Pending as PendingIcon,
  TableChart,
  PictureAsPdf,
} from "@mui/icons-material";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getPartnerZakah, getZakatAccountReport, withdrawZakat } from "./zakahApi";
import { exportZakahToPDF, exportZakahToExcel } from "../../utilities/zakahExporter";
import ZakahTable from "../../components/modals/zakahTable";
import WithdrawZakah from "../../components/modals/WithdrawZakah";
import {
  StyledTableCell,
  StyledTableRow,
} from "../../components/layouts/tableLayout";
import { Helmet } from "react-helmet-async";
import VolunteerActivismIcon from '@mui/icons-material/VolunteerActivism';
import { notifySuccess, notifyError } from "../../utilities/toastify";
import { usePermissions } from '../../components/Contexts/PermissionsContext';

const Zakah = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [selectedPartner, setSelectedPartner] = useState(null);
  const [selectedYear, setSelectedYear] = useState(null);
  const [withdrawDialogOpen, setWithdrawDialogOpen] = useState(false);
  const [selectedFilterMonth, setSelectedFilterMonth] = useState(new Date().getMonth() + 1);
  const [selectedFilterYear, setSelectedFilterYear] = useState(new Date().getFullYear());
  const [isExporting, setIsExporting] = useState(false);

  const { permissions } = usePermissions();

  // Debounced values to prevent excessive API calls
  const [debouncedMonth, setDebouncedMonth] = useState(selectedFilterMonth);
  const [debouncedYear, setDebouncedYear] = useState(selectedFilterYear);

  // Update debounced values after delay
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedMonth(selectedFilterMonth);
      setDebouncedYear(selectedFilterYear);
    }, 300);
    return () => clearTimeout(timer);
  }, [selectedFilterMonth, selectedFilterYear]);

  const isMobile = useMediaQuery("(max-width: 480px)");
  const isTablet = useMediaQuery("(max-width: 768px)");
  const isSmallScreen = isMobile || isTablet;

  // Data for autocomplete options
  const monthOptions = [
    { value: 1, label: "يناير" },
    { value: 2, label: "فبراير" },
    { value: 3, label: "مارس" },
    { value: 4, label: "أبريل" },
    { value: 5, label: "مايو" },
    { value: 6, label: "يونيو" },
    { value: 7, label: "يوليو" },
    { value: 8, label: "أغسطس" },
    { value: 9, label: "سبتمبر" },
    { value: 10, label: "أكتوبر" },
    { value: 11, label: "نوفمبر" },
    { value: 12, label: "ديسمبر" },
  ];

  const yearOptions = Array.from({ length: 31 }, (_, i) => ({
    value: 2020 + i,
    label: (2020 + i).toString()
  }));

  const queryClient = useQueryClient();

  // Query for partner zakah details
  const { data: partnerZakahData, isLoading: isPartnerLoading } = useQuery({
    queryKey: ["partner-zakah", selectedPartner],
    queryFn: () => getPartnerZakah(selectedPartner),
    enabled: !!selectedPartner && activeTab === 1,
  });

  // Query for zakat account report
  const { data: accountReport, isLoading: isAccountLoading, error: accountError } = useQuery({
    queryKey: ["zakat-account", debouncedMonth, debouncedYear],
    queryFn: () => getZakatAccountReport(`${debouncedYear}-${debouncedMonth.toString().padStart(2, '0')}`),
    enabled: activeTab === 2,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
  });

  const handleViewDetails = (partnerId, year) => {
    setSelectedPartner(partnerId);
    setSelectedYear(year);
    setActiveTab(1);
  };

  const handleBackToList = () => {
    setActiveTab(0);
    setSelectedPartner(null);
    setSelectedYear(null);
  };

  const handleWithdraw = async (amount) => {
    try {
      await withdrawZakat(amount);
      notifySuccess(`تم سحب مبلغ ${amount} بنجاح`);
      queryClient.invalidateQueries(["zakat-account"]);
    } catch (error) {
      notifyError(error.response?.data?.message || "حدث خطأ أثناء سحب الزكاة");
      throw error;
    }
  };

  const handleExportPDF = async () => {
    let exportData, filters;

    if (activeTab === 2 && accountReport) {
      // صندوق الزكاة
      exportData = accountReport;
      filters = {
        month: selectedFilterMonth.toString().padStart(2, '0'),
        year: selectedFilterYear
      };
    } else if (activeTab === 1 && partnerZakahData) {
      // زكاة محددة
      exportData = partnerZakahData;
      filters = {
        partner: selectedPartner,
        year: selectedYear
      };
    } else {
      return;
    }

    setIsExporting(true);
    try {
      await exportZakahToPDF(exportData, filters);
      notifySuccess("تم تصدير تقرير الزكاة إلى PDF بنجاح");
    } catch (error) {
      notifyError("حدث خطأ أثناء تصدير PDF");
      console.error("PDF export error:", error);
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportExcel = async () => {
    let exportData, filters;

    if (activeTab === 2 && accountReport) {
      // صندوق الزكاة
      exportData = accountReport;
      filters = {
        month: selectedFilterMonth.toString().padStart(2, '0'),
        year: selectedFilterYear
      };
    } else if (activeTab === 1 && partnerZakahData) {
      // زكاة محددة
      exportData = partnerZakahData;
      filters = {
        partner: selectedPartner,
        year: selectedYear
      };
    } else {
      return;
    }

    setIsExporting(true);
    try {
      await exportZakahToExcel(exportData, filters);
      notifySuccess("تم تصدير تقرير الزكاة إلى Excel بنجاح");
    } catch (error) {
      notifyError("حدث خطأ أثناء تصدير Excel");
      console.error("Excel export error:", error);
    } finally {
      setIsExporting(false);
    }
  };

  // Format currency
  const formatCurrency = (amount) => {
    return amount?.toLocaleString() || "0";
  };

  // Helpers to control export buttons availability
  const hasAccountExportData = (() => {
    if (!accountReport?.journalsByMonth) return false;
    return Object.values(accountReport.journalsByMonth).some(
      (month) => Array.isArray(month.entries) && month.entries.length > 0
    );
  })();

  const hasPartnerExportData = (() => {
    if (Array.isArray(partnerZakahData)) return partnerZakahData.length > 0;
    if (partnerZakahData && typeof partnerZakahData === "object") return true;
    return false;
  })();

  // Get month name in Arabic
  const getMonthName = (month) => {
    const months = [
      "يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو",
      "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"
    ];
    return months[month - 1] || month;
  };



  // Get status chip
  const getStatusChip = (status) => {
    if (status === 'PAID') {
      return <Chip icon={<PaidIcon />} label="مدفوع" color="success" size="small" />;
    }
    return <Chip icon={<PendingIcon />} label="غير مدفوع" color="default" size="small" />;
  };

  // Render desktop sidebar for partner details
  const renderDesktopSidebar = () => {
    const currentYearData = Array.isArray(partnerZakahData) 
      ? partnerZakahData.find(item => item.year === selectedYear) 
      : partnerZakahData;

    return (
      <Box
        sx={{
          width: "350px",
          borderRight: "1px solid #ddd",
          bgcolor: "#fafafa",
          height: "100%",
          overflowY: "auto",
          flexShrink: 0,
        }}
      >
        <Box sx={{ p: 3, borderBottom: "1px solid #ddd", bgcolor: "#fafafa" }}>
          <Typography variant="h6" color="primary" fontWeight="bold" mb={3}>
            ملخص الزكاة
          </Typography>
          <Stack spacing={2}>
            <Box sx={{ display: "flex", justifyContent: "space-between" }}>
              <Typography>رأس المال:</Typography>
              <Typography fontWeight="bold">
                {formatCurrency(currentYearData?.capitalAmount)}
              </Typography>
            </Box>
            <Box sx={{ display: "flex", justifyContent: "space-between" }}>
              <Typography>الزكاة السنوية:</Typography>
              <Typography fontWeight="bold" color="primary.main">
                {formatCurrency(currentYearData?.annualZakat)}
              </Typography>
            </Box>
            <Box sx={{ display: "flex", justifyContent: "space-between" }}>
              <Typography>الزكاة الشهرية:</Typography>
              <Typography fontWeight="bold">
                {formatCurrency(currentYearData?.monthlyZakat)}
              </Typography>
            </Box>
            <Box sx={{ display: "flex", justifyContent: "space-between" }}>
              <Typography>المدفوع:</Typography>
              <Typography fontWeight="bold" color="success.main">
                {formatCurrency(currentYearData?.totalPaid)}
              </Typography>
            </Box>
            <Box sx={{ display: "flex", justifyContent: "space-between" }}>
              <Typography>المتبقي:</Typography>
              <Typography 
                fontWeight="bold" 
                color={currentYearData?.remaining > 0 ? "error" : "success.main"}
              >
                {formatCurrency(currentYearData?.remaining)}
              </Typography>
            </Box>
          </Stack>
        </Box>

        <Box sx={{ p: 3 }}>
          <Typography variant="h6" color="primary" fontWeight="bold" mb={3}>
            السنوات المتاحة
          </Typography>
          <Stack spacing={1}>
            {Array.isArray(partnerZakahData) ? (
              partnerZakahData.map((yearData) => (
                <Button
                  key={yearData.year}
                  variant={selectedYear === yearData.year ? "contained" : "outlined"}
                  onClick={() => setSelectedYear(yearData.year)}
                  sx={{
                    justifyContent: "flex-start",
                    textAlign: "right",
                  }}
                >
                  {yearData.year} - {formatCurrency(yearData.annualZakat)}
                </Button>
              ))
            ) : (
              <Button
                variant="contained"
                sx={{ justifyContent: "flex-start" }}
              >
                {selectedYear} - {formatCurrency(currentYearData?.annualZakat)}
              </Button>
            )}
          </Stack>
        </Box>
      </Box>
    );
  };

  // Render account summary for financial operations tab
  const renderAccountSummary = () => (
    <Box sx={{ p: 3, borderBottom: "1px solid #ddd", bgcolor: "#fafafa",width:"300px" }}>
      <Typography variant="h6" color="primary" fontWeight="bold" mb={3}>
        ملخص حساب الزكاة
      </Typography>
      <Stack spacing={2}>
        <Box sx={{ display: "flex", justifyContent: "space-between" }}>
          <Typography>رصيد الحساب:</Typography>
          <Typography fontWeight="bold" color="primary.main">
            {formatCurrency(accountReport?.account?.balance)}
          </Typography>
        </Box>
        <Box sx={{ display: "flex", justifyContent: "space-between" }}>
          <Typography>الزكاة المدفوعة:</Typography>
          <Typography fontWeight="bold" color="success.main">
            {formatCurrency(accountReport?.account?.credit)}
          </Typography>
        </Box>
        <Box sx={{ display: "flex", justifyContent: "space-between" }}>
          <Typography>الزكاة المتبقية:</Typography>
          <Typography fontWeight="bold">
            {formatCurrency(accountReport?.account?.debit)}
          </Typography>
        </Box>
        <Box sx={{ display: "flex", justifyContent: "space-between" }}>
          <Typography>إجمالي العمليات:</Typography>
          <Typography fontWeight="bold" color="info.main">
            {accountReport?.totalJournalEntries || 0}
          </Typography>
        </Box>
        {permissions.includes("zakat_Add") && (
        <Button
          variant="contained"
          onClick={() => setWithdrawDialogOpen(true)}
          disabled={!accountReport?.account?.balance || accountReport?.account?.balance <= 0}
          startIcon={<PaidIcon sx={{marginLeft:"10px"}} />}
        >
            سحب الزكاة
          </Button>
        )}
      </Stack>
    </Box>
  );

  // Render mobile actions for partner details
  const renderMobileActions = () => (
    <Paper sx={{ p: 2, mb: 2, borderRadius: 2 }}>
      <Typography variant="h6" color="primary" fontWeight="bold" mb={2}>
        السنوات المتاحة
      </Typography>
      <Stack spacing={1}>
        {Array.isArray(partnerZakahData) ? (
          partnerZakahData.map((yearData) => (
            <Button
              key={yearData.year}
              variant={selectedYear === yearData.year ? "contained" : "outlined"}
              onClick={() => setSelectedYear(yearData.year)}
              fullWidth
              size="small"
            >
              {yearData.year} - {formatCurrency(yearData.annualZakat)}
            </Button>
          ))
        ) : (
          <Button
            variant="contained"
            fullWidth
            size="small"
          >
            {selectedYear} - {formatCurrency(partnerZakahData?.annualZakat)}
          </Button>
        )}
      </Stack>
    </Paper>
  );

  // Render mobile partner details
  const renderMobilePartnerDetails = () => {
    const currentYearData = Array.isArray(partnerZakahData) 
      ? partnerZakahData.find(item => item.year === selectedYear) 
      : partnerZakahData;

    return (
      <Box>
        {/* Summary Cards */}
        <Grid container spacing={2} mb={3} justifyContent="center">
          <Grid item xs={6}>
            <Card sx={{ bgcolor: "rgba(25, 118, 210, 0.1)", textAlign: "center" }}>
              <CardContent sx={{ p: 2 }}>
                <Typography variant="body2" color="primary.main">
                  رأس المال
                </Typography>
                <Typography variant="h6" fontWeight="bold" color="primary.main">
                  {formatCurrency(currentYearData?.capitalAmount)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={6}>
            <Card sx={{ bgcolor: "rgba(46, 125, 50, 0.1)", textAlign: "center" }}>
              <CardContent sx={{ p: 2 }}>
                <Typography variant="body2" color="success.main">
                  المدفوع
                </Typography>
                <Typography variant="h6" fontWeight="bold" color="success.main">
                  {formatCurrency(currentYearData?.totalPaid)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={6}>
            <Card sx={{ bgcolor: "rgba(237, 108, 2, 0.1)", textAlign: "center" }}>
              <CardContent sx={{ p: 2 }}>
                <Typography variant="body2" color="warning.main">
                  الزكاة السنوية
                </Typography>
                <Typography variant="h6" fontWeight="bold" color="warning.main">
                  {formatCurrency(currentYearData?.annualZakat)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={6}>
            <Card sx={{ 
              bgcolor: currentYearData?.remaining > 0 ? "rgba(211, 47, 47, 0.1)" : "rgba(46, 125, 50, 0.1)", 
              textAlign: "center" 
            }}>
              <CardContent sx={{ p: 2 }}>
                <Typography variant="body2" color={currentYearData?.remaining > 0 ? "error" : "success.main"}>
                  المتبقي
                </Typography>
                <Typography 
                  variant="h6" 
                  fontWeight="bold" 
                  color={currentYearData?.remaining > 0 ? "error" : "success.main"}
                >
                  {formatCurrency(currentYearData?.remaining)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Years */}
        {renderMobileActions()}

        {/* Partner Info */}
        <Paper sx={{ p: 3, borderRadius: 2, mb: 2 }}>
          <Typography variant="h6" fontWeight="bold" mb={3} textAlign="center">
            معلومات الزكاة
          </Typography>

          <Stack spacing={2}>
            <Box>
              <Typography variant="body2" color="textSecondary" gutterBottom>
                اسم الشريك
              </Typography>
              <Typography variant="body1" fontWeight="bold">
                {currentYearData?.partnerName || "-"}
              </Typography>
            </Box>

            <Box>
              <Typography variant="body2" color="textSecondary" gutterBottom>
                السنة
              </Typography>
              <Typography variant="body1" fontWeight="bold">
                {selectedYear}
              </Typography>
            </Box>

            <Box>
              <Typography variant="body2" color="textSecondary" gutterBottom>
                الزكاة الشهرية
              </Typography>
              <Typography variant="body1" fontWeight="bold">
                {formatCurrency(currentYearData?.monthlyZakat)}
              </Typography>
            </Box>
          </Stack>
        </Paper>

        {/* Monthly Breakdown */}
        {currentYearData?.monthlyBreakdown && currentYearData.monthlyBreakdown.length > 0 && (
          <Paper sx={{ p: 2, borderRadius: 2 }}>
            <Typography variant="h6" fontWeight="bold" mb={2} textAlign="center">
              التفصيل الشهري
            </Typography>
            
            <Stack spacing={2}>
              {currentYearData.monthlyBreakdown.map((month) => (
                <Card key={month.month} variant="outlined">
                  <CardContent sx={{ p: 2 }}>
                    <Stack spacing={1}>
                      <Typography variant="subtitle2" fontWeight="bold">
                        {getMonthName(month.month)}
                      </Typography>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2" color="textSecondary">
                          المبلغ:
                        </Typography>
                        <Typography variant="body2" fontWeight="bold">
                          {formatCurrency(month.amount)}
                        </Typography>
                      </Box>
                      {getStatusChip(month.status)}
                    </Stack>
                  </CardContent>
                </Card>
              ))}
            </Stack>
          </Paper>
        )}
      </Box>
    );
  };

  // Render desktop partner details
  const renderDesktopPartnerDetails = () => {
    const currentYearData = Array.isArray(partnerZakahData) 
      ? partnerZakahData.find(item => item.year === selectedYear) 
      : partnerZakahData;

    return (
      <Paper sx={{ p: 4, borderRadius: 2 }}>
        <Typography variant="h6" color="primary" fontWeight="bold" mb={3} textAlign={"center"}>
          تفاصيل زكاة الشريك
        </Typography>

        {/* Partner Information */}
        <Grid container spacing={3} mb={4} justifyContent="space-between" alignItems="center">
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              اسم الشريك:
            </Typography>
            <Typography variant="body1" fontWeight="bold" color="primary.main">{currentYearData?.partnerName || "-"}</Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              السنة:
            </Typography>
            <Typography variant="body1" fontWeight="bold" color="primary.main">{selectedYear}</Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              رأس المال:
            </Typography>
            <Typography variant="body1" fontWeight="bold" color="primary.main">{formatCurrency(currentYearData?.capitalAmount)}</Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              الزكاة الشهرية:
            </Typography>
            <Typography variant="body1" fontWeight="bold" color="primary.main">{formatCurrency(currentYearData?.monthlyZakat)}</Typography>
          </Grid>
        </Grid>

        <Divider sx={{ my: 3 }} />

        {/* Zakat Summary */}
        <Grid container spacing={3} mb={4} justifyContent="center" alignItems="center">
          <Grid item xs={12} md={4}>
            <Card sx={{ bgcolor: "primary.50", p: 3, textAlign: "center",width: "350px" }}>
              <VolunteerActivismIcon color="primary" sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h5" fontWeight="bold" color="primary.main">
                {formatCurrency(currentYearData?.annualZakat)}
              </Typography>
              <Typography variant="body1" color="primary.main">
                الزكاة السنوية
              </Typography>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card sx={{ bgcolor: "success.50", p: 3, textAlign: "center",width: "350px" }}>
              <VolunteerActivismIcon color="success" sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h5" fontWeight="bold" color="success.main">
                {formatCurrency(currentYearData?.totalPaid)}
              </Typography>
              <Typography variant="body1" color="success.main">
                المدفوع
              </Typography>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card sx={{ 
              bgcolor: currentYearData?.remaining > 0 ? "error.50" : "success.50", 
              p: 3, 
              textAlign: "center",
              width: "350px"
            }}>
              <VolunteerActivismIcon 
                color={currentYearData?.remaining > 0 ? "error" : "success"} 
                sx={{ fontSize: 40, mb: 1 }} 
              />
              <Typography 
                variant="h5" 
                fontWeight="bold" 
                color={currentYearData?.remaining > 0 ? "error" : "success.main"}
              >
                {formatCurrency(currentYearData?.remaining)}
              </Typography>
              <Typography 
                variant="body1" 
                color={currentYearData?.remaining > 0 ? "error" : "success.main"}
              >
                المتبقي
              </Typography>
            </Card>
          </Grid>
        </Grid>

        {/* Monthly Breakdown Table */}
        {currentYearData?.monthlyBreakdown && currentYearData.monthlyBreakdown.length > 0 && (
          <>
            <Divider sx={{ my: 3 }} />
            <Typography variant="h6" color="primary" fontWeight="bold" mb={3} textAlign="center">
              التفصيل الشهري
            </Typography>
            <TableContainer component={Paper} variant="outlined">
              <Table>
                <TableHead>
                  <StyledTableRow>
                    <StyledTableCell align="center">الشهر</StyledTableCell>
                    <StyledTableCell align="center">المبلغ</StyledTableCell>
                  </StyledTableRow>
                </TableHead>
                <TableBody>
                  {currentYearData.monthlyBreakdown.map((month) => (
                    <StyledTableRow key={month.month}>
                      <StyledTableCell align="center">
                        {getMonthName(month.month)}
                      </StyledTableCell>
                      <StyledTableCell align="center">
                        {formatCurrency(month.amount)}
                      </StyledTableCell>
                    </StyledTableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </>
        )}
      </Paper>
    );
  };

  // Render financial operations tab
  const renderFinancialOperations = () => {
    if (isAccountLoading) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      );
    }

    return (
      <Box sx={{ textAlign: "center" }}>
        {/* Filters */}
        <Grid container spacing={3} mb={4} justifyContent="center" alignItems="center">
          <Grid item xs={12} md={8}>
            <Autocomplete
              value={monthOptions.find(option => option.value === selectedFilterMonth) || null}
              onChange={(event, newValue) => {
                setSelectedFilterMonth(newValue ? newValue.value : new Date().getMonth() + 1);
              }}
              options={monthOptions}
              getOptionLabel={(option) => option.label}
              renderInput={(params) => (
                <TextField {...params} label="الشهر" />
              )}
              sx={{ width: "250px" }}
            />
          </Grid>
          <Grid item xs={12} md={8}>
            <Autocomplete
              value={yearOptions.find(option => option.value === selectedFilterYear) || null}
              onChange={(event, newValue) => {
                setSelectedFilterYear(newValue ? newValue.value : new Date().getFullYear());
              }}
              options={yearOptions}
              getOptionLabel={(option) => option.label}
              renderInput={(params) => (
                <TextField {...params} label="السنة" />
              )}
              sx={{ width: "250px" }}
            />
          </Grid>
        </Grid>

        {/* Export Buttons - At the top */}
        {!isAccountLoading && !accountError && accountReport && activeTab === 2 && permissions.includes("zakat_Export") && (
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mb: 4, mt: 2 }}>
            <Button
              variant="contained"
              sx={{ backgroundColor: '#d32f2f', '&:hover': { backgroundColor: '#b71c1c' } }}
              startIcon={<PictureAsPdf sx={{marginLeft: "10px"}} />}
              onClick={() => handleExportPDF()}
              disabled={isExporting || !hasAccountExportData}
            >
              {isExporting ? 'جاري التصدير...' : 'تصدير PDF'}
            </Button>
            <Button
              variant="contained"
              sx={{ backgroundColor: '#2e7d32', '&:hover': { backgroundColor: '#1b5e20' } }}
              startIcon={<TableChart sx={{marginLeft: "10px"}} />}
              onClick={() => handleExportExcel()}
              disabled={isExporting || !hasAccountExportData}
            >
              {isExporting ? 'جاري التصدير...' : 'تصدير Excel'}
            </Button>
          </Box>
        )}

        {/* Loading Message */}
        {isAccountLoading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mb: 4, width: "100%" }}>
            <CircularProgress sx={{ mr: 2 }} />
            <Typography>جاري تحميل بيانات الزكاة...</Typography>
          </Box>
        )}

        {/* Error Message */}
        {accountError && !isAccountLoading && (
          <Alert severity="error" sx={{ mb: 4, width: "100%" }}>
            فشل في تحميل بيانات الزكاة: {accountError.message || "حدث خطأ غير متوقع"}
          </Alert>
        )}

        {/* Account Summary */}
        {!isAccountLoading && !accountError && (
          <Grid container spacing={3} mb={4} justifyContent="center" alignItems="center">
          <Grid item xs={12} md={2.4}>
            <Card sx={{ bgcolor: "primary.100", p: 3, textAlign: "center",width: "400px" }}>
              <BalanceIcon sx={{ fontSize: 40, mb: 1, color: "#1565c0" }} />
              <Typography variant="h5" fontWeight="bold" color="primary.900">
                {formatCurrency(accountReport?.account?.balance)}
              </Typography>
              <Typography variant="body1" color="primary.900">
                رصيد الحساب
              </Typography>
            </Card>
          </Grid>
          <Grid item xs={12} md={2.4}>
            <Card sx={{ bgcolor: "success.100", p: 3, textAlign: "center",width: "400px" }}>
              <PaidIcon sx={{ fontSize: 40, mb: 1, color: "#2e7d32" }} />
              <Typography variant="h5" fontWeight="bold" color="success.900">
                {formatCurrency(accountReport?.account?.credit)}
              </Typography>
              <Typography variant="body1" color="success.900">
                الزكاة المدفوعة
              </Typography>
            </Card>
          </Grid>
          <Grid item xs={12} md={2.4}>
            <Card sx={{ bgcolor: "warning.100", p: 3, textAlign: "center",width: "400px" }}>
              <PendingIcon sx={{ fontSize: 40, mb: 1, color: "#f57c00" }} />
              <Typography variant="h5" fontWeight="bold" color="warning.900">
                {formatCurrency(accountReport?.account?.debit)}
              </Typography>
              <Typography variant="body1" color="warning.900">
                الزكاة المتبقية
              </Typography>
            </Card>
          </Grid>
          <Grid item xs={12} md={2.4}>
            <Card sx={{ bgcolor: "info.100", p: 3, textAlign: "center",width: "400px" }}>
              <VolunteerActivismIcon sx={{ fontSize: 40, mb: 1, color: "#0277bd" }} />
              <Typography variant="h5" fontWeight="bold" color="info.900">
                {accountReport?.totalJournalEntries || 0}
              </Typography>
              <Typography variant="body1" color="info.900">
                إجمالي العمليات
              </Typography>
            </Card>
          </Grid>
          <Grid item xs={12} md={2.4}>
            <Card sx={{ bgcolor: "secondary.100", p: 3, textAlign: "center",width: "400px" }}>
              <VolunteerActivismIcon sx={{ fontSize: 40, mb: 1, color: "#616161" }} />
              <Typography variant="h5" fontWeight="bold" color="secondary.900">
                {formatCurrency(accountReport?.journalsByMonth?.[`${selectedFilterYear}-${selectedFilterMonth.toString().padStart(2, '0')}`]?.requiredZakat || 0)}
              </Typography>
              <Typography variant="body1" color="secondary.900">
                الزكاة المطلوبة لهذا الشهر
              </Typography>
            </Card>
          </Grid>
        </Grid>
        )}

        {/* Journal Entries */}
        {accountReport?.journalsByMonth && Object.keys(accountReport.journalsByMonth).length > 0 ? (
          <Paper sx={{ p: 3, borderRadius: 2, mb: 4 }}>
            <Typography variant="h6" fontWeight="bold" mb={3} textAlign="center">
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
                        <StyledTableCell align="center">المرجع</StyledTableCell>
                        <StyledTableCell align="center">الوصف</StyledTableCell>
                        <StyledTableCell align="center">المرسل</StyledTableCell>
                        <StyledTableCell align="center">النوع</StyledTableCell>
                        <StyledTableCell align="center">مدين</StyledTableCell>
                        <StyledTableCell align="center">دائن</StyledTableCell>
                        <StyledTableCell align="center">الرصيد</StyledTableCell>
                      </StyledTableRow>
                    </TableHead>
                    <TableBody>
                      {data.entries && data.entries.length > 0 ? (
                        data.entries.map((entry) => (
                          <StyledTableRow key={entry.id}>
                          <StyledTableCell align="center">
                            {new Date(entry.date).toLocaleDateString('en-US')}
                          </StyledTableCell>
                            <StyledTableCell align="center">
                              {entry.reference || '-'}
                            </StyledTableCell>
                            <StyledTableCell align="center">
                              {entry.description}
                            </StyledTableCell>
                            <StyledTableCell align="center">
                              {entry.postedBy || '-'}
                            </StyledTableCell>
                            <StyledTableCell align="center">
                              {entry.type === 'GENERAL' ? 'عام' : entry.type || '-'}
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
                        ))
                      ) : (
                        <StyledTableRow>
                          <StyledTableCell colSpan={9} align="center" sx={{ py: 4 }}>
                            <Typography variant="body1" color="textSecondary">
                              لا توجد عمليات مالية لهذا الشهر
                            </Typography>
                          </StyledTableCell>
                        </StyledTableRow>
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            ))}
          </Paper>
        ) : (
          <Alert severity="info" sx={{ mb: 4 }}>
            لا توجد عمليات مالية لحساب الزكاة
          </Alert>
        )}

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
        <title>الزكاة</title>
        <meta name="description" content="إدارة الزكاة" />
      </Helmet>
      
      <Box
        sx={{
          display: "flex",
          flexDirection: isSmallScreen ? "column" : "row-reverse",
          flex: 1,
          height: isSmallScreen ? "auto" : "calc(100vh - 80px)",
          width: "100%",
        }}
      >
        {/* Sidebar for desktop */}
        {!isSmallScreen && activeTab === 1 && partnerZakahData && renderDesktopSidebar()}
        {!isSmallScreen && activeTab === 2 && accountReport && renderAccountSummary()}

        <Box
          sx={{
            flex: 1,
            p: isSmallScreen ? 2 : 4,
            bgcolor: "#fff",
            overflowY: "auto",
            width: "100%",
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
                      setSelectedYear(null);
                    }
                  }}
                >
                  <Tab
                    label="عرض جميع الزكاة"
                    sx={{
                      fontWeight: "bold",
                      borderBottom: activeTab === 0 ? "3px solid #0d40a5" : "none",
                      color: activeTab === 0 ? "#0d40a5" : "black",
                    }}
                  />
                  <Tab
                    label={selectedPartner ? "تفاصيل الزكاة" : "زكاة محددة"}
                    sx={{
                      fontWeight: "bold",
                      borderBottom: activeTab === 1 ? "3px solid #0d40a5" : "none",
                      color: activeTab === 1 ? "#0d40a5" : "black",
                    }}
                  />
                  <Tab
                    label="صندوق الزكاة"
                    sx={{
                      fontWeight: "bold",
                      borderBottom: activeTab === 2 ? "3px solid #0d40a5" : "none",
                      color: activeTab === 2 ? "#0d40a5" : "black",
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
                      تفاصيل الزكاة
                    </Typography>
                  </Box>
                ) : activeTab === 2 ? (
                  <Typography variant="h6" fontWeight="bold" mb={2}>
                    صندوق الزكاة
                  </Typography>
                ) : (
                  // Title for mobile list view
                  <Typography variant="h6" fontWeight="bold" mb={2}>
                    الزكاة
                  </Typography>
                )}
              </Box>
            )}

            {activeTab === 0 || (isSmallScreen && !selectedPartner && activeTab !== 2) ? (
              <ZakahTable
                onViewDetails={handleViewDetails}
                isMobile={isMobile}
              />
            ) : activeTab === 1 ? (
              <Box>
                {!selectedPartner ? (
                  <Alert severity="info" sx={{ mt: 2 }}>
                    يرجى اختيار شريك لعرض تفاصيل زكاته
                  </Alert>
                ) : isPartnerLoading ? (
                  <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100%" }}>
                    <CircularProgress size={20} />
                  </Box>
                ) : partnerZakahData ? (
                  <>
                    {/* Export Buttons for Partner Zakah - At the top */}
                    {permissions.includes("zakat_Export") && (
                      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mb: 4, mt: 2 }}>
                        <Button
                          variant="contained"
                          sx={{ backgroundColor: '#d32f2f', '&:hover': { backgroundColor: '#b71c1c' } }}
                          startIcon={<PictureAsPdf sx={{marginLeft: "10px"}} />}
                          onClick={() => handleExportPDF()}
                          disabled={isExporting || !hasPartnerExportData}
                        >
                          {isExporting ? 'جاري التصدير...' : 'تصدير PDF'}
                        </Button>
                        <Button
                          variant="contained"
                          sx={{ backgroundColor: '#2e7d32', '&:hover': { backgroundColor: '#1b5e20' } }}
                          startIcon={<TableChart sx={{marginLeft: "10px"}} />}
                          onClick={() => handleExportExcel()}
                          disabled={isExporting || !hasPartnerExportData}
                        >
                          {isExporting ? 'جاري التصدير...' : 'تصدير Excel'}
                        </Button>
                      </Box>
                    )}

                    {isSmallScreen ? renderMobilePartnerDetails() : renderDesktopPartnerDetails()}
                  </>
                ) : (
                  <Alert severity="error">حدث خطأ في تحميل بيانات الزكاة</Alert>
                )}
              </Box>
            ) : (
              // Financial Operations Tab
              renderFinancialOperations()
            )}
          </Box>
        </Box>
      </Box>

      {/* Withdraw Dialog */}
      <WithdrawZakah
        open={withdrawDialogOpen}
        onClose={() => setWithdrawDialogOpen(false)}
        onWithdraw={handleWithdraw}
        accountBalance={accountReport?.account?.balance}
      />
    </Box>
  );
};

export default Zakah;