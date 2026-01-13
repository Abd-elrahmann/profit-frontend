import React, { useState } from "react";
import {
  Box,
  Tabs,
  Tab,
  Paper,
  useMediaQuery,
  useTheme,
  Button,
  Stack,
  Menu,
  MenuItem,
  Checkbox,
  FormControlLabel,
} from "@mui/material";
import { 
  FileDownload as FileDownloadIcon,
  Print as PrintIcon,
  ViewColumn as ViewColumnIcon 
} from "@mui/icons-material";
import { useQuery } from "@tanstack/react-query";
import { getAllClients } from "./clientsCollectionsApi";
import ClientCollectionsTable from "../../components/modals/ClientCollectionsTable";
import { Helmet } from "react-helmet-async";
import { notifySuccess, notifyError } from "../../utilities/toastify";
import {
  exportClientCollectionsToPDF,
  exportClientCollectionsToExcel,
  printClientCollections,
} from "../../utilities/clientCollectionsExporter";
import { usePermissions } from "../../components/Contexts/PermissionsContext";

const availableColumns = [
  { id: 'id', label: 'م', show: true, required: true },
  { id: 'client', label: 'العميل', show: true },
  { id: 'address', label: 'العنوان', show: true },
  { id: 'loansCount', label: 'عدد السلف', show: true },
  { id: 'paidRepayments', label: 'الدفعات المدفوعة', show: true },
  { id: 'remainingRepayments', label: 'الدفعات المتبقية', show: true },
  { id: 'monthlyInstallment', label: 'الدفعة الشهرية', show: true },
  { id: 'totalDebit', label: 'إجمالي المديونية', show: true },
  { id: 'totalPaid', label: 'إجمالي المدفوع', show: true },
  { id: 'totalInterest', label: 'إجمالي الفوائد', show: true },
  { id: 'totalDiscounts', label: 'الخصومات', show: true },
  { id: 'remaining', label: 'المتبقي', show: true },
  { id: 'note', label: 'ملاحظات', show: true },
];

const ClientCollections = () => {
  const [clientsTab, setClientsTab] = useState(0); 
  const [page] = useState(1);
  const [limit] = useState(20);
  const [columns, setColumns] = useState(availableColumns);
  const [anchorEl, setAnchorEl] = useState(null);

  const isSmallScreen = useMediaQuery("(max-width: 768px)");
  const { permissions } = usePermissions();
  const { isDarkMode } = useTheme();

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

  const handleColumnMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleColumnMenuClose = () => {
    setAnchorEl(null);
  };

  const handleColumnToggle = (columnId) => {
    setColumns(columns.map(col => 
      col.id === columnId && !col.required ? { ...col, show: !col.show } : col
    ));
  };

  const handleSelectAllColumns = () => {
    setColumns(columns.map(col => ({ ...col, show: true })));
  };

  const handleDeselectAllColumns = () => {
    setColumns(columns.map(col => 
      col.required ? col : { ...col, show: false }
    ));
  };

  const handleExportPDF = async () => {
    try {
      const dataToExport = clientsData;
      const status = clientsTab === 0 ? "ACTIVE" : "COMPLETE";
      const visibleColumns = columns.filter(col => col.show);
      await exportClientCollectionsToPDF(dataToExport, status, visibleColumns);
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
      const visibleColumns = columns.filter(col => col.show);
      await exportClientCollectionsToExcel(dataToExport, status, visibleColumns);
      notifySuccess("تم تصدير ملف Excel بنجاح");
    } catch (error) {
      console.error("Error exporting Excel:", error);
      notifyError("حدث خطأ أثناء تصدير ملف Excel");
    }
  };

  const handlePrint = async () => {
    try {
      const dataToExport = clientsData;
      const status = clientsTab === 0 ? "ACTIVE" : "COMPLETE";
      const visibleColumns = columns.filter(col => col.show);
      await printClientCollections(dataToExport, status, visibleColumns);
    } catch (error) {
      console.error("Error printing:", error);
      notifyError("حدث خطأ أثناء الطباعة");
    }
  };

  return (
    <Box
      sx={{
        bgcolor: isDarkMode ? 'background.default' : '#f6f6f8',
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
          p: isSmallScreen ? 2 : 3,
          bgcolor: 'background.paper',
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
                      color: clientsTab === 0 ? "#d32f2f" : "text.primary",
                    }}
                  />
                  <Tab
                    label="العملاء المسددين"
                    sx={{
                      fontWeight: "bold",
                      borderBottom: clientsTab === 1 ? "3px solid #2e7d32" : "none",
                      color: clientsTab === 1 ? "#2e7d32" : "text.primary",
                    }}
                  />
                </Tabs>

                {permissions.includes("client-report_Export") && (
                  <Stack
                    direction={isSmallScreen ? "column" : "row"}
                    spacing={1}
                    sx={{ width: isSmallScreen ? "100%" : "auto", gap: 2 }}
                  >
                    {/* زر الأعمدة */}
                    <Button
                      variant="contained"
                      color="warning"
                      startIcon={<ViewColumnIcon sx={{marginLeft:"8px"}} />}
                      onClick={handleColumnMenuClick}
                      fullWidth={isSmallScreen}
                      sx={{
                        fontWeight: "bold",
                      }}
                    >
                      الأعمدة
                    </Button>

                    {/* زر الطباعة */}
                    <Button
                      variant="contained"
                      color="primary"
                      startIcon={<PrintIcon sx={{marginLeft:"8px"}} />}
                      onClick={() => handlePrint()}
                      disabled={isClientsLoading || !clientsData?.data?.length}
                      fullWidth={isSmallScreen}
                      sx={{
                        fontWeight: "bold",
                        "&:hover": {
                          backgroundColor: "primary.main",
                        },

                      }}
                    >
                      طباعة
                    </Button>

                    <Button
                      variant="contained"
                      color="error"
                      startIcon={<FileDownloadIcon sx={{marginLeft:"8px"}} />}
                      onClick={handleExportPDF}
                      disabled={isClientsLoading || !clientsData?.data?.length}
                      fullWidth={isSmallScreen}
                      sx={{
                        fontWeight: "bold",
                      }}
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
                      sx={{
                        fontWeight: "bold",
                      }}
                    >
                      تصدير Excel
                    </Button>
                  </Stack>
                )}
              </Box>
            </Box>

          {/* قائمة اختيار الأعمدة */}
<Menu
  anchorEl={anchorEl}
  open={Boolean(anchorEl)}
  onClose={handleColumnMenuClose}
  PaperProps={{
    style: {
      maxHeight: 400,
      width: 500,
    },
  }}
>
  <MenuItem>
    <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
      <Button size="small" onClick={handleSelectAllColumns}>تحديد الكل</Button>
      <Button size="small" onClick={handleDeselectAllColumns}>إلغاء الكل</Button>
    </Box>
  </MenuItem>
  
  {/* تقسيم الأعمدة إلى مجموعات من عمودين */}
  {(() => {
    const menuItems = [];
    for (let i = 0; i < columns.length; i += 2) {
      const firstColumn = columns[i];
      const secondColumn = columns[i + 1];
      
      menuItems.push(
        <MenuItem key={`row-${i}`} sx={{ display: 'flex', justifyContent: 'space-between', gap: 2 }}>
          {/* العمود الأول */}
          <FormControlLabel
            control={
              <Checkbox
                checked={firstColumn.show}
                onChange={() => handleColumnToggle(firstColumn.id)}
                disabled={firstColumn.required}
              />
            }
            label={firstColumn.label}
            sx={{ flex: 1 }}
          />
          
          {/* العمود الثاني (إذا كان موجود) */}
          {secondColumn && (
            <FormControlLabel
              control={
                <Checkbox
                  checked={secondColumn.show}
                  onChange={() => handleColumnToggle(secondColumn.id)}
                  disabled={secondColumn.required}
                />
              }
              label={secondColumn.label}
              sx={{ flex: 1 }}
            />
          )}
        </MenuItem>
      );
    }
    return menuItems;
  })()}
</Menu>

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
                visibleColumns={columns.filter(col => col.show)}
              />
            </Paper>
          </Box>
        </Box>
      </Box>

    </Box>
  );
};

export default ClientCollections;