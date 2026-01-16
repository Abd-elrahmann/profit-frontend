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
  Chip as MuiChip,
  InputBase,
  useTheme,
} from "@mui/material";
import {
  Check as CheckIcon,
  Cancel as CancelIcon,
  Visibility as VisibilityIcon,
  ArrowBack as ArrowBackIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getPeriodById,
  closePeriod,
  unpostClosing,
} from "./periodApi";
import { notifySuccess, notifyError } from "../../utilities/toastify";
import PeriodTable from "../../components/modals/periodTable";
import {
  StyledTableCell,
  StyledTableRow,
} from "../../components/layouts/tableLayout";
import { Helmet } from "react-helmet-async";
import { usePermissions } from "../../components/Contexts/PermissionsContext";

const PeriodClosing = () => {
  const theme = useTheme();
  const [activeTab, setActiveTab] = useState(0);
  const [selectedPeriod, setSelectedPeriod] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showDraftAlert, setShowDraftAlert] = useState(false);
  const [draftCount, setDraftCount] = useState(0);

  const navigate = useNavigate();
  const isMobile = useMediaQuery("(max-width: 480px)");
  const isTablet = useMediaQuery("(max-width: 768px)");
  const isLargeScreen = useMediaQuery("(min-width: 1200px)");
  const isSmallScreen = isMobile || isTablet;

  const handleViewJournal = (journalId) => {
    navigate('/journal-entries', { state: { journalId: journalId, activeTab: 1, fromPeriod: true } });
  };

  const queryClient = useQueryClient();
  const { permissions } = usePermissions();

  const { data: periodData, isLoading: isPeriodLoading } = useQuery({
    queryKey: ["period", selectedPeriod],
    queryFn: () => getPeriodById(selectedPeriod),
    enabled: !!selectedPeriod && activeTab === 1,
  });

  useEffect(() => {
    if (periodData?.journals) {
      const draftEntries = periodData.journals.filter(journal => journal.status === "DRAFT");
      const draftEntriesCount = draftEntries.length;

      setDraftCount(draftEntriesCount);
      setShowDraftAlert(draftEntriesCount > 0);
    }
  }, [periodData]);

  const handleViewDetails = (periodId) => {
    setSelectedPeriod(periodId);
    setActiveTab(1);
  };

  const handleBackToList = () => {
    setActiveTab(0);
    setSelectedPeriod(null);
    setShowDraftAlert(false);
  };

  const handleClosePeriod = async () => {
    try {
      await closePeriod(selectedPeriod);
      notifySuccess("تم تقفيل الفترة بنجاح");
      queryClient.invalidateQueries(["period", selectedPeriod]);
      queryClient.invalidateQueries(["periods"]);
      await queryClient.refetchQueries(["period", selectedPeriod]);
    } catch (error) {
      notifyError(error.response?.data?.message || "حدث خطأ أثناء تقفيل الفترة");
    }
  };

  const handleUnpostClosing = async () => {
    try {
      await unpostClosing(selectedPeriod);
      notifySuccess("تم إلغاء تقفيل الفترة بنجاح");
      queryClient.invalidateQueries(["period", selectedPeriod]);
      queryClient.invalidateQueries(["periods"]);
      await queryClient.refetchQueries(["period", selectedPeriod]);
    } catch (error) {
      notifyError(error.response?.data?.message || "حدث خطأ أثناء إلغاء التقفيل");
    }
  };

  const handleNavigateToJournalEntries = () => {
    navigate("/journal-entries");
  };

  const handleNavigateToProfitDistribution = () => {
    navigate(`/profit-distribution?periodId=${selectedPeriod}&from=period-closing`);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "لم تنتهي بعد";
    return new Date(dateString).toLocaleDateString('en-US');
  };

  const formatDateWithHijri = (dateString, hijriDate) => {
    if (!dateString) return "لم تنتهي بعد";

    const gregorianDate = new Date(dateString).toLocaleDateString('en-US');
    const hijriText = hijriDate || "لم تنتهي بعد";

    return (
      <Box>
        <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
          {gregorianDate}
        </Typography>
        <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.8rem',fontWeight: 'bold' }}>
          {hijriText}
        </Typography>
      </Box>
    );
  };

  const getJournalTypeText = (type) => {
    switch (type) {
      case "GENERAL":
        return "عام";
      case "OPENING":
        return "افتتاحي";
      case "CLOSING":
        return "ختامي";
      case "ADJUSTMENT":
        return "تسوية";
      default:
        return type;
    }
  };

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

  const renderDesktopSidebar = () => (
    <Box
      sx={{
        width: "350px",
        borderRight: "1px solid #ddd",
        bgcolor: theme.palette.background.default,
        height: "100%",
        overflowY: "auto",
        flexShrink: 0,
      }}
    >
      <Box sx={{ p: 3, borderBottom: "1px solid #ddd", bgcolor: theme.palette.background.default }}>
        <Typography variant="h6" color="primary" fontWeight="bold" mb={3}>
          ملخص الفترة
        </Typography>
        <Stack spacing={2}>
          <Box sx={{ display: "flex", justifyContent: "space-between" }}>
            <Typography>عدد القيود:</Typography>
            <Typography fontWeight="bold">
              {periodData?.journals?.length || 0}
            </Typography>
          </Box>

          <Box sx={{ display: "flex", justifyContent: "space-between" }}>
            <Typography>إجمالي المدين:</Typography>
            <Typography fontWeight="bold" color="success.main">
              {Math.round(periodData?.journals
                ?.reduce((sum, journal) => sum + (journal.totalDebit || 0), 0) || 0)
                .toLocaleString()}
            </Typography>
          </Box>
          <Box sx={{ display: "flex", justifyContent: "space-between" }}>
            <Typography>إجمالي الدائن:</Typography>
            <Typography fontWeight="bold" color="error.main">
              {Math.round(periodData?.journals
                ?.reduce((sum, journal) => sum + (journal.totalCredit || 0), 0) || 0)
                .toLocaleString()}
            </Typography>
          </Box>
          <Box sx={{ display: "flex", justifyContent: "space-between" }}>
            <Typography>إجمالي الرصيد:</Typography>
            <Typography
              fontWeight="bold"
              color={
                periodData?.journals?.reduce(
                  (sum, journal) => sum + (journal.totalDebit || 0) - (journal.totalCredit || 0),
                  0
                ) >= 0
                  ? "success.main"
                  : "error.main"
              }
            >
              {Math.round(periodData?.journals
                ?.reduce(
                  (sum, journal) => sum + (journal.totalDebit || 0) - (journal.totalCredit || 0),
                  0
                ) || 0)
                .toLocaleString()}
            </Typography>
          </Box>

          <Divider sx={{ my: 1 }} />

          <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
            <Typography fontWeight="bold">الأرباح الإجمالية (قبل الخصم):</Typography>
          </Box>
          <Box sx={{ display: "flex", justifyContent: "space-between", ml: 2 }}>
            <Typography>أرباح الشركاء:</Typography>
            <Typography fontWeight="bold" color="success.main">
              {(periodData?.grossProfit?.partnerTotal || 0).toLocaleString()}
            </Typography>
          </Box>
          <Box sx={{ display: "flex", justifyContent: "space-between", ml: 2 }}>
            <Typography>أرباح الشركة:</Typography>
            <Typography fontWeight="bold" color="primary.main">
              {(periodData?.grossProfit?.companyTotal || 0).toLocaleString()}
            </Typography>
          </Box>
          <Box sx={{ display: "flex", justifyContent: "space-between", ml: 2, mb: 1 }}>
            <Typography>الإجمالي:</Typography>
            <Typography fontWeight="bold">
              {(periodData?.grossProfit?.total || 0).toLocaleString()}
            </Typography>
          </Box>

          <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
            <Typography fontWeight="bold">المصروفات المخصومة:</Typography>
            <Typography fontWeight="bold" color="error.main">
              -{(periodData?.expenseDistribution?.totalExpenses || 0).toLocaleString()}
            </Typography>
          </Box>

          <Divider sx={{ my: 1 }} />

          <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
            <Typography fontWeight="bold">صافي الأرباح (بعد الخصم):</Typography>
          </Box>
          <Box sx={{ display: "flex", justifyContent: "space-between", ml: 2 }}>
            <Typography>أرباح الشركاء:</Typography>
            <Typography fontWeight="bold" color="success.main">
              {(periodData?.totalPartnerProfit || 0).toLocaleString()}
            </Typography>
          </Box>
          <Box sx={{ display: "flex", justifyContent: "space-between", ml: 2 }}>
            <Typography>أرباح الشركة:</Typography>
            <Typography fontWeight="bold" color="primary.main">
              {((periodData?.companyProfit || 0) + (periodData?.centCollected || 0)).toLocaleString()}
            </Typography>
          </Box>
          <Box sx={{ display: "flex", justifyContent: "space-between", ml: 2 }}>
            <Typography>الإجمالي:</Typography>
            <Typography fontWeight="bold">
              {(periodData?.totalProfit || 0).toLocaleString()}
            </Typography>
          </Box>
        </Stack>
      </Box>

      <Box sx={{ p: 3 }}>
        <Typography variant="h6" color="primary" fontWeight="bold" mb={3}>
          الإجراءات
        </Typography>
        <Stack spacing={2}>
          {!periodData?.isClosed && permissions.includes("period_Post") && (
            <Button
              variant="contained"
              startIcon={<CheckIcon sx={{ marginLeft: "10px" }} />}
              onClick={handleClosePeriod}
              sx={{
                bgcolor: "success.main",
                "&:hover": { bgcolor: "success.dark" },
              }}
            >
              تقفيل الفترة
            </Button>
          )}

          {periodData?.isClosed && permissions.includes("period_Post") && (
            <Button
              variant="outlined"
              startIcon={<CancelIcon sx={{ marginLeft: "10px" }} />}
              onClick={handleUnpostClosing}
              sx={{
                borderColor: "error.main",
                color: "error.main",
                "&:hover": { bgcolor: "rgba(211, 47, 47, 0.1)" },
              }}
            >
              إلغاء التقفيل
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
      <Stack spacing={1}>
        {!periodData?.isClosed && permissions.includes("period_Post") && (
          <Button
            variant="contained"
            startIcon={<CheckIcon />}
            onClick={handleClosePeriod}
            fullWidth
            size="small"
            sx={{ bgcolor: "success.main" }}
          >
            تقفيل الفترة
          </Button>
        )}

        {periodData?.isClosed && permissions.includes("period_Post") && (
          <Button
            variant="outlined"
            startIcon={<CancelIcon />}
            onClick={handleUnpostClosing}
            fullWidth
            size="small"
            color="error"
          >
            إلغاء التقفيل
          </Button>
        )}
      </Stack>
    </Paper>
  );

  const renderMobilePeriodDetails = () => (
    <Box>
      {showDraftAlert && !periodData?.isClosed && (
        <Alert
          severity="warning"
          sx={{ mb: 3 }}
          action={
            <Button
              color="inherit"
              size="small"
              onClick={handleNavigateToJournalEntries}
              sx={{ fontWeight: "bold" }}
            >
              انتقل للقيود
            </Button>
          }
        >
          لا يمكنك إغلاق هذه الفترة لأن هناك {draftCount} قيد غير معتمد. برجاء اعتمادها أولاً.
        </Alert>
      )}

      <Grid container spacing={2} mb={3}>
        <Grid item xs={6} md={4}>
          <Card sx={{ bgcolor: "rgba(25, 118, 210, 0.1)", textAlign: "center" }}>
            <CardContent sx={{ p: 2 }}>
              <Typography variant="body2" color="primary.main">
                القيود
              </Typography>
              <Typography variant="h6" fontWeight="bold" color="primary.main">
                {periodData?.journals?.length || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} md={4}>
          <Card sx={{ bgcolor: "rgba(76, 175, 80, 0.1)", textAlign: "center" }}>
            <CardContent sx={{ p: 2 }}>
              <Typography variant="body2" color="success.main">
                إجمالي المدين
              </Typography>
              <Typography variant="h6" fontWeight="bold" color="success.main">
                {Math.round(periodData?.journals
                  ?.reduce((sum, journal) => sum + (journal.totalDebit || 0), 0) || 0)
                  .toLocaleString()}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} md={4}>
          <Card sx={{ bgcolor: "rgba(244, 67, 54, 0.1)", textAlign: "center" }}>
            <CardContent sx={{ p: 2 }}>
              <Typography variant="body2" color="error.main">
                إجمالي الدائن
              </Typography>
              <Typography variant="h6" fontWeight="bold" color="error.main">
                {Math.round(periodData?.journals
                  ?.reduce((sum, journal) => sum + (journal.totalCredit || 0), 0) || 0)
                  .toLocaleString()}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} md={4}>
          <Card sx={{
            bgcolor: periodData?.journals?.reduce(
              (sum, journal) => sum + (journal.totalDebit || 0) - (journal.totalCredit || 0),
              0
            ) >= 0
              ? "rgba(76, 175, 80, 0.1)"
              : "rgba(244, 67, 54, 0.1)",
            textAlign: "center"
          }}>
            <CardContent sx={{ p: 2 }}>
              <Typography variant="body2" color={
                periodData?.journals?.reduce(
                  (sum, journal) => sum + (journal.totalDebit || 0) - (journal.totalCredit || 0),
                  0
                ) >= 0
                  ? "success.main"
                  : "error.main"
              }>
                إجمالي الرصيد
              </Typography>
              <Typography variant="h6" fontWeight="bold" color={
                periodData?.journals?.reduce(
                  (sum, journal) => sum + (journal.totalDebit || 0) - (journal.totalCredit || 0),
                  0
                ) >= 0
                  ? "success.main"
                  : "error.main"
              }              >
                {Math.round(periodData?.journals
                  ?.reduce(
                    (sum, journal) => sum + (journal.totalDebit || 0) - (journal.totalCredit || 0),
                    0
                  ) || 0)
                  .toLocaleString()}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} md={4}>
          <Card sx={{ bgcolor: "rgba(46, 125, 50, 0.1)", textAlign: "center" }}>
            <CardContent sx={{ p: 2 }}>
              <Typography variant="body2" color="success.main">
                إجمالي الأرباح
              </Typography>
              <Typography variant="h6" fontWeight="bold" color="success.main">
                {(periodData?.grossProfit?.total || 0).toLocaleString()}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} md={4}>
          <Card sx={{ bgcolor: "rgba(244, 67, 54, 0.1)", textAlign: "center" }}>
            <CardContent sx={{ p: 2 }}>
              <Typography variant="body2" color="error.main">
                المصروفات
              </Typography>
              <Typography variant="h6" fontWeight="bold" color="error.main">
                -{(periodData?.expenseDistribution?.totalExpenses || 0).toLocaleString()}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} md={4}>
          <Card sx={{ bgcolor: "rgba(46, 125, 50, 0.1)", textAlign: "center" }}>
            <CardContent sx={{ p: 2 }}>
              <Typography variant="body2" color="success.main">
                صافي أرباح الشركاء
              </Typography>
              <Typography variant="h6" fontWeight="bold" color="success.main">
                {(periodData?.totalPartnerProfit || 0).toLocaleString()}
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
            {formatDateWithHijri(periodData?.startDate, periodData?.startDateHijri)}
          </Box>

          <Box>
            <Typography variant="body2" color="textSecondary" gutterBottom>
              تاريخ النهاية
            </Typography>
            {formatDateWithHijri(periodData?.endDate, periodData?.endDateHijri)}
          </Box>

          <Box>
            <Typography variant="body2" color="textSecondary" gutterBottom>
              الحالة
            </Typography>
            <MuiChip
              label={periodData?.isClosed ? "مقفلة" : "مفتوحة"}
              color={periodData?.isClosed ? "success" : "warning"}
              size="small"
            />
          </Box>
        </Stack>
      </Paper>

      {periodData?.isClosed && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <Alert
            severity={periodData?.totalPartnerProfit || periodData?.companyProfit ? "success" : "info"}
            sx={{ flex: 1 }}
          >
            {periodData?.totalPartnerProfit || periodData?.companyProfit
              ? "تم إغلاق الفترة وتوزيعها"
              : " تم اغلاق الفترة ولكن تحتاج الي توزيع ارباحها" 
            }
          </Alert>
          <Button
            variant="outlined"
            color={periodData?.totalPartnerProfit || periodData?.companyProfit ? "success" : "warning"}
            onClick={handleNavigateToProfitDistribution}
            sx={{
              fontWeight: 'bold',
              fontSize: '0.9rem',
              borderRadius: 1,
              minHeight: 'auto',
              py: 0.75,
              px: 2,
            }}
          >
            الذهاب للتوزيع
          </Button>
        </Box>
      )}

      {periodData?.partnerProfits && periodData.partnerProfits.length > 0 && (
        <Paper sx={{ p: 2, borderRadius: 2, mb: 2 }}>
          <Typography variant="h6" fontWeight="bold" mb={2} textAlign="center">
            تفصيل أرباح الشركاء
          </Typography>

          <Stack spacing={2}>
            {periodData.partnerProfits.map((partner) => (
              <Card key={partner.partnerId} variant="outlined">
                <CardContent sx={{ p: 2 }}>
                  <Stack spacing={1}>
                    <Typography variant="subtitle2" fontWeight="bold" textAlign="center" mb={1}>
                      {partner.partnerName}
                    </Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" color="textSecondary">
                        الربح الإجمالي:
                      </Typography>
                      <Typography variant="body2" color="success.main">
                        {(partner.grossProfit || 0).toLocaleString()}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" color="textSecondary">
                        حصة المصروفات:
                      </Typography>
                      <Typography variant="body2" color="error.main">
                        -{(partner.expenseShare || 0).toLocaleString()}
                      </Typography>
                    </Box>
                    <Divider sx={{ my: 0.5 }} />
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" fontWeight="bold" color="textSecondary">
                        صافي الربح:
                      </Typography>
                      <Typography variant="body2" fontWeight="bold" color="success.main">
                        {(partner.netProfit || 0).toLocaleString()}
                      </Typography>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            ))}
          </Stack>
        </Paper>
      )}

      <Paper sx={{ p: 2, borderRadius: 2 }}>
        <Typography variant="h6" fontWeight="bold" mb={2} textAlign="center">
          قيود الفترة ({periodData?.journals?.length || 0})
        </Typography>
        
        <Stack spacing={2}>
          {periodData?.journals?.map((journal) => (
            <Card key={journal.id} variant="outlined">
              <CardContent sx={{ p: 2 }}>
                <Stack spacing={1}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Typography variant="subtitle2" fontWeight="bold" color="primary">
                      {journal.reference}
                    </Typography>
                    <MuiChip
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
                      {getJournalTypeText(journal.type)}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      {formatDate(journal.date)}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2">
                      مدين: {Math.round(journal.totalDebit || 0).toLocaleString()}
                    </Typography>
                    <Typography variant="body2">
                      دائن: {Math.round(journal.totalCredit || 0).toLocaleString()}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5 }}>
                    <Typography variant="body2" color="textSecondary">
                      الرصيد:
                    </Typography>
                    <Typography
                      variant="body2"
                      fontWeight="bold"
                      color={
                        (journal.totalDebit || 0) - (journal.totalCredit || 0) > 0
                          ? "success.main"
                          : (journal.totalDebit || 0) - (journal.totalCredit || 0) < 0
                          ? "error.main"
                          : "text.primary"
                      }
                    >
                      {Math.round((journal.totalDebit || 0) - (journal.totalCredit || 0)).toLocaleString()}
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          ))}
          
          {periodData?.journals && periodData.journals.length > 0 && (
            <Card sx={{ bgcolor: "#f5f5f5", border: "2px solid #e0e0e0" }}>
              <CardContent sx={{ p: 2 }}>
                <Typography variant="subtitle1" fontWeight="bold" mb={1} textAlign="center">
                  الإجمالي
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body1" fontWeight="bold">
                    مدين: {Math.round(periodData.journals
                      .reduce((sum, journal) => sum + (journal.totalDebit || 0), 0))
                      .toLocaleString()}
                  </Typography>
                  <Typography variant="body1" fontWeight="bold">
                    دائن: {Math.round(periodData.journals
                      .reduce((sum, journal) => sum + (journal.totalCredit || 0), 0))
                      .toLocaleString()}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1, pt: 1, borderTop: '1px solid #e0e0e0' }}>
                  <Typography variant="body1" fontWeight="bold">
                    الرصيد:
                  </Typography>
                  <Typography
                    variant="body1"
                    fontWeight="bold"
                    color={
                      periodData.journals.reduce(
                        (sum, journal) => sum + (journal.totalDebit || 0) - (journal.totalCredit || 0),
                        0
                      ) > 0
                        ? "success.main"
                        : periodData.journals.reduce(
                            (sum, journal) => sum + (journal.totalDebit || 0) - (journal.totalCredit || 0),
                            0
                          ) < 0
                        ? "error.main"
                        : "text.primary"
                    }
                  >
                    {Math.round(periodData.journals
                      .reduce(
                        (sum, journal) => sum + (journal.totalDebit || 0) - (journal.totalCredit || 0),
                        0
                      ))
                      .toLocaleString()}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          )}
        </Stack>

        {(!periodData?.journals || periodData.journals.length === 0) && (
          <Alert severity="info" sx={{ mt: 2 }}>
            لا توجد قيود في هذه الفترة
          </Alert>
        )}
      </Paper>
    </Box>
  );

  const renderDesktopPeriodDetails = () => (
    <Paper sx={{ p: 4, borderRadius: 2 }}>
      <Typography variant="h6" color="primary" fontWeight="bold" mb={3} textAlign={"center"}>
        تفاصيل الفترة
      </Typography>

      {showDraftAlert && !periodData?.isClosed && (
        <Alert
          severity="warning"
          sx={{ mb: 3 }}
          action={
            <Button
              color="inherit"
              size="small"
              onClick={handleNavigateToJournalEntries}
              sx={{ fontWeight: "bold" }}
            >
              انتقل للقيود
            </Button>
          }
        >
          لا يمكنك إغلاق هذه الفترة لأن هناك {draftCount} قيد غير معتمد. برجاء اعتمادها أولاً.
        </Alert>
      )}

      <Grid container spacing={10} mb={4} justifyContent="center" alignItems="center">
        <Grid item xs={12} md={6} justifyContent="center" alignItems="center" spacing={4}>
          <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
            اسم الفترة:
          </Typography>
          <Typography variant="body1">{periodData?.name || "-"}</Typography>
        </Grid>
        <Grid item xs={12} md={6}>
          <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
            الحالة:
          </Typography>
          <MuiChip
            label={periodData?.isClosed ? "مقفلة" : "مفتوحة"}
            color={periodData?.isClosed ? "success" : "warning"}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
            تاريخ البداية:
          </Typography>
          {formatDateWithHijri(periodData?.startDate, periodData?.startDateHijri)}
        </Grid>
        <Grid item xs={12} md={6}>
          <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
            تاريخ النهاية:
          </Typography>
          {formatDateWithHijri(periodData?.endDate, periodData?.endDateHijri)}
        </Grid>
      </Grid>

      {periodData?.isClosed && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, my: 3 }}>
          <Alert
            severity={periodData?.totalPartnerProfit || periodData?.companyProfit ? "success" : "info"}
            sx={{ flex: 1 }}
          >
            {periodData?.totalPartnerProfit || periodData?.companyProfit
              ? "تم إغلاق الفترة وتوزيعها"
              : " تم اغلاق الفترة ولكن تحتاج الي توزيع ارباحها" 
            }
          </Alert>
          <Button
            variant="outlined"
            color={periodData?.totalPartnerProfit || periodData?.companyProfit ? "success" : "warning"}
            onClick={handleNavigateToProfitDistribution}
            sx={{
              fontWeight: 'bold',
              fontSize: '0.9rem',
              borderRadius: 1,
              minHeight: 'auto',
              py: 0.75,
              px: 2,
            }}
          >
            الذهاب للتوزيع
          </Button>
        </Box>
      )}

      <Divider sx={{ my: 3 }} />

      {periodData?.partnerProfits && periodData.partnerProfits.length > 0 && (
        <>
          <Typography variant="h6" color="primary" fontWeight="bold" mb={3} textAlign="center">
            جدول أرباح الشركاء
          </Typography>
          <TableContainer component={Paper} variant="outlined" sx={{ mb: 4 }}>
            <Table>
              <TableHead>
                <StyledTableRow>
                  <StyledTableCell align="center">اسم الشريك</StyledTableCell>
                  <StyledTableCell align="center">الربح الإجمالي</StyledTableCell>
                  <StyledTableCell align="center">حصة المصروفات</StyledTableCell>
                  <StyledTableCell align="center">صافي الربح</StyledTableCell>
                </StyledTableRow>
              </TableHead>
              <TableBody>
                {periodData.partnerProfits.map((partner) => (
                  <StyledTableRow key={partner.partnerId}>
                    <StyledTableCell align="center" style={{ fontWeight: 'bold' }}>
                      {partner.partnerName}
                    </StyledTableCell>
                    <StyledTableCell align="center" style={{ color: '#2e7d32' }}>
                      {(partner.grossProfit || 0).toLocaleString()}
                    </StyledTableCell>
                    <StyledTableCell align="center" style={{ color: '#d32f2f' }}>
                      -{(partner.expenseShare || 0).toLocaleString()}
                    </StyledTableCell>
                    <StyledTableCell align="center" style={{ fontWeight: 'bold', color: '#2e7d32' }}>
                      {(partner.netProfit || 0).toLocaleString()}
                    </StyledTableCell>
                  </StyledTableRow>
                ))}
                <StyledTableRow style={{ backgroundColor: theme.palette.grey[100], borderTop: `2px solid ${theme.palette.primary.main}` }}>
                  <StyledTableCell align="center" style={{ fontWeight: 'bold', fontSize: '1.1em' }}>
                    إجمالي أرباح الشركاء
                  </StyledTableCell>
                  <StyledTableCell align="center" style={{ fontWeight: 'bold', color: '#2e7d32', fontSize: '1.1em' }}>
                    {(periodData?.grossProfit?.partnerTotal || 0).toLocaleString()}
                  </StyledTableCell>
                  <StyledTableCell align="center" style={{ fontWeight: 'bold', color: '#d32f2f', fontSize: '1.1em' }}>
                    -{(periodData?.expenseDistribution?.partnersShare || 0).toLocaleString()}
                  </StyledTableCell>
                  <StyledTableCell align="center" style={{ fontWeight: 'bold', color: '#2e7d32', fontSize: '1.1em' }}>
                    {(periodData.totalPartnerProfit || 0).toLocaleString()}
                  </StyledTableCell>
                </StyledTableRow>
              </TableBody>
            </Table>
          </TableContainer>

          <Divider sx={{ my: 3 }} />
        </>
      )}

      {/* Company Profits Table */}
      <Typography variant="h6" color="primary" fontWeight="bold" mb={3} textAlign="center">
        جدول أرباح الشركة
      </Typography>
      <TableContainer component={Paper} variant="outlined" sx={{ mb: 4 }}>
        <Table>
          <TableHead>
            <StyledTableRow>
              <StyledTableCell align="center">النوع</StyledTableCell>
              <StyledTableCell align="center">الربح الإجمالي</StyledTableCell>
              <StyledTableCell align="center">حصة المصروفات</StyledTableCell>
              <StyledTableCell align="center">باقي أرباح الشركاء</StyledTableCell>
              <StyledTableCell align="center">صافي الربح</StyledTableCell>
              <StyledTableCell align="center">الإجمالي</StyledTableCell>
            </StyledTableRow>
          </TableHead>
          <TableBody>
            <StyledTableRow>
              <StyledTableCell align="center" style={{ fontWeight: 'bold' }}>
                أرباح الشركة
              </StyledTableCell>
              <StyledTableCell align="center" style={{ color: '#2e7d32' }}>
                {(periodData?.grossProfit?.companyTotal || 0).toLocaleString()}
              </StyledTableCell>
              <StyledTableCell align="center" style={{ color: '#d32f2f' }}>
                -{(periodData?.expenseDistribution?.companyShare || 0).toLocaleString()}
              </StyledTableCell>
              <StyledTableCell align="center" style={{ color: '#ed6c02' }}>
                +{(periodData?.centCollected || 0).toLocaleString()}
              </StyledTableCell>
              <StyledTableCell align="center" style={{ fontWeight: 'bold', color: '#1976d2' }}>
                {(periodData?.companyProfit || 0).toLocaleString()}
              </StyledTableCell>
              <StyledTableCell align="center" style={{ fontWeight: 'bold', color: '#d32f2f', fontSize: '1.1em' }}>
                {((periodData?.companyProfit || 0) + (periodData?.centCollected || 0)).toLocaleString()}
              </StyledTableCell>
            </StyledTableRow>
          </TableBody>
        </Table>
      </TableContainer>

      <Divider sx={{ my: 3 }} />

      {/* Total Summary Table */}
      <Typography variant="h6" color="primary" fontWeight="bold" mb={3} textAlign="center">
        الإجمالي العام
      </Typography>
      <TableContainer component={Paper} variant="outlined" sx={{ mb: 4 }}>
        <Table>
          <TableHead>
            <StyledTableRow>
              <StyledTableCell align="center">النوع</StyledTableCell>
              <StyledTableCell align="center">الأرباح الإجمالية</StyledTableCell>
              <StyledTableCell align="center">المصروفات المخصومة</StyledTableCell>
              <StyledTableCell align="center">صافي الأرباح</StyledTableCell>
            </StyledTableRow>
          </TableHead>
          <TableBody>
            <StyledTableRow style={{ backgroundColor: theme.palette.grey[100], borderTop: `2px solid ${theme.palette.primary.main}` }}>
              <StyledTableCell align="center" style={{ fontWeight: 'bold', fontSize: '1.1em' }}>
                الإجمالي العام
              </StyledTableCell>
              <StyledTableCell align="center" style={{ fontWeight: 'bold', color: '#d32f2f', fontSize: '1.1em' }}>
                {(periodData?.grossProfit?.total || 0).toLocaleString()}
              </StyledTableCell>
              <StyledTableCell align="center" style={{ fontWeight: 'bold', color: '#d32f2f', fontSize: '1.1em' }}>
                -{(periodData?.expenseDistribution?.totalExpenses || 0).toLocaleString()}
              </StyledTableCell>
              <StyledTableCell align="center" style={{ fontWeight: 'bold', color: '#d32f2f', fontSize: '1.1em' }}>
                {(periodData?.totalProfit || 0).toLocaleString()}
              </StyledTableCell>
            </StyledTableRow>
          </TableBody>
        </Table>
      </TableContainer>

      <Divider sx={{ my: 3 }} />

      {/* Journals */}
      <Typography variant="h6" color="primary" fontWeight="bold" mb={3} textAlign="center">
        قيود الفترة ({periodData?.journals?.length || 0})
      </Typography>

      {periodData?.journals && periodData.journals.length > 0 ? (
        <TableContainer component={Paper} variant="outlined" >
          <Table>
            <TableHead>
              <StyledTableRow>
                <StyledTableCell align="center" >الوصف</StyledTableCell>
                <StyledTableCell align="center">النوع</StyledTableCell>
                <StyledTableCell align="center">الحالة</StyledTableCell>
                <StyledTableCell align="center">التاريخ</StyledTableCell>
                <StyledTableCell align="center">مدين</StyledTableCell>
                <StyledTableCell align="center">دائن</StyledTableCell>
                <StyledTableCell align="center">الرصيد</StyledTableCell>
                <StyledTableCell align="center">الإجراءات</StyledTableCell>
              </StyledTableRow>
            </TableHead>
            <TableBody>
              {periodData.journals.map((journal) => (
                <StyledTableRow key={journal.id}>
                  <StyledTableCell align="center">
                    {journal.description}
                  </StyledTableCell>
                  <StyledTableCell align="center">
                    {getJournalTypeText(journal.type)}
                  </StyledTableCell>
                  <StyledTableCell align="center">
                    <MuiChip
                      label={getJournalStatusText(journal.status)}
                      color={journal.status === "POSTED" ? "success" : "default"}
                      size="small"
                    />
                  </StyledTableCell>
                  <StyledTableCell align="center">
                    {formatDate(journal.date)}
                  </StyledTableCell>
                  <StyledTableCell align="center" style={{ color: '#d32f2f', fontWeight: 'bold' }}>
                    {Math.round(journal.totalDebit || 0).toLocaleString()}
                  </StyledTableCell>
                  <StyledTableCell align="center" style={{ color: '#2e7d32', fontWeight: 'bold' }}>
                    {Math.round(journal.totalCredit || 0).toLocaleString()}
                  </StyledTableCell>
                  <StyledTableCell
                    align="center"
                    style={{
                      fontWeight: 'bold',
                      color:
                        (journal.totalDebit || 0) - (journal.totalCredit || 0) > 0
                          ? '#2e7d32'
                          : (journal.totalDebit || 0) - (journal.totalCredit || 0) < 0
                          ? '#d32f2f'
                          : 'inherit'
                    }}
                  >
                    {Math.round((journal.totalDebit || 0) - (journal.totalCredit || 0)).toLocaleString()}
                  </StyledTableCell>
                  <StyledTableCell align="center">
                    <IconButton
                      size="small"
                      onClick={() => handleViewJournal(journal.id)}
                      title="عرض تفاصيل القيد"
                    >
                      <VisibilityIcon color="primary" style={{ fontSize: '20px' }} />
                    </IconButton>
                  </StyledTableCell>
                </StyledTableRow>
              ))}
              <StyledTableRow style={{ backgroundColor: theme.palette.background.default }}>
                <StyledTableCell align="center" colSpan={4} style={{ fontWeight: 'bold' }}>
                  الإجمالي
                </StyledTableCell>
                <StyledTableCell align="center" style={{ fontWeight: 'bold' }}>
                  {Math.round(periodData.journals
                    .reduce((sum, journal) => sum + (journal.totalDebit || 0), 0))
                    .toLocaleString()}
                </StyledTableCell>
                <StyledTableCell align="center" style={{ fontWeight: 'bold' }}>
                  {Math.round(periodData.journals
                    .reduce((sum, journal) => sum + (journal.totalCredit || 0), 0))
                    .toLocaleString()}
                </StyledTableCell>
                <StyledTableCell
                  align="center"
                  style={{
                    fontWeight: 'bold',
                    color:
                      periodData.journals.reduce(
                        (sum, journal) => sum + (journal.totalDebit || 0) - (journal.totalCredit || 0),
                        0
                      ) > 0
                        ? '#2e7d32'
                        : periodData.journals.reduce(
                            (sum, journal) => sum + (journal.totalDebit || 0) - (journal.totalCredit || 0),
                            0
                          ) < 0
                        ? '#d32f2f'
                        : 'inherit'
                  }}
                >
                  {Math.round(periodData.journals
                    .reduce(
                      (sum, journal) => sum + (journal.totalDebit || 0) - (journal.totalCredit || 0),
                      0
                    ))
                    .toLocaleString()}
                </StyledTableCell>
              </StyledTableRow>
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        <Alert severity="info">لا توجد قيود في هذه الفترة</Alert>
      )}
    </Paper>
  );

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
        <title>تقفيل الفترات</title>
        <meta name="description" content="تقفيل الفترات المحاسبية" />
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
            p: isSmallScreen ? 2 : isLargeScreen ? 3 : 4,
            bgcolor: theme.palette.background.paper,
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
                    label="عرض جميع الفترات"
                    sx={{
                      fontWeight: "bold",
                      borderBottom:
                        activeTab === 0 ? `3px solid ${theme.palette.primary.main}` : "none",
                      color: activeTab === 0 ? theme.palette.primary.main : theme.palette.text.primary,
                    }}
                  />
                  <Tab
                    label={selectedPeriod ? "تفاصيل الفترة" : "فترة محددة"}
                    sx={{
                      fontWeight: "bold",
                      borderBottom:
                        activeTab === 1 ? `3px solid ${theme.palette.primary.main}` : "none",
                      color: activeTab === 1 ? theme.palette.primary.main : theme.palette.text.primary,
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
                      تفاصيل الفترة
                    </Typography>
                  </Box>
                ) : (
                  // Title for mobile list view
                  <Box>
                    <Typography variant="h6" fontWeight="bold" mb={2}>
                      تقفيل الفترات
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
                        border: `1px solid ${theme.palette.divider}`,
                        bgcolor: "background.paper"
                      }}
                    />
                  </Box>
                )}
              </Box>
            )}

            {activeTab === 0 || (isSmallScreen && !selectedPeriod) ? (
              <PeriodTable 
                onViewDetails={handleViewDetails} 
                isMobile={isMobile} 
                searchQuery={searchQuery}
              />
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
    </Box>
  );
};

export default PeriodClosing;