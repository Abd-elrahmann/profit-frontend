import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

import { saveAs } from 'file-saver';
import { getPdfTableStyles, createDidDrawTable } from './pdfTableStyles';
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

export const exportRepaymentsToPDF = async (repaymentsData, loanData) => {
  return new Promise((resolve, reject) => {
    try {
      // Validate data
      if (!repaymentsData || !Array.isArray(repaymentsData) || repaymentsData.length === 0) {
        throw new Error('لا توجد بيانات للتصدير');
      }

      // Create new PDF document
      const doc = new jsPDF();

      // Register Arabic fonts
      registerArabicFonts(doc);

      // Set document properties
      doc.setProperties({
        title: 'تقرير أقساط السلفة',
        subject: 'بيانات أقساط السلفة',
        author: 'نظام إدارة السلف',
        keywords: 'أقساط, سلفة, تقرير, بيانات',
        creator: 'نظام إدارة السلف'
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
      doc.text('تقرير أقساط السلفة', doc.internal.pageSize.width / 2, 30, { align: 'center' });

      doc.setFontSize(11);
      doc.setFont('Amiri', 'bold');
      const clientName = loanData?.client?.name || 'غير محدد';
      const summaryText = `العميل: ${clientName} | تاريخ التصدير: ${dayjs().format('DD/MM/YYYY HH:mm')}`;
      doc.text(summaryText, doc.internal.pageSize.width / 2, 45, { align: 'center' });

      const pageWidth = doc.internal.pageSize.width;
      const pageHeight = doc.internal.pageSize.height;
      const tableMargin = 10;

      let yPosition = 55;

      // Loan summary section
      doc.setFontSize(12);
      doc.setFont('Amiri', 'bold');
      doc.setTextColor(0, 0, 0);
      doc.text('ملخص السلفة', pageWidth / 2, yPosition, { align: 'center' });
      yPosition += 8;

      const summaryHeaders = [['البيان', 'القيمة']];
      const summaryData = [
        ['مبلغ السلفة', loanData?.amount ? loanData.amount.toLocaleString('en-US') : '0'],
        ['إجمالي الفائدة', loanData?.interestAmount ? loanData.interestAmount.toLocaleString('en-US') : '0'],
        ['المبلغ الإجمالي', loanData?.totalAmount ? loanData.totalAmount.toLocaleString('en-US') : '0'],
      ];

      autoTable(doc, {
        startY: yPosition,
        head: summaryHeaders,
        body: summaryData,
        ...getPdfTableStyles({
          styles: { halign: 'right', fontStyle: 'bold' },
          headStyles: { halign: 'right' },
          bodyStyles: { halign: 'right', fontStyle: 'bold', cellPadding: 4 }
        }),
        columnStyles: {
          0: { cellWidth: 'auto', halign: 'right' },
          1: { cellWidth: 'auto', halign: 'right' }
        },
        margin: { top: yPosition, left: tableMargin, right: tableMargin },
        tableWidth: 'auto',
        horizontalPageBreak: false,
        didDrawTable: createDidDrawTable(doc)
      });

      yPosition = doc.lastAutoTable.finalY + 15;

      // Check if we need a new page
      if (yPosition > pageHeight - 100) {
        doc.addPage();
        yPosition = 55;
      }

      // Repayments table section
      doc.setFontSize(12);
      doc.setFont('Amiri', 'bold');
      doc.setTextColor(0, 0, 0);
      doc.text('جدول الأقساط', pageWidth / 2, yPosition, { align: 'center' });
      yPosition += 8;

      // Define headers in logical order (will be reversed for RTL display)
      const repaymentsHeaders = [['رقم القسط', 'تاريخ الاستحقاق', 'المبلغ الأساسي', 'الفائدة', 'إجمالي القسط', 'الحالة', 'المبلغ المدفوع', 'حالة الدفع']];
      const repaymentsTableData = repaymentsData.map(repayment => {
        // Format date with Hijri date below
        let dateText = repayment.dueDate ? dayjs(repayment.dueDate).format('DD/MM/YYYY') : '-';
        if (repayment.dueDateHijri) {
          dateText += '\n' + repayment.dueDateHijri;
        }
        
        return [
          repayment.count || repayment.installmentNumber || '-',
          dateText,
          repayment.principalAmount ? repayment.principalAmount.toLocaleString('en-US') : '0',
          repayment.interestAmount ? repayment.interestAmount.toLocaleString('en-US') : '0',
          repayment.amount ? repayment.amount.toLocaleString('en-US') : '0',
          getStatusText(repayment.status),
          repayment.paidAmount ? repayment.paidAmount.toLocaleString('en-US') : '0',
          getPaymentStatusText(repayment.status)
        ];
      });

      autoTable(doc, {
        startY: yPosition,
        head: [reverseRow(repaymentsHeaders[0])],
        body: repaymentsTableData.map(row => reverseRow(row)),
        ...getPdfTableStyles({
          styles: { halign: 'right', fontStyle: 'bold' },
          headStyles: { halign: 'right', cellPadding: 4 },
          bodyStyles: { halign: 'right', fontStyle: 'bold', cellPadding: 4 }
        }),
        columnStyles: {
          0: { cellWidth: 'auto', minCellWidth: 25, halign: 'right' }, // حالة الدفع (الأول من اليمين)
          1: { cellWidth: 'auto', minCellWidth: 25, halign: 'right' }, // المبلغ المدفوع
          2: { cellWidth: 'auto', minCellWidth: 20, halign: 'right' }, // الحالة
          3: { cellWidth: 'auto', minCellWidth: 25, halign: 'right' }, // إجمالي القسط
          4: { cellWidth: 'auto', minCellWidth: 20, halign: 'right' }, // الفائدة
          5: { cellWidth: 'auto', minCellWidth: 25, halign: 'right' }, // المبلغ الأساسي
          6: { cellWidth: 'auto', minCellWidth: 30, halign: 'right', valign: 'middle', cellPadding: { top: 6, bottom: 6, left: 4, right: 4 } }, // تاريخ الاستحقاق (مع التاريخ الهجري)
          7: { cellWidth: 'auto', minCellWidth: 20, halign: 'right' }  // رقم القسط (الأخير من اليمين)
        },
        margin: { top: 20, left: 15, right: 15 },
        tableWidth: 'auto',
        horizontalPageBreak: false,
        pageBreak: 'auto',
        showHead: 'everyPage',
        didDrawTable: createDidDrawTable(doc)
      });

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
      const fileName = `تقرير_أقساط_السلفة_${clientName}_${dayjs().format('YYYY-MM-DD')}.pdf`;
      doc.save(fileName);
      resolve();
    } catch (error) {
      console.error('PDF export error:', error.message);
      reject(error);
    }
  });
};

export const exportRepaymentsToExcel = async (repaymentsData, loanData) => {
  try {
    // Validate data
    if (!repaymentsData || !Array.isArray(repaymentsData) || repaymentsData.length === 0) {
      throw new Error('لا توجد بيانات للتصدير');
    }

    // Lazy load XLSX library
    const XLSX = await import('xlsx');

    // Create workbook
    const workbook = XLSX.utils.book_new();

    const clientName = loanData?.client?.name || 'غير محدد';

    // Summary sheet
    const summaryData = [
      ['ملخص السلفة'],
      [''],
      ['مبلغ السلفة', loanData?.amount || 0],
      ['إجمالي الفائدة', loanData?.interestAmount || 0],
      ['المبلغ الإجمالي', loanData?.totalAmount || 0],
      [''],
      ['تفاصيل السلفة'],
      [''],
      ['العميل', clientName],
      ['نوع السلفة', loanData?.type || ''],
      ['تاريخ البداية', loanData?.startDate ? dayjs(loanData.startDate).format('DD/MM/YYYY') : ''],
      ['حالة السلفة', loanData?.status || ''],
    ];

    const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
    summarySheet['!cols'] = [
      { wch: 25 },
      { wch: 30 }
    ];
    XLSX.utils.book_append_sheet(workbook, summarySheet, 'ملخص السلفة');

    // Repayments sheet - reversed for RTL
    const repaymentsHeaders = ['رقم القسط', 'تاريخ الاستحقاق', 'المبلغ الأساسي', 'الفائدة', 'إجمالي القسط', 'الحالة', 'المبلغ المدفوع', 'حالة الدفع'];
    const repaymentsTableData = [
      reverseRow(repaymentsHeaders),
      ...repaymentsData.map(repayment => reverseRow([
        repayment.count || repayment.installmentNumber || '-',
        repayment.dueDate ? dayjs(repayment.dueDate).format('DD/MM/YYYY') : '-',
        repayment.principalAmount || 0,
        repayment.interestAmount || 0,
        repayment.amount || 0,
        getStatusText(repayment.status),
        repayment.paidAmount || 0,
        getPaymentStatusText(repayment.status)
      ]))
    ];

    const repaymentsSheet = XLSX.utils.aoa_to_sheet(repaymentsTableData);
    repaymentsSheet['!cols'] = [
      { wch: 20 }, // حالة الدفع
      { wch: 20 }, // المبلغ المدفوع
      { wch: 15 }, // الحالة
      { wch: 20 }, // إجمالي القسط
      { wch: 15 }, // الفائدة
      { wch: 20 }, // المبلغ الأساسي
      { wch: 20 }, // تاريخ الاستحقاق
      { wch: 15 }  // رقم القسط
    ];
    XLSX.utils.book_append_sheet(workbook, repaymentsSheet, 'جدول الأقساط');

    // Generate Excel file
    const excelBuffer = XLSX.write(workbook, {
      bookType: 'xlsx',
      type: 'array',
      bookSST: false
    });

    const blob = new Blob([excelBuffer], {
      type: 'application/vnd.openxmlformats-officdocument.spreadsheetml.sheet'
    });

    const fileName = `تقرير_أقساط_السلفة_${clientName}_${dayjs().format('YYYY-MM-DD')}.xlsx`;
    saveAs(blob, fileName);

  } catch (error) {
    console.error('Excel export error:', error.message);
    throw error;
  }
};

const getStatusText = (status) => {
  switch (status) {
    case "PENDING":
      return "معلق";
    case "PAID":
      return "مدفوع";
    case "PARTIAL":
      return "مدفوع جزئياً";
    case "OVERDUE":
      return "متأخر";
    default:
      return status;
  }
};

const getPaymentStatusText = (status) => {
  switch (status) {
    case "PENDING":
      return "لم يتم الدفع";
    case "PAID":
      return "تم الدفع";
    case "EARLY_PAID":
      return "تم الدفع مبكراً";
    case "PARTIAL_PAID":
      return "دفع جزئي";
    case "COMPLETED":
      return "مكتملة";
    case "OVERDUE":
      return "متأخرة";
    case "CANCELLED":
      return "ملغية";
    default:
      return status;
  }
};

