import { saveAs } from 'file-saver';
import dayjs from 'dayjs';
import { exportUnifiedReport } from './unifiedReportTemplate';
export const exportGeneralLedgerToPDF = async (ledgerData, account, searchParams) => {
  const totalDebit = ledgerData.journals?.reduce((sum, journal) => {
    return sum + journal.lines.reduce((lineSum, line) => lineSum + (line.debit || 0), 0);
  }, 0) || 0;
  const totalCredit = ledgerData.journals?.reduce((sum, journal) => {
    return sum + journal.lines.reduce((lineSum, line) => lineSum + (line.credit || 0), 0);
  }, 0) || 0;
  const closingBalance = ledgerData.account?.balance || 0;
  const subtitle = `إجمالي المدين: ${totalDebit.toLocaleString('en-US')} | إجمالي الدائن: ${totalCredit.toLocaleString('en-US')} | الرصيد الختامي: ${closingBalance.toLocaleString('en-US')} | عدد القيود: ${ledgerData.totalJournals || 0}`;

  const rows = [];
  ledgerData.journals?.forEach((journal) => {
    journal.lines.forEach((line) => {
      rows.push({
        balance: line.balance || 0,
        credit: line.credit || 0,
        debit: line.debit || 0,
        description: line.description || journal.description || '-',
        reference: journal.reference || '-',
        dateText: dayjs(journal.date).format('DD/MM/YYYY HH:mm'),
      });
    });
  });

  return exportUnifiedReport({
    reportTitle: `دفتر الأستاذ - ${account.name} (${account.code})`,
    fileName: `دفتر_الأستاذ_${account.name}`,
    orientation: 'landscape',
    dateFrom: searchParams?.fromDate,
    dateTo: searchParams?.toDate,
    subtitle,
    columns: [
      { header: 'الرصيد', dataKey: 'balance', width: 26, format: 'number' },
      { header: 'دائن', dataKey: 'credit', width: 22, format: 'number' },
      { header: 'مدين', dataKey: 'debit', width: 22, format: 'number' },
      { header: 'الوصف', dataKey: 'description', width: 45, align: 'right' },
      { header: 'المرجع', dataKey: 'reference', width: 22, align: 'right' },
      { header: 'التاريخ', dataKey: 'dateText', width: 26 },
    ],
    rows,
  });
};
export const exportGeneralLedgerToExcel = async (ledgerData, account, searchParams) => {
  try {
      const XLSX = await import('xlsx');
    const workbook = XLSX.utils.book_new();
    const totalDebit = ledgerData.journals?.reduce((sum, journal) => {
      return sum + journal.lines.reduce((lineSum, line) => lineSum + (line.debit || 0), 0);
    }, 0) || 0;
    const totalCredit = ledgerData.journals?.reduce((sum, journal) => {
      return sum + journal.lines.reduce((lineSum, line) => lineSum + (line.credit || 0), 0);
    }, 0) || 0;
    const closingBalance = ledgerData.account?.balance || 0;
    const summaryData = [
      ['دفتر الأستاذ العام'],
      [`الحساب: ${account.name}`],
      [`كود الحساب: ${account.code}`],
      [`نوع الحساب: ${getAccountTypeArabic(account.type)}`],
      [''],
      ['إجمالي المدين', totalDebit],
      ['إجمالي الدائن', totalCredit],
      ['الرصيد الختامي', closingBalance],
      ['عدد القيود', ledgerData.totalJournals || 0],
      ['']
    ];
    if (searchParams.fromDate || searchParams.toDate) {
      const fromDate = searchParams.fromDate ? dayjs(searchParams.fromDate).format('DD/MM/YYYY') : 'بداية';
      const toDate = searchParams.toDate ? dayjs(searchParams.toDate).format('DD/MM/YYYY') : 'نهاية';
      summaryData.splice(4, 0, [`الفترة: من ${fromDate} إلى ${toDate}`]);
    }
    const journalsData = [];
    ledgerData.journals?.forEach(journal => {
      journal.lines.forEach(line => {
        journalsData.push({
          'التاريخ': dayjs(journal.date).format('DD/MM/YYYY HH:mm'),
          'المرجع': journal.reference || '-',
          'الوصف': line.description || journal.description || '-',
          'مدين': line.debit > 0 ? line.debit : 0,
          'دائن': line.credit > 0 ? line.credit : 0,
          'الرصيد': line.balance,
          'المرحل بواسطة': journal.postedBy || 'غير محدد'
        });
      });
    });
    const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
    const journalsSheet = XLSX.utils.json_to_sheet(journalsData);
    const wscols = [
      { wch: 20 }, 
      { wch: 15 }, 
      { wch: 40 }, 
      { wch: 12 }, 
      { wch: 12 }, 
      { wch: 15 }, 
      { wch: 15 }  
    ];
    journalsSheet['!cols'] = wscols;
    XLSX.utils.book_append_sheet(workbook, summarySheet, 'ملخص');
    XLSX.utils.book_append_sheet(workbook, journalsSheet, 'القيود');
    const excelBuffer = XLSX.write(workbook, { 
      bookType: 'xlsx', 
      type: 'array',
      bookSST: false 
    });
    const blob = new Blob([excelBuffer], { 
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
    });
    const fileName = `دفتر_الأستاذ_${account.name}_${dayjs().format('YYYY-MM-DD')}.xlsx`;
    saveAs(blob, fileName);
  } catch (error) {
    console.error('Excel export error:', error.message);
    throw error;
  }
};
const getAccountTypeArabic = (type) => {
  const typeMap = {
    'ASSET': 'أصول',
    'LIABILITY': 'خصوم',
    'EQUITY': 'حقوق ملكية',
    'REVENUE': 'إيرادات',
    'EXPENSE': 'مصروفات'
  };
  return typeMap[type] || type;
};
