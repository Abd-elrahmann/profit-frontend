import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

import { saveAs } from 'file-saver';
import { getPdfTableStyles, createDidDrawTable } from './pdfTableStyles';
import dayjs from 'dayjs';
import logo from '/assets/images/logo.webp';

const registerArabicFonts = (doc) => {
  try {
    doc.addFont('/assets/fonts/Amiri-Regular.ttf', 'Amiri', 'normal');
    doc.addFont('/assets/fonts/Amiri-Bold.ttf', 'Amiri', 'bold');
  } catch (error) {
    console.warn('Arabic fonts not found, using default fonts', error);
  }
};

const generateExcelRows = (expenses) => {
  const rows = [];

  expenses.forEach((expense) => {
    rows.push([
      dayjs(expense.createdAt).format('DD/MM/YYYY'),
      expense.employee?.name || '-',
      expense.description || '-',
      expense.amount || 0,
      expense.type || '-',
    ]);
  });

  return rows;
};

export const exportExpensesToPDF = async (expenses, expenseType = "", employeeNames = "") => {
  return new Promise((resolve, reject) => {
    try {
      if (!Array.isArray(expenses) || expenses.length === 0) {
        throw new Error('لا توجد بيانات للتصدير');
      }

      const doc = new jsPDF();
      registerArabicFonts(doc);

      let reportTitle = 'تقرير المصروفات';
      if (employeeNames) {
        reportTitle = `تقرير مصروفات رواتب للموظف ${employeeNames}`;
      } else if (expenseType) {
        reportTitle = `تقرير المصروفات - ${expenseType}`;
      }
      
      doc.setProperties({
        title: reportTitle,
        subject: 'بيانات المصروفات',
        author: 'نظام إدارة السلف',
        keywords: 'مصروفات, تقرير',
        creator: 'نظام إدارة السلف',
      });

      doc.setFont('Amiri', 'bold');

      const logoWidth = 10;
      const logoHeight = 10;
      const logoX = doc.internal.pageSize.width - logoWidth - 5;
      const logoY = 5;
      doc.addImage(logo, 'PNG', logoX, logoY, logoWidth, logoHeight);

      doc.setFontSize(18);
      let title = 'تقرير المصروفات';
      if (employeeNames) {
        title = `تقرير مصروفات رواتب للموظف ${employeeNames}`;
      } else if (expenseType) {
        title = `تقرير المصروفات - ${expenseType}`;
      }
      doc.text(title, doc.internal.pageSize.width / 2, 30, {
        align: 'center',
      });

      const totalAmount = expenses.reduce((sum, expense) => sum + (expense.amount || 0), 0);

      doc.setFontSize(11);
      const summaryText = `إجمالي المصروفات: ${expenses.length} مصروف | إجمالي المبلغ: ${totalAmount.toLocaleString('en-US')} | تاريخ التصدير: ${dayjs().format('DD/MM/YYYY HH:mm')}`;
      doc.text(summaryText, doc.internal.pageSize.width / 2, 45, {
        align: 'center',
      });

      const headers = [['التاريخ', 'الموظف', 'الوصف', 'المبلغ', 'النوع']];
      const body = expenses.map((expense) => {
        return [
          dayjs(expense.createdAt).format('DD/MM/YYYY'),
          expense.employee?.name || '-',
          expense.description || '-',
          (expense.amount || 0).toLocaleString('en-US'),
          expense.type || '-',
        ];
      });

      autoTable(doc, {
        startY: 60,
        head: headers,
        body,
        ...getPdfTableStyles({
          styles: { halign: 'right', valign: 'top', fontStyle: 'bold', fontSize: 8 },
          headStyles: { halign: 'right' },
          bodyStyles: { halign: 'right', valign: 'top', fontStyle: 'bold', cellPadding: 4 }
        }),
        columnStyles: {
          2: { cellWidth: 'auto', minCellWidth: 60 }, 
          3: { cellWidth: 'auto', minCellWidth: 40 }, 
        },
        margin: { top: 60, left: 10, right: 10 },
        tableWidth: 'auto',
        horizontalPageBreak: false,
        pageBreak: 'auto',
        showHead: 'everyPage',
        didDrawTable: createDidDrawTable(doc)
      });

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

      let fileName = `تقرير_المصروفات_${dayjs().format('YYYY-MM-DD')}.pdf`;
      if (employeeNames) {
        fileName = `تقرير_مصروفات_رواتب_${employeeNames.replace(/\s+/g, '_')}_${dayjs().format('YYYY-MM-DD')}.pdf`;
      } else if (expenseType) {
        fileName = `تقرير_المصروفات_${expenseType.replace(/\s+/g, '_')}_${dayjs().format('YYYY-MM-DD')}.pdf`;
      }
      doc.save(fileName);
      resolve();
    } catch (error) {
      console.error('PDF export error:', error.message);
      reject(error);
    }
  });
};

export const exportExpensesToExcel = async (expenses, expenseType = "", employeeNames = "") => {
  try {
    if (!Array.isArray(expenses) || expenses.length === 0) {
      throw new Error('لا توجد بيانات للتصدير');
    }

    const XLSX = await import('xlsx');

    const workbook = XLSX.utils.book_new();
    
    const totalAmount = expenses.reduce((sum, expense) => sum + (expense.amount || 0), 0);

    const rows = generateExcelRows(expenses);

    rows.unshift(['', '', '', '', '']);
    rows.unshift(['إجمالي المصاريف:', totalAmount, '', '', '']);
    rows.unshift(['تاريخ التصدير:', dayjs().format('DD/MM/YYYY HH:mm'), '', '', '']);
    rows.unshift(['', '', '', '', '']);

    rows.unshift(['التاريخ', 'الموظف', 'الوصف', 'المبلغ', 'النوع']);
    
    const sheet = XLSX.utils.aoa_to_sheet(rows);
    
    sheet['!cols'] = [
      { wch: 15 },  
      { wch: 20 },  
      { wch: 40 },  
      { wch: 15 },  
      { wch: 20 },  
    ];

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

    for (let R = 5; R <= range.e.r; ++R) {
      const cellAddress = XLSX.utils.encode_cell({ r: R, c: 3 }); 
      if (sheet[cellAddress] && typeof sheet[cellAddress].v === 'number') {
        sheet[cellAddress].s = {
          numFmt: '#,##0.00'
        };
      }
    }

    XLSX.utils.book_append_sheet(workbook, sheet, 'المصروفات');

    let summaryTitle = 'ملخص المصروفات';
    if (employeeNames) {
      summaryTitle = `ملخص مصروفات رواتب للموظف ${employeeNames}`;
    } else if (expenseType) {
      summaryTitle = `ملخص المصروفات - ${expenseType}`;
    }
    
    const summaryData = [
      [summaryTitle],
      [],
      ['نوع المصروف:', employeeNames ? 'مصروف رواتب' : (expenseType || 'الكل')],
      ...(employeeNames ? [['الموظف:', employeeNames]] : []),
      ['إجمالي عدد المصروفات:', expenses.length],
      ['إجمالي المبالغ:', totalAmount],
      ['تاريخ التصدير:', dayjs().format('DD/MM/YYYY HH:mm')]
    ];

    const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
    summarySheet['!cols'] = [{ wch: 30 }, { wch: 20 }];
    
    let summarySheetName = 'ملخص';
    if (employeeNames) {
      summarySheetName = `ملخص - ${employeeNames.substring(0, 20)}`;
    } else if (expenseType) {
      summarySheetName = `ملخص - ${expenseType.substring(0, 20)}`;
    }
    XLSX.utils.book_append_sheet(workbook, summarySheet, summarySheetName);

    const excelBuffer = XLSX.write(workbook, {
      bookType: 'xlsx',
      type: 'array',
      bookSST: false,
    });

    const blob = new Blob([excelBuffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });

    let fileName = `تقرير_المصروفات_${dayjs().format('YYYY-MM-DD')}.xlsx`;
    if (employeeNames) {
      fileName = `تقرير_مصروفات_رواتب_${employeeNames.replace(/\s+/g, '_')}_${dayjs().format('YYYY-MM-DD')}.xlsx`;
    } else if (expenseType) {
      fileName = `تقرير_المصروفات_${expenseType.replace(/\s+/g, '_')}_${dayjs().format('YYYY-MM-DD')}.xlsx`;
    }
    saveAs(blob, fileName);
  } catch (error) {
    console.error('Excel export error:', error.message);
    throw error;
  }
};

