import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { CircularProgress, Alert, useMediaQuery } from '@mui/material';
import { getAccountsTree, searchAccountsTree, deleteAccount } from './chartApi';
import { notifySuccess, notifyError } from '../../utilities/toastify';
import { usePermissions } from '../../components/Contexts/PermissionsContext';
import DeleteModal from '../../components/modals/DeleteModal';
import AddEditAccountModal from '../../components/modals/AddEditAccountModal';
import {
  ChartOfAccountsHeader,
  ChartOfAccountsSearch,
  ChartOfAccountsViewToggle,
  ChartOfAccountsTable,
  flattenAccountsTree,
} from '../../components/ChartOfAccounts';
import { exportChartOfAccountsToPDF, exportChartOfAccountsToExcel } from '../../utilities/chartOfAccountsExporter';
const ChartOfAccount = () => {
  const queryClient = useQueryClient();
  const { permissions } = usePermissions();
  const isMobile = useMediaQuery('(max-width: 768px)');
  const isTablet = useMediaQuery('(max-width: 1024px)');
  const isSmallScreen = isMobile || isTablet;
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('tree');
  const [expandedIds, setExpandedIds] = useState(() => new Set());
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [parentAccount, setParentAccount] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [accountToDelete, setAccountToDelete] = useState(null);
  const [debouncedSearch, setDebouncedSearch] = useState('');
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchQuery), 400);
    return () => clearTimeout(t);
  }, [searchQuery]);
  const trimmedSearch = debouncedSearch.trim();
  const { data: accountsTree = [], isLoading, error, isFetching } = useQuery({
    queryKey: ['accountsTree', trimmedSearch],
    queryFn: () =>
      trimmedSearch ? searchAccountsTree(trimmedSearch) : getAccountsTree(),
  });
  useEffect(() => {
    if (!accountsTree?.length) return;
    const collectIds = (nodes, acc = []) => {
      for (const n of nodes) {
        acc.push(n.id);
        if (n.children?.length) collectIds(n.children, acc);
      }
      return acc;
    };
    if (trimmedSearch) {
      setExpandedIds(new Set(collectIds(accountsTree)));
    } else {
      setExpandedIds(new Set(accountsTree.map((a) => a.id)));
    }
  }, [accountsTree, trimmedSearch]);
  const flatAccounts = useMemo(
    () =>
      viewMode === 'list'
        ? flattenAccountsTree(accountsTree, 0, new Set(), true)
        : flattenAccountsTree(accountsTree, 0, expandedIds),
    [accountsTree, expandedIds, viewMode]
  );
  const toggleExpand = useCallback((id) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);
  const handleAddRoot = () => {
    setModalMode('add');
    setParentAccount(null);
    setSelectedAccount(null);
    setModalOpen(true);
  };
  const handleAddChild = (parent) => {
    setModalMode('add');
    setParentAccount(parent);
    setSelectedAccount(null);
    setModalOpen(true);
  };
  const handleEdit = (account) => {
    setModalMode('edit');
    setSelectedAccount(account);
    setParentAccount(null);
    setModalOpen(true);
  };
  const handleDelete = (account) => {
    setAccountToDelete(account);
    setDeleteModalOpen(true);
  };
  const handleConfirmDelete = async () => {
    if (!accountToDelete) return;
    try {
      await deleteAccount(accountToDelete.id);
      notifySuccess('تم حذف الحساب بنجاح');
      queryClient.invalidateQueries(['accountsTree']);
      setDeleteModalOpen(false);
      setAccountToDelete(null);
    } catch (err) {
      notifyError(err.response?.data?.message || 'فشل الحذف');
    }
  };
  const handleExportPDF = async () => {
    try {
      await exportChartOfAccountsToPDF(accountsTree);
      notifySuccess('تم تصدير PDF بنجاح');
    } catch (err) {
      notifyError(err.message || 'حدث خطأ أثناء التصدير');
    }
  };
  const handleExportExcel = async () => {
    try {
      await exportChartOfAccountsToExcel(accountsTree);
      notifySuccess('تم تصدير Excel بنجاح');
    } catch (err) {
      notifyError(err.message || 'حدث خطأ أثناء التصدير');
    }
  };
  const handleModalSuccess = () => {
    queryClient.invalidateQueries(['accountsTree']);
  };
  const canAdd = permissions.includes('accounts_Add');
  const canUpdate = permissions.includes('accounts_Update');
  const canDelete = permissions.includes('accounts_Delete');
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <CircularProgress />
      </div>
    );
  }
  if (error) {
    return (
      <Alert severity="error">
        فشل تحميل الحسابات: {error.message}
      </Alert>
    );
  }
  return (
    <>
      <Helmet>
        <title>دليل الحسابات - النظام المالي الذكي</title>
      </Helmet>
      <div className="flex flex-col min-h-screen  dark:bg-background-dark">
        <ChartOfAccountsHeader
          onAddClick={handleAddRoot}
          onExportPDF={handleExportPDF}
          onExportExcel={handleExportExcel}
          canAdd={canAdd}
          isSmallScreen={isSmallScreen}
        />
        <div className={`flex-1 space-y-6 ${isSmallScreen ? 'p-4' : 'p-6 md:p-8'}`}>
          <section className={`flex flex-col gap-4 ${isSmallScreen ? '' : 'md:flex-row md:items-center md:justify-between'}`}>
            <ChartOfAccountsSearch value={searchQuery} onChange={setSearchQuery} isSmallScreen={isSmallScreen} />
            <ChartOfAccountsViewToggle view={viewMode} onChange={setViewMode} isSmallScreen={isSmallScreen} />
          </section>
          <section className="relative">
            {isFetching && !isLoading && (
              <div className="absolute left-0 top-0 z-10 pointer-events-none">
                <span className="text-xs text-slate-500 dark:text-slate-400">جاري البحث...</span>
              </div>
            )}
            <ChartOfAccountsTable
              flatAccounts={flatAccounts}
              expandedIds={expandedIds}
              onToggleExpand={toggleExpand}
              onAddChild={handleAddChild}
              onEdit={handleEdit}
              onDelete={handleDelete}
              canAdd={canAdd}
              canUpdate={canUpdate}
              canDelete={canDelete}
              viewMode={viewMode}
              isSmallScreen={isSmallScreen}
            />
          </section>
        </div>
      </div>
      <AddEditAccountModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        account={modalMode === 'edit' ? selectedAccount : null}
        parentAccount={modalMode === 'add' ? parentAccount : null}
        onSuccess={handleModalSuccess}
        isEdit={modalMode === 'edit'}
      />
      <DeleteModal
        open={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setAccountToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        title="حذف الحساب"
        message={`هل أنت متأكد من رغبتك في حذف الحساب "${accountToDelete?.name}"؟ لا يمكن التراجع عن هذا الإجراء.`}
      />
    </>
  );
};
export default ChartOfAccount;