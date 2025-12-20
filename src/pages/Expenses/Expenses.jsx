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
  IconButton,
} from "@mui/material";
import { Add, PictureAsPdf, FileDownload, Edit, Delete } from "@mui/icons-material";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { getExpenses, deleteExpense } from "./expensesApi";
import { Helmet } from "react-helmet-async";
import {
  StyledTableCell,
  StyledTableRow,
} from "../../components/layouts/tableLayout";
import { usePermissions } from "../../components/Contexts/PermissionsContext";
import AddExpense from "../../components/modals/AddExpense";
import EditExpense from "../../components/modals/EditExpense";
import DeleteModal from "../../components/modals/DeleteModal";
import dayjs from "dayjs";
import "dayjs/locale/ar";
import {
  exportExpensesToExcel,
  exportExpensesToPDF,
} from "../../utilities/expensesExporter";
import { notifySuccess, notifyError } from "../../utilities/toastify";

const Expenses = () => {
  const [page, setPage] = useState(1);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [expenseToDelete, setExpenseToDelete] = useState(null);

  const isMobile = useMediaQuery("(max-width: 480px)");
  const isTablet = useMediaQuery("(max-width: 768px)");
  const isSmallScreen = isMobile || isTablet;

  const { permissions } = usePermissions();
  const queryClient = useQueryClient();
  const canExport = permissions.includes("expenses_Export");

  const { data: expensesData, isLoading } = useQuery({
    queryKey: ["expenses", page],
    queryFn: () => getExpenses(page),
    retry: 1,
  });

  const deleteExpenseMutation = useMutation({
    mutationFn: deleteExpense,
    onSuccess: () => {
      notifySuccess("تم حذف المصروف بنجاح");
      queryClient.invalidateQueries(["expenses"]);
    },
    onError: (error) => {
      notifyError(error.response?.data?.message || "حدث خطأ أثناء حذف المصروف");
    },
  });

  const handleAddExpense = () => {
    setIsAddModalOpen(true);
  };

  const handleEditExpense = (expense) => {
    setSelectedExpense(expense);
    setIsEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setSelectedExpense(null);
  };

  const handleDeleteExpense = (expenseId) => {
    setExpenseToDelete(expenseId);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (expenseToDelete) {
      deleteExpenseMutation.mutate(expenseToDelete);
      setIsDeleteModalOpen(false);
      setExpenseToDelete(null);
    }
  };

  const handleCloseDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setExpenseToDelete(null);
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
    const rows = expensesData?.expenses || [];
    if (!rows.length) {
      notifyError("لا توجد بيانات للتصدير");
      return;
    }
    
    await exportExpensesToPDF(rows);
  };

  const handleExportExcel = async () => {
    const rows = expensesData?.expenses || [];
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
            <StyledTableCell align="center">#</StyledTableCell>
            <StyledTableCell align="center">التاريخ</StyledTableCell>
            <StyledTableCell align="center">النوع</StyledTableCell>
            <StyledTableCell align="center">المبلغ</StyledTableCell>
            <StyledTableCell align="center">الوصف</StyledTableCell>
            <StyledTableCell align="center">الموظف</StyledTableCell>
            <StyledTableCell align="center">الإجراءات</StyledTableCell>
          </StyledTableRow>
        </TableHead>
        <TableBody>
          {isLoading ? (
            <StyledTableRow>
              <StyledTableCell colSpan={7} align="center">
                <CircularProgress size={30} />
              </StyledTableCell>
            </StyledTableRow>
          ) : expensesData?.expenses?.length === 0 ? (
            <StyledTableRow>
              <StyledTableCell colSpan={7} align="center">
                <Typography variant="body2" color="text.secondary" sx={{ py: 3 }}>
                  لا توجد مصروفات
                </Typography>
              </StyledTableCell>
            </StyledTableRow>
          ) : (
            expensesData.expenses.map((expense, index) => (
              <StyledTableRow key={expense.id} hover>
                <StyledTableCell align="center">
                  {(page - 1) * (expensesData?.limit || 10) + index + 1}
                </StyledTableCell>
                <StyledTableCell align="center">
                  {dayjs(expense.createdAt).format("DD/MM/YYYY")}
                </StyledTableCell>
                <StyledTableCell align="center">
                  <Chip
                    label={expense.type}
                    color={expense.type === "مصروف رواتب" ? "primary" : "default"}
                    size="small"
                    variant="outlined"
                  />
                </StyledTableCell>
                <StyledTableCell align="center">
                  <Typography variant="body2" fontWeight="bold" color="primary.main">
                    {expense.amount.toLocaleString('en-US')}
                  </Typography>
                </StyledTableCell>
                <StyledTableCell align="center">
                  <Typography variant="body2">
                    {expense.description || "-"}
                  </Typography>
                </StyledTableCell>
                <StyledTableCell align="center">
                  {expense.employee ? (
                    <Typography variant="body2">
                      {expense.employee.name}
                    </Typography>
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      -
                    </Typography>
                  )}
                </StyledTableCell>
                <StyledTableCell align="center">
                  <Stack direction="row" spacing={1} justifyContent="center">
                    {permissions.includes("expenses_Update") && (
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={() => handleEditExpense(expense)}
                      >
                        <Edit fontSize="small" />
                      </IconButton>
                    )}
                    {permissions.includes("expenses_Delete") && (
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleDeleteExpense(expense.id)}
                        disabled={deleteExpenseMutation.isLoading}
                      >
                        <Delete fontSize="small" />
                      </IconButton>
                    )}
                  </Stack>
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
    <Box sx={{ p: isMobile ? 1 : 2 }}>
      {isLoading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
          <CircularProgress size={30} />
        </Box>
      ) : expensesData?.expenses?.length === 0 ? (
        <Typography variant="body2" color="text.secondary" sx={{ py: 3, textAlign: "center" }}>
          لا توجد مصروفات
        </Typography>
      ) : (
        <Grid container spacing={2}>
          {expensesData.expenses.map((expense, index) => (
            <Grid item xs={12} key={expense.id}>
              <Card
                sx={{
                  border: "1px solid #e0e0e0",
                  borderRadius: 2,
                  boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                }}
              >
                <CardContent>
                  <Stack spacing={1.5}>
                    <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                      <Typography variant="body2" color="text.secondary">#</Typography>
                      <Typography variant="body1" fontWeight="bold">
                        {(page - 1) * (expensesData?.limit || 10) + index + 1}
                      </Typography>
                    </Box>
                    <Divider />
                    
                    <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                      <Typography variant="body2" color="text.secondary">التاريخ</Typography>
                      <Typography variant="body1">
                        {dayjs(expense.createdAt).format("DD/MM/YYYY")}
                      </Typography>
                    </Box>
                    <Divider />
                    
                    <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                      <Typography variant="body2" color="text.secondary">النوع</Typography>
                      <Chip
                        label={expense.type}
                        color={expense.type === "مصروف رواتب" ? "primary" : "default"}
                        size="small"
                        variant="outlined"
                      />
                    </Box>
                    <Divider />
                    
                    <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                      <Typography variant="body2" color="text.secondary">المبلغ</Typography>
                      <Typography variant="body1" fontWeight="bold" color="primary.main">
                        {expense.amount.toLocaleString('en-US')}
                      </Typography>
                    </Box>
                    <Divider />
                    
                    <Box>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                        الوصف:
                      </Typography>
                      <Typography variant="body2">
                        {expense.description || "-"}
                      </Typography>
                    </Box>
                    <Divider />
                    
                    {expense.employee && (
                      <>
                        <Box>
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                            الموظف:
                          </Typography>
                          <Typography variant="body2">
                            {expense.employee.name}
                          </Typography>
                        </Box>
                        <Divider />
                      </>
                    )}
                    
                    <Box>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                        مضافة بواسطة:
                      </Typography>
                      <Typography variant="body2">
                        {expense.addedBy?.name || "-"}
                      </Typography>
                    </Box>
                    
                    {(permissions.includes("expenses_Update") || permissions.includes("expenses_Delete")) && (
                      <>
                        <Divider />
                        <Box sx={{ display: "flex", justifyContent: "center", gap: 1, pt: 1 }}>
                          {permissions.includes("expenses_Update") && (
                            <IconButton
                              size="small"
                              color="primary"
                              onClick={() => handleEditExpense(expense)}
                            >
                              <Edit fontSize="small" />
                            </IconButton>
                          )}
                          {permissions.includes("expenses_Delete") && (
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => handleDeleteExpense(expense.id)}
                              disabled={deleteExpenseMutation.isLoading}
                            >
                              <Delete fontSize="small" />
                            </IconButton>
                          )}
                        </Box>
                      </>
                    )}
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
      <Box sx={{ p: isMobile ? 1 : 3, mt: 3 }}>
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
                  fontWeight: "bold",
                  "&:hover": { bgcolor: "primary.dark" },
                }}
              >
                إضافة مصروفات
              </Button>
            )}
          </Stack>

          {canExport && (
            <Stack direction="row" spacing={1}>
              <Button
                variant="outlined"
                color="error"
                startIcon={<PictureAsPdf />}
                onClick={handleExportPDF}
                disabled={!expensesData?.expenses?.length}
              >
                تصدير PDF
              </Button>
              <Button
                variant="outlined"
                color="success"
                startIcon={<FileDownload />}
                onClick={handleExportExcel}
                disabled={!expensesData?.expenses?.length}
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

      {/* Modals */}
      <AddExpense
        open={isAddModalOpen}
        onClose={handleCloseModal}
        onSuccess={handleSuccess}
        isMobile={isMobile}
      />

      <EditExpense
        open={isEditModalOpen}
        onClose={handleCloseEditModal}
        onSuccess={handleSuccess}
        expense={selectedExpense}
        isMobile={isMobile}
      />

      <DeleteModal
        open={isDeleteModalOpen}
        onClose={handleCloseDeleteModal}
        onConfirm={handleConfirmDelete}
        title="حذف المصروفات"
        message="هل أنت متأكد من حذف هذه المصروفات؟ لا يمكن التراجع عن هذا الإجراء."
        isLoading={deleteExpenseMutation.isLoading}
        ButtonText="حذف المصروفات"
      />
    </>
  );
};

export default Expenses;