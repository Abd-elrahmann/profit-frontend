import { getAccountNatureLabel } from '../components/ChartOfAccounts';
import dayjs from 'dayjs';
import { exportUnifiedReport } from './unifiedReportTemplate';
const flattenAll = (accounts, depth = 0) => {
  const result = [];
  for (const account of accounts || []) {
    result.push({ ...account, _depth: depth });
    if (account.children?.length) {
      result.push(...flattenAll(account.children, depth + 1));
    }
  }
  return result;
};
export const exportChartOfAccountsToPDF = async (accountsTree) => {
  const flatAccounts = flattenAll(accountsTree);
  if (!flatAccounts.length) throw new Error('لا توجد بيانات للتصدير');
  const subtitle = `إجمالي الحسابات: ${flatAccounts.length} | تاريخ التصدير: ${dayjs().format('DD/MM/YYYY HH:mm')}`;

  return exportUnifiedReport({
    reportTitle: 'الدليل المحاسبي',
    fileName: 'الدليل-المحاسبي',
    orientation: 'landscape',
    subtitle,
    columns: [
      { header: 'الحالة', dataKey: 'statusAr', width: 20 },
      { header: 'الرصيد', dataKey: 'balance', width: 35, format: 'number' },
      { header: 'النوع', dataKey: 'natureLabel', width: 25, align: 'right' },
      { header: 'اسم الحساب', dataKey: 'name', width: 50, align: 'right' },
      { header: 'كود الحساب', dataKey: 'code', width: 25 },
    ],
    rows: flatAccounts.map((a) => ({
      ...a,
      natureLabel: getAccountNatureLabel(a.nature),
      balance: a.balance ?? 0,
      statusAr: a.isActive !== false ? 'نشط' : 'غير نشط',
    })),
  });
};
export const exportChartOfAccountsToExcel = async (accountsTree) => {
  const flatAccounts = flattenAll(accountsTree);
  if (!flatAccounts.length) throw new Error('لا توجد بيانات للتصدير');
  const XLSX = await import('xlsx');
  const rows = flatAccounts.map((a) => ({
    الحالة: a.isActive !== false ? 'نشط' : 'غير نشط',
    الرصيد: a.balance ?? 0,
    النوع: getAccountNatureLabel(a.nature),
    'اسم الحساب': a.name,
    'كود الحساب': a.code,
  }));
  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'الدليل المحاسبي');
  XLSX.writeFile(wb, 'الدليل-المحاسبي.xlsx');
};
