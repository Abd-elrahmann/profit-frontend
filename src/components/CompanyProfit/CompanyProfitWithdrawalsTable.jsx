import React from 'react';
import { AccountBalanceWallet, Download, TableChart, ChevronRight, ChevronLeft } from '@mui/icons-material';
import { formatNum } from './companyProfitUtils';
const formatDateAr = (dateStr) => {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleDateString('ar-SA', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
};
const CompanyProfitWithdrawalsTable = ({
  withdrawals,
  totalPages,
  limit,
  totalWithdrawals,
  profitPage,
  onPageChange,
  permissions,
  isExporting,
  onExportPDF,
  onExportExcel,
}) => {
  const from = (profitPage - 1) * limit + 1;
  const to = Math.min(profitPage * limit, totalWithdrawals);
  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-primary/5 shadow-sm overflow-hidden">
      <div className="p-6 border-b border-primary/5 flex items-center justify-between flex-wrap gap-4">
        <h4 className="text-lg font-bold">سجل السحوبات</h4>
        <div className="flex gap-2">
          {permissions?.includes('company_Export') && (
            <>
              <button
                onClick={onExportPDF}
                disabled={isExporting}
                className="p-2 border border-primary/10 rounded-lg hover:bg-primary/5 transition-colors disabled:opacity-50"
                title="تصدير PDF"
              >
                <Download sx={{ fontSize: 20 }} className="text-red-500" />
              </button>
              <button
                onClick={onExportExcel}
                disabled={isExporting}
                className="p-2 border border-primary/10 rounded-lg hover:bg-primary/5 transition-colors disabled:opacity-50"
                title="تصدير Excel"
              >
                <TableChart sx={{ fontSize: 20, color: 'var(--color-primary)' }} />
              </button>
            </>
          )}
        </div>
      </div>
      {!withdrawals?.length ? (
        <div className="p-12 text-center">
          <AccountBalanceWallet sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} className="text-slate-400" />
          <p className="text-slate-600 dark:text-slate-400 font-bold">لا توجد عمليات سحب حتى الآن</p>
          <p className="text-sm text-slate-500 mt-1">لم يتم إجراء أي عمليات سحب من أرباح الشركة</p>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full text-right">
              <thead className="bg-primary/5 text-primary text-sm font-bold">
                <tr>
                  <th className="px-6 py-4">رقم العملية</th>
                  <th className="px-6 py-4">التاريخ</th>
                  <th className="px-6 py-4">المبلغ المسحوب</th>
                  <th className="px-6 py-4">طريقة السحب</th>
                  <th className="px-6 py-4">الحالة</th>
                  <th className="px-6 py-4">المستخدم المسؤول</th>
                </tr>
              </thead>
              <tbody className="text-sm divide-y divide-primary/5">
                {withdrawals.map((w) => (
                  <tr key={w.id} className="hover:bg-primary/5 transition-colors">
                    <td className="px-6 py-4 font-bold">{`#${w.reference?.replace('COMPANY-WITHDRAW-', '') || w.id}`}</td>
                    <td className="px-6 py-4 text-slate-500">{formatDateAr(w.date)}</td>
                    <td className="px-6 py-4 font-black">{formatNum(w.amount)}</td>
                    <td className="px-6 py-4">{w.description || 'سحب أرباح'}</td>
                    <td className="px-6 py-4">
                      <span className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-3 py-1 rounded-full text-xs font-bold">
                        تمت بنجاح
                      </span>
                    </td>
                    <td className="px-6 py-4 flex items-center gap-2">
                      <div
                        className="w-7 h-7 rounded-full bg-slate-200 dark:bg-slate-600 flex items-center justify-center overflow-hidden"
                        style={
                          w.userProfileImage
                            ? { backgroundImage: `url(${w.userProfileImage})`, backgroundSize: 'cover' }
                            : {}
                        }
                      >
                        {!w.userProfileImage && (
                          <span className="text-xs font-bold text-slate-600">{w.userName?.charAt(0) || '?'}</span>
                        )}
                      </div>
                      <span>{w.userName}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="p-4 bg-primary/5 flex items-center justify-between flex-wrap gap-2">
            <span className="text-xs font-medium text-slate-500">
              عرض {from}-{to} من أصل {totalWithdrawals} عملية
            </span>
            {totalPages > 1 && (
              <div className="flex gap-1">
                <button
                  onClick={() => onPageChange((p) => Math.min(totalPages, p + 1))}
                  disabled={profitPage >= totalPages}
                  className="w-8 h-8 flex items-center justify-center rounded-lg border border-primary/10 text-primary hover:bg-white dark:hover:bg-slate-800 transition-colors disabled:opacity-50"
                >
                  <ChevronRight sx={{ fontSize: 18 }} />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter((p) => p <= 5)
                  .map((p) => (
                    <button
                      key={p}
                      onClick={() => onPageChange(p)}
                      className={`w-8 h-8 flex items-center justify-center rounded-lg text-xs font-bold transition-colors ${
                        p === profitPage
                          ? 'bg-primary text-white'
                          : 'border border-primary/10 text-slate-400 hover:bg-white dark:hover:bg-slate-800'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                <button
                  onClick={() => onPageChange((p) => Math.max(1, p - 1))}
                  disabled={profitPage <= 1}
                  className="w-8 h-8 flex items-center justify-center rounded-lg border border-primary/10 text-primary hover:bg-white dark:hover:bg-slate-800 transition-colors disabled:opacity-50"
                >
                  <ChevronLeft sx={{ fontSize: 18 }} />
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};
export default CompanyProfitWithdrawalsTable;