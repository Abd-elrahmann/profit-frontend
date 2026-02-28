import React, { useState } from "react";
import {
  Box,
  Paper,
  TablePagination,
  Button,
  Stack as MuiStack,
  useMediaQuery,
} from "@mui/material";
import { PictureAsPdf as PdfIcon, TableChart as ExcelIcon, DeleteSweep } from "@mui/icons-material";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getLogs, getAllLogsForExport, deleteAllLogs } from "./logsApi";
import LogsToolbar from "../../components/modals/LogsToolbar";
import { LogsTable, LogsCards } from "../../components/logs";
import { Helmet } from "react-helmet-async";
import { exportLogsToPDF, exportLogsToExcel } from "../../utilities/logsExporter";
import { notifyError, notifySuccess } from "../../utilities/toastify";
import { usePermissions } from '../../components/Contexts/PermissionsContext';
import { useTheme } from '../../theme/ThemeContext';
import DeleteModal from '../../components/modals/DeleteModal';
const Logs = () => {
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({
    search: "",
    screen: "",
    action: "",
    from: "",
    to: "",
    userName: "",
  });
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const queryClient = useQueryClient();
  const { permissions } = usePermissions();
  const { isDarkMode } = useTheme();
  const isMobile = useMediaQuery("(max-width: 480px)");
  const isTablet = useMediaQuery("(max-width: 768px)");
  const isSmallScreen = isMobile || isTablet;
  const { data: logsData, isLoading } = useQuery({
    queryKey: ["allLogs", page, filters],
    queryFn: () => getLogs(page, filters),
  });
  const deleteAllMutation = useMutation({
    mutationFn: deleteAllLogs,
    onSuccess: (data) => {
      queryClient.invalidateQueries(["allLogs"]);
      setDeleteModalOpen(false);
      notifySuccess(data.message || "تم حذف جميع السجلات بنجاح");
    },
    onError: () => {
      notifyError("حدث خطأ أثناء حذف السجلات");
    },
  });
  const handleExportPDF = async () => {
    try {
      notifySuccess("جاري جلب جميع السجلات...");
      const allLogs = await getAllLogsForExport(filters);
      if (!allLogs || allLogs.length === 0) {
        notifyError("لا توجد بيانات للتصدير");
        return;
      }
      await exportLogsToPDF(allLogs, filters);
      notifySuccess(`تم تصدير ${allLogs.length} سجل إلى PDF بنجاح`);
    } catch (error) {
      notifyError("حدث خطأ أثناء تصدير PDF");
      console.error('PDF export error:', error);
    }
  };
  const handleExportExcel = async () => {
    try {
      notifySuccess("جاري جلب جميع السجلات...");
      const allLogs = await getAllLogsForExport(filters);
      if (!allLogs || allLogs.length === 0) {
        notifyError("لا توجد بيانات للتصدير");
        return;
      }
      await exportLogsToExcel(allLogs, filters);
      notifySuccess(`تم تصدير ${allLogs.length} سجل إلى Excel بنجاح`);
    } catch (error) {
      notifyError("حدث خطأ أثناء تصدير Excel");
      console.error('Excel export error:', error);
    }
  };
  const handleFilterChange = (filterName, value) => {
    setFilters(prev => ({ ...prev, [filterName]: value }));
    setPage(1);
  };
  const handleResetFilters = () => {
    setFilters({
      search: "",
      screen: "",
      action: "",
      from: "",
      to: "",
      userName: "",
    });
    setPage(1);
  };
  const handleChangePage = (event, newPage) => {
    setPage(newPage + 1);
  };
  return (
    <Box sx={{ minHeight: "100vh", display: "flex", flexDirection: "column", maxWidth: '100%', overflowX: 'hidden' }}>
      <Helmet>
        <title>سجلات النشاطات</title>
        <meta name="description" content="سجلات النشاطات" />
      </Helmet>
      <Box sx={{ p: { xs: 2, sm: 2.5, md: 3 }, maxWidth: '100%', overflowX: 'hidden' }}>
        <LogsToolbar
          filters={filters}
          onFilterChange={handleFilterChange}
          onResetFilters={handleResetFilters}
          isMobile={isSmallScreen}
          exportButtons={
            <MuiStack direction={isSmallScreen ? "column" : "row"} spacing={1} sx={{ width: isSmallScreen ? '100%' : 'auto' }}>
              {permissions.includes("logs_Export") && (
                <>
                  <Button
                    variant="outlined"
                    startIcon={<PdfIcon sx={{ marginLeft: "10px" }} />}
                    onClick={handleExportPDF}
                    disabled={!logsData?.data || logsData.data.length === 0}
                    sx={{
                      borderColor: "#d32f2f",
                      color: "#d32f2f",
                      "&:hover": { bgcolor: "rgba(211, 47, 47, 0.1)" },
                      borderRadius: 2,
                      px: 2,
                      py: isSmallScreen ? 1.5 : 1,
                      fontWeight: "bold",
                    }}
                  >
                    PDF
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<ExcelIcon sx={{ marginLeft: "10px" }} />}
                    onClick={handleExportExcel}
                    disabled={!logsData?.data || logsData.data.length === 0}
                    sx={{
                      borderColor: "#2e7d32",
                      color: "#2e7d32",
                      "&:hover": { bgcolor: "rgba(46, 125, 50, 0.1)" },
                      borderRadius: 2,
                      px: 2,
                      py: isSmallScreen ? 1.5 : 1,
                      fontWeight: "bold",
                    }}
                  >
                    Excel
                  </Button>
                </>
              )}
              {permissions.includes("logs_Delete") && (
                <Button
                  variant="contained"
                  color="error"
                  startIcon={<DeleteSweep sx={{ marginLeft: "10px" }} />}
                  onClick={() => setDeleteModalOpen(true)}
                  disabled={!logsData?.data || logsData.data.length === 0}
                  sx={{
                    borderRadius: 2,
                    px: 2,
                    py: isSmallScreen ? 1.5 : 1,
                    fontWeight: "bold",
                  }}
                >
                  حذف جميع السجلات
                </Button>
              )}
            </MuiStack>
          }
        />
        <Paper sx={{ width: "100%", maxWidth: '100%', overflow: "hidden", borderRadius: 2, minHeight: 400 }}>
          {isSmallScreen ? (
            <LogsCards
              logsData={logsData?.data}
              isLoading={isLoading}
              isMobile={isMobile}
            />
          ) : (
            <LogsTable
              logsData={logsData?.data}
              isLoading={isLoading}
              isDarkMode={isDarkMode}
            />
          )}
          {logsData && (
            <TablePagination
              component="div"
              count={logsData.total || 0}
              page={page - 1}
              onPageChange={handleChangePage}
              rowsPerPage={10}
              rowsPerPageOptions={[10]}
              labelDisplayedRows={({ from, to, count }) => `عرض ${from}-${to} من ${count}`}
              labelRowsPerPage="صفوف لكل صفحة:"
              sx={{
                '& .MuiTablePagination-toolbar': {
                  flexDirection: isMobile ? 'column' : 'row',
                  gap: isMobile ? 1 : 0,
                  padding: isMobile ? 1 : 2
                },
                '& .MuiTablePagination-spacer': {
                  display: isMobile ? 'none' : 'block'
                }
              }}
            />
          )}
        </Paper>
      </Box>
      <DeleteModal
        open={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={() => deleteAllMutation.mutate()}
        title="حذف جميع السجلات"
        message="هل أنت متأكد من حذف جميع سجلات النشاطات؟ هذا الإجراء لا يمكن التراجع عنه."
        isLoading={deleteAllMutation.isPending}
        ButtonText="حذف الكل"
      />
    </Box>
  );
};
export default Logs;