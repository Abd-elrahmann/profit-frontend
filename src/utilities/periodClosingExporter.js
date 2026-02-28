import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { saveAs } from 'file-saver';
import { pdfTableBaseStyles, getPdfTableStyles, createDidDrawTable } from './pdfTableStyles';
import { registerArabicFonts, drawReportHeader, drawSeparatorLine, drawReportFooter, drawReportSummary, PAGE_MARGIN, getFullWidthColumnStyles, PRIMARY_COLOR } from './pdfReportUtils';
import dayjs from 'dayjs';
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
  return new Promise((resolve, reject) => {
    try {
      const doc = new jsPDF('landscape');
      registerArabicFonts(doc);
      doc.setProperties({
        title: `تقرير تقفيل الفترة - ${periodData.name}`,
        subject: 'تفاصيل تقفيل الفترة',
        author: 'نظام إدارة السلف',
        keywords: 'فترة, تقفيل, محاسبة',
        creator: 'نظام إدارة السلف'
      });
      let yPosition = drawReportHeader(doc, {
        reportTitle: 'تقرير تقفيل الفترة',
        metadata: { date: dayjs().format('DD/MM/YYYY'), time: dayjs().format('HH:mm') }
      });
      yPosition = drawSeparatorLine(doc, yPosition);
      const summaryText = `الفترة: ${periodData.name} | الحالة: ${periodData.isClosed ? 'مقفلة' : 'مفتوحة'} | عدد القيود: ${periodData.journals?.length || 0} | تاريخ التصدير: ${dayjs().format('DD/MM/YYYY HH:mm')}`;
      yPosition = drawReportSummary(doc, yPosition, summaryText);
      const periodInfoData = [
        [periodData.name || '-', 'اسم الفترة'],
        [dayjs(periodData.startDate).format('DD/MM/YYYY'), 'تاريخ البداية'],
        [dayjs(periodData.endDate).format('DD/MM/YYYY'), 'تاريخ النهاية'],
        [periodData.isClosed ? 'مقفلة' : 'مفتوحة', 'الحالة'],
        [periodData.journals?.length || 0, 'عدد القيود']
      ];
      const periodInfoBaseWidths = [50, 50];
      const periodInfoColumnStyles = getFullWidthColumnStyles(doc, periodInfoBaseWidths);
      Object.keys(periodInfoColumnStyles).forEach((k) => {
        periodInfoColumnStyles[k].halign = 'right';
      });
      autoTable(doc, {
        startY: yPosition,
        head: [['القيمة', 'المعلومة']],
        body: periodInfoData,
        ...getPdfTableStyles({
          styles: { halign: 'right', fontStyle: 'bold', fontSize: 9, cellPadding: 4 },
          headStyles: { halign: 'center', fillColor: PRIMARY_COLOR, textColor: [255, 255, 255], fontSize: 9, cellPadding: 4 },
          bodyStyles: { halign: 'right', fontStyle: 'bold', cellPadding: 4 }
        }),
        columnStyles: periodInfoColumnStyles,
        margin: { top: yPosition, left: PAGE_MARGIN, right: PAGE_MARGIN, bottom: 25 },
        tableWidth: 'auto',
        horizontalPageBreak: false,
        didDrawTable: createDidDrawTable(doc)
      });
      yPosition = doc.lastAutoTable.finalY + 10;
      doc.setFontSize(14);
      doc.setFont('Amiri', 'bold');
      doc.text('الملخص المالي', doc.internal.pageSize.width / 2, yPosition, { align: 'center' });
      yPosition += 8;
      const totalDebit = periodData.journals?.reduce((sum, j) => sum + (j.totalDebit || 0), 0) || 0;
      const totalCredit = periodData.journals?.reduce((sum, j) => sum + (j.totalCredit || 0), 0) || 0;
      const balance = totalDebit - totalCredit;
      const summaryData = [
        [Math.round(totalDebit).toLocaleString('en-US'), 'إجمالي المدين'],
        [Math.round(totalCredit).toLocaleString('en-US'), 'إجمالي الدائن'],
        [Math.round(balance).toLocaleString('en-US'), 'إجمالي الرصيد'],
        [(periodData.grossProfit?.total || 0).toLocaleString('en-US'), 'الأرباح الإجمالية'],
        [`-(${(periodData.expenseDistribution?.totalExpenses || 0).toLocaleString('en-US')})`, 'المصروفات المخصومة'],
        [(periodData.totalProfit || 0).toLocaleString('en-US'), 'صافي الأرباح']
      ];
      const summaryBaseWidths = [50, 50];
      const summaryColumnStyles = getFullWidthColumnStyles(doc, summaryBaseWidths);
      Object.keys(summaryColumnStyles).forEach((k) => {
        summaryColumnStyles[k].halign = 'right';
      });
      autoTable(doc, {
        startY: yPosition,
        head: [['القيمة', 'البيان']],
        body: summaryData,
        ...getPdfTableStyles({
          styles: { halign: 'right', fontStyle: 'bold', fontSize: 9, cellPadding: 4 },
          headStyles: { halign: 'center', fillColor: PRIMARY_COLOR, textColor: [255, 255, 255], fontSize: 9, cellPadding: 4 },
          bodyStyles: { halign: 'right', fontStyle: 'bold', cellPadding: 4 }
        }),
        columnStyles: summaryColumnStyles,
        margin: { left: PAGE_MARGIN, right: PAGE_MARGIN, bottom: 25 },
        tableWidth: 'auto',
        didDrawTable: createDidDrawTable(doc)
      });
      yPosition = doc.lastAutoTable.finalY + 10;
      if (periodData.partnerProfits && periodData.partnerProfits.length > 0) {
        doc.setFontSize(14);
        doc.text('أرباح الشركاء', doc.internal.pageSize.width / 2, yPosition, { align: 'center' });
        yPosition += 8;
        const partnerHeaders = [['صافي الربح', 'حصة المصروفات', 'الربح الإجمالي', 'اسم الشريك']];
        const partnerBody = periodData.partnerProfits.map(p => [
          (p.netProfit || 0).toLocaleString('en-US'),
          `-(${(p.expenseShare || 0).toLocaleString('en-US')})`,
          (p.grossProfit || 0).toLocaleString('en-US'),
          p.partnerName
        ]);
        partnerBody.push([
          (periodData.totalPartnerProfit || 0).toLocaleString('en-US'),
          `-(${(periodData.expenseDistribution?.partnersShare || 0).toLocaleString('en-US')})`,
          (periodData.grossProfit?.partnerTotal || 0).toLocaleString('en-US'),
          'الإجمالي'
        ]);
        const partnerBaseWidths = [40, 40, 40, 50];
        const partnerColumnStyles = getFullWidthColumnStyles(doc, partnerBaseWidths);
        autoTable(doc, {
          startY: yPosition,
          head: partnerHeaders,
          body: partnerBody,
          ...getPdfTableStyles({
            styles: { halign: 'right', fontStyle: 'bold', fontSize: 9, cellPadding: 4 },
            headStyles: { halign: 'center', fillColor: PRIMARY_COLOR, textColor: [255, 255, 255], fontSize: 9, cellPadding: 4 },
            bodyStyles: { halign: 'right', fontStyle: 'bold', cellPadding: 4 }
          }),
          columnStyles: partnerColumnStyles,
          margin: { left: PAGE_MARGIN, right: PAGE_MARGIN, bottom: 25 },
          tableWidth: 'auto',
          didParseCell: function (data) {
            if (data.row.index === partnerBody.length - 1) {
              data.cell.styles.fillColor = [240, 240, 240];
              data.cell.styles.fontStyle = 'bold';
            }
          },
          didDrawTable: createDidDrawTable(doc)
        });
        yPosition = doc.lastAutoTable.finalY + 10;
      }
      if (periodData.journals && periodData.journals.length > 0) {
        doc.setFontSize(14);
        doc.text(`قيود الفترة (${periodData.journals.length})`, doc.internal.pageSize.width / 2, yPosition, { align: 'center' });
        yPosition += 8;
        const journalHeaders = [['الرصيد', 'دائن', 'مدين', 'الوصف', 'النوع', 'الحالة', 'التاريخ']];
        const journalBody = periodData.journals.map(j => [
          Math.round((j.totalDebit || 0) - (j.totalCredit || 0)).toLocaleString('en-US'),
          Math.round(j.totalCredit || 0).toLocaleString('en-US'),
          Math.round(j.totalDebit || 0).toLocaleString('en-US'),
          j.description || '-',
          getJournalTypeArabic(j.type),
          getJournalStatusArabic(j.status),
          dayjs(j.date).format('DD/MM/YYYY')
        ]);
        journalBody.push([
          Math.round(balance).toLocaleString('en-US'),
          Math.round(totalCredit).toLocaleString('en-US'),
          Math.round(totalDebit).toLocaleString('en-US'),
          'الإجمالي',
          '',
          '',
          ''
        ]);
        const journalBaseWidths = [25, 25, 25, 45, 25, 30, 25];
        const journalColumnStyles = getFullWidthColumnStyles(doc, journalBaseWidths);
        journalColumnStyles[3].fontSize = 7;
        journalColumnStyles[4].overflow = 'hidden';
        journalColumnStyles[5].minCellWidth = 30;
        journalColumnStyles[5].overflow = 'hidden';
        journalColumnStyles[6].overflow = 'hidden';
        autoTable(doc, {
          startY: yPosition,
          head: journalHeaders,
          body: journalBody,
          ...getPdfTableStyles({
            styles: { halign: 'right', fontStyle: 'bold', fontSize: 9, cellPadding: 4 },
            headStyles: { halign: 'center', fillColor: PRIMARY_COLOR, textColor: [255, 255, 255], fontSize: 9, cellPadding: 4 },
            bodyStyles: { halign: 'right', fontStyle: 'bold', cellPadding: 4 }
          }),
          columnStyles: journalColumnStyles,
          margin: { left: PAGE_MARGIN, right: PAGE_MARGIN, bottom: 25 },
          tableWidth: 'auto',
          pageBreak: 'auto',
          showHead: 'everyPage',
          didParseCell: function (data) {
            if (data.row.index === journalBody.length - 1) {
              data.cell.styles.fillColor = [240, 240, 240];
              data.cell.styles.fontStyle = 'bold';
              data.cell.styles.fontSize = 9;
            }
          },
          didDrawTable: createDidDrawTable(doc)
        });
      }
      const pageCount = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        drawReportFooter(doc, i, pageCount);
      }
      const fileName = `تقرير_تقفيل_الفترة_${periodData.name}_${dayjs().format('YYYY-MM-DD')}.pdf`;
      doc.save(fileName);
      resolve();
    } catch (error) {
      console.error('PDF export error:', error.message);
      reject(error);
    }
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