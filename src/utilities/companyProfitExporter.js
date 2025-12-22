import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import dayjs from 'dayjs';
import logo from '/assets/images/logo.webp';

// Register Arabic fonts
const registerArabicFonts = (doc) => {
  try {
    doc.addFont('/assets/fonts/Amiri-Regular.ttf', 'Amiri', 'normal');
    doc.addFont('/assets/fonts/Amiri-Bold.ttf', 'Amiri', 'bold');
  } catch (error) {
    console.warn('Arabic fonts not found, using default fonts', error);
  }
};

export const exportCompanyProfitToPDF = async (profitData) => {
  return new Promise((resolve, reject) => {
    try {
      // Validate data
      if (!profitData) {
        throw new Error('لا توجد بيانات للتصدير');
      }

      // Create new PDF document
      const doc = new jsPDF();

      // Register Arabic fonts
      registerArabicFonts(doc);

      // Set document properties
      doc.setProperties({
        title: 'تقرير أرباح الشركة',
        subject: 'تقرير أرباح الشركة وسجل السحوبات',
        author: 'نظام إدارة السلف',
        keywords: 'أرباح, شركة, سحوبات, محاسبة',
        creator: 'نظام إدارة السلف'
      });

      // Set Arabic as primary font
      doc.setFont('Amiri', 'bold');

      // Logo positioned on the right - small and at the very top
      const logoWidth = 10;
      const logoHeight = 10;
      const logoX = doc.internal.pageSize.width - logoWidth - 5;
      const logoY = 5;
      doc.addImage(logo, 'PNG', logoX, logoY, logoWidth, logoHeight);

      // Title section - start after logo
      doc.setFontSize(18);
      doc.setFont('Amiri', 'bold');
      doc.text('تقرير أرباح الشركة', doc.internal.pageSize.width / 2, 25, { align: 'center' });

      // Summary section
      doc.setFontSize(13);
      doc.setFont('Amiri', 'bold');
      doc.text('ملخص أرباح الشركة', doc.internal.pageSize.width / 2, 40, { align: 'center' });

      // Profit summary data
      const availableAmount = profitData.availableAmount || 0;
      const totalWithdrawals = profitData.totalWithdrawals || 0;
      const withdrawals = profitData.withdrawals || [];

      // Summary cards data
      doc.setFontSize(11);
      doc.setFont('Amiri', 'bold');
      const summaryY = 50;
      const summaryText = `الرصيد المتاح للسحب: ${availableAmount.toLocaleString('en-US')}  |  إجمالي عمليات السحب: ${totalWithdrawals}`;
      doc.text(summaryText, doc.internal.pageSize.width / 2, summaryY, { align: 'center' });

      // Total withdrawn amount
      const totalWithdrawnAmount = withdrawals.reduce((sum, withdrawal) => sum + (withdrawal.amount || 0), 0);
      doc.setFontSize(11);
      const totalWithdrawnText = `إجمالي المبالغ المسحوبة: ${totalWithdrawnAmount.toLocaleString('en-US')}`;
      doc.text(totalWithdrawnText, doc.internal.pageSize.width / 2, summaryY + 8, { align: 'center' });

      let yPosition = summaryY + 20;

      // Check if there are withdrawals to display
      if (withdrawals.length === 0) {
        doc.setFontSize(14);
        doc.setFont('Amiri', 'bold');
        doc.text('لا توجد عمليات سحب حتى الآن', doc.internal.pageSize.width / 2, yPosition, { align: 'center' });
      } else {
        // Prepare table data (RTL order)
        const tableData = [];
        withdrawals.forEach(withdrawal => {
          tableData.push([
            withdrawal.amount.toLocaleString('en-US'),
            withdrawal.description || '-',
            dayjs(withdrawal.date).format('DD/MM/YYYY')
          ]);
        });

        // Table headers (RTL order)
        const headers = [
          ['المبلغ المسحوب', 'الوصف', 'التاريخ']
        ];

        // Create table with RTL support - centered and larger, no extra borders
        const pageWidth = doc.internal.pageSize.width;

        // Optimize column widths to fit on one page - expanded for better readability
        const columnWidths = {
          0: 40, // المبلغ المسحوب
          1: 90, // الوصف
          2: 40  // التاريخ
        };

        // Calculate table width to center it properly
        const totalColumnWidth = Object.values(columnWidths).reduce((sum, width) => sum + width, 0);
        const tableStartX = (pageWidth - totalColumnWidth) / 2;

        autoTable(doc, {
          startY: yPosition,
          startX: tableStartX, // Center the table
          head: headers,
          body: tableData,
          theme: 'striped', // Simpler theme without heavy borders
          styles: {
            font: 'Amiri',
            fontStyle: 'bold',
            fontSize: 9,
            cellPadding: 4,
            lineColor: [200, 200, 200], // Lighter borders
            lineWidth: 0.1,
            halign: 'center',
            valign: 'middle'
          },
          headStyles: {
fillColor: [240, 240, 240],
          textColor: [46, 139, 69],
            fontStyle: 'bold',
            fontSize: 10,
            halign: 'center',
            valign: 'middle',
            cellPadding: 5,
            lineColor: [13, 64, 165],
            lineWidth: 0.1
          },
          bodyStyles: {
            fontStyle: 'bold',
            halign: 'center',
            valign: 'middle',
            cellPadding: 3,
            lineColor: [220, 220, 220],
            lineWidth: 0.1
          },
          alternateRowStyles: {
            fillColor: [250, 250, 250]
          },
          columnStyles: {
            0: { cellWidth: columnWidths[0], fontSize: 10 }, // المبلغ المسحوب
            1: { cellWidth: columnWidths[1], fontSize: 9, halign: 'right' }, // الوصف
            2: { cellWidth: columnWidths[2], fontSize: 9 }  // التاريخ
          },
          margin: { top: yPosition, bottom: 20 },
          tableWidth: totalColumnWidth,
          horizontalPageBreak: false, // Disable horizontal page break to keep headers together
          pageBreak: 'auto',
          showHead: 'everyPage',
          didParseCell: function (data) {
            // Prevent cell content from being too wide
            if (data.cell.text && data.cell.text.length > 0) {
              const maxLength = data.column.index === 1 ? 60 : 25; // Longer for description (index 1)
              if (data.cell.text[0].length > maxLength) {
                data.cell.text[0] = data.cell.text[0].substring(0, maxLength) + '...';
              }
            }
          }
        });
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
    // Validate data
    if (!profitData) {
      throw new Error('لا توجد بيانات للتصدير');
    }

    // Create workbook
    const workbook = XLSX.utils.book_new();

    // Summary data
    const availableAmount = profitData.availableAmount || 0;
    const totalWithdrawals = profitData.totalWithdrawals || 0;
    const withdrawals = profitData.withdrawals || [];
    const totalWithdrawnAmount = withdrawals.reduce((sum, withdrawal) => sum + (withdrawal.amount || 0), 0);

    const summaryData = [
      ['تقرير أرباح الشركة'],
      [''],
      ['ملخص الأرباح'],
      ['الرصيد المتاح للسحب', availableAmount],
      ['إجمالي عمليات السحب', totalWithdrawals],
      ['إجمالي المبالغ المسحوبة', totalWithdrawnAmount],
      [''],
      ['تفاصيل السحوبات']
    ];

    // Withdrawals data
    const withdrawalsData = [];
    withdrawals.forEach(withdrawal => {
      withdrawalsData.push({
        'التاريخ': dayjs(withdrawal.date).format('DD/MM/YYYY'),
        'الوصف': withdrawal.description || '-',
        'المبلغ المسحوب': withdrawal.amount || 0
      });
    });

    // Create summary sheet
    const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);

    // Create withdrawals sheet (if there are withdrawals)
    let withdrawalsSheet;
    if (withdrawalsData.length > 0) {
      withdrawalsSheet = XLSX.utils.json_to_sheet(withdrawalsData);

      // Auto-size columns for better Excel display
      const wscols = [
        { wch: 15 }, // التاريخ
        { wch: 60 }, // الوصف
        { wch: 25 }  // المبلغ المسحوب
      ];
      withdrawalsSheet['!cols'] = wscols;
    }

    // Add sheets to workbook
    XLSX.utils.book_append_sheet(workbook, summarySheet, 'ملخص الأرباح');

    if (withdrawalsSheet) {
      XLSX.utils.book_append_sheet(workbook, withdrawalsSheet, 'سجل السحوبات');
    }

    // Generate Excel file
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
