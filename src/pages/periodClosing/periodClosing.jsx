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
  Chip as MuiChip,
  InputBase,
} from "@mui/material";
import {
  Check as CheckIcon,
  Cancel as CancelIcon,
  Visibility as VisibilityIcon,
  ArrowBack as ArrowBackIcon,
} from "@mui/icons-material";
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
  const [activeTab, setActiveTab] = useState(0);
  const [selectedPeriod, setSelectedPeriod] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  const isMobile = useMediaQuery("(max-width: 480px)");
  const isTablet = useMediaQuery("(max-width: 768px)");
  const isSmallScreen = isMobile || isTablet;

  const queryClient = useQueryClient();
  const { permissions } = usePermissions();

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

  const handleClosePeriod = async () => {
    try {
      await closePeriod(selectedPeriod);
      notifySuccess("تم تقفيل الفترة بنجاح");
      queryClient.invalidateQueries(["period", selectedPeriod]);
      queryClient.invalidateQueries(["periods"]);
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
    } catch (error) {
      notifyError(error.response?.data?.message || "حدث خطأ أثناء إلغاء التقفيل");
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return "غير محدد";
    return new Date(dateString).toLocaleDateString('en-US');
  };

  // Get journal type in Arabic
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
            <Typography>أرباح الشركاء:</Typography>
            <Typography fontWeight="bold" color="success.main">
              {periodData?.totalPartnerProfit?.toLocaleString() || 0}
            </Typography>
          </Box>
          <Box sx={{ display: "flex", justifyContent: "space-between" }}>
            <Typography>أرباح الشركة:</Typography>
            <Typography fontWeight="bold" color="primary.main">
              {periodData?.companyProfit?.toLocaleString() || 0}
            </Typography>
          </Box>
          <Box sx={{ display: "flex", justifyContent: "space-between" }}>
            <Typography>الإجمالي:</Typography>
            <Typography fontWeight="bold">
              {((periodData?.totalPartnerProfit || 0) + (periodData?.companyProfit || 0)).toLocaleString()}
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

  // Render mobile actions
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

  // Render mobile period details
  const renderMobilePeriodDetails = () => (
    <Box>
      {/* Summary Cards */}
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

      {/* Partner Profits */}
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
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" color="textSecondary">
                        الربح:
                      </Typography>
                      <Typography variant="body2" fontWeight="bold" color="success.main">
                        {partner.totalProfit.toLocaleString()}
                      </Typography>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            ))}
          </Stack>
        </Paper>
      )}

      {/* Journals */}
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
                      مدين: {journal.totalDebit?.toLocaleString() || 0}
                    </Typography>
                    <Typography variant="body2">
                      دائن: {journal.totalCredit?.toLocaleString() || 0}
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
                      {((journal.totalDebit || 0) - (journal.totalCredit || 0)).toLocaleString()}
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
                    مدين: {periodData.journals
                      .reduce((sum, journal) => sum + (journal.totalDebit || 0), 0)
                      .toLocaleString()}
                  </Typography>
                  <Typography variant="body1" fontWeight="bold">
                    دائن: {periodData.journals
                      .reduce((sum, journal) => sum + (journal.totalCredit || 0), 0)
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
                    {periodData.journals
                      .reduce(
                        (sum, journal) => sum + (journal.totalDebit || 0) - (journal.totalCredit || 0),
                        0
                      )
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

  // Render desktop period details
  const renderDesktopPeriodDetails = () => (
    <Paper sx={{ p: 4, borderRadius: 2 }}>
      <Typography variant="h6" color="primary" fontWeight="bold" mb={3} textAlign={"center"}>
        تفاصيل الفترة
      </Typography>

      {/* Period Information */}
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

      {/* Partner Profits */}
      {periodData?.partnerProfits && periodData.partnerProfits.length > 0 && (
        <>
          <Typography variant="h6" color="primary" fontWeight="bold" mb={3} textAlign="center">
            أرباح الشركاء
          </Typography>
          <TableContainer component={Paper} variant="outlined" sx={{ mb: 4 }}>
            <Table>
              <TableHead>
                <StyledTableRow>
                  <StyledTableCell align="center">اسم الشريك</StyledTableCell>
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
                      <Typography fontWeight="bold" color="success.main">
                        {partner.totalProfit.toLocaleString()}
                      </Typography>
                    </StyledTableCell>
                  </StyledTableRow>
                ))}
                <StyledTableRow sx={{ backgroundColor: "#f5f5f5" }}>
                  <StyledTableCell align="center">
                    <Typography fontWeight="bold">إجمالي أرباح الشركاء</Typography>
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

          <Divider sx={{ my: 3 }} />
        </>
      )}

      {/* Journals */}
      <Typography variant="h6" color="primary" fontWeight="bold" mb={3} textAlign="center">
        قيود الفترة ({periodData?.journals?.length || 0})
      </Typography>

      {periodData?.journals && periodData.journals.length > 0 ? (
        <TableContainer component={Paper} variant="outlined">
          <Table>
            <TableHead>
              <StyledTableRow>
                <StyledTableCell align="center">الرقم المرجعي</StyledTableCell>
                <StyledTableCell align="center">الوصف</StyledTableCell>
                <StyledTableCell align="center">النوع</StyledTableCell>
                <StyledTableCell align="center">الحالة</StyledTableCell>
                <StyledTableCell align="center">التاريخ</StyledTableCell>
                <StyledTableCell align="center">مدين</StyledTableCell>
                <StyledTableCell align="center">دائن</StyledTableCell>
                <StyledTableCell align="center">الرصيد</StyledTableCell>
              </StyledTableRow>
            </TableHead>
            <TableBody>
              {periodData.journals.map((journal) => (
                <StyledTableRow key={journal.id}>
                  <StyledTableCell align="center">
                    {journal.reference}
                  </StyledTableCell>
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
                  <StyledTableCell align="center">
                    {journal.totalDebit?.toLocaleString() || 0}
                  </StyledTableCell>
                  <StyledTableCell align="center">
                    {journal.totalCredit?.toLocaleString() || 0}
                  </StyledTableCell>
                  <StyledTableCell align="center">
                    <Typography
                      fontWeight="bold"
                      color={
                        (journal.totalDebit || 0) - (journal.totalCredit || 0) > 0
                          ? "success.main"
                          : (journal.totalDebit || 0) - (journal.totalCredit || 0) < 0
                          ? "error.main"
                          : "text.primary"
                      }
                    >
                      {((journal.totalDebit || 0) - (journal.totalCredit || 0)).toLocaleString()}
                    </Typography>
                  </StyledTableCell>
                </StyledTableRow>
              ))}
              <StyledTableRow sx={{ backgroundColor: "#f5f5f5" }}>
                <StyledTableCell align="center" colSpan={5}>
                  <Typography fontWeight="bold">الإجمالي</Typography>
                </StyledTableCell>
                <StyledTableCell align="center">
                  <Typography fontWeight="bold">
                    {periodData.journals
                      .reduce((sum, journal) => sum + (journal.totalDebit || 0), 0)
                      .toLocaleString()}
                  </Typography>
                </StyledTableCell>
                <StyledTableCell align="center">
                  <Typography fontWeight="bold">
                    {periodData.journals
                      .reduce((sum, journal) => sum + (journal.totalCredit || 0), 0)
                      .toLocaleString()}
                  </Typography>
                </StyledTableCell>
                <StyledTableCell align="center">
                  <Typography
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
                    {periodData.journals
                      .reduce(
                        (sum, journal) => sum + (journal.totalDebit || 0) - (journal.totalCredit || 0),
                        0
                      )
                      .toLocaleString()}
                  </Typography>
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
        bgcolor: "#f6f6f8",
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
                    label="عرض جميع الفترات"
                    sx={{
                      fontWeight: "bold",
                      borderBottom:
                        activeTab === 0 ? "3px solid #0d40a5" : "none",
                      color: activeTab === 0 ? "#0d40a5" : "text.secondary",
                    }}
                  />
                  <Tab
                    label={selectedPeriod ? "تفاصيل الفترة" : "فترة محددة"}
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
                        border: "1px solid #e0e0e0",
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