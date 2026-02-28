import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { saveAs } from 'file-saver';
import { pdfTableBaseStyles, createDidDrawTable } from './pdfTableStyles';
import { registerArabicFonts, drawReportHeader, drawSeparatorLine, drawReportFooter, drawReportSummary, PAGE_MARGIN, getFullWidthColumnStyles, PRIMARY_COLOR } from './pdfReportUtils';
import dayjs from 'dayjs';
export const exportSavingsToPDF = async (savingData) => {
  return new Promise((resolve, reject) => {
    try {
      if (!savingData || !savingData.data) {
        throw new Error('لا توجد بيانات للتصدير');
      }
      const doc = new jsPDF('landscape');
      registerArabicFonts(doc);
      doc.setProperties({
        title: 'كشف المدخرات العام',
        subject: 'كشف مدخرات الشركاء',
        author: 'نظام إدارة السلف',
        keywords: 'مدخرات, شركاء, محاسبة',
        creator: 'نظام إدارة السلف'
      });
      let yPosition = drawReportHeader(doc, {
        reportTitle: 'كشف المدخرات العام',
        metadata: { date: dayjs().format('DD/MM/YYYY'), time: dayjs().format('HH:mm') }
      });
      yPosition = drawSeparatorLine(doc, yPosition);
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
      const summaryText = `إجمالي الشركاء: ${totalPartners} | شركاء لديهم مدخرات: ${partnersWithSavings.length} | إجمالي فترات الادخار: ${totalPeriods} | إجمالي المدخرات: ${totalSavingsAmount.toLocaleString('en-US')} | إجمالي السحوبات: ${totalWithdrawals.toLocaleString('en-US')} | الرصيد الحالي: ${totalCurrentBalance.toLocaleString('en-US')} | تاريخ التصدير: ${dayjs().format('DD/MM/YYYY HH:mm')}`;
      yPosition = drawReportSummary(doc, yPosition, summaryText);
      if (partners.length === 0) {
        doc.setFontSize(14);
        doc.setFont('Amiri', 'bold');
        doc.text('لا توجد بيانات مدخرات للشركاء', doc.internal.pageSize.width / 2, yPosition, { align: 'center' });
      } else {
        const tableData = [];
        partners.forEach(partner => {
          const lastPeriod = partner.periods?.[0];
          const hasSavings = lastPeriod && lastPeriod.currentBalance > 0;
          tableData.push([
            lastPeriod ? lastPeriod.currentBalance.toLocaleString('en-US') : '0',
            lastPeriod ? lastPeriod.totalWithdrawals.toLocaleString('en-US') : '0',
            lastPeriod ? lastPeriod.totalSavings.toLocaleString('en-US') : '0',
            lastPeriod ? lastPeriod.period.name : '-',
            partner.totalPeriods || 0,
            partner.partnerName
          ]);
        });
        const headers = [
          ['الرصيد الحالي', 'إجمالي السحوبات', 'إجمالي المدخرات', 'آخر فترة', 'عدد فترات الادخار', 'اسم الشريك']
        ];
        const pageWidth = doc.internal.pageSize.width;
        const baseWidths = [30, 30, 30, 45, 28, 37];
        const columnStyles = getFullWidthColumnStyles(doc, baseWidths);
        Object.keys(columnStyles).forEach((k) => {
          columnStyles[k] = { ...columnStyles[k], fontSize: 9 };
        });
        columnStyles[3].halign = 'right';
        columnStyles[3].overflow = 'linebreak';
        columnStyles[5].halign = 'right';
        autoTable(doc, {
          startY: yPosition,
          head: headers,
          body: tableData,
          ...pdfTableBaseStyles,
          styles: { ...pdfTableBaseStyles.styles, fontStyle: 'bold', fontSize: 9, cellPadding: 4 },
          headStyles: { ...pdfTableBaseStyles.headStyles, fillColor: PRIMARY_COLOR, textColor: [255, 255, 255], fontSize: 9, cellPadding: 4 },
          bodyStyles: { ...pdfTableBaseStyles.bodyStyles, fontStyle: 'bold', cellPadding: 4 },
          columnStyles,
          margin: { top: yPosition, left: PAGE_MARGIN, right: PAGE_MARGIN, bottom: 25 },
          tableWidth: 'auto',
          horizontalPageBreak: false,
          pageBreak: 'auto',
          showHead: 'everyPage',
          didParseCell: function (data) {
            if (data.cell.text && data.cell.text.length > 0 && data.column.index !== 3) {
              const maxLength = data.column.index === 0 ? 15 :
                data.column.index === 1 ? 15 :
                  data.column.index === 2 ? 15 :
                    data.column.index === 4 ? 20 :
                      data.column.index === 5 ? 15 : 25;
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
      const fileName = `كشف_المدخرات_العام_${dayjs().format('YYYY-MM-DD')}.pdf`;
      doc.save(fileName);
      resolve();
    } catch (error) {
      console.error('PDF export error:', error.message);
      reject(error);
    }
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