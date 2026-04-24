import { saveAs } from 'file-saver';
import dayjs from 'dayjs';
import { exportUnifiedReport } from './unifiedReportTemplate';
const getJournalTypeArabic = (type) => {
  const typeMap = {
    'GENERAL': 'عام',
    'OPENING': 'افتتاحي',
    'CLOSING': 'ختامي',
    'ADJUSTMENT': 'تسوية'
  };
  return typeMap[type] || type;
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
export const exportPeriodClosingToPDF = async (periodData) => {
  const totalDebit = periodData.journals?.reduce((sum, j) => sum + (j.totalDebit || 0), 0) || 0;
  const totalCredit = periodData.journals?.reduce((sum, j) => sum + (j.totalCredit || 0), 0) || 0;
  const balance = totalDebit - totalCredit;
  const rows = (periodData.journals || []).map((j) => ({
    balance: Math.round((j.totalDebit || 0) - (j.totalCredit || 0)),
    credit: Math.round(j.totalCredit || 0),
    debit: Math.round(j.totalDebit || 0),
    description: j.description || '-',
    type: getJournalTypeArabic(j.type),
    status: getJournalStatusArabic(j.status),
    date: dayjs(j.date).format('DD/MM/YYYY'),
  }));
  rows.push({ balance: Math.round(balance), credit: Math.round(totalCredit), debit: Math.round(totalDebit), description: 'الإجمالي', type: '', status: '', date: '' });

  return exportUnifiedReport({
    reportTitle: 'تقرير تقفيل الفترة',
    fileName: `تقرير_تقفيل_الفترة_${periodData.name}`,
    orientation: 'landscape',
    dateFrom: periodData.startDate,
    dateTo: periodData.endDate,
    subtitle: `الفترة: ${periodData.name} | الحالة: ${periodData.isClosed ? 'مقفلة' : 'مفتوحة'} | عدد القيود: ${periodData.journals?.length || 0} | صافي الأرباح: ${(periodData.totalProfit || 0).toLocaleString('en-US')}`,
    columns: [
      { header: 'الرصيد', dataKey: 'balance', width: 25, format: 'number0' },
      { header: 'دائن', dataKey: 'credit', width: 25, format: 'number0' },
      { header: 'مدين', dataKey: 'debit', width: 25, format: 'number0' },
      { header: 'الوصف', dataKey: 'description', width: 45, align: 'right' },
      { header: 'النوع', dataKey: 'type', width: 25, align: 'right' },
      { header: 'الحالة', dataKey: 'status', width: 30, align: 'right' },
      { header: 'التاريخ', dataKey: 'date', width: 25 },
    ],
    rows,
  });
};
export const exportPeriodClosingToExcel = async (periodData) => {
  try {
    const XLSX = await import('xlsx');
    const workbook = XLSX.utils.book_new();
    const periodInfoData = [
      ['تقرير تقفيل الفترة'],
      [''],
      ['معلومات الفترة'],
      ['اسم الفترة', periodData.name || '-'],
      ['تاريخ البداية', dayjs(periodData.startDate).format('DD/MM/YYYY')],
      ['تاريخ النهاية', dayjs(periodData.endDate).format('DD/MM/YYYY')],
      ['الحالة', periodData.isClosed ? 'مقفلة' : 'مفتوحة'],
      ['عدد القيود', periodData.journals?.length || 0],
      [''],
      ['الملخص المالي'],
      ['إجمالي المدين', Math.round(periodData.journals?.reduce((sum, j) => sum + (j.totalDebit || 0), 0) || 0)],
      ['إجمالي الدائن', Math.round(periodData.journals?.reduce((sum, j) => sum + (j.totalCredit || 0), 0) || 0)],
      ['إجمالي الرصيد', Math.round((periodData.journals?.reduce((sum, j) => sum + (j.totalDebit || 0), 0) || 0) - (periodData.journals?.reduce((sum, j) => sum + (j.totalCredit || 0), 0) || 0))],
      ['الأرباح الإجمالية', periodData.grossProfit?.total || 0],
      ['المصروفات المخصومة', -(periodData.expenseDistribution?.totalExpenses || 0)],
      ['صافي الأرباح', periodData.totalProfit || 0],
      ['']
    ];
    const periodInfoSheet = XLSX.utils.aoa_to_sheet(periodInfoData);
    periodInfoSheet['!cols'] = [{ wch: 25 }, { wch: 30 }];
    XLSX.utils.book_append_sheet(workbook, periodInfoSheet, 'معلومات الفترة');
    if (periodData.partnerProfits && periodData.partnerProfits.length > 0) {
      const partnerData = periodData.partnerProfits.map(p => ({
        'اسم الشريك': p.partnerName,
        'الربح الإجمالي': p.grossProfit || 0,
        'حصة المصروفات': -(p.expenseShare || 0),
        'صافي الربح': p.netProfit || 0
      }));
      partnerData.push({
        'اسم الشريك': 'الإجمالي',
        'الربح الإجمالي': periodData.grossProfit?.partnerTotal || 0,
        'حصة المصروفات': -(periodData.expenseDistribution?.partnersShare || 0),
        'صافي الربح': periodData.totalPartnerProfit || 0
      });
      const partnerSheet = XLSX.utils.json_to_sheet(partnerData);
      partnerSheet['!cols'] = [
        { wch: 25 },
        { wch: 18 },
        { wch: 18 },
        { wch: 18 }
      ];
      XLSX.utils.book_append_sheet(workbook, partnerSheet, 'أرباح الشركاء');
    }
    if (periodData.journals && periodData.journals.length > 0) {
      const journalData = periodData.journals.map(j => ({
        'التاريخ': dayjs(j.date).format('DD/MM/YYYY'),
        'الحالة': getJournalStatusArabic(j.status),
        'النوع': getJournalTypeArabic(j.type),
        'الوصف': j.description || '-',
        'مدين': Math.round(j.totalDebit || 0),
        'دائن': Math.round(j.totalCredit || 0),
        'الرصيد': Math.round((j.totalDebit || 0) - (j.totalCredit || 0))
      }));
      const totalDebit = periodData.journals.reduce((sum, j) => sum + (j.totalDebit || 0), 0);
      const totalCredit = periodData.journals.reduce((sum, j) => sum + (j.totalCredit || 0), 0);
      journalData.push({
        'التاريخ': '',
        'الحالة': '',
        'النوع': '',
        'الوصف': 'الإجمالي',
        'مدين': Math.round(totalDebit),
        'دائن': Math.round(totalCredit),
        'الرصيد': Math.round(totalDebit - totalCredit)
      });
      const journalSheet = XLSX.utils.json_to_sheet(journalData);
      journalSheet['!cols'] = [
        { wch: 15 },
        { wch: 12 },
        { wch: 12 },
        { wch: 40 },
        { wch: 15 },
        { wch: 15 },
        { wch: 15 }
      ];
      XLSX.utils.book_append_sheet(workbook, journalSheet, 'قيود الفترة');
    }
    const excelBuffer = XLSX.write(workbook, {
      bookType: 'xlsx',
      type: 'array',
      bookSST: false
    });
    const blob = new Blob([excelBuffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    });
    const fileName = `تقرير_تقفيل_الفترة_${periodData.name}_${dayjs().format('YYYY-MM-DD')}.xlsx`;
    saveAs(blob, fileName);
  } catch (error) {
    console.error('Excel export error:', error.message);
    throw error;
  }
};