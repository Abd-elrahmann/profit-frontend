import React, { useState } from "react";
import { Box, Paper, useMediaQuery, useTheme } from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { getAllPartnerSavings, getSavingAccountReport } from "./savingApi";
import SavingWithdrawModal from "../../components/modals/SavingWithdrawModal";
import { exportSavingsToPDF, exportSavingsToExcel } from "../../utilities/savingExporter";
import { Helmet } from "react-helmet-async";
import {
  SavingTable,
  SavingTabs,
  SavingToolbar,
  SavingAccountTab,
} from "../../components/Saving";
const Saving = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [page] = useState(1);
  const [limit] = useState(10);
  const [withdrawModalOpen, setWithdrawModalOpen] = useState(false);
  const isMobile = useMediaQuery("(max-width: 480px)");
  const isTablet = useMediaQuery("(max-width: 768px)");
  const isSmallScreen = isMobile || isTablet;
  const theme = useTheme();
  const { data: savingData, isLoading: isSavingLoading, refetch: refetchSavingData } = useQuery({
    queryKey: ["partners-savings", page],
    retry: 1,
    queryFn: () => getAllPartnerSavings(page, limit),
  });
  const { data: accountReport, isLoading: isAccountLoading, refetch: refetchAccountReport } = useQuery({
    queryKey: ["saving-account"],
    retry: 1,
    queryFn: () => getSavingAccountReport(),
    enabled: activeTab === 1,
  });
  const handleWithdrawSuccess = () => {
    refetchSavingData();
    refetchAccountReport();
  };
  const handleExportPDF = () => exportSavingsToPDF(savingData);
  const handleExportExcel = () => exportSavingsToExcel(savingData);
  return (
    <Box
      dir="rtl"
      sx={{
        bgcolor: theme.palette.background.default,
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        overflowX: 'hidden',
      }}
    >
      <Helmet>
        <title>إدارة المدخرات</title>
        <meta name="description" content="إدارة مدخرات الشركاء وصندوق الادخار" />
      </Helmet>
      <Box
        sx={{
          flex: 1,
          p: { xs: 2, sm: 3, md: 4 },
          bgcolor: theme.palette.background.paper,
          overflowX: 'hidden',
        }}
      >
        <Box sx={{ width: "100%" }}>
          <SavingTabs
            activeTab={activeTab}
            onTabChange={setActiveTab}
            isMobile={isMobile}
            theme={theme}
          />
          {activeTab === 0 ? (
            <Paper sx={{ flex: 1, width: "100%", overflow: "hidden", borderRadius: 2 }}>
              <SavingToolbar
                onWithdrawClick={() => setWithdrawModalOpen(true)}
                onExportPDF={handleExportPDF}
                onExportExcel={handleExportExcel}
                isLoading={isSavingLoading}
                hasData={savingData?.data?.length}
              />
              <SavingTable isLoading={isSavingLoading} savingData={savingData} />
            </Paper>
          ) : (
            <SavingAccountTab
              accountReport={accountReport}
              isAccountLoading={isAccountLoading}
              isMobile={isMobile}
              theme={theme}
            />
          )}
        </Box>
      </Box>
      <SavingWithdrawModal
        open={withdrawModalOpen}
        onClose={() => setWithdrawModalOpen(false)}
        onSuccess={handleWithdrawSuccess}
      />
    </Box>
  );
};
export default Saving;