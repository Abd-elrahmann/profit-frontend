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
import { Add, PictureAsPdf, FileDownload, Edit, Delete, MoreVert } from "@mui/icons-material";
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
  const canExport =
    permissions.includes("expenses_Export");

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

  const handleDeleteExpense = (journalId) => {
    setExpenseToDelete(journalId);
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
    const rows = expensesData?.journals || [];
    if (!rows.length) {
      notifyError("لا توجد بيانات للتصدير");
      return;
    }
    
    // تحويل البيانات إلى الشكل المتوقع من قبل exporter
    const formattedData = rows.map(journal => {
      const totalAmount = journal.lines?.reduce((sum, line) => 
        sum + (line.debit || line.amount || 0), 0) || 0;
      
      return {
        date: journal.date,
        amount: totalAmount,
        description: journal.description || 'صرف مصروفات متعددة الأنواع',
        status: journal.status,
        // إضافة تفاصيل المصروفات للمساعدة في التصدير
        lines: journal.lines?.filter(line => line.debit > 0) || []
      };
    });
    
    await exportExpensesToPDF(formattedData);
  };

  const handleExportExcel = async () => {
    const rows = expensesData?.journals || [];
    if (!rows.length) {
      notifyError("لا توجد بيانات للتصدير");
      return;
    }
    
    // تحويل البيانات إلى الشكل المتوقع من قبل exporter
    const formattedData = rows.map(journal => {
      const totalAmount = journal.lines?.reduce((sum, line) => 
        sum + (line.debit || line.amount || 0), 0) || 0;
      
      return {
        date: journal.date,
        amount: totalAmount,
        description: journal.description || 'صرف مصروفات متعددة الأنواع',
        status: journal.status,
        lines: journal.lines?.filter(line => line.debit > 0) || []
      };
    });
    
    await exportExpensesToExcel(formattedData);
  };

  // حساب إجمالي المبلغ من journal lines
  const calculateTotalAmount = (journal) => {
    if (!journal.lines) return 0;
    return journal.lines.reduce((sum, line) => sum + (line.debit || line.amount || 0), 0);
  };

  // Render table for large screens
  const renderTable = () => (
    <TableContainer sx={{ maxHeight: 600, borderRadius: 2 }}>
      <Table stickyHeader>
        <TableHead>
          <StyledTableRow>
            <StyledTableCell
              align="center"
            >
              #
            </StyledTableCell>
            <StyledTableCell
              align="center"
            >
              التاريخ
            </StyledTableCell>
            <StyledTableCell
              align="center"
            >
              المبلغ الإجمالي
            </StyledTableCell>
            <StyledTableCell
              align="center"
            >
              تفاصيل المصروفات
            </StyledTableCell>
            <StyledTableCell
              align="center"
            >
              الحالة
            </StyledTableCell>
            <StyledTableCell
              align="center"
            >
              الإجراءات
            </StyledTableCell>
          </StyledTableRow>
        </TableHead>
        <TableBody>
          {isLoading ? (
            <StyledTableRow>
              <StyledTableCell colSpan={6} align="center">
                <CircularProgress size={30} />
              </StyledTableCell>
            </StyledTableRow>
          ) : expensesData?.journals?.length === 0 ? (
            <StyledTableRow>
              <StyledTableCell colSpan={6} align="center">
                <Typography variant="body2" color="text.secondary" sx={{ py: 3 }}>
                  لا توجد مصروفات
                </Typography>
              </StyledTableCell>
            </StyledTableRow>
          ) : (
            expensesData?.journals?.map((journal, index) => {
              const expenseLines = journal.lines?.filter(line => line.debit > 0) || [];
              const totalAmount = calculateTotalAmount(journal);
              
              return (
                <StyledTableRow key={journal.journalId} hover>
                  <StyledTableCell align="center">
                    {(page - 1) * (expensesData?.limit || 10) + index + 1}
                  </StyledTableCell>
                  <StyledTableCell align="center">
                    {journal.date
                      ? dayjs(journal.date).format("DD/MM/YYYY")
                      : "-"}
                  </StyledTableCell>
                  <StyledTableCell align="center">
                    {totalAmount.toLocaleString('en-US')}
                  </StyledTableCell>
                  <StyledTableCell align="center">
                    <Box sx={{ textAlign: "center" }}>
                      {expenseLines.length > 0 ? (
                        expenseLines.map((line, idx) => (
                          <Box key={idx} sx={{ mb: 0.5 }}>
                            <Typography variant="body2">
                              {line.type || line.description}: 
                              <Typography 
                                component="span" 
                                variant="body2" 
                                sx={{ fontWeight: "bold", mx: 1 }}
                              >
                                {line.debit?.toLocaleString('en-US',)}
                              </Typography>
                            </Typography>
                          </Box>
                        ))
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          {journal.description || "-"}
                        </Typography>
                      )}
                    </Box>
                  </StyledTableCell>
                  <StyledTableCell align="center">
                    <Chip
                      label={journal.status === "POSTED" ? "مقيد" : "مسودة"}
                      color={journal.status === "POSTED" ? "success" : "default"}
                      size="small"
                    />
                  </StyledTableCell>
                  <StyledTableCell align="center">
                    <Stack direction="row" spacing={1} justifyContent="center">
                      {permissions.includes("expenses_Update") && (
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() => handleEditExpense(journal)}
                        >
                          <Edit fontSize="small" />
                        </IconButton>
                      )}
                      {permissions.includes("expenses_Delete") && (
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleDeleteExpense(journal.journalId)}
                          disabled={deleteExpenseMutation.isLoading}
                        >
                          <Delete fontSize="small" />
                        </IconButton>
                      )}
                    </Stack>
                  </StyledTableCell>
                </StyledTableRow>
              );
            })
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
      ) : expensesData?.journals?.length === 0 ? (
        <Typography variant="body2" color="black" sx={{ py: 3, textAlign: "center" }}>
          لا توجد مصروفات
        </Typography>
      ) : (
        <Grid container spacing={2}>
          {expensesData?.journals?.map((journal, index) => {
            const expenseLines = journal.lines?.filter(line => line.debit > 0) || [];
            const totalAmount = calculateTotalAmount(journal);
            
            return (
              <Grid item xs={12} key={journal.journalId}>
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
                            ? dayjs(journal.date).format("DD/MM/YYYY")
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
                          المبلغ الإجمالي
                        </Typography>
                        <Typography variant="body1" fontWeight="bold" color="primary.main">
                          {totalAmount.toLocaleString('en-US', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
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
                          تفاصيل المصروفات
                        </Typography>
                        <Box sx={{ textAlign: "center", maxWidth: "60%" }}>
                          {expenseLines.length > 0 ? (
                            expenseLines.map((line, idx) => (
                              <Box key={idx} sx={{ mb: 0.5 }}>
                                <Typography variant="body2">
                                  {line.type || line.description}
                                </Typography>
                                <Typography variant="body2" fontWeight="bold" color="primary.main">
                                  {line.debit?.toLocaleString('en-US', {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2,
                                  })}
                                </Typography>
                              </Box>
                            ))
                          ) : (
                            <Typography variant="body2">
                              {journal.description || "-"}
                            </Typography>
                          )}
                        </Box>
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
                      <Divider />
                      {(permissions.includes("expenses_Update") || permissions.includes("expenses_Delete")) && (
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "center",
                            gap: 1,
                            pt: 1,
                          }}
                        >
                          {permissions.includes("expenses_Update") && (
                            <IconButton
                              size="small"
                              color="primary"
                              onClick={() => handleEditExpense(journal)}
                            >
                              <Edit fontSize="small" />
                            </IconButton>
                          )}
                          {permissions.includes("expenses_Delete") && (
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => handleDeleteExpense(journal.journalId)}
                              disabled={deleteExpenseMutation.isLoading}
                            >
                              <Delete fontSize="small" />
                            </IconButton>
                          )}
                        </Box>
                      )}
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
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
                startIcon={<PictureAsPdf sx={{ marginLeft: "10px" }} />}
                onClick={handleExportPDF}
                disabled={!expensesData?.journals?.length}
              >
                تصدير PDF
              </Button>
              <Button
                variant="outlined"
                color="success"
                startIcon={<FileDownload sx={{ marginLeft: "10px" }} />}
                onClick={handleExportExcel}
                disabled={!expensesData?.journals?.length}
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

      {/* Edit Expense Modal */}
      <EditExpense
        open={isEditModalOpen}
        onClose={handleCloseEditModal}
        onSuccess={handleSuccess}
        expense={selectedExpense}
        isMobile={isMobile}
      />

      {/* Delete Expense Modal */}
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