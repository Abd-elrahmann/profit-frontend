import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import dayjs from 'dayjs';
import logo from '/assets/images/logo.webp';

// Register Arabic fonts when available; falls back gracefully
const registerArabicFonts = (doc) => {
  try {
    doc.addFont('/assets/fonts/Amiri-Regular.ttf', 'Amiri', 'normal');
    doc.addFont('/assets/fonts/Amiri-Bold.ttf', 'Amiri', 'bold');
  } catch (error) {
    console.warn('Arabic fonts not found, using default fonts', error);
  }
};

// Normalize expense shape (API uses debit; creation uses amount)
const normalizeExpense = (expense) => ({
  date: expense.date || expense.createdAt || null,
  amount:
    expense.debit ??
    expense.amount ??
    (typeof expense.total === 'number' ? expense.total : 0),
  description: expense.description || '-',
  status: expense.status || 'DRAFT',
});

export const exportExpensesToPDF = async (expenses) => {
  return new Promise((resolve, reject) => {
    try {
      if (!Array.isArray(expenses) || expenses.length === 0) {
        throw new Error('لا توجد بيانات للتصدير');
      }

      const doc = new jsPDF();
      registerArabicFonts(doc);

      doc.setProperties({
        title: 'تقرير المصروفات',
        subject: 'بيانات المصروفات',
        author: 'نظام إدارة السلف',
        keywords: 'مصروفات, تقرير',
        creator: 'نظام إدارة السلف',
      });

      doc.setFont('Amiri', 'bold');

      // Logo
      const logoWidth = 10;
      const logoHeight = 10;
      const logoX = doc.internal.pageSize.width - logoWidth - 5;
      const logoY = 5;
      doc.addImage(logo, 'PNG', logoX, logoY, logoWidth, logoHeight);

      // Title
      doc.setFontSize(18);
      doc.text('تقرير المصروفات', doc.internal.pageSize.width / 2, 30, {
        align: 'center',
      });

      doc.setFontSize(11);
      const summaryText = `إجمالي المصروفات: ${expenses.length} | تاريخ التصدير: ${dayjs().format('DD/MM/YYYY HH:mm')}`;
      doc.text(summaryText, doc.internal.pageSize.width / 2, 45, {
        align: 'center',
      });

      // Table data
      // Reverse column arrangement as requested (without serial column)
      const headers = [['الحالة', 'الوصف', 'المبلغ', 'التاريخ']];
      const body = expenses.map((exp) => {
        const normalized = normalizeExpense(exp);
        return [
          normalized.status === 'POSTED' ? 'مقيد' : 'مسودة',
          normalized.description,
          typeof normalized.amount === 'number'
            ? normalized.amount.toLocaleString('en-US')
            : '-',
          normalized.date
            ? dayjs(normalized.date).format('DD/MM/YYYY')
            : '-',
        ];
      });

      autoTable(doc, {
        startY: 60,
        head: headers,
        body,
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
          direction: 'rtl',
        },
        headStyles: {
          fillColor: [46, 139, 69],
          textColor: 255,
          fontStyle: 'bold',
          fontSize: 10,
          halign: 'right',
          valign: 'middle',
          cellPadding: { top: 6, bottom: 6, left: 6, right: 6 },
          overflow: 'linebreak',
          minCellHeight: 10,
          direction: 'rtl',
        },
        bodyStyles: {
          halign: 'right',
          valign: 'middle',
          cellPadding: 4,
          direction: 'rtl',
        },
        margin: { top: 60, left: 10, right: 10 },
        tableWidth: 'auto',
        horizontalPageBreak: false,
        pageBreak: 'auto',
        showHead: 'everyPage',
      });

      // Footer
      const pageCount = doc.internal.getNumberOfPages();
      const footerMargin = 10;
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setDrawColor(200, 200, 200);
        doc.setLineWidth(0.5);
        doc.line(
          footerMargin,
          doc.internal.pageSize.height - 15,
          doc.internal.pageSize.width - footerMargin,
          doc.internal.pageSize.height - 15
        );

        doc.setFontSize(9);
        doc.setFont('Amiri', 'bold');
        doc.setTextColor(100, 100, 100);
        doc.text(
          `صفحة ${i} من ${pageCount}`,
          doc.internal.pageSize.width / 2,
          doc.internal.pageSize.height - 8,
          { align: 'center' }
        );

        const creationDate = dayjs().format('DD/MM/YYYY HH:mm');
        doc.text(
          `تم الإنشاء في: ${creationDate}`,
          doc.internal.pageSize.width - footerMargin,
          doc.internal.pageSize.height - 8,
          { align: 'right' }
        );
        doc.setTextColor(0, 0, 0);
      }

      const fileName = `تقرير_المصروفات_${dayjs().format('YYYY-MM-DD')}.pdf`;
      doc.save(fileName);
      resolve();
    } catch (error) {
      console.error('PDF export error:', error.message);
      reject(error);
    }
  });
};

export const exportExpensesToExcel = async (expenses) => {
  try {
    if (!Array.isArray(expenses) || expenses.length === 0) {
      throw new Error('لا توجد بيانات للتصدير');
    }

    const workbook = XLSX.utils.book_new();
    const sheetData = [
      ['الحالة', 'الوصف', 'المبلغ', 'التاريخ'],
      ...expenses.map((exp) => {
        const normalized = normalizeExpense(exp);
        return [
          normalized.status === 'POSTED' ? 'مقيد' : 'مسودة',
          normalized.description,
          typeof normalized.amount === 'number' ? normalized.amount : 0,
          normalized.date ? dayjs(normalized.date).format('DD/MM/YYYY') : '-',
        ];
      }),
    ];

    const sheet = XLSX.utils.aoa_to_sheet(sheetData);
    sheet['!cols'] = [
      { wch: 12 },
      { wch: 40 },
      { wch: 15 },
      { wch: 15 },
    ];

    XLSX.utils.book_append_sheet(workbook, sheet, 'المصروفات');

    const excelBuffer = XLSX.write(workbook, {
      bookType: 'xlsx',
      type: 'array',
      bookSST: false,
    });

    const blob = new Blob([excelBuffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });

    const fileName = `تقرير_المصروفات_${dayjs().format('YYYY-MM-DD')}.xlsx`;
    saveAs(blob, fileName);
  } catch (error) {
    console.error('Excel export error:', error.message);
    throw error;
  }
};

