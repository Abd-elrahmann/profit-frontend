import { saveAs } from 'file-saver';
import { exportUnifiedReport } from './unifiedReportTemplate';
import dayjs from 'dayjs';
// eslint-disable-next-line no-unused-vars
const loadPDFFromURL = async (url) => {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`فشل تحميل الملف: ${response.status}`);
    }
    const arrayBuffer = await response.arrayBuffer();
    return new Uint8Array(arrayBuffer);
  } catch (error) {
    console.error('خطأ في تحميل ملف PDF:', error);
    throw error;
  }
};
const getArabicMonth = (month) => {
  const months = {
    1: 'يناير', 2: 'فبراير', 3: 'مارس', 4: 'أبريل',
    5: 'مايو', 6: 'يونيو', 7: 'يوليو', 8: 'أغسطس',
    9: 'سبتمبر', 10: 'أكتوبر', 11: 'نوفمبر', 12: 'ديسمبر'
  };
  return months[month] || month;
};
const formatAmount = (amount) => {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount || 0);
};
const getCapitalData = (incomeData) => {
  if (!incomeData) return [];
  const data = [];
  data.push({
    id: 0,
    name: "إجمالي رأس المال المدفوع",
    code: "CAP-001",
    amount: incomeData.totalCapital || 0,
    type: "capital",
    level: 0,
    hasDetails: incomeData.capitalByPartner && incomeData.capitalByPartner.length > 0
  });
  if (incomeData.capitalByPartner && incomeData.capitalByPartner.length > 0) {
    incomeData.capitalByPartner.forEach((partner, index) => {
      data.push({
        id: `capital-${index}-capital`,
        name: `${partner.partnerName} - رأس المال الأصلي`,
        amount: partner.capitalAmount,
        type: "capital-detail",
        level: 1,
        isCapitalAmount: true
      });
      if (partner.newCapitalAmount && partner.newCapitalAmount > 0) {
        data.push({
          id: `capital-${index}-new-capital`,
          name: `${partner.partnerName} - رأس المال الجديد`,
          amount: partner.newCapitalAmount,
          type: "capital-detail",
          level: 1,
          isNewCapitalAmount: true
        });
      }
      data.push({
        id: `capital-${index}-profit`,
        name: `${partner.partnerName} - الأرباح`,
        amount: partner.totalProfit,
        type: "capital-detail",
        level: 1,
        isProfit: true
      });
    });
  }
  return data;
};
const getRevenueData = (incomeData) => {
  if (!incomeData) return [];
  const data = [];
  data.push({
    id: 1,
    name: "قسم الإيرادات",
    type: "revenue-header",
    level: 0,
    hasDetails: (incomeData.revenueLineItems?.length > 0) || (incomeData.revenueByClient?.length > 0)
  });
  if (incomeData.revenueLineItems && incomeData.revenueLineItems.length > 0) {
    incomeData.revenueLineItems.forEach((item, idx) => {
      data.push({
        id: `revenue-line-${idx}`,
        name: item.label,
        amount: item.amount,
        type: "revenue-line",
        level: 1
      });
    });
  } else if (incomeData.revenues?.total != null) {
    data.push({
      id: "revenue-total-fallback",
      name: "فوائد السلف المحصلة",
      amount: incomeData.revenues.total,
      type: "revenue-line",
      level: 1
    });
  }
  if (incomeData.revenueByClient && incomeData.revenueByClient.length > 0) {
    incomeData.revenueByClient.forEach((client, clientIndex) => {
      data.push({
        id: `client-${clientIndex}`,
        name: client.clientName,
        amount: client.totalRevenue,
        type: "client-revenue",
        level: 2,
        isClientName: true
      });
    });
  }
  data.push({
    id: 2.5,
    name: "إجمالي الإيرادات التشغيلية",
    amount: incomeData.revenues?.total || 0,
    type: "revenue-total"
  });
  return data;
};
const getExpenseData = (incomeData) => {
  if (!incomeData) return [];
  const data = [];
  data.push({
    id: 3,
    name: "قسم المصروفات",
    type: "expense-header",
    level: 0,
    hasDetails: (incomeData.expenseByType?.length > 0) || (incomeData.detailedExpenses?.length > 0)
  });
  if (incomeData.expenseByType && incomeData.expenseByType.length > 0) {
    incomeData.expenseByType.forEach((item, index) => {
      data.push({
        id: 4 + index,
        name: item.type,
        amount: -item.amount,
        type: "expense",
        level: 1,
        expenseType: item.type,
        percentage: item.percentage
      });
    });
  } else if (incomeData.detailedExpenses && incomeData.detailedExpenses.length > 0) {
    incomeData.detailedExpenses.forEach((expense, index) => {
      data.push({
        id: 4 + index,
        name: expense.description || expense.type,
        amount: -expense.amount,
        type: "expense",
        level: 2,
        expenseType: expense.type,
        employee: expense.employee,
        date: expense.createdAt
      });
    });
  }
  data.push({
    id: 100,
    name: "إجمالي المصروفات التشغيلية",
    amount: -(incomeData.totalExpenses || 0),
    type: "expense-total"
  });
  return data;
};
const getFinalResultData = (incomeData) => {
  if (!incomeData) return [];
  return [{
    id: "final-profit",
    name: "صافي الربح",
    code: "FIN-FINAL",
    amount: incomeData.netProfit || 0,
    type: "final-profit",
    level: 0,
    isFinal: true
  }];
};
const getAllData = (incomeData) => {
  const allData = [];
  const capitalData = getCapitalData(incomeData);
  allData.push(...capitalData);
  allData.push({ id: 'spacer-1', type: "spacer" });
  const revenueData = getRevenueData(incomeData);
  allData.push(...revenueData);
  allData.push({ id: 'spacer-2', type: "spacer" });
  const expenseData = getExpenseData(incomeData);
  allData.push(...expenseData);
  allData.push({ id: 'spacer-3', type: "spacer" });
  const finalData = getFinalResultData(incomeData);
  allData.push(...finalData);
  return allData;
};
const getRowStyle = (row) => {
  if (row.isClientName) {
    return { textColor: [46, 139, 69] };
  }
  if (row.type === "revenue-header" || row.type === "expense-header") {
    return { textColor: [46, 139, 69] };
  }
  return {};
};
const getPeriodInfo = (incomeData, periodType, selectedMonth, selectedYear, fromDate, toDate) => {
  let periodText = "";
  let from = null;
  let to = null;
  let source = periodType?.toUpperCase() || "UNKNOWN";
  if (periodType === "custom") {
    periodText = `من ${fromDate.format('DD/MM/YYYY')} إلى ${toDate.format('DD/MM/YYYY')}`;
    from = fromDate.format('YYYY-MM-DD');
    to = toDate.format('YYYY-MM-DD');
    source = "CUSTOM";
  } else if (periodType === "monthly") {
    periodText = `${getArabicMonth(selectedMonth + 1)} ${selectedYear}`;
    const startOfMonth = dayjs().year(selectedYear).month(selectedMonth).startOf('month');
    const endOfMonth = dayjs().year(selectedYear).month(selectedMonth).endOf('month');
    from = startOfMonth.format('YYYY-MM-DD');
    to = endOfMonth.format('YYYY-MM-DD');
    source = "MONTH";
  } else {
    if (incomeData && incomeData.period) {
      const period = incomeData.period;
      if (period.source === "MONTH") {
        periodText = `${getArabicMonth(period.month)} ${period.year}`;
      } else if (period.source === "CUSTOM") {
        periodText = `من ${dayjs(period.from).format('DD/MM/YYYY')} إلى ${dayjs(period.to).format('DD/MM/YYYY')}`;
      } else if (period.source === "CURRENT_PERIOD") {
        periodText = `الفترة الحالية (${dayjs(period.from).format('DD/MM/YYYY')} - ${dayjs(period.to).format('DD/MM/YYYY')})`;
      } else if (period.source === "PERIOD") {
        periodText = `فترة محاسبية محددة (${dayjs(period.from).format('DD/MM/YYYY')} - ${dayjs(period.to).format('DD/MM/YYYY')})`;
      } else {
        periodText = `من ${dayjs(period.from).format('DD/MM/YYYY')} إلى ${dayjs(period.to).format('DD/MM/YYYY')}`;
      }
      from = period.from;
      to = period.to;
      source = period.source;
    } else {
      periodText = "فترة غير محددة";
    }
  }
  return {
    text: periodText,
    from: from,
    to: to,
    source: source
  };
};
const addSectionTable = (doc, sectionData, sectionTitle, startY) => {
  if (!sectionData || sectionData.length === 0) return startY;
  let tableStartY = startY;
  if (sectionTitle && sectionTitle.trim()) {
    doc.setFontSize(12);
    doc.setFont('Amiri', 'bold');
    doc.setTextColor(46, 139, 69);
    const titleY = startY;
    doc.text(sectionTitle, doc.internal.pageSize.width / 2, titleY, { align: 'center' });
    tableStartY = titleY + 8;
  }
  const tableRows = [];
  sectionData.forEach(row => {
    if (row.type === "spacer") {
      tableRows.push(['', '', '']);
    } else {
      let name = row.name || '';
      if (row.level === 1) name = `   ${name}`;
      if (row.level === 2) name = `      ${name}`;
      if (row.subIndent) name = `         ${name}`;
      const amount = row.amount !== null && row.amount !== undefined ? formatAmount(row.amount) : '';
      let details = '';
      if (row.type === "revenue-detail" || row.type === "expense") {
        details = row.date ? dayjs(row.date).format('DD/MM/YYYY') : '';
        if (row.employee) details += ` | ${row.employee}`;
        if (row.expenseType) details += ` | ${row.expenseType}`;
      }
      if (row.profitPercentage) details = `نسبة الربح: ${row.profitPercentage}%`;
      tableRows.push([amount, name, details]);
    }
  });
    const sectionBaseWidths = [45, 95, 50];
    const sectionColumnStyles = getFullWidthColumnStyles(doc, sectionBaseWidths);
    Object.keys(sectionColumnStyles).forEach((k) => {
      sectionColumnStyles[k] = { ...sectionColumnStyles[k], halign: 'center', fontStyle: 'bold' };
    });
    sectionColumnStyles[2].fontSize = 9;
    autoTable(doc, {
      head: [['المبلغ', 'البند والتفاصيل', 'ملاحظات إضافية']],
      body: tableRows,
      startY: tableStartY,
      ...pdfTableBaseStyles,
      styles: { ...pdfTableBaseStyles.styles, fontSize: 9, cellPadding: 4, fontStyle: 'bold' },
      headStyles: { ...pdfTableBaseStyles.headStyles, fillColor: PRIMARY_COLOR, textColor: [255, 255, 255], fontSize: 9, cellPadding: 4 },
      bodyStyles: { ...pdfTableBaseStyles.bodyStyles, fontStyle: 'bold', cellPadding: 4 },
      columnStyles: sectionColumnStyles,
      margin: { left: PAGE_MARGIN, right: PAGE_MARGIN, bottom: 25 },
      tableWidth: 'auto',
        pageBreak: 'auto',
        rowPageBreak: 'auto',
      didParseCell: function(data) {
        const rowIndex = data.row.index;
        const row = sectionData[rowIndex];
        if (row) {
          const style = getRowStyle(row);
          if (style.textColor) {
            data.cell.styles.textColor = style.textColor;
          }
          if (row.isFinal) {
            data.cell.styles.textColor = row.amount >= 0 ? [46, 139, 69] : [220, 38, 38];
          }
          if (row.isHeader || row.isTotal || row.isFinal || row.level === 0 ||
              row.type === "client-revenue" || row.isCapitalAmount || row.isProfit) {
            data.cell.styles.fontStyle = 'bold';
            if (row.type === "client-revenue") {
              data.cell.styles.fontSize = 11;
            }
          }
          if (row.amount < 0 && !row.isHeader) {
            data.cell.styles.textColor = [220, 38, 38];
          }
        }
      },
      didDrawTable: createDidDrawTable(doc)
    });
  return doc.lastAutoTable.finalY;
};
export const exportIncomeStatementToPDF = async (incomeData, periodType, selectedMonth, selectedYear, fromDate, toDate, options = {}) => {
  if (!incomeData) {
    throw new Error('لا توجد بيانات للتصدير');
  }
  const periodInfo = getPeriodInfo(incomeData, periodType, selectedMonth, selectedYear, fromDate, toDate);
  const allData = getAllData(incomeData).filter((r) => r.type !== 'spacer');

  return exportUnifiedReport({
    reportTitle: 'قائمة الدخل',
    fileName: `قائمة_الدخل_${periodInfo ? periodInfo.text.replace(/[^a-zA-Z0-9\u0600-\u06FF]/g, '_') : 'تقرير'}`,
    orientation: 'landscape',
    dateFrom: periodInfo?.from,
    dateTo: periodInfo?.to,
    subtitle: `الفترة: ${periodInfo?.text || 'غير محدد'} | رأس المال: ${formatAmount(incomeData.totalCapital || 0)} | الإيرادات: ${formatAmount(incomeData.revenues?.total || 0)} | المصروفات: ${formatAmount(incomeData.totalExpenses || 0)} | ${incomeData.netProfit >= 0 ? 'صافي الربح' : 'صافي الخسارة'}: ${formatAmount(Math.abs(incomeData.netProfit || 0))}`,
    columns: [
      { header: 'المبلغ', dataKey: 'amount', width: 35, format: 'number0' },
      { header: 'البند', dataKey: 'name', width: 95, align: 'right' },
    ],
    rows: allData.map((row) => ({
      amount: row.amount || 0,
      name: row.name || '-',
    })),
    save: options.save ?? true,
  });
};
export const exportIncomeStatementToExcel = async (incomeData, periodType, selectedMonth, selectedYear, fromDate, toDate) => {
  try {
    if (!incomeData) {
      throw new Error('لا توجد بيانات للتصدير');
    }
    const periodInfo = getPeriodInfo(incomeData, periodType, selectedMonth, selectedYear, fromDate, toDate);
    const tableData = getAllData(incomeData);
    const XLSX = await import('xlsx');
    const workbook = XLSX.utils.book_new();
    const fullDetailedData = [
      ['قائمة الدخل - البيان التفصيلي الكامل'],
      [''],
      ['الفترة', periodInfo ? periodInfo.text : 'غير محدد'],
      ['تاريخ التصدير', dayjs().format('DD/MM/YYYY HH:mm')],
      [''],
      ['المبلغ', 'البند', 'الرمز المرجعي', 'النوع', 'التاريخ', 'ملاحظات']
    ];
    tableData.forEach(row => {
      if (row.type === "spacer") {
        fullDetailedData.push(['', '', '', '', '', '']);
      } else {
        let name = row.name || '';
        if (row.level === 1) name = `  ${name}`;
        if (row.level === 2) name = `    ${name}`;
        let notes = '';
        if (row.employee) notes += `موظف: ${row.employee} `;
        if (row.expenseType) notes += `نوع: ${row.expenseType} `;
        if (row.profitPercentage) notes += `نسبة ربح: ${row.profitPercentage}% `;
        fullDetailedData.push([
          row.amount || 0,
          name,
          row.code || '',
          row.type || '',
          row.date ? dayjs(row.date).format('DD/MM/YYYY') : '',
          notes.trim()
        ]);
      }
    });
    const fullDetailedSheet = XLSX.utils.aoa_to_sheet(fullDetailedData);
    const range = XLSX.utils.decode_range(fullDetailedSheet['!ref']);
    for (let R = 0; R <= range.e.r; R++) {
      for (let C = 0; C <= range.e.c; C++) {
        const cellAddress = XLSX.utils.encode_cell({ r: R, c: C });
        const cell = fullDetailedSheet[cellAddress];
        if (cell) {
          if (R === 5) {
            cell.s = {
              fill: { fgColor: { rgb: "F0F0F0" } },
              font: { color: { rgb: "2E8B45" }, bold: true },
              alignment: { horizontal: "center" }
            };
          }
          const dataRowIndex = R - 6;
          if (dataRowIndex >= 0 && dataRowIndex < tableData.length) {
            const rowData = tableData[dataRowIndex];
            if (rowData.isHeader) {
              cell.s = {
                font: { color: { rgb: "2E8B45" }, bold: true },
                alignment: { horizontal: "center" }
              };
            }
            else if (rowData.type === "revenue-header" || rowData.type === "expense-header") {
              cell.s = {
                font: { color: { rgb: "2E8B45" }, bold: true },
                alignment: { horizontal: "center" }
              };
            }
            else if (rowData.isTotal) {
              cell.s = {
                fill: { fgColor: { rgb: "F5F5F5" } },
                font: { bold: true },
                alignment: { horizontal: "center" }
              };
            }
            else if (rowData.isFinal) {
              const textColor = rowData.amount >= 0 ? "2E8B45" : "DC2626";
              cell.s = {
                font: { color: { rgb: textColor }, bold: true },
                alignment: { horizontal: "center" }
              };
            }
            else if (rowData.amount < 0) {
              if (!cell.s) cell.s = {};
              cell.s.font = cell.s.font || {};
              cell.s.font.color = { rgb: "DC2626" };
            }
          }
        }
      }
    }
    fullDetailedSheet['!cols'] = [
      { wch: 15 },
      { wch: 40 },
      { wch: 15 },
      { wch: 20 },
      { wch: 15 },
      { wch: 30 }
    ];
    XLSX.utils.book_append_sheet(workbook, fullDetailedSheet, 'البيان التفصيلي الكامل');
    const summaryData = [
      ['قائمة الدخل - الملخص'],
      [''],
      ['الفترة', periodInfo ? periodInfo.text : 'غير محدد'],
      ['تاريخ التصدير', dayjs().format('DD/MM/YYYY HH:mm')],
      [''],
      ['المبلغ', 'البيان', 'الرمز']
    ];
    summaryData.push([incomeData.totalCapital || 0, 'رأس المال الفعلي', 'CAP-001']);
    summaryData.push([incomeData.revenues?.total || 0, 'إجمالي الإيرادات', 'REV-TOTAL']);
    if (incomeData.revenues && incomeData.revenues.generalLoans > 0) {
      summaryData.push([incomeData.revenues.generalLoans, 'سلف عامة', 'REV-GEN']);
    }
    if (incomeData.revenues && incomeData.revenues.newCapitalLoans > 0) {
      summaryData.push([incomeData.revenues.newCapitalLoans, 'سلف رأس مال جديد', 'REV-NEW-CAP']);
    }
    summaryData.push([incomeData.totalExpenses || 0, 'المصروفات التشغيلية', 'EXP-TOTAL']);
    summaryData.push([incomeData.netProfit || 0, incomeData.netProfit >= 0 ? 'صافي الربح' : 'صافي الخسارة', 'NET-PROFIT']);
    const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
    summarySheet['!cols'] = [
      { wch: 15 },
      { wch: 30 },
      { wch: 15 }
    ];
    XLSX.utils.book_append_sheet(workbook, summarySheet, 'ملخص');
    const capitalDetails = [
      ['تفاصيل رأس المال والمستثمرين'],
      [''],
      ['الفترة', periodInfo ? periodInfo.text : 'غير محدد'],
      ['تاريخ التصدير', dayjs().format('DD/MM/YYYY HH:mm')],
      [''],
      ['المبلغ', 'اسم المستثمر', 'التفاصيل', 'نوع رأس المال', 'نسبة الربح']
    ];
    capitalDetails.push([
      incomeData.totalCapital || 0,
      'إجمالي رأس المال المدفوع',
      'CAP-001',
      ''
    ]);
    if (incomeData.capitalByPartner && incomeData.capitalByPartner.length > 0) {
      capitalDetails.push(['', '', '', '']);
      incomeData.capitalByPartner.forEach(partner => {
        capitalDetails.push([
          partner.totalAmount || 0,
          partner.partnerName || '',
          'رأس المال المدفوع',
          '',
          ''
        ]);
        capitalDetails.push([
          partner.capitalAmount || 0,
          partner.partnerName || '',
          'رأس المال الأصلي',
          'أصلي',
          ''
        ]);
        if (partner.newCapitalAmount && partner.newCapitalAmount > 0) {
          capitalDetails.push([
            partner.newCapitalAmount || 0,
            partner.partnerName || '',
            'رأس المال الجديد',
            'جديد',
            ''
          ]);
        }
        capitalDetails.push([
          partner.totalProfit || 0,
          partner.partnerName || '',
          'الأرباح',
          'أرباح',
          ''
        ]);
      });
    }
    const capitalSheet = XLSX.utils.aoa_to_sheet(capitalDetails);
    capitalSheet['!cols'] = [
      { wch: 15 },
      { wch: 30 },
      { wch: 15 },
      { wch: 15 },
      { wch: 15 }
    ];
    XLSX.utils.book_append_sheet(workbook, capitalSheet, 'رأس المال');
    const excelBuffer = XLSX.write(workbook, {
      bookType: 'xlsx',
      type: 'array',
      bookSST: false
    });
    const blob = new Blob([excelBuffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    });
    const fileName = `قائمة_الدخل_${periodInfo ? periodInfo.text.replace(/[^a-zA-Z0-9\u0600-\u06FF]/g, '_') : 'تقرير'}_${dayjs().format('YYYY-MM-DD')}.xlsx`;
    saveAs(blob, fileName);
  } catch (error) {
    console.error('Excel export error:', error.message);
    throw error;
  }
};
export const printIncomeStatement = async (incomeData, periodType, selectedMonth, selectedYear, fromDate, toDate) => {
  const doc = await exportIncomeStatementToPDF(
    incomeData,
    periodType,
    selectedMonth,
    selectedYear,
    fromDate,
    toDate,
    { save: false }
  );
  const pdfBlob = doc.output('blob');
  const pdfUrl = URL.createObjectURL(pdfBlob);
  const printWindow = window.open(pdfUrl);
  if (!printWindow) {
    throw new Error('فشل في فتح نافذة الطباعة');
  }
  printWindow.onload = function () {
    printWindow.print();
    setTimeout(() => {
      URL.revokeObjectURL(pdfUrl);
    }, 1000);
  };
};