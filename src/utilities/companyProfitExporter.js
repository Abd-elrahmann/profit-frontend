import { saveAs } from 'file-saver';
import dayjs from 'dayjs';
import { exportUnifiedReport } from './unifiedReportTemplate';
export const exportCompanyProfitToPDF = async (profitData) => {
  if (!profitData) throw new Error('لا توجد بيانات للتصدير');
  const withdrawals = profitData.data || [];
  const totalWithdrawnAmount = withdrawals.reduce((sum, withdrawal) => sum + (withdrawal.amount || 0), 0);
  return exportUnifiedReport({
    reportTitle: 'تقرير أرباح الشركة',
    fileName: 'تقرير_أرباح_الشركة',
    orientation: 'landscape',
    subtitle: `صافي الأرباح القادمة: ${(profitData.upcomingProfit || 0).toLocaleString('en-US')} | الرصيد المتاح: ${(profitData.availableAmount || 0).toLocaleString('en-US')} | عمليات السحب: ${withdrawals.length} | المبالغ المسحوبة: ${totalWithdrawnAmount.toLocaleString('en-US')}`,
    columns: [
      { header: 'المبلغ المسحوب', dataKey: 'amount', width: 35, format: 'number0' },
      { header: 'الوصف', dataKey: 'description', width: 80, align: 'right' },
      { header: 'التاريخ', dataKey: 'dateText', width: 55 },
    ],
    rows: withdrawals.map((withdrawal) => ({
      amount: withdrawal.amount || 0,
      description: withdrawal.description || '-',
      dateText: dayjs(withdrawal.date).format('DD/MM/YYYY'),
    })),
  });
};
export const exportCompanyProfitToExcel = async (profitData) => {
  try { 
    if (!profitData) {
      throw new Error('لا توجد بيانات للتصدير');
    }
    const XLSX = await import('xlsx');
    const workbook = XLSX.utils.book_new();
    const availableAmount = profitData.availableAmount || 0;
    const upcomingProfit = profitData.upcomingProfit || 0;
    const cents = profitData.cents || 0;
    const totalUpcoming = profitData.totalUpcoming || 0;
    const totalWithdrawals = profitData.data?.length || 0;
    const withdrawals = profitData.data || [];
    const periodsProfit = profitData.periodsProfit || null;
    const totalWithdrawnAmount = withdrawals.reduce((sum, withdrawal) => sum + (withdrawal.amount || 0), 0);
    const summaryData = [
      ['تقرير أرباح الشركة'],
      [''],
      ['ملخص الأرباح'],
      ['صافي الأرباح القادمة للشركة', upcomingProfit],
      ['باقي أرباح الشركاء', cents],
      ['إجمالي الأرباح', totalUpcoming],
      ['الرصيد المتاح للسحب', availableAmount],
      ['إجمالي عمليات السحب', totalWithdrawals],
      ['إجمالي المبالغ المسحوبة', totalWithdrawnAmount],
      [''],
      ['تفاصيل السحوبات']
    ];
    const withdrawalsData = [];
    withdrawals.forEach(withdrawal => {
      withdrawalsData.push({
        'التاريخ الميلادي': dayjs(withdrawal.date).format('DD/MM/YYYY'),
        'التاريخ الهجري': withdrawal.hijriDate || '',
        'الوصف': withdrawal.description || '-',
        'المبلغ المسحوب': withdrawal.amount || 0
      });
    });
    const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
    let withdrawalsSheet;
    if (withdrawalsData.length > 0) {
      withdrawalsSheet = XLSX.utils.json_to_sheet(withdrawalsData);
      const wscols = [
        { wch: 15 }, 
        { wch: 15 }, 
        { wch: 60 }, 
        { wch: 25 }  
      ];
      withdrawalsSheet['!cols'] = wscols;
    }
    let periodsSheet;
    if (periodsProfit && periodsProfit.periods && periodsProfit.periods.length > 0) {
      const periodsData = [];
      periodsProfit.periods.forEach(period => {
        periodsData.push({
          'الفترة': period.periodName || `الفترة ${periodsData.length + 1}`,
          'إجمالي الأرباح': period.totalPeriodProfit || 0,
          'النسبة': `${period.companyPercentage || 0}%`,
          'أرباح الشركة': period.companyProfit || 0,
          'باقي الشركاء': period.cents || 0,
          'الإجمالي': period.totalCompany || 0
        });
      });
      periodsSheet = XLSX.utils.json_to_sheet(periodsData);
      const periodsCols = [
        { wch: 25 }, 
        { wch: 20 }, 
        { wch: 15 }, 
        { wch: 20 }, 
        { wch: 20 }, 
        { wch: 20 }  
      ];
      periodsSheet['!cols'] = periodsCols;
    }
    XLSX.utils.book_append_sheet(workbook, summarySheet, 'ملخص الأرباح');
    if (periodsSheet) {
      XLSX.utils.book_append_sheet(workbook, periodsSheet, 'مصادر أرباح الشركة');
    }
    if (withdrawalsSheet) {
      XLSX.utils.book_append_sheet(workbook, withdrawalsSheet, 'سجل السحوبات');
    }
    const excelBuffer = XLSX.write(workbook, {
      bookType: 'xlsx',
      type: 'array',
      bookSST: false
    });
    const blob = new Blob([excelBuffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    });
    const fileName = `تقرير_أرباح_الشركة_${dayjs().format('YYYY-MM-DD')}.xlsx`;
    saveAs(blob, fileName);
  } catch (error) {
    console.error('Excel export error:', error.message);
    throw error;
  }
};
