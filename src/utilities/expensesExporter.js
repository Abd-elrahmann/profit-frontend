import { saveAs } from 'file-saver';
import dayjs from 'dayjs';
import { exportUnifiedReport } from './unifiedReportTemplate';
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
  if (!Array.isArray(expenses) || expenses.length === 0) {
    throw new Error('لا توجد بيانات للتصدير');
  }

  let reportTitle = 'تقرير المصروفات';
  if (employeeNames) {
    reportTitle = `تقرير مصروفات رواتب للموظف ${employeeNames}`;
  } else if (expenseType) {
    reportTitle = `تقرير المصروفات - ${expenseType}`;
  }

  const totalAmount = expenses.reduce((sum, expense) => sum + (expense.amount || 0), 0);
  const subtitle = `إجمالي المصروفات: ${expenses.length} | إجمالي المبلغ: ${totalAmount.toLocaleString('en-US')}`;

  return exportUnifiedReport({
    reportTitle,
    fileName: reportTitle.replace(/\s+/g, '_'),
    orientation: 'landscape',
    subtitle,
    columns: [
      { header: 'التاريخ', dataKey: 'createdAt', width: 25, format: 'date' },
      { header: 'الموظف', dataKey: 'employeeName', width: 30, align: 'right' },
      { header: 'الوصف', dataKey: 'description', width: 80, align: 'right' },
      { header: 'المبلغ', dataKey: 'amount', width: 35, format: 'number0' },
      { header: 'النوع', dataKey: 'type', width: 25, align: 'right' },
    ],
    rows: expenses.map((expense) => ({
      ...expense,
      employeeName: expense.employee?.name || '-',
      description: expense.description || '-',
      amount: expense.amount || 0,
      type: expense.type || '-',
    })),
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
