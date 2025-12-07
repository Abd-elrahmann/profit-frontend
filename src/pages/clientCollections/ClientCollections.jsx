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
} from "@mui/material";
import {
  ArrowBack as ArrowBackIcon,
  AccountBalance as BalanceIcon,
  Paid as PaidIcon,
  Pending as PendingIcon,
  MoneyOff as MoneyOffIcon,
  PictureAsPdf as PdfIcon,
  TableChart as ExcelIcon,
} from "@mui/icons-material";
import { useQuery } from "@tanstack/react-query";
import { getAllClients, getClientDetails } from "./clientsCollectionsApi";
import ClientCollectionsTable from "../../components/modals/ClientCollectionsTable";
import {
  StyledTableCell,
  StyledTableRow,
} from "../../components/layouts/tableLayout";
import { Helmet } from "react-helmet-async";
import {
  exportClientDetailsToPDF,
  exportClientDetailsToExcel,
} from "../../utilities/clientCollectionsExporter";
import { notifySuccess, notifyError } from "../../utilities/toastify";
import { usePermissions } from "../../components/Contexts/PermissionsContext";
const ClientCollections = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [selectedClient, setSelectedClient] = useState(null);
  const [page] = useState(1);
  const [limit] = useState(20);

  const isMobile = useMediaQuery("(max-width: 480px)");
  const isTablet = useMediaQuery("(max-width: 768px)");
  const isSmallScreen = isMobile || isTablet;

  const { permissions } = usePermissions();

  // Query for all clients
  const { data: clientsData, isLoading: isClientsLoading } = useQuery({
    queryKey: ["clients-collections", page],
    queryFn: () => getAllClients(page, limit),
  });

  // Query for client details when selected
  const { data: clientDetails, isLoading: isClientLoading } = useQuery({
    queryKey: ["client-details", selectedClient],
    queryFn: () => getClientDetails(selectedClient),
    enabled: !!selectedClient && activeTab === 1,
  });

  const handleViewDetails = (clientId) => {
    setSelectedClient(clientId);
    setActiveTab(1);
  };

  const handleBackToList = () => {
    setActiveTab(0);
    setSelectedClient(null);
  };

  // Export handlers for client details
  const [isExportingPDF, setIsExportingPDF] = useState(false);
  const [isExportingExcel, setIsExportingExcel] = useState(false);

  const handleExportPDF = async () => {
    if (isExportingPDF) return; // Prevent multiple clicks
    
    try {
      if (!clientDetails || !clientDetails.client) {
        notifyError("لا توجد بيانات للتصدير");
        return;
      }
      setIsExportingPDF(true);
      await exportClientDetailsToPDF(clientDetails);
      notifySuccess("تم تصدير الملف PDF بنجاح");
    } catch (error) {
      console.error("PDF export error:", error);
      notifyError("حدث خطأ أثناء تصدير الملف PDF");
    } finally {
      setIsExportingPDF(false);
    }
  };

  const handleExportExcel = async () => {
    if (isExportingExcel) return; // Prevent multiple clicks
    
    try {
      if (!clientDetails || !clientDetails.client) {
        notifyError("لا توجد بيانات للتصدير");
        return;
      }
      setIsExportingExcel(true);
      await exportClientDetailsToExcel(clientDetails);
      notifySuccess("تم تصدير الملف Excel بنجاح");
    } catch (error) {
      console.error("Excel export error:", error);
      notifyError("حدث خطأ أثناء تصدير الملف Excel");
    } finally {
      setIsExportingExcel(false);
    }
  };

  // Format currency
  const formatCurrency = (amount) => {
    return amount?.toLocaleString() || "0";
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "غير محدد";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };

  // Get loan status in Arabic
  const getLoanStatusText = (status) => {
    const statusMap = {
      'ACTIVE': 'نشط',
      'COMPLETED': 'مكتمل',
      'CANCELLED': 'ملغي',
      'OVERDUE': 'متأخر'
    };
    return statusMap[status] || status;
  };

  const getLoanStatusColor = (status) => {
    const colorMap = {
      'ACTIVE': 'success',
      'COMPLETED': 'primary',
      'CANCELLED': 'error',
      'OVERDUE': 'warning'
    };
    return colorMap[status] || 'default';
  };


  // Render client summary cards
  const renderClientSummaryCards = () => (
    <Box sx={{ display: "flex", justifyContent: "center", mb: 4 }}>
      <Grid container spacing={3} sx={{ maxWidth: "1200px" }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card 
            sx={{ 
              bgcolor: "primary.50", 
              textAlign: "center", 
              p: 3,
              width: "250px",
              height: "100%",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              boxShadow: 2,
              borderRadius: 1,
            }}
          >
            <BalanceIcon color="primary" sx={{ fontSize: 36, mb: 1 }} />
            <Typography variant="h5" fontWeight="bold" color="primary.main" sx={{ mb: 0.5 }}>
              {formatCurrency(clientDetails?.totals?.totalDebit)}
            </Typography>
            <Typography variant="body2" color="primary.main" fontWeight="medium">
              إجمالي المديونية
            </Typography>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card 
            sx={{ 
              bgcolor: "success.50", 
              textAlign: "center", 
              p: 3,
              width: "250px",
              height: "100%",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              boxShadow: 2,
              borderRadius: 1,
            }}
          >
            <PaidIcon color="success" sx={{ fontSize: 36, mb: 1 }} />
            <Typography variant="h5" fontWeight="bold" color="success.main" sx={{ mb: 0.5 }}>
              {formatCurrency(clientDetails?.totals?.totalPaid)}
            </Typography>
            <Typography variant="body2" color="success.main" fontWeight="medium">
              إجمالي المدفوع
            </Typography>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card 
            sx={{ 
              bgcolor: clientDetails?.totals?.remaining > 0 ? "error.50" : "success.50", 
              textAlign: "center", 
              p: 3,
              width: "250px",
              height: "100%",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              boxShadow: 2,
              borderRadius: 1,
            }}
          >
            <MoneyOffIcon 
              color={clientDetails?.totals?.remaining > 0 ? "error" : "success"} 
              sx={{ fontSize: 36, mb: 1 }} 
            />
            <Typography 
              variant="h5" 
              fontWeight="bold" 
              color={clientDetails?.totals?.remaining > 0 ? "error" : "success.main"}
              sx={{ mb: 0.5 }}
            >
              {formatCurrency(Math.abs(clientDetails?.totals?.remaining || 0))}
            </Typography>
            <Typography 
              variant="body2" 
              color={clientDetails?.totals?.remaining > 0 ? "error" : "success.main"}
              fontWeight="medium"
            >
              {clientDetails?.totals?.remaining > 0 ? 'المتبقي' : 'لديه رصيد'}
            </Typography>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card 
            sx={{ 
              bgcolor: "warning.50", 
              textAlign: "center", 
              p: 3,
              width: "250px",
              height: "100%",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              boxShadow: 2,
              borderRadius: 1,
            }}
          >
            <PendingIcon color="warning" sx={{ fontSize: 36, mb: 1 }} />
            <Typography variant="h5" fontWeight="bold" color="warning.main" sx={{ mb: 0.5 }}>
              {formatCurrency(clientDetails?.totals?.totalDiscounts)}
            </Typography>
            <Typography variant="body1" color="warning.main" fontWeight="medium">
              إجمالي الخصومات
            </Typography>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );

  // Render repayment summary
  const renderRepaymentSummary = () => (
    <Box sx={{ display: "flex", justifyContent: "center", mb: 4 }}>
      <Grid container spacing={3} sx={{ maxWidth: "900px" }}>
        <Grid item xs={12} sm={4}>
          <Card 
            variant="outlined" 
            sx={{ 
              textAlign: "center", 
              p: 3,
              width: "250px",
              height: "100%",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              boxShadow: 1,
              borderRadius: 1,
            }}
          >
            <Typography variant="h4" fontWeight="bold" color="success.main" sx={{ mb: 1 }}>
              {clientDetails?.totals?.paidRepayments || 0}
            </Typography>
            <Typography variant="body2" color="textSecondary" fontWeight="medium">
              دفعات مدفوعة
            </Typography>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card 
            variant="outlined" 
            sx={{ 
              textAlign: "center", 
              p: 3,
              width: "250px",
              height: "100%",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              boxShadow: 1,
              borderRadius: 1,
            }}
          >
            <Typography variant="h4" fontWeight="bold" color="warning.main" sx={{ mb: 1 }}>
              {clientDetails?.totals?.pendingRepayments || 0}
            </Typography>
            <Typography variant="body2" color="textSecondary" fontWeight="medium">
              دفعات معلقة
            </Typography>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card 
            variant="outlined" 
            sx={{ 
              textAlign: "center", 
              p: 3,
              width: "250px",
              height: "100%",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              boxShadow: 1,
              borderRadius: 1,
            }}
          >
            <Typography variant="h4" fontWeight="bold" color="error.main" sx={{ mb: 1 }}>
              {clientDetails?.totals?.overdueRepayments || 0}
            </Typography>
            <Typography variant="body2" color="textSecondary" fontWeight="medium">
              دفعات متأخرة
            </Typography>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );

  // Render client information
  const renderClientInfo = () => (
    <Box sx={{ display: "flex", justifyContent: "center", mb: 4 }}>
      <Card 
        sx={{ 
          mb: 4, 
          p: 4, 
          width: "1200px",
          boxShadow: 3,
          borderRadius: 1,
        }}
      >
        <Typography 
          variant="h6" 
          fontWeight="bold" 
          color="primary" 
          sx={{ mb: 3, textAlign: "center" }}
        >
          معلومات العميل
        </Typography>
        <Grid container spacing={4} justifyContent="space-between">
          <Grid item xs={12} md={5}>
            <Box sx={{ mb: 3, textAlign: "right" }}>
              <Typography variant="body2" color="textSecondary" gutterBottom sx={{ mb: 1 }}>
                الاسم الكامل
              </Typography>
              <Typography variant="body1" fontWeight="bold" sx={{ p: 1.5, bgcolor: "grey.50", borderRadius: 0.5 }}>
                {clientDetails?.client?.name || "-"}
              </Typography>
            </Box>
            <Box sx={{ mb: 3, textAlign: "right" }}>
              <Typography variant="body2" color="textSecondary" gutterBottom sx={{ mb: 1 }}>
                الهاتف
              </Typography>
              <Typography variant="body1" fontWeight="bold" sx={{ p: 1.5, bgcolor: "grey.50", borderRadius: 0.5 }}>
                {clientDetails?.client?.phone || "-"}
              </Typography>
            </Box>
            <Box sx={{ mb: 3, textAlign: "right" }}>
              <Typography variant="body2" color="textSecondary" gutterBottom sx={{ mb: 1 }}>
                البريد الإلكتروني
              </Typography>
              <Typography variant="body1" fontWeight="bold" sx={{ p: 1.5, bgcolor: "grey.50", borderRadius: 0.5 }}>
                {clientDetails?.client?.email || "-"}
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} md={5}>
            <Box sx={{ mb: 3, textAlign: "center" }}>
              <Typography variant="body2" color="textSecondary" gutterBottom sx={{ mb: 1 }}>
                العنوان
              </Typography>
              <Typography variant="body1" fontWeight="bold" sx={{ p: 1.5, bgcolor: "grey.50", borderRadius: 0.5 }}>
                {clientDetails?.client?.address || "-"}
              </Typography>
            </Box>
            <Box sx={{ mb: 3, textAlign: "center" }}>
              <Typography variant="body2" color="textSecondary" gutterBottom sx={{ mb: 1 }}>
                الحالة
              </Typography>
              <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                <Chip
                  label={clientDetails?.client?.status || "-"}
                  color="success"
                  size="small"
                  sx={{ fontSize: "0.85rem", fontWeight: "bold" }}
                />
              </Box>
            </Box>
            <Box sx={{ mb: 3, textAlign: "center" }}>
              <Typography variant="body2" color="textSecondary" gutterBottom sx={{ mb: 1 }}>
                تاريخ الانضمام
              </Typography>
              <Typography variant="body1" fontWeight="bold" sx={{ p: 1.5, bgcolor: "grey.50", borderRadius: 0.5 }}>
                {formatDate(clientDetails?.client?.createdAt)}
              </Typography>
            </Box>
          </Grid>
          {clientDetails?.client?.notes && (
            <Grid item xs={12}>
              <Box sx={{ textAlign: "right" }}>
                <Typography variant="body2" color="textSecondary" gutterBottom sx={{ mb: 1 }}>
                  ملاحظات
                </Typography>
                <Typography 
                  variant="body1" 
                  fontStyle="italic" 
                  sx={{ p: 2, bgcolor: "grey.50", borderRadius: 1, textAlign: "right" }}
                >
                  {clientDetails.client.notes}
                </Typography>
              </Box>
            </Grid>
          )}
        </Grid>
      </Card>
    </Box>
  );

  // Render loans table
  const renderLoansTable = () => (
    <Box sx={{ display: "flex", justifyContent: "center", width: "100%" }}>
      <Card 
        sx={{ 
          p: 4, 
          maxWidth: "95%",
          width: "100%",
          boxShadow: 3,
          borderRadius: 1,
        }}
      >
        <Typography 
          variant="h6" 
          fontWeight="bold" 
          color="primary" 
          sx={{ mb: 3, textAlign: "center" }}
        >
          السلف والدفعات
        </Typography>
        <TableContainer sx={{ width: "100%", overflowX: "auto" }}>
          <Table sx={{ minWidth: 1200 }}>
            <TableHead>
              <StyledTableRow>
                <StyledTableCell align="center" sx={{ fontWeight: "bold" }}>كود السلفة</StyledTableCell>
                <StyledTableCell align="center" sx={{ fontWeight: "bold" }}>المبلغ</StyledTableCell>
                <StyledTableCell align="center" sx={{ fontWeight: "bold" }}>الفائدة</StyledTableCell>
                <StyledTableCell align="center" sx={{ fontWeight: "bold" }}>الخصم</StyledTableCell>
                <StyledTableCell align="center" sx={{ fontWeight: "bold" }}>المدفوع</StyledTableCell>
                <StyledTableCell align="center" sx={{ fontWeight: "bold" }}>المتبقي</StyledTableCell>
                <StyledTableCell align="center" sx={{ fontWeight: "bold" }}>الدفعات</StyledTableCell>
                <StyledTableCell align="center" sx={{ fontWeight: "bold" }}>الحالة</StyledTableCell>
              </StyledTableRow>
            </TableHead>
            <TableBody>
              {clientDetails?.loans?.length > 0 ? (
                clientDetails.loans.map((loan) => (
                  <StyledTableRow key={loan.loanId}>
                    <StyledTableCell align="center">
                      <Typography fontWeight="bold" color="primary" variant="body1">
                        {loan.code}
                      </Typography>
                    </StyledTableCell>
                    <StyledTableCell align="center">
                      <Typography variant="body1">
                        {formatCurrency(loan.amount)}
                      </Typography>
                    </StyledTableCell>
                    <StyledTableCell align="center">
                      <Typography variant="body1">
                        {formatCurrency(loan.interest)}
                      </Typography>
                    </StyledTableCell>
                    <StyledTableCell align="center">
                      <Typography variant="body1">
                        {formatCurrency(loan.discount)}
                      </Typography>
                    </StyledTableCell>
                    <StyledTableCell align="center">
                      <Typography fontWeight="bold" color="success.main" variant="body1">
                        {formatCurrency(loan.paidAmount)}
                      </Typography>
                    </StyledTableCell>
                    <StyledTableCell align="center">
                      <Typography 
                        fontWeight="bold" 
                        color={loan.remaining > 0 ? "error" : "success.main"}
                        variant="body1"
                      >
                        {formatCurrency(Math.abs(loan.remaining))}
                      </Typography>
                    </StyledTableCell>
                    <StyledTableCell align="center">
                      <Box sx={{ display: "flex", justifyContent: "center", gap: 2, flexWrap: "wrap" }}>
                        <Chip
                          label={`${loan.paidCount} مدفوعة`}
                          color="success"
                          size="small"
                        />
                        <Chip
                          label={`${loan.pendingCount} معلقة`}
                          color="warning"
                          size="small"
                        />
                        <Chip
                          label={`${loan.overdueCount} متأخرة`}
                          color="error"
                          size="small"
                        />
                      </Box>
                    </StyledTableCell>
                    <StyledTableCell align="center">
                      <Chip
                        label={getLoanStatusText(loan.status)}
                        color={getLoanStatusColor(loan.status)}
                        size="medium"
                        sx={{ fontWeight: "bold" }}
                      />
                    </StyledTableCell>
                  </StyledTableRow>
                ))
              ) : (
                <StyledTableRow>
                  <StyledTableCell colSpan={8} align="center" sx={{ py: 4 }}>
                    <Typography variant="body1" color="textSecondary">
                      لا توجد قروض مسجلة
                    </Typography>
                  </StyledTableCell>
                </StyledTableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>
    </Box>
  );

  // Render mobile client details
  const renderMobileClientDetails = () => (
    <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", width: "100%" }}>
      {/* Export buttons */}
      {permissions.includes("client-report_Export") && (
      <Box sx={{ display: "flex", gap: 1, mb: 2, width: "100%", maxWidth: "600px" }}>
        <Button
          variant="contained"
          color="error"
          startIcon={<PdfIcon sx={{marginLeft: "10px"}} />}
          onClick={handleExportPDF}
          disabled={isClientLoading || !clientDetails || isExportingPDF}
          size="small"
          sx={{ flex: 1, fontWeight: "bold" }}
        >
          {isExportingPDF ? "..." : "PDF"}
        </Button>
        <Button
          variant="contained"
          color="success"
          startIcon={<ExcelIcon sx={{marginLeft: "10px"}} />}
          onClick={handleExportExcel}
          disabled={isClientLoading || !clientDetails || isExportingExcel}
          size="small"
          sx={{ flex: 1, fontWeight: "bold" }}
        >
          {isExportingExcel ? "..." : "Excel"}
        </Button>
      </Box>
      )}
      {/* Client Info */}
      <Card sx={{ mb: 3, p: 3, width: "100%", maxWidth: "600px", boxShadow: 2, borderRadius: 1 }}>
        <Typography variant="h6" fontWeight="bold" color="primary" sx={{ mb: 3, textAlign: "center" }}>
          معلومات العميل
        </Typography>
        <Stack spacing={2.5}>
          <Box sx={{ textAlign: "right" }}>
            <Typography variant="body2" color="textSecondary" gutterBottom sx={{ mb: 1 }}>
              الاسم
            </Typography>
            <Typography variant="body1" fontWeight="bold" sx={{ p: 1.5, bgcolor: "grey.50", borderRadius: 0.5 }}>
              {clientDetails?.client?.name || "-"}
            </Typography>
          </Box>
          <Box sx={{ textAlign: "right" }}>
            <Typography variant="body2" color="textSecondary" gutterBottom sx={{ mb: 1 }}>
              الهاتف
            </Typography>
            <Typography variant="body1" fontWeight="bold" sx={{ p: 1.5, bgcolor: "grey.50", borderRadius: 0.5 }}>
              {clientDetails?.client?.phone || "-"}
            </Typography>
          </Box>
          <Box sx={{ textAlign: "right" }}>
            <Typography variant="body2" color="textSecondary" gutterBottom sx={{ mb: 1 }}>
              الحالة
            </Typography>
            <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
              <Chip 
                label={clientDetails?.client?.status || "-"} 
                color="success" 
                size="small"
                sx={{ fontSize: "0.85rem", fontWeight: "bold" }}
              />
            </Box>
          </Box>
        </Stack>
      </Card>

      {/* Summary Cards */}
      {renderClientSummaryCards()}

      {/* Repayment Summary */}
      {renderRepaymentSummary()}

      {/* Loans */}
      <Card sx={{ p: 3, mb: 2, width: "100%", maxWidth: "600px", boxShadow: 2, borderRadius: 1 }}>
        <Typography variant="h6" fontWeight="bold" color="primary" sx={{ mb: 3, textAlign: "center" }}>
          السلف والدفعات
        </Typography>
        <Stack spacing={2}>
          {clientDetails?.loans?.length > 0 ? (
            clientDetails.loans.map((loan) => (
              <Card key={loan.loanId} variant="outlined" sx={{ borderRadius: 1 }}>
                <CardContent>
                  <Stack spacing={2}>
                    <Typography variant="subtitle1" fontWeight="bold" color="primary" sx={{ textAlign: "center" }}>
                      {loan.code}
                    </Typography>
                    <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                      <Box sx={{ textAlign: "right" }}>
                        <Typography variant="body2" color="textSecondary" gutterBottom>المبلغ</Typography>
                        <Typography variant="body1" fontWeight="bold">{formatCurrency(loan.amount)}</Typography>
                      </Box>
                      <Box sx={{ textAlign: "right" }}>
                        <Typography variant="body2" color="textSecondary" gutterBottom>المدفوع</Typography>
                        <Typography variant="body1" fontWeight="bold" color="success.main">
                          {formatCurrency(loan.paidAmount)}
                        </Typography>
                      </Box>
                    </Box>
                    <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                      <Box sx={{ textAlign: "right" }}>
                        <Typography variant="body2" color="textSecondary" gutterBottom>المتبقي</Typography>
                        <Typography 
                          variant="body1" 
                          fontWeight="bold" 
                          color={loan.remaining > 0 ? "error" : "success.main"}
                        >
                          {formatCurrency(Math.abs(loan.remaining))}
                        </Typography>
                      </Box>
                      <Box sx={{ textAlign: "right" }}>
                        <Typography variant="body2" color="textSecondary" gutterBottom>الحالة</Typography>
                        <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                          <Chip
                            label={getLoanStatusText(loan.status)}
                            color={getLoanStatusColor(loan.status)}
                            size="small"
                            sx={{ fontWeight: "bold" }}
                          />
                        </Box>
                      </Box>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            ))
          ) : (
            <Typography variant="body1" color="textSecondary" sx={{ textAlign: "center", py: 3 }}>
              لا توجد قروض مسجلة
            </Typography>
          )}
        </Stack>
      </Card>
    </Box>
  );

  // Render desktop client details
  const renderDesktopClientDetails = () => (
    <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", width: "100%" }}>
      {/* Export buttons */}
      {permissions.includes("client-report_Export") && (
      <Box sx={{ display: "flex", gap: 2, mb: 3, width: "100%", maxWidth: "1400px", justifyContent: "flex-end" }}>
                    <Button
                      variant="contained"
                      color="error"
                      startIcon={<PdfIcon sx={{marginLeft: "10px"}} />}
                      onClick={handleExportPDF}
                      disabled={isClientLoading || !clientDetails || isExportingPDF}
                      sx={{ fontWeight: "bold" }}
                    >
                      {isExportingPDF ? "جاري التصدير..." : "تصدير PDF"}
                    </Button>
                    <Button
                      variant="contained"
                      color="success"
                      startIcon={<ExcelIcon sx={{marginLeft: "10px"}} />}
                      onClick={handleExportExcel}
                      disabled={isClientLoading || !clientDetails || isExportingExcel}
                      sx={{ fontWeight: "bold" }}
                    >
                      {isExportingExcel ? "جاري التصدير..." : "تصدير Excel"}
                    </Button>
      </Box>
      )}
      {renderClientInfo()}
      {renderClientSummaryCards()}
      {renderRepaymentSummary()}
      {renderLoansTable()}
    </Box>
  );

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
        <title>كشف تحصيل العملاء</title>
        <meta name="description" content="إدارة تحصيل العملاء والمستحقات" />
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
            <Box sx={{ mb: 4 }}>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                <Box sx={{ borderBottom: 1, borderColor: "divider", flex: 1 }}>
                  <Tabs
                    value={activeTab}
                    onChange={(e, newValue) => {
                      setActiveTab(newValue);
                      if (newValue === 0) {
                        setSelectedClient(null);
                      }
                    }}
                  >
                    <Tab
                      label="كشف التحصيل العام"
                      sx={{
                        fontWeight: "bold",
                        borderBottom: activeTab === 0 ? "3px solid #0d40a5" : "none",
                        color: activeTab === 0 ? "#0d40a5" : "text.secondary",
                      }}
                    />
                    <Tab
                      label={selectedClient ? "كشف تحصيل محدد" : "تحصيل محدد"}
                      sx={{
                        fontWeight: "bold",
                        borderBottom: activeTab === 1 ? "3px solid #0d40a5" : "none",
                        color: activeTab === 1 ? "#0d40a5" : "text.secondary",
                      }}
                    />
                  </Tabs>
                </Box>
              </Box>
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
                    كشف تحصيل العميل
                  </Typography>
                </Box>
              ) : (
                // Title for mobile list view
                <Typography variant="h6" fontWeight="bold" mb={2}>
                  كشف تحصيل العملاء
                </Typography>
              )}
            </Box>
          )}

          {activeTab === 0 || (isSmallScreen && !selectedClient) ? (
            <Paper
              sx={{
                flex: 1,
                width: "100%",
                overflow: "hidden",
                borderRadius: 2,
              }}
            >
              <ClientCollectionsTable
                onViewDetails={handleViewDetails}
                isLoading={isClientsLoading}
                clientsData={clientsData}
              />
            </Paper>
          ) : (
            <Box>
              {!selectedClient ? (
                <Alert severity="info" sx={{ mt: 2 }}>
                  يرجى اختيار عميل لعرض تفاصيل تحصيله
                </Alert>
              ) : isClientLoading ? (
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
              ) : clientDetails ? (
                isSmallScreen ? (
                  renderMobileClientDetails()
                ) : (
                  <Box sx={{ display: "flex", justifyContent: "center", width: "100%" }}>
                    {renderDesktopClientDetails()}
                  </Box>
                )
              ) : (
                <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
                  <Alert severity="error" sx={{ maxWidth: "600px", width: "100%" }}>
                    حدث خطأ في تحميل بيانات العميل
                  </Alert>
                </Box>
              )}
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default ClientCollections;