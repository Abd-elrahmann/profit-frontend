import { saveAs } from 'file-saver';
import dayjs from 'dayjs';
import { exportUnifiedReport } from './unifiedReportTemplate';
const formatCurrency = (amount) => {
  return amount?.toLocaleString('en-US') || '0';
};
const getExportColumnValue = (client, columnId, index) => {
  switch(columnId) {
    case 'id':
      return index + 1;
    case 'client':
      return `${client.name || '-'}\n${client.phone || '-'}`;
    case 'address':
      return client.address || '-';
    case 'loansCount':
      return client.loansSummary?.loansCount || 0;
    case 'paidRepayments':
      return client.repaymentSummary?.paidRepayments || 0;
    case 'remainingRepayments':
      return client.repaymentSummary?.remainingRepayments || 0;
    case 'totalDebit':
      return client.financials?.totalDebit || 0;
    case 'totalPaid':
      return client.financials?.totalPaid || 0;
    case 'totalInterest':
      return client.financials?.totalInterestPaid || 0;
    case 'totalDiscounts':
      return client.financials?.totalDiscounts || 0;
    case 'monthlyInstallment':
      return client.financials?.averageMonthlyInstallment || 0;
    case 'remaining':
      return Math.abs(client.financials?.remaining) || 0;
    case 'note':
      return '-'; 
    default:
      return '';
  }
};
const getFormattedColumnValue = (client, columnId, index) => {
  if (columnId === 'client') {
    return getExportColumnValue(client, columnId, index);
  }
  const value = getExportColumnValue(client, columnId, index);
  if (['totalDebit', 'totalPaid', 'totalInterest', 'totalDiscounts', 'remaining', 'monthlyInstallment'].includes(columnId)) {
    return formatCurrency(value);
  }
  return value;
};
export const exportClientCollectionsToPDF = async (clientsData, status = 'ACTIVE', visibleColumns = [], options = {}) => {
  if (!clientsData || !clientsData.data || !Array.isArray(clientsData.data) || clientsData.data.length === 0) {
    throw new Error('لا توجد بيانات للتصدير');
  }
  const columnsToExport = visibleColumns.length > 0 ? visibleColumns : [
    { id: 'id', label: 'م' },
    { id: 'client', label: 'العميل' },
    { id: 'address', label: 'العنوان' },
    { id: 'loansCount', label: 'عدد السلف' },
    { id: 'paidRepayments', label: 'الدفعات المدفوعة' },
    { id: 'remainingRepayments', label: 'الدفعات المتبقية' },
    { id: 'monthlyInstallment', label: 'الدفعة الشهرية' },
    { id: 'totalDebit', label: 'إجمالي المديونية' },
    { id: 'totalPaid', label: 'إجمالي المدفوع' },
    { id: 'totalInterest', label: 'إجمالي الفوائد' },
    { id: 'totalDiscounts', label: 'الخصومات' },
    { id: 'remaining', label: 'المتبقي' },
    { id: 'note', label: 'ملاحظات' },
  ];
  const exportColumns = [...columnsToExport].reverse();
  const statusTitle = status === 'ACTIVE' ? 'العملاء المديونين' : 'العملاء المسددين';
  const totalDebit = clientsData.data.reduce((sum, c) => sum + (c.financials?.totalDebit || 0), 0);
  const totalPaid = clientsData.data.reduce((sum, c) => sum + (c.financials?.totalPaid || 0), 0);
  const totalRemaining = clientsData.data.reduce((sum, c) => sum + (Math.abs(c.financials?.remaining) || 0), 0);
  const compactHeaderLabel = {
    paidRepayments: 'المدفوعات',
    remainingRepayments: 'المتبقية',
    monthlyInstallment: 'قسط شهري',
    totalDebit: 'المديونية',
    totalPaid: 'المدفوع',
    totalInterest: 'الفوائد',
    totalDiscounts: 'الخصومات',
  };
  const columnWidthById = {
    id: 8,
    client: 28,
    address: 20,
    loansCount: 13,
    paidRepayments: 16,
    remainingRepayments: 16,
    monthlyInstallment: 16,
    totalDebit: 16,
    totalPaid: 14,
    totalInterest: 14,
    totalDiscounts: 14,
    remaining: 13,
    note: 28,
  };

  return exportUnifiedReport({
    reportTitle: `كشف تحصيل ${statusTitle}`,
    fileName: `كشف_تحصيل_العملاء_${status === 'ACTIVE' ? 'المديونين' : 'المسددين'}`,
    orientation: 'landscape',
    subtitle: `إجمالي العملاء: ${clientsData.totalClients || clientsData.data.length} | إجمالي المديونية: ${formatCurrency(totalDebit)} | إجمالي المدفوع: ${formatCurrency(totalPaid)} | المتبقي: ${formatCurrency(totalRemaining)}`,
    columns: exportColumns.map((col) => ({
      header: compactHeaderLabel[col.id] || col.label,
      dataKey: col.id,
      width: columnWidthById[col.id] || 14,
      align: ['client', 'address', 'note'].includes(col.id) ? 'right' : 'center',
    })),
    rows: clientsData.data.map((client, index) => {
      const row = {};
      exportColumns.forEach((column) => {
        row[column.id] = getFormattedColumnValue(client, column.id, index);
      });
      return row;
    }),
    tableStyles: {
      styles: {
        fontSize: 8,
        cellPadding: 2,
      },
      headStyles: {
        fontSize: 8,
        cellPadding: 2,
      },
    },
    save: options.save ?? true,
  });
};
export const exportClientCollectionsToExcel = async (clientsData, status = 'ACTIVE', visibleColumns = []) => {
  try {
    if (!clientsData || !clientsData.data || !Array.isArray(clientsData.data) || clientsData.data.length === 0) {
      throw new Error('لا توجد بيانات للتصدير');
    }
    const columnsToExport = visibleColumns.length > 0 ? visibleColumns : [
      { id: 'id', label: 'م' },
      { id: 'client', label: 'العميل' },
      { id: 'address', label: 'العنوان' },
      { id: 'loansCount', label: 'عدد السلف' },
      { id: 'paidRepayments', label: 'الدفعات المدفوعة' },
      { id: 'remainingRepayments', label: 'الدفعات المتبقية' },
      { id: 'totalDebit', label: 'إجمالي المديونية' },
      { id: 'totalPaid', label: 'إجمالي المدفوع' },
      { id: 'totalInterest', label: 'إجمالي الفوائد' },
      { id: 'totalDiscounts', label: 'الخصومات' },
      { id: 'remaining', label: 'المتبقي' },
      { id: 'note', label: 'ملاحظات' },
    ];
    const exportColumns = [...columnsToExport].reverse();
    const XLSX = await import('xlsx');
    const workbook = XLSX.utils.book_new();
    const statusTitle = status === 'ACTIVE' ? 'العملاء المديونين' : 'العملاء المسددين';
    const summaryData = [
      [`كشف تحصيل ${statusTitle}`],
      [`تاريخ التصدير: ${dayjs().format('DD/MM/YYYY HH:mm')}`],
      [`إجمالي العملاء: ${clientsData.totalClients || clientsData.data.length}`],
      [''],
      ['ملخص الإحصائيات'],
      [''],
      ['إجمالي المديونية', clientsData.data.reduce((sum, c) => sum + (c.financials.totalDebit || 0), 0)],
      ['إجمالي المدفوع', clientsData.data.reduce((sum, c) => sum + (c.financials.totalPaid || 0), 0)],
      ['إجمالي الفوائد', clientsData.data.reduce((sum, c) => sum + (c.financials.totalInterestPaid || 0), 0)],
      ['إجمالي الخصومات', clientsData.data.reduce((sum, c) => sum + (c.financials.totalDiscounts || 0), 0)],
      ['إجمالي الدفعات الشهرية', clientsData.data.reduce((sum, c) => sum + (c.financials.averageMonthlyInstallment || 0), 0)],
      ['إجمالي المتبقي', clientsData.data.reduce((sum, c) => sum + (Math.abs(c.financials.remaining) || 0), 0)],
      [''],
      ['تفاصيل العملاء'],
      ['']
    ];
    const headersRow = exportColumns.map(col => col.label);
    const clientsTableData = [headersRow];
    clientsData.data.forEach((client, index) => {
      const rowData = exportColumns.map(column => getExportColumnValue(client, column.id, index));
      clientsTableData.push(rowData);
    });
    const allData = [...summaryData, ...clientsTableData];
    const sheet = XLSX.utils.aoa_to_sheet(allData);
    const columnWidths = exportColumns.map(col => {
      if (col.id === 'id') return { wch: 6 };
      if (col.id === 'client') return { wch: 28 };
      if (col.id === 'address') return { wch: 25 };
      if (col.id === 'note') return { wch: 35 };
      return { wch: 16 };
    });
    sheet['!cols'] = columnWidths;
    const headerRowIndex = summaryData.length;
    if (!sheet['!rows']) sheet['!rows'] = [];
    for (let col = 0; col < headersRow.length; col++) {
      const cellAddress = XLSX.utils.encode_cell({ r: headerRowIndex, c: col });
      if (!sheet[cellAddress]) continue;
      if (!sheet[cellAddress].s) sheet[cellAddress].s = {};
      sheet[cellAddress].s.font = { bold: true, color: { rgb: "FFFFFF" } };
      sheet[cellAddress].s.fill = { fgColor: { rgb: "0D40A5" } };
      sheet[cellAddress].s.alignment = { horizontal: "center", vertical: "center" };
    }
    XLSX.utils.book_append_sheet(workbook, sheet, 'كشف التحصيل');
    const excelBuffer = XLSX.write(workbook, { 
      bookType: 'xlsx', 
      type: 'array',
      bookSST: false 
    });
    const blob = new Blob([excelBuffer], { 
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
    });
    const statusSuffix = status === 'ACTIVE' ? 'المديونين' : 'المسددين';
    const fileName = `كشف_تحصيل_العملاء_${statusSuffix}_${dayjs().format('YYYY-MM-DD')}.xlsx`;
    saveAs(blob, fileName);
  } catch (error) {
    console.error('Excel export error:', error.message);
    throw error;
  }
};
export const printClientCollections = async (clientsData, status = 'ACTIVE', visibleColumns = []) => {
  const doc = await exportClientCollectionsToPDF(clientsData, status, visibleColumns, { save: false });
  const pdfBlob = doc.output('blob');
  const pdfUrl = URL.createObjectURL(pdfBlob);
  const printWindow = window.open(pdfUrl);
  if (!printWindow) {
    throw new Error('فشل في فتح نافذة الطباعة');
  }
  printWindow.onload = function () {
    printWindow.print();
    setTimeout(() => {
      URL.revokeObjectURL(pdfUrl);
    }, 1000);
  };
};
