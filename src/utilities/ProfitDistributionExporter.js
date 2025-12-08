import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import dayjs from 'dayjs';

// Register Arabic fonts
const registerArabicFonts = (doc) => {
  try {
    doc.addFont('/assets/fonts/Amiri-Regular.ttf', 'Amiri', 'normal');
    doc.addFont('/assets/fonts/Amiri-Bold.ttf', 'Amiri', 'bold');
  } catch (error) {
    console.warn('Arabic fonts not found, using default fonts', error);
  }
};

// Helper function to reverse row order for RTL tables
const reverseRow = (row) => [...row].reverse();

// Helper function to format numbers
const formatNumber = (num) => {
  if (!num) return "0";
  return Math.round(num).toLocaleString();
};


export const exportProfitDistributionToPDF = async (periodData, enableSaving = false, savingPercentage = 0) => {
  return new Promise((resolve, reject) => {
    try {
      // Validate data
      if (!periodData) {
        throw new Error('لا توجد بيانات للتصدير');
      }

      // Create new PDF document
      const doc = new jsPDF();

      // Register Arabic fonts
      registerArabicFonts(doc);

      // Set document properties
      doc.setProperties({
        title: 'تقرير توزيع الأرباح',
        subject: 'بيانات توزيع الأرباح',
        author: 'نظام إدارة الأرباح',
        keywords: 'أرباح, توزيع, شركاء, تقرير, بيانات',
        creator: 'نظام إدارة الأرباح'
      });

      // Set Arabic as primary font
      doc.setFont('Amiri', 'bold');

      // Logo positioned on the right - small and at the very top
      const logoWidth = 10;
      const logoHeight = 10;
      const logoX = doc.internal.pageSize.width - logoWidth - 5;
      const logoY = 5;
      doc.addImage('/assets/images/logo.webp', 'PNG', logoX, logoY, logoWidth, logoHeight);

      // Title section - with more spacing to avoid overlap
      doc.setFontSize(18);
      doc.setFont('Amiri', 'bold');
      doc.text('تقرير توزيع الأرباح', doc.internal.pageSize.width / 2, 30, { align: 'center' });

      doc.setFontSize(11);
      doc.setFont('Amiri', 'bold');
      const periodName = periodData.name || 'غير محدد';
      const summaryText = `الفترة: ${periodName} | تاريخ التصدير: ${dayjs().format('DD/MM/YYYY HH:mm')}`;
      doc.text(summaryText, doc.internal.pageSize.width / 2, 45, { align: 'center' });

      const pageWidth = doc.internal.pageSize.width;
      const pageHeight = doc.internal.pageSize.height;
      const tableMargin = 10;

      let yPosition = 55;

      // Period summary section
      doc.setFontSize(12);
      doc.setFont('Amiri', 'bold');
      doc.setTextColor(0, 0, 0);
      doc.text('ملخص الفترة', pageWidth / 2, yPosition, { align: 'center' });
      yPosition += 8;

      const summaryHeaders = [['البيان', 'القيمة']];

      // Calculate profit data
      const totalPartnerProfit = periodData.partners?.reduce((sum, partner) => sum + (partner.totalAfterSaving || partner.totalProfit || 0), 0) || 0;
      const companyProfit = periodData.companyProfit || 0;
      const savedAmount = enableSaving ? totalPartnerProfit * (savingPercentage / 100) : (periodData.totalSaving || 0);
      const partnerProfitAfterSaving = totalPartnerProfit - savedAmount;

      const summaryData = [
        ['أرباح الشركة', companyProfit ? formatNumber(companyProfit) : '0'],
        ['إجمالي أرباح الشركاء قبل الخصم', formatNumber(totalPartnerProfit)],
        ['إجمالي أرباح الشركاء بعد الخصم', formatNumber(partnerProfitAfterSaving)],
        ['المبلغ المدخر', formatNumber(savedAmount)],
        ['عدد الشركاء', periodData.partners?.length || 0],
        ['تاريخ البداية', periodData.startDate ? dayjs(periodData.startDate).format('DD/MM/YYYY') : '-'],
        ['تاريخ النهاية', periodData.endDate ? dayjs(periodData.endDate).format('DD/MM/YYYY') : '-'],
      ];

      if (enableSaving && savingPercentage > 0) {
        summaryData.splice(3, 0, ['نسبة الادخار', `${savingPercentage}%`]);
      }

      autoTable(doc, {
        startY: yPosition,
        head: summaryHeaders,
        body: summaryData,
        theme: 'striped',
        styles: {
          font: 'Amiri',
          fontStyle: 'bold',
          fontSize: 9,
          cellPadding: { top: 4, bottom: 4, left: 4, right: 4 },
          lineColor: [220, 220, 220],
          lineWidth: 0.2,
          halign: 'right',
          valign: 'middle',
          overflow: 'linebreak',
          direction: 'rtl'
        },
        headStyles: {
          fillColor: [13, 64, 165],
          textColor: 255,
          fontStyle: 'bold',
          fontSize: 10,
          halign: 'right',
          valign: 'middle',
          cellPadding: { top: 6, bottom: 6, left: 6, right: 6 },
          overflow: 'linebreak',
          minCellHeight: 10,
          direction: 'rtl'
        },
        bodyStyles: {
          halign: 'right',
          valign: 'middle',
          cellPadding: 4,
          direction: 'rtl'
        },
        columnStyles: {
          0: { cellWidth: 'auto', halign: 'right' },
          1: { cellWidth: 'auto', halign: 'right' }
        },
        margin: { top: yPosition, left: tableMargin, right: tableMargin },
        tableWidth: 'auto',
        horizontalPageBreak: false
      });

      yPosition = doc.lastAutoTable.finalY + 15;

      // Check if we need a new page
      if (yPosition > pageHeight - 100) {
        doc.addPage();
        yPosition = 55;
      }

      // Partners table section
      if (periodData.partners && periodData.partners.length > 0) {
        doc.setFontSize(12);
        doc.setFont('Amiri', 'bold');
        doc.setTextColor(0, 0, 0);
        doc.text('توزيع الأرباح على الشركاء', pageWidth / 2, yPosition, { align: 'center' });
        yPosition += 8;

        // Define headers in logical order (will be reversed for RTL display)
        const partnersHeaders = [['اسم الشريك', 'الرقم القومي', 'الهاتف', 'الأرباح قبل الخصم', 'نسبة ربح الشركة', 'مبلغ ربح الشركة', 'صافي الأرباح', 'المبلغ المدخر']];
        const partnersTableData = periodData.partners.map(partner => [
          partner.partnerName || '-',
          partner.nationalId || '-',
          partner.phone || '-',
          formatNumber(partner.rawProfit) || formatNumber(partner.totalProfit) || '0',
          `${partner.orgProfitPercent}%`,
          formatNumber(partner.companyCut) || '0',
          formatNumber((enableSaving && savingPercentage > 0 ?
            (partner.finalProfit || partner.totalProfit || 0) * (1 - savingPercentage / 100) :
            partner.totalAfterSaving || partner.totalProfit || 0)),
          formatNumber((enableSaving && savingPercentage > 0 ?
            (partner.finalProfit || partner.totalProfit || 0) * (savingPercentage / 100) :
            partner.savingAmount || 0))
        ]);

        autoTable(doc, {
          startY: yPosition,
          head: [reverseRow(partnersHeaders[0])],
          body: partnersTableData.map(row => reverseRow(row)),
          theme: 'striped',
          styles: {
            font: 'Amiri',
            fontStyle: 'bold',
            fontSize: 8,
            cellPadding: { top: 1, bottom: 1, left: 10, right: 1 },
            lineColor: [220, 220, 220],
            lineWidth: 0.2,
            halign: 'right',
            valign: 'middle',
            overflow: 'linebreak',
            direction: 'rtl'
          },
          headStyles: {
            fillColor: [13, 64, 165],
            textColor: 255,
            fontStyle: 'bold',
            fontSize: 7,
            halign: 'right',
            valign: 'middle',
            cellPadding: { top: 4, bottom: 4, left: 4, right: 4 },
            overflow: 'hidden',
            minCellHeight: 15,
            maxCellHeight: 15,
            direction: 'rtl'
          },
          bodyStyles: {
            halign: 'right',
            valign: 'middle',
            cellPadding: 3,
            overflow: 'hidden',
            direction: 'rtl'
          },
          columnStyles: {
            0: { cellWidth: 'auto', minCellWidth: 25, halign: 'right' }, // المبلغ المدخر
            1: { cellWidth: 'auto', minCellWidth: 25, halign: 'right' }, // صافي الأرباح
            2: { cellWidth: 'auto', minCellWidth: 25, halign: 'right' }, // مبلغ ربح الشركة
            3: { cellWidth: 'auto', minCellWidth: 20, halign: 'right' }, // نسبة ربح الشركة
            4: { cellWidth: 'auto', minCellWidth: 25, halign: 'right' }, // الأرباح قبل الخصم
            5: { cellWidth: 'auto', minCellWidth: 20, halign: 'right' }, // الهاتف
            6: { cellWidth: 'auto', minCellWidth: 25, halign: 'right' }, // الرقم القومي
            7: { cellWidth: 'auto', minCellWidth: 25, halign: 'right' }  // اسم الشريك
          },
          margin: { top: yPosition, left: 1, right: 1 },
          tableWidth: 'auto',
          horizontalPageBreak: false,
          pageBreak: 'auto',
          showHead: 'everyPage'
        });

        yPosition = doc.lastAutoTable.finalY + 15;
      }


      // Footer - Professional styling
      const pageCount = doc.internal.getNumberOfPages();
      const footerMargin = 10;
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);

        // Draw footer line
        doc.setDrawColor(200, 200, 200);
        doc.setLineWidth(0.5);
        doc.line(
          footerMargin,
          doc.internal.pageSize.height - 15,
          doc.internal.pageSize.width - footerMargin,
          doc.internal.pageSize.height - 15
        );

        // Footer text
        doc.setFontSize(9);
        doc.setFont('Amiri', 'bold');
        doc.setTextColor(100, 100, 100);

        // Page number - centered
        doc.text(
          `صفحة ${i} من ${pageCount}`,
          doc.internal.pageSize.width / 2,
          doc.internal.pageSize.height - 8,
          { align: 'center' }
        );

        // Creation date - right aligned
        const creationDate = dayjs().format('DD/MM/YYYY HH:mm');
        doc.text(
          `تم الإنشاء في: ${creationDate}`,
          doc.internal.pageSize.width - footerMargin,
          doc.internal.pageSize.height - 8,
          { align: 'right' }
        );

        // Reset text color
        doc.setTextColor(0, 0, 0);
      }

      // Save PDF
      const fileName = `تقرير_توزيع_الأرباح_${periodName}_${dayjs().format('YYYY-MM-DD')}.pdf`;
      doc.save(fileName);
      resolve();
    } catch (error) {
      console.error('PDF export error:', error.message);
      reject(error);
    }
  });
};

export const exportProfitDistributionToExcel = async (periodData, enableSaving = false, savingPercentage = 0) => {
  try {
    // Validate data
    if (!periodData) {
      throw new Error('لا توجد بيانات للتصدير');
    }

    // Create workbook
    const workbook = XLSX.utils.book_new();

    const periodName = periodData.name || 'غير محدد';

    // Calculate profit data
    const totalPartnerProfit = periodData.partners?.reduce((sum, partner) => sum + (partner.totalAfterSaving || partner.totalProfit || 0), 0) || 0;
    const companyProfit = periodData.companyProfit || 0;
    const savedAmount = enableSaving ? totalPartnerProfit * (savingPercentage / 100) : (periodData.totalSaving || 0);
    const partnerProfitAfterSaving = totalPartnerProfit - savedAmount;

    // Summary sheet
    const summaryData = [
      ['ملخص توزيع الأرباح'],
      [''],
      ['الفترة', periodName],
      ['تاريخ البداية', periodData.startDate ? dayjs(periodData.startDate).format('DD/MM/YYYY') : ''],
      ['تاريخ النهاية', periodData.endDate ? dayjs(periodData.endDate).format('DD/MM/YYYY') : ''],
      [''],
      ['البيانات المالية'],
      [''],
      ['أرباح الشركة', companyProfit],
      ['إجمالي أرباح الشركاء قبل الخصم', totalPartnerProfit],
      ['إجمالي أرباح الشركاء بعد الخصم', partnerProfitAfterSaving],
      ['المبلغ المدخر', savedAmount],
      ['عدد الشركاء', periodData.partners?.length || 0],
    ];

    if (enableSaving && savingPercentage > 0) {
      summaryData.splice(10, 0, ['نسبة الادخار', savingPercentage]);
    }

    const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
    summarySheet['!cols'] = [
      { wch: 35 },
      { wch: 25 }
    ];
    XLSX.utils.book_append_sheet(workbook, summarySheet, 'ملخص التوزيع');

    // Partners sheet - reversed for RTL
    if (periodData.partners && periodData.partners.length > 0) {
      const partnersHeaders = ['اسم الشريك', 'الرقم القومي', 'الهاتف', 'الأرباح قبل الخصم', 'نسبة ربح الشركة', 'مبلغ ربح الشركة', 'صافي الأرباح', 'المبلغ المدخر'];
      const partnersTableData = [
        reverseRow(partnersHeaders),
        ...periodData.partners.map(partner => reverseRow([
          partner.partnerName || '-',
          partner.nationalId || '-',
          partner.phone || '-',
          partner.rawProfit || partner.totalProfit || 0,
          partner.orgProfitPercent || 0,
          partner.companyCut || 0,
          (enableSaving && savingPercentage > 0 ?
            (partner.finalProfit || partner.totalProfit || 0) * (1 - savingPercentage / 100) :
            partner.totalAfterSaving || partner.totalProfit || 0),
          (enableSaving && savingPercentage > 0 ?
            (partner.finalProfit || partner.totalProfit || 0) * (savingPercentage / 100) :
            partner.savingAmount || 0)
        ]))
      ];

      // Add totals row
      const totalsRow = [
        'الإجمالي',
        '',
        '',
        periodData.partners.reduce((sum, p) => sum + (p.rawProfit || p.totalProfit || 0), 0),
        '',
        periodData.partners.reduce((sum, p) => sum + (p.companyCut || 0), 0),
        enableSaving && savingPercentage > 0 ? partnerProfitAfterSaving : totalPartnerProfit,
        savedAmount
      ];

      partnersTableData.push(reverseRow(totalsRow));

      const partnersSheet = XLSX.utils.aoa_to_sheet(partnersTableData);
      partnersSheet['!cols'] = [
        { wch: 15 }, // المبلغ المدخر
        { wch: 18 }, // صافي الأرباح
        { wch: 18 }, // مبلغ ربح الشركة
        { wch: 18 }, // نسبة ربح الشركة
        { wch: 18 }, // الأرباح قبل الخصم
        { wch: 15 }, // الهاتف
        { wch: 18 }, // الرقم القومي
        { wch: 25 }  // اسم الشريك
      ];
      XLSX.utils.book_append_sheet(workbook, partnersSheet, 'توزيع الأرباح');
    }


    // Generate Excel file
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
