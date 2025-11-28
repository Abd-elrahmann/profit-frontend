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

export const exportZakahToPDF = async (zakahData, filters = {}) => {
  return new Promise((resolve, reject) => {
    try {
      // Create new PDF document
      const doc = new jsPDF();

      // Register Arabic fonts
      registerArabicFonts(doc);

      // Set document properties
      doc.setProperties({
        title: 'تقرير الزكاة',
        subject: 'تقرير الزكاة والعمليات المالية',
        author: 'نظام إدارة السلف',
        keywords: 'زكاة, تقرير, عمليات مالية',
        creator: 'نظام إدارة السلف'
      });

      // Set Arabic as primary font
      doc.setFont('Amiri', 'normal');

      // Logo positioned on the right - small and at the very top
      const logoWidth = 10;
      const logoHeight = 10;
      const logoX = doc.internal.pageSize.width - logoWidth - 5;
      const logoY = 5;
      doc.addImage(logo, 'PNG', logoX, logoY, logoWidth, logoHeight);

      // Title section - start after logo
      doc.setFontSize(18);
      doc.setFont('Amiri', 'bold');
      doc.text('تقرير الزكاة', doc.internal.pageSize.width / 2, 25, { align: 'center' });

      // Filters info if exists
      let yPosition = 35;
      if (filters.month && filters.year) {
        doc.setFontSize(11);
        doc.setFont('Amiri', 'normal');
        doc.text(`الشهر: ${filters.month}/${filters.year}`, doc.internal.pageSize.width / 2, yPosition, { align: 'center' });
        yPosition += 8;
      } else if (filters.partner && filters.year) {
        doc.setFontSize(11);
        doc.setFont('Amiri', 'normal');
        doc.text(`الشريك: ${filters.partner} | السنة: ${filters.year}`, doc.internal.pageSize.width / 2, yPosition, { align: 'center' });
        yPosition += 8;
      }

      // Summary section
      doc.setFontSize(11);
      doc.setFont('Amiri', 'bold');

      // Check if this is account data (صندوق الزكاة) or partner data (زكاة محددة)
      if (zakahData.account) {
        // صندوق الزكاة - account data
        const summaryText = `رصيد الحساب: ${zakahData.account.balance?.toLocaleString() || 0} | المدفوع: ${zakahData.account.credit?.toLocaleString() || 0} | المتبقي: ${zakahData.account.debit?.toLocaleString() || 0} | تاريخ التصدير: ${dayjs().format('DD/MM/YYYY HH:mm')}`;
        doc.text(summaryText, doc.internal.pageSize.width / 2, yPosition, { align: 'center' });
        yPosition += 12;
      } else if (Array.isArray(zakahData)) {
        // زكاة محددة - partner data (array of years)
        const partnerData = zakahData.find(item => item.year === filters.year) || zakahData[0];
        if (partnerData) {
          const summaryText = `اسم الشريك: ${partnerData.partnerName || '-'} | رأس المال: ${partnerData.capitalAmount?.toLocaleString() || 0} | الزكاة السنوية: ${partnerData.annualZakat?.toLocaleString() || 0} | تاريخ التصدير: ${dayjs().format('DD/MM/YYYY HH:mm')}`;
          doc.text(summaryText, doc.internal.pageSize.width / 2, yPosition, { align: 'center' });
          yPosition += 12;
        }
      }

      // Prepare table data based on data type
      let allEntries = [];
      if (zakahData.journalsByMonth) {
        // صندوق الزكاة - account data with journalsByMonth
        Object.entries(zakahData.journalsByMonth).forEach(([month, data]) => {
          if (data.entries && data.entries.length > 0) {
            data.entries.forEach(entry => {
              allEntries.push({
                ...entry,
                month: month,
                requiredZakat: data.requiredZakat || 0
              });
            });
          }
        });
      } else if (Array.isArray(zakahData)) {
        // زكاة محددة - partner data
        const partnerData = zakahData.find(item => item.year === filters.year) || zakahData[0];
        if (partnerData && partnerData.monthlyBreakdown) {
          partnerData.monthlyBreakdown.forEach(month => {
            allEntries.push({
              ...month,
              month: month.month.toString().padStart(2, '0'),
              description: `زكاة شهر ${month.month}`,
              date: `${filters.year}-${month.month.toString().padStart(2, '0')}-01`,
              reference: `ZAKAH-${partnerData.partnerName || 'UNKNOWN'}-${filters.year}-${month.month.toString().padStart(2, '0')}`,
              postedBy: 'النظام',
              type: 'GENERAL',
              status: 'POSTED',
              debit: 0,
              credit: month.amount || 0,
              balance: month.amount || 0
            });
          });
        }
      }

      if (allEntries.length > 0) {
        // Sort by date descending
        allEntries.sort((a, b) => new Date(b.date) - new Date(a.date));

        // Table data and headers based on data type
        let tableData, headers;

        if (zakahData.account) {
          // صندوق الزكاة - account data: show detailed financial entries
          tableData = allEntries.map(entry => [
            entry.month, // الشهر أولاً من اليمين
            dayjs(entry.date).format('DD/MM/YYYY'),
            entry.reference || '-',
            entry.description || '-',
            entry.debit?.toLocaleString() || '0',
            entry.credit?.toLocaleString() || '0',
            entry.balance?.toLocaleString() || '0',
            entry.postedBy || '-',
            entry.type === 'GENERAL' ? 'عام' : entry.type || '-'
          ]);

          headers = [
            ['الشهر', 'التاريخ', 'المرجع', 'الوصف', 'مدين', 'دائن', 'الرصيد', 'المرسل', 'النوع']
          ];
        } else {
          // زكاة محددة - partner data: show monthly breakdown summary
          tableData = allEntries.map(entry => [
            entry.month, // الشهر أولاً من اليمين
            dayjs(entry.date).format('DD/MM/YYYY'),
            entry.description || '-',
            entry.credit?.toLocaleString() || '0'
          ]);

          headers = [
            ['الشهر', 'التاريخ', 'الوصف', 'المبلغ']
          ];
        }

        // Create table
        const pageWidth = doc.internal.pageSize.width;

        // Column widths based on data type
        let columnWidths;
        if (zakahData.account) {
          // صندوق الزكاة - more columns
          columnWidths = {
            0: 15, // الشهر
            1: 18, // التاريخ
            2: 20, // المرجع
            3: 35, // الوصف
            4: 15, // مدين
            5: 15, // دائن
            6: 18, // الرصيد
            7: 20, // المرسل
            8: 12  // النوع
          };
        } else {
          // زكاة محددة - fewer columns with wider layout
          columnWidths = {
            0: 30, // الشهر
            1: 40, // التاريخ
            2: 80, // الوصف
            3: 40  // المبلغ
          };
        }

      autoTable(doc, {
        startY: yPosition,
        head: headers,
        body: tableData,
        rtl: true,
          theme: 'striped',
          styles: {
            font: 'Amiri',
            fontStyle: 'normal',
            fontSize: 7,
            cellPadding: 2,
            lineColor: [200, 200, 200],
            lineWidth: 0.1,
            halign: 'center',
            valign: 'middle'
          },
          headStyles: {
            fillColor: [13, 64, 165],
            textColor: 255,
            fontStyle: 'bold',
            fontSize: 8,
            halign: 'center',
            valign: 'middle',
            cellPadding: 3
          },
          bodyStyles: {
            halign: 'center',
            valign: 'middle',
            cellPadding: 1
          },
          alternateRowStyles: {
            fillColor: [250, 250, 250]
          },
          columnStyles: Object.keys(columnWidths).reduce((styles, key, index) => {
            styles[index] = { cellWidth: columnWidths[key], fontSize: 7 };
            return styles;
          }, {}),
          margin: { top: yPosition, bottom: 20, left: 20, right: 20 },
          horizontalPageBreak: false,
          pageBreak: 'auto',
          showHead: 'everyPage'
        });
      } else {
        // No data message
        doc.setFontSize(14);
        doc.setFont('Amiri', 'normal');
        doc.text('لا توجد عمليات مالية في الفترة المحددة', doc.internal.pageSize.width / 2, yPosition + 20, { align: 'center' });
      }

      // Footer
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
        doc.setFont('Amiri', 'normal');
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
      const fileName = `تقرير_الزكاة_${dayjs().format('YYYY-MM-DD')}.pdf`;
      doc.save(fileName);
      resolve();
    } catch (error) {
      console.error('PDF export error:', error.message);
      reject(error);
    }
  });
};

export const exportZakahToExcel = async (zakahData, filters = {}) => {
  try {
    // Create workbook
    const workbook = XLSX.utils.book_new();

    // Summary data
    const summaryData = [
      ['تقرير الزكاة'],
      ['']
    ];

    if (filters.month && filters.year) {
      summaryData.push([`الشهر: ${filters.month}/${filters.year}`]);
      summaryData.push(['']);
    } else if (filters.partner && filters.year) {
      summaryData.push([`الشريك: ${filters.partner} | السنة: ${filters.year}`]);
      summaryData.push(['']);
    }

    // Summary based on data type
    if (zakahData.account) {
      // صندوق الزكاة - account data
      summaryData.push(['إحصائيات الحساب']);
      summaryData.push(['رصيد الحساب', zakahData.account.balance || 0]);
      summaryData.push(['المدفوع', zakahData.account.credit || 0]);
      summaryData.push(['المتبقي', zakahData.account.debit || 0]);
      summaryData.push(['تاريخ التصدير', dayjs().format('DD/MM/YYYY HH:mm')]);
      summaryData.push(['']);
    } else if (Array.isArray(zakahData)) {
      // زكاة محددة - partner data
      const partnerData = zakahData.find(item => item.year === filters.year) || zakahData[0];
      if (partnerData) {
        summaryData.push(['إحصائيات الزكاة']);
        summaryData.push(['اسم الشريك', partnerData.partnerName || '-']);
        summaryData.push(['رأس المال', partnerData.capitalAmount || 0]);
        summaryData.push(['الزكاة السنوية', partnerData.annualZakat || 0]);
        summaryData.push(['الزكاة الشهرية', partnerData.monthlyZakat || 0]);
        summaryData.push(['المدفوع', partnerData.totalPaid || 0]);
        summaryData.push(['المتبقي', partnerData.remaining || 0]);
        summaryData.push(['تاريخ التصدير', dayjs().format('DD/MM/YYYY HH:mm')]);
        summaryData.push(['']);
      }
    }

    // Prepare entries data based on data type
    let allEntries = [];
    if (zakahData.journalsByMonth) {
      // صندوق الزكاة - account data with journalsByMonth
      Object.entries(zakahData.journalsByMonth).forEach(([month, data]) => {
        if (data.entries && data.entries.length > 0) {
          data.entries.forEach(entry => {
            allEntries.push({
              ...entry,
              month: month,
              requiredZakat: data.requiredZakat || 0
            });
          });
        }
      });
    } else if (Array.isArray(zakahData)) {
      // زكاة محددة - partner data
      const partnerData = zakahData.find(item => item.year === filters.year) || zakahData[0];
      if (partnerData && partnerData.monthlyBreakdown) {
        partnerData.monthlyBreakdown.forEach(month => {
          allEntries.push({
            month: month.month.toString().padStart(2, '0'),
            date: `${filters.year}-${month.month.toString().padStart(2, '0')}-01`,
            reference: `ZAKAH-${partnerData.partnerName || 'UNKNOWN'}-${filters.year}-${month.month.toString().padStart(2, '0')}`,
            description: `زكة شهر ${month.month}`,
            postedBy: 'النظام',
            type: 'GENERAL',
            status: month.status || 'PENDING',
            debit: 0,
            credit: month.amount || 0,
            balance: month.amount || 0
          });
        });
      }
    }

    // Sort by date descending
    allEntries.sort((a, b) => new Date(b.date) - new Date(a.date));

    // Excel data based on data type
    let excelData;
    if (zakahData.account) {
      // صندوق الزكاة - detailed financial entries
      excelData = allEntries.map(entry => ({
        'الشهر': entry.month,
        'التاريخ': dayjs(entry.date).format('DD/MM/YYYY'),
        'المرجع': entry.reference || '-',
        'الوصف': entry.description || '-',
        'مدين': entry.debit || 0,
        'دائن': entry.credit || 0,
        'الرصيد': entry.balance || 0,
        'المرسل': entry.postedBy || '-',
        'النوع': entry.type === 'GENERAL' ? 'عام' : entry.type || '-'
      }));
    } else {
      // زكاة محددة - monthly breakdown
      excelData = allEntries.map(entry => ({
        'الشهر': entry.month,
        'التاريخ': dayjs(entry.date).format('DD/MM/YYYY'),
        'الوصف': entry.description || '-',
        'المبلغ': entry.credit || 0
      }));
    }

    // Create summary sheet
    const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);

    // Create data sheet
    const dataSheet = XLSX.utils.json_to_sheet(excelData);

    // Auto-size columns based on data type
    let wscols;
    if (zakahData.account) {
      // صندوق الزكاة - detailed financial entries
      wscols = [
        { wch: 12 }, // الشهر
        { wch: 15 }, // التاريخ
        { wch: 20 }, // المرجع
        { wch: 35 }, // الوصف
        { wch: 12 }, // مدين
        { wch: 12 }, // دائن
        { wch: 15 }, // الرصيد
        { wch: 18 }, // المرسل
        { wch: 12 }  // النوع
      ];
    } else {
      // زكاة محددة - monthly breakdown
      wscols = [
        { wch: 15 }, // الشهر
        { wch: 20 }, // التاريخ
        { wch: 55 }, // الوصف
        { wch: 20 }  // المبلغ
      ];
    }
    dataSheet['!cols'] = wscols;

    // Add sheets to workbook
    XLSX.utils.book_append_sheet(workbook, summarySheet, 'ملخص');
    XLSX.utils.book_append_sheet(workbook, dataSheet, 'العمليات المالية');

    // Generate Excel file
    const excelBuffer = XLSX.write(workbook, {
      bookType: 'xlsx',
      type: 'array',
      bookSST: false
    });

    const blob = new Blob([excelBuffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    });

    const fileName = `تقرير_الزكاة_${dayjs().format('YYYY-MM-DD')}.xlsx`;
    saveAs(blob, fileName);

  } catch (error) {
    console.error('Excel export error:', error.message);
    throw error;
  }
};
