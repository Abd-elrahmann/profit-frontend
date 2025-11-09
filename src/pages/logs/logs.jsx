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
} from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { getLogs } from "./LogsApi";
import { StyledTableCell, StyledTableRow } from "../../components/layouts/tableLayout";
import dayjs from "dayjs";
import LogsToolbar from "../../components/modals/LogsToolbar";
import { Helmet } from "react-helmet-async";
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
  const { data: logsData, isLoading } = useQuery({
    queryKey: ["allLogs", page, filters],
    queryFn: () => getLogs(page, filters),
  });

  const handleFilterChange = (filterName, value) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: value
    }));
    setPage(1); // Reset to first page when filters change
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
      "Clients": "العملاء",
      "Journals": "القيود اليومية",
      "Loans": "السلف",
      "Partners": "المستثمرين",
      "Repayments": "الأقساط",
      "Roles": "الأدوار",
      "Templates": "القوالب",
      "Users": "المستخدمين",
    };
    return screenTranslations[screen] || screen;
  };

  return (
    <Box sx={{ bgcolor: "#FFFFFF", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <Helmet>
        <title>سجلات النشاطات</title>
        <meta name="description" content="سجلات النشاطات" />
      </Helmet>
      {/* Main Content */}
      <Box sx={{ p: 5 }}>

        {/* Logs Toolbar */}
        <LogsToolbar
          filters={filters}
          onFilterChange={handleFilterChange}
          onResetFilters={handleResetFilters}
        />

        {/* Table */}
        <Paper sx={{ width: "100%", overflow: "hidden", borderRadius: 2 }}>
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
                      <StyledTableCell align="center" sx={{ whiteSpace: "nowrap",fontWeight: "bold" }}>
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
                        {dayjs(log.createdAt).format("DD/MM/YYYY HH:mm a")}
                      </StyledTableCell>
                    </StyledTableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>

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
            />
          )}
        </Paper>
      </Box>
    </Box>
  );
};

export default Logs;