import React, { useState, useEffect } from "react";
import { Box, Alert, CircularProgress, useMediaQuery } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Helmet } from "react-helmet-async";
import { useTheme } from "../../theme/ThemeContext";
import {
  getPeriodById,
  closePeriod,
  unpostClosing,
  comparePeriods,
} from "./periodApi";
import { notifySuccess, notifyError } from "../../utilities/toastify";
import { PeriodTable } from "../../components/PeriodClosing";
import PeriodCompareModal from "../../components/modals/PeriodCompareModal";
import { usePermissions } from "../../components/Contexts/PermissionsContext";
import {
  exportPeriodClosingToPDF,
  exportPeriodClosingToExcel,
} from "../../utilities/periodClosingExporter";
import { notifyInfo } from "../../utilities/toastify";
import PeriodClosingHeader from "../../components/PeriodClosing/PeriodClosingHeader";
import PeriodClosingDetails from "../../components/PeriodClosing/PeriodClosingDetails";
const PeriodClosing = () => {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { permissions } = usePermissions();
  const [activeTab, setActiveTab] = useState(0);
  const [selectedPeriod, setSelectedPeriod] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showDraftAlert, setShowDraftAlert] = useState(false);
  const [draftCount, setDraftCount] = useState(0);
  const [isExporting, setIsExporting] = useState(false);
  const [selectedPeriods, setSelectedPeriods] = useState([]);
  const [compareModalOpen, setCompareModalOpen] = useState(false);
  const [compareData, setCompareData] = useState(null);
  const [isCompareLoading, setIsCompareLoading] = useState(false);
  const isMobile = useMediaQuery("(max-width: 480px)");
  const isTablet = useMediaQuery("(max-width: 768px)");
  const isLargeScreen = useMediaQuery("(min-width: 1200px)");
  const isSmallScreen = isMobile || isTablet;
  const { data: periodData, isLoading: isPeriodLoading } = useQuery({
    queryKey: ["period", selectedPeriod],
    queryFn: () => getPeriodById(selectedPeriod),
    enabled: !!selectedPeriod && activeTab === 1,
  });
  useEffect(() => {
    if (periodData?.journals) {
      const draftEntries = periodData.journals.filter(
        (journal) => journal.status === "DRAFT"
      );
      setDraftCount(draftEntries.length);
      setShowDraftAlert(draftEntries.length > 0);
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
  const handleTabChange = (newValue) => {
    setActiveTab(newValue);
    if (newValue === 0) {
      setSelectedPeriod(null);
    }
  };
  const handleClosePeriod = async () => {
    try {
      await closePeriod(selectedPeriod);
      notifySuccess("تم تقفيل الفترة بنجاح");
      queryClient.invalidateQueries(["period", selectedPeriod]);
      queryClient.invalidateQueries(["periods"]);
      await queryClient.refetchQueries(["period", selectedPeriod]);
    } catch (error) {
      notifyError(
        error.response?.data?.message || "حدث خطأ أثناء تقفيل الفترة"
      );
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
      notifyError(
        error.response?.data?.message || "حدث خطأ أثناء إلغاء التقفيل"
      );
    }
  };
  const handleViewJournal = (journalId) => {
    navigate("/journal-entries", {
      state: { journalId, activeTab: 1, fromPeriod: true },
    });
  };
  const handleNavigateToJournalEntries = () => {
    navigate("/journal-entries");
  };
  const handleNavigateToProfitDistribution = () => {
    navigate(
      `/profit-distribution?periodId=${selectedPeriod}&from=period-closing`
    );
  };
  const handleComparePeriods = async (periodId1, periodId2) => {
    setIsCompareLoading(true);
    setCompareData(null);
    setCompareModalOpen(true);
    try {
      const data = await comparePeriods(periodId1, periodId2);
      setCompareData(data);
    } catch (error) {
      notifyError(
        error?.response?.data?.message || "حدث خطأ أثناء مقارنة الفترات"
      );
      setCompareModalOpen(false);
    } finally {
      setIsCompareLoading(false);
    }
  };
  const handleCloseCompareModal = () => {
    setCompareModalOpen(false);
    setCompareData(null);
    setSelectedPeriods([]);
  };
  const handleExportPDF = async () => {
    if (!periodData) return;
    setIsExporting(true);
    try {
      await exportPeriodClosingToPDF(periodData);
      notifySuccess("تم تصدير PDF بنجاح");
    } catch (error) {
      notifyError("فشل تصدير PDF");
      console.error(error);
    } finally {
      setIsExporting(false);
    }
  };
  const handleExportExcel = async () => {
    if (!periodData) return;
    setIsExporting(true);
    try {
      notifyInfo("جاري تصدير Excel...");
      await exportPeriodClosingToExcel(periodData);
      notifySuccess("تم تصدير Excel بنجاح");
    } catch (error) {
      notifyError("فشل تصدير Excel");
      console.error(error);
    } finally {
      setIsExporting(false);
    }
  };
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
          flexDirection: "column",
          flex: 1,
          height: isSmallScreen ? "auto" : "calc(100vh - 80px)",
          width: "100%",
        }}
      >
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
            <PeriodClosingHeader
              activeTab={activeTab}
              onTabChange={handleTabChange}
              selectedPeriod={selectedPeriod}
              searchQuery={searchQuery}
              onSearchChange={(value) => setSearchQuery(value)}
              onBackToList={handleBackToList}
              isSmallScreen={isSmallScreen}
            />
            {activeTab === 0 || (isSmallScreen && !selectedPeriod) ? (
              <>
                <PeriodTable
                  onViewDetails={handleViewDetails}
                  isMobile={isMobile}
                  searchQuery={searchQuery}
                  showSelection={true}
                  selectedPeriods={selectedPeriods}
                  onSelectionChange={setSelectedPeriods}
                  onComparePeriods={handleComparePeriods}
                />
                <PeriodCompareModal
                  open={compareModalOpen}
                  onClose={handleCloseCompareModal}
                  data={compareData}
                  isLoading={isCompareLoading}
                />
              </>
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
                  <PeriodClosingDetails
                    periodData={periodData}
                    theme={theme}
                    isSmallScreen={isSmallScreen}
                    showDraftAlert={showDraftAlert}
                    draftCount={draftCount}
                    permissions={permissions}
                    isExporting={isExporting}
                    onExportPDF={handleExportPDF}
                    onExportExcel={handleExportExcel}
                    onClosePeriod={handleClosePeriod}
                    onUnpostClosing={handleUnpostClosing}
                    onNavigateToJournalEntries={handleNavigateToJournalEntries}
                    onNavigateToProfitDistribution={
                      handleNavigateToProfitDistribution
                    }
                    onViewJournal={handleViewJournal}
                    onBackToList={handleBackToList}
                  />
                ) : (
                  <Alert severity="error">
                    حدث خطأ في تحميل بيانات الفترة
                  </Alert>
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