import { saveAs } from 'file-saver';
import dayjs from 'dayjs';
import { getJournalsByMonthResolved } from '../components/Treasury/treasuryUtils';
import { exportUnifiedReport } from './unifiedReportTemplate';
export const exportJournalsToPDF = async (journalData, accountName, accountId = null) => {
  if (!journalData) {
    throw new Error('لا توجد بيانات للتصدير');
  }

  const allJournals = [];
  const jbm = getJournalsByMonthResolved(journalData);
  if (jbm) {
    Object.values(jbm).forEach((monthData) => {
      if (monthData.entries && Array.isArray(monthData.entries)) {
        allJournals.push(...monthData.entries);
      }
    });
  }
  if (allJournals.length === 0 && journalData.journals && Array.isArray(journalData.journals)) {
    allJournals.push(...journalData.journals);
  }

  allJournals.sort((a, b) => new Date(b.date) - new Date(a.date));
  const filteredJournals =
    accountId == null
      ? allJournals
      : allJournals.filter((journal) => Number(journal.accountId) === Number(accountId));

  const totalDebit = filteredJournals.reduce((sum, journal) => sum + (journal.debit || 0), 0);
  const totalCredit = filteredJournals.reduce((sum, journal) => sum + (journal.credit || 0), 0);
  const currentBalance = journalData.account?.balance || 0;

  return exportUnifiedReport({
    reportTitle: 'سجل القيود المحاسبية',
    fileName: `سجل_القيود_${accountName}`,
    orientation: 'landscape',
    subtitle: `اسم الحساب: ${accountName} | إجمالي المدين: ${totalDebit.toLocaleString('en-US')} | إجمالي الدائن: ${totalCredit.toLocaleString('en-US')} | الرصيد الحالي: ${currentBalance.toLocaleString('en-US')} | عدد القيود: ${filteredJournals.length}`,
    columns: [
      { header: 'الحالة', dataKey: 'statusAr', width: 15, align: 'right' },
      { header: 'الرصيد', dataKey: 'balance', width: 15, format: 'number0' },
      { header: 'دائن', dataKey: 'credit', width: 12, format: 'number0' },
      { header: 'مدين', dataKey: 'debit', width: 12, format: 'number0' },
      { header: 'الوصف', dataKey: 'description', width: 40, align: 'right' },
      { header: 'النوع', dataKey: 'typeAr', width: 18, align: 'right' },
      { header: 'الحساب', dataKey: 'accountDisplay', width: 28, align: 'right' },
      { header: 'التاريخ', dataKey: 'dateText', width: 20 },
    ],
    rows: filteredJournals.map((journal) => ({
      dateText: dayjs(journal.date).format('DD/MM/YYYY HH:mm'),
      accountDisplay:
        journal.accountDisplay ||
        `${journal.accountCode || ''}${journal.accountName ? `-${journal.accountName}` : ''}` ||
        '-',
      description: journal.description || '-',
      debit: journal.debit > 0 ? journal.debit : 0,
      credit: journal.credit > 0 ? journal.credit : 0,
      balance: journal.balance || 0,
      typeAr: getJournalTypeArabic(journal.type),
      statusAr: getJournalStatusArabic(journal.status),
    })),
  });
};
export const exportJournalsToExcel = async (journalData, accountName, accountId = null) => {
  try {
    if (!journalData) {
      throw new Error('لا توجد بيانات للتصدير');
    }
    const allJournals = [];
    const jbm = getJournalsByMonthResolved(journalData);
    if (jbm) {
      Object.values(jbm).forEach(monthData => {
        if (monthData.entries && Array.isArray(monthData.entries)) {
          allJournals.push(...monthData.entries);
        }
      });
    }
    if (allJournals.length === 0 && journalData.journals && Array.isArray(journalData.journals)) {
      allJournals.push(...journalData.journals);
    }
    allJournals.sort((a, b) => new Date(b.date) - new Date(a.date));
    const filteredJournals =
      accountId == null
        ? allJournals
        : allJournals.filter((journal) => Number(journal.accountId) === Number(accountId));
    const XLSX = await import('xlsx');
    const workbook = XLSX.utils.book_new();
    const totalDebit = filteredJournals.reduce((sum, journal) => sum + (journal.debit || 0), 0);
    const totalCredit = filteredJournals.reduce((sum, journal) => sum + (journal.credit || 0), 0);
    const currentBalance = journalData.account?.balance || 0;
    const totalJournals = filteredJournals.length;
    const summaryData = [
      ['سجل القيود المحاسبية'],
      [`اسم الحساب: ${accountName}`],
      [''],
      ['إجمالي المدين', totalDebit],
      ['إجمالي الدائن', totalCredit],
      ['الرصيد الحالي', currentBalance],
      ['عدد القيود', totalJournals],
      ['']
    ];
    const journalsData = [];
    filteredJournals.forEach(journal => {
      journalsData.push({
        'الحالة': getJournalStatusArabic(journal.status),
        'الرصيد': journal.balance || 0,
        'دائن': journal.credit > 0 ? journal.credit : 0,
        'مدين': journal.debit > 0 ? journal.debit : 0,
        'الوصف': journal.description || '-',
        'النوع': getJournalTypeArabic(journal.type),
        'الحساب': journal.accountDisplay || `${journal.accountCode || ''}${journal.accountName ? `-${journal.accountName}` : ''}` || '-',
        'التاريخ': dayjs(journal.date).format('DD/MM/YYYY hh:mm'),
      });
    });
    const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
    const journalsSheet = XLSX.utils.json_to_sheet(journalsData);
    const wscols = [
      { wch: 20 },
      { wch: 24 },
      { wch: 18 },
      { wch: 40 },
      { wch: 12 },
      { wch: 12 },
      { wch: 15 },
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
    const fileName = `سجل_القيود_${accountName}_${dayjs().format('YYYY-MM-DD')}.xlsx`;
    saveAs(blob, fileName);
  } catch (error) {
    console.error('Excel export error:', error.message);
    throw error;
  }
};
const getJournalTypeArabic = (type) => {
  const typeMap = {
    GENERAL: 'عام',
    OPENING: 'افتتاحي',
    LOAN_DISBURSEMENT: 'صرف سلفة',
    REPAYMENT: 'سداد',
    CAPITAL: 'رأس المال',
    WITHDRAWAL: 'سحب',
    DEPOSIT: 'إيداع',
  };
  return typeMap[type] || type || '-';
};
const getJournalStatusArabic = (status) => {
  const statusMap = {
    POSTED: 'مرحل',
    DRAFT: 'مسودة',
    PENDING: 'قيد الانتظار',
    CANCELLED: 'ملغي',
  };
  return statusMap[status] || status || '-';
};
export const exportStatisticsToPDF = async (statisticsData, accountName) => {
  if (!statisticsData) {
    throw new Error('لا توجد بيانات للتصدير');
  }

  const availableBalance = statisticsData.account?.balance || 0;
  const totalDebit = statisticsData.account?.debit || 0;
  const totalCredit = statisticsData.account?.credit || 0;
  const loansBalance = statisticsData.loansBalance || 0;
  const total = statisticsData.total || 0;
  const totalRepaymentsAmount = statisticsData.repayments?.totalAmount || 0;
  const paidRepaymentsUntilNow = statisticsData.repayments?.paidUntilNow || 0;
  const remainingRepayments = totalRepaymentsAmount - paidRepaymentsUntilNow;
  const repaymentsProgress =
    totalRepaymentsAmount > 0
      ? Math.min(100, Math.max(0, (paidRepaymentsUntilNow / totalRepaymentsAmount) * 100))
      : 0;

  return exportUnifiedReport({
    reportTitle: 'إحصائيات الصندوق',
    fileName: `إحصائيات_الصندوق_${accountName}`,
    orientation: 'landscape',
    subtitle: `الحساب: ${accountName} | الرصيد المتاح: ${availableBalance.toLocaleString('en-US')} | إجمالي الوارد: ${totalDebit.toLocaleString('en-US')} | إجمالي الصادر: ${totalCredit.toLocaleString('en-US')}`,
    columns: [
      { header: 'المؤشر', dataKey: 'metric', width: 90, align: 'right' },
      { header: 'القيمة', dataKey: 'value', width: 70, align: 'center' },
    ],
    rows: [
      { metric: 'الرصيد المتاح', value: availableBalance },
      { metric: 'إجمالي الوارد', value: totalDebit },
      { metric: 'إجمالي الصادر', value: totalCredit },
      { metric: 'الرصيد في السوق', value: loansBalance },
      { metric: 'الإجمالي (المتاح + في السوق)', value: total },
      ...(totalRepaymentsAmount > 0
        ? [
            { metric: 'إجمالي التحصيلات', value: totalRepaymentsAmount },
            { metric: 'واصل حتى الآن', value: paidRepaymentsUntilNow },
            { metric: 'متبقي', value: remainingRepayments },
            { metric: 'نسبة التحصيل', value: `${repaymentsProgress.toFixed(1)}%` },
          ]
        : []),
      ...(statisticsData.currentMonth?.totalAmount > 0
        ? [
            { metric: 'تحصيل هذا الشهر - إجمالي التحصيلات', value: statisticsData.currentMonth.totalAmount || 0 },
            { metric: 'تحصيل هذا الشهر - تم تحصيله', value: statisticsData.currentMonth.paidUntilNow || 0 },
            { metric: 'تحصيل هذا الشهر - متبقي', value: (statisticsData.currentMonth.totalAmount || 0) - (statisticsData.currentMonth.paidUntilNow || 0) },
            {
              metric: 'تحصيل هذا الشهر - نسبة التحصيل',
              value: `${(
                statisticsData.currentMonth.totalAmount > 0
                  ? Math.min(
                      100,
                      Math.max(
                        0,
                        ((statisticsData.currentMonth.paidUntilNow || 0) / statisticsData.currentMonth.totalAmount) * 100
                      )
                    )
                  : 0
              ).toFixed(1)}%`,
            },
          ]
        : []),
    ],
  });
};
export const exportStatisticsToExcel = async (statisticsData, accountName) => {
  try {
    if (!statisticsData) {
      throw new Error('لا توجد بيانات للتصدير');
    }
    const availableBalance = statisticsData.account?.balance || 0;
    const totalDebit = statisticsData.account?.debit || 0;
    const totalCredit = statisticsData.account?.credit || 0;
    const loansBalance = statisticsData.loansBalance || 0;
    const total = statisticsData.total || 0;
    const totalRepaymentsAmount = statisticsData.repayments?.totalAmount || 0;
    const paidRepaymentsUntilNow = statisticsData.repayments?.paidUntilNow || 0;
    const remainingRepayments = totalRepaymentsAmount - paidRepaymentsUntilNow;
    const repaymentsProgress =
      totalRepaymentsAmount > 0
        ? Math.min(
            100,
            Math.max(0, (paidRepaymentsUntilNow / totalRepaymentsAmount) * 100)
          )
        : 0;
    const currentMonthTotalAmount = statisticsData.currentMonth?.totalAmount || 0;
    const currentMonthPaidUntilNow = statisticsData.currentMonth?.paidUntilNow || 0;
    const currentMonthRemaining = currentMonthTotalAmount - currentMonthPaidUntilNow;
    const currentMonthProgress =
      currentMonthTotalAmount > 0
        ? Math.min(
            100,
            Math.max(0, (currentMonthPaidUntilNow / currentMonthTotalAmount) * 100)
          )
        : 0;
    const XLSX = await import('xlsx');
    const workbook = XLSX.utils.book_new();
    const statisticsDataArray = [
      ['إحصائيات الصندوق'],
      [`الحساب: ${accountName}`],
      [''],
      ['القيمة', 'المؤشر'],
      [availableBalance, 'الرصيد المتاح'],
      [totalDebit, 'إجمالي الوارد'],
      [totalCredit, 'إجمالي الصادر'],
      [loansBalance, 'الرصيد في السوق'],
      [total, 'الإجمالي (المتاح + في السوق)']
    ];
    if (totalRepaymentsAmount > 0) {
      statisticsDataArray.push(
        [''],
        ['القيمة', 'ملخص التحصيلات'],
        [totalRepaymentsAmount, 'إجمالي التحصيلات'],
        [paidRepaymentsUntilNow, 'واصل حتى الآن'],
        [remainingRepayments, 'متبقي'],
        [`${repaymentsProgress.toFixed(1)}%`, 'نسبة التحصيل']
      );
    }
    if (currentMonthTotalAmount > 0) {
      statisticsDataArray.push(
        [''],
        ['القيمة', 'تحصيل هذا الشهر'],
        [currentMonthTotalAmount, 'إجمالي التحصيلات'],
        [currentMonthPaidUntilNow, 'تم تحصيله'],
        [currentMonthRemaining, 'متبقي'],
        [`${currentMonthProgress.toFixed(1)}%`, 'نسبة التحصيل']
      );
    }
    const statisticsSheet = XLSX.utils.aoa_to_sheet(statisticsDataArray);
    statisticsSheet['!cols'] = [
      { wch: 20 },
      { wch: 30 }
    ];
    XLSX.utils.book_append_sheet(workbook, statisticsSheet, 'الإحصائيات');
    const excelBuffer = XLSX.write(workbook, { 
      bookType: 'xlsx', 
      type: 'array',
      bookSST: false 
    });
    const blob = new Blob([excelBuffer], { 
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
    });
    const fileName = `إحصائيات_الصندوق_${accountName}_${dayjs().format('YYYY-MM-DD')}.xlsx`;
    saveAs(blob, fileName);
  } catch (error) {
    console.error('Excel export error:', error.message);
    throw error;
  }
};
