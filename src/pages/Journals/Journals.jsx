import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Tabs,
  Tab,
  Paper,
  Grid,
  TextField,
  Button,
  Stack,
  Divider,
  Alert,
  Table,
  TableBody,
  TableContainer,
  TableHead,
  MenuItem,
  CircularProgress,
  useMediaQuery,
  Card,
  CardContent,
  IconButton,
  Chip as MuiChip,
  Autocomplete,
  InputBase,
} from "@mui/material";
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Check as CheckIcon,
  Cancel as CancelIcon,
  Save as SaveIcon,
  Visibility as VisibilityIcon,
  ArrowBack as ArrowBackIcon,
  Add as AddIcon,
  PictureAsPdf as PDFIcon,
  TableChart as ExcelIcon,
} from "@mui/icons-material";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getJournalById,
  updateJournal,
  deleteJournal,
  postJournal,
  unpostJournal,
  createJournal,
  getChartOfAccounts,
} from "./journalsApi";
import { notifySuccess, notifyError } from "../../utilities/toastify";
import JournalTable from "../../components/modals/JournalTable";
import DeleteModal from "../../components/modals/DeleteModal";
import {
  StyledTableCell,
  StyledTableRow,
} from "../../components/layouts/tableLayout";
import { Helmet } from "react-helmet-async";
import { usePermissions } from "../../components/Contexts/PermissionsContext";
import { exportJournalToPDF, exportJournalToExcel } from "../../utilities/journalsExporter";

const Journals = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [selectedJournal, setSelectedJournal] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isAddMode, setIsAddMode] = useState(false);
  const [journalToDelete, setJournalToDelete] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [editForm, setEditForm] = useState({
    description: "",
    date: "",
    type: "",
  });
  const [newJournalForm, setNewJournalForm] = useState({
    description: "",
    date: new Date().toISOString().split("T")[0],
    type: "GENERAL",
  });
  const [journalLines, setJournalLines] = useState([]);
  const [editingLineIndex, setEditingLineIndex] = useState(null);
  const [currentLine, setCurrentLine] = useState({
    accountId: "",
    debit: "",
    credit: "",
    description: "",
  });
  const [chartAccounts, setChartAccounts] = useState([]);

  const isMobile = useMediaQuery("(max-width: 480px)");
  const isTablet = useMediaQuery("(max-width: 768px)");
  const isSmallScreen = isMobile || isTablet;

  const queryClient = useQueryClient();
  const { permissions } = usePermissions();

  // Helper function to flatten nested tree structure
  const flattenAccountsTree = (accounts) => {
    if (!accounts || !Array.isArray(accounts)) return [];

    const flattened = [];

    const traverse = (account) => {
      if (!account) return;

      // Add current account (without children for the flat list)
      const { children: _children, ...accountWithoutChildren } = account;
      flattened.push(accountWithoutChildren);

      // Recursively process children
      if (account.children && Array.isArray(account.children)) {
        account.children.forEach((child) => traverse(child));
      }
    };

    accounts.forEach((account) => traverse(account));

    return flattened;
  };

  const { data: journalData, isLoading: isJournalLoading } = useQuery({
    queryKey: ["journal", selectedJournal],
    queryFn: () => getJournalById(selectedJournal),
    enabled: !!selectedJournal && activeTab === 1,
  });

  // تحديث البيانات عند تغيير journalData
  useEffect(() => {
    if (journalData && selectedJournal) {
      setEditForm({
        description: journalData.description || "",
        date: journalData.date ? journalData.date.split("T")[0] : "",
        type: journalData.type || "",
      });
      // تحويل بيانات ال lines للتعديل
      if (journalData.lines && Array.isArray(journalData.lines)) {
        setJournalLines(
          journalData.lines.map((line) => ({
            id: line.id,
            accountId: line.account?.id,
            account: line.account,
            debit: line.debit || 0,
            credit: line.credit || 0,
            description: line.description || "",
          }))
        );
      } else {
        setJournalLines([]);
      }
    } else if (!selectedJournal) {
      // إعادة تعيين عند إلغاء التحديد فقط
      setJournalLines([]);
    }
  }, [journalData, selectedJournal]);

  // جلب حسابات الدليل المحاسبي
  useEffect(() => {
    const fetchChartAccounts = async () => {
      try {
        const accountsTree = await getChartOfAccounts();
        // Flatten the tree structure to get all accounts
        const flattenedAccounts = flattenAccountsTree(accountsTree || []);
        setChartAccounts(flattenedAccounts);
      } catch (error) {
        console.error("Error fetching chart accounts:", error);
      }
    };

    fetchChartAccounts();
  }, []);

  const handleViewDetails = (journalId) => {
    setSelectedJournal(journalId);
    setActiveTab(1);
    setIsEditMode(false);
    setIsAddMode(false);
  };

  const handleBackToList = () => {
    setActiveTab(0);
    setSelectedJournal(null);
    setIsEditMode(false);
    setIsAddMode(false);
    setJournalLines([]);
    setEditingLineIndex(null);
    setCurrentLine({
      accountId: "",
      debit: "",
      credit: "",
      description: "",
    });
  };

  const handleAddNewClick = () => {
    setIsAddMode(true);
    setIsEditMode(false);
    setActiveTab(1);
    setSelectedJournal(null);
    setJournalLines([]);
    setEditingLineIndex(null);
    setCurrentLine({
      accountId: "",
      debit: "",
      credit: "",
      description: "",
    });
    setNewJournalForm({
      description: "",
      date: new Date().toISOString().split("T")[0],
      type: "GENERAL",
    });
  };

  const handleEditClick = () => {
    setIsEditMode(true);
  };

  const handleCancelEdit = () => {
    setIsEditMode(false);
    if (journalData) {
      setEditForm({
        description: journalData.description || "",
        date: journalData.date ? journalData.date.split("T")[0] : "",
        type: journalData.type || "",
      });
      setJournalLines(
        journalData.lines?.map((line) => ({
          id: line.id,
          accountId: line.account?.id,
          account: line.account,
          debit: line.debit || 0,
          credit: line.credit || 0,
          description: line.description || "",
        })) || []
      );
    }
  };

  const handleCancelAdd = () => {
    setIsAddMode(false);
    setJournalLines([]);
    setEditingLineIndex(null);
    setCurrentLine({
      accountId: "",
      debit: "",
      credit: "",
      description: "",
    });
    setNewJournalForm({
      description: "",
      date: new Date().toISOString().split("T")[0],
      type: "GENERAL",
    });
  };

  const handleAddLine = () => {
    if (!currentLine.accountId) {
      notifyError("يجب اختيار حساب");
      return;
    }

    const selectedAccount = chartAccounts.find(
      (acc) => acc.id === currentLine.accountId
    );
    const newLine = {
      ...currentLine,
      id:
        editingLineIndex !== null
          ? journalLines[editingLineIndex]?.id
          : Date.now(),
      account: selectedAccount,
    };

    if (editingLineIndex !== null) {
      const updatedLines = [...journalLines];
      updatedLines[editingLineIndex] = newLine;
      setJournalLines(updatedLines);
      setEditingLineIndex(null);
    } else {
      setJournalLines((prev) => [...prev, newLine]);
    }

    setCurrentLine({
      accountId: "",
      debit: "",
      credit: "",
      description: "",
    });
  };

  const handleEditLine = (index) => {
    const line = journalLines[index];
    setCurrentLine({
      accountId: line.accountId,
      debit: line.debit,
      credit: line.credit,
      description: line.description || "",
    });
    setEditingLineIndex(index);
  };

  const handleDeleteLine = (index) => {
    setJournalLines((prev) => prev.filter((_, i) => i !== index));
    if (editingLineIndex === index) {
      setEditingLineIndex(null);
      setCurrentLine({
        accountId: "",
        debit: "",
        credit: "",
        description: "",
      });
    }
  };

  const handleLineInputChange = (field, value) => {
    setCurrentLine((prev) => ({
      ...prev,
      [field]: value,
    }));
  };


  const isJournalBalanced = (debit, credit) => {
    const difference = Math.abs(debit - credit);
    return difference < 0.01;
  };

  const handleCreateJournal = async () => {
    if (journalLines.length === 0) {
      notifyError("يجب إضافة بنود للقيد");
      return;
    }

    const totalDebit = journalLines.reduce(
      (sum, line) => sum + parseFloat(line.debit || 0),
      0
    );
    const totalCredit = journalLines.reduce(
      (sum, line) => sum + parseFloat(line.credit || 0),
      0
    );

    if (!isJournalBalanced(totalDebit, totalCredit)) {
      notifyError(
        `القيد غير متوازن! إجمالي المدين: ${totalDebit.toFixed(2)} ≠ إجمالي الدائن: ${totalCredit.toFixed(2)}`
      );
      return;
    }

    try {
      const journalData = {
        description: newJournalForm.description,
        date: newJournalForm.date,
        type: newJournalForm.type,
        lines: journalLines.map((line) => ({
          accountId: line.accountId,
          debit: parseFloat(line.debit || 0),
          credit: parseFloat(line.credit || 0),
          description: line.description,
        })),
      };

      await createJournal(journalData);
      notifySuccess("تم إنشاء القيد بنجاح");
      setIsAddMode(false);
      setJournalLines([]);
      setActiveTab(0);
      queryClient.invalidateQueries(["journals"]);
    } catch (error) {
      notifyError(error.response?.data?.message || "حدث خطأ أثناء إنشاء القيد");
    }
  };

  const handleUpdateJournal = async () => {
    if (journalLines.length === 0) {
      notifyError("يجب إضافة بنود للقيد");
      return;
    }

    const totalDebit = journalLines.reduce(
      (sum, line) => sum + parseFloat(line.debit || 0),
      0
    );
    const totalCredit = journalLines.reduce(
      (sum, line) => sum + parseFloat(line.credit || 0),
      0
    );

    if (!isJournalBalanced(totalDebit, totalCredit)) {
      notifyError(
        `القيد غير متوازن! إجمالي المدين: ${totalDebit.toFixed(2)} ≠ إجمالي الدائن: ${totalCredit.toFixed(2)}`
      );
      return;
    }

    try {
      const updateData = {
        description: editForm.description,
        date: editForm.date,
        type: editForm.type,
        lines: journalLines.map((line) => ({
          accountId: line.accountId,
          debit: parseFloat(line.debit || 0),
          credit: parseFloat(line.credit || 0),
          description: line.description,
        })),
      };

      await updateJournal(selectedJournal, updateData);
      notifySuccess("تم تعديل القيد بنجاح");
      setIsEditMode(false);
      queryClient.invalidateQueries(["journal", selectedJournal]);
      queryClient.invalidateQueries(["journals"]);
    } catch (error) {
      notifyError(error.response?.data?.message || "حدث خطأ أثناء تعديل القيد");
    }
  };

  const handleInputChange = (field, value) => {
    if (isAddMode) {
      setNewJournalForm((prev) => ({
        ...prev,
        [field]: value,
      }));
    } else {
      setEditForm((prev) => ({
        ...prev,
        [field]: value,
      }));
    }
  };

  const handleDeleteJournal = async () => {
    try {
      await deleteJournal(journalToDelete);
      notifySuccess("تم حذف القيد بنجاح");
      setIsDeleteModalOpen(false);
      setJournalToDelete(null);
      setSelectedJournal(null);
      setActiveTab(0);
      queryClient.invalidateQueries(["journals"]);
    } catch (error) {
      notifyError(error.response?.data?.message || "حدث خطأ أثناء حذف القيد");
    }
  };

  const handlePostJournal = async () => {
    try {
      await postJournal(selectedJournal);
      notifySuccess("تم اعتماد القيد بنجاح");
      queryClient.invalidateQueries(["journal", selectedJournal]);
      queryClient.invalidateQueries(["journals"]);
    } catch (error) {
      notifyError(
        error.response?.data?.message || "حدث خطأ أثناء اعتماد القيد"
      );
    }
  };

  const handleUnpostJournal = async () => {
    try {
      await unpostJournal(selectedJournal);
      notifySuccess("تم إلغاء اعتماد القيد بنجاح");
      queryClient.invalidateQueries(["journal", selectedJournal]);
      queryClient.invalidateQueries(["journals"]);
    } catch (error) {
      notifyError(
        error.response?.data?.message || "حدث خطأ أثناء إلغاء الاعتماد"
      );
    }
  };

  const handleExportPDF = async () => {
    if (!journalData) return;
    
    try {
      await exportJournalToPDF(journalData);
      notifySuccess("تم تصدير القيد إلى PDF بنجاح");
    } catch (error) {
      notifyError("حدث خطأ أثناء تصدير PDF");
      console.error('PDF export error:', error);
    }
  };
  
  const handleExportExcel = async () => {
    if (!journalData) return;
    
    try {
      await exportJournalToExcel(journalData);
      notifySuccess("تم تصدير القيد إلى Excel بنجاح");
    } catch (error) {
      notifyError("حدث خطأ أثناء تصدير Excel");
      console.error('Excel export error:', error);
    }
  };

  const getJournalSourceTypeText = (sourceType) => {
    switch (sourceType) {
      case "LOAN":
        return "سلفة";
      case "REPAYMENT":
        return "سداد";
      case "PARTNER":
        return "شريك";
      case "PERIOD_CLOSING":
        return "إقفال فترة";
      case "PARTNER_TRANSACTION_WITHDRAWAL":
        return "سحب مالي لشريك";
      case "PARTNER_TRANSACTION_DEPOSIT":
        return "إيداع مالي لشريك";
      case "OTHER":
        return "أخرى";
      default:
        return sourceType || "-";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "DRAFT":
        return "مسودة";
      case "POSTED":
        return "معتمد";
      case "CANCELLED":
        return "ملغي";
      default:
        return status;
    }
  };

  const calculateTotalsForTable = () => {
    const totalDebit = journalLines.reduce(
      (sum, line) => sum + parseFloat(line.debit || 0),
      0
    );
    const totalCredit = journalLines.reduce(
      (sum, line) => sum + parseFloat(line.credit || 0),
      0
    );
    const totalBalance = totalDebit - totalCredit;

    return { totalDebit, totalCredit, totalBalance };
  };

  const calculateTotals = () => {
    let totalDebit = 0;
    let totalCredit = 0;

    if (editingLineIndex !== null && journalLines[editingLineIndex]) {
      journalLines.forEach((line, index) => {
        if (index !== editingLineIndex) {
          totalDebit += parseFloat(line.debit || 0);
          totalCredit += parseFloat(line.credit || 0);
        }
      });

      if (currentLine) {
        totalDebit += parseFloat(currentLine.debit || 0);
        totalCredit += parseFloat(currentLine.credit || 0);
      }
    } else {
      totalDebit = journalLines.reduce(
        (sum, line) => sum + parseFloat(line.debit || 0),
        0
      );
      totalCredit = journalLines.reduce(
        (sum, line) => sum + parseFloat(line.credit || 0),
        0
      );

      if (
        currentLine &&
        (parseFloat(currentLine.debit || 0) > 0 ||
          parseFloat(currentLine.credit || 0) > 0)
      ) {
        totalDebit += parseFloat(currentLine.debit || 0);
        totalCredit += parseFloat(currentLine.credit || 0);
      }
    }

    const totalBalance = totalDebit - totalCredit;

    return { totalDebit, totalCredit, totalBalance };
  };

  const totals = calculateTotals();
  const totalsForTable = calculateTotalsForTable();

  const renderLinesForm = () => (
    <Paper sx={{ p: 3, mb: 3, borderRadius: 2 }}>
      <Typography variant="h6" fontWeight="bold" mb={3} textAlign="center">
        {editingLineIndex !== null ? "تعديل البند" : "إضافة بند جديد"}
      </Typography>

      <Grid container spacing={2} alignItems="center" justifyContent="center">
        <Grid item xs={12} md={3}>
          <Autocomplete
            sx={{
              width: "250px",
            }}
            options={chartAccounts}
            getOptionLabel={(option) => `${option.code} - ${option.name}`}
            value={
              chartAccounts.find((acc) => acc.id === currentLine.accountId) ||
              null
            }
            onChange={(event, newValue) => {
              handleLineInputChange("accountId", newValue?.id || "");
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                label="الحساب"
                required
                variant="outlined"
                sx={{
                  width: "250px",
                }}
              />
            )}
            isOptionEqualToValue={(option, value) => option.id === value.id}
          />
        </Grid>

        <Grid item xs={12} md={2}>
          <TextField
            label="مدين"
            type="number"
            value={currentLine.debit}
            onChange={(e) => {
              const val = e.target.value;

              if (val.includes("-")) return;

              handleLineInputChange("debit", val);
            }}
            inputProps={{ min: 0 }}
            sx={{
              width: "200px",
            }}
          />
        </Grid>

        <Grid item xs={12} md={2}>
          <TextField
            label="دائن"
            type="number"
            value={currentLine.credit}
            onChange={(e) => {
              const val = e.target.value;

              if (val.includes("-")) return;

              handleLineInputChange("credit", val);
            }}
            inputProps={{ min: 0 }}
            sx={{ width: "200px" }}
          />
        </Grid>

        <Grid item xs={12} md={3}>
          <TextField
            label="الوصف"
            value={currentLine.description}
            onChange={(e) =>
              handleLineInputChange("description", e.target.value)
            }
            sx={{
              width: "250px",
            }}
          />
        </Grid>

        <Grid item xs={12} md={2}>
          <Button
            fullWidth
            sx={{
              fontWeight: "bold",
            }}
            variant="contained"
            startIcon={
              editingLineIndex !== null ? (
                <SaveIcon sx={{ marginLeft: "10px" }} />
              ) : (
                <AddIcon sx={{ marginLeft: "10px" }} />
              )
            }
            onClick={handleAddLine}
            size="small"
          >
            {editingLineIndex !== null ? "تحديث" : "إضافة"}
          </Button>
        </Grid>
      </Grid>
    </Paper>
  );

  const renderLinesList = () => (
    <Paper sx={{ p: 3, borderRadius: 2 }}>
      <Typography variant="h6" fontWeight="bold" mb={3}>
        بنود القيد
      </Typography>

      {journalLines.length === 0 ? (
        <Alert severity="info">لا توجد بنود مضافة</Alert>
      ) : (
        <>
          <TableContainer>
            <Table>
              <TableHead>
                <StyledTableRow>
                  <StyledTableCell align="center">الحساب</StyledTableCell>
                  <StyledTableCell align="center">الوصف</StyledTableCell>
                  <StyledTableCell align="center">مدين</StyledTableCell>
                  <StyledTableCell align="center">دائن</StyledTableCell>
                  <StyledTableCell align="center">الإجمالي</StyledTableCell>
                  {(isEditMode || isAddMode) && (
                    <StyledTableCell align="center" className="hide-on-print">
                      الإجراءات
                    </StyledTableCell>
                  )}
                </StyledTableRow>
              </TableHead>
              <TableBody>
                {journalLines.map((line, index) => {
                  const lineBalance =
                    parseFloat(line.debit || 0) - parseFloat(line.credit || 0);
                  return (
                    <StyledTableRow key={line.id || index}>
                      <StyledTableCell align="center">
                        {line.account?.code} - {line.account?.name}
                      </StyledTableCell>
                      <StyledTableCell align="center">
                        {line.description || "-"}
                      </StyledTableCell>
                      <StyledTableCell align="center">
                        {parseFloat(line.debit || 0).toLocaleString()}
                      </StyledTableCell>
                      <StyledTableCell align="center">
                        {parseFloat(line.credit || 0).toLocaleString()}
                      </StyledTableCell>
                      <StyledTableCell align="center">
                        <Typography
                          fontWeight="medium"
                          color={
                            lineBalance === 0
                              ? "text.primary"
                              : lineBalance > 0
                              ? "error"
                              : "success.main"
                          }
                        >
                          {lineBalance.toLocaleString()}
                        </Typography>
                      </StyledTableCell>
                      {(isEditMode || isAddMode) && (
                        <StyledTableCell align="center" className="hide-on-print">
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={() => handleEditLine(index)}
                          >
                            <EditIcon />
                          </IconButton>
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleDeleteLine(index)}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </StyledTableCell>
                      )}
                    </StyledTableRow>
                  );
                })}
                <StyledTableRow sx={{ backgroundColor: "#f5f5f5" }}>
                  <StyledTableCell colSpan={2} align="center">
                    <Typography fontWeight="bold">الإجمالي</Typography>
                  </StyledTableCell>
                  <StyledTableCell align="center">
                    <Typography fontWeight="bold" color="error">
                      {totalsForTable.totalDebit.toLocaleString()}
                    </Typography>
                  </StyledTableCell>
                  <StyledTableCell align="center">
                    <Typography fontWeight="bold" color="success.main">
                      {totalsForTable.totalCredit.toLocaleString()}
                    </Typography>
                  </StyledTableCell>
                  <StyledTableCell align="center">
                    <Typography fontWeight="bold">
                      {totalsForTable.totalBalance.toLocaleString()}
                    </Typography>
                  </StyledTableCell>
                  {(isEditMode || isAddMode) && (
                    <StyledTableCell align="center"></StyledTableCell>
                  )}
                </StyledTableRow>
              </TableBody>
            </Table>
          </TableContainer>

          {!isJournalBalanced(totalsForTable.totalDebit, totalsForTable.totalCredit) && (
            <Alert severity="error" sx={{ mt: 2 }}>
              القيد غير متوازن! إجمالي المدين: {totalsForTable.totalDebit.toFixed(2)} ≠ إجمالي الدائن: {totalsForTable.totalCredit.toFixed(2)} (الفرق: {Math.abs(totalsForTable.totalBalance).toFixed(2)})
            </Alert>
          )}
        </>
      )}
    </Paper>
  );

  const renderDesktopSidebar = () => (
    <Box
      sx={{
        width: "350px",
        borderRight: "1px solid #ddd",
        bgcolor: "#fafafa",
        height: "100%",
        overflowY: "auto",
        flexShrink: 0,
      }}
    >
      <Box sx={{ p: 3, borderBottom: "1px solid #ddd", bgcolor: "#fafafa" }}>
        <Typography variant="h6" color="primary" fontWeight="bold" mb={3}>
          معلومات القيد
        </Typography>
        <Stack spacing={2}>
          <Box sx={{ display: "flex", justifyContent: "space-between" }}>
            <Typography color="error">إجمالي المدين:</Typography>
            <Typography fontWeight="bold" color="error">
              {totals.totalDebit.toLocaleString()}
            </Typography>
          </Box>
          <Box sx={{ display: "flex", justifyContent: "space-between" }}>
            <Typography color="success.main">إجمالي الدائن:</Typography>
            <Typography fontWeight="bold" color="success.main">
              {totals.totalCredit.toLocaleString()}
            </Typography>
          </Box>
          <Box sx={{ display: "flex", justifyContent: "space-between" }}>
            <Typography color="black">الفرق:</Typography>
            <Typography
              fontWeight="bold"
              color={totals.totalBalance === 0 ? "success.main" : "error"}
            >
              {totals.totalBalance.toLocaleString()}
            </Typography>
          </Box>
        </Stack>
      </Box>
  
      <Box sx={{ p: 3 }}>
        <Typography variant="h6" color="primary" fontWeight="bold" mb={3}>
          الإجراءات
        </Typography>
        <Stack spacing={2}>
          {/* Export buttons - always show when viewing journal details */}
          {!isAddMode && journalData && (
            <>
              <Button
                variant="outlined"
                startIcon={<PDFIcon sx={{ marginLeft: "10px" }} />}
                onClick={handleExportPDF}
                sx={{
                  borderColor: "#d32f2f",
                  color: "#d32f2f",
                  "&:hover": { bgcolor: "rgba(211, 47, 47, 0.1)" },
                }}
              >
                تصدير PDF
              </Button>
              <Button
                variant="outlined"
                startIcon={<ExcelIcon sx={{ marginLeft: "10px" }} />}
                onClick={handleExportExcel}
                sx={{
                  borderColor: "#2e7d32",
                  color: "#2e7d32",
                  "&:hover": { bgcolor: "rgba(46, 125, 50, 0.1)" },
                }}
              >
                تصدير Excel
              </Button>
              <Divider />
            </>
          )}
  
          {isAddMode ? (
            <>
              <Button
                variant="contained"
                startIcon={<SaveIcon sx={{ marginLeft: "10px" }} />}
                onClick={handleCreateJournal}
                disabled={!isJournalBalanced(totals.totalDebit, totals.totalCredit)}
                sx={{
                  bgcolor: "success.main",
                  "&:hover": { bgcolor: "success.dark" },
                }}
              >
                حفظ القيد
              </Button>
              <Button
                variant="outlined"
                onClick={handleCancelAdd}
                sx={{
                  borderColor: "grey.500",
                  color: "grey.700",
                }}
              >
                إلغاء
              </Button>
            </>
          ) : journalData?.status === "DRAFT" &&
            !isEditMode &&
            permissions.includes("journals_Update") ? (
            <>
              <Button
                variant="contained"
                startIcon={<EditIcon sx={{ marginLeft: "10px" }} />}
                onClick={handleEditClick}
                sx={{
                  bgcolor: "primary.main",
                  "&:hover": { bgcolor: "primary.dark" },
                }}
              >
                تعديل القيد
              </Button>
              {permissions.includes("journals_Post") && (
                <Button
                  variant="contained"
                  startIcon={<CheckIcon sx={{ marginLeft: "10px" }} />}
                  onClick={handlePostJournal}
                  sx={{
                    bgcolor: "success.main",
                    "&:hover": { bgcolor: "success.dark" },
                  }}
                >
                  اعتماد القيد
                </Button>
              )}
              {permissions.includes("journals_Delete") && (
                <Button
                  variant="outlined"
                  startIcon={<DeleteIcon sx={{ marginLeft: "10px" }} />}
                  onClick={() => {
                    setJournalToDelete(selectedJournal);
                    setIsDeleteModalOpen(true);
                  }}
                  sx={{
                    borderColor: "error.main",
                    color: "error.main",
                    "&:hover": { bgcolor: "rgba(211, 47, 47, 0.1)" },
                  }}
                >
                  حذف القيد
                </Button>
              )}
            </>
          ) : journalData?.status === "DRAFT" &&
            isEditMode &&
            permissions.includes("journals_Update") ? (
            <>
              <Button
                variant="contained"
                startIcon={<SaveIcon sx={{ marginLeft: "10px" }} />}
                onClick={handleUpdateJournal}
                disabled={!isJournalBalanced(totals.totalDebit, totals.totalCredit)}
                sx={{
                  bgcolor: "success.main",
                  "&:hover": { bgcolor: "success.dark" },
                }}
              >
                حفظ التعديلات
              </Button>
              <Button
                variant="outlined"
                onClick={handleCancelEdit}
                sx={{
                  borderColor: "grey.500",
                  color: "grey.700",
                }}
              >
                إلغاء التعديل
              </Button>
            </>
          ) : journalData?.status === "POSTED" &&
            permissions.includes("journals_Post") ? (
            <Button
              variant="outlined"
              startIcon={<CancelIcon sx={{ marginLeft: "10px" }} />}
              onClick={handleUnpostJournal}
              sx={{
                borderColor: "error.main",
                color: "error.main",
                "&:hover": { bgcolor: "rgba(211, 47, 47, 0.1)" },
              }}
            >
              إلغاء الاعتماد
            </Button>
          ) : null}
        </Stack>
      </Box>
    </Box>
  );
  
  // Update mobile actions to include export buttons
  const renderMobileActions = () => (
    <Paper sx={{ p: 2, mb: 2, borderRadius: 2 }}>
      <Typography variant="h6" color="primary" fontWeight="bold" mb={2}>
        الإجراءات
      </Typography>
      <Stack spacing={1}>
        {/* Export buttons for mobile */}
        {!isAddMode && journalData && (
          <>
            <Button
              variant="outlined"
              startIcon={<PDFIcon />}
              onClick={handleExportPDF}
              fullWidth
              size="small"
              color="error"
            >
              تصدير PDF
            </Button>
            <Button
              variant="outlined"
              startIcon={<ExcelIcon sx={{ marginLeft: "10px" }} />}
              onClick={handleExportExcel}
              fullWidth
              size="small"
              color="success"
            >
              تصدير Excel
            </Button>
          </>
        )}
  
        {isAddMode ? (
          <>
            <Button
              variant="contained"
              startIcon={<SaveIcon sx={{ marginLeft: "10px" }} />}
              onClick={handleCreateJournal}
              disabled={!isJournalBalanced(totals.totalDebit, totals.totalCredit)}
              fullWidth
              size="small"
              sx={{ bgcolor: "success.main" }}
            >
              حفظ القيد
            </Button>
            <Button
              variant="outlined"
              onClick={handleCancelAdd}
              fullWidth
              size="small"
            >
              إلغاء
            </Button>
          </>
        ) : journalData?.status === "DRAFT" &&
          !isEditMode &&
          permissions.includes("journals_Update") ? (
          <>
            <Button
              variant="contained"
              startIcon={<EditIcon sx={{ marginLeft: "10px" }} />}
              onClick={handleEditClick}
              fullWidth
              size="small"
            >
              تعديل القيد
            </Button>
            {permissions.includes("journals_Post") && (
              <Button
                variant="contained"
                startIcon={<CheckIcon sx={{ marginLeft: "10px" }} />}
                onClick={handlePostJournal}
                fullWidth
                size="small"
                sx={{ bgcolor: "success.main" }}
              >
                اعتماد القيد
              </Button>
            )}
            {permissions.includes("journals_Delete") && (
              <Button
                variant="outlined"
                startIcon={<DeleteIcon sx={{ marginLeft: "10px" }} />}
                onClick={() => {
                  setJournalToDelete(selectedJournal);
                  setIsDeleteModalOpen(true);
                }}
                fullWidth
                size="small"
                color="error"
              >
                حذف القيد
              </Button>
            )}
          </>
        ) : journalData?.status === "DRAFT" &&
          isEditMode &&
          permissions.includes("journals_Update") ? (
          <>
            <Button
              variant="contained"
              startIcon={<SaveIcon sx={{ marginLeft: "10px" }} />}
              onClick={handleUpdateJournal}
              disabled={!isJournalBalanced(totals.totalDebit, totals.totalCredit)}
              fullWidth
              size="small"
              sx={{ bgcolor: "success.main" }}
            >
              حفظ التعديلات
            </Button>
            <Button
              variant="outlined"
              onClick={handleCancelEdit}
              fullWidth
              size="small"
            >
              إلغاء التعديل
            </Button>
          </>
        ) : journalData?.status === "POSTED" &&
          permissions.includes("journals_Post") ? (
          <Button
            variant="outlined"
            startIcon={<CancelIcon sx={{ marginLeft: "10px" }} />}
            onClick={handleUnpostJournal}
            fullWidth
            size="small"
            color="error"
          >
            إلغاء الاعتماد
          </Button>
        ) : null}
      </Stack>
    </Paper>
  );
  // Render journal details for mobile
  const renderMobileJournalDetails = () => (
    <Box>
      {/* Summary Cards */}
      <Grid container spacing={2} mb={3}>
        <Grid item xs={4}>
          <Card sx={{ bgcolor: "rgba(211, 47, 47, 0.1)", textAlign: "center" }}>
            <CardContent sx={{ p: 2 }}>
              <Typography variant="body2" color="error">
                المدين
              </Typography>
              <Typography variant="h6" fontWeight="bold" color="error">
                {totals.totalDebit.toLocaleString()}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={4}>
          <Card sx={{ bgcolor: "rgba(46, 125, 50, 0.1)", textAlign: "center" }}>
            <CardContent sx={{ p: 2 }}>
              <Typography variant="body2" color="success.main">
                الدائن
              </Typography>
              <Typography variant="h6" fontWeight="bold" color="success.main">
                {totals.totalCredit.toLocaleString()}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={4}>
          <Card sx={{ bgcolor: "rgba(33, 33, 33, 0.1)", textAlign: "center" }}>
            <CardContent sx={{ p: 2 }}>
              <Typography variant="body2">الفرق</Typography>
              <Typography
                variant="h6"
                fontWeight="bold"
                color={totals.totalBalance === 0 ? "success.main" : "error"}
              >
                {totals.totalBalance.toLocaleString()}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Actions */}
      {renderMobileActions()}

      {/* Journal Info */}
      <Paper sx={{ p: 3, borderRadius: 2, mb: 2 }}>
        <Typography variant="h6" fontWeight="bold" mb={3} textAlign="center">
          معلومات القيد
        </Typography>

        <Stack spacing={2}>
          {!isAddMode && (
            <Box>
              <Typography variant="body2" color="textSecondary" gutterBottom>
                رقم القيد
              </Typography>
              <Typography variant="body1" fontWeight="bold">
                {journalData?.reference || "-"}
              </Typography>
            </Box>
          )}

          <Box>
            <Typography variant="body2" color="textSecondary" gutterBottom>
              التاريخ
            </Typography>
            {isEditMode || isAddMode ? (
              <TextField
                type="date"
                value={isAddMode ? newJournalForm.date : editForm.date}
                onChange={(e) => handleInputChange("date", e.target.value)}
                sx={{
                  width: "250px",
                }}
              />
            ) : (
              <Typography variant="body1" fontWeight="bold">
                {journalData?.date
                  ? new Date(journalData.date).toLocaleDateString("ar-EG")
                  : "-"}
              </Typography>
            )}
          </Box>

          <Box>
            <Typography variant="body2" color="textSecondary" gutterBottom>
              نوع القيد
            </Typography>
            {isEditMode || isAddMode ? (
              <TextField
                select
                value={isAddMode ? newJournalForm.type : editForm.type}
                onChange={(e) => handleInputChange("type", e.target.value)}
                sx={{
                  width: "250px",
                }}
                InputLabelProps={{ shrink: true }}
              >
                <MenuItem value="GENERAL">عام</MenuItem>
                <MenuItem value="OPENING">افتتاحي</MenuItem>
                <MenuItem value="CLOSING">ختامي</MenuItem>
                <MenuItem value="ADJUSTMENT">تسوية</MenuItem>
              </TextField>
            ) : (
              <Typography variant="body1" fontWeight="bold">
                {journalData?.type === "GENERAL"
                  ? "عام"
                  : journalData?.type === "OPENING"
                  ? "افتتاحي"
                  : journalData?.type === "CLOSING"
                  ? "ختامي"
                  : journalData?.type === "ADJUSTMENT"
                  ? "تسوية"
                  : "-"}
              </Typography>
            )}
          </Box>

          {!isAddMode && (
            <>
              <Box>
                <Typography variant="body2" color="textSecondary" gutterBottom>
                  نوع المصدر
                </Typography>
                <Typography variant="body1" fontWeight="bold">
                  {getJournalSourceTypeText(journalData?.sourceType)}
                </Typography>
              </Box>

              <Box>
                <Typography variant="body2" color="textSecondary" gutterBottom>
                  الحالة
                </Typography>
                <MuiChip
                  label={getStatusText(journalData?.status)}
                  color={
                    journalData?.status === "POSTED"
                      ? "success"
                      : journalData?.status === "DRAFT"
                      ? "warning"
                      : "error"
                  }
                  size="small"
                />
              </Box>

              <Box>
                <Typography variant="body2" color="textSecondary" gutterBottom>
                  المعتمد بواسطة
                </Typography>
                <Typography variant="body1" fontWeight="bold">
                  {journalData?.postedBy?.name || "لم يتم الاعتماد"}
                </Typography>
              </Box>
            </>
          )}

          <Box>
            <Typography variant="body2" color="textSecondary" gutterBottom>
              الوصف
            </Typography>
            {isEditMode || isAddMode ? (
              <TextField
                value={
                  isAddMode ? newJournalForm.description : editForm.description
                }
                onChange={(e) =>
                  handleInputChange("description", e.target.value)
                }
                multiline
                rows={2}
                sx={{
                  width: "250px",
                }}
                InputLabelProps={{ shrink: true }}
              />
            ) : (
              <Typography variant="body1" fontWeight="medium">
                {journalData?.description || "-"}
              </Typography>
            )}
          </Box>
        </Stack>
      </Paper>

      {/* Lines Form */}
      {(isEditMode || isAddMode) && renderLinesForm()}

      {/* Journal Lines */}
      {renderLinesList()}
    </Box>
  );

  // Render desktop journal details
  const renderDesktopJournalDetails = () => (
    <Paper sx={{ p: 4, borderRadius: 2 }}>
      <Typography
        variant="h6"
        color="primary"
        fontWeight="bold"
        mb={3}
        textAlign={"center"}
      >
        {isAddMode ? "إضافة قيد جديد" : "تفاصيل القيد"}
      </Typography>

      <Grid
        container
        spacing={3}
        mb={4}
        justifyContent="center"
        alignItems="center"
      >
        {!isAddMode && (
          <Grid item xs={12} md={6}>
            <TextField
              label="رقم القيد"
              value={journalData?.reference || ""}
              disabled
              InputLabelProps={{ shrink: true }}
              sx={{
                width: "250px",
              }}
            />
          </Grid>
        )}
        <Grid item xs={12} md={6}>
          <TextField
            label="التاريخ"
            type="date"
            value={
              isAddMode
                ? newJournalForm.date
                : isEditMode
                ? editForm.date
                : journalData?.date
                ? journalData.date.split("T")[0]
                : ""
            }
            onChange={(e) => handleInputChange("date", e.target.value)}
            disabled={!(isEditMode || isAddMode)}
            InputLabelProps={{ shrink: true }}
            sx={{
              width: "250px",
            }}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField
            label="نوع القيد"
            select
            value={
              isAddMode
                ? newJournalForm.type
                : isEditMode
                ? editForm.type
                : journalData?.type || ""
            }
            onChange={(e) => handleInputChange("type", e.target.value)}
            disabled={!(isEditMode || isAddMode)}
            InputLabelProps={{ shrink: true }}
            sx={{
              width: "250px",
            }}
          >
            <MenuItem value="GENERAL">عام</MenuItem>
            <MenuItem value="OPENING">افتتاحي</MenuItem>
            <MenuItem value="CLOSING">ختامي</MenuItem>
            <MenuItem value="ADJUSTMENT">تسوية</MenuItem>
          </TextField>
        </Grid>
        {!isAddMode && (
          <>
            <Grid item xs={12} md={6}>
              <TextField
                label="نوع المصدر"
                value={
                  journalData?.sourceType
                    ? getJournalSourceTypeText(journalData.sourceType)
                    : "لا يوجد"
                }
                disabled
                InputLabelProps={{ shrink: true }}
                sx={{
                  width: "250px",
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="الحالة"
                value={getStatusText(journalData?.status)}
                disabled
                InputLabelProps={{ shrink: true }}
                sx={{
                  width: "250px",
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="المعتمد بواسطة"
                value={journalData?.postedBy?.name || "لم يتم الاعتماد "}
                disabled
                InputLabelProps={{ shrink: true }}
                sx={{
                  width: "250px",
                }}
              />
            </Grid>
          </>
        )}
        <Grid item xs={12}>
          <TextField
            label="الوصف"
            value={
              isAddMode
                ? newJournalForm.description
                : isEditMode
                ? editForm.description
                : journalData?.description || ""
            }
            onChange={(e) => handleInputChange("description", e.target.value)}
            disabled={!(isEditMode || isAddMode)}
            multiline
            rows={1}
            InputLabelProps={{ shrink: true }}
            sx={{
              width: "450px",
            }}
          />
        </Grid>
      </Grid>

      {(isEditMode || isAddMode) && (
        <>
          <Divider sx={{ my: 3 }} />
          {renderLinesForm()}
        </>
      )}

      <Divider sx={{ my: 3 }} />
      {renderLinesList()}
    </Paper>
  );

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
        <title>القيود المحاسبية</title>
        <meta name="description" content="القيود المحاسبية" />
      </Helmet>

      <Box
        sx={{
          display: "flex",
          flexDirection: isSmallScreen ? "column" : "row-reverse",
          flex: 1,
          height: isSmallScreen ? "auto" : "calc(100vh - 80px)",
          width: "100%",
        }}
      >
        {/* Sidebar for desktop */}
        {!isSmallScreen &&
          activeTab === 1 &&
          (journalData || isAddMode) &&
          renderDesktopSidebar()}

        <Box
          sx={{
            flex: 1,
            p: isSmallScreen ? 2 : 4,
            bgcolor: "#fff",
            overflowY: "auto",
            width: "100%",
          }}
        >
          <Box sx={{ width: "100%" }}>
            {/* Tabs for desktop, simple navigation for mobile */}
            {!isSmallScreen ? (
              <Box
                sx={{
                  borderBottom: 1,
                  borderColor: "divider",
                  mb: 4,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Tabs
                  value={activeTab}
                  onChange={(e, newValue) => {
                    setActiveTab(newValue);
                    if (newValue === 0) {
                      setSelectedJournal(null);
                      setIsEditMode(false);
                      setIsAddMode(false);
                      setJournalLines([]);
                    }
                  }}
                >
                  <Tab
                    label="عرض جميع القيود"
                    sx={{
                      fontWeight: "bold",
                      borderBottom:
                        activeTab === 0 ? "3px solid #0d40a5" : "none",
                      color: activeTab === 0 ? "#0d40a5" : "text.secondary",
                    }}
                  />
                  <Tab
                    label={
                      selectedJournal || isAddMode
                        ? isAddMode
                          ? "إضافة قيد جديد"
                          : "تفاصيل القيد"
                        : "قيد محدد"
                    }
                    sx={{
                      fontWeight: "bold",
                      borderBottom:
                        activeTab === 1 ? "3px solid #0d40a5" : "none",
                      color: activeTab === 1 ? "#0d40a5" : "text.secondary",
                    }}
                  />
                </Tabs>

                {activeTab === 0 && (
                  <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    <InputBase
                      placeholder="ابحث برقم القيد..."
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value);
                      }}
                      sx={{
                        width: "280px",
                        borderRadius: "6px",
                        p: 1,
                        border: "1px solid #e0e0e0",
                        bgcolor: "background.paper"
                      }}
                    />
                    {permissions.includes("journals_Add") && (
                      <Button
                        sx={{
                          fontWeight: "bold",
                        }}
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={handleAddNewClick}
                      >
                        إضافة قيد جديد
                      </Button>
                    )}
                  </Box>
                )}
              </Box>
            ) : (
              <Box sx={{ mb: 3 }}>
                {activeTab === 1 ? (
                
                  <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                    <IconButton onClick={handleBackToList} size="small">
                      <ArrowBackIcon />
                    </IconButton>
                    <Typography variant="h6" fontWeight="bold" sx={{ ml: 1 }}>
                      {isAddMode ? "إضافة قيد جديد" : "تفاصيل القيد"}
                    </Typography>
                  </Box>
                ) : (
                  <Box>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        mb: 2,
                      }}
                    >
                      <Typography variant="h6" fontWeight="bold">
                        القيود المحاسبية
                      </Typography>
                      {permissions.includes("journals_Add") && (
                        <Button
                          variant="contained"
                          startIcon={<AddIcon />}
                          onClick={handleAddNewClick}
                          size="small"
                        >
                          إضافة
                        </Button>
                      )}
                    </Box>
                    <InputBase
                      placeholder="ابحث برقم القيد أو الوصف..."
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value);
                      }}
                      sx={{
                        width: "100%",
                        borderRadius: "6px",
                        p: 1,
                        border: "1px solid #e0e0e0",
                        bgcolor: "background.paper"
                      }}
                    />
                  </Box>
                )}
              </Box>
            )}

            {activeTab === 0 ||
            (isSmallScreen && !selectedJournal && !isAddMode) ? (
              <JournalTable
                onViewDetails={handleViewDetails}
                isMobile={isMobile}
                searchQuery={searchQuery}
              />
            ) : (
              <Box>
                {!selectedJournal && !isAddMode ? (
                  <Alert severity="info" sx={{ mt: 2 }}>
                    يرجى اختيار قيد لعرض تفاصيله
                  </Alert>
                ) : selectedJournal && isJournalLoading ? (
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      height: "100%",
                    }}
                  >
                    <CircularProgress size={20} />
                  </Box>
                ) : selectedJournal && journalData ? (
                  isSmallScreen ? (
                    renderMobileJournalDetails()
                  ) : (
                    renderDesktopJournalDetails()
                  )
                ) : isAddMode ? (
                  isSmallScreen ? (
                    renderMobileJournalDetails()
                  ) : (
                    renderDesktopJournalDetails()
                  )
                ) : (
                  <Alert severity="error">حدث خطأ في تحميل بيانات القيد</Alert>
                )}
              </Box>
            )}
          </Box>
        </Box>
      </Box>

      <DeleteModal
        open={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setJournalToDelete(null);
        }}
        onConfirm={handleDeleteJournal}
        title="حذف القيد"
        message="هل أنت متأكد من حذف هذا القيد؟"
        ButtonText="حذف"
      />
    </Box>
  );
};

export default Journals;
