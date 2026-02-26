import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Paper,
  Button,
  Alert,
  CircularProgress,
  useMediaQuery,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  useTheme,
} from "@mui/material";
import { Check as CheckIcon } from "@mui/icons-material";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocation, useNavigate } from "react-router-dom";
import {
  getClosedPeriods,
  postDistribution,
  unpostDistribution,
} from "./profitApi";
import { notifySuccess, notifyError } from "../../utilities/toastify";
import { Helmet } from "react-helmet-async";
import { usePermissions } from "../../components/Contexts/PermissionsContext";
import DeleteModal from "../../components/modals/DeleteModal";
import SavingPercentage from "../../components/modals/SavingPercentage";
import { exportProfitDistributionToPDF, exportProfitDistributionToExcel } from "../../utilities/ProfitDistributionExporter";
import {
  ProfitDistributionHeader,
  ProfitDistributionTable,
  ProfitDistributionCards,
  ProfitDistributionDetails,
} from "../../components/ProfitDistribution";
import { formatNumber, calculateProfitAfterSaving } from "../../components/ProfitDistribution/profitDistributionUtils";

const ProfitDistribution = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const theme = useTheme();
  const [activeTab, setActiveTab] = useState(0);
  const [selectedPeriod, setSelectedPeriod] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [cameFromSaving, setCameFromSaving] = useState(false);
  const [cameFromPeriodClosing, setCameFromPeriodClosing] = useState(false);
  const [distributionDialog, setDistributionDialog] = useState({
    open: false,
    periodId: null,
    periodName: "",
    action: "",
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
  const isTabletOrSmaller = useMediaQuery("(max-width: 1024px)");
  const isSmallScreen = isMobile || isTablet;

  const queryClient = useQueryClient();
  const { permissions } = usePermissions();

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const periodIdParam = searchParams.get('periodId');
    const fromParam = searchParams.get('from');
    
    if (periodIdParam) {
      const periodId = parseInt(periodIdParam, 10);
      if (!isNaN(periodId)) {
        setSelectedPeriod(periodId);
        setActiveTab(1);
        
        if (fromParam === 'period-closing') {
          setCameFromPeriodClosing(true);
          setCameFromSaving(false);
        } else {
          setCameFromSaving(true);
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

  const { data: closedPeriods, isLoading: isPeriodsLoading } = useQuery({
    queryKey: ["closed-periods"],
    queryFn: () => getClosedPeriods(),
  });

  const { data: periodDetailsData, isLoading: isPeriodLoading } = useQuery({
    queryKey: ["closed-periods", selectedPeriod],
    queryFn: () => getClosedPeriods(selectedPeriod),
    enabled: !!selectedPeriod && activeTab === 1,
  });

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
        const totalPartnerProfit = periodData.partners?.reduce((sum, partner) => sum + (partner.finalProfit || partner.totalProfit || 0), 0) || 0;
        const savingAmount = enableSaving ? totalPartnerProfit * (savingPercentage / 100) : 0;
        await postDistribution(periodId, savingAmount);
        notifySuccess(`تم توزيع الأرباح بنجاح ${enableSaving ? `مع ادخار ${formatNumber(savingAmount)}` : ''}`);
      }

      queryClient.invalidateQueries(["closed-periods"]);
      handleCloseDistributionDialog();
      
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

  const handleViewJournal = (journalId) => {
    navigate('/journal-entries', {
      state: {
        journalId: journalId,
        activeTab: 1,
        fromProfitDistribution: true
      }
    });
  };

  const profitAfterSaving = calculateProfitAfterSaving(
    periodData,
    enableSaving,
    savingPercentage
  );

  const renderClosedPeriodsTable = () => (
    <ProfitDistributionTable
      closedPeriods={closedPeriods}
      isLoading={isPeriodsLoading}
      permissions={permissions}
      onViewDetails={handleViewDetails}
    />
  );

  const renderClosedPeriodsCards = () => (
    <ProfitDistributionCards
      closedPeriods={closedPeriods}
      isLoading={isPeriodsLoading}
      theme={theme}
      permissions={permissions}
      onViewDetails={handleViewDetails}
      onOpenDistributionDialog={handleOpenDistributionDialog}
    />
  );

  const renderPeriodDetails = () => (
    <ProfitDistributionDetails
      periodData={periodData}
      theme={theme}
      isSmallScreen={isSmallScreen}
      enableSaving={enableSaving}
      savingPercentage={savingPercentage}
      permissions={permissions}
      isExporting={isExporting}
      onExportPDF={handleExportPDF}
      onExportExcel={handleExportExcel}
      onViewJournal={handleViewJournal}
      onEnableSavingChange={setEnableSaving}
      onOpenSavingDialog={handleOpenSavingDialog}
      onOpenDistributionDialog={handleOpenDistributionDialog}
      selectedPeriod={selectedPeriod}
      onBackToList={handleBackToList}
    />
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
        bgcolor: theme.palette.background.default,
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
          flexDirection: "column",
          flex: 1,
          height: isSmallScreen ? "auto" : "calc(100vh - 80px)",
          width: "100%",
        }}
      >
        <Box
          sx={{
            flex: 1,
            p: isSmallScreen ? 2 : 4,
            bgcolor: theme.palette.background.paper,
            overflowY: "auto",
            width: "100%",
          }}
        >
          <Box sx={{ width: "100%" }}>
            <ProfitDistributionHeader
              activeTab={activeTab}
              onTabChange={(newValue) => {
                setActiveTab(newValue);
                if (newValue === 0) setSelectedPeriod(null);
              }}
              selectedPeriod={selectedPeriod}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              onBackToList={handleBackToList}
              onBackToSaving={handleBackToSaving}
              onBackToPeriodClosing={handleBackToPeriodClosing}
              cameFromSaving={cameFromSaving}
              cameFromPeriodClosing={cameFromPeriodClosing}
              isSmallScreen={isSmallScreen}
              theme={theme}
              permissions={permissions}
              onExportPDF={handleExportPDF}
              onExportExcel={handleExportExcel}
              isExporting={isExporting}
            />

            {activeTab === 0 || (isSmallScreen && !selectedPeriod) ? (
              <Paper
                sx={{
                  flex: 1,
                  width: "100%",
                  maxWidth: "100%",
                  overflow: "hidden",
                  borderRadius: 2,
                }}
              >
                {isMobile
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
                  renderPeriodDetails()
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