import React, { useState } from "react";
import {
  Box,
  Typography,
  Button,
  Table,
  TableBody,
  TableContainer,
  TableHead,
  TablePagination,
  CircularProgress,
  Chip,
  useMediaQuery,
  Card,
  CardContent,
  Grid,
  Divider,
  Stack,
} from "@mui/material";
import { Add, PictureAsPdf, FileDownload } from "@mui/icons-material";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getExpenses } from "./expensesApi";
import { Helmet } from "react-helmet-async";
import {
  StyledTableCell,
  StyledTableRow,
} from "../../components/layouts/tableLayout";
import { usePermissions } from "../../components/Contexts/PermissionsContext";
import AddExpense from "../../components/modals/AddExpense";
import dayjs from "dayjs";
import "dayjs/locale/ar";
import {
  exportExpensesToExcel,
  exportExpensesToPDF,
} from "../../utilities/expensesExporter";
import { notifyError } from "../../utilities/toastify";

const Expenses = () => {
  const [page, setPage] = useState(1);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const isMobile = useMediaQuery("(max-width: 480px)");
  const isTablet = useMediaQuery("(max-width: 768px)");
  const isSmallScreen = isMobile || isTablet;

  const { permissions } = usePermissions();
  const queryClient = useQueryClient();
  const canExport =
    permissions.includes("expenses_Export");

  const { data: expensesData, isLoading } = useQuery({
    queryKey: ["expenses", page],
    queryFn: () => getExpenses(page),
    retry: 1,
  });

  const handleAddExpense = () => {
    setIsAddModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsAddModalOpen(false);
  };

  const handleSuccess = () => {
    queryClient.invalidateQueries(["expenses"]);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage + 1);
  };

  const handleExportPDF = async () => {
    const rows = expensesData?.journals || [];
    if (!rows.length) {
      notifyError("لا توجد بيانات للتصدير");
      return;
    }
    await exportExpensesToPDF(rows);
  };

  const handleExportExcel = async () => {
    const rows = expensesData?.journals || [];
    if (!rows.length) {
      notifyError("لا توجد بيانات للتصدير");
      return;
    }
    await exportExpensesToExcel(rows);
  };

  // Render table for large screens
  const renderTable = () => (
    <TableContainer sx={{ maxHeight: 600, borderRadius: 2 }}>
      <Table stickyHeader>
        <TableHead>
          <StyledTableRow>
            <StyledTableCell
              align="center"
              sx={{ fontWeight: "bold", backgroundColor: "#f8f9fa" }}
            >
              #
            </StyledTableCell>
            <StyledTableCell
              align="center"
              sx={{ fontWeight: "bold", backgroundColor: "#f8f9fa" }}
            >
              التاريخ
            </StyledTableCell>
            <StyledTableCell
              align="center"
              sx={{ fontWeight: "bold", backgroundColor: "#f8f9fa" }}
            >
              المبلغ
            </StyledTableCell>
            <StyledTableCell
              align="center"
              sx={{ fontWeight: "bold", backgroundColor: "#f8f9fa" }}
            >
              الوصف
            </StyledTableCell>
            <StyledTableCell
              align="center"
              sx={{ fontWeight: "bold", backgroundColor: "#f8f9fa" }}
            >
              الحالة
            </StyledTableCell>
          </StyledTableRow>
        </TableHead>
        <TableBody>
          {isLoading ? (
            <StyledTableRow>
              <StyledTableCell colSpan={5} align="center">
                <CircularProgress size={30} />
              </StyledTableCell>
            </StyledTableRow>
          ) : expensesData?.journals?.length === 0 ? (
            <StyledTableRow>
              <StyledTableCell colSpan={5} align="center">
                <Typography variant="body2" color="text.secondary" sx={{ py: 3 }}>
                  لا توجد مصروفات
                </Typography>
              </StyledTableCell>
            </StyledTableRow>
          ) : (
            expensesData?.journals?.map((journal, index) => (
              <StyledTableRow key={journal.id} hover>
                <StyledTableCell align="center">
                  {(page - 1) * (expensesData?.limit || 10) + index + 1}
                </StyledTableCell>
                <StyledTableCell align="center">
                  {journal.date
                    ? dayjs(journal.date).locale("ar").format("YYYY-MM-DD")
                    : "-"}
                </StyledTableCell>
                <StyledTableCell align="center">
                  {journal.debit
                    ? journal.debit.toLocaleString({
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })
                    : "-"}
                </StyledTableCell>
                <StyledTableCell align="center">
                  {journal.description || "-"}
                </StyledTableCell>
                <StyledTableCell align="center">
                  <Chip
                    label={journal.status === "POSTED" ? "مقيد" : "مسودة"}
                    color={journal.status === "POSTED" ? "success" : "default"}
                    size="small"
                  />
                </StyledTableCell>
              </StyledTableRow>
            ))
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );

  // Render cards for mobile screens
  const renderCards = () => (
    <Box sx={{ p: isMobile ? 1 : 2}}>
      {isLoading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
          <CircularProgress size={30} />
        </Box>
      ) : expensesData?.journals?.length === 0 ? (
        <Typography variant="body2" color="black" sx={{ py: 3, textAlign: "center" }}>
          لا توجد مصروفات
        </Typography>
      ) : (
        <Grid container spacing={2}>
          {expensesData?.journals?.map((journal, index) => (
            <Grid item xs={12} key={journal.id} sx={{width: "500px"}}>
              <Card
                sx={{
                  border: "1px solid #e0e0e0",
                  borderRadius: 2,
                  boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                }}
              >
                <CardContent>
                  <Stack spacing={1.5}>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                      }}
                    >
                      <Typography variant="body2" color="text.secondary">
                        #
                      </Typography>
                      <Typography variant="body1" fontWeight="bold">
                        {(page - 1) * (expensesData?.limit || 10) + index + 1}
                      </Typography>
                    </Box>
                    <Divider />
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                      }}
                    >
                      <Typography variant="body2" color="text.secondary">
                        التاريخ
                      </Typography>
                      <Typography variant="body1">
                        {journal.date
                          ? dayjs(journal.date).locale("ar").format("YYYY-MM-DD")
                          : "-"}
                      </Typography>
                    </Box>
                    <Divider />
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                      }}
                    >
                      <Typography variant="body2" color="text.secondary">
                        المبلغ
                      </Typography>
                      <Typography variant="body1" fontWeight="bold" color="primary.main">
                        {journal.debit
                          ? journal.debit.toLocaleString({
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })
                          : "-"}
                      </Typography>
                    </Box>
                    <Divider />
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                      }}
                    >
                      <Typography variant="body2" color="text.secondary">
                        الوصف
                      </Typography>
                      <Typography variant="body1">
                        {journal.description || "-"}
                      </Typography>
                    </Box>
                    <Divider />
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <Typography variant="body2" color="text.secondary">
                        الحالة
                      </Typography>
                      <Chip
                        label={journal.status === "POSTED" ? "مقيد" : "مسودة"}
                        color={journal.status === "POSTED" ? "success" : "default"}
                        size="small"
                      />
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
    <>
      <Helmet>
        <title>المصروفات - نظام إدارة السلف</title>
      </Helmet>
      <Box sx={{ p: isMobile ? 1 : 3,mt:3 }}>
        {/* Header */}
        <Box
          sx={{
            display: "flex",
            justifyContent: isMobile ? "center" : "space-between",
            alignItems: "center",
            mb: 3,
            flexDirection: isMobile ? "column" : "row",
            gap: 2,
            width: "100%",
          }}
        >
          <Stack direction="row" spacing={1}>
            {permissions.includes("expenses_Add") && (
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={handleAddExpense}
                sx={{
                  bgcolor: "primary.main",
                  "&:hover": { bgcolor: "primary.dark" },
                }}
              >
                إضافة مصروف
              </Button>
            )}
          </Stack>

          {canExport && (
            <Stack direction="row" spacing={1}>
              <Button
                variant="outlined"
                color="error"
                startIcon={<PictureAsPdf sx={{ marginLeft: "10px" }} />}
                onClick={handleExportPDF}
              >
                تصدير PDF
              </Button>
              <Button
                variant="outlined"
                color="success"
                startIcon={<FileDownload sx={{ marginLeft: "10px" }} />}
                onClick={handleExportExcel}
              >
                تصدير Excel
              </Button>
            </Stack>
          )}
        </Box>

        {/* Table or Cards */}
        {isSmallScreen ? renderCards() : renderTable()}

        {/* Pagination */}
        {expensesData && expensesData.total > 0 && (
          <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
            <TablePagination
              component="div"
              count={expensesData.total || 0}
              page={page - 1}
              onPageChange={handleChangePage}
              rowsPerPage={expensesData.limit || 10}
              rowsPerPageOptions={[]}
              labelRowsPerPage=""
              labelDisplayedRows={({ from, to, count }) =>
                `${from}-${to} من ${count}`
              }
              sx={{
                "& .MuiTablePagination-toolbar": {
                  paddingRight: 0,
                },
              }}
            />
          </Box>
        )}
      </Box>

      {/* Add Expense Modal */}
      <AddExpense
        open={isAddModalOpen}
        onClose={handleCloseModal}
        onSuccess={handleSuccess}
        isMobile={isMobile}
      />
    </>
  );
};

export default Expenses;

