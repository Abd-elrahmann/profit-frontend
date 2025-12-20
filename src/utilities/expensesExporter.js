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

// دالة جديدة لإنشاء تفاصيل المصروفات كنص
const generateExpensesDetails = (expense) => {
  return expense.description || '-';
};

// دالة جديدة لإنشاء صفوف Excel مع تفاصيل المصروفات
const generateExcelRows = (expenses) => {
  const rows = [];

  expenses.forEach((expense) => {
    rows.push([
      expense.type || '-',
      expense.amount || 0,
      expense.description || '-',
      expense.employee?.name || '-',
      dayjs(expense.createdAt).format('DD/MM/YYYY'),
    ]);
  });

  return rows;
};

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

      // حساب إجمالي المصاريف
      const totalAmount = expenses.reduce((sum, expense) => sum + (expense.amount || 0), 0);

      doc.setFontSize(11);
      const summaryText = `إجمالي المصروفات: ${expenses.length} مصروف | إجمالي المبلغ: ${totalAmount.toLocaleString('en-US')} | تاريخ التصدير: ${dayjs().format('DD/MM/YYYY HH:mm')}`;
      doc.text(summaryText, doc.internal.pageSize.width / 2, 45, {
        align: 'center',
      });

      // Table data
      const headers = [['النوع', 'المبلغ', 'الوصف', 'الموظف', 'التاريخ']];
      const body = expenses.map((expense) => {
        return [
          expense.type || '-',
          (expense.amount || 0).toLocaleString('en-US'),
          expense.description || '-',
          expense.employee?.name || '-',
          dayjs(expense.createdAt).format('DD/MM/YYYY'),
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
          fontSize: 8,
          cellPadding: { top: 4, bottom: 4, left: 4, right: 4 },
          lineColor: [220, 220, 220],
          lineWidth: 0.2,
          halign: 'right',
          valign: 'top',
          overflow: 'linebreak',
          direction: 'rtl',
        },
        headStyles: {
          fillColor: [240, 249, 244],
          textColor: [46, 139, 69],
          fontStyle: 'bold',
          fontSize: 9,
          halign: 'right',
          valign: 'middle',
          cellPadding: { top: 6, bottom: 6, left: 6, right: 6 },
          overflow: 'visible',
          minCellHeight: 15,
          maxCellHeight: 15,
          direction: 'rtl',
        },
        bodyStyles: {
          fontStyle: 'bold',
          halign: 'right',
          valign: 'top',
          cellPadding: 4,
          direction: 'rtl',
        },
        columnStyles: {
          2: { cellWidth: 'auto', minCellWidth: 60 }, // الوصف
          3: { cellWidth: 'auto', minCellWidth: 40 }, // الموظف
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
    
    // حساب إجمالي المصاريف
    const totalAmount = expenses.reduce((sum, expense) => sum + (expense.amount || 0), 0);

    // إنشاء صفوف البيانات
    const rows = generateExcelRows(expenses);

    // إضافة إجمالي المصاريف في الأعلى
    rows.unshift(['', '', '', '', '']);
    rows.unshift(['إجمالي المصاريف:', totalAmount, '', '', '']);
    rows.unshift(['تاريخ التصدير:', dayjs().format('DD/MM/YYYY HH:mm'), '', '', '']);
    rows.unshift(['', '', '', '', '']);

    // إضافة الهيدر
    rows.unshift(['النوع', 'المبلغ', 'الوصف', 'الموظف', 'التاريخ']);
    
    const sheet = XLSX.utils.aoa_to_sheet(rows);
    
    // تعيين أبعاد الأعمدة
    sheet['!cols'] = [
      { wch: 20 },  // النوع
      { wch: 15 },  // المبلغ
      { wch: 40 },  // الوصف
      { wch: 20 },  // الموظف
      { wch: 15 },  // التاريخ
    ];

    // إضافة التنسيق للهيدر
    const range = XLSX.utils.decode_range(sheet['!ref']);
    for (let C = range.s.c; C <= range.e.c; ++C) {
      const cellAddress = XLSX.utils.encode_cell({ r: 0, c: C });
      if (!sheet[cellAddress]) continue;
      sheet[cellAddress].s = {
        font: { bold: true, sz: 12 },
        fill: { fgColor: { rgb: "2E8B57" } },
        alignment: { horizontal: "center", vertical: "center" }
      };
    }

    // تنسيق خلايا المبالغ (يبدأ من الصف 5 حيث توجد البيانات الفعلية)
    for (let R = 5; R <= range.e.r; ++R) {
      const cellAddress = XLSX.utils.encode_cell({ r: R, c: 1 }); // عمود المبلغ (العمود 1)
      if (sheet[cellAddress] && typeof sheet[cellAddress].v === 'number') {
        sheet[cellAddress].s = {
          numFmt: '#,##0.00'
        };
      }
    }

    XLSX.utils.book_append_sheet(workbook, sheet, 'المصروفات');

    // إضافة ورقة ملخص
    const summaryData = [
      ['ملخص المصروفات'],
      [],
      ['إجمالي عدد المصروفات:', expenses.length],
      ['إجمالي المبالغ:', totalAmount],
      ['تاريخ التصدير:', dayjs().format('DD/MM/YYYY HH:mm')]
    ];

    const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
    summarySheet['!cols'] = [{ wch: 30 }, { wch: 20 }];
    XLSX.utils.book_append_sheet(workbook, summarySheet, 'ملخص');

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