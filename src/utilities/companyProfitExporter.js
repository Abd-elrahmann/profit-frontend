import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

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
      const totalWithdrawals = profitData.data?.length || 0;
      const withdrawals = profitData.data || [];
      const periodsProfit = profitData.periodsProfit || null;

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

      // Company Profit Sources Table
      if (periodsProfit && periodsProfit.periods && periodsProfit.periods.length > 0) {
        doc.setFontSize(13);
        doc.setFont('Amiri', 'bold');
        doc.text('مصادر أرباح الشركة', doc.internal.pageSize.width / 2, yPosition, { align: 'center' });
        yPosition += 10;

        // Prepare periods table data
        const periodsTableData = [];
        periodsProfit.periods.forEach(period => {
          periodsTableData.push([
            period.companyProfit.toLocaleString('en-US'),
            `${period.companyPercentage || 0}%`,
            period.netProfit.toLocaleString('en-US'),
            period.totalRevenue.toLocaleString('en-US'),
            period.periodName || `الفترة ${periodsTableData.length + 1}`
          ]);
        });

        // Add total row
        periodsTableData.push([
          periodsProfit.totalCompanyProfit.toLocaleString('en-US'),
          '-',
          '-',
          '-',
          'الإجمالي'
        ]);

        // Periods table headers (RTL order)
        const periodsHeaders = [
          ['أرباح الشركة', 'نسبة الشركة', 'صافي الربح', 'إجمالي الأرباح', 'الفترة']
        ];

        // Column widths for periods table
        const periodsColumnWidths = {
          0: 35, // أرباح الشركة
          1: 25, // نسبة الشركة
          2: 30, // صافي الربح
          3: 35, // إجمالي الأرباح
          4: 45  // الفترة
        };

        // Calculate periods table width
        const periodsTotalColumnWidth = Object.values(periodsColumnWidths).reduce((sum, width) => sum + width, 0);
        const periodsTableStartX = (doc.internal.pageSize.width - periodsTotalColumnWidth) / 2;

        autoTable(doc, {
          startY: yPosition,
          startX: periodsTableStartX,
          head: periodsHeaders,
          body: periodsTableData,
          theme: 'striped',
          styles: {
            font: 'Amiri',
            fontSize: 11,
            cellPadding: 5,
            halign: 'center',
            valign: 'middle',
            direction: 'rtl',
            fontStyle: 'bold'
          },
          headStyles: {
            fillColor: [240, 240, 240],
            textColor: [46, 139, 69],
            fontStyle: 'bold',
            halign: 'center',
            direction: 'rtl'
          },
          bodyStyles: {
            halign: 'center',
            direction: 'rtl',
            fontStyle: 'bold'
          },
          alternateRowStyles: {
            fillColor: [250, 250, 250]
          },
          columnStyles: {
            0: { cellWidth: periodsColumnWidths[0], halign: 'center', fontStyle: 'bold' }, // أرباح الشركة
            1: { cellWidth: periodsColumnWidths[1], halign: 'center', fontStyle: 'bold' }, // نسبة الشركة
            2: { cellWidth: periodsColumnWidths[2], halign: 'center', fontStyle: 'bold' }, // صافي الربح
            3: { cellWidth: periodsColumnWidths[3], halign: 'center', fontStyle: 'bold' }, // إجمالي الأرباح
            4: { cellWidth: periodsColumnWidths[4], halign: 'center', fontStyle: 'bold' } // الفترة
          },
          margin: { left: 14, right: 14 },
          tableWidth: periodsTotalColumnWidth,
          horizontalPageBreak: false,
          pageBreak: 'auto',
          rowPageBreak: 'avoid',
          showHead: 'everyPage'
        });

        yPosition = doc.lastAutoTable.finalY + 15;
      }

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
            `${dayjs(withdrawal.date).format('DD/MM/YYYY')}\n${withdrawal.hijriDate || ''}`
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
          0: 35, // المبلغ المسحوب
          1: 80, // الوصف
          2: 55  // التاريخ
        };

        // Calculate table width to center it properly
        const totalColumnWidth = Object.values(columnWidths).reduce((sum, width) => sum + width, 0);
        const tableStartX = (pageWidth - totalColumnWidth) / 2;

        autoTable(doc, {
          startY: yPosition,
          startX: tableStartX, // Center the table
          head: headers,
          body: tableData,
          theme: 'striped',
          styles: {
            font: 'Amiri',
            fontSize: 11,
            cellPadding: 5,
            halign: 'center',
            valign: 'middle',
            direction: 'rtl',
            fontStyle: 'bold'
          },
          headStyles: {
            fillColor: [240, 240, 240],
            textColor: [46, 139, 69],
            fontStyle: 'bold',
            halign: 'center',
            direction: 'rtl'
          },
          bodyStyles: {
            halign: 'center',
            direction: 'rtl',
            fontStyle: 'bold'
          },
          alternateRowStyles: {
            fillColor: [250, 250, 250]
          },
          columnStyles: {
            0: { cellWidth: columnWidths[0], halign: 'center', fontStyle: 'bold' }, // المبلغ المسحوب
            1: { cellWidth: columnWidths[1], halign: 'center', fontStyle: 'bold' }, // الوصف
            2: { cellWidth: columnWidths[2], halign: 'center', fontStyle: 'bold' }  // التاريخ
          },
          margin: { left: 14, right: 14 },
          tableWidth: totalColumnWidth,
          horizontalPageBreak: false,
          pageBreak: 'auto',
          rowPageBreak: 'avoid',
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

    // Lazy load XLSX library
    const XLSX = await import('xlsx');

    // Create workbook
    const workbook = XLSX.utils.book_new();

    // Summary data
    const availableAmount = profitData.availableAmount || 0;
    const totalWithdrawals = profitData.data?.length || 0;
    const withdrawals = profitData.data || [];
    const periodsProfit = profitData.periodsProfit || null;
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
        'التاريخ الميلادي': dayjs(withdrawal.date).format('DD/MM/YYYY'),
        'التاريخ الهجري': withdrawal.hijriDate || '',
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
        { wch: 15 }, // التاريخ الميلادي
        { wch: 15 }, // التاريخ الهجري
        { wch: 60 }, // الوصف
        { wch: 25 }  // المبلغ المسحوب
      ];
      withdrawalsSheet['!cols'] = wscols;
    }

    // Create periods profit sheet (if there are periods)
    let periodsSheet;
    if (periodsProfit && periodsProfit.periods && periodsProfit.periods.length > 0) {
      const periodsData = [];
      periodsProfit.periods.forEach(period => {
        periodsData.push({
          'الفترة': period.periodName || `الفترة ${periodsData.length + 1}`,
          'إجمالي الأرباح': period.totalRevenue || 0,
          'صافي الربح': period.netProfit || 0,
          'نسبة الشركة': `${period.companyPercentage || 0}%`,
          'أرباح الشركة': period.companyProfit || 0
        });
      });

      // Add total row
      periodsData.push({
        'الفترة': 'الإجمالي',
        'إجمالي الأرباح': '-',
        'صافي الربح': '-',
        'نسبة الشركة': '-',
        'أرباح الشركة': periodsProfit.totalCompanyProfit || 0
      });

      periodsSheet = XLSX.utils.json_to_sheet(periodsData);

      // Auto-size columns for periods sheet
      const periodsCols = [
        { wch: 25 }, // الفترة
        { wch: 20 }, // إجمالي الأرباح
        { wch: 20 }, // صافي الربح
        { wch: 15 }, // نسبة الشركة
        { wch: 20 }  // أرباح الشركة
      ];
      periodsSheet['!cols'] = periodsCols;
    }

    // Add sheets to workbook
    XLSX.utils.book_append_sheet(workbook, summarySheet, 'ملخص الأرباح');

    if (periodsSheet) {
      XLSX.utils.book_append_sheet(workbook, periodsSheet, 'مصادر أرباح الشركة');
    }

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

