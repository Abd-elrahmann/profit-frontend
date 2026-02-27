import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

import { saveAs } from 'file-saver';
import { pdfTableBaseStyles, createDidDrawTable } from './pdfTableStyles';
import { registerArabicFonts, drawReportHeader, drawSeparatorLine, drawReportFooter, getCenteredTableMargins, PRIMARY_COLOR } from './pdfReportUtils';
import dayjs from 'dayjs';

export const exportSavingsToPDF = async (savingData) => {
  return new Promise((resolve, reject) => {
    try {
      // Validate data
      if (!savingData || !savingData.data) {
        throw new Error('لا توجد بيانات للتصدير');
      }

      // Create new PDF document
      const doc = new jsPDF();

      // Register Arabic fonts
      registerArabicFonts(doc);

      // Set document properties
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

      doc.setFontSize(13);
      doc.setFont('Amiri', 'bold');
      doc.text('ملخص المدخرات', doc.internal.pageSize.width / 2, yPosition, { align: 'center' });
      yPosition += 8;

      // Calculate totals
      const partners = savingData.data || [];
      const totalPartners = partners.length;
      const partnersWithSavings = partners.filter(partner => {
        const lastPeriod = partner.periods?.[0];
        return lastPeriod && lastPeriod.currentBalance > 0;
      });
      const totalPeriods = partners.reduce((sum, partner) => (partner.totalPeriods || 0), 0);

      // Calculate new totals based on current data structure
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

      doc.setFontSize(11);
      doc.setFont('Amiri', 'bold');
      let currentY = yPosition;
      
      const summaryText1 = `إجمالي الشركاء: ${totalPartners}  |  شركاء لديهم مدخرات: ${partnersWithSavings.length}`;
      doc.text(summaryText1, doc.internal.pageSize.width / 2, currentY, { align: 'center' });
      currentY += 8;

      const summaryText2 = `إجمالي فترات الادخار: ${totalPeriods}`;
      doc.text(summaryText2, doc.internal.pageSize.width / 2, currentY, { align: 'center' });
      currentY += 8;

      const summaryText3 = `إجمالي المدخرات الأساسية: ${totalSavingsAmount.toLocaleString('en-US')}  |  إجمالي السحوبات: ${totalWithdrawals.toLocaleString('en-US')}`;
      doc.text(summaryText3, doc.internal.pageSize.width / 2, currentY, { align: 'center' });
      currentY += 8;

      const summaryText4 = `إجمالي الرصيد الحالي: ${totalCurrentBalance.toLocaleString('en-US')}`;
      doc.text(summaryText4, doc.internal.pageSize.width / 2, currentY, { align: 'center' });
      currentY += 10;

      let yPosition = currentY;

      // Check if there are partners to display
      if (partners.length === 0) {
        doc.setFontSize(14);
        doc.setFont('Amiri', 'bold');
        doc.text('لا توجد بيانات مدخرات للشركاء', doc.internal.pageSize.width / 2, yPosition, { align: 'center' });
      } else {
        // Prepare table data (RTL order)
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

        // Table headers (RTL order)
        const headers = [
          ['الرصيد الحالي', 'إجمالي السحوبات', 'إجمالي المدخرات', 'آخر فترة', 'عدد فترات الادخار', 'اسم الشريك']
        ];

        const pageWidth = doc.internal.pageSize.width;

        // Wider column widths for better readability
        const columnWidths = {
          0: 30, // الرصيد الحالي
          1: 30, // إجمالي السحوبات
          2: 30, // إجمالي المدخرات
          3: 35, // آخر فترة
          4: 28, // عدد فترات الادخار
          5: 37  // اسم الشريك
        };

        const totalColumnWidth = Object.values(columnWidths).reduce((sum, width) => sum + width, 0);
        const tableMargins = getCenteredTableMargins(doc, totalColumnWidth);

        autoTable(doc, {
          startY: yPosition,
          head: headers,
          body: tableData,
          ...pdfTableBaseStyles,
          styles: { ...pdfTableBaseStyles.styles, fontStyle: 'bold', fontSize: 9, cellPadding: 4 },
          headStyles: { ...pdfTableBaseStyles.headStyles, fillColor: PRIMARY_COLOR, textColor: [255, 255, 255], fontSize: 9, cellPadding: 4 },
          bodyStyles: { ...pdfTableBaseStyles.bodyStyles, fontStyle: 'bold', cellPadding: 4 },
          columnStyles: {
            0: { cellWidth: columnWidths[0], fontSize: 9 }, // الرصيد الحالي
            1: { cellWidth: columnWidths[1], fontSize: 9 }, // إجمالي السحوبات
            2: { cellWidth: columnWidths[2], fontSize: 9 }, // إجمالي المدخرات
            3: { cellWidth: columnWidths[3], fontSize: 9, halign: 'right' }, // آخر فترة
            4: { cellWidth: columnWidths[4], fontSize: 9 }, // عدد فترات الادخار
            5: { cellWidth: columnWidths[5], fontSize: 9, halign: 'right' } // اسم الشريك
          },
          margin: { top: yPosition, left: tableMargins.left, right: tableMargins.right, bottom: 25 },
          tableWidth: totalColumnWidth,
          horizontalPageBreak: false, // Disable horizontal page break to keep headers together
          pageBreak: 'auto',
          showHead: 'everyPage',
          didParseCell: function (data) {
            // Prevent cell content from being too wide
            if (data.cell.text && data.cell.text.length > 0) {
              const maxLength = data.column.index === 0 ? 15 :
                data.column.index === 1 ? 15 :
                  data.column.index === 2 ? 15 :
                    data.column.index === 3 ? 20 :
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

      // Save PDF
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
    // Validate data
    if (!savingData || !savingData.data) {
      throw new Error('لا توجد بيانات للتصدير');
    }

    // Lazy load XLSX library
    const XLSX = await import('xlsx');

    // Create workbook
    const workbook = XLSX.utils.book_new();

    // Calculate totals
    const partners = savingData.data || [];
    const totalPartners = partners.length;
    const partnersWithSavings = partners.filter(partner => {
      const lastPeriod = partner.periods?.[0];
      return lastPeriod && lastPeriod.currentBalance > 0;
    });
    const totalPeriods = partners.reduce((sum, partner) => (partner.totalPeriods || 0), 0);

    // Calculate new totals based on current data structure
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

    // Partners data
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

    // Create summary sheet
    const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);

    // Create partners sheet
    const partnersSheet = XLSX.utils.json_to_sheet(partnersData);

    // Auto-size columns for better Excel display
    const wscols = [
      { wch: 18 }, // الرصيد الحالي
      { wch: 18 }, // إجمالي السحوبات
      { wch: 18 }, // إجمالي المدخرات
      { wch: 25 }, // آخر فترة ادخار
      { wch: 20 }, // عدد فترات الادخار
      { wch: 25 }  // اسم الشريك
    ];
    partnersSheet['!cols'] = wscols;

    // Add sheets to workbook
    XLSX.utils.book_append_sheet(workbook, summarySheet, 'ملخص المدخرات');
    XLSX.utils.book_append_sheet(workbook, partnersSheet, 'تفاصيل المدخرات');

    // Generate Excel file
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

