import { saveAs } from 'file-saver';
import dayjs from 'dayjs';
import { exportUnifiedReport } from './unifiedReportTemplate';
export const exportSavingsToPDF = async (savingData) => {
  if (!savingData || !savingData.data) {
    throw new Error('لا توجد بيانات للتصدير');
  }
  const partners = savingData.data || [];
  const totalPartners = partners.length;
  const totalSavingsAmount = partners.reduce((sum, partner) => sum + (partner.periods?.[0]?.totalSavings || 0), 0);
  const totalWithdrawals = partners.reduce((sum, partner) => sum + (partner.periods?.[0]?.totalWithdrawals || 0), 0);
  const totalCurrentBalance = partners.reduce((sum, partner) => sum + (partner.periods?.[0]?.currentBalance || 0), 0);
  return exportUnifiedReport({
    reportTitle: 'كشف المدخرات العام',
    fileName: 'كشف_المدخرات_العام',
    orientation: 'landscape',
    subtitle: `إجمالي الشركاء: ${totalPartners} | إجمالي المدخرات: ${totalSavingsAmount.toLocaleString('en-US')} | إجمالي السحوبات: ${totalWithdrawals.toLocaleString('en-US')} | الرصيد الحالي: ${totalCurrentBalance.toLocaleString('en-US')}`,
    columns: [
      { header: 'الرصيد الحالي', dataKey: 'currentBalance', width: 30, format: 'number0' },
      { header: 'إجمالي السحوبات', dataKey: 'totalWithdrawals', width: 30, format: 'number0' },
      { header: 'إجمالي المدخرات', dataKey: 'totalSavings', width: 30, format: 'number0' },
      { header: 'آخر فترة', dataKey: 'periodName', width: 45, align: 'right' },
      { header: 'عدد فترات الادخار', dataKey: 'totalPeriods', width: 28 },
      { header: 'اسم الشريك', dataKey: 'partnerName', width: 37, align: 'right' },
    ],
    rows: partners.map((partner) => ({
      currentBalance: partner.periods?.[0]?.currentBalance || 0,
      totalWithdrawals: partner.periods?.[0]?.totalWithdrawals || 0,
      totalSavings: partner.periods?.[0]?.totalSavings || 0,
      periodName: partner.periods?.[0]?.period?.name || '-',
      totalPeriods: partner.totalPeriods || 0,
      partnerName: partner.partnerName || '-',
    })),
  });
};
export const exportSavingsToExcel = async (savingData) => {
  try {
    if (!savingData || !savingData.data) {
      throw new Error('لا توجد بيانات للتصدير');
    }
    const XLSX = await import('xlsx');
    const workbook = XLSX.utils.book_new();
    const partners = savingData.data || [];
    const totalPartners = partners.length;
    const partnersWithSavings = partners.filter(partner => {
      const lastPeriod = partner.periods?.[0];
      return lastPeriod && lastPeriod.currentBalance > 0;
    });
    const totalPeriods = partners.reduce((sum, partner) => (partner.totalPeriods || 0), 0);
    const totalSavingsAmount = partners.reduce((sum, partner) => {
      const lastPeriod = partner.periods?.[0];
      return sum + (lastPeriod?.totalSavings || 0);
    }, 0);
    const totalWithdrawals = partners.reduce((sum, partner) => {
      const lastPeriod = partner.periods?.[0];
      return sum + (lastPeriod?.totalWithdrawals || 0);
    }, 0);
    const totalCurrentBalance = partners.reduce((sum, partner) => {
      const lastPeriod = partner.periods?.[0];
      return sum + (lastPeriod?.currentBalance || 0);
    }, 0);
    const summaryData = [
      ['كشف المدخرات العام'],
      [''],
      ['ملخص المدخرات'],
      ['إجمالي الشركاء', totalPartners],
      ['شركاء لديهم مدخرات', partnersWithSavings.length],
      ['إجمالي فترات الادخار', totalPeriods],
      ['إجمالي المدخرات الأساسية', totalSavingsAmount],
      ['إجمالي السحوبات', totalWithdrawals],
      ['إجمالي الرصيد الحالي', totalCurrentBalance],
      [''],
      ['تفاصيل المدخرات']
    ];
    const partnersData = [];
    partners.forEach(partner => {
      const lastPeriod = partner.periods?.[0];
      const hasSavings = lastPeriod && lastPeriod.currentBalance > 0;
      partnersData.push({
        'الرصيد الحالي': lastPeriod ? lastPeriod.currentBalance : 0,
        'إجمالي السحوبات': lastPeriod ? lastPeriod.totalWithdrawals : 0,
        'إجمالي المدخرات': lastPeriod ? lastPeriod.totalSavings : 0,
        'آخر فترة ادخار': lastPeriod ? lastPeriod.period.name : '-',
        'عدد فترات الادخار': totalPeriods || 0,
        'اسم الشريك': partner.partnerName
      });
    });
    const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
    const partnersSheet = XLSX.utils.json_to_sheet(partnersData);
    const wscols = [
      { wch: 18 },
      { wch: 18 },
      { wch: 18 },
      { wch: 40 },
      { wch: 20 },
      { wch: 25 }
    ];
    partnersSheet['!cols'] = wscols;
    XLSX.utils.book_append_sheet(workbook, summarySheet, 'ملخص المدخرات');
    XLSX.utils.book_append_sheet(workbook, partnersSheet, 'تفاصيل المدخرات');
    const excelBuffer = XLSX.write(workbook, {
      bookType: 'xlsx',
      type: 'array',
      bookSST: false
    });
    const blob = new Blob([excelBuffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    });
    const fileName = `كشف_المدخرات_العام_${dayjs().format('YYYY-MM-DD')}.xlsx`;
    saveAs(blob, fileName);
  } catch (error) {
    console.error('Excel export error:', error.message);
    throw error;
  }
};
