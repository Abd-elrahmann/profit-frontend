import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Box, Alert, CircularProgress, useMediaQuery } from "@mui/material";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Helmet } from "react-helmet-async";

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
import AdvancedSearchModal from "../../components/modals/AdvancedSearchModal";
import { usePermissions } from "../../components/Contexts/PermissionsContext";
import { useTheme } from "../../theme/ThemeContext";
import { exportJournalToPDF, exportJournalToExcel } from "../../utilities/journalsExporter";

import {
  JournalsHeader,
  JournalsSidebar,
  JournalsJournalDetails,
  flattenAccountsTree,
  isJournalBalanced,
  mapJournalLinesFromApi,
  calculateTotals,
  calculateTotalsForTable,
} from "../../components/Journals";

const Journals = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [selectedJournal, setSelectedJournal] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isAddMode, setIsAddMode] = useState(false);
  const [journalToDelete, setJournalToDelete] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchFilters, setSearchFilters] = useState({});
  const [isAdvancedSearchOpen, setIsAdvancedSearchOpen] = useState(false);
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

  const location = useLocation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { permissions } = usePermissions();
  const { isDarkMode } = useTheme();

  const isMobile = useMediaQuery("(max-width: 480px)");
  const isTablet = useMediaQuery("(max-width: 768px)");
  const isSmallScreen = isMobile || isTablet;

  const fromPeriod = location.state?.fromPeriod;
  const fromProfitDistribution = location.state?.fromProfitDistribution;
  const fromInvestorsWithdrawal = location.state?.fromInvestorsWithdrawal;
  const investorId = location.state?.investorId;

  const { data: journalData, isLoading: isJournalLoading } = useQuery({
    queryKey: ["journal", selectedJournal],
    queryFn: () => getJournalById(selectedJournal),
    enabled: !!selectedJournal && activeTab === 1,
  });

  useEffect(() => {
    if (journalData && selectedJournal) {
      setEditForm({
        description: journalData.description || "",
        date: journalData.date ? journalData.date.split("T")[0] : "",
        type: journalData.type || "",
      });
      setJournalLines(mapJournalLinesFromApi(journalData.lines));
    } else if (!selectedJournal) {
      setJournalLines([]);
    }
  }, [journalData, selectedJournal]);

  useEffect(() => {
    const fetchChartAccounts = async () => {
      try {
        const accountsTree = await getChartOfAccounts();
        setChartAccounts(flattenAccountsTree(accountsTree || []));
      } catch (error) {
        console.error("Error fetching chart accounts:", error);
      }
    };
    fetchChartAccounts();
  }, []);

  useEffect(() => {
    const { journalId, activeTab: targetTab } = location.state || {};
    if (journalId) {
      setSelectedJournal(journalId);
      setActiveTab(targetTab || 1);
      setIsEditMode(false);
      setIsAddMode(false);
    }
  }, [location.state]);

  const handleTabChange = (newValue) => {
    setActiveTab(newValue);
    if (newValue === 0) {
      setSelectedJournal(null);
      setIsEditMode(false);
      setIsAddMode(false);
      setJournalLines([]);
    }
  };

  const handleSearchChange = (value) => {
    setSearchQuery(value);
    if (value) setSearchFilters({});
  };

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
    setCurrentLine({ accountId: "", debit: "", credit: "", description: "" });
  };

  const handleAddNewClick = () => {
    setIsAddMode(true);
    setIsEditMode(false);
    setActiveTab(1);
    setSelectedJournal(null);
    setJournalLines([]);
    setEditingLineIndex(null);
    setCurrentLine({ accountId: "", debit: "", credit: "", description: "" });
    setNewJournalForm({
      description: "",
      date: new Date().toISOString().split("T")[0],
      type: "GENERAL",
    });
  };

  const handleBackToPeriodClosing = () => navigate("/period-closing");
  const handleBackToProfitDistribution = () => navigate("/profit-distribution");
  const handleBackToInvestorsWithdrawal = () =>
    navigate("/investors-withdraw", { state: { investorId, activeTab: 1 } });

  const handleEditClick = () => setIsEditMode(true);

  const handleCancelEdit = () => {
    setIsEditMode(false);
    if (journalData) {
      setEditForm({
        description: journalData.description || "",
        date: journalData.date ? journalData.date.split("T")[0] : "",
        type: journalData.type || "",
      });
      setJournalLines(mapJournalLinesFromApi(journalData.lines));
    }
  };

  const handleCancelAdd = () => {
    setIsAddMode(false);
    setJournalLines([]);
    setEditingLineIndex(null);
    setCurrentLine({ accountId: "", debit: "", credit: "", description: "" });
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
      balance: (currentLine.debit || 0) - (currentLine.credit || 0),
    };

    if (editingLineIndex !== null) {
      const updatedLines = [...journalLines];
      updatedLines[editingLineIndex] = newLine;
      setJournalLines(updatedLines);
      setEditingLineIndex(null);
    } else {
      setJournalLines((prev) => [...prev, newLine]);
    }

    setCurrentLine({ accountId: "", debit: "", credit: "", description: "" });
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
      setCurrentLine({ accountId: "", debit: "", credit: "", description: "" });
    }
  };

  const handleLineInputChange = (field, value) => {
    setCurrentLine((prev) => ({ ...prev, [field]: value }));
  };

  const handleInputChange = (field, value) => {
    if (isAddMode) {
      setNewJournalForm((prev) => ({ ...prev, [field]: value }));
    } else {
      setEditForm((prev) => ({ ...prev, [field]: value }));
    }
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
        `القيد غير متوازن! إجمالي المدين: ${Math.round(totalDebit).toLocaleString()} ≠ إجمالي الدائن: ${Math.round(totalCredit).toLocaleString()}`
      );
      return;
    }

    try {
      await createJournal({
        description: newJournalForm.description,
        date: newJournalForm.date,
        type: newJournalForm.type,
        lines: journalLines.map((line) => ({
          accountId: line.accountId,
          debit: parseFloat(line.debit || 0),
          credit: parseFloat(line.credit || 0),
          description: line.description,
        })),
      });
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
        `القيد غير متوازن! إجمالي المدين: ${Math.round(totalDebit).toLocaleString()} ≠ إجمالي الدائن: ${Math.round(totalCredit).toLocaleString()}`
      );
      return;
    }

    try {
      await updateJournal(selectedJournal, {
        description: editForm.description,
        date: editForm.date,
        type: editForm.type,
        lines: journalLines.map((line) => ({
          accountId: line.accountId,
          debit: parseFloat(line.debit || 0),
          credit: parseFloat(line.credit || 0),
          description: line.description,
        })),
      });
      notifySuccess("تم تعديل القيد بنجاح");
      setIsEditMode(false);
      queryClient.invalidateQueries(["journal", selectedJournal]);
      queryClient.invalidateQueries(["journals"]);
    } catch (error) {
      notifyError(error.response?.data?.message || "حدث خطأ أثناء تعديل القيد");
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
      console.error("PDF export error:", error);
    }
  };

  const handleExportExcel = async () => {
    if (!journalData) return;
    try {
      await exportJournalToExcel(journalData);
      notifySuccess("تم تصدير القيد إلى Excel بنجاح");
    } catch (error) {
      notifyError("حدث خطأ أثناء تصدير Excel");
      console.error("Excel export error:", error);
    }
  };

  const handleAdvancedSearch = (filters) => {
    setSearchFilters(filters);
    setSearchQuery("");
  };

  const totals = calculateTotals(
    journalData,
    journalLines,
    editingLineIndex,
    currentLine
  );
  const totalsForTable = calculateTotalsForTable(journalData, journalLines);

  const searchFiltersForTable = searchQuery
    ? { search: searchQuery }
    : searchFilters;

  const showJournalDetails =
    (selectedJournal && journalData) || (isAddMode && activeTab === 1);

  return (
    <Box
      sx={{
        bgcolor: isDarkMode ? "background.default" : "#f6f6f8",
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
        {!isSmallScreen &&
          activeTab === 1 &&
          showJournalDetails &&
          (
            <JournalsSidebar
              totals={totals}
              isAddMode={isAddMode}
              journalData={journalData}
              isEditMode={isEditMode}
              permissions={permissions}
              isJournalBalanced={isJournalBalanced}
              onExportPDF={handleExportPDF}
              onExportExcel={handleExportExcel}
              onCreateJournal={handleCreateJournal}
              onCancelAdd={handleCancelAdd}
              onEditClick={handleEditClick}
              onPostJournal={handlePostJournal}
              onDeleteClick={() => {
                setJournalToDelete(selectedJournal);
                setIsDeleteModalOpen(true);
              }}
              onUpdateJournal={handleUpdateJournal}
              onCancelEdit={handleCancelEdit}
              onUnpostJournal={handleUnpostJournal}
            />
          )}

        <Box
          sx={{
            flex: 1,
            p: isSmallScreen ? 2 : 3,
            bgcolor: "background.paper",
            overflowY: "auto",
            width: "100%",
          }}
        >
          <Box sx={{ width: "100%" }}>
            <JournalsHeader
              activeTab={activeTab}
              onTabChange={handleTabChange}
              selectedJournal={selectedJournal}
              isAddMode={isAddMode}
              searchQuery={searchQuery}
              onSearchChange={handleSearchChange}
              searchFilters={searchFilters}
              onOpenAdvancedSearch={() => setIsAdvancedSearchOpen(true)}
              onClearSearch={() => {
                setSearchFilters({});
                setSearchQuery("");
              }}
              onAddNew={handleAddNewClick}
              fromPeriod={fromPeriod}
              fromProfitDistribution={fromProfitDistribution}
              fromInvestorsWithdrawal={fromInvestorsWithdrawal}
              onBackToPeriodClosing={handleBackToPeriodClosing}
              onBackToProfitDistribution={handleBackToProfitDistribution}
              onBackToInvestorsWithdrawal={handleBackToInvestorsWithdrawal}
              onBackToList={handleBackToList}
              isSmallScreen={isSmallScreen}
              permissions={permissions}
            />

            {activeTab === 0 ||
            (isSmallScreen && !selectedJournal && !isAddMode) ? (
              <JournalTable
                onViewDetails={handleViewDetails}
                isMobile={isMobile}
                searchFilters={searchFiltersForTable}
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
                ) : showJournalDetails ? (
                  <JournalsJournalDetails
                    journalData={journalData}
                    editForm={editForm}
                    newJournalForm={newJournalForm}
                    isAddMode={isAddMode}
                    isEditMode={isEditMode}
                    journalLines={journalLines}
                    totals={totals}
                    totalsForTable={totalsForTable}
                    currentLine={currentLine}
                    chartAccounts={chartAccounts}
                    editingLineIndex={editingLineIndex}
                    isSmallScreen={isSmallScreen}
                    isDarkMode={isDarkMode}
                    permissions={permissions}
                    isJournalBalanced={isJournalBalanced}
                    onInputChange={handleInputChange}
                    onLineInputChange={handleLineInputChange}
                    onAddLine={handleAddLine}
                    onEditLine={handleEditLine}
                    onDeleteLine={handleDeleteLine}
                    onExportPDF={handleExportPDF}
                    onExportExcel={handleExportExcel}
                    onCreateJournal={handleCreateJournal}
                    onCancelAdd={handleCancelAdd}
                    onEditClick={handleEditClick}
                    onPostJournal={handlePostJournal}
                    onDeleteClick={() => {
                      setJournalToDelete(selectedJournal);
                      setIsDeleteModalOpen(true);
                    }}
                    onUpdateJournal={handleUpdateJournal}
                    onCancelEdit={handleCancelEdit}
                    onUnpostJournal={handleUnpostJournal}
                  />
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

      <AdvancedSearchModal
        open={isAdvancedSearchOpen}
        onClose={() => setIsAdvancedSearchOpen(false)}
        onSearch={handleAdvancedSearch}
      />
    </Box>
  );
};

export default Journals;
