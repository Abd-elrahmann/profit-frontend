// LogsTable.jsx - مودال سجلات الأنشطة
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
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Card,
  CardContent,
  Stack,
  Divider,
  Grid,
} from "@mui/material";
import { Close as CloseIcon } from "@mui/icons-material";
import { useQuery } from "@tanstack/react-query";
import { getLogs } from "../../pages/Logs/LogsApi";
import { StyledTableCell, StyledTableRow } from "../layouts/tableLayout";
import dayjs from "dayjs";

const LogsTable = ({ open, onClose, userId, userName, isMobile = false }) => {
  const [page, setPage] = useState(1);

  const { data: logsData, isLoading } = useQuery({
    queryKey: ["logs", page, userId],
    queryFn: () => getLogs(page, { 
      userId: userId || undefined, 
    }),
    enabled: open,
  });

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
        case "POST":
        return "اعتماد";
      case "VIEW":
        return "عرض";
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
      "Clients": "العملاء",
      "Journals": "القيود",
      "Loans": "السلف",
      "Partners": "الشركاء",
      "Repayments": "الأقساط",
      "Roles": "الأدوار",
      "Templates": "القوالب",
      "Users": "المستخدمين",
    };
    return screenTranslations[screen] || screen;
  };

  // Render table for large screens
  const renderTable = () => (
    <TableContainer sx={{ height: "100%", width: "100%" }}>
      <Table stickyHeader sx={{ width: "100%" }}>
        <TableHead>
          <StyledTableRow>
            <StyledTableCell align="center" sx={{ whiteSpace: "nowrap" }}>
              المستخدم
            </StyledTableCell>
            <StyledTableCell align="center" sx={{ whiteSpace: "nowrap" }}>
              الشاشة
            </StyledTableCell>
            <StyledTableCell align="center" sx={{ whiteSpace: "nowrap" }}>
              الإجراء
            </StyledTableCell>
            <StyledTableCell align="center" sx={{ whiteSpace: "nowrap" }}>
              الوصف
            </StyledTableCell>
            <StyledTableCell align="center" sx={{ whiteSpace: "nowrap" }}>
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
                  {"لا توجد سجلات أنشطة"}
                </Typography>
              </StyledTableCell>
            </StyledTableRow>
          ) : (
            logsData?.data?.map((log) => (
              <StyledTableRow key={log.id} hover>
                <StyledTableCell align="center" sx={{ whiteSpace: "nowrap" }}>
                  <Box>
                    <Typography variant="body2" fontWeight="bold">
                      {log.user?.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {log.user?.email}
                    </Typography>
                  </Box>
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
                <StyledTableCell align="center">
                  <Typography variant="body2">
                    {log.description}
                  </Typography>
                </StyledTableCell>
                <StyledTableCell align="center" sx={{ whiteSpace: "nowrap" }}>
                  {dayjs(log.createdAt).format("DD/MM/YYYY HH:mm")}
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
    <Box sx={{ p: 1 }}>
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
              <Card sx={{ border: '1px solid #e0e0e0', borderRadius: 2 }}>
                <CardContent sx={{ p: 2 }}>
                  <Stack spacing={2}>
                    {/* Header - User Info */}
                    <Box>
                      <Typography variant="subtitle1" fontWeight="bold">
                        {log.user?.name}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        {log.user?.email}
                      </Typography>
                    </Box>

                    <Divider />

                    {/* Action and Screen */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Chip
                        label={getActionText(log.action)}
                        color={getActionColor(log.action)}
                        size="small"
                      />
                      <Typography variant="body2">
                        {getScreenText(log.screen)}
                      </Typography>
                    </Box>

                    {/* Description */}
                    <Box>
                      <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
                        الوصف:
                      </Typography>
                      <Typography variant="body2">
                        {log.description}
                      </Typography>
                    </Box>

                    {/* Date */}
                    <Typography variant="caption" color="textSecondary" align="center">
                      {dayjs(log.createdAt).format("DD/MM/YYYY HH:mm")}
                    </Typography>
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
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth={isMobile ? "xs" : "lg"}
      fullWidth
      fullScreen={isMobile}
      sx={{
        "& .MuiDialog-paper": {
          height: isMobile ? "100vh" : "80vh",
        },
      }}
    >
      <DialogTitle sx={{ 
        position: 'sticky', 
        top: 0, 
        bgcolor: 'background.paper', 
        zIndex: 1,
        borderBottom: '1px solid',
        borderColor: 'divider'
      }}>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Typography variant="h6" fontWeight="bold">
            سجل الأنشطة {userName && `- ${userName}`}
          </Typography>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      
      <DialogContent sx={{ p: 0 }}>
        <Box sx={{ display: "flex", flexDirection: "column", width: "100%", height: "100%" }}>
          {/* Table or Cards */}
          <Paper sx={{ flex: 1, width: "100%", overflow: "hidden", borderRadius: 0 }}>
            {isMobile ? renderCards() : renderTable()}
          </Paper>

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
                borderTop: '1px solid',
                borderColor: 'divider',
                '& .MuiTablePagination-toolbar': {
                  flexDirection: isMobile ? 'column' : 'row',
                  gap: isMobile ? 1 : 0,
                  padding: isMobile ? 1 : 2
                },
              }}
            />
          )}
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default LogsTable;