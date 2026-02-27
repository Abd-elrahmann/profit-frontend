import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { getAccountTypeLabel } from '../components/ChartOfAccounts';
import { registerArabicFonts, drawReportHeader, drawSeparatorLine, drawReportFooter, getCenteredTableMargins, PRIMARY_COLOR } from './pdfReportUtils';
import { createDidDrawTable } from './pdfTableStyles';
import dayjs from 'dayjs';

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

  let yPosition = drawReportHeader(doc, {
    reportTitle: 'شجرة الحسابات',
    metadata: { date: dayjs().format('DD/MM/YYYY'), time: dayjs().format('HH:mm') }
  });
  yPosition = drawSeparatorLine(doc, yPosition);

  const rows = flatAccounts.map((a) => [
    a.code,
    a.name,
    getAccountTypeLabel(a.type),
    (a.balance ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2 }),
    a.isActive !== false ? 'نشط' : 'غير نشط',
  ]);

  const tableWidth = 170;
  const tableMargins = getCenteredTableMargins(doc, tableWidth);

  autoTable(doc, {
    head: [['كود الحساب', 'اسم الحساب', 'النوع', 'الرصيد', 'الحالة']],
    body: rows,
    startY: yPosition,
    styles: { font: 'Amiri', fontSize: 9, cellPadding: 4 },
    headStyles: { fillColor: PRIMARY_COLOR, textColor: [255, 255, 255], fontSize: 9, cellPadding: 4 },
    bodyStyles: { fontSize: 9, cellPadding: 4 },
    margin: { top: yPosition, left: tableMargins.left, right: tableMargins.right, bottom: 25 },
    tableWidth,
    didDrawTable: createDidDrawTable(doc)
  });

  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    drawReportFooter(doc, i, pageCount);
  }

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
