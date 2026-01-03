import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { saveAs } from 'file-saver';
import dayjs from 'dayjs';
import logo from '/assets/images/logo.webp';

// دالة لتحميل PDF - محجوزة للاستخدام المستقبلي
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

// Register Arabic fonts
const registerArabicFonts = (doc) => {
  try {
    doc.addFont('/assets/fonts/Amiri-Regular.ttf', 'Amiri', 'normal');
    doc.addFont('/assets/fonts/Amiri-Bold.ttf', 'Amiri', 'bold');
  } catch (error) {
    console.warn('Arabic fonts not found, using default fonts', error);
  }
};

// Get Arabic month name
const getArabicMonth = (month) => {
  const months = {
    1: 'يناير', 2: 'فبراير', 3: 'مارس', 4: 'أبريل',
    5: 'مايو', 6: 'يونيو', 7: 'يوليو', 8: 'أغسطس',
    9: 'سبتمبر', 10: 'أكتوبر', 11: 'نوفمبر', 12: 'ديسمبر'
  };
  return months[month] || month;
};

// تنسيق الأرقام بدون أقواس أو عملة
const formatAmount = (amount) => {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount || 0);
};

// دالة للحصول على بيانات قسم رأس المال
const getCapitalData = (incomeData) => {
  if (!incomeData) return [];

  const data = [];

  // رأس المال الإجمالي
  data.push({
    id: 0,
    name: "إجمالي رأس المال المدفوع الفعلي",
    code: "CAP-001",
    amount: incomeData.totalCapital || 0,
    type: "capital",
    level: 0,
    hasDetails: incomeData.capitalByPartner && incomeData.capitalByPartner.length > 0
  });

  // تفاصيل رأس المال دائماً مفتوحة
  if (incomeData.capitalByPartner && incomeData.capitalByPartner.length > 0) {
    incomeData.capitalByPartner.forEach((partner, index) => {
      // رأس المال الأصلي
      data.push({
        id: `capital-${index}-capital`,
        name: `${partner.partnerName} - رأس المال الأصلي`,
        amount: partner.capitalAmount,
        type: "capital-detail",
        level: 1,
        isCapitalAmount: true
      });

      // رأس المال الجديد
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

      // الأرباح
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

// دالة للحصول على بيانات قسم الإيرادات
const getRevenueData = (incomeData) => {
  if (!incomeData) return [];

  const data = [];

  // عنوان الإيرادات
  data.push({
    id: 1,
    name: "الإيرادات التشغيلية",
    type: "revenue-header",
    level: 0,
    hasDetails: incomeData.revenueByClient && incomeData.revenueByClient.length > 0
  });

  // إيرادات العملاء دائماً مفتوحة
  if (incomeData.revenueByClient && incomeData.revenueByClient.length > 0) {
    // إيرادات العملاء
    incomeData.revenueByClient.forEach((client, clientIndex) => {
      const clientNumber = clientIndex + 1;
      data.push({
        id: `client-${clientIndex}`,
        name: `${client.clientName} : العميل ${clientNumber}`,
        amount: client.totalRevenue,
        type: "client-revenue",
        clientId: client.clientId,
        entries: client.entries,
        isClientName: true // للتمييز في الألوان
      });

      // حصة الشركة كصف منفصل إذا كانت موجودة
      if (client.companyRevenue && client.companyRevenue > 0) {
        data.push({
          id: `client-${clientIndex}-company-revenue`,
          name: "حصة الشركة",
          amount: client.companyRevenue,
          type: "revenue-breakdown",
          level: 2,
          isCompanyShare: true
        });
      }

      // حصة الشركاء كصف منفصل إذا كانت موجودة
      if (client.partnersRevenue && client.partnersRevenue > 0) {
        data.push({
          id: `client-${clientIndex}-partners-revenue`,
          name: "حصة الشركاء",
          amount: client.partnersRevenue,
          type: "revenue-breakdown",
          level: 2,
          isPartnersShare: true
        });
      }

      // تفاصيل الإدخالات دائماً مفتوحة
      if (client.entries && client.entries.length > 0) {
        client.entries.forEach((entry, entryIndex) => {
          data.push({
            id: `client-${clientIndex}-entry-${entryIndex}`,
            name: entry.description,
            amount: entry.rawShare || entry.amount,
            type: "revenue-detail",
            level: 3,
            date: entry.date,
            entryData: entry // حفظ بيانات الإدخال الكاملة
          });
        });
      }
    });

    // إجمالي حصة الشركة وحصة الشركاء
    const totalCompanyRevenue = incomeData.revenueByClient.reduce((sum, client) => sum + (client.companyRevenue || 0), 0);
    const totalPartnersRevenue = incomeData.revenueByClient.reduce((sum, client) => sum + (client.partnersRevenue || 0), 0);

    if (totalCompanyRevenue > 0) {
      data.push({
        id: 2.6,
        name: "إجمالي حصة الشركة",
        amount: totalCompanyRevenue,
        type: "revenue-distribution",
        isTotalCompanyShare: true
      });
    }

    if (totalPartnersRevenue > 0) {
      data.push({
        id: 2.7,
        name: "إجمالي حصة الشركاء",
        amount: totalPartnersRevenue,
        type: "revenue-distribution",
        isTotalPartnersShare: true
      });
    }
  }

  // إجمالي الإيرادات
  data.push({
    id: 2.5,
    name: "إجمالي إيرادات الفترة",
    amount: incomeData.revenues?.total || 0,
    type: "revenue-total"
  });

  return data;
};

// دالة للحصول على بيانات قسم المصروفات
const getExpenseData = (incomeData) => {
  if (!incomeData) return [];

  const data = [];

  // عنوان المصروفات
  data.push({
    id: 3,
    name: "المصروفات التشغيلية",
    type: "expense-header",
    level: 0,
    hasDetails: incomeData.detailedExpenses && incomeData.detailedExpenses.length > 0
  });

  // المصروفات التفصيلية دائماً مفتوحة
  if (incomeData.detailedExpenses && incomeData.detailedExpenses.length > 0) {
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

  // إجمالي المصروفات
  data.push({
    id: 100,
    name: "إجمالي المصروفات التشغيلية",
    amount: -(incomeData.totalExpenses || 0),
    type: "expense-total"
  });

  return data;
};

// دالة للحصول على بيانات النتيجة النهائية
const getFinalResultData = (incomeData) => {
  if (!incomeData) return [];

  return [{
    id: "final-profit",
    name: "صافي الربح القابل للتوزيع بعد الإغلاق",
    code: "FIN-FINAL",
    amount: incomeData.netProfit || 0,
    type: "final-profit",
    level: 0,
    isFinal: true
  }];
};

// دالة للحصول على جميع البيانات المجمعة للتصدير
const getAllData = (incomeData) => {
  const allData = [];

  // رأس المال
  const capitalData = getCapitalData(incomeData);
  allData.push(...capitalData);

  // فاصل
  allData.push({ id: 'spacer-1', type: "spacer" });

  // الإيرادات
  const revenueData = getRevenueData(incomeData);
  allData.push(...revenueData);

  // فاصل
  allData.push({ id: 'spacer-2', type: "spacer" });

  // المصروفات
  const expenseData = getExpenseData(incomeData);
  allData.push(...expenseData);

  // فاصل
  allData.push({ id: 'spacer-3', type: "spacer" });

  // النتيجة النهائية
  const finalData = getFinalResultData(incomeData);
  allData.push(...finalData);

  return allData;
};

// الحصول على لون الخلفية بناءً على نوع الصف
const getRowStyle = (row) => {
  // جعل أسماء العملاء بلون أخضر للتمييز
  if (row.isClientName) {
    return { textColor: [46, 139, 69] };
  }

  // جعل عناوين الأقسام بلون أخضر
  if (row.type === "revenue-header" || row.type === "expense-header") {
    return { textColor: [46, 139, 69] };
  }

  // إزالة جميع الألوان الأخرى
  return {};
};

// دالة للحصول على معلومات الفترة
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
  } else if (periodType === "yearly") {
    periodText = `السنة ${selectedYear}`;
    from = dayjs().year(selectedYear).startOf('year').format('YYYY-MM-DD');
    to = dayjs().year(selectedYear).endOf('year').format('YYYY-MM-DD');
    source = "YEAR";
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


// دالة لإضافة جدول قسم مع عنوانه
const addSectionTable = (doc, sectionData, sectionTitle, startY) => {
  if (!sectionData || sectionData.length === 0) return startY;

  // إضافة عنوان القسم إذا كان موجوداً
  let tableStartY = startY;
  if (sectionTitle && sectionTitle.trim()) {
    doc.setFontSize(12);
    doc.setFont('Amiri', 'bold');
    doc.setTextColor(46, 139, 69);
    const titleY = startY;
    doc.text(sectionTitle, doc.internal.pageSize.width / 2, titleY, { align: 'center' });
    tableStartY = titleY + 8;
  }

  // تحضير بيانات الجدول
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

    // إضافة الجدول
    autoTable(doc, {
      head: [['المبلغ', 'البند والتفاصيل', 'ملاحظات إضافية']],
      body: tableRows,
      startY: tableStartY,
      styles: {
        font: 'Amiri',
        fontSize: 10,
        cellPadding: 4,
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
      columnStyles: {
        0: {
          cellWidth: 45,
          halign: 'center',
          fontStyle: 'bold'
        },
        1: {
          cellWidth: 95,
          halign: 'center',
          fontStyle: 'bold'
        },
        2: {
          cellWidth: 50,
          halign: 'center',
          fontSize: 9,
          fontStyle: 'bold'
        }
      },
        margin: { left: 14, right: 14 },
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

          // ألوان خاصة للنتيجة النهائية
          if (row.isFinal) {
            data.cell.styles.textColor = row.amount >= 0 ? [46, 139, 69] : [220, 38, 38];
          }

          if (row.isHeader || row.isTotal || row.isFinal || row.level === 0 ||
              row.type === "client-revenue" || row.isCapitalAmount || row.isProfit) {
            data.cell.styles.fontStyle = 'bold';
            // جعل حجم الخط أكبر لاسماء العملاء
            if (row.type === "client-revenue") {
              data.cell.styles.fontSize = 11;
            }
          }

          // إزالة جميع الألوان الخاصة

          if (row.amount < 0 && !row.isHeader) {
            data.cell.styles.textColor = [220, 38, 38];
          }
        }
      }
    });

  return doc.lastAutoTable.finalY;
};

// تصدير PDF مع الهيكل الكامل
export const exportIncomeStatementToPDF = async (incomeData, periodType, selectedMonth, selectedYear, fromDate, toDate) => {
  // eslint-disable-next-line no-async-promise-executor
  return new Promise(async (resolve, reject) => {
    try {
      if (!incomeData) {
        throw new Error('لا توجد بيانات للتصدير');
      }

      const doc = new jsPDF('portrait');

      // Register Arabic fonts
      registerArabicFonts(doc);

      // Set Arabic as primary font
      doc.setFont('Amiri', 'bold');

      // Logo
      const logoWidth = 10;
      const logoHeight = 10;
      const logoX = doc.internal.pageSize.width - logoWidth - 5;
      const logoY = 5;
      doc.addImage(logo, 'PNG', logoX, logoY, logoWidth, logoHeight);

      const periodInfo = getPeriodInfo(incomeData, periodType, selectedMonth, selectedYear, fromDate, toDate);

      // Header
      doc.setFontSize(20);
      doc.setFont('Amiri', 'bold');
      doc.text('قائمة الدخل', doc.internal.pageSize.width / 2, 25, { align: 'center' });

      doc.setFontSize(14);
      doc.setFont('Amiri', 'bold');
      doc.text('تقرير مالي رسمي - أساس لتوزيع الأرباح على المساهمين', doc.internal.pageSize.width / 2, 35, { align: 'center' });

      // Period info
      if (periodInfo) {
        doc.setFontSize(12);
        doc.setFont('Amiri', 'bold');
        doc.text(`الفترة: ${periodInfo.text}`, doc.internal.pageSize.width / 2, 45, { align: 'center' });
      }

      doc.setFontSize(10);
      doc.setFont('Amiri', 'bold');
      doc.text(`تاريخ التصدير: ${dayjs().format('DD/MM/YYYY HH:mm')}`, doc.internal.pageSize.width / 2, 55, { align: 'center' });

      // Summary Cards Data
      const summaryData = [
        ['المبلغ', 'البيان'],
        [formatAmount(incomeData.totalCapital || 0), 'رأس المال الفعلي'],
        [formatAmount(incomeData.totalRevenue || 0), 'إجمالي الإيرادات']
      ];

      // Add revenue breakdown if available
      if (incomeData.revenues && incomeData.revenues.generalLoans > 0) {
        summaryData.push([formatAmount(incomeData.revenues.generalLoans), 'سلف عامة']);
      }
      if (incomeData.revenues && incomeData.revenues.newCapitalLoans > 0) {
        summaryData.push([formatAmount(incomeData.revenues.newCapitalLoans), 'سلف رأس مال جديد']);
      }

      // Add remaining summary items
      summaryData.push(
        [formatAmount(incomeData.totalExpenses || 0), 'المصروفات التشغيلية'],
        [formatAmount(Math.abs(incomeData.netProfit || 0)), incomeData.netProfit >= 0 ? 'صافي الربح' : 'صافي الخسارة']
      );

      // Summary table
      autoTable(doc, {
        head: [['المبلغ', 'البيان']],
        body: summaryData.slice(1),
        startY: 60,
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
        columnStyles: {
          0: {
            cellWidth: 60,
            halign: 'center'
          },
          1: {
            cellWidth: 120,
            halign: 'center'
          }
        },
        margin: { left: 14, right: 14 },
        pageBreak: 'avoid',
        rowPageBreak: 'avoid'
      });

      // إضافة جدول كامل يحتوي على جميع البيانات
      const allData = getAllData(incomeData);
      let currentY = (doc.lastAutoTable && doc.lastAutoTable.finalY) ? doc.lastAutoTable.finalY + 15 : 80;

      if (allData.length > 0) {
        addSectionTable(doc, allData, 'البيان التفصيلي الكامل', currentY);
      }

      // Footer
      const pageCount = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setFont('Amiri', 'bold');
        doc.text(`صفحة ${i} من ${pageCount}`, doc.internal.pageSize.width / 2, doc.internal.pageSize.height - 10, { align: 'center' });
      }

      // حفظ الملف
      const fileName = `قائمة_الدخل_${periodInfo ? periodInfo.text.replace(/[^a-zA-Z0-9\u0600-\u06FF]/g, '_') : 'تقرير'}_${dayjs().format('YYYY-MM-DD')}.pdf`;
      doc.save(fileName);

      resolve();
    } catch (error) {
      console.error('PDF export error:', error.message);
      reject(error);
    }
  });
};

// تصدير Excel مع الهيكل الكامل
export const exportIncomeStatementToExcel = async (incomeData, periodType, selectedMonth, selectedYear, fromDate, toDate) => {
  try {
    if (!incomeData) {
      throw new Error('لا توجد بيانات للتصدير');
    }

    const periodInfo = getPeriodInfo(incomeData, periodType, selectedMonth, selectedYear, fromDate, toDate);
    const tableData = getAllData(incomeData);

    // Lazy load XLSX library
    const XLSX = await import('xlsx');

    // Create workbook
    const workbook = XLSX.utils.book_new();

    // ============================================
    // Sheet 1: البيان التفصيلي الكامل
    // ============================================
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
        // تحديد المسافة البادئة بناءً على المستوى
        let name = row.name || '';
        if (row.level === 1) name = `  ${name}`;
        if (row.level === 2) name = `    ${name}`;
        
        // جمع المعلومات الإضافية
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
    
    // تطبيق أنماط الخلايا
    const range = XLSX.utils.decode_range(fullDetailedSheet['!ref']);
    for (let R = 0; R <= range.e.r; R++) {
      for (let C = 0; C <= range.e.c; C++) {
        const cellAddress = XLSX.utils.encode_cell({ r: R, c: C });
        const cell = fullDetailedSheet[cellAddress];
        
        if (cell) {
          // رأس الجدول
          if (R === 5) {
            cell.s = {
              fill: { fgColor: { rgb: "F0F0F0" } },
              font: { color: { rgb: "2E8B45" }, bold: true },
              alignment: { horizontal: "center" }
            };
          }
          
          // تحديد الصف في البيانات الأصلية
          const dataRowIndex = R - 6; // ناقص 6 لاستبعاد العناوين
          if (dataRowIndex >= 0 && dataRowIndex < tableData.length) {
            const rowData = tableData[dataRowIndex];
            
            // صفوف الرؤوس
            if (rowData.isHeader) {
              cell.s = {
                font: { color: { rgb: "2E8B45" }, bold: true },
                alignment: { horizontal: "center" }
              };
            }
            
            // إزالة الألوان الخاصة لرأس المال والأرباح

            // العناوين الرئيسية
            else if (rowData.type === "revenue-header" || rowData.type === "expense-header") {
              cell.s = {
                font: { color: { rgb: "2E8B45" }, bold: true },
                alignment: { horizontal: "center" }
              };
            }

            // المجاميع
            else if (rowData.isTotal) {
              cell.s = {
                fill: { fgColor: { rgb: "F5F5F5" } },
                font: { bold: true },
                alignment: { horizontal: "center" }
              };
            }
            
            // النتيجة النهائية
            else if (rowData.isFinal) {
              const textColor = rowData.amount >= 0 ? "2E8B45" : "DC2626";
              cell.s = {
                font: { color: { rgb: textColor }, bold: true },
                alignment: { horizontal: "center" }
              };
            }

            // المبالغ السالبة باللون الأحمر
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

    // ============================================
    // Sheet 2: ملخص قائمة الدخل
    // ============================================
    const summaryData = [
      ['قائمة الدخل - الملخص'],
      [''],
      ['الفترة', periodInfo ? periodInfo.text : 'غير محدد'],
      ['تاريخ التصدير', dayjs().format('DD/MM/YYYY HH:mm')],
      [''],
      ['المبلغ', 'البيان', 'الرمز']
    ];

    // Add capital
    summaryData.push([incomeData.totalCapital || 0, 'رأس المال الفعلي', 'CAP-001']);

    // Add total revenue
    summaryData.push([incomeData.totalRevenue || 0, 'إجمالي الإيرادات', 'REV-TOTAL']);

    // Add revenue breakdown if available
    if (incomeData.revenues && incomeData.revenues.generalLoans > 0) {
      summaryData.push([incomeData.revenues.generalLoans, 'سلف عامة', 'REV-GEN']);
    }
    if (incomeData.revenues && incomeData.revenues.newCapitalLoans > 0) {
      summaryData.push([incomeData.revenues.newCapitalLoans, 'سلف رأس مال جديد', 'REV-NEW-CAP']);
    }

    // Add expenses and net profit
    summaryData.push([incomeData.totalExpenses || 0, 'المصروفات التشغيلية', 'EXP-TOTAL']);
    summaryData.push([incomeData.netProfit || 0, incomeData.netProfit >= 0 ? 'صافي الربح' : 'صافي الخسارة', 'NET-PROFIT']);

    const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
    summarySheet['!cols'] = [
      { wch: 15 },
      { wch: 30 },
      { wch: 15 }
    ];
    XLSX.utils.book_append_sheet(workbook, summarySheet, 'ملخص');

    // ============================================
    // Sheet 3: رأس المال والمستثمرين
    // ============================================
    const capitalDetails = [
      ['تفاصيل رأس المال والمستثمرين'],
      [''],
      ['الفترة', periodInfo ? periodInfo.text : 'غير محدد'],
      ['تاريخ التصدير', dayjs().format('DD/MM/YYYY HH:mm')],
      [''],
      ['المبلغ', 'اسم المستثمر', 'التفاصيل', 'نوع رأس المال', 'نسبة الربح']
    ];

    // إضافة رأس المال الإجمالي
    capitalDetails.push([
      incomeData.totalCapital || 0,
      'إجمالي رأس المال المدفوع الفعلي',
      'CAP-001',
      ''
    ]);

    // إضافة تفاصيل المستثمرين
    if (incomeData.capitalByPartner && incomeData.capitalByPartner.length > 0) {
      capitalDetails.push(['', '', '', '']); // فاصل

      incomeData.capitalByPartner.forEach(partner => {
        capitalDetails.push([
          partner.capitalAmount || 0,
          partner.partnerName || '',
          'رأس المال الأصلي',
          'أصلي',
          `${partner.profitPercentage || 0}%`
        ]);

        // رأس المال الجديد
        if (partner.newCapitalAmount && partner.newCapitalAmount > 0) {
          capitalDetails.push([
            partner.newCapitalAmount || 0,
            partner.partnerName || '',
            'رأس المال الجديد',
            'جديد',
            `${partner.profitPercentage || 0}%`
          ]);
        }

        // الأرباح
        capitalDetails.push([
          partner.totalProfit || 0,
          partner.partnerName || '',
          'الأرباح',
          'أرباح',
          `${partner.profitPercentage || 0}%`
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

    // Generate Excel file
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

// دالة الطباعة مع الهيكل الكامل
export const printIncomeStatement = async (incomeData, periodType, selectedMonth, selectedYear, fromDate, toDate) => {
  return new Promise((resolve, reject) => {
    try {
      if (!incomeData) {
        throw new Error('لا توجد بيانات للطباعة');
      }

      const doc = new jsPDF('portrait');

      // Register Arabic fonts
      registerArabicFonts(doc);

      // Set Arabic as primary font
      doc.setFont('Amiri', 'bold');

      // Logo
      const logoWidth = 10;
      const logoHeight = 10;
      const logoX = doc.internal.pageSize.width - logoWidth - 5;
      const logoY = 5;
      doc.addImage(logo, 'PNG', logoX, logoY, logoWidth, logoHeight);

      const periodInfo = getPeriodInfo(incomeData, periodType, selectedMonth, selectedYear, fromDate, toDate);

      // Header
      doc.setFontSize(20);
      doc.setFont('Amiri', 'bold');
      doc.text('قائمة الدخل', doc.internal.pageSize.width / 2, 25, { align: 'center' });

      doc.setFontSize(14);
      doc.setFont('Amiri', 'bold');
      doc.text('تقرير مالي رسمي - أساس لتوزيع الأرباح على المساهمين', doc.internal.pageSize.width / 2, 35, { align: 'center' });

      // Period info
      if (periodInfo) {
        doc.setFontSize(12);
        doc.setFont('Amiri', 'bold');
        doc.text(`الفترة: ${periodInfo.text}`, doc.internal.pageSize.width / 2, 45, { align: 'center' });
      }

      doc.setFontSize(10);
      doc.setFont('Amiri', 'bold');
      doc.text(`تاريخ الطباعة: ${dayjs().format('DD/MM/YYYY HH:mm')}`, doc.internal.pageSize.width / 2, 55, { align: 'center' });

      // إضافة جدول كامل يحتوي على جميع البيانات
      const allData = getAllData(incomeData);

      if (allData.length > 0) {
        // نبدأ من بعد العناوين مباشرة - بدون عنوان للجدول
        addSectionTable(doc, allData, '', 60);
      }

      // Footer
      const pageCount = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setFont('Amiri', 'bold');
        doc.text(`صفحة ${i} من ${pageCount}`, doc.internal.pageSize.width / 2, doc.internal.pageSize.height - 10, { align: 'center' });
      }

      // Open print window
      const pdfBlob = doc.output('blob');
      const pdfUrl = URL.createObjectURL(pdfBlob);
      const printWindow = window.open(pdfUrl);

      if (printWindow) {
        printWindow.onload = function() {
          printWindow.print();
          setTimeout(() => {
            URL.revokeObjectURL(pdfUrl);
          }, 1000);
        };
        resolve();
      } else {
        reject(new Error('فشل في فتح نافذة الطباعة'));
      }

    } catch (error) {
      console.error('Print error:', error.message);
      reject(error);
    }
  });
};

