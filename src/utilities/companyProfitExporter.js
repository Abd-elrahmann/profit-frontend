import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { saveAs } from 'file-saver';
import { pdfTableBaseStyles, createDidDrawTable } from './pdfTableStyles';
import { registerArabicFonts, drawReportHeader, drawSeparatorLine, drawReportFooter, drawReportSummary, PAGE_MARGIN, getFullWidthColumnStyles, PRIMARY_COLOR } from './pdfReportUtils';
import dayjs from 'dayjs';
export const exportCompanyProfitToPDF = async (profitData) => {
  return new Promise((resolve, reject) => {
    try {
      if (!profitData) {
        throw new Error('لا توجد بيانات للتصدير');
      }
      const doc = new jsPDF('landscape');
      registerArabicFonts(doc);
      doc.setProperties({
        title: 'تقرير أرباح الشركة',
        subject: 'تقرير أرباح الشركة وسجل السحوبات',
        author: 'نظام إدارة السلف',
        keywords: 'أرباح, شركة, سحوبات, محاسبة',
        creator: 'نظام إدارة السلف'
      });
      let yPosition = drawReportHeader(doc, {
        reportTitle: 'تقرير أرباح الشركة',
        metadata: { date: dayjs().format('DD/MM/YYYY'), time: dayjs().format('HH:mm') }
      });
      yPosition = drawSeparatorLine(doc, yPosition);
      const availableAmount = profitData.availableAmount || 0;
      const upcomingProfit = profitData.upcomingProfit || 0;
      const cents = profitData.cents || 0;
      const totalUpcoming = profitData.totalUpcoming || 0;
      const totalWithdrawals = profitData.data?.length || 0;
      const withdrawals = profitData.data || [];
      const periodsProfit = profitData.periodsProfit || null;
      const totalWithdrawnAmount = withdrawals.reduce((sum, withdrawal) => sum + (withdrawal.amount || 0), 0);
      const summaryText = `صافي الأرباح القادمة: ${upcomingProfit.toLocaleString('en-US')} | باقي أرباح الشركاء: ${cents.toLocaleString('en-US')} | إجمالي الأرباح: ${totalUpcoming.toLocaleString('en-US')} | الرصيد المتاح: ${availableAmount.toLocaleString('en-US')} | عمليات السحب: ${totalWithdrawals} | المبالغ المسحوبة: ${totalWithdrawnAmount.toLocaleString('en-US')} | تاريخ التصدير: ${dayjs().format('DD/MM/YYYY HH:mm')}`;
      yPosition = drawReportSummary(doc, yPosition, summaryText);
      if (periodsProfit && periodsProfit.periods && periodsProfit.periods.length > 0) {
        doc.setFontSize(13);
        doc.setFont('Amiri', 'bold');
        doc.text('مصادر أرباح الشركة', doc.internal.pageSize.width / 2, yPosition, { align: 'center' });
        yPosition += 10;
        const periodsTableData = [];
        periodsProfit.periods.forEach(period => {
          periodsTableData.push([
            (period.totalCompany || 0).toLocaleString('en-US'),
            (period.cents || 0).toLocaleString('en-US'),
            (period.companyProfit || 0).toLocaleString('en-US'),
            `${period.companyPercentage || 0}%`,
            (period.totalPeriodProfit || 0).toLocaleString('en-US'),
            period.periodName || `الفترة ${periodsTableData.length + 1}`
          ]);
        });
        const periodsHeaders = [
          ['الإجمالي', 'باقي الشركاء', 'أرباح الشركة', 'النسبة', 'إجمالي الأرباح', 'الفترة']
        ];
        const periodsBaseWidths = [30, 30, 30, 25, 35, 50];
        const periodsColumnStyles = getFullWidthColumnStyles(doc, periodsBaseWidths);
        Object.keys(periodsColumnStyles).forEach((k) => {
          periodsColumnStyles[k] = { ...periodsColumnStyles[k], halign: 'center', fontStyle: 'bold' };
        });
        autoTable(doc, {
          startY: yPosition,
          head: periodsHeaders,
          body: periodsTableData,
          ...pdfTableBaseStyles,
          styles: { ...pdfTableBaseStyles.styles, fontSize: 9, cellPadding: 4, fontStyle: 'bold' },
          headStyles: { ...pdfTableBaseStyles.headStyles, fillColor: PRIMARY_COLOR, textColor: [255, 255, 255], fontSize: 9, cellPadding: 4 },
          bodyStyles: { ...pdfTableBaseStyles.bodyStyles, fontStyle: 'bold', cellPadding: 4 },
          columnStyles: periodsColumnStyles,
          margin: { left: PAGE_MARGIN, right: PAGE_MARGIN, bottom: 25 },
          tableWidth: 'auto',
          horizontalPageBreak: false,
          pageBreak: 'auto',
          rowPageBreak: 'avoid',
          showHead: 'everyPage',
          didDrawTable: createDidDrawTable(doc)
        });
        yPosition = doc.lastAutoTable.finalY + 15;
      }
      if (withdrawals.length === 0) {
        doc.setFontSize(14);
        doc.setFont('Amiri', 'bold');
        doc.text('لا توجد عمليات سحب حتى الآن', doc.internal.pageSize.width / 2, yPosition, { align: 'center' });
      } else {
        const tableData = [];
        withdrawals.forEach(withdrawal => {
          tableData.push([
            withdrawal.amount.toLocaleString('en-US'),
            withdrawal.description || '-',
            `${dayjs(withdrawal.date).format('DD/MM/YYYY')}\n${withdrawal.hijriDate || ''}`
          ]);
        });
        const headers = [
          ['المبلغ المسحوب', 'الوصف', 'التاريخ']
        ];
        const pageWidth = doc.internal.pageSize.width;
        const withdrawalsBaseWidths = [35, 80, 55];
        const withdrawalsColumnStyles = getFullWidthColumnStyles(doc, withdrawalsBaseWidths);
        Object.keys(withdrawalsColumnStyles).forEach((k) => {
          withdrawalsColumnStyles[k] = { ...withdrawalsColumnStyles[k], halign: 'center', fontStyle: 'bold' };
        });
        autoTable(doc, {
          startY: yPosition,
          head: headers,
          body: tableData,
          ...pdfTableBaseStyles,
          styles: { ...pdfTableBaseStyles.styles, fontSize: 9, cellPadding: 4, fontStyle: 'bold' },
          headStyles: { ...pdfTableBaseStyles.headStyles, fillColor: PRIMARY_COLOR, textColor: [255, 255, 255], fontSize: 9, cellPadding: 4 },
          bodyStyles: { ...pdfTableBaseStyles.bodyStyles, fontStyle: 'bold', cellPadding: 4 },
          columnStyles: withdrawalsColumnStyles,
          margin: { left: PAGE_MARGIN, right: PAGE_MARGIN, bottom: 25 },
          tableWidth: 'auto',
          horizontalPageBreak: false,
          pageBreak: 'auto',
          rowPageBreak: 'avoid',
          showHead: 'everyPage',
          didParseCell: function (data) {
            if (data.cell.text && data.cell.text.length > 0) {
              const maxLength = data.column.index === 1 ? 60 : 25; 
              if (data.cell.text[0].length > maxLength) {
                data.cell.text[0] = data.cell.text[0].substring(0, maxLength) + '...';
              }
            }
          },
          didDrawTable: createDidDrawTable(doc)
        });
      }
      const pageCount = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        drawReportFooter(doc, i, pageCount);
      }
      const fileName = `تقرير_أرباح_الشركة_${dayjs().format('YYYY-MM-DD')}.pdf`;
      doc.save(fileName);
      resolve();
    } catch (error) {
      console.error('PDF export error:', error.message);
      reject(error);
    }
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