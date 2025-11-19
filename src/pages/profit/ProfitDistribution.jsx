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
  InputBase,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import {
  Check as CheckIcon,
  Cancel as CancelIcon,
  Visibility as VisibilityIcon,
  ArrowBack as ArrowBackIcon,
  AccountBalance as BalanceIcon,
} from "@mui/icons-material";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getClosedPeriods,
  postDistribution,
  unpostDistribution,
  getPeriodById,
} from "./profitApi";
import { notifySuccess, notifyError } from "../../utilities/toastify";
import {
  StyledTableCell,
  StyledTableRow,
} from "../../components/layouts/tableLayout";
import { Helmet } from "react-helmet-async";
import { usePermissions } from "../../components/Contexts/PermissionsContext";
import DeleteModal from "../../components/modals/DeleteModal";

const ProfitDistribution = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [selectedPeriod, setSelectedPeriod] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [distributionDialog, setDistributionDialog] = useState({
    open: false,
    periodId: null,
    periodName: "",
    action: "", // 'post' or 'unpost'
  });
  const [isDistributing, setIsDistributing] = useState(false);

  const isMobile = useMediaQuery("(max-width: 480px)");
  const isTablet = useMediaQuery("(max-width: 768px)");
  const isSmallScreen = isMobile || isTablet;

  const queryClient = useQueryClient();
  const { permissions } = usePermissions();

  // Query for closed periods
  const { data: closedPeriods, isLoading: isPeriodsLoading } = useQuery({
    queryKey: ["closed-periods"],
    queryFn: getClosedPeriods,
  });

  // Query for period details when selected
  const { data: periodData, isLoading: isPeriodLoading } = useQuery({
    queryKey: ["period", selectedPeriod],
    queryFn: () => getPeriodById(selectedPeriod),
    enabled: !!selectedPeriod && activeTab === 1,
  });

  const handleViewDetails = (periodId) => {
    setSelectedPeriod(periodId);
    setActiveTab(1);
  };

  const handleBackToList = () => {
    setActiveTab(0);
    setSelectedPeriod(null);
  };

  const handleOpenDistributionDialog = (periodId, periodName, action) => {
    setDistributionDialog({
      open: true,
      periodId,
      periodName,
      action,
    });
  };

  const handleCloseDistributionDialog = () => {
    setDistributionDialog({
      open: false,
      periodId: null,
      periodName: "",
      action: "",
    });
  };

  const handleConfirmDistribution = async () => {
    const { periodId, action } = distributionDialog;
    
    try {
      setIsDistributing(true);
      if (action === 'post') {
        await postDistribution(periodId);
        notifySuccess("تم توزيع الأرباح بنجاح");
      }
      
      queryClient.invalidateQueries(["closed-periods"]);
      queryClient.invalidateQueries(["period", periodId]);
      handleCloseDistributionDialog();
    } catch (error) {
      notifyError(error.response?.data?.message || "حدث خطأ أثناء العملية");
    } finally {
      setIsDistributing(false);
    }
  };

  const handleConfirmUnpost = async () => {
    const { periodId } = distributionDialog;
    
    try {
      setIsDistributing(true);
      await unpostDistribution(periodId);
      notifySuccess("تم إلغاء توزيع الأرباح بنجاح");
      
      queryClient.invalidateQueries(["closed-periods"]);
      queryClient.invalidateQueries(["period", periodId]);
      handleCloseDistributionDialog();
    } catch (error) {
      notifyError(error.response?.data?.message || "حدث خطأ أثناء العملية");
    } finally {
      setIsDistributing(false);
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return "غير محدد";
    return new Date(dateString).toLocaleDateString('en-US');
  };

  // Get journal status in Arabic
  const getJournalStatusText = (status) => {
    switch (status) {
      case "DRAFT":
        return "مسودة";
      case "POSTED":
        return "معتمد";
      case "CANCELLED":
        return "ملغي";
      default:
        return status;
    }
  };

  // Check if period has distribution using isDistributed field
  const hasDistribution = (period) => {
    return period.isDistributed === true;
  };

  // Render desktop sidebar
  const renderDesktopSidebar = () => (
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
          ملخص التوزيع
        </Typography>
        <Stack spacing={2}>
          <Box sx={{ display: "flex", justifyContent: "space-between" }}>
            <Typography>أرباح الشركة:</Typography>
            <Typography fontWeight="bold" color="primary.main">
              {periodData?.companyProfit?.toLocaleString() || 0}
            </Typography>
          </Box>
          <Box sx={{ display: "flex", justifyContent: "space-between" }}>
            <Typography>إجمالي أرباح الشركاء:</Typography>
            <Typography fontWeight="bold" color="success.main">
              {periodData?.totalPartnerProfit?.toLocaleString() || 0}
            </Typography>
          </Box>
          <Box sx={{ display: "flex", justifyContent: "space-between" }}>
            <Typography>عدد الشركاء:</Typography>
            <Typography fontWeight="bold">
              {periodData?.partnerProfits?.length || 0}
            </Typography>
          </Box>
          <Box sx={{ display: "flex", justifyContent: "space-between" }}>
            <Typography>الحالة:</Typography>
            <Chip
              label={hasDistribution(periodData) ? "موزعة" : "غير موزعة"}
              color={hasDistribution(periodData) ? "success" : "warning"}
              size="small"
            />
          </Box>
        </Stack>
      </Box>

      <Box sx={{ p: 3 }}>
        <Typography variant="h6" color="primary" fontWeight="bold" mb={3}>
          الإجراءات
        </Typography>
        <Stack spacing={2}>
          {!hasDistribution(periodData) && permissions.includes("distribution_Post") && (
            <Button
              variant="contained"
              startIcon={<CheckIcon sx={{ marginLeft: "10px" }} />}
              onClick={() => 
                handleOpenDistributionDialog(
                  selectedPeriod, 
                  periodData?.name, 
                  'post'
                )
              }
              sx={{
                bgcolor: "success.main",
                "&:hover": { bgcolor: "success.dark" },
              }}
            >
              توزيع الأرباح
            </Button>
          )}

          {hasDistribution(periodData) && permissions.includes("distribution_Post") && (
            <Button
              variant="outlined"
              startIcon={<CancelIcon sx={{ marginLeft: "10px" }} />}
              onClick={() => 
                handleOpenDistributionDialog(
                  selectedPeriod, 
                  periodData?.name, 
                  'unpost'
                )
              }
              sx={{
                borderColor: "error.main",
                color: "error.main",
                "&:hover": { bgcolor: "rgba(211, 47, 47, 0.1)" },
              }}
            >
              إلغاء التوزيع
            </Button>
          )}
        </Stack>
      </Box>
    </Box>
  );

  // Render mobile actions
  const renderMobileActions = () => (
    <Paper sx={{ p: 2, mb: 2, borderRadius: 2 }}>
      <Typography variant="h6" color="primary" fontWeight="bold" mb={2}>
        الإجراءات
      </Typography>
      <Stack spacing={1}>
        {!hasDistribution(periodData) && permissions.includes("distribution_Post") && (
          <Button
            variant="contained"
            startIcon={<CheckIcon />}
            onClick={() => 
              handleOpenDistributionDialog(
                selectedPeriod, 
                periodData?.name, 
                'post'
              )
            }
            fullWidth
            size="small"
            sx={{ bgcolor: "success.main" }}
          >
            توزيع الأرباح
          </Button>
        )}

        {hasDistribution(periodData) && permissions.includes("distribution_Post") && (
          <Button
            variant="outlined"
            startIcon={<CancelIcon />}
            onClick={() => 
              handleOpenDistributionDialog(
                selectedPeriod, 
                periodData?.name, 
                'unpost'
              )
            }
            fullWidth
            size="small"
            color="error"
          >
            إلغاء التوزيع
          </Button>
        )}
      </Stack>
    </Paper>
  );

  // Render closed periods table for desktop
  const renderClosedPeriodsTable = () => (
    <TableContainer sx={{ height: "100%", width: "100%" }}>
      <Table stickyHeader sx={{ width: "100%" }}>
        <TableHead>
          <StyledTableRow>
            <StyledTableCell align="center" sx={{ whiteSpace: "nowrap" }}>
              اسم الفترة
            </StyledTableCell>
            <StyledTableCell align="center" sx={{ whiteSpace: "nowrap" }}>
              تاريخ البداية
            </StyledTableCell>
            <StyledTableCell align="center" sx={{ whiteSpace: "nowrap" }}>
              تاريخ النهاية
            </StyledTableCell>
            <StyledTableCell align="center" sx={{ whiteSpace: "nowrap" }}>
              أرباح الشركة
            </StyledTableCell>
            <StyledTableCell align="center" sx={{ whiteSpace: "nowrap" }}>
              حالة التوزيع
            </StyledTableCell>
            <StyledTableCell align="center" sx={{ whiteSpace: "nowrap" }}>
              الإجراءات
            </StyledTableCell>
          </StyledTableRow>
        </TableHead>
        <TableBody>
          {isPeriodsLoading ? (
            <StyledTableRow>
              <StyledTableCell colSpan={6} align="center">
                <CircularProgress size={20} />
              </StyledTableCell>
            </StyledTableRow>
          ) : closedPeriods?.length === 0 ? (
            <StyledTableRow>
              <StyledTableCell colSpan={6} align="center">
                <Typography>لا توجد فترات مقفلة</Typography>
              </StyledTableCell>
            </StyledTableRow>
          ) : (
            closedPeriods?.map((period) => (
              <StyledTableRow 
                key={period.periodId} 
                hover
                onClick={() => handleViewDetails(period.periodId)}
                sx={{ cursor: "pointer" }}
              >
                <StyledTableCell align="center">
                  {period.name}
                </StyledTableCell>
                <StyledTableCell align="center" sx={{ whiteSpace: "nowrap" }}>
                  {formatDate(period.startDate)}
                </StyledTableCell>
                <StyledTableCell align="center" sx={{ whiteSpace: "nowrap" }}>
                  {formatDate(period.endDate)}
                </StyledTableCell>
                <StyledTableCell align="center" sx={{ whiteSpace: "nowrap" }}>
                  <Typography fontWeight="bold" color="primary.main">
                    {period.companyProfit?.toLocaleString() || 0}
                  </Typography>
                </StyledTableCell>
                <StyledTableCell align="center" sx={{ whiteSpace: "nowrap" }}>
                  <Chip
                    label={hasDistribution(period) ? "موزعة" : "غير موزعة"}
                    color={hasDistribution(period) ? "success" : "warning"}
                    size="small"
                  />
                </StyledTableCell>
                <StyledTableCell align="center" sx={{ whiteSpace: "nowrap" }}>
                  <Stack direction="row" spacing={1} justifyContent="center">
                    {permissions.includes("distribution_View") && (
                      <IconButton
                        title="عرض التفاصيل"
                        size="small"
                        color="primary"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewDetails(period.periodId);
                        }}
                      >
                        <VisibilityIcon fontSize="small" />
                      </IconButton>
                    )}
                  </Stack>
                </StyledTableCell>
              </StyledTableRow>
            ))
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );

  // Render closed periods cards for mobile
  const renderClosedPeriodsCards = () => (
    <Box sx={{ p: 1 }}>
      {isPeriodsLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress size={30} />
        </Box>
      ) : closedPeriods?.length === 0 ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <Typography variant="h6" color="textSecondary">
            لا توجد فترات مقفلة
          </Typography>
        </Box>
      ) : (
        <Grid container spacing={2}>
          {closedPeriods?.map((period) => (
            <Grid item xs={12} key={period.periodId}>
              <Card 
                sx={{ 
                  border: '1px solid #e0e0e0',
                  borderRadius: 2,
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                  '&:hover': {
                    boxShadow: '0 4px 8px rgba(0,0,0,0.15)',
                  },
                  cursor: 'pointer'
                }}
                onClick={() => handleViewDetails(period.periodId)}
              >
                <CardContent sx={{ p: 2 }}>
                  <Stack spacing={1}>
                    {/* Header */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <Typography variant="h6" fontWeight="bold" color="primary.main">
                        {period.name}
                      </Typography>
                      <Chip
                        label={hasDistribution(period) ? "موزعة" : "غير موزعة"}
                        color={hasDistribution(period) ? "success" : "warning"}
                        size="small"
                      />
                    </Box>

                    {/* Period Details */}
                    <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1 }}>
                      <Box>
                        <Typography variant="body2" color="textSecondary">
                          من:
                        </Typography>
                        <Typography variant="body2" fontWeight="medium">
                          {formatDate(period.startDate)}
                        </Typography>
                      </Box>
                      
                      <Box>
                        <Typography variant="body2" color="textSecondary">
                          إلى:
                        </Typography>
                        <Typography variant="body2" fontWeight="medium">
                          {formatDate(period.endDate)}
                        </Typography>
                      </Box>
                    </Box>

                    {/* Profit Details */}
                    <Box>
                      <Typography variant="body2" color="textSecondary">
                        أرباح الشركة:
                      </Typography>
                      <Typography variant="body1" fontWeight="bold" color="primary.main">
                        {period.companyProfit?.toLocaleString() || 0}
                      </Typography>
                    </Box>

                    {/* Partners Count */}
                    <Box>
                      <Typography variant="body2" color="textSecondary">
                        عدد الشركاء:
                      </Typography>
                      <Typography variant="body2" fontWeight="medium">
                        {period.partners?.length || 0}
                      </Typography>
                    </Box>

                    {/* Action Buttons */}
                    <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, pt: 1 }}>
                      {permissions.includes("distribution_View") && (
                        <IconButton
                          title="عرض التفاصيل"
                          size="small"
                          color="primary"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewDetails(period.periodId);
                          }}
                        >
                          <VisibilityIcon fontSize="small" />
                        </IconButton>
                      )}
                      {permissions.includes("distribution_Post") && (
                        <IconButton
                          title={hasDistribution(period) ? "إلغاء التوزيع" : "توزيع الأرباح"}
                          size="small"
                          color={hasDistribution(period) ? "error" : "success"}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenDistributionDialog(
                              period.periodId,
                              period.name,
                              hasDistribution(period) ? 'unpost' : 'post'
                            );
                          }}
                        >
                          {hasDistribution(period) ? <CancelIcon style={{ fontSize: "20px" }} /> : <CheckIcon style={{ fontSize: "20px" }} />}
                        </IconButton>
                      )}
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );

  // Render mobile period details
  const renderMobilePeriodDetails = () => (
    <Box>
      {/* Summary Cards */}
      <Grid container spacing={2} mb={3}>
        <Grid item xs={6}>
          <Card sx={{ bgcolor: "rgba(25, 118, 210, 0.1)", textAlign: "center" }}>
            <CardContent sx={{ p: 2 }}>
              <Typography variant="body2" color="primary.main">
                أرباح الشركة
              </Typography>
              <Typography variant="h6" fontWeight="bold" color="primary.main">
                {periodData?.companyProfit?.toLocaleString() || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6}>
          <Card sx={{ bgcolor: "rgba(46, 125, 50, 0.1)", textAlign: "center" }}>
            <CardContent sx={{ p: 2 }}>
              <Typography variant="body2" color="success.main">
                أرباح الشركاء
              </Typography>
              <Typography variant="h6" fontWeight="bold" color="success.main">
                {periodData?.totalPartnerProfit?.toLocaleString() || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Actions */}
      {renderMobileActions()}

      {/* Period Info */}
      <Paper sx={{ p: 3, borderRadius: 2, mb: 2 }}>
        <Typography variant="h6" fontWeight="bold" mb={3} textAlign="center">
          معلومات الفترة
        </Typography>

        <Stack spacing={2}>
          <Box>
            <Typography variant="body2" color="textSecondary" gutterBottom>
              اسم الفترة
            </Typography>
            <Typography variant="body1" fontWeight="bold">
              {periodData?.name || "-"}
            </Typography>
          </Box>

          <Box>
            <Typography variant="body2" color="textSecondary" gutterBottom>
              تاريخ البداية
            </Typography>
            <Typography variant="body1" fontWeight="bold">
              {formatDate(periodData?.startDate)}
            </Typography>
          </Box>

          <Box>
            <Typography variant="body2" color="textSecondary" gutterBottom>
              تاريخ النهاية
            </Typography>
            <Typography variant="body1" fontWeight="bold">
              {formatDate(periodData?.endDate)}
            </Typography>
          </Box>

          <Box>
            <Typography variant="body2" color="textSecondary" gutterBottom>
              حالة التوزيع
            </Typography>
            <Chip
              label={hasDistribution(periodData) ? "موزعة" : "غير موزعة"}
              color={hasDistribution(periodData) ? "success" : "warning"}
              size="small"
            />
          </Box>
        </Stack>
      </Paper>

      {/* Partner Profits with additional data */}
      {periodData?.partnerProfits && periodData.partnerProfits.length > 0 && (
        <Paper sx={{ p: 2, borderRadius: 2, mb: 2 }}>
          <Typography variant="h6" fontWeight="bold" mb={2} textAlign="center">
            أرباح الشركاء
          </Typography>
          
          <Stack spacing={2}>
            {periodData.partnerProfits.map((partner) => (
              <Card key={partner.partnerId} variant="outlined">
                <CardContent sx={{ p: 2 }}>
                  <Stack spacing={1}>
                    <Typography variant="subtitle2" fontWeight="bold">
                      {partner.partnerName}
                    </Typography>
                    
                    <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1 }}>
                      <Box>
                        <Typography variant="body2" color="textSecondary">
                          الرقم القومي:
                        </Typography>
                        <Typography variant="body2" fontWeight="medium">
                          {partner.partnerNationalId || "-"}
                        </Typography>
                      </Box>
                      
                      <Box>
                        <Typography variant="body2" color="textSecondary">
                          الهاتف:
                        </Typography>
                        <Typography variant="body2" fontWeight="medium">
                          {partner.partnerPhone || "-"}
                        </Typography>
                      </Box>
                    </Box>

                    <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1 }}>
                      <Box>
                        <Typography variant="body2" color="textSecondary">
                          نسبة الربح:
                        </Typography>
                        <Typography variant="body2" fontWeight="medium">
                          {partner.orgProfitPercent}%
                        </Typography>
                      </Box>
                      
                      <Box>
                        <Typography variant="body2" color="textSecondary">
                          الربح:
                        </Typography>
                        <Typography variant="body2" fontWeight="bold" color="success.main">
                          {partner.totalProfit.toLocaleString()}
                        </Typography>
                      </Box>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            ))}
          </Stack>
        </Paper>
      )}

      {/* Distribution Journal */}
      {periodData?.journals?.find(j => j.type === "CLOSING") && (
        <Paper sx={{ p: 2, borderRadius: 2 }}>
          <Typography variant="h6" fontWeight="bold" mb={2} textAlign="center">
            قيد توزيع الأرباح
          </Typography>
          
          {periodData.journals
            .filter(journal => journal.type === "CLOSING")
            .map((journal) => (
              <Card key={journal.id} variant="outlined" sx={{ mb: 2 }}>
                <CardContent sx={{ p: 2 }}>
                  <Stack spacing={1}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <Typography variant="subtitle2" fontWeight="bold" color="primary">
                        {journal.reference}
                      </Typography>
                      <Chip
                        label={getJournalStatusText(journal.status)}
                        color={journal.status === "POSTED" ? "success" : "default"}
                        size="small"
                      />
                    </Box>
                    
                    <Typography variant="body2">
                      {journal.description}
                    </Typography>
                    
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" color="textSecondary">
                        {formatDate(journal.date)}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        مدين: {journal.totalDebit?.toLocaleString() || 0} | دائن: {journal.totalCredit?.toLocaleString() || 0}
                      </Typography>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            ))}
        </Paper>
      )}
    </Box>
  );

  // Render desktop period details
  const renderDesktopPeriodDetails = () => (
    <Paper sx={{ p: 4, borderRadius: 2 }}>
      <Typography variant="h6" color="primary" fontWeight="bold" mb={3} textAlign={"center"}>
        تفاصيل توزيع الأرباح
      </Typography>

      {/* Period Information */}
      <Grid container spacing={10} mb={4} justifyContent="center" alignItems="center">
        <Grid item xs={12} md={6}>
          <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
            اسم الفترة:
          </Typography>
          <Typography variant="body1">{periodData?.name || "-"}</Typography>
        </Grid>
        <Grid item xs={12} md={6}>
          <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
            حالة التوزيع:
          </Typography>
          <Chip
            label={hasDistribution(periodData) ? "موزعة" : "غير موزعة"}
            color={hasDistribution(periodData) ? "success" : "warning"}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
            تاريخ البداية:
          </Typography>
          <Typography variant="body1">{formatDate(periodData?.startDate)}</Typography>
        </Grid>
        <Grid item xs={12} md={6}>
          <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
            تاريخ النهاية:
          </Typography>
          <Typography variant="body1">{formatDate(periodData?.endDate)}</Typography>
        </Grid>
      </Grid>

      <Divider sx={{ my: 3 }} />

      {/* Profit Summary */}
      <Grid container spacing={3} mb={4} justifyContent="center" alignItems="center">
        <Grid item xs={12} md={6}>
          <Card sx={{ bgcolor: "primary.50", p: 3, textAlign: "center" }}>
            <BalanceIcon color="primary" sx={{ fontSize: 40, mb: 1 }} />
            <Typography variant="h5" fontWeight="bold" color="primary.main">
              {periodData?.companyProfit?.toLocaleString() || 0}
            </Typography>
            <Typography variant="body1" color="primary.main">
              أرباح الشركة
            </Typography>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card sx={{ bgcolor: "success.50", p: 3, textAlign: "center" }}>
            <BalanceIcon color="success" sx={{ fontSize: 40, mb: 1 }} />
            <Typography variant="h5" fontWeight="bold" color="success.main">
              {periodData?.totalPartnerProfit?.toLocaleString() || 0}
            </Typography>
            <Typography variant="body1" color="success.main">
              إجمالي أرباح الشركاء
            </Typography>
          </Card>
        </Grid>
      </Grid>

      {/* Partner Profits with additional data */}
      {periodData?.partnerProfits && periodData.partnerProfits.length > 0 && (
        <>
          <Typography variant="h6" color="primary" fontWeight="bold" mb={3} textAlign="center">
            توزيع الأرباح على الشركاء
          </Typography>
          <TableContainer component={Paper} variant="outlined" sx={{ mb: 4 }}>
            <Table>
              <TableHead>
                <StyledTableRow>
                  <StyledTableCell align="center">اسم الشريك</StyledTableCell>
                  <StyledTableCell align="center">الرقم القومي</StyledTableCell>
                  <StyledTableCell align="center">الهاتف</StyledTableCell>
                  <StyledTableCell align="center">نسبة الربح</StyledTableCell>
                  <StyledTableCell align="center">الربح</StyledTableCell>
                </StyledTableRow>
              </TableHead>
              <TableBody>
                {periodData.partnerProfits.map((partner) => (
                  <StyledTableRow key={partner.partnerId}>
                    <StyledTableCell align="center">
                      {partner.partnerName}
                    </StyledTableCell>
                    <StyledTableCell align="center">
                      {partner.partnerNationalId || "-"}
                    </StyledTableCell>
                    <StyledTableCell align="center">
                      {partner.partnerPhone || "-"}
                    </StyledTableCell>
                    <StyledTableCell align="center">
                      {partner.orgProfitPercent}%
                    </StyledTableCell>
                    <StyledTableCell align="center">
                      <Typography fontWeight="bold" color="success.main">
                        {partner.totalProfit.toLocaleString()}
                      </Typography>
                    </StyledTableCell>
                  </StyledTableRow>
                ))}
                <StyledTableRow sx={{ backgroundColor: "#f5f5f5" }}>
                  <StyledTableCell colSpan={4} align="center">
                    <Typography fontWeight="bold">الإجمالي</Typography>
                  </StyledTableCell>
                  <StyledTableCell align="center">
                    <Typography fontWeight="bold" color="success.main">
                      {periodData.totalPartnerProfit.toLocaleString()}
                    </Typography>
                  </StyledTableCell>
                </StyledTableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </>
      )}

      {/* Distribution Journal */}
      {periodData?.journals?.find(j => j.type === "CLOSING") && (
        <>
          <Divider sx={{ my: 3 }} />
          <Typography variant="h6" color="primary" fontWeight="bold" mb={3} textAlign="center">
            قيد توزيع الأرباح
          </Typography>
          <TableContainer component={Paper} variant="outlined">
            <Table>
              <TableHead>
                <StyledTableRow>
                  <StyledTableCell align="center">الرقم المرجعي</StyledTableCell>
                  <StyledTableCell align="center">الوصف</StyledTableCell>
                  <StyledTableCell align="center">الحالة</StyledTableCell>
                  <StyledTableCell align="center">التاريخ</StyledTableCell>
                  <StyledTableCell align="center">مدين</StyledTableCell>
                  <StyledTableCell align="center">دائن</StyledTableCell>
                </StyledTableRow>
              </TableHead>
              <TableBody>
                {periodData.journals
                  .filter(journal => journal.type === "CLOSING")
                  .map((journal) => (
                    <StyledTableRow key={journal.id}>
                      <StyledTableCell align="center">
                        {journal.reference}
                      </StyledTableCell>
                      <StyledTableCell align="center">
                        {journal.description}
                      </StyledTableCell>
                      <StyledTableCell align="center">
                        <Chip
                          label={getJournalStatusText(journal.status)}
                          color={journal.status === "POSTED" ? "success" : "default"}
                          size="small"
                        />
                      </StyledTableCell>
                      <StyledTableCell align="center">
                        {formatDate(journal.date)}
                      </StyledTableCell>
                      <StyledTableCell align="center">
                        {journal.totalDebit?.toLocaleString() || 0}
                      </StyledTableCell>
                      <StyledTableCell align="center">
                        {journal.totalCredit?.toLocaleString() || 0}
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

  // Confirmation Dialog for post distribution
  const renderConfirmationDialog = () => (
    distributionDialog.action === 'post' && (
      <Dialog
        open={distributionDialog.open}
        onClose={handleCloseDistributionDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Typography variant="h6" fontWeight="bold">
            توزيع الأرباح
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Typography>
            هل أنت متأكد من توزيع أرباح الفترة "{distributionDialog.periodName}"؟
          </Typography>
          <Alert severity="warning" sx={{ mt: 2 }}>
            سيتم إنشاء قيد محاسبي لتوزيع الأرباح على الشركاء
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDistributionDialog} disabled={isDistributing}>
            إلغاء
          </Button>
          <Button
            onClick={handleConfirmDistribution}
            variant="contained"
            color="success"
            startIcon={<CheckIcon />}
            disabled={isDistributing}
          >
            تأكيد التوزيع
            {isDistributing && (
              <CircularProgress size={16} color="inherit" style={{ marginLeft: 8 }} />
            )}
          </Button>
        </DialogActions>
      </Dialog>
    )
  );

  // Delete Modal for unpost distribution
  const renderUnpostModal = () => (
    distributionDialog.action === 'unpost' && (
      <DeleteModal
        open={distributionDialog.open}
        onClose={handleCloseDistributionDialog}
        onConfirm={handleConfirmUnpost}
        title="إلغاء توزيع الأرباح"
        message={`هل أنت متأكد من إلغاء توزيع أرباح الفترة "${distributionDialog.periodName}"؟`}
        isLoading={isDistributing}
        ButtonText="إلغاء التوزيع"
      />
    )
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
        <title>توزيع الأرباح</title>
        <meta name="description" content="توزيع الأرباح على الشركاء" />
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
        {!isSmallScreen && activeTab === 1 && periodData && renderDesktopSidebar()}

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
                      setSelectedPeriod(null);
                    }
                  }}
                >
                  <Tab
                    label="الفترات المقفلة"
                    sx={{
                      fontWeight: "bold",
                      borderBottom:
                        activeTab === 0 ? "3px solid #0d40a5" : "none",
                      color: activeTab === 0 ? "#0d40a5" : "text.secondary",
                    }}
                  />
                  <Tab
                    label={selectedPeriod ? "تفاصيل التوزيع" : "توزيع محدد"}
                    sx={{
                      fontWeight: "bold",
                      borderBottom:
                        activeTab === 1 ? "3px solid #0d40a5" : "none",
                      color: activeTab === 1 ? "#0d40a5" : "text.secondary",
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
                      تفاصيل التوزيع
                    </Typography>
                  </Box>
                ) : (
                  // Title for mobile list view
                  <Box>
                    <Typography variant="h6" fontWeight="bold" mb={2}>
                      توزيع الأرباح
                    </Typography>
                    <InputBase
                      placeholder="ابحث باسم الفترة..."
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value);
                      }}
                      sx={{
                        width: "100%",
                        borderRadius: "6px",
                        p: 1,
                        border: "1px solid #e0e0e0",
                        bgcolor: "background.paper"
                      }}
                    />
                  </Box>
                )}
              </Box>
            )}

            {activeTab === 0 || (isSmallScreen && !selectedPeriod) ? (
              <Paper sx={{ flex: 1, width: "100%", overflow: "hidden", borderRadius: 2 }}>
                {isSmallScreen ? renderClosedPeriodsCards() : renderClosedPeriodsTable()}
              </Paper>
            ) : (
              <Box>
                {!selectedPeriod ? (
                  <Alert severity="info" sx={{ mt: 2 }}>
                    يرجى اختيار فترة لعرض تفاصيلها
                  </Alert>
                ) : isPeriodLoading ? (
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      height: "100%",
                    }}
                  >
                    <CircularProgress size={20} />
                  </Box>
                ) : periodData ? (
                  isSmallScreen ? renderMobilePeriodDetails() : renderDesktopPeriodDetails()
                ) : (
                  <Alert severity="error">حدث خطأ في تحميل بيانات الفترة</Alert>
                )}
              </Box>
            )}
          </Box>
        </Box>
      </Box>

      {/* Confirmation Dialog */}
      {renderConfirmationDialog()}
      {renderUnpostModal()}
    </Box>
  );
};

export default ProfitDistribution;