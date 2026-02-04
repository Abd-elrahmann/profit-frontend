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
  Collapse,
  TableRow,
  TableCell,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Menu,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Autocomplete,
  TextField,
} from "@mui/material";
import { Add, PictureAsPdf, FileDownload, Edit, Delete, ExpandMore, ExpandLess, FilterList } from "@mui/icons-material";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { getExpenses, deleteExpense, getUsersForExpenses } from "./expensesApi";
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
  const [expandedRows, setExpandedRows] = useState([]);
  const [pdfAnchorEl, setPdfAnchorEl] = useState(null);
  const [excelAnchorEl, setExcelAnchorEl] = useState(null);
  const [isTypeSelectionModalOpen, setIsTypeSelectionModalOpen] = useState(false);
  const [selectedExpenseTypes, setSelectedExpenseTypes] = useState([]);
  const [selectedEmployees, setSelectedEmployees] = useState([]);
  const [exportFormat, setExportFormat] = useState("");

  const EXPENSE_TYPES = [
    "مصروف رواتب",
    "مصروف بنزين",
    "مصروفات انترنت",
    "مصروفات ورقية",
    "مصروفات كهرباء",
    "مصروفات تشغيلية",
    "مصروفات اخرى"
  ];

  const isMobile = useMediaQuery("(max-width: 480px)");
  const isTablet = useMediaQuery("(max-width: 768px)");
  const isSmallScreen = isMobile || isTablet;

  const { permissions } = usePermissions();
  const queryClient = useQueryClient();
  const canExport = permissions.includes("expenses_Export");

  const formatArabicDate = (date) => {
    return dayjs(date)
      .locale("ar")
      .format("D [من] MMMM [الساعة] h:mm")
      + " "
      + (dayjs(date).hour() < 12 ? "صباحًا" : "مساءً");
  };

  const { data: expensesData, isLoading } = useQuery({
    queryKey: ["expenses", page],
    queryFn: () => getExpenses(page),
    retry: 1,
  });

  const { data: employeesData } = useQuery({
    queryKey: ["employees-for-expenses"],
    queryFn: () => getUsersForExpenses(),
    retry: 1,
  });

  const deleteExpenseMutation = useMutation({
    mutationFn: deleteExpense,
    onSuccess: () => {
      notifySuccess("تم حذف المصروفات بنجاح");
      queryClient.invalidateQueries(["expenses"]);
    },
    onError: (error) => {
      notifyError(error.response?.data?.message || "حدث خطأ أثناء حذف المصروفات");
    },
  });

  const groupExpensesByJournal = (expenses) => {
    if (!expenses) return [];
    
    const grouped = {};
    
    expenses.forEach(expense => {
      const journalId = expense.journal;
      if (!grouped[journalId]) {
        grouped[journalId] = {
          journalId: journalId,
          date: expense.createdAt,
          createdAtHijri: expense.createdAtHijri,
          addedBy: expense.addedBy,
          totalAmount: 0,
          expenses: [],
          types: new Set()
        };
      }
      
      grouped[journalId].expenses.push(expense);
      grouped[journalId].totalAmount += expense.amount;
      grouped[journalId].types.add(expense.type);
    });
    
    return Object.values(grouped)
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .map((group, index) => ({
        ...group,
        id: index + 1,
        types: Array.from(group.types)
      }));
  };

  const groupedExpenses = expensesData ? groupExpensesByJournal(expensesData.expenses) : [];

  const handleAddExpense = () => {
    setIsAddModalOpen(true);
  };

  const handleEditExpense = (expenseGroup) => {
    setSelectedExpense(expenseGroup);
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
    setExpandedRows([]);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage + 1);
    setExpandedRows([]);
  };

  const handleExportPDF = async (expenseTypes = [], employeeIds = []) => {
    const rows = expensesData?.expenses || [];
    if (!rows.length) {
      notifyError("لا توجد بيانات للتصدير");
      return;
    }
    
    let filteredRows = expenseTypes.length > 0 
      ? rows.filter(exp => expenseTypes.includes(exp.type)) 
      : rows;
    
    // تصفية حسب الموظفين إذا تم اختيارهم
    if (employeeIds.length > 0) {
      filteredRows = filteredRows.filter(exp => 
        exp.employee && employeeIds.includes(exp.employee.id || exp.employee._id)
      );
    }
    
    if (!filteredRows.length) {
      notifyError(`لا توجد مصاريف من الأنواع المحددة`);
      return;
    }
    
    const typeLabel = expenseTypes.length > 0 ? expenseTypes.join(', ') : '';
    await exportExpensesToPDF(filteredRows, typeLabel);
    setPdfAnchorEl(null);
  };

  const handleExportExcel = async (expenseTypes = [], employeeIds = []) => {
    const rows = expensesData?.expenses || [];
    if (!rows.length) {
      notifyError("لا توجد بيانات للتصدير");
      return;
    }
    
    let filteredRows = expenseTypes.length > 0 
      ? rows.filter(exp => expenseTypes.includes(exp.type)) 
      : rows;
    
    // تصفية حسب الموظفين إذا تم اختيارهم
    if (employeeIds.length > 0) {
      filteredRows = filteredRows.filter(exp => 
        exp.employee && employeeIds.includes(exp.employee.id || exp.employee._id)
      );
    }
    
    if (!filteredRows.length) {
      notifyError(`لا توجد مصاريف من الأنواع المحددة`);
      return;
    }
    
    const typeLabel = expenseTypes.length > 0 ? expenseTypes.join(', ') : '';
    await exportExpensesToExcel(filteredRows, typeLabel);
    setExcelAnchorEl(null);
  };

  const toggleRowExpansion = (journalId) => {
    setExpandedRows(prev => 
      prev.includes(journalId) 
        ? prev.filter(id => id !== journalId)
        : [...prev, journalId]
    );
  };

  const handleOpenTypeSelectionModal = (format) => {
    setExportFormat(format);
    setSelectedExpenseTypes([]);
    setSelectedEmployees([]);
    setIsTypeSelectionModalOpen(true);
    setPdfAnchorEl(null);
    setExcelAnchorEl(null);
  };

  const handleCloseTypeSelectionModal = () => {
    setIsTypeSelectionModalOpen(false);
    setSelectedExpenseTypes([]);
    setSelectedEmployees([]);
    setExportFormat("");
  };

  const handleConfirmExport = () => {
    const employeeIds = selectedEmployees.map(emp => emp.id || emp._id);
    if (exportFormat === "pdf") {
      handleExportPDF(selectedExpenseTypes, employeeIds);
    } else if (exportFormat === "excel") {
      handleExportExcel(selectedExpenseTypes, employeeIds);
    }
    handleCloseTypeSelectionModal();
  };

  const renderTable = () => (
    <TableContainer sx={{ maxHeight: 600, borderRadius: 2 }}>
      <Table stickyHeader>
        <TableHead>
          <StyledTableRow>
            <StyledTableCell align="center">#</StyledTableCell>
            <StyledTableCell align="center">التاريخ</StyledTableCell>
            <StyledTableCell align="center">عدد المصروفات</StyledTableCell>
            <StyledTableCell align="center">إجمالي المبلغ</StyledTableCell>
            <StyledTableCell align="center">مضافة بواسطة</StyledTableCell>
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
          ) : groupedExpenses.length === 0 ? (
            <StyledTableRow>
              <StyledTableCell colSpan={7} align="center">
                <Typography variant="body2" color="text.secondary" sx={{ py: 3 }}>
                  لا توجد مصروفات
                </Typography>
              </StyledTableCell>
            </StyledTableRow>
          ) : (
            groupedExpenses.map((group, index) => (
              <React.Fragment key={group.journalId}>
                <StyledTableRow hover>
                  <StyledTableCell align="center">
                    {(page - 1) * (expensesData?.limit || 10) + index + 1}
                  </StyledTableCell>
                  <StyledTableCell align="center">
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 'medium', mb: 0.5 }}>
                        {formatArabicDate(group.date)}
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'primary.main', fontWeight: 'bold', fontSize: '0.85rem' }}>
                        {group.createdAtHijri}
                      </Typography>
                    </Box>
                  </StyledTableCell>
                  <StyledTableCell align="center">
                    <Typography variant="body2">
                      {group.expenses.length}
                    </Typography>
                  </StyledTableCell>
                  <StyledTableCell align="center">
                    <Typography variant="body2" fontWeight="bold" color="primary.main">
                      {group.totalAmount.toLocaleString('en-US')}
                    </Typography>
                  </StyledTableCell>
                  <StyledTableCell align="center">
                    <Typography variant="body2">
                      {group.addedBy?.name || "-"}
                    </Typography>
                  </StyledTableCell>
                  <StyledTableCell align="center">
                    <Stack direction="row" spacing={1} justifyContent="center">
                      <Button
                        size="small"
                        variant="text"
                        color="primary"
                        onClick={() => toggleRowExpansion(group.journalId)}
                        sx={{ fontSize: '0.875rem', minWidth: 'auto', px: 1,fontWeight: 'bold' }}
                      >
                        {expandedRows.includes(group.journalId) ? 'إخفاء التفاصيل' : 'عرض التفاصيل'}
                      </Button>
                      {permissions.includes("expenses_Update") && (
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() => handleEditExpense(group)}
                        >
                          <Edit fontSize="small" />
                        </IconButton>
                      )}
                      {permissions.includes("expenses_Delete") && (
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleDeleteExpense(group.journalId)}
                          disabled={deleteExpenseMutation.isLoading}
                        >
                          <Delete fontSize="small" />
                        </IconButton>
                      )}
                    </Stack>
                  </StyledTableCell>
                </StyledTableRow>
                
                <TableRow>
                  <TableCell colSpan={7} sx={{ p: 0 }}>
                    <Collapse in={expandedRows.includes(group.journalId)} timeout="auto" unmountOnExit>
                      <Box sx={{ bgcolor: 'background.default', p: 2, borderTop: 1, borderColor: 'divider' }}>
                        <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                          تفاصيل المصروفات - القيد #{group.journalId}
                        </Typography>
                        <Table size="small">
                          <TableHead>
                            <TableRow>
                              <TableCell align="center">النوع</TableCell>
                              <TableCell align="center">المبلغ</TableCell>
                              <TableCell align="center">الوصف</TableCell>
                              <TableCell align="center">الموظف</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {group.expenses.map((expense, idx) => (
                              <TableRow key={idx}>
                                <TableCell align="center">
                                  <Chip
                                    label={expense.type}
                                    color={expense.type === "مصروف رواتب" ? "primary" : "default"}
                                    size="small"
                                    variant="outlined"
                                  />
                                </TableCell>
                                <TableCell align="center">
                                  <Typography variant="body2" fontWeight="bold">
                                    {expense.amount.toLocaleString('en-US')}
                                  </Typography>
                                </TableCell>
                                <TableCell align="center">
                                  <Typography variant="body2">
                                    {expense.description || "-"}
                                  </Typography>
                                </TableCell>
                                <TableCell align="center">
                                  {expense.employee ? (
                                    <Typography variant="body2">
                                      {expense.employee.name}
                                    </Typography>
                                  ) : (
                                    <Typography variant="body2" color="text.secondary">
                                      -
                                    </Typography>
                                  )}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </Box>
                    </Collapse>
                  </TableCell>
                </TableRow>
              </React.Fragment>
            ))
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );

  const renderCards = () => (
    <Box sx={{ p: isMobile ? 1 : 2 }}>
      {isLoading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
          <CircularProgress size={30} />
        </Box>
      ) : groupedExpenses.length === 0 ? (
        <Typography variant="body2" color="text.secondary" sx={{ py: 3, textAlign: "center" }}>
          لا توجد مصروفات
        </Typography>
      ) : (
        <Grid container spacing={2}>
          {groupedExpenses.map((group) => (
            <Grid item xs={12} key={group.journalId}>
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
                      <Typography variant="body2" color="text.secondary">التاريخ</Typography>
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 'medium', mb: 0.5, textAlign: 'right' }}>
                          {formatArabicDate(group.date)}
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'primary.main', fontWeight: 'bold', fontSize: '0.7rem', display: 'block', textAlign: 'right' }}>
                          {group.createdAtHijri}
                        </Typography>
                      </Box>
                    </Box>
                    <Divider />
                    
                    <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                      <Typography variant="body2" color="text.secondary">عدد المصروفات</Typography>
                      <Typography variant="body1">
                        {group.expenses.length}
                      </Typography>
                    </Box>
                    <Divider />
                    
                    <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                      <Typography variant="body2" color="text.secondary">إجمالي المبلغ</Typography>
                      <Typography variant="body1" fontWeight="bold" color="primary.main">
                        {group.totalAmount.toLocaleString('en-US')}
                      </Typography>
                    </Box>
                    <Divider />
                    
                    <Box>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                        الأنواع:
                      </Typography>
                      <Stack direction="row" spacing={1} flexWrap="wrap" gap={0.5}>
                        {group.types.map((type, idx) => (
                          <Chip
                            key={idx}
                            label={type}
                            color={type === "مصروف رواتب" ? "primary" : "default"}
                            size="small"
                            variant="outlined"
                          />
                        ))}
                      </Stack>
                    </Box>
                    <Divider />
                    
                    <Box>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                        مضافة بواسطة:
                      </Typography>
                      <Typography variant="body2">
                        {group.addedBy?.name || "-"}
                      </Typography>
                    </Box>
                    
                    <Box>
                      <Typography 
                        variant="body2" 
                        color="text.secondary" 
                        sx={{ mb: 0.5, cursor: 'pointer', color: 'primary.main' }}
                        onClick={() => toggleRowExpansion(group.journalId)}
                      >
                        {expandedRows.includes(group.journalId) ? "إخفاء التفاصيل ▲" : "عرض التفاصيل ▼"}
                      </Typography>
                      
                      <Collapse in={expandedRows.includes(group.journalId)}>
                        <Box sx={{ mt: 2, p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
                          <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                            تفاصيل المصروفات:
                          </Typography>
                          {group.expenses.map((expense, idx) => (
                            <Box key={idx} sx={{ mb: 2, pb: 2, borderBottom: idx < group.expenses.length - 1 ? '1px dashed #e0e0e0' : 'none' }}>
                              <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
                                <Typography variant="body2" color="text.secondary">النوع:</Typography>
                                <Chip
                                  label={expense.type}
                                  color={expense.type === "مصروف رواتب" ? "primary" : "default"}
                                  size="small"
                                  variant="outlined"
                                />
                              </Box>
                              <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
                                <Typography variant="body2" color="text.secondary">المبلغ:</Typography>
                                <Typography variant="body2" fontWeight="bold">
                                  {expense.amount.toLocaleString('en-US')}
                                </Typography>
                              </Box>
                              {expense.description && (
                                <Box sx={{ mb: 0.5 }}>
                                  <Typography variant="body2" color="text.secondary">الوصف:</Typography>
                                  <Typography variant="body2">{expense.description}</Typography>
                                </Box>
                              )}
                              {expense.employee && (
                                <Box>
                                  <Typography variant="body2" color="text.secondary">الموظف:</Typography>
                                  <Typography variant="body2">{expense.employee.name}</Typography>
                                </Box>
                              )}
                            </Box>
                          ))}
                        </Box>
                      </Collapse>
                    </Box>
                    
                    {(permissions.includes("expenses_Update") || permissions.includes("expenses_Delete")) && (
                      <>
                        <Divider />
                        <Box sx={{ display: "flex", justifyContent: "center", gap: 1, pt: 1 }}>
                          {permissions.includes("expenses_Update") && (
                            <Button
                              size="small"
                              color="primary"
                              startIcon={<Edit />}
                              onClick={() => handleEditExpense(group)}
                              variant="outlined"
                            >
                              تعديل
                            </Button>
                          )}
                          {permissions.includes("expenses_Delete") && (
                            <Button
                              size="small"
                              color="error"
                              startIcon={<Delete />}
                              onClick={() => handleDeleteExpense(group.journalId)}
                              disabled={deleteExpenseMutation.isLoading}
                              variant="outlined"
                            >
                              حذف
                            </Button>
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
      <Box sx={{ p: isMobile ? 2 : 3 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 3,
            flexDirection: isMobile ? "column" : "row",
            gap: 2,
            width: "100%",
          }}
        >
          <Box sx={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: 1 }}>
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
              <Stack direction={isMobile ? "column" : "row"} spacing={1}>
                <Button
                  variant="outlined"
                  color="error"
                  startIcon={<PictureAsPdf />}
                  onClick={(e) => setPdfAnchorEl(e.currentTarget)}
                  disabled={!groupedExpenses.length}
                >
                  تصدير PDF
                </Button>
                <Menu
                  anchorEl={pdfAnchorEl}
                  open={Boolean(pdfAnchorEl)}
                  onClose={() => setPdfAnchorEl(null)}
                >
                  <MenuItem onClick={() => { handleExportPDF([]); }}>
                    تصدير الكل
                  </MenuItem>
                  <MenuItem onClick={() => handleOpenTypeSelectionModal("pdf")}>
                    اختيار مصروف محدد
                  </MenuItem>
                </Menu>

                <Button
                  variant="outlined"
                  color="success"
                  startIcon={<FileDownload />}
                  onClick={(e) => setExcelAnchorEl(e.currentTarget)}
                  disabled={!groupedExpenses.length}
                >
                  تصدير Excel
                </Button>
                <Menu
                  anchorEl={excelAnchorEl}
                  open={Boolean(excelAnchorEl)}
                  onClose={() => setExcelAnchorEl(null)}
                >
                  <MenuItem onClick={() => { handleExportExcel([]); }}>
                    تصدير الكل
                  </MenuItem>
                  <MenuItem onClick={() => handleOpenTypeSelectionModal("excel")}>
                    اختيار مصروف محدد
                  </MenuItem>
                </Menu>
              </Stack>
            )}
          </Box>

          {!isLoading && expensesData?.expenses && expensesData.expenses.length > 0 ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, flexWrap: 'wrap', flex: 1 }}>
              <Card sx={{ borderRadius: 1, boxShadow: 2, flex: 1, minWidth: 200, maxWidth: 300 }}>
                <CardContent sx={{ textAlign: 'center', py: 2 }}>
                  <Typography variant="body1" color="text.secondary" gutterBottom>
                    اجمالي مبالغ المصروفات
                  </Typography>
                  <Typography variant="h5" color="primary.main" fontWeight="bold">
                    {expensesData.expenses.reduce((total, expense) => total + expense.amount, 0).toLocaleString('en-US')}
                  </Typography>
                </CardContent>
              </Card>
              <Card sx={{ borderRadius: 1, boxShadow: 2, flex: 1, minWidth: 200, maxWidth: 300 }}>
                <CardContent sx={{ textAlign: 'center', py: 2 }}>
                  <Typography variant="body1" color="text.secondary" gutterBottom>
                    عدد المصروفات
                  </Typography>
                  <Typography variant="h5" color="success.main" fontWeight="bold">
                    {expensesData.expenses.length.toLocaleString('en-US')}
                  </Typography>
                </CardContent>
              </Card>
            </Box>
          ) : (
            <Box sx={{ flex: 1 }} />
          )}
        </Box>

        {isSmallScreen ? renderCards() : renderTable()}

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

      <AddExpense
        open={isAddModalOpen}
        onClose={handleCloseModal}
        onSuccess={handleSuccess}
        isMobile={isMobile}
      />

      {selectedExpense && (
        <EditExpense
          open={isEditModalOpen}
          onClose={handleCloseEditModal}
          onSuccess={handleSuccess}
          expense={selectedExpense}
          isMobile={isMobile}
        />
      )}

      <DeleteModal
        open={isDeleteModalOpen}
        onClose={handleCloseDeleteModal}
        onConfirm={handleConfirmDelete}
        title="حذف المصروفات"
        message="هل أنت متأكد من حذف هذه المجموعة من المصروفات؟ لا يمكن التراجع عن هذا الإجراء."
        isLoading={deleteExpenseMutation.isLoading}
        ButtonText="حذف المصروفات"
      />

      <Dialog
        open={isTypeSelectionModalOpen}
        onClose={handleCloseTypeSelectionModal}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>اختيار أنواع المصروفات</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Autocomplete
              multiple
              options={EXPENSE_TYPES}
              value={selectedExpenseTypes}
              onChange={(event, newValue) => {
                setSelectedExpenseTypes(newValue);
                // إعادة تعيين الموظفين المختارين إذا تم إلغاء اختيار "مصروف رواتب"
                if (!newValue.includes("مصروف رواتب")) {
                  setSelectedEmployees([]);
                }
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="اختر أنواع المصروفات"
                  placeholder="ابحث عن نوع..."
                />
              )}
              renderTags={(value, getTagProps) =>
                value.map((option, index) => (
                  <Chip
                    label={option}
                    {...getTagProps({ index })}
                    color="primary"
                    size="small"
                  />
                ))
              }
            />
            
            {selectedExpenseTypes.includes("مصروف رواتب") && (
              <Autocomplete
                multiple
                options={employeesData?.users || []}
                getOptionLabel={(option) => option.name || ""}
                value={selectedEmployees}
                onChange={(event, newValue) => {
                  setSelectedEmployees(newValue);
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="اختر الموظفين (اختياري)"
                    placeholder="ابحث عن موظف..."
                  />
                )}
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => (
                    <Chip
                      label={option.name}
                      {...getTagProps({ index })}
                      color="secondary"
                      size="small"
                    />
                  ))
                }
              />
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseTypeSelectionModal} color="inherit">
            إلغاء
          </Button>
          <Button
            onClick={handleConfirmExport}
            variant="contained"
            color="primary"
            disabled={selectedExpenseTypes.length === 0}
          >
            تأكيد التصدير
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default Expenses;