import React, { useState, useEffect } from "react";
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
  FormControlLabel,
  Checkbox,
} from "@mui/material";
import {
  Check as CheckIcon,
  Cancel as CancelIcon,
  Visibility as VisibilityIcon,
  ArrowBack as ArrowBackIcon,
  AccountBalance as BalanceIcon,
  Savings as SavingsIcon,
  PictureAsPdf as PDFIcon,
  TableRows as ExcelIcon,
} from "@mui/icons-material";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocation, useNavigate } from "react-router-dom";
import {
  getClosedPeriods,
  postDistribution,
  unpostDistribution,
} from "./profitApi";
import { notifySuccess, notifyError } from "../../utilities/toastify";
import {
  StyledTableCell,
  StyledTableRow,
  ScrollableTableContainer,
} from "../../components/layouts/tableLayout";
import { Helmet } from "react-helmet-async";
import { usePermissions } from "../../components/Contexts/PermissionsContext";
import DeleteModal from "../../components/modals/DeleteModal";
import SavingPercentage from "../../components/modals/SavingPercentage";
import { exportProfitDistributionToPDF, exportProfitDistributionToExcel } from "../../utilities/ProfitDistributionExporter";
import "dayjs/locale/ar";
import dayjs from "dayjs";

const ProfitDistribution = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(0);
  const [selectedPeriod, setSelectedPeriod] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [cameFromSaving, setCameFromSaving] = useState(false);
  const [cameFromPeriodClosing, setCameFromPeriodClosing] = useState(false);
  const [distributionDialog, setDistributionDialog] = useState({
    open: false,
    periodId: null,
    periodName: "",
    action: "", // 'post' or 'unpost'
  });
  const [savingDialog, setSavingDialog] = useState({
    open: false,
    periodId: null,
  });
  const [isDistributing, setIsDistributing] = useState(false);
  const [enableSaving, setEnableSaving] = useState(false);
  const [savingPercentage, setSavingPercentage] = useState(0);
  const [isExporting, setIsExporting] = useState(false);

  const isMobile = useMediaQuery("(max-width: 480px)");
  const isTablet = useMediaQuery("(max-width: 768px)");
  const isSmallScreen = isMobile || isTablet;

  const queryClient = useQueryClient();
  const { permissions } = usePermissions();

  // Check for periodId in URL query parameters
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const periodIdParam = searchParams.get('periodId');
    const fromParam = searchParams.get('from');
    
    if (periodIdParam) {
      const periodId = parseInt(periodIdParam, 10);
      if (!isNaN(periodId)) {
        setSelectedPeriod(periodId);
        setActiveTab(1);
        
        // Check if coming from period closing page
        if (fromParam === 'period-closing') {
          setCameFromPeriodClosing(true);
          setCameFromSaving(false);
        } else {
          setCameFromSaving(true); // Mark that user came from saving page
          setCameFromPeriodClosing(false);
        }
      }
    }
  }, [location.search]);

  const handleBackToSaving = () => {
    navigate('/saving');
  };

  const handleBackToPeriodClosing = () => {
    navigate('/period-closing');
  };

  // Query for closed periods
  const { data: closedPeriods, isLoading: isPeriodsLoading } = useQuery({
    queryKey: ["closed-periods"],
    queryFn: () => getClosedPeriods(),
  });

  // Query for period details when selected
  const { data: periodDetailsData, isLoading: isPeriodLoading } = useQuery({
    queryKey: ["closed-periods", selectedPeriod],
    queryFn: () => getClosedPeriods(selectedPeriod),
    enabled: !!selectedPeriod && activeTab === 1,
  });

  // Extract period data from the array response
  const periodData = periodDetailsData && periodDetailsData.length > 0 
    ? periodDetailsData[0] 
    : null;

  const handleViewDetails = (periodId) => {
    setSelectedPeriod(periodId);
    setActiveTab(1);
  };

  const handleBackToList = () => {
    setActiveTab(0);
    setSelectedPeriod(null);
    setEnableSaving(false);
    setSavingPercentage(0);
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

  const handleOpenSavingDialog = () => {
    setSavingDialog({
      open: true,
      periodId: selectedPeriod,
    });
  };

  const handleCloseSavingDialog = () => {
    setSavingDialog({
      open: false,
      periodId: null,
    });
  };

  const handleApplySavingPercentage = (percentage) => {
    setSavingPercentage(percentage);
    setEnableSaving(true);
  };

  const handleConfirmDistribution = async () => {
    const { periodId, action } = distributionDialog;

    try {
      setIsDistributing(true);
      if (action === "post") {
        // إرسال نسبة الادخار إذا كانت مفعلة
        const savingPercent = enableSaving ? savingPercentage : 0;
        await postDistribution(periodId, savingPercent);
        notifySuccess(`تم توزيع الأرباح بنجاح ${enableSaving ? `مع ادخار ${savingPercentage}%` : ''}`);
      }

      queryClient.invalidateQueries(["closed-periods"]);
      handleCloseDistributionDialog();
      
      // إعادة تعيين إعدادات الادخار
      setEnableSaving(false);
      setSavingPercentage(0);
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
      handleCloseDistributionDialog();
    } catch (error) {
      notifyError(error.response?.data?.message || "حدث خطأ أثناء العملية");
    } finally {
      setIsDistributing(false);
    }
  };

  const handleExportPDF = async () => {
    try {
      setIsExporting(true);
      await exportProfitDistributionToPDF(periodData, enableSaving, savingPercentage);
      notifySuccess("تم تصدير التقرير بنجاح");
    } catch (error) {
      notifyError(error.message || "حدث خطأ أثناء التصدير");
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportExcel = async () => {
    try {
      setIsExporting(true);
      await exportProfitDistributionToExcel(periodData, enableSaving, savingPercentage);
      notifySuccess("تم تصدير التقرير بنجاح");
    } catch (error) {
      notifyError(error.message || "حدث خطأ أثناء التصدير");
    } finally {
      setIsExporting(false);
    }
  };

  // Handle view journal details
  const handleViewJournal = (journalId) => {
    // Navigate to journals page with details tab and selected journal
    navigate('/journal-entries', {
      state: {
        journalId: journalId,
        activeTab: 1,
        fromProfitDistribution: true
      }
    });
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return "غير محدد";
    return new Date(dateString).toLocaleDateString("en-US");
  };

  const formatArabicDate = (date) => {
    return dayjs(date)
      .locale("ar")
      .format("D [من] MMMM [الساعة] h:mm") // format without A
      + " " 
      + (dayjs(date).hour() < 12 ? "صباحًا" : "مساءً");
  };

  // Format number with decimals (no rounding)
  const formatNumber = (num) => {
    if (!num) return "0";
    return Number(num).toLocaleString('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    });
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

  const hasDistribution = (period) => {
    return period?.isDistributed === true || 
           (period?.distributionJournal && period.distributionJournal.status === "POSTED");
  };


  const calculateProfitAfterSaving = () => {
    if (!periodData) return { companyProfit: 0, partnerProfit: 0, savedAmount: 0 };

    const totalPartnerProfit = periodData.partners?.reduce((sum, partner) => sum + (partner.finalProfit || partner.totalProfit || 0), 0) || 0;
    const companyProfit = periodData.companyProfit || 0;

    
    if (enableSaving && savingPercentage > 0) {
      const savedAmount = totalPartnerProfit * (savingPercentage / 100);
      const partnerProfitAfterSaving = totalPartnerProfit - savedAmount;

      return {
        savedAmount,
        companyProfit: companyProfit,
        partnerProfit: partnerProfitAfterSaving,
        originalCompanyProfit: companyProfit,
        originalPartnerProfit: totalPartnerProfit
      };
    }

    if (periodData.totalAfterSaving !== undefined && periodData.totalSaving !== undefined) {
      return {
        savedAmount: periodData.totalSaving,
        companyProfit: periodData.companyProfit || 0,
        partnerProfit: periodData.totalAfterSaving,
        originalCompanyProfit: periodData.companyProfit || 0,
        originalPartnerProfit: totalPartnerProfit
      };
    }

    return {
      savedAmount: 0,
      companyProfit: companyProfit,
      partnerProfit: totalPartnerProfit,
      originalCompanyProfit: companyProfit,
      originalPartnerProfit: totalPartnerProfit
    };
  };

  const profitAfterSaving = calculateProfitAfterSaving();

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
          {!hasDistribution(periodData) && (
            <Box sx={{ mb: 2 }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={enableSaving}
                    onChange={(e) => {
                      setEnableSaving(e.target.checked);
                      if (e.target.checked && savingPercentage === 0) {
                        handleOpenSavingDialog();
                      }
                    }}
                    color="primary"
                  />
                }
                label="هل تريد الادخار من هذا التوزيع؟"
              />
              
              {enableSaving && (
                <Box sx={{ mt: 1, p: 2, bgcolor: 'primary.50', borderRadius: 1 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="body2">نسبة الادخار:</Typography>
                <Typography variant="body2" fontWeight="bold">
                  {savingPercentage.toFixed(2)}%
                </Typography>
              </Box>
              <Button
                size="small"
                startIcon={<SavingsIcon sx={{marginLeft:"10px"}} />}
                onClick={handleOpenSavingDialog}
                sx={{ mt: 1 }}
              >
                تعديل المبلغ
              </Button>
                </Box>
              )}
            </Box>
          )}

          <Box sx={{ display: "flex", justifyContent: "space-between" }}>
            <Typography>أرباح الشركة:</Typography>
            <Typography fontWeight="bold" color="primary.main">
              {formatNumber(periodData?.companyProfit) || 0}
            </Typography>
          </Box>
          <Box sx={{ display: "flex", justifyContent: "space-between" }}>
            <Typography>إجمالي أرباح الشركاء:</Typography>
            <Typography fontWeight="bold" color="success.main">
              {enableSaving && savingPercentage > 0 ?
                formatNumber(profitAfterSaving.partnerProfit) :
                formatNumber((periodData?.totalAfterSaving ||
                 periodData?.partners?.reduce((sum, p) => sum + (p.totalAfterSaving || p.totalProfit || 0), 0) || 0
                ))
              }
            </Typography>
          </Box>
          
          {(enableSaving && savingPercentage > 0) || (periodData?.totalSaving > 0) ? (
            <Box sx={{ display: "flex", justifyContent: "space-between", pt: 1, borderTop: '1px solid #e0e0e0' }}>
              <Typography variant="body2" color="warning.main">
                المبلغ المدخر {enableSaving && savingPercentage > 0 ? `(${savingPercentage.toFixed(2)}%)` : ''}:
              </Typography>
              <Typography variant="body2" fontWeight="bold" color="warning.main">
                {formatNumber((enableSaving && savingPercentage > 0 ? profitAfterSaving.savedAmount :
                  (periodData?.totalSaving ||
                   periodData?.partners?.reduce((sum, p) => sum + (p.savingAmount || 0), 0) || 0)
                 ))}
              </Typography>
            </Box>
          ) : null}
          
          <Box sx={{ display: "flex", justifyContent: "space-between" }}>
            <Typography>عدد الشركاء:</Typography>
            <Typography fontWeight="bold">
              {periodData?.partners?.length || 0}
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
          {!hasDistribution(periodData) &&
            permissions.includes("distribution_Post") && (
              <Button
                variant="contained"
                startIcon={<CheckIcon sx={{ marginLeft: "10px" }} />}
                onClick={() =>
                  handleOpenDistributionDialog(
                    selectedPeriod,
                    periodData?.name,
                    "post"
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

          {hasDistribution(periodData) &&
            permissions.includes("distribution_Post") && (
              <Button
                variant="outlined"
                startIcon={<CancelIcon sx={{ marginLeft: "10px" }} />}
                onClick={() =>
                  handleOpenDistributionDialog(
                    selectedPeriod,
                    periodData?.name,
                    "unpost"
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

  const renderMobileActions = () => (
    <Paper sx={{ p: 2, mb: 2, borderRadius: 2 }}>
      <Typography variant="h6" color="primary" fontWeight="bold" mb={2}>
        الإجراءات
      </Typography>
      
      {!hasDistribution(periodData) && (
        <Box sx={{ mb: 2 }}>
          <FormControlLabel
            control={
              <Checkbox
                checked={enableSaving}
                onChange={(e) => {
                  setEnableSaving(e.target.checked);
                  if (e.target.checked && savingPercentage === 0) {
                    handleOpenSavingDialog();
                  }
                }}
                color="primary"
              />
            }
            label="ادخار من التوزيع"
          />
          
          {enableSaving && (
            <Box sx={{ mt: 1, p: 2, bgcolor: 'primary.50', borderRadius: 1 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="body2">نسبة الادخار:</Typography>
                <Typography variant="body2" fontWeight="bold">
                  {savingPercentage.toFixed(2)}%
                </Typography>
              </Box>
              <Button
                size="small"
                startIcon={<SavingsIcon sx={{marginLeft:"10px"}} />}
                onClick={handleOpenSavingDialog}
                fullWidth
                sx={{ mt: 1 }}
              >
                تعديل المبلغ
              </Button>
            </Box>
          )}
        </Box>
      )}

      <Stack spacing={1}>
        {!hasDistribution(periodData) &&
          permissions.includes("distribution_Post") && (
            <Button
              variant="contained"
              startIcon={<CheckIcon />}
              onClick={() =>
                handleOpenDistributionDialog(
                  selectedPeriod,
                  periodData?.name,
                  "post"
                )
              }
              fullWidth
              size="small"
              sx={{ bgcolor: "success.main" }}
            >
              توزيع الأرباح
            </Button>
          )}

        {hasDistribution(periodData) &&
          permissions.includes("distribution_Post") && (
            <Button
              variant="outlined"
              startIcon={<CancelIcon />}
              onClick={() =>
                handleOpenDistributionDialog(
                  selectedPeriod,
                  periodData?.name,
                  "unpost"
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
              إجمالي أرباح الشركاء
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
              >
                <StyledTableCell align="center">{period.name}</StyledTableCell>
                <StyledTableCell align="center" sx={{ whiteSpace: "nowrap" }}>
                  {formatArabicDate(period.startDate)}
                </StyledTableCell>
                <StyledTableCell align="center" sx={{ whiteSpace: "nowrap" }}>
                  {formatArabicDate(period.endDate)}
                </StyledTableCell>
                <StyledTableCell align="center" sx={{ whiteSpace: "nowrap" }}>
                  <Typography fontWeight="bold" color="black">
                    {formatNumber(period.companyProfit) || 0}
                  </Typography>
                </StyledTableCell>
                <StyledTableCell align="center" sx={{ whiteSpace: "nowrap" }}>
                  <Typography fontWeight="bold" color="success.main">
                    {formatNumber(period.totalAfterSaving) || 0}
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

  const renderClosedPeriodsCards = () => (
    <Box sx={{ p: 1 }}>
      {isPeriodsLoading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
          <CircularProgress size={30} />
        </Box>
      ) : closedPeriods?.length === 0 ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
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
                  border: "1px solid #e0e0e0",
                  borderRadius: 2,
                  boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                  "&:hover": {
                    boxShadow: "0 4px 8px rgba(0,0,0,0.15)",
                  },
                  cursor: "pointer",
                }}
                onClick={() => handleViewDetails(period.periodId)}
              >
                <CardContent sx={{ p: 2 }}>
                  <Stack spacing={1}>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                      }}
                    >
                      <Typography
                        variant="h6"
                        fontWeight="bold"
                        color="primary.main"
                      >
                        {period.name}
                      </Typography>
                      <Chip
                        label={hasDistribution(period) ? "موزعة" : "غير موزعة"}
                        color={hasDistribution(period) ? "success" : "warning"}
                        size="small"
                      />
                    </Box>

                    <Box
                      sx={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        gap: 1,
                      }}
                    >
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

                    <Box>
                      <Typography variant="body2" color="textSecondary">
                        أرباح الشركة:
                      </Typography>
                      <Typography
                        variant="body1"
                        fontWeight="bold"
                        color="primary.main"
                      >
                        {formatNumber(period.companyProfit) || 0}
                      </Typography>
                    </Box>

                    <Box>
                      <Box>
                      <Typography variant="body2" color="textSecondary">
                        عدد الشركاء:
                      </Typography>
                      <Typography variant="body2" fontWeight="medium">
                        {period.partners?.length || 0}
                      </Typography>
                    </Box>
                    </Box>

                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "center",
                        gap: 1,
                        pt: 1,
                      }}
                    >
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
                          title={
                            hasDistribution(period)
                              ? "إلغاء التوزيع"
                              : "توزيع الأرباح"
                          }
                          size="small"
                          color={hasDistribution(period) ? "error" : "success"}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenDistributionDialog(
                              period.periodId,
                              period.name,
                              hasDistribution(period) ? "unpost" : "post"
                            );
                          }}
                        >
                          {hasDistribution(period) ? (
                            <CancelIcon style={{ fontSize: "20px" }} />
                          ) : (
                            <CheckIcon style={{ fontSize: "20px" }} />
                          )}
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

  const renderMobilePeriodDetails = () => (
    <Box>
      <Grid container spacing={2} mb={3}>
        <Grid item xs={6}>
          <Card
            sx={{
              bgcolor: "rgba(25, 118, 210, 0.1)",
              textAlign: "center",
              justifyContent: "center",
            }}
          >
            <CardContent sx={{ p: 2 }}>
              <Typography variant="body2" color="primary.main">
                أرباح الشركة
              </Typography>
              <Typography variant="h6" fontWeight="bold" color="primary.main">
                {formatNumber(periodData?.companyProfit) || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6}>
          <Card
            sx={{
              bgcolor: "rgba(46, 125, 50, 0.1)",
              textAlign: "center",
              justifyContent: "center",
            }}
          >
            <CardContent sx={{ p: 2 }}>
              <Typography variant="body2" color="success.main">
                أرباح الشركاء
              </Typography>
              <Typography variant="h6" fontWeight="bold" color="success.main">
                {enableSaving && savingPercentage > 0 ?
                  formatNumber(profitAfterSaving.partnerProfit) :
                  formatNumber((periodData?.totalAfterSaving ||
                   periodData?.partners?.reduce((sum, p) => sum + (p.totalAfterSaving || p.totalProfit || 0), 0) || 0
                  ))
                }
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {renderMobileActions()}

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
              {formatArabicDate(periodData?.startDate)}
            </Typography>
          </Box>

          <Box>
            <Typography variant="body2" color="textSecondary" gutterBottom>
              تاريخ النهاية
            </Typography>
            <Typography variant="body1" fontWeight="bold">
              {formatArabicDate(periodData?.endDate)}
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

          {(enableSaving && savingPercentage > 0) || periodData?.totalSaving > 0 ? (
            <Box sx={{ pt: 2, borderTop: '1px solid #e0e0e0' }}>
              <Typography variant="body2" color="warning.main" gutterBottom>
                معلومات الادخار:
              </Typography>
              {enableSaving && savingPercentage > 0 && (
                <Typography variant="body2">
                  نسبة الادخار: {savingPercentage.toFixed(2)}%
                </Typography>
              )}
              <Typography variant="body2">
                المبلغ المدخر: {formatNumber((enableSaving && savingPercentage > 0 ? profitAfterSaving.savedAmount :
                  (periodData?.totalSaving ||
                   periodData?.partners?.reduce((sum, p) => sum + (p.savingAmount || 0), 0) || 0)
                 ))}
              </Typography>
            </Box>
          ) : null}
        </Stack>
      </Paper>

      {periodData?.partners && periodData.partners.length > 0 && (
        <Paper sx={{ p: 2, borderRadius: 2, mb: 2 }}>
          <Typography variant="h6" fontWeight="bold" mb={2} textAlign="center">
            أرباح الشركاء
          </Typography>

          <Stack spacing={2}>
            {periodData.partners.map((partner) => (
              <Card key={partner.partnerId} variant="outlined">
                <CardContent sx={{ p: 2 }}>
                  <Stack spacing={1}>
                    <Typography variant="subtitle2" fontWeight="bold">
                      {partner.partnerName}
                    </Typography>

                    <Box
                      sx={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        gap: 1,
                      }}
                    >
                      <Box>
                        <Typography variant="body2" color="textSecondary">
                          الرقم القومي:
                        </Typography>
                        <Typography variant="body2" fontWeight="medium">
                          {partner.nationalId || "-"}
                        </Typography>
                      </Box>

                      <Box>
                        <Typography variant="body2" color="textSecondary">
                          الهاتف:
                        </Typography>
                        <Typography variant="body2" fontWeight="medium">
                          {partner.phone || "-"}
                        </Typography>
                      </Box>
                    </Box>

                    <Box
                      sx={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        gap: 1,
                      }}
                    >
                      <Box>
                        <Typography variant="body2" color="textSecondary">
                          الأرباح قبل الخصم:
                        </Typography>
                        <Typography variant="body2" fontWeight="medium">
                          {formatNumber(partner.rawProfit) || formatNumber(partner.totalProfit) || 0}
                        </Typography>
                      </Box>

                      <Box>
                        <Typography variant="body2" color="textSecondary">
                          نسبة ربح الشركة:
                        </Typography>
                        <Typography variant="body2" fontWeight="medium">
                          {partner.orgProfitPercent}%
                        </Typography>
                      </Box>
                    </Box>

                    <Box
                      sx={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        gap: 1,
                      }}
                    >
                      <Box>
                        <Typography variant="body2" color="textSecondary">
                          مبلغ ربح الشركة:
                        </Typography>
                        <Typography variant="body2" fontWeight="medium" color="error.main">
                          {formatNumber(partner.companyCut) || 0}
                        </Typography>
                      </Box>

                    </Box>

                    <Box
                      sx={{
                        display: "grid",
                        gridTemplateColumns: "1fr",
                        gap: 1,
                      }}
                    >
                      <Box>
                        <Typography variant="body2" color="textSecondary">
                          صافي الأرباح:
                        </Typography>
                        <Typography variant="body2" fontWeight="bold" color="success.main">
                          {formatNumber((enableSaving && savingPercentage > 0 ?
                            (partner.finalProfit || partner.totalProfit || 0) * (1 - savingPercentage / 100) :
                            partner.totalAfterSaving || partner.totalProfit || 0
                          ))}
                        </Typography>
                      </Box>
                    </Box>

                    {/* Show saving amount when saving is enabled or exists in data */}
                    {((enableSaving && savingPercentage > 0) || partner.savingAmount > 0) && (
                      <Box sx={{ pt: 1, borderTop: '1px solid #e0e0e0' }}>
                        <Typography variant="body2" color="warning.main">
                          المبلغ المدخر: {formatNumber((enableSaving && savingPercentage > 0 ?
                            (partner.finalProfit || partner.totalProfit || 0) * (savingPercentage / 100) :
                            partner.savingAmount || 0
                          ))}
                        </Typography>
                      </Box>
                    )}
                  </Stack>
                </CardContent>
              </Card>
            ))}
          </Stack>
        </Paper>
      )}

      {periodData?.distributionJournal && (
        <Paper sx={{ p: 2, borderRadius: 2 }}>
          <Typography variant="h6" fontWeight="bold" mb={2} textAlign="center">
            قيد توزيع الأرباح
          </Typography>

          <Card variant="outlined" sx={{ mb: 2 }}>
            <CardContent sx={{ p: 2 }}>
              <Stack spacing={1}>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                  }}
                >
                  <Typography
                    variant="subtitle2"
                    fontWeight="bold"
                    color="primary"
                  >
                    {periodData.distributionJournal.reference}
                  </Typography>
                  <Chip
                    label={getJournalStatusText(periodData.distributionJournal.status)}
                    color={
                      periodData.distributionJournal.status === "POSTED" ? "success" : "default"
                    }
                    size="small"
                  />
                </Box>

                <Typography variant="body2">
                  {periodData.distributionJournal.description}
                </Typography>

                  <Box
                    sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}
                  >
                    <Typography variant="body2" color="textSecondary">
                      {formatArabicDate(periodData.distributionJournal.date)}
                    </Typography>
                    <IconButton
                      size="small"
                      onClick={() => handleViewJournal(periodData.distributionJournal.id)}
                      title="عرض تفاصيل القيد"
                    >
                      <VisibilityIcon color="primary" />
                    </IconButton>
                  </Box>
              </Stack>
            </CardContent>
          </Card>
        </Paper>
      )}
    </Box>
  );

  const renderDesktopPeriodDetails = () => (
    <Paper sx={{ p: 4, borderRadius: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography
          variant="h6"
          color="primary"
          fontWeight="bold"
          textAlign={"center"}
        >
          تفاصيل توزيع الأرباح
        </Typography>
        {permissions.includes("distribution_Export") && (
        <Stack direction="row" spacing={1} sx={{gap: "10px"}}>
          <Button
             variant="contained"
             startIcon={<PDFIcon sx={{ marginLeft: "10px" }} />}
             onClick={handleExportPDF}
             disabled={isExporting}
             sx={{
               bgcolor: "#d32f2f",
               "&:hover": { bgcolor: "#b71c1c" },
             }}
          >
            تصدير PDF
            {isExporting && (
              <CircularProgress
                size={14}
                color="inherit"
                style={{ marginLeft: 8 }}
              />
            )}
          </Button>
          <Button
              variant="outlined"
              size="small"
              startIcon={<ExcelIcon sx={{ marginLeft: "10px" }} />}
              onClick={handleExportExcel}
              disabled={isExporting}
              sx={{
                borderColor: "success.main",
                color: "success.main",
                "&:hover": { bgcolor: "success.50" },
            }}  
          >
            تصدير Excel
            {isExporting && (
              <CircularProgress
                size={14}
                color="inherit"
                style={{ marginLeft: 8 }}
              />
            )}
          </Button>
        </Stack>
        )}
      </Box>

      <Grid
        container
        spacing={10}
        mb={4}
        justifyContent="center"
        alignItems="center"
      >
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
          <Typography variant="body1">
            {formatDate(periodData?.startDate)}
          </Typography>
        </Grid>
        <Grid item xs={12} md={6}>
          <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
            تاريخ النهاية:
          </Typography>
          <Typography variant="body1">
            {formatDate(periodData?.endDate)}
          </Typography>
        </Grid>
      </Grid>

      <Divider sx={{ my: 3 }} />

      <Grid
        container
        spacing={3}
        mb={4}
        justifyContent="center"
        alignItems="center"
      >
        <Grid item xs={12} md={6}>
          <Card sx={{ bgcolor: "primary.50", p: 3, textAlign: "center",width: "350px" }}>
            <BalanceIcon color="primary" sx={{ fontSize: 40, mb: 1 }} />
            <Typography variant="h5" fontWeight="bold" color="primary.main">
              {formatNumber(periodData?.companyProfit) || 0}
            </Typography>
            <Typography variant="body1" color="primary.main">
              أرباح الشركة
            </Typography>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card sx={{ bgcolor: "success.50", p: 3, textAlign: "center",width: "350px" }}>
            <BalanceIcon color="success" sx={{ fontSize: 40, mb: 1 }} />
            <Typography variant="h5" fontWeight="bold" color="success.main">
              {enableSaving && savingPercentage > 0 ?
                formatNumber(profitAfterSaving.partnerProfit) :
                formatNumber((periodData?.totalAfterSaving ||
                 periodData?.partners?.reduce((sum, p) => sum + (p.totalAfterSaving || p.totalProfit || 0), 0) || 0
                ))
              }
            </Typography>
            <Typography variant="body1" color="success.main">
              إجمالي أرباح الشركاء
            </Typography>
            {enableSaving && (
              <Typography variant="body2" color="warning.main" sx={{ mt: 1 }}>
                (بعد ادخار {savingPercentage.toFixed(2)}%)
              </Typography>
            )}
          </Card>
        </Grid>
      </Grid>

      {(enableSaving && savingPercentage > 0) || periodData?.totalSaving > 0 ? (
        <Alert severity="info" sx={{ mb: 3 }}>
          <Typography variant="body1" fontWeight="bold">
            معلومات الادخار:
          </Typography>
          {enableSaving && savingPercentage > 0 && (
            <Typography variant="body2">
              - نسبة الادخار: {savingPercentage.toFixed(2)}%
            </Typography>
          )}
          <Typography variant="body2">
            - المبلغ المدخر: {formatNumber((enableSaving && savingPercentage > 0 ? profitAfterSaving.savedAmount :
              (periodData?.totalSaving ||
               periodData?.partners?.reduce((sum, p) => sum + (p.savingAmount || 0), 0) || 0)
             ))}
          </Typography>
          {enableSaving && savingPercentage > 0 && (
            <>
              <Typography variant="body2">
                - إجمالي الأرباح قبل الادخار: {formatNumber(profitAfterSaving.originalCompanyProfit + profitAfterSaving.originalPartnerProfit)}
              </Typography>
              <Typography variant="body2">
                - إجمالي أرباح الشركاء بعد الادخار: {formatNumber(profitAfterSaving.partnerProfit)}
              </Typography>
              <Typography variant="body2">
                - إجمالي الأرباح بعد الادخار: {formatNumber(profitAfterSaving.companyProfit + profitAfterSaving.partnerProfit)}
              </Typography>
              <Typography variant="body2" sx={{ fontStyle: 'italic', color: 'text.secondary', mt: 1 }}>
                ملاحظة: الادخار يتم من أرباح الشركاء فقط، وأرباح الشركة تظل ثابتة
              </Typography>
            </>
          )}
          {!enableSaving && periodData?.totalAfterSaving !== undefined && (
            <Typography variant="body2">
              - إجمالي أرباح الشركاء بعد الادخار: {formatNumber(periodData.totalAfterSaving)}
            </Typography>
          )}
        </Alert>
      ) : null}

      {periodData?.partners && periodData.partners.length > 0 && (
        <>
          <Typography
            variant="h6"
            color="primary"
            fontWeight="bold"
            mb={3}
            textAlign="center"
          >
            توزيع الأرباح على الشركاء
          </Typography>
          <TableContainer component={Paper} variant="outlined" sx={{ mb: 4 }}>
            <ScrollableTableContainer maxHeight="100%" minWidth={1200}>
              <TableHead>
                <StyledTableRow>
                  <StyledTableCell align="center">اسم الشريك</StyledTableCell>
                  <StyledTableCell align="center">الرقم القومي</StyledTableCell>
                  <StyledTableCell align="center">الهاتف</StyledTableCell>
                  <StyledTableCell align="center">
                    الأرباح قبل الخصم
                  </StyledTableCell>
                  <StyledTableCell align="center">
                    نسبة ربح الشركة
                  </StyledTableCell>
                  <StyledTableCell align="center">
                    مبلغ ربح الشركة
                  </StyledTableCell>
                  {(periodData.partners.some(p => p.savingAmount) || enableSaving) && (
                    <StyledTableCell align="center">المبلغ المدخر</StyledTableCell>
                  )}
                  <StyledTableCell align="center">
                    صافي الأرباح {(periodData.partners.some(p => p.savingAmount) || enableSaving) ? 'بعد الادخار' : ''}
                  </StyledTableCell>
                </StyledTableRow>
              </TableHead>
              <TableBody>
                {periodData.partners.map((partner) => (
                  <StyledTableRow key={partner.partnerId}>
                    <StyledTableCell align="center">
                      {partner.partnerName}
                    </StyledTableCell>
                    <StyledTableCell align="center">
                      {partner.nationalId || "-"}
                    </StyledTableCell>
                    <StyledTableCell align="center">
                      {partner.phone || "-"}
                    </StyledTableCell>
                    <StyledTableCell align="center">
                      {formatNumber(partner.rawProfit) || formatNumber(partner.totalProfit) || 0}
                    </StyledTableCell>
                    <StyledTableCell align="center">
                      {partner.orgProfitPercent}%
                    </StyledTableCell>
                    <StyledTableCell align="center">
                      {formatNumber(partner.companyCut) || 0}
                    </StyledTableCell>
                    {(periodData.partners.some(p => p.savingAmount) || enableSaving) && (
                      <StyledTableCell align="center">
                          {formatNumber((enableSaving && savingPercentage > 0 ?
                            (partner.finalProfit || partner.totalProfit || 0) * (savingPercentage / 100) :
                            partner.savingAmount || 0
                          ))}
                      </StyledTableCell>
                    )}
                    <StyledTableCell align="center">
                        {formatNumber((enableSaving && savingPercentage > 0 ?
                          (partner.finalProfit || partner.totalProfit || 0) * (1 - savingPercentage / 100) :
                          partner.totalAfterSaving || partner.totalProfit || 0
                        ))}
                    </StyledTableCell>
                  </StyledTableRow>
                ))}
                <StyledTableRow sx={{ backgroundColor: "#f5f5f5" }}>
                  <StyledTableCell colSpan={3} align="center">
                    <Typography fontWeight="bold">الإجمالي</Typography>
                  </StyledTableCell>
                  <StyledTableCell align="center">
                    <Typography fontWeight="bold" color="primary.main">
                      {formatNumber(periodData?.partners?.reduce((sum, p) => sum + (p.rawProfit || p.totalProfit || 0), 0) || 0)}
                    </Typography>
                  </StyledTableCell>
                  <StyledTableCell align="center">
                    <Typography fontWeight="bold">-</Typography>
                  </StyledTableCell>
                  <StyledTableCell align="center">
                    <Typography fontWeight="bold" color="error.main">
                      {formatNumber(periodData?.partners?.reduce((sum, p) => sum + (p.companyCut || 0), 0) || 0)}
                    </Typography>
                  </StyledTableCell>
                  {(periodData.partners.some(p => p.savingAmount) || enableSaving) && (
                    <StyledTableCell align="center">
                      <Typography fontWeight="bold" color="warning.main">
                        {formatNumber((enableSaving && savingPercentage > 0 ?
                          profitAfterSaving.savedAmount :
                          periodData?.partners?.reduce((sum, p) => sum + (p.savingAmount || 0), 0) || 0
                        ))}
                      </Typography>
                    </StyledTableCell>
                  )}
                  <StyledTableCell align="center">
                    <Typography fontWeight="bold" color="success.main">
                      {enableSaving && savingPercentage > 0 ?
                        formatNumber(profitAfterSaving.partnerProfit) :
                        formatNumber(periodData?.partners?.reduce((sum, p) => sum + (p.totalAfterSaving || 0), 0) || 0)
                      }
                    </Typography>
                  </StyledTableCell>
                </StyledTableRow>
              </TableBody>
            </ScrollableTableContainer>
          </TableContainer>
        </>
      )}

      {periodData?.distributionJournal && (
        <>
          <Divider sx={{ my: 3 }} />
          <Typography
            variant="h6"
            color="primary"
            fontWeight="bold"
            mb={3}
            textAlign="center"
          >
            قيد توزيع الأرباح
          </Typography>
          <TableContainer component={Paper} variant="outlined">
            <Table>
            <TableHead>
              <StyledTableRow>
                <StyledTableCell align="center">
                  الرقم المرجعي
                </StyledTableCell>
                <StyledTableCell align="center">الوصف</StyledTableCell>
                <StyledTableCell align="center">الحالة</StyledTableCell>
                <StyledTableCell align="center">التاريخ</StyledTableCell>
                <StyledTableCell align="center">الإجراءات</StyledTableCell>
              </StyledTableRow>
            </TableHead>
              <TableBody>
                <StyledTableRow>
                  <StyledTableCell align="center">
                    {periodData.distributionJournal.reference}
                  </StyledTableCell>
                  <StyledTableCell align="center">
                    {periodData.distributionJournal.description}
                  </StyledTableCell>
                  <StyledTableCell align="center">
                    <Chip
                      label={getJournalStatusText(periodData.distributionJournal.status)}
                      color={
                        periodData.distributionJournal.status === "POSTED" ? "success" : "default"
                      }
                      size="small"
                    />
                  </StyledTableCell>
                  <StyledTableCell align="center">
                    {formatDate(periodData.distributionJournal.date)}
                  </StyledTableCell>
                  <StyledTableCell align="center">
                    <IconButton
                      size="small"
                      onClick={() => handleViewJournal(periodData.distributionJournal.id)}
                      title="عرض تفاصيل القيد"
                    >
                      <VisibilityIcon color="primary" style={{ fontSize: '20px' }} />
                    </IconButton>
                  </StyledTableCell>
                </StyledTableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </>
      )}
    </Paper>
  );

  const renderConfirmationDialog = () =>
    distributionDialog.action === "post" && (
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
          
          {enableSaving && savingPercentage > 0 && (
            <Alert severity="info" sx={{ mt: 2 }}>
              <Typography variant="body2">
                <strong>ملاحظة:</strong> سيتم ادخار {savingPercentage.toFixed(2)}% من الأرباح قبل التوزيع
              </Typography>
              <Typography variant="body2" sx={{ mt: 1 }}>
                المبلغ المدخر: {formatNumber(profitAfterSaving.savedAmount)} ({savingPercentage.toFixed(2)}%)
              </Typography>
            </Alert>
          )}
          
          <Alert severity="warning" sx={{ mt: 2 }}>
            سيتم إنشاء قيد محاسبي لتوزيع الأرباح على الشركاء
          </Alert>
        </DialogContent>
        <DialogActions sx={{ p: 2.5, gap: 1, flexDirection: 'row-reverse' }}>
          <Button
            onClick={handleCloseDistributionDialog}
            disabled={isDistributing}
          >
            إلغاء
          </Button>
          <Button
            onClick={handleConfirmDistribution}
            variant="contained"
            color="success"
            startIcon={<CheckIcon sx={{ marginLeft: "10px" }} />}
            disabled={isDistributing}
          >
            تأكيد التوزيع
            {isDistributing && (
              <CircularProgress
                size={16}
                color="inherit"
                style={{ marginLeft: 8 }}
              />
            )}
          </Button>
        </DialogActions>
      </Dialog>
    );

  const renderUnpostModal = () =>
    distributionDialog.action === "unpost" && (
      <DeleteModal
        open={distributionDialog.open}
        onClose={handleCloseDistributionDialog}
        onConfirm={handleConfirmUnpost}
        title="إلغاء توزيع الأرباح"
        message={`هل أنت متأكد من إلغاء توزيع أرباح الفترة "${distributionDialog.periodName}"؟`}
        isLoading={isDistributing}
        ButtonText="إلغاء التوزيع"
      />
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
        {!isSmallScreen &&
          activeTab === 1 &&
          periodData &&
          renderDesktopSidebar()}

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
            {(cameFromSaving || cameFromPeriodClosing) && activeTab === 1 && (
              <Box sx={{ mb: 2, display: "flex", alignItems: "center" }}>
                <IconButton 
                  onClick={cameFromPeriodClosing ? handleBackToPeriodClosing : handleBackToSaving} 
                  size="small"
                  sx={{ mr: 1 }}
                  title={cameFromPeriodClosing ? "العودة إلى صفحة التقفيل" : "العودة إلى صفحة المدخرات"}
                >
                  <ArrowBackIcon />
                </IconButton>
                <Typography variant="body2" color="text.secondary">
                  {cameFromPeriodClosing ? "العودة إلى صفحة التقفيل" : "العودة إلى صفحة المدخرات"}
                </Typography>
              </Box>
            )}

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
                      color: activeTab === 0 ? "#0d40a5" : "black",
                    }}
                  />
                  <Tab
                    label={selectedPeriod ? "تفاصيل التوزيع" : "توزيع محدد"}
                    sx={{
                      fontWeight: "bold",
                      borderBottom:
                        activeTab === 1 ? "3px solid #0d40a5" : "none",
                      color: activeTab === 1 ? "#0d40a5" : "black",
                    }}
                  />
                </Tabs>
              </Box>
            ) : (
              <Box sx={{ mb: 3 }}>
                {activeTab === 1 ? (
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      mb: 2,
                      justifyContent: "center",
                    }}
                  >
                    {cameFromPeriodClosing ? (
                      <IconButton onClick={handleBackToPeriodClosing} size="small">
                        <ArrowBackIcon />
                      </IconButton>
                    ) : cameFromSaving ? (
                      <IconButton onClick={handleBackToSaving} size="small">
                        <ArrowBackIcon />
                      </IconButton>
                    ) : (
                      <IconButton onClick={handleBackToList} size="small">
                        <ArrowBackIcon />
                      </IconButton>
                    )}
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                      <Typography variant="h6" fontWeight="bold">
                        تفاصيل التوزيع
                      </Typography>
                      {permissions.includes("distribution_Export") && (
                      <Stack direction="row" spacing={0.5}>
                        <IconButton
                          size="small"
                          onClick={handleExportPDF}
                          disabled={isExporting}
                          sx={{ color: 'primary.main' }}
                          title="تصدير PDF"
                        >
                          <CheckIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={handleExportExcel}
                          disabled={isExporting}
                          sx={{ color: 'success.main' }}
                          title="تصدير Excel"
                        >
                          <CheckIcon fontSize="small" />
                        </IconButton>
                      </Stack>
                      )}
                    </Box>
                  </Box>
                ) : (
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
                        bgcolor: "background.paper",
                      }}
                    />
                  </Box>
                )}
              </Box>
            )}

            {activeTab === 0 || (isSmallScreen && !selectedPeriod) ? (
              <Paper
                sx={{
                  flex: 1,
                  width: "100%",
                  overflow: "hidden",
                  borderRadius: 2,
                }}
              >
                {isSmallScreen
                  ? renderClosedPeriodsCards()
                  : renderClosedPeriodsTable()}
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
                  isSmallScreen ? (
                    renderMobilePeriodDetails()
                  ) : (
                    renderDesktopPeriodDetails()
                  )
                ) : (
                  <Alert severity="error">حدث خطأ في تحميل بيانات الفترة</Alert>
                )}
              </Box>
            )}
          </Box>
        </Box>
      </Box>

      <SavingPercentage
        open={savingDialog.open}
        onClose={handleCloseSavingDialog}
        onApply={handleApplySavingPercentage}
        currentPercentage={savingPercentage}
        totalProfit={periodData?.partners?.reduce((sum, p) => sum + (p.finalProfit || p.totalProfit || 0), 0) || 0}
      />

      {renderConfirmationDialog()}
      {renderUnpostModal()}
    </Box>
  );
};

export default ProfitDistribution;