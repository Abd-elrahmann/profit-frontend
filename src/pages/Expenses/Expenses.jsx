import React, { useState, useCallback } from 'react';
import { TablePagination, useMediaQuery } from '@mui/material';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { getExpenses, deleteExpense, getUsersForExpenses } from './expensesApi';
import { usePermissions } from '../../components/Contexts/PermissionsContext';
import AddExpense from '../../components/modals/AddExpense';
import EditExpense from '../../components/modals/EditExpense';
import DeleteModal from '../../components/modals/DeleteModal';
import ExpenseExportFilterModal from '../../components/modals/ExpenseExportFilterModal';
import {
  ExpensesToolbar,
  ExpensesTable,
  ExpensesCards,
  ExpensesSummaryCards,
  groupExpensesByJournal,
} from '../../components/Expenses';
import { exportExpensesToExcel, exportExpensesToPDF } from '../../utilities/expensesExporter';
import { notifySuccess, notifyError } from '../../utilities/toastify';

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
  const [isExportFilterModalOpen, setIsExportFilterModalOpen] = useState(false);
  const [selectedExpenseTypes, setSelectedExpenseTypes] = useState([]);
  const [selectedEmployees, setSelectedEmployees] = useState([]);
  const [exportFormat, setExportFormat] = useState('');

  const isMobile = useMediaQuery('(max-width: 480px)');
  const isTablet = useMediaQuery('(max-width: 768px)');
  const isSmallScreen = isMobile || isTablet;

  const { permissions } = usePermissions();
  const queryClient = useQueryClient();
  const canExport = permissions.includes('expenses_Export');

  const { data: expensesData, isLoading } = useQuery({
    queryKey: ['expenses', page],
    queryFn: () => getExpenses(page),
    retry: 1,
  });

  const { data: employeesData } = useQuery({
    queryKey: ['employees-for-expenses'],
    queryFn: () => getUsersForExpenses(),
    retry: 1,
  });

  const deleteExpenseMutation = useMutation({
    mutationFn: deleteExpense,
    onSuccess: () => {
      notifySuccess('تم حذف المصروفات بنجاح');
      queryClient.invalidateQueries(['expenses']);
    },
    onError: (error) => {
      notifyError(error.response?.data?.message || 'حدث خطأ أثناء حذف المصروفات');
    },
  });

  const groupedExpenses = expensesData ? groupExpensesByJournal(expensesData.expenses) : [];

  const filterAndExport = useCallback(
    (expenseTypes, employeeIds, exportFn) => {
      const rows = expensesData?.expenses || [];
      if (!rows.length) {
        notifyError('لا توجد بيانات للتصدير');
        return;
      }

      let filtered = expenseTypes.length > 0 ? rows.filter((exp) => expenseTypes.includes(exp.type)) : rows;
      if (employeeIds.length > 0) {
        filtered = filtered.filter((exp) =>
          exp.employee && employeeIds.includes(exp.employee.id || exp.employee._id)
        );
      }

      if (!filtered.length) {
        const msg =
          employeeIds.length > 0
            ? `لا توجد مصروفات لـ ${selectedEmployees.map((e) => e.name).join('، ')}`
            : expenseTypes.length > 0
            ? 'لا توجد مصاريف من الأنواع المحددة'
            : 'لا توجد مصروفات';
        notifyError(msg);
        return;
      }

      const typeLabel = expenseTypes.length > 0 ? expenseTypes.join(', ') : '';
      const employeeNamesLabel = selectedEmployees.length > 0 ? selectedEmployees.map((e) => e.name).join('، ') : '';
      exportFn(filtered, typeLabel, employeeNamesLabel);
    },
    [expensesData, selectedEmployees]
  );

  const handleExportPDF = useCallback(
    (expenseTypes = [], employeeIds = []) => {
      filterAndExport(expenseTypes, employeeIds, exportExpensesToPDF);
      setPdfAnchorEl(null);
    },
    [filterAndExport]
  );

  const handleExportExcel = useCallback(
    (expenseTypes = [], employeeIds = []) => {
      filterAndExport(expenseTypes, employeeIds, exportExpensesToExcel);
      setExcelAnchorEl(null);
    },
    [filterAndExport]
  );

  const handleOpenExportFilterModal = (format) => {
    setExportFormat(format);
    setSelectedExpenseTypes([]);
    setSelectedEmployees([]);
    setIsExportFilterModalOpen(true);
    setPdfAnchorEl(null);
    setExcelAnchorEl(null);
  };

  const handleCloseExportFilterModal = () => {
    setIsExportFilterModalOpen(false);
    setSelectedExpenseTypes([]);
    setSelectedEmployees([]);
    setExportFormat('');
  };

  const handleConfirmExport = () => {
    const employeeIds = selectedEmployees.map((emp) => emp.id || emp._id);
    if (exportFormat === 'pdf') {
      handleExportPDF(selectedExpenseTypes, employeeIds);
    } else if (exportFormat === 'excel') {
      handleExportExcel(selectedExpenseTypes, employeeIds);
    }
    handleCloseExportFilterModal();
  };

  const toggleRowExpansion = (journalId) => {
    setExpandedRows((prev) =>
      prev.includes(journalId) ? prev.filter((id) => id !== journalId) : [...prev, journalId]
    );
  };

  const handleSuccess = () => {
    queryClient.invalidateQueries(['expenses']);
    setExpandedRows([]);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage + 1);
    setExpandedRows([]);
  };

  const totalAmount = expensesData?.expenses?.reduce((sum, e) => sum + e.amount, 0) ?? 0;
  const totalCount = expensesData?.expenses?.length ?? 0;

  return (
    <>
      <Helmet>
        <title>المصروفات - نظام إدارة السلف</title>
      </Helmet>
      <div className="w-full space-y-8 bg-background-light dark:bg-background-dark">
        {/* Page Title and Actions */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100">إدارة المصروفات</h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">عرض وإدارة كافة المصروفات المسجلة في النظام</p>
          </div>
          <ExpensesToolbar
            isMobile={isMobile}
            hasAddPermission={permissions.includes('expenses_Add')}
            hasExportPermission={canExport}
            hasExpenses={!!groupedExpenses.length}
            onAddClick={() => setIsAddModalOpen(true)}
            onPdfMenuOpen={(e) => setPdfAnchorEl(e.currentTarget)}
            onExcelMenuOpen={(e) => setExcelAnchorEl(e.currentTarget)}
            pdfAnchorEl={pdfAnchorEl}
            excelAnchorEl={excelAnchorEl}
            onPdfMenuClose={() => setPdfAnchorEl(null)}
            onExcelMenuClose={() => setExcelAnchorEl(null)}
            onExportAllPdf={() => handleExportPDF([])}
            onExportAllExcel={() => handleExportExcel([])}
            onExportFilterPdf={() => handleOpenExportFilterModal('pdf')}
            onExportFilterExcel={() => handleOpenExportFilterModal('excel')}
          />
        </div>

        {/* KPI Section */}
        {!isLoading && expensesData?.expenses?.length > 0 && (
          <ExpensesSummaryCards totalAmount={totalAmount} totalCount={totalCount} />
        )}

        {/* Table Section */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-primary/10 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-primary/5">
            <h4 className="font-bold text-slate-800 dark:text-slate-200">سجل المصروفات</h4>
          </div>
          <div className="overflow-x-auto">
            {isSmallScreen ? (
              <ExpensesCards
                groupedExpenses={groupedExpenses}
                isLoading={isLoading}
                expandedRows={expandedRows}
                onToggleExpand={toggleRowExpansion}
                onEdit={(group) => {
                  setSelectedExpense(group);
                  setIsEditModalOpen(true);
                }}
                onDelete={(journalId) => {
                  setExpenseToDelete(journalId);
                  setIsDeleteModalOpen(true);
                }}
                canUpdate={permissions.includes('expenses_Update')}
                canDelete={permissions.includes('expenses_Delete')}
                isDeleting={deleteExpenseMutation.isLoading}
                isMobile={isMobile}
              />
            ) : (
              <ExpensesTable
                groupedExpenses={groupedExpenses}
                isLoading={isLoading}
                page={page}
                limit={expensesData?.limit || 10}
                expandedRows={expandedRows}
                onToggleExpand={toggleRowExpansion}
                onEdit={(group) => {
                  setSelectedExpense(group);
                  setIsEditModalOpen(true);
                }}
                onDelete={(journalId) => {
                  setExpenseToDelete(journalId);
                  setIsDeleteModalOpen(true);
                }}
                canUpdate={permissions.includes('expenses_Update')}
                canDelete={permissions.includes('expenses_Delete')}
                isDeleting={deleteExpenseMutation.isLoading}
              />
            )}
          </div>

          {/* Pagination */}
          {expensesData && expensesData.total > 0 && (
            <div className="p-4 bg-slate-50/50 dark:bg-slate-800/30 border-t border-primary/5">
              <TablePagination
                component="div"
                count={expensesData.total || 0}
                page={page - 1}
                onPageChange={handleChangePage}
                rowsPerPage={expensesData.limit || 10}
                rowsPerPageOptions={[]}
                labelRowsPerPage=""
                labelDisplayedRows={({ from, to, count }) => `عرض ${from}-${to} من أصل ${count} مصروف`}
                sx={{
                  border: 'none',
                  '& .MuiTablePagination-toolbar': { padding: 0, minHeight: 'auto' },
                  '& .MuiTablePagination-selectLabel': { display: 'none' },
                  '& .MuiTablePagination-select': { display: 'none' },
                  '& .MuiTablePagination-displayedRows': { margin: 0 },
                }}
              />
            </div>
          )}
        </div>
      </div>

      <AddExpense open={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} onSuccess={handleSuccess} isMobile={isMobile} />

      {selectedExpense && (
        <EditExpense
          open={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setSelectedExpense(null);
          }}
          onSuccess={handleSuccess}
          expense={selectedExpense}
          isMobile={isMobile}
        />
      )}

      <DeleteModal
        open={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setExpenseToDelete(null);
        }}
        onConfirm={() => {
          if (expenseToDelete) {
            deleteExpenseMutation.mutate(expenseToDelete);
            setIsDeleteModalOpen(false);
            setExpenseToDelete(null);
          }
        }}
        title="حذف المصروفات"
        message="هل أنت متأكد من حذف هذه المجموعة من المصروفات؟ لا يمكن التراجع عن هذا الإجراء."
        isLoading={deleteExpenseMutation.isLoading}
        ButtonText="حذف المصروفات"
      />

      <ExpenseExportFilterModal
        open={isExportFilterModalOpen}
        onClose={handleCloseExportFilterModal}
        selectedExpenseTypes={selectedExpenseTypes}
        onExpenseTypesChange={setSelectedExpenseTypes}
        selectedEmployees={selectedEmployees}
        onEmployeesChange={setSelectedEmployees}
        employeesOptions={Array.isArray(employeesData) ? employeesData : []}
        onConfirm={handleConfirmExport}
      />
    </>
  );
};

export default Expenses;
