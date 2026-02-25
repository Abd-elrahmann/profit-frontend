import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { getAccountTypeLabel } from '../components/ChartOfAccounts';

const registerArabicFonts = (doc) => {
  try {
    doc.addFont('/assets/fonts/Amiri-Regular.ttf', 'Amiri', 'normal');
    doc.addFont('/assets/fonts/Amiri-Bold.ttf', 'Amiri', 'bold');
  } catch (error) {
    console.warn('Arabic fonts not found', error);
  }
};

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

  const doc = new jsPDF();
  registerArabicFonts(doc);

  doc.setFont('Amiri', 'bold');
  doc.setFontSize(18);
  doc.text('شجرة الحسابات', doc.internal.pageSize.width / 2, 20, { align: 'center' });

  const rows = flatAccounts.map((a) => [
    a.code,
    a.name,
    getAccountTypeLabel(a.type),
    (a.balance ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2 }),
    a.isActive !== false ? 'نشط' : 'غير نشط',
  ]);

  autoTable(doc, {
    head: [['كود الحساب', 'اسم الحساب', 'النوع', 'الرصيد', 'الحالة']],
    body: rows,
    startY: 30,
    styles: { font: 'Amiri' },
    headStyles: { fillColor: [46, 139, 69] },
  });

  doc.save('شجرة-الحسابات.pdf');
};

export const exportChartOfAccountsToExcel = async (accountsTree) => {
  const flatAccounts = flattenAll(accountsTree);
  if (!flatAccounts.length) throw new Error('لا توجد بيانات للتصدير');

  const XLSX = await import('xlsx');

  const rows = flatAccounts.map((a) => ({
    'كود الحساب': a.code,
    'اسم الحساب': a.name,
    النوع: getAccountTypeLabel(a.type),
    الرصيد: a.balance ?? 0,
    الحالة: a.isActive !== false ? 'نشط' : 'غير نشط',
  }));

  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'شجرة الحسابات');
  XLSX.writeFile(wb, 'شجرة-الحسابات.xlsx');
};
