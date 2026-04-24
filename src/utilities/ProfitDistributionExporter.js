import { saveAs } from 'file-saver';
import dayjs from 'dayjs';
import { exportUnifiedReport } from './unifiedReportTemplate';
const reverseRow = (row) => [...row].reverse();
const formatNumber = (num) => {
  if (!num) return "0";
  return Math.round(num).toLocaleString();
};
export const exportProfitDistributionToPDF = async (periodData, enableSaving = false, savingPercentage = 0) => {
  if (!periodData) throw new Error('لا توجد بيانات للتصدير');
  const periodName = periodData.name || 'غير محدد';
  const totalPartnerProfitBeforeSaving = periodData.partners?.reduce((sum, partner) => sum + (partner.finalProfit || partner.totalProfit || 0), 0) || 0;
  let partnerProfitAfterSaving = totalPartnerProfitBeforeSaving;
  if (enableSaving && savingPercentage > 0) {
    partnerProfitAfterSaving = totalPartnerProfitBeforeSaving * (1 - savingPercentage / 100);
  } else if (periodData.totalAfterSaving !== undefined) {
    partnerProfitAfterSaving = periodData.totalAfterSaving;
  }

  return exportUnifiedReport({
    reportTitle: 'تقرير توزيع الأرباح',
    fileName: `تقرير_توزيع_الأرباح_${periodName}`,
    orientation: 'landscape',
    dateFrom: periodData.startDate,
    dateTo: periodData.endDate,
    subtitle: `الفترة: ${periodName} | أرباح الشركة: ${formatNumber(periodData.companyProfit || 0)} | أرباح الشركاء قبل الادخار: ${formatNumber(totalPartnerProfitBeforeSaving)} | بعد الادخار: ${formatNumber(partnerProfitAfterSaving)}`,
    columns: [
      { header: 'اسم الشريك', dataKey: 'partnerName', width: 35, align: 'right' },
      { header: 'الرقم القومي', dataKey: 'nationalId', width: 25 },
      { header: 'الهاتف', dataKey: 'phone', width: 20 },
      { header: 'قبل الادخار', dataKey: 'beforeSaving', width: 25, format: 'number0' },
      { header: 'بعد الادخار', dataKey: 'afterSaving', width: 25, format: 'number0' },
    ],
    rows: (periodData.partners || []).map((partner) => {
      const beforeSaving = partner.finalProfit || partner.totalProfit || 0;
      const afterSaving = enableSaving && savingPercentage > 0
        ? beforeSaving * (1 - savingPercentage / 100)
        : partner.totalAfterSaving || beforeSaving;
      return {
        partnerName: partner.partnerName || '-',
        nationalId: partner.nationalId || '-',
        phone: partner.phone || '-',
        beforeSaving,
        afterSaving,
      };
    }),
  });
};
export const exportProfitDistributionToExcel = async (periodData, enableSaving = false, savingPercentage = 0) => {
  try {
    if (!periodData) {
      throw new Error('لا توجد بيانات للتصدير');
    }
    const XLSX = await import('xlsx');
    const workbook = XLSX.utils.book_new();
    const periodName = periodData.name || 'غير محدد';
    const totalPartnerProfitBeforeSaving = periodData.partners?.reduce((sum, partner) => sum + (partner.finalProfit || partner.totalProfit || 0), 0) || 0;
    const companyProfit = periodData.companyProfit || 0;
    let savedAmount = 0;
    let partnerProfitAfterSaving = 0;
    if (enableSaving && savingPercentage > 0) {
      savedAmount = totalPartnerProfitBeforeSaving * (savingPercentage / 100);
      partnerProfitAfterSaving = totalPartnerProfitBeforeSaving - savedAmount;
    } else if (periodData.totalSaving !== undefined && periodData.totalAfterSaving !== undefined) {
      savedAmount = periodData.totalSaving;
      partnerProfitAfterSaving = periodData.totalAfterSaving;
    } else {
      savedAmount = 0;
      partnerProfitAfterSaving = totalPartnerProfitBeforeSaving;
    }
    const summaryData = [
      ['ملخص توزيع الأرباح'],
      [''],
      [periodName, 'الفترة'],
      [periodData.startDate ? dayjs(periodData.startDate).format('DD/MM/YYYY') : '', 'تاريخ البداية'],
      [periodData.endDate ? dayjs(periodData.endDate).format('DD/MM/YYYY') : '', 'تاريخ النهاية'],
      [''],
      ['البيانات المالية'],
      [''],
      [companyProfit, 'أرباح الشركة'],
      [totalPartnerProfitBeforeSaving, 'إجمالي أرباح الشركاء قبل الادخار'],
      [partnerProfitAfterSaving, 'إجمالي أرباح الشركاء بعد الادخار'],
      [periodData.partners?.length || 0, 'عدد الشركاء'],
    ];
    if (savedAmount > 0) {
      if (enableSaving && savingPercentage > 0) {
        summaryData.splice(11, 0, [savingPercentage.toFixed(2) + '%', 'نسبة الادخار']);
      }
      summaryData.splice(12, 0, [savedAmount, 'المبلغ المدخر']);
    }
    const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
    summarySheet['!cols'] = [
      { wch: 25 },
      { wch: 35 }
    ];
    XLSX.utils.book_append_sheet(workbook, summarySheet, 'ملخص التوزيع');
    if (periodData.partners && periodData.partners.length > 0) {
      const hasSavingData = (enableSaving && savingPercentage > 0) || 
                           periodData.partners.some(p => p.savingAmount);
      let partnersHeaders;
      let partnersTableData;
      let columnWidths;
      if (hasSavingData) {
        partnersHeaders = ['اسم الشريك', 'الرقم القومي', 'الهاتف', 'المبلغ قبل الادخار', 'المبلغ بعد الادخار'];
        partnersTableData = [
          reverseRow(partnersHeaders),
          ...periodData.partners.map(partner => {
            const beforeSaving = partner.finalProfit || partner.totalProfit || 0;
            const afterSaving = enableSaving && savingPercentage > 0 ?
              beforeSaving * (1 - savingPercentage / 100) :
              partner.totalAfterSaving || beforeSaving;
            return reverseRow([
              partner.partnerName || '-',
              partner.nationalId || '-',
              partner.phone || '-',
              beforeSaving,
              afterSaving
            ]);
          })
        ];
        const totalBefore = periodData.partners.reduce((sum, p) => sum + (p.finalProfit || p.totalProfit || 0), 0);
        const totalsRow = [
          'الإجمالي',
          '',
          '',
          totalBefore,
          partnerProfitAfterSaving
        ];
        partnersTableData.push(reverseRow(totalsRow));
        columnWidths = [
          { wch: 20 },
          { wch: 20 },
          { wch: 15 },
          { wch: 20 },
          { wch: 30 }
        ];
      } else {
        partnersHeaders = ['اسم الشريك', 'الرقم القومي', 'الهاتف', 'المبلغ قبل الادخار'];
        partnersTableData = [
          reverseRow(partnersHeaders),
          ...periodData.partners.map(partner => reverseRow([
            partner.partnerName || '-',
            partner.nationalId || '-',
            partner.phone || '-',
            partner.finalProfit || partner.totalProfit || 0
          ]))
        ];
        const totalAmount = periodData.partners.reduce((sum, p) => sum + (p.finalProfit || p.totalProfit || 0), 0);
        const totalsRow = [
          'الإجمالي',
          '',
          '',
          totalAmount
        ];
        partnersTableData.push(reverseRow(totalsRow));
        columnWidths = [
          { wch: 25 },
          { wch: 15 },
          { wch: 20 },
          { wch: 30 }
        ];
      }
      const partnersSheet = XLSX.utils.aoa_to_sheet(partnersTableData);
      partnersSheet['!cols'] = columnWidths;
      XLSX.utils.book_append_sheet(workbook, partnersSheet, 'توزيع الأرباح');
    }
    const excelBuffer = XLSX.write(workbook, {
      bookType: 'xlsx',
      type: 'array',
      bookSST: false
    });
    const blob = new Blob([excelBuffer], {
      type: 'application/vnd.openxmlformats-officdocument.spreadsheetml.sheet'
    });
    const fileName = `تقرير_توزيع_الأرباح_${periodName}_${dayjs().format('YYYY-MM-DD')}.xlsx`;
    saveAs(blob, fileName);
  } catch (error) {
    console.error('Excel export error:', error.message);
    throw error;
  }
};
