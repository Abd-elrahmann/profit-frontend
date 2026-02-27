import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

import { saveAs } from 'file-saver';
import { getPdfTableStyles, createDidDrawTable } from './pdfTableStyles';
import { registerArabicFonts, drawReportHeader, drawSeparatorLine, drawReportFooter, getCenteredTableMargins, PRIMARY_COLOR } from './pdfReportUtils';
import dayjs from 'dayjs';

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

      const periodName = periodData.name || 'غير محدد';
      let yPosition = drawReportHeader(doc, {
        reportTitle: 'تقرير توزيع الأرباح',
        metadata: { date: dayjs().format('DD/MM/YYYY'), time: dayjs().format('HH:mm') }
      });
      yPosition = drawSeparatorLine(doc, yPosition);

      doc.setFontSize(11);
      doc.setFont('Amiri', 'bold');
      doc.text(`الفترة: ${periodName}`, doc.internal.pageSize.width / 2, yPosition, { align: 'center' });
      yPosition += 10;

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

      const summaryHeaders = [['القيمة', 'البيان']];

      // Calculate profit data - matching the main page logic
      const totalPartnerProfitBeforeSaving = periodData.partners?.reduce((sum, partner) => sum + (partner.finalProfit || partner.totalProfit || 0), 0) || 0;
      const companyProfit = periodData.companyProfit || 0;
      
      // Calculate saved amount and profit after saving
      let savedAmount = 0;
      let partnerProfitAfterSaving = 0;
      
      if (enableSaving && savingPercentage > 0) {
        // When saving is being set
        savedAmount = totalPartnerProfitBeforeSaving * (savingPercentage / 100);
        partnerProfitAfterSaving = totalPartnerProfitBeforeSaving - savedAmount;
      } else if (periodData.totalSaving !== undefined && periodData.totalAfterSaving !== undefined) {
        // When data already has saving information
        savedAmount = periodData.totalSaving;
        partnerProfitAfterSaving = periodData.totalAfterSaving;
      } else {
        // No saving
        savedAmount = 0;
        partnerProfitAfterSaving = totalPartnerProfitBeforeSaving;
      }

      const summaryData = [
        [companyProfit ? formatNumber(companyProfit) : '0', 'أرباح الشركة'],
        [formatNumber(totalPartnerProfitBeforeSaving), 'إجمالي أرباح الشركاء قبل الادخار'],
        [formatNumber(partnerProfitAfterSaving), 'إجمالي أرباح الشركاء بعد الادخار'],
        [periodData.partners?.length || 0, 'عدد الشركاء'],
        [periodData.startDate ? dayjs(periodData.startDate).format('DD/MM/YYYY') : '-', 'تاريخ البداية'],
        [periodData.endDate ? dayjs(periodData.endDate).format('DD/MM/YYYY') : '-', 'تاريخ النهاية'],
      ];

      // Add saving info if applicable
      if (savedAmount > 0) {
        if (enableSaving && savingPercentage > 0) {
          summaryData.splice(3, 0, [`${savingPercentage.toFixed(2)}%`, 'نسبة الادخار']);
        }
        summaryData.splice(4, 0, [formatNumber(savedAmount), 'المبلغ المدخر']);
      }

      const summaryTableWidth = 100;
      const summaryTableMargins = getCenteredTableMargins(doc, summaryTableWidth);
      autoTable(doc, {
        startY: yPosition,
        head: summaryHeaders,
        body: summaryData,
        ...getPdfTableStyles({
          styles: { halign: 'right', fontStyle: 'bold', fontSize: 9, cellPadding: 4 },
          headStyles: { halign: 'right', fillColor: PRIMARY_COLOR, textColor: [255, 255, 255], fontSize: 9, cellPadding: 4 },
          bodyStyles: { halign: 'right', fontStyle: 'bold', cellPadding: 4 }
        }),
        columnStyles: {
          0: { cellWidth: 'auto', halign: 'right' },
          1: { cellWidth: 'auto', halign: 'right' }
        },
        margin: { top: yPosition, left: summaryTableMargins.left, right: summaryTableMargins.right, bottom: 25 },
        tableWidth: summaryTableWidth,
        horizontalPageBreak: false,
        didDrawTable: createDidDrawTable(doc)
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

        // Check if there's saving data to display
        const hasSavingData = (enableSaving && savingPercentage > 0) || 
                             periodData.partners.some(p => p.savingAmount);

        // Define headers based on whether we have saving data
        let partnersHeaders;
        let partnersTableData;
        
        if (hasSavingData) {
          partnersHeaders = [['اسم الشريك', 'الرقم القومي', 'الهاتف', 'المبلغ قبل الادخار', 'المبلغ بعد الادخار']];
          partnersTableData = periodData.partners.map(partner => {
            const beforeSaving = partner.finalProfit || partner.totalProfit || 0;
            const afterSaving = enableSaving && savingPercentage > 0 ?
              beforeSaving * (1 - savingPercentage / 100) :
              partner.totalAfterSaving || beforeSaving;
            
            return [
              partner.partnerName || '-',
              partner.nationalId || '-',
              partner.phone || '-',
              formatNumber(beforeSaving),
              formatNumber(afterSaving)
            ];
          });
        } else {
          partnersHeaders = [['اسم الشريك', 'الرقم القومي', 'الهاتف', 'المبلغ قبل الادخار']];
          partnersTableData = periodData.partners.map(partner => [
            partner.partnerName || '-',
            partner.nationalId || '-',
            partner.phone || '-',
            formatNumber(partner.finalProfit || partner.totalProfit || 0)
          ]);
        }

        // Define column styles based on number of columns
        const columnStyles = hasSavingData ? {
          0: { cellWidth: 'auto', minCellWidth: 30, halign: 'right' }, // المبلغ بعد الادخار
          1: { cellWidth: 'auto', minCellWidth: 30, halign: 'right' }, // المبلغ قبل الادخار
          2: { cellWidth: 'auto', minCellWidth: 25, halign: 'right' }, // الهاتف
          3: { cellWidth: 'auto', minCellWidth: 30, halign: 'right' }, // الرقم القومي
          4: { cellWidth: 'auto', minCellWidth: 35, halign: 'right' }  // اسم الشريك
        } : {
          0: { cellWidth: 'auto', minCellWidth: 35, halign: 'right' }, // المبلغ قبل الادخار
          1: { cellWidth: 'auto', minCellWidth: 25, halign: 'right' }, // الهاتف
          2: { cellWidth: 'auto', minCellWidth: 30, halign: 'right' }, // الرقم القومي
          3: { cellWidth: 'auto', minCellWidth: 40, halign: 'right' }  // اسم الشريك
        };

        const partnersTableWidth = 170;
        const partnersTableMargins = getCenteredTableMargins(doc, partnersTableWidth);
        autoTable(doc, {
          startY: yPosition,
          head: [reverseRow(partnersHeaders[0])],
          body: partnersTableData.map(row => reverseRow(row)),
          ...getPdfTableStyles({
            styles: { halign: 'right', fontStyle: 'bold', fontSize: 9, cellPadding: 4 },
            headStyles: { halign: 'right', fillColor: PRIMARY_COLOR, textColor: [255, 255, 255], fontSize: 9, cellPadding: 4 },
            bodyStyles: { halign: 'right', fontStyle: 'bold', cellPadding: 4 }
          }),
          columnStyles: columnStyles,
          margin: { top: yPosition, left: partnersTableMargins.left, right: partnersTableMargins.right, bottom: 25 },
          tableWidth: partnersTableWidth,
          horizontalPageBreak: false,
          pageBreak: 'auto',
          showHead: 'everyPage',
          didDrawTable: createDidDrawTable(doc)
        });

        yPosition = doc.lastAutoTable.finalY + 15;
      }


      const pageCount = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        drawReportFooter(doc, i, pageCount);
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

    // Lazy load XLSX library
    const XLSX = await import('xlsx');

    // Create workbook
    const workbook = XLSX.utils.book_new();

    const periodName = periodData.name || 'غير محدد';

    // Calculate profit data - matching the main page logic
    const totalPartnerProfitBeforeSaving = periodData.partners?.reduce((sum, partner) => sum + (partner.finalProfit || partner.totalProfit || 0), 0) || 0;
    const companyProfit = periodData.companyProfit || 0;
    
    // Calculate saved amount and profit after saving
    let savedAmount = 0;
    let partnerProfitAfterSaving = 0;
    
    if (enableSaving && savingPercentage > 0) {
      // When saving is being set
      savedAmount = totalPartnerProfitBeforeSaving * (savingPercentage / 100);
      partnerProfitAfterSaving = totalPartnerProfitBeforeSaving - savedAmount;
    } else if (periodData.totalSaving !== undefined && periodData.totalAfterSaving !== undefined) {
      // When data already has saving information
      savedAmount = periodData.totalSaving;
      partnerProfitAfterSaving = periodData.totalAfterSaving;
    } else {
      // No saving
      savedAmount = 0;
      partnerProfitAfterSaving = totalPartnerProfitBeforeSaving;
    }

    // Summary sheet
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

    // Add saving info if applicable
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

    // Partners sheet - reversed for RTL
    if (periodData.partners && periodData.partners.length > 0) {
      // Check if there's saving data to display
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

        // Add totals row
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
          { wch: 20 }, // المبلغ بعد الادخار
          { wch: 20 }, // المبلغ قبل الادخار
          { wch: 15 }, // الهاتف
          { wch: 20 }, // الرقم القومي
          { wch: 30 }  // اسم الشريك
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

        // Add totals row
        const totalAmount = periodData.partners.reduce((sum, p) => sum + (p.finalProfit || p.totalProfit || 0), 0);
        const totalsRow = [
          'الإجمالي',
          '',
          '',
          totalAmount
        ];
        partnersTableData.push(reverseRow(totalsRow));

        columnWidths = [
          { wch: 25 }, // المبلغ قبل الادخار
          { wch: 15 }, // الهاتف
          { wch: 20 }, // الرقم القومي
          { wch: 30 }  // اسم الشريك
        ];
      }

      const partnersSheet = XLSX.utils.aoa_to_sheet(partnersTableData);
      partnersSheet['!cols'] = columnWidths;
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

