import { saveAs } from 'file-saver';
import dayjs from 'dayjs';
export const exportJournalsToExcel = async (journalData, accountName) => {
  try {
    if (!journalData) {
      throw new Error('لا توجد بيانات للتصدير');
    }
    const allJournals = [];
    if (journalData.journalsByMonth) {
      Object.values(journalData.journalsByMonth).forEach(monthData => {
        if (monthData.entries && Array.isArray(monthData.entries)) {
          allJournals.push(...monthData.entries);
        }
      });
    }
    if (allJournals.length === 0 && journalData.journals && Array.isArray(journalData.journals)) {
      allJournals.push(...journalData.journals);
    }
    allJournals.sort((a, b) => new Date(b.date) - new Date(a.date));
    const XLSX = await import('xlsx');
    const workbook = XLSX.utils.book_new();
    const totalDebit = allJournals.reduce((sum, journal) => sum + (journal.debit || 0), 0);
    const totalCredit = allJournals.reduce((sum, journal) => sum + (journal.credit || 0), 0);
    const currentBalance = journalData.account?.balance || 0;
    const totalJournals = allJournals.length;
    const summaryData = [
      ['سجل القيود المحاسبية'],
      [`الحساب: ${accountName}`],
      [''],
      ['إجمالي المدين', totalDebit],
      ['إجمالي الدائن', totalCredit],
      ['الرصيد الحالي', currentBalance],
      ['عدد القيود', totalJournals],
      ['']
    ];
    const journalsData = [];
    allJournals.forEach(journal => {
      journalsData.push({
        'التاريخ': dayjs(journal.date).format('DD/MM/YYYY hh:mm'),
        'الوصف': journal.description || '-',
        'مدين': journal.debit > 0 ? journal.debit : 0,
        'دائن': journal.credit > 0 ? journal.credit : 0,
        'الرصيد': journal.balance || 0,
        'المرحل بواسطة': journal.postedBy || 'غير محدد',
        'نوع القيد': getJournalTypeArabic(journal.type)
      });
    });
    const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
    const journalsSheet = XLSX.utils.json_to_sheet(journalsData);
    const wscols = [
      { wch: 20 },
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
    'GENERAL': 'عام',
    'LOAN_DISBURSEMENT': 'صرف سلفة',
    'REPAYMENT': 'سداد',
    'CAPITAL': 'رأس المال',
    'WITHDRAWAL': 'سحب',
    'DEPOSIT': 'إيداع'
  };
  return typeMap[type] || type;
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