import React, { useState, useCallback } from 'react';
import { AccountBalanceWallet } from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { notifySuccess, notifyError } from '../../utilities/toastify';
import { getCompanyProfitReport } from './CompanyProfitApi';
import { exportCompanyProfitToPDF, exportCompanyProfitToExcel } from '../../utilities/companyProfitExporter';
import { usePermissions } from '../../components/Contexts/PermissionsContext';
import WithdrawCompanyProfitModal from '../../components/modals/WithdrawCompanyProfitModal';
import {
  CompanyProfitKPICards,
  CompanyProfitBalanceChart,
  CompanyProfitSummarySection,
  CompanyProfitSourcesTableTailwind,
  CompanyProfitWithdrawalsTable,
} from '../../components/CompanyProfit';
export default function CompanyProfit() {
  const [withdrawModalOpen, setWithdrawModalOpen] = useState(false);
  const [profitPage, setProfitPage] = useState(1);
  const [isExporting, setIsExporting] = useState(false);
  const { permissions } = usePermissions();
  const { data: profitData, isLoading, error, refetch } = useQuery({
    queryKey: ['company-profit', profitPage],
    queryFn: () => getCompanyProfitReport(profitPage),
    retry: 1,
  });
  const handleWithdrawModalOpen = () => setWithdrawModalOpen(true);
  const handleWithdrawModalClose = () => setWithdrawModalOpen(false);
  const handleExportPDF = useCallback(async () => {
    if (!profitData) return;
    setIsExporting(true);
    try {
      await exportCompanyProfitToPDF(profitData);
      notifySuccess('تم تصدير PDF بنجاح');
    } catch (e) {
      notifyError('حدث خطأ أثناء تصدير PDF');
    } finally {
      setIsExporting(false);
    }
  }, [profitData]);
  const handleExportExcel = useCallback(async () => {
    if (!profitData) return;
    setIsExporting(true);
    try {
      await exportCompanyProfitToExcel(profitData);
      notifySuccess('تم تصدير Excel بنجاح');
    } catch (e) {
      notifyError('حدث خطأ أثناء تصدير Excel');
    } finally {
      setIsExporting(false);
    }
  }, [profitData]);
  const chartData = profitData?.balanceChartData || [];
  const withdrawals = profitData?.data || [];
  const totalPages = profitData?.totalPages || 1;
  const limit = profitData?.limit || 10;
  const totalWithdrawals = profitData?.totalWithdrawals || 0;
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="w-12 h-12 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
      </div>
    );
  }
  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4">
          <p className="text-red-700 dark:text-red-400">
            حدث خطأ في تحميل بيانات أرباح الشركة: {error.message}
          </p>
        </div>
      </div>
    );
  }
  return (
    <div className="w-full">
      <Helmet>
        <title>أرباح الشركة</title>
        <meta name="description" content="إدارة أرباح الشركة وسحب الأرباح" />
      </Helmet>
      <div className="space-y-8">
        {}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white">أرباح الشركة</h2>
            <p className="text-slate-500 text-sm mt-1">متابعة العوائد المالية وعمليات السحب الخاصة بالمؤسسة</p>
          </div>
          {permissions?.includes('company_Add') && (
            <button
              onClick={handleWithdrawModalOpen}
              disabled={!profitData?.availableAmount || profitData.availableAmount <= 0}
              className="flex items-center gap-2 bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg shadow-primary/30"
            >
              <AccountBalanceWallet sx={{ fontSize: 22 }} />
              طلب سحب أرباح
            </button>
          )}
        </div>
        <CompanyProfitKPICards profitData={profitData} />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <CompanyProfitBalanceChart chartData={chartData} />
          <CompanyProfitSummarySection profitData={profitData} />
        </div>
        {profitData?.periodsProfit?.periods?.length > 0 && (
          <CompanyProfitSourcesTableTailwind periods={profitData.periodsProfit.periods} />
        )}
        <CompanyProfitWithdrawalsTable
          withdrawals={withdrawals}
          totalPages={totalPages}
          limit={limit}
          totalWithdrawals={totalWithdrawals}
          profitPage={profitPage}
          onPageChange={setProfitPage}
          permissions={permissions}
          isExporting={isExporting}
          onExportPDF={handleExportPDF}
          onExportExcel={handleExportExcel}
        />
      </div>
      <WithdrawCompanyProfitModal
        open={withdrawModalOpen}
        onClose={handleWithdrawModalClose}
        availableAmount={profitData?.availableAmount}
        onSuccess={refetch}
      />
    </div>
  );
}