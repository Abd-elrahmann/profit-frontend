import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

import { saveAs } from 'file-saver';
import { getPdfTableStyles, createDidDrawTable } from './pdfTableStyles';
import { registerArabicFonts, drawReportHeader, drawSeparatorLine, drawReportFooter, getCenteredTableMargins, PRIMARY_COLOR } from './pdfReportUtils';
import dayjs from 'dayjs';

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
        title: 'تقرير دفعات السلفه',
        subject: 'بيانات دفعات السلفه',
        author: 'نظام إدارة السلف',
        keywords: 'دفعات, سلفة, تقرير, بيانات',
        creator: 'نظام إدارة السلف'
      });

      const clientName = loanData?.client?.name || 'غير محدد';
      const headerEndY = drawReportHeader(doc, {
        reportTitle: 'تقرير دفعات السلفه',
        metadata: { date: dayjs().format('YYYY/MM/DD'), time: dayjs().format('hh:mm A') }
      });
      let yPosition = drawSeparatorLine(doc, headerEndY + 4);

      const pageWidth = doc.internal.pageSize.width;
      const pageHeight = doc.internal.pageSize.height;

      // Loan summary section
      doc.setFontSize(12);
      doc.setFont('Amiri', 'bold');
      doc.setTextColor(0, 0, 0);
      doc.text(`ملخص السلفة - العميل: ${clientName}`, pageWidth / 2, yPosition, { align: 'center' });
      yPosition += 8;

      // حساب إجمالي الخصومات من الدفعات
      const totalDiscounts = repaymentsData.reduce((sum, repayment) => sum + (repayment.discount || 0), 0);
      
      const summaryHeaders = [['القيمة', 'البيان']];
      const summaryData = [
        [loanData?.amount ? loanData.amount.toLocaleString('en-US') : '0', 'مبلغ السلفة'],
        [loanData?.interestAmount ? loanData.interestAmount.toLocaleString('en-US') : '0', 'إجمالي الفائدة'],
        [loanData?.totalAmount ? loanData.totalAmount.toLocaleString('en-US') : '0', 'المبلغ الإجمالي'],
        [loanData?.pagination?.totalPaidAmount ? loanData.pagination.totalPaidAmount.toLocaleString('en-US') : '0', 'المبلغ المدفوع'],
        [loanData?.pagination?.totalRemainingAmount ? loanData.pagination.totalRemainingAmount.toLocaleString('en-US') : '0', 'المبلغ المتبقي'],
        [totalDiscounts.toLocaleString('en-US'), 'إجمالي الخصومات'],
      ];

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

      // Repayments table section
      doc.setFontSize(12);
      doc.setFont('Amiri', 'bold');
      doc.setTextColor(0, 0, 0);
      doc.text('جدول الدفعات', pageWidth / 2, yPosition, { align: 'center' });
      yPosition += 8;

      // Define headers in logical order (will be reversed for RTL display)
      const repaymentsHeaders = [['رقم الدفعة', 'تاريخ الاستحقاق', 'المبلغ الأساسي', 'الفائدة', 'إجمالي الدفعة', 'الحالة', 'المبلغ المدفوع', 'حالة الدفع']];
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

      const repaymentsColumnWidths = [25, 25, 20, 25, 25, 25, 30, 20];
      const repaymentsTableWidth = repaymentsColumnWidths.reduce((a, b) => a + b, 0);
      const repaymentsTableMargins = getCenteredTableMargins(doc, repaymentsTableWidth);
      autoTable(doc, {
        startY: yPosition,
        head: [reverseRow(repaymentsHeaders[0])],
        body: repaymentsTableData.map(row => reverseRow(row)),
        ...getPdfTableStyles({
          styles: { halign: 'right', fontStyle: 'bold', fontSize: 9, cellPadding: 4 },
          headStyles: { halign: 'right', fillColor: PRIMARY_COLOR, textColor: [255, 255, 255], fontSize: 9, cellPadding: 4 },
          bodyStyles: { halign: 'right', fontStyle: 'bold', cellPadding: 4 }
        }),
        columnStyles: {
          0: { cellWidth: 'auto', minCellWidth: 25, halign: 'right' }, // حالة الدفع (الأول من اليمين)
          1: { cellWidth: 'auto', minCellWidth: 25, halign: 'right' }, // المبلغ المدفوع
          2: { cellWidth: 'auto', minCellWidth: 20, halign: 'right' }, // الحالة
          3: { cellWidth: 'auto', minCellWidth: 25, halign: 'right' }, // إجمالي الدفعة
          4: { cellWidth: 'auto', minCellWidth: 20, halign: 'right' }, // الفائدة
          5: { cellWidth: 'auto', minCellWidth: 25, halign: 'right' }, // المبلغ الأساسي
          6: { cellWidth: 'auto', minCellWidth: 30, halign: 'right', valign: 'middle', cellPadding: { top: 6, bottom: 6, left: 4, right: 4 } }, // تاريخ الاستحقاق (مع التاريخ الهجري)
          7: { cellWidth: 'auto', minCellWidth: 20, halign: 'right' }  // رقم الدفعة (الأخير من اليمين)
        },
        margin: { top: yPosition, left: repaymentsTableMargins.left, right: repaymentsTableMargins.right, bottom: 25 },
        tableWidth: repaymentsTableWidth,
        horizontalPageBreak: false,
        pageBreak: 'auto',
        showHead: 'everyPage',
        didDrawTable: createDidDrawTable(doc)
      });

      const pageCount = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        drawReportFooter(doc, i, pageCount);
      }

      // Save PDF
      const fileName = `تقرير_دفعات_السلفه_${clientName}_${dayjs().format('YYYY-MM-DD')}.pdf`;
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

    // حساب إجمالي الخصومات من الدفعات
    const totalDiscounts = repaymentsData.reduce((sum, repayment) => sum + (repayment.discount || 0), 0);
    
    // Summary sheet
    const summaryData = [
      ['ملخص السلفة'],
      [''],
      [loanData?.amount || 0, 'مبلغ السلفة'],
      [loanData?.interestAmount || 0, 'إجمالي الفائدة'],
      [loanData?.totalAmount || 0, 'المبلغ الإجمالي'],
      [loanData?.pagination?.totalPaidAmount || 0, 'المبلغ المدفوع'],
      [loanData?.pagination?.totalRemainingAmount || 0, 'المبلغ المتبقي'],
      [totalDiscounts, 'إجمالي الخصومات'],
      [''],
      ['تفاصيل السلفة'],
      [''],
      [clientName, 'العميل'],
      [loanData?.type || '', 'نوع السلفة'],
      [loanData?.startDate ? dayjs(loanData.startDate).format('DD/MM/YYYY') : '', 'تاريخ البداية'],
      [loanData?.status || '', 'حالة السلفة'],
    ];

    const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
    summarySheet['!cols'] = [
      { wch: 25 },
      { wch: 30 }
    ];
    XLSX.utils.book_append_sheet(workbook, summarySheet, 'ملخص السلفة');

    // Repayments sheet - reversed for RTL
    const repaymentsHeaders = ['رقم الدفعة', 'تاريخ الاستحقاق', 'المبلغ الأساسي', 'الفائدة', 'إجمالي الدفعة', 'الحالة', 'المبلغ المدفوع', 'حالة الدفع'];
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
      { wch: 20 }, // إجمالي الدفعة
      { wch: 15 }, // الفائدة
      { wch: 20 }, // المبلغ الأساسي
      { wch: 20 }, // تاريخ الاستحقاق
      { wch: 15 }  // رقم الدفعة
    ];
    XLSX.utils.book_append_sheet(workbook, repaymentsSheet, 'جدول الدفعات');

    // Generate Excel file
    const excelBuffer = XLSX.write(workbook, {
      bookType: 'xlsx',
      type: 'array',
      bookSST: false
    });

    const blob = new Blob([excelBuffer], {
      type: 'application/vnd.openxmlformats-officdocument.spreadsheetml.sheet'
    });

    const fileName = `تقرير_دفعات_السلفه_${clientName}_${dayjs().format('YYYY-MM-DD')}.xlsx`;
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

