import React, { useState } from "react";
import {
  Box,
  Tabs,
  Tab,
  Paper,
  useMediaQuery,
  Button,
  Stack,
} from "@mui/material";
import { FileDownload as FileDownloadIcon } from "@mui/icons-material";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getAllClients, updateClientNote } from "./clientsCollectionsApi";
import ClientCollectionsTable from "../../components/modals/ClientCollectionsTable";
import { Helmet } from "react-helmet-async";
import { notifySuccess, notifyError } from "../../utilities/toastify";
import {
  exportClientCollectionsToPDF,
  exportClientCollectionsToExcel,
} from "../../utilities/clientCollectionsExporter";
import { usePermissions } from "../../components/Contexts/PermissionsContext";

const ClientCollections = () => {
  const [clientsTab, setClientsTab] = useState(0); 
  const [page] = useState(1);
  const [limit] = useState(20);

  const isSmallScreen = useMediaQuery("(max-width: 768px)");
  const queryClient = useQueryClient();
  const { permissions } = usePermissions();

  const { data: activeClientsData, isLoading: isActiveClientsLoading } = useQuery({
    queryKey: ["clients-collections", page, "ACTIVE"],
    queryFn: () => getAllClients(page, limit, "ACTIVE"),
    enabled: clientsTab === 0,
  });

  const { data: completedClientsData, isLoading: isCompletedClientsLoading } = useQuery({
    queryKey: ["clients-collections", page, "COMPLETE"],
    queryFn: () => getAllClients(page, limit, "COMPLETE"),
    enabled: clientsTab === 1,
  });

  const clientsData = clientsTab === 0 ? activeClientsData : completedClientsData;
  const isClientsLoading = clientsTab === 0 ? isActiveClientsLoading : isCompletedClientsLoading;

  const updateNoteMutation = useMutation({
    mutationFn: ({ clientId, note }) => updateClientNote(clientId, note),
    onSuccess: () => {
      queryClient.invalidateQueries(["clients-collections"]);
      notifySuccess("تم حفظ الملاحظة بنجاح");
    },
    onError: (error) => {
      console.error("Error updating note:", error);
      notifyError("حدث خطأ أثناء حفظ الملاحظة");
    },
  });

  const handleUpdateNote = async (clientId, note) => {
    await updateNoteMutation.mutateAsync({ clientId, note });
  };

  const handleExportPDF = async () => {
    try {
      const dataToExport = clientsData;
      const status = clientsTab === 0 ? "ACTIVE" : "COMPLETE";
      await exportClientCollectionsToPDF(dataToExport, status);
      notifySuccess("تم تصدير ملف PDF بنجاح");
    } catch (error) {
      console.error("Error exporting PDF:", error);
      notifyError("حدث خطأ أثناء تصدير ملف PDF");
    }
  };

  const handleExportExcel = async () => {
    try {
      const dataToExport = clientsData;
      const status = clientsTab === 0 ? "ACTIVE" : "COMPLETE";
      await exportClientCollectionsToExcel(dataToExport, status);
      notifySuccess("تم تصدير ملف Excel بنجاح");
    } catch (error) {
      console.error("Error exporting Excel:", error);
      notifyError("حدث خطأ أثناء تصدير ملف Excel");
    }
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
          <Box sx={{ width: "100%" }}>
            <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  flexDirection: isSmallScreen ? "column" : "row",
                  gap: 2,
                }}
              >
                <Tabs
                  value={clientsTab}
                  onChange={(e, newValue) => setClientsTab(newValue)}
                  variant={isSmallScreen ? "fullWidth" : "standard"}
                  sx={{ flex: 1 }}
                >
                  <Tab
                    label="العملاء المديونين"
                    sx={{
                      fontWeight: "bold",
                      borderBottom: clientsTab === 0 ? "3px solid #d32f2f" : "none",
                      color: clientsTab === 0 ? "#d32f2f" : "text.secondary",
                    }}
                  />
                  <Tab
                    label="العملاء المسددين"
                    sx={{
                      fontWeight: "bold",
                      borderBottom: clientsTab === 1 ? "3px solid #2e7d32" : "none",
                      color: clientsTab === 1 ? "#2e7d32" : "text.secondary",
                    }}
                  />
                </Tabs>

                {permissions.includes("client-report_Export") && (
                  <Stack
                    direction={isSmallScreen ? "column" : "row"}
                    spacing={1}
                    sx={{ width: isSmallScreen ? "100%" : "auto",gap:2 }}
                  >
                    <Button
                      variant="contained"
                      color="error"
                      startIcon={<FileDownloadIcon sx={{marginLeft:"8px"}} />}
                      onClick={handleExportPDF}
                      disabled={isClientsLoading || !clientsData?.data?.length}
                      fullWidth={isSmallScreen}
                    >
                      تصدير PDF
                    </Button>
                    <Button
                      variant="contained"
                      color="success"
                      startIcon={<FileDownloadIcon sx={{marginLeft:"8px"}} />}
                      onClick={handleExportExcel}
                      disabled={isClientsLoading || !clientsData?.data?.length}
                      fullWidth={isSmallScreen}
                    >
                      تصدير Excel
                    </Button>
                  </Stack>
                )}
              </Box>
            </Box>

            <Paper
              sx={{
                flex: 1,
                width: "100%",
                overflow: "hidden",
                borderRadius: 2,
              }}
            >
              <ClientCollectionsTable
                isLoading={isClientsLoading}
                clientsData={clientsData}
                onUpdateNote={handleUpdateNote}
              />
            </Paper>
            </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default ClientCollections;
