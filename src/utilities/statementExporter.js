import { saveAs } from 'file-saver';
import dayjs from 'dayjs';
import { exportUnifiedReport } from './unifiedReportTemplate';
const formatAmount = (value) => {
  const numeric = Number(value || 0);
  const truncated = Number.isFinite(numeric) ? Math.trunc(numeric) : 0;
  return truncated.toLocaleString('en-US', {
    maximumFractionDigits: 0,
    minimumFractionDigits: 0,
  });
};
const getRepaymentStatusText = (status) => {
  const textMap = {
    PENDING: 'قيد الانتظار',
    COMPLETED: 'مكتمل',
    PAID: 'مدفوع',
    PARTIAL_PAID: 'مدفوع جزئياً',
    OVERDUE: 'متأخر',
    EARLY_PAID: 'مدفوع مبكراً',
  };
  return textMap[status] || status;
};
export const exportStatementToPDF = async (statementData, clientName, fromDate = '', toDate = '') => {
  const repayments = statementData.repayments || [];
  return exportUnifiedReport({
    reportTitle: `كشف حساب - ${clientName}`,
    fileName: `كشف_حساب_${clientName}`,
    orientation: 'landscape',
    dateFrom: fromDate || undefined,
    dateTo: toDate || undefined,
    subtitle: `رقم الهوية: ${statementData.client?.nationalId || '—'} | مدين: ${formatAmount(statementData.client?.debit)} | دائن: ${formatAmount(statementData.client?.credit)} | رصيد: ${formatAmount(statementData.client?.balance)} | معاملات: ${statementData.totalTransactions || 0}`,
    columns: [
      { header: 'المتبقي', dataKey: 'remaining', width: 22, format: 'number0' },
      { header: 'المدفوع', dataKey: 'paidAmount', width: 24, format: 'number0' },
      { header: 'المبلغ', dataKey: 'amount', width: 22, format: 'number0' },
      { header: 'الحالة', dataKey: 'statusText', width: 22, align: 'right' },
      { header: 'تاريخ الدفع', dataKey: 'paymentDateText', width: 24 },
      { header: 'تاريخ الاستحقاق', dataKey: 'dueDateText', width: 32 },
      { header: 'رقم السلفة', dataKey: 'loanCode', width: 24 },
      { header: 'رقم الدفعة', dataKey: 'count', width: 24 },
    ],
    rows: repayments.map((r) => ({
      remaining: Number(r.remaining || 0),
      paidAmount: Number(r.paidAmount || 0),
      amount: Number(r.amount || 0),
      statusText: getRepaymentStatusText(r.status),
      paymentDateText: r.paymentDate ? dayjs(r.paymentDate).format('DD/MM/YYYY') : '—',
      dueDateText: r.dueDate ? dayjs(r.dueDate).format('DD/MM/YYYY') : '—',
      loanCode: r.loanCode || r.loanId || '—',
      count: r.count || '—',
    })),
  });
};
export const exportStatementToExcel = async (statementData, clientName, fromDate = '', toDate = '') => {
  try {
    const XLSX = await import('xlsx');
    const workbook = XLSX.utils.book_new();
    const summaryData = [
      ['كشف حساب العميل'],
      [`اسم الحساب: ${clientName}`],
      [`رقم الهوية: ${statementData.client?.nationalId || '—'}`],
      [`من تاريخ: ${fromDate || '—'}  إلى تاريخ: ${toDate || '—'}`],
      [''],
      ['إجمالي المدين', formatAmount(statementData.client?.debit)],
      ['إجمالي الدائن', formatAmount(statementData.client?.credit)],
      ['الرصيد الحالي', formatAmount(statementData.client?.balance)],
      ['عدد المعاملات', statementData.totalTransactions || 0],
      ['الدفعات المدفوعة', statementData.paidRepaymentsCount || 0],
      ['المتبقي', formatAmount(statementData.totalRemainingAmount)],
      ...((statementData.client?.balance || 0) > 0 ? [['مدين ب', `${formatAmount(statementData.client?.balance)} ريال`]] : []),
      ['']
    ];
    const repayments = statementData.repayments || [];
    const repaymentsData = repayments.map((r) => ({
      'رقم الدفعة': r.count,
      'رقم السلفة': r.loanCode || r.loanId,
      'تاريخ الاستحقاق': r.dueDate ? dayjs(r.dueDate).format('DD/MM/YYYY') : '—',
      'تاريخ الدفع': r.paymentDate ? dayjs(r.paymentDate).format('DD/MM/YYYY') : '—',
      'المبلغ': formatAmount(r.amount),
      'المدفوع': formatAmount(r.paidAmount),
      'المتبقي': formatAmount(r.remaining),
      'الحالة': getRepaymentStatusText(r.status),
    }));
    const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
    const repaymentsSheet = XLSX.utils.json_to_sheet(repaymentsData);
    XLSX.utils.book_append_sheet(workbook, summarySheet, 'ملخص');
    XLSX.utils.book_append_sheet(workbook, repaymentsSheet, 'جدول الدفعات');
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    });
    const fileName = `كشف_حساب_${clientName}_${dayjs().format('YYYY-MM-DD')}.xlsx`;
    saveAs(blob, fileName);
  } catch (error) {
    console.error('Excel export error:', error.message);
    throw error;
  }
};