import { saveAs } from 'file-saver';
import dayjs from 'dayjs';
import * as XLSX from 'xlsx';
import { exportUnifiedReport } from './unifiedReportTemplate';
export const exportJournalToPDF = async (journalData) => {
  const totalDebit = journalData.lines?.reduce((sum, line) => sum + (line.debit || 0), 0) || 0;
  const totalCredit = journalData.lines?.reduce((sum, line) => sum + (line.credit || 0), 0) || 0;
  const balance = totalDebit - totalCredit;
  const subtitle = `رقم القيد: ${journalData.reference || journalData.id} | إجمالي المدين: ${totalDebit.toLocaleString('en-US')} | إجمالي الدائن: ${totalCredit.toLocaleString('en-US')} | الفرق: ${balance.toLocaleString('en-US')}`;

  const rows = (journalData.lines || []).map((line) => ({
    balance: line.balance || (line.debit || 0) - (line.credit || 0),
    credit: line.credit || 0,
    debit: line.debit || 0,
    description: line.description || '-',
    account: `${line.account?.code || ''} - ${line.account?.name || ''}`,
  }));
  rows.push({ balance, credit: totalCredit, debit: totalDebit, description: 'الإجمالي', account: '' });

  return exportUnifiedReport({
    reportTitle: 'تفاصيل القيد المحاسبي',
    fileName: `قيد_${journalData.reference || journalData.id}`,
    orientation: 'landscape',
    dateFrom: journalData.date,
    dateTo: journalData.date,
    subtitle,
    columns: [
      { header: 'الرصيد', dataKey: 'balance', width: 25, format: 'number' },
      { header: 'دائن', dataKey: 'credit', width: 25, format: 'number' },
      { header: 'مدين', dataKey: 'debit', width: 25, format: 'number' },
      { header: 'الوصف', dataKey: 'description', width: 50, align: 'right' },
      { header: 'الحساب', dataKey: 'account', width: 55, align: 'right' },
    ],
    rows,
  });
};
export const exportJournalToExcel = async (journalData) => {
  try {
    const XLSX = await import('xlsx');
    const workbook = XLSX.utils.book_new();
    const totalDebit = journalData.lines?.reduce((sum, line) => sum + (line.debit || 0), 0) || 0;
    const totalCredit = journalData.lines?.reduce((sum, line) => sum + (line.credit || 0), 0) || 0;
    const balance = totalDebit - totalCredit;
    const headerData = [
      ['تفاصيل القيد المحاسبي'],
      [''],
      ['معلومات القيد'],
      ['رقم القيد', journalData.reference || journalData.id],
      ['التاريخ', dayjs(journalData.date).format('DD/MM/YYYY')],
      ['نوع القيد', getJournalTypeArabic(journalData.type)],
      ['الوصف', journalData.description || '-'],
      ['الحالة', getJournalStatusArabic(journalData.status)],
      ['نوع المصدر', getJournalSourceTypeText(journalData.sourceType)],
      ['المعتمد بواسطة', journalData.postedBy?.name || 'لم يتم الاعتماد'],
      [''],
      ['الإجماليات'],
      ['إجمالي المدين', totalDebit],
      ['إجمالي الدائن', totalCredit],
      ['الفرق', balance],
      ['عدد البنود', journalData.lines?.length || 0],
      ['']
    ];
    const linesData = journalData.lines?.map(line => ({
      'الحساب': `${line.account?.code || ''} - ${line.account?.name || ''}`,
      'الوصف': line.description || '-',
      'مدين': line.debit > 0 ? line.debit : 0,
      'دائن': line.credit > 0 ? line.credit : 0,
      'الرصيد': line.balance || (line.debit - line.credit)
    })) || [];
    linesData.push({
      'الحساب': '',
      'الوصف': 'الإجمالي',
      'مدين': totalDebit,
      'دائن': totalCredit,
      'الرصيد': balance
    });
    const headerSheet = XLSX.utils.aoa_to_sheet(headerData);
    const linesSheet = XLSX.utils.json_to_sheet(linesData);
    const headerCols = [
      { wch: 20 },
      { wch: 30 }
    ];
    headerSheet['!cols'] = headerCols;
    const linesCols = [
      { wch: 30 },
      { wch: 40 },
      { wch: 15 },
      { wch: 15 },
      { wch: 15 }
    ];
    linesSheet['!cols'] = linesCols;
    XLSX.utils.book_append_sheet(workbook, headerSheet, 'معلومات القيد');
    XLSX.utils.book_append_sheet(workbook, linesSheet, 'بنود القيد');
    const excelBuffer = XLSX.write(workbook, { 
      bookType: 'xlsx', 
      type: 'array',
      bookSST: false 
    });
    const blob = new Blob([excelBuffer], { 
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
    });
    const fileName = `قيد_${journalData.reference || journalData.id}_${dayjs().format('YYYY-MM-DD')}.xlsx`;
    saveAs(blob, fileName);
  } catch (error) {
    console.error('Excel export error:', error.message);
    throw error;
  }
};
const getJournalStatusArabic = (status) => {
  const statusMap = {
    'POSTED': 'معتمد',
    'DRAFT': 'مسودة',
    'PENDING': 'قيد الانتظار',
    'CANCELLED': 'ملغي'
  };
  return statusMap[status] || status;
};
const getJournalTypeArabic = (type) => {
  const typeMap = {
    'GENERAL': 'عام',
    'OPENING': 'افتتاحي',
    'CLOSING': 'ختامي',
    'ADJUSTMENT': 'تسوية'
  };
  return typeMap[type] || type;
};
const getJournalSourceTypeText = (sourceType) => {
  switch (sourceType) {
    case "LOAN":
      return "سلفة";
    case "REPAYMENT":
      return "سداد دفعة";
    case "LOAN_INTEREST":
      return "فوائد سلفة";
    case "LOAN_CONVERSION":
      return "نقل مديونية";
    case "PARTNER":
      return "انضمام شريك";
    case "PERIOD_CLOSING":
      return "إقفال فترة";
    case "PARTNER_TRANSACTION_WITHDRAWAL":
      return "سحب مالي لشريك";
    case "COMPANY_PROFIT_WITHDRAWAL":
      return "سحب ربح شركة";
    case "PARTNER_TRANSACTION_DEPOSIT":
      return "إيداع مالي لشريك";
    case "EXPENSES":
      return "مصروف";
    case "PARTNER_WITHDRAWING":
      return "انسحاب مالي لشريك";
    case "ZAKAT": 
      return "سحب زكاة";
    case "SAVING":
      return "ادخار";
    case "PARTNER_PROFIT_WITHDRAWAL":
      return "سحب ارباح شريك";
    case "OTHER":
      return "أخرى";
    default:
      return sourceType || "-";
  }
};
const normalizeJournalRow = (journal) => ({
  reference: journal.reference || "-",
  type: getJournalTypeArabic(journal.type),
  status: getJournalStatusArabic(journal.status),
  source: getJournalSourceTypeText(journal.sourceType),
  postedBy: journal.postedBy?.name || "لم يتم الاعتماد",
  createdAt: journal.createdAt ? dayjs(journal.createdAt).format('DD/MM/YYYY') : '-',
});
export const exportJournalsTableToPDF = async (journals) => {
  if (!Array.isArray(journals) || journals.length === 0) {
    throw new Error('لا توجد بيانات للتصدير');
  }
  return exportUnifiedReport({
    reportTitle: 'تقرير القيود المحاسبية',
    fileName: 'تقرير_القيود',
    orientation: 'landscape',
    subtitle: `إجمالي القيود: ${journals.length}`,
    columns: [
      { header: 'تاريخ الإنشاء', dataKey: 'createdAt', width: 35 },
      { header: 'المعتمد بواسطة', dataKey: 'postedBy', width: 35, align: 'right' },
      { header: 'المصدر', dataKey: 'source', width: 40, align: 'right' },
      { header: 'الحالة', dataKey: 'status', width: 30, align: 'right' },
      { header: 'النوع', dataKey: 'type', width: 35, align: 'right' },
    ],
    rows: journals.map((journal) => normalizeJournalRow(journal)),
  });
};
export const exportJournalsTableToExcel = async (journals) => {
  try {
    if (!Array.isArray(journals) || journals.length === 0) {
      throw new Error('لا توجد بيانات للتصدير');
    }
    const workbook = XLSX.utils.book_new();
    const sheetData = [
      ['تاريخ الإنشاء', 'المعتمد بواسطة', 'المصدر', 'الحالة', 'النوع'],
      ...journals.map((journal) => {
        const normalized = normalizeJournalRow(journal);
        return [
          normalized.createdAt,
          normalized.postedBy,
          normalized.source,
          normalized.status,
          normalized.type,
        ];
      }),
    ];
    const sheet = XLSX.utils.aoa_to_sheet(sheetData);
    sheet['!cols'] = [
      { wch: 15 },
      { wch: 20 },
      { wch: 18 },
      { wch: 10 },
      { wch: 18 },
    ];
    XLSX.utils.book_append_sheet(workbook, sheet, 'القيود');
    const excelBuffer = XLSX.write(workbook, {
      bookType: 'xlsx',
      type: 'array',
      bookSST: false
    });
    const blob = new Blob([excelBuffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    });
    const fileName = `تقرير_القيود_${dayjs().format('YYYY-MM-DD')}.xlsx`;
    saveAs(blob, fileName);
  } catch (error) {
    console.error('Excel export error:', error.message);
    throw error;
  }
};
