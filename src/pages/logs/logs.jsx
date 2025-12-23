import React, { useState } from "react";
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableContainer,
  TableHead,
  TablePagination,
  Chip,
  Typography,
  CircularProgress,
  useMediaQuery,
  Card,
  CardContent,
  Stack,
  Divider,
  Grid,
  Button,
  Stack as MuiStack
} from "@mui/material";
import { PictureAsPdf as PdfIcon, TableChart as ExcelIcon } from "@mui/icons-material";
import { useQuery } from "@tanstack/react-query";
import { getLogs, getAllLogsForExport } from "./logsApi";
import { StyledTableCell, StyledTableRow } from "../../components/layouts/tableLayout";
import dayjs from "dayjs";
import "dayjs/locale/ar";
import LogsToolbar from "../../components/modals/LogsToolbar";
import { Helmet } from "react-helmet-async";
import { exportLogsToPDF, exportLogsToExcel } from "../../utilities/logsExporter";
import { notifyError, notifySuccess } from "../../utilities/toastify";
import { usePermissions } from '../../components/Contexts/PermissionsContext';

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

  const { permissions } = usePermissions();

  const isMobile = useMediaQuery("(max-width: 480px)");
  const isTablet = useMediaQuery("(max-width: 768px)");
  const isSmallScreen = isMobile || isTablet;

  const { data: logsData, isLoading } = useQuery({
    queryKey: ["allLogs", page, filters],
    queryFn: () => getLogs(page, filters),
  });

  const formatArabicDate = (date) => {
    return dayjs(date)
      .locale("ar")
      .format("D [من] MMMM [الساعة] h:mm") // format without A
      + " " 
      + (dayjs(date).hour() < 12 ? "صباحًا" : "مساءً");
  };
  
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
    setFilters(prev => ({
      ...prev,
      [filterName]: value
    }));
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

  // Action type Arabic translations
  const getActionText = (action) => {
    switch (action) {
      case "CREATE":
        return "إنشاء";
      case "UPDATE":
        return "تعديل";
      case "DELETE":
        return "حذف";
      case "VIEW":
        return "عرض";
      case "POST":
        return "اعتماد";
      case "UNPOST":
        return "إلغاء الاعتماد";
      case "login":
        return "تسجيل دخول";
      case "logout":
        return "تسجيل خروج";
      default:
        return action;
    }
  };

  const getActionColor = (action) => {
    switch (action) {
      case "CREATE":
        return "success";
      case "UPDATE":
        return "warning";
      case "DELETE":
        return "error";
      case "VIEW":
        return "info";
      case "POST":
        return "success";
      case "UNPOST":
        return "error";
      case "login":
        return "primary";
      case "logout":
        return "secondary";
      default:
        return "default";
    }
  };

  // Screen Arabic translations
  const getScreenText = (screen) => {
    const screenTranslations = {
      "Auth": "المصادقة",
      "Bank Accounts": "الحسابات البنكية",
      "Banks": "البنوك",
      "Clients": "العملاء",
      "Dashboard": "لوحة التحكم",
      "Journals": "القيود اليومية",
      "Journal Entries": "القيود اليومية",
      "Loans": "السلف",
      "Partners": "المستثمرين",
      "Investors": "المستثمرين",
      "Repayments": "الأقساط",
      "Installments": "الدفعات",
      "Roles": "الأدوار",
      "Templates": "القوالب",
      "Contract Templates": "القوالب العقدية",
      "Messages Templates": "قوالب الرسائل",
      "Users": "المستخدمين",
      "Employees": "الموظفين",
      "Profile": "الملف الشخصي",
      "General Ledger": "دفتر الأستاذ العام",
      "Period": "تقفيل الفترات",
      "Profit Distribution": "توزيع الأرباح",
      "Treasury": "الصندوق",
      "Logs": "السجلات",
      "Company Profit": "أرباح الشركة",
      "Distribution": "توزيع الأرباح",
      "PartnerWithdrawals": "سحب الشركاء",
      "Small Loans": "السلف الصغيرة",
      "Expenses": "المصروفات",
    };
    return screenTranslations[screen] || screen;
  };

  // Render table for large screens
  // Render table for large screens
  const renderTable = () => (
    <TableContainer>
      <Table stickyHeader>
        <TableHead sx={{ bgcolor: "#F3F4F6" }}>
          <StyledTableRow>
            <StyledTableCell align="center" sx={{ fontWeight: "bold" }}>
              المستخدم
            </StyledTableCell>
            <StyledTableCell align="center" sx={{ fontWeight: "bold" }}>
              الشاشة
            </StyledTableCell>
            <StyledTableCell align="center" sx={{ fontWeight: "bold" }}>
              الإجراء
            </StyledTableCell>
            <StyledTableCell align="center" sx={{ fontWeight: "bold" }}>
              الوصف
            </StyledTableCell>
            <StyledTableCell align="center" sx={{ fontWeight: "bold" }}>
              التاريخ والوقت
            </StyledTableCell>
          </StyledTableRow>
        </TableHead>
        <TableBody>
          {isLoading ? (
            <StyledTableRow>
              <StyledTableCell colSpan={5} align="center">
                <CircularProgress size={20} />
              </StyledTableCell>
            </StyledTableRow>
          ) : logsData?.data?.length === 0 ? (
            <StyledTableRow>
              <StyledTableCell colSpan={5} align="center">
                <Typography>
                  لا توجد سجلات أنشطة
                </Typography>
              </StyledTableCell>
            </StyledTableRow>
          ) : (
            logsData?.data?.map((log) => (
              <StyledTableRow key={log.id} hover>
                <StyledTableCell align="center" sx={{ whiteSpace: "nowrap", fontWeight: "bold" }}>
                  {log.user.name}
                </StyledTableCell>
                <StyledTableCell align="center" sx={{ whiteSpace: "nowrap" }}>
                  {getScreenText(log.screen)}
                </StyledTableCell>
                <StyledTableCell align="center" sx={{ whiteSpace: "nowrap" }}>
                  <Chip
                    label={getActionText(log.action)}
                    color={getActionColor(log.action)}
                    size="small"
                  />
                </StyledTableCell>
                <StyledTableCell align="center" style={{ wordWrap: "break-word", maxWidth: "170px" }}>
                  <Typography variant="body2">
                    {log.description}
                  </Typography>
                </StyledTableCell>
                <StyledTableCell align="center" sx={{ whiteSpace: "nowrap" }}>
                  {formatArabicDate(log.createdAt)}
                </StyledTableCell>
              </StyledTableRow>
            ))
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );

  // Render cards for small screens
  const renderCards = () => (
    <Box sx={{ p: isMobile ? 1 : 2 }}>
      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress size={30} />
        </Box>
      ) : logsData?.data?.length === 0 ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <Typography variant="h6" color="textSecondary">
            لا توجد سجلات أنشطة
          </Typography>
        </Box>
      ) : (
        <Grid container spacing={2}>
          {logsData?.data?.map((log) => (
            <Grid item xs={12} key={log.id}>
              <Card 
                sx={{ 
                  border: '1px solid #e0e0e0',
                  borderRadius: 2,
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                  '&:hover': {
                    boxShadow: '0 4px 8px rgba(0,0,0,0.15)',
                  }
                }}
              >
                <CardContent sx={{ p: isMobile ? 2 : 3 }}>
                  <Stack spacing={2}>
                    {/* Header Row - User and Action */}
                    <Box sx={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'flex-start',
                      flexDirection: isMobile ? 'column' : 'row',
                      gap: 1
                    }}>
                      <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                        {log.user.name}
                      </Typography>
                      <Chip
                        label={getActionText(log.action)}
                        color={getActionColor(log.action)}
                        size={isMobile ? "small" : "medium"}
                      />
                    </Box>

                    <Divider />

                    {/* Screen and Date Row */}
                    <Box sx={{ 
                      display: 'flex', 
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      flexDirection: isMobile ? 'column' : 'row',
                      gap: 1
                    }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="body2" color="textSecondary">
                          الشاشة:
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                          {getScreenText(log.screen)}
                        </Typography>
                      </Box>
                      <Typography 
                        variant="body2" 
                        color="textSecondary"
                        sx={{ 
                          fontSize: isMobile ? '0.75rem' : '0.875rem',
                          direction: 'ltr',
                          display: 'inline-block'
                        }}
                      >
                        {formatArabicDate(log.createdAt)}
                      </Typography>
                    </Box>

                    {/* Description */}
                    <Box>
                      <Typography 
                        variant="body2" 
                        color="textSecondary" 
                        sx={{ mb: 1 }}
                      >
                        الوصف:
                      </Typography>
                      <Paper 
                        variant="outlined" 
                        sx={{ 
                          p: 2, 
                          bgcolor: '#fafafa',
                          borderRadius: 1,
                          border: '1px solid #e0e0e0'
                        }}
                      >
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            lineHeight: 1.6,
                            textAlign: 'right'
                          }}
                        >
                          {log.description}
                        </Typography>
                      </Paper>
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

  return (
    <Box sx={{ bgcolor: "#FFFFFF", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <Helmet>
        <title>سجلات النشاطات</title>
        <meta name="description" content="سجلات النشاطات" />
      </Helmet>
      
      {/* Main Content */}
      <Box sx={{ p: isMobile ? 2 : 5 }}>
        {/* Export Buttons */}
        {permissions.includes("logs_Export") && (
          <Box sx={{ mb: 2, display: 'flex', justifyContent: 'flex-end' }}>
            <MuiStack direction="row" spacing={1}>
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
                  fontWeight: "bold",
                }}
              >
                Excel
              </Button>
            </MuiStack>
          </Box>
        )}

        {/* Logs Toolbar */}
        <LogsToolbar
          filters={filters}
          onFilterChange={handleFilterChange}
          onResetFilters={handleResetFilters}
          isMobile={isMobile}
        />

        {/* Table for large screens, Cards for small screens */}
        <Paper sx={{ 
          width: "100%", 
          overflow: "hidden", 
          borderRadius: 2,
          minHeight: 400
        }}>
          {isSmallScreen ? renderCards() : renderTable()}

          {/* Pagination */}
          {logsData && (
            <TablePagination
              component="div"
              count={logsData.total || 0}
              page={page - 1}
              onPageChange={handleChangePage}
              rowsPerPage={10}
              rowsPerPageOptions={[10]}
              labelDisplayedRows={({ from, to, count }) =>
                `عرض ${from}-${to} من ${count}`
              }
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
    </Box>
  );
};

export default Logs;