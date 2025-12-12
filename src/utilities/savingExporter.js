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
      doc.text('كشف المدخرات العام', doc.internal.pageSize.width / 2, 25, { align: 'center' });

      // Summary section
      doc.setFontSize(13);
      doc.setFont('Amiri', 'bold');
      doc.text('ملخص المدخرات', doc.internal.pageSize.width / 2, 40, { align: 'center' });

      // Calculate totals
      const partners = savingData.data || [];
      const totalPartners = partners.length;
      const partnersWithSavings = partners.filter(partner => partner.periods && partner.periods.length > 0);
      const totalPeriods = partners.reduce((sum, partner) => sum + (partner.periods?.length || 0), 0);
      const totalSavingsAmount = partners.reduce((sum, partner) => {
        const lastPeriod = partner.periods?.[0];
        return sum + (lastPeriod?.total || 0);
      }, 0);

      // Summary data
      doc.setFontSize(11);
      doc.setFont('Amiri', 'bold');
      const summaryY = 50;
      const summaryText1 = `إجمالي الشركاء: ${totalPartners}  |  شركاء لديهم مدخرات: ${partnersWithSavings.length}`;
      doc.text(summaryText1, doc.internal.pageSize.width / 2, summaryY, { align: 'center' });

      const summaryText2 = `إجمالي فترات الادخار: ${totalPeriods}  |  إجمالي مبلغ المدخرات: ${totalSavingsAmount.toLocaleString('en-US')}`;
      doc.text(summaryText2, doc.internal.pageSize.width / 2, summaryY + 8, { align: 'center' });

      let yPosition = summaryY + 20;

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
          const hasSavings = partner.periods && partner.periods.length > 0;

          tableData.push([
            hasSavings ? 'لديه مدخرات' : 'لا يوجد مدخرات',
            lastPeriod ? lastPeriod.total.toLocaleString('en-US') : '0',
            lastPeriod ? lastPeriod.period.name : '-',
            partner.periods?.length || 0,
            partner.partnerName
          ]);
        });

        // Table headers (RTL order)
        const headers = [
          ['حالة الادخار', 'مبلغ المدخرات', 'آخر فترة', 'عدد فترات الادخار', 'اسم الشريك']
        ];

        // Create table with RTL support - centered and larger, no extra borders
        const pageWidth = doc.internal.pageSize.width;

        // Optimize column widths to fit on one page
        const columnWidths = {
          0: 35, // حالة الادخار
          1: 35, // مبلغ المدخرات
          2: 40, // آخر فترة
          3: 30, // عدد فترات الادخار
          4: 40  // اسم الشريك
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
            fontSize: 8,
            cellPadding: 3,
            lineColor: [200, 200, 200], // Lighter borders
            lineWidth: 0.1,
            halign: 'center',
            valign: 'middle'
          },
          headStyles: {
            fillColor: [46, 139, 69],
            textColor: 255,
            fontStyle: 'bold',
            fontSize: 9,
            halign: 'center',
            valign: 'middle',
            cellPadding: 4,
            lineColor: [13, 64, 165],
            lineWidth: 0.1
          },
          bodyStyles: {
            halign: 'center',
            valign: 'middle',
            cellPadding: 2,
            lineColor: [220, 220, 220],
            lineWidth: 0.1
          },
          alternateRowStyles: {
            fillColor: [250, 250, 250]
          },
          columnStyles: {
            0: { cellWidth: columnWidths[0], fontSize: 8, halign: 'right' }, // حالة الادخار
            1: { cellWidth: columnWidths[1], fontSize: 8 }, // مبلغ المدخرات
            2: { cellWidth: columnWidths[2], fontSize: 8, halign: 'right' }, // آخر فترة
            3: { cellWidth: columnWidths[3], fontSize: 8 }, // عدد فترات الادخار
            4: { cellWidth: columnWidths[4], fontSize: 9, halign: 'right' } // اسم الشريك
          },
          margin: { top: yPosition, bottom: 20 },
          tableWidth: totalColumnWidth,
          horizontalPageBreak: false, // Disable horizontal page break to keep headers together
          pageBreak: 'auto',
          showHead: 'everyPage',
          didParseCell: function (data) {
            // Prevent cell content from being too wide
            if (data.cell.text && data.cell.text.length > 0) {
              const maxLength = data.column.index === 0 ? 20 :
                               data.column.index === 2 ? 25 :
                               data.column.index === 4 ? 15 : 25;
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

    // Create workbook
    const workbook = XLSX.utils.book_new();

    // Calculate totals
    const partners = savingData.data || [];
    const totalPartners = partners.length;
    const partnersWithSavings = partners.filter(partner => partner.periods && partner.periods.length > 0);
    const totalPeriods = partners.reduce((sum, partner) => sum + (partner.periods?.length || 0), 0);
    const totalSavingsAmount = partners.reduce((sum, partner) => {
      const lastPeriod = partner.periods?.[0];
      return sum + (lastPeriod?.total || 0);
    }, 0);

    const summaryData = [
      ['كشف المدخرات العام'],
      [''],
      ['ملخص المدخرات'],
      ['إجمالي الشركاء', totalPartners],
      ['شركاء لديهم مدخرات', partnersWithSavings.length],
      ['إجمالي فترات الادخار', totalPeriods],
      ['إجمالي مبلغ المدخرات', totalSavingsAmount],
      [''],
      ['تفاصيل المدخرات']
    ];

    // Partners data
    const partnersData = [];
    partners.forEach(partner => {
      const lastPeriod = partner.periods?.[0];
      const hasSavings = partner.periods && partner.periods.length > 0;

      partnersData.push({
        'حالة الادخار': hasSavings ? 'لديه مدخرات' : 'لا يوجد مدخرات',
        'مبلغ المدخرات': lastPeriod ? lastPeriod.total : 0,
        'آخر فترة ادخار': lastPeriod ? lastPeriod.period.name : '-',
        'عدد فترات الادخار': partner.periods?.length || 0,
        'اسم الشريك': partner.partnerName
      });
    });

    // Create summary sheet
    const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);

    // Create partners sheet
    const partnersSheet = XLSX.utils.json_to_sheet(partnersData);

    // Auto-size columns for better Excel display
    const wscols = [
      { wch: 20 }, // حالة الادخار
      { wch: 20 }, // مبلغ المدخرات
      { wch: 30 }, // آخر فترة ادخار
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
