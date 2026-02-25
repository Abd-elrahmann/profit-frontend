import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { Helmet } from 'react-helmet-async';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { CircularProgress, Alert } from '@mui/material';
import { getAccountsTree, deleteAccount } from './chartApi';
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
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('tree');
  const [expandedIds, setExpandedIds] = useState(() => new Set());
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [parentAccount, setParentAccount] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [accountToDelete, setAccountToDelete] = useState(null);
  const hasInitialExpand = useRef(false);

  const { data: accountsTree = [], isLoading, error } = useQuery({
    queryKey: ['accountsTree'],
    queryFn: getAccountsTree,
  });

  useEffect(() => {
    if (accountsTree.length > 0 && !hasInitialExpand.current) {
      hasInitialExpand.current = true;
      setExpandedIds(new Set(accountsTree.map((a) => a.id)));
    }
  }, [accountsTree]);

  const flatAccounts = useMemo(
    () =>
      viewMode === 'list'
        ? flattenAccountsTree(accountsTree, 0, new Set(), true)
        : flattenAccountsTree(accountsTree, 0, expandedIds),
    [accountsTree, expandedIds, viewMode]
  );

  const filteredAccounts = useMemo(() => {
    if (!searchQuery.trim()) return flatAccounts;
    const q = searchQuery.toLowerCase();
    return flatAccounts.filter(
      (a) =>
        (a.code && a.code.toString().toLowerCase().includes(q)) ||
        (a.name && a.name.toLowerCase().includes(q))
    );
  }, [flatAccounts, searchQuery]);

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
        <title>شجرة الحسابات - النظام المالي الذكي</title>
      </Helmet>

      <div className="flex flex-col min-h-screen  dark:bg-background-dark">
        <ChartOfAccountsHeader
          onAddClick={handleAddRoot}
          onExportPDF={handleExportPDF}
          onExportExcel={handleExportExcel}
          canAdd={canAdd}
        />

        <div className="flex-1 p-6 md:p-8 space-y-6">
          <section className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <ChartOfAccountsSearch value={searchQuery} onChange={setSearchQuery} />
            <ChartOfAccountsViewToggle view={viewMode} onChange={setViewMode} />
          </section>

          <section>
            <ChartOfAccountsTable
              flatAccounts={filteredAccounts}
              expandedIds={expandedIds}
              onToggleExpand={toggleExpand}
              onAddChild={handleAddChild}
              onEdit={handleEdit}
              onDelete={handleDelete}
              canAdd={canAdd}
              canUpdate={canUpdate}
              canDelete={canDelete}
              viewMode={viewMode}
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
