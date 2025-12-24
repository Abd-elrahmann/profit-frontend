import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
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

  // رأس جدول رأس المال
  if (incomeData.capitalByPartner && incomeData.capitalByPartner.length > 0) {
    data.push({
      id: "capital-header",
      name: "اسم المستثمر",
      code: "المبلغ",
      amount: null,
      type: "capital-table-header",
      level: 0,
      isHeader: true
    });

    // تفاصيل رأس المال
    incomeData.capitalByPartner.forEach((partner, index) => {
      data.push({
        id: `capital-detail-${index}`,
        name: partner.partnerName,
        code: `PRT-${partner.partnerId}`,
        amount: partner.capitalAmount,
        type: "capital-detail",
        level: 1,
        profitPercentage: partner.profitPercentage
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
    id: "revenue-section",
    name: "الإيرادات التشغيلية",
    type: "revenue-header",
    level: 0,
    hasDetails: incomeData.revenueByClient && incomeData.revenueByClient.length > 0
  });

  // رأس جدول الإيرادات
  if (incomeData.revenueByClient && incomeData.revenueByClient.length > 0) {
    data.push({
      id: "revenue-header",
      name: "اسم العميل",
      code: "المبلغ",
      amount: null,
      type: "revenue-table-header",
      level: 0,
      isHeader: true
    });

    // إيرادات العملاء
    incomeData.revenueByClient.forEach((client, clientIndex) => {
      // إيرادات العميل الرئيسية
      data.push({
        id: `client-${clientIndex}`,
        name: client.clientName,
        code: `REV-CLIENT-${clientIndex + 1}`,
        amount: client.totalAmount,
        type: "client-revenue",
        level: 1,
        clientId: client.clientId,
        hasEntries: client.entries && client.entries.length > 0,
        entries: client.entries
      });

      // تفاصيل إدخالات العميل
      if (client.entries && client.entries.length > 0) {
        client.entries.forEach((entry, entryIndex) => {
          data.push({
            id: `client-${clientIndex}-entry-${entryIndex}`,
            name: entry.description,
            code: `JRN-${entry.journalId}`,
            amount: entry.amount,
            type: "revenue-detail",
            level: 2,
            date: entry.date
          });
        });
      }
    });
  }

  // إجمالي الإيرادات
  data.push({
    id: "revenue-total",
    name: "إجمالي إيرادات الفترة",
    code: null,
    amount: incomeData.totalRevenue || 0,
    type: "revenue-total",
    level: 0,
    isTotal: true
  });

  return data;
};

// دالة للحصول على بيانات قسم المصروفات
const getExpenseData = (incomeData) => {
  if (!incomeData) return [];

  const data = [];

  // عنوان المصروفات
  data.push({
    id: "expense-section",
    name: "المصروفات التشغيلية",
    type: "expense-header",
    level: 0,
    hasDetails: incomeData.detailedExpenses && incomeData.detailedExpenses.length > 0
  });

  // إجمالي المصروفات دائماً
  data.push({
    id: "expense-total",
    name: "إجمالي المصروفات التشغيلية",
    code: null,
    amount: -(incomeData.totalExpenses || 0),
    type: "expense-total",
    level: 0,
    isTotal: true
  });

  // رأس جدول المصروفات والتفاصيل إذا كانت موجودة
  if (incomeData.detailedExpenses && incomeData.detailedExpenses.length > 0) {
    data.push({
      id: "expense-header",
      name: "وصف المصروف",
      code: "المبلغ",
      amount: null,
      type: "expense-table-header",
      level: 0,
      isHeader: true
    });

    // المصروفات التفصيلية
    incomeData.detailedExpenses.forEach((expense, index) => {
      data.push({
        id: `expense-${index}`,
        name: expense.description || expense.type,
        code: `EXP-${index + 1}`,
        amount: -Math.abs(expense.amount), // سالب لأنها مصروفات
        type: "expense",
        level: 1,
        expenseType: expense.type,
        employee: expense.employee,
        date: expense.createdAt
      });
    });
  }

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

// دالة لتحويل البيانات إلى هيكل الجدول الكامل (بنفس منطق الواجهة)
const getFullTableData = (incomeData) => {
  if (!incomeData) return [];

  const data = [];

  // === قسم رأس المال ===
  // رأس المال الإجمالي (مع إمكانية التوسيع)
  data.push({
    id: 0,
    name: "إجمالي رأس المال المدفوع الفعلي",
    code: "CAP-001",
    amount: incomeData.totalCapital || 0,
    type: "capital",
    level: 0,
    hasDetails: incomeData.capitalByPartner && incomeData.capitalByPartner.length > 0
  });

  // رأس جدول رأس المال (يظهر كصف منفصل)
  if (incomeData.capitalByPartner && incomeData.capitalByPartner.length > 0) {
    data.push({
      id: "capital-header",
      name: "اسم المستثمر",
      code: "المبلغ",
      amount: null,
      type: "capital-table-header",
      level: 0,
      isHeader: true
    });

    // تفاصيل رأس المال
    incomeData.capitalByPartner.forEach((partner, index) => {
      data.push({
        id: `capital-detail-${index}`,
        name: partner.partnerName,
        code: `PRT-${partner.partnerId}`,
        amount: partner.capitalAmount,
        type: "capital-detail",
        level: 1,
        profitPercentage: partner.profitPercentage
      });
    });
  }

  // إضافة مسافة
  data.push({ id: "spacer-1", type: "spacer", level: 0 });

  // === قسم الإيرادات ===
  // عنوان الإيرادات (مع إمكانية التوسيع)
  data.push({
    id: "revenue-section",
    name: "الإيرادات التشغيلية",
    type: "revenue-header",
    level: 0,
    hasDetails: incomeData.revenueByClient && incomeData.revenueByClient.length > 0
  });

  // رأس جدول الإيرادات
  if (incomeData.revenueByClient && incomeData.revenueByClient.length > 0) {
    data.push({
      id: "revenue-header",
      name: "اسم العميل",
      code: "المبلغ",
      amount: null,
      type: "revenue-table-header",
      level: 0,
      isHeader: true
    });

    // إيرادات العملاء
    incomeData.revenueByClient.forEach((client, clientIndex) => {
      // إيرادات العميل الرئيسية
      data.push({
        id: `client-${clientIndex}`,
        name: client.clientName,
        code: `REV-CLIENT-${clientIndex + 1}`,
        amount: client.totalAmount,
        type: "client-revenue",
        level: 1,
        clientId: client.clientId,
        hasEntries: client.entries && client.entries.length > 0,
        entries: client.entries
      });

      // تفاصيل إدخالات العميل (جميعها مفردة)
      if (client.entries && client.entries.length > 0) {
        client.entries.forEach((entry, entryIndex) => {
          data.push({
            id: `client-${clientIndex}-entry-${entryIndex}`,
            name: entry.description,
            code: `JRN-${entry.journalId}`,
            amount: entry.amount,
            type: "revenue-detail",
            level: 2,
            date: entry.date
          });
        });
      }
    });
  }

  // إجمالي الإيرادات
  data.push({
    id: "revenue-total",
    name: "إجمالي إيرادات الفترة",
    code: null,
    amount: incomeData.totalRevenue || 0,
    type: "revenue-total",
    level: 0,
    isTotal: true
  });

  // إضافة مسافة
  data.push({ id: "spacer-2", type: "spacer", level: 0 });

  // === قسم المصروفات ===
  // عنوان المصروفات (مع إمكانية التوسيع)
  data.push({
    id: "expense-section",
    name: "المصروفات التشغيلية",
    type: "expense-header",
    level: 0,
    hasDetails: incomeData.detailedExpenses && incomeData.detailedExpenses.length > 0
  });

  // رأس جدول المصروفات
  if (incomeData.detailedExpenses && incomeData.detailedExpenses.length > 0) {
    data.push({
      id: "expense-header",
      name: "وصف المصروف",
      code: "المبلغ",
      amount: null,
      type: "expense-table-header",
      level: 0,
      isHeader: true
    });

    // المصروفات التفصيلية
    incomeData.detailedExpenses.forEach((expense, index) => {
      data.push({
        id: `expense-${index}`,
        name: expense.description || expense.type,
        code: `EXP-${index + 1}`,
        amount: -Math.abs(expense.amount), // سالب لأنها مصروفات
        type: "expense",
        level: 1,
        expenseType: expense.type,
        employee: expense.employee,
        date: expense.createdAt
      });
    });
  }

  // إجمالي المصروفات
  data.push({
    id: "expense-total",
    name: "إجمالي المصروفات التشغيلية",
    code: null,
    amount: -(incomeData.totalExpenses || 0),
    type: "expense-total",
    level: 0,
    isTotal: true
  });

  // إضافة مسافة
  data.push({ id: "spacer-3", type: "spacer", level: 0 });

  // === النتيجة النهائية ===
  data.push({
    id: "final-profit",
    name: "صافي الربح القابل للتوزيع بعد الإغلاق",
    code: "FIN-FINAL",
    amount: incomeData.netProfit || 0,
    type: "final-profit",
    level: 0,
    isFinal: true
  });

  return data;
};

// الحصول على لون الخلفية بناءً على نوع الصف
const getRowStyle = (row) => {
  if (row.isHeader) {
    return { fillColor: [240, 240, 240], textColor: [46, 139, 69] };
  }
  if (row.type === "revenue-header" || row.type === "expense-header") {
    return { fillColor: [240, 240, 240] };
  }
  if (row.type === "revenue-total" || row.type === "expense-total") {
    return { fillColor: [240, 240, 240] };
  }
  if (row.isTotal) {
    return { fillColor: [240, 240, 240] };
  }
  if (row.isFinal) {
    return { fillColor: row.amount >= 0 ? [46, 139, 69] : [220, 38, 38] };
  }
  // تبسيط الألوان للمستويات المختلفة
  if (row.level === 1 || row.level === 2) {
    return { fillColor: [250, 250, 250] };
  }
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

// دالة للتحقق من وجود مساحة كافية في الصفحة
const checkPageSpace = (doc, requiredHeight) => {
  const pageHeight = doc.internal.pageSize.height;
  const currentY = doc.lastAutoTable ? doc.lastAutoTable.finalY : 60;
  const remainingSpace = pageHeight - currentY - 20; // 20px margin

  if (remainingSpace < requiredHeight) {
    doc.addPage();
    return 20; // إعادة تعيين Y إلى أعلى الصفحة الجديدة
  }
  return currentY + 10;
};

// دالة لإضافة جدول قسم مع عنوانه
const addSectionTable = (doc, sectionData, sectionTitle, startY) => {
  if (!sectionData || sectionData.length === 0) return startY;

  // إضافة عنوان القسم
  doc.setFontSize(14);
  doc.setFont('Amiri', 'bold');
  doc.setTextColor(46, 139, 69);
  const titleY = startY;
  doc.text(sectionTitle, doc.internal.pageSize.width / 2, titleY, { align: 'center' });

  // تحضير بيانات الجدول
  const tableRows = [];
  sectionData.forEach(row => {
    if (row.type === "spacer") {
      tableRows.push(['', '', '']);
    } else {
      let name = row.name || '';
      if (row.level === 1) name = `   ${name}`;
      if (row.level === 2) name = `      ${name}`;

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
    startY: titleY + 10,
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
    rowPageBreak: 'avoid',
    didParseCell: function(data) {
      const rowIndex = data.row.index;
      const row = sectionData[rowIndex];

      if (row) {
        const style = getRowStyle(row);
        if (style.fillColor) {
          data.cell.styles.fillColor = style.fillColor;
        }
        if (style.textColor) {
          data.cell.styles.textColor = style.textColor;
        }

        if (row.isHeader || row.isTotal || row.isFinal || row.level === 0) {
          data.cell.styles.fontStyle = 'bold';
        }

        if (row.isFinal) {
          data.cell.styles.textColor = [255, 255, 255];
        }

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
        [formatAmount(incomeData.totalRevenue || 0), 'إجمالي الإيرادات'],
        [formatAmount(incomeData.totalExpenses || 0), 'المصروفات التشغيلية'],
        [formatAmount(Math.abs(incomeData.netProfit || 0)), incomeData.netProfit >= 0 ? 'صافي الربح' : 'صافي الخسارة']
      ];

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
        margin: { left: 14, right: 14 }
      });

      // إضافة جداول الأقسام المختلفة
      let currentY = doc.lastAutoTable.finalY + 15;

      // قسم رأس المال
      const capitalData = getCapitalData(incomeData);
      if (capitalData.length > 0) {
        currentY = checkPageSpace(doc, 50) + 10;
        addSectionTable(doc, capitalData, 'رأس المال والمستثمرين', currentY);
      }

      // قسم الإيرادات
      const revenueData = getRevenueData(incomeData);
      if (revenueData.length > 0) {
        currentY = checkPageSpace(doc, 50) + 15;
        addSectionTable(doc, revenueData, 'الإيرادات التشغيلية', currentY);
      }

      // قسم المصروفات
      const expenseData = getExpenseData(incomeData);
      if (expenseData.length > 0) {
        // حساب المساحة المطلوبة بناءً على عدد الصفوف (كل صف يحتاج ~8px)
        const estimatedRows = expenseData.length;
        const estimatedHeight = Math.min(estimatedRows * 8 + 40, 150); // حد أقصى 150px
        currentY = checkPageSpace(doc, estimatedHeight) + 15;
        addSectionTable(doc, expenseData, 'المصروفات التشغيلية', currentY);
      }

      // النتيجة النهائية
      const finalData = getFinalResultData(incomeData);
      if (finalData.length > 0) {
        currentY = checkPageSpace(doc, 30) + 15;
        // إضافة النتيجة النهائية بدون هيدر جدول
        const finalItem = finalData[0];
        doc.setFontSize(14);
        doc.setFont('Amiri', 'bold');
        doc.setTextColor(46, 139, 69);
        doc.text(finalItem.name, doc.internal.pageSize.width / 2, currentY, { align: 'center' });

        // إضافة تفسير الحساب في أسطر منفصلة
        doc.setFontSize(12);
        doc.setFont('Amiri', 'bold');
        doc.setTextColor(0, 0, 0);

        // السطر الأول: إجمالي الإيرادات
        const revenueText = `إجمالي الإيرادات = ${formatAmount(incomeData.totalRevenue || 0)}`;
        doc.text(revenueText, doc.internal.pageSize.width / 2, currentY + 12, { align: 'center' });

        // السطر الثاني: المصروفات التشغيلية
        const expenseText = `المصروفات التشغيلية = ${formatAmount(incomeData.totalExpenses || 0)}`;
        doc.text(expenseText, doc.internal.pageSize.width / 2, currentY + 20, { align: 'center' });

        // السطر الثالث: النتيجة النهائية
        doc.setFontSize(16);
        doc.setFont('Amiri', 'bold');
        const amountColor = finalItem.amount >= 0 ? [46, 139, 69] : [220, 38, 38];
        doc.setTextColor(amountColor[0], amountColor[1], amountColor[2]);
        const resultText = `صافي الربح = ${formatAmount(finalItem.amount)}`;
        doc.text(resultText, doc.internal.pageSize.width / 2, currentY + 32, { align: 'center' });
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
    const tableData = getFullTableData(incomeData);

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
                fill: { fgColor: { rgb: "F0F0F0" } },
                font: { color: { rgb: "2E8B45" }, bold: true },
                alignment: { horizontal: "center" }
              };
            }
            
            // العناوين الرئيسية
            else if (rowData.type === "revenue-header" || rowData.type === "expense-header") {
              const bgColor = rowData.type === "revenue-header" ? "DCFCE7" : "FEE2E2";
              cell.s = {
                fill: { fgColor: { rgb: bgColor } },
                font: { bold: true },
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
              const bgColor = rowData.amount >= 0 ? "2E8B45" : "DC2626";
              cell.s = {
                fill: { fgColor: { rgb: bgColor } },
                font: { color: { rgb: "FFFFFF" }, bold: true },
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
      ['المبلغ', 'البيان', 'الرمز'],
      [incomeData.totalCapital || 0, 'رأس المال الفعلي', 'CAP-001'],
      [incomeData.totalRevenue || 0, 'إجمالي الإيرادات', 'REV-TOTAL'],
      [incomeData.totalExpenses || 0, 'المصروفات التشغيلية', 'EXP-TOTAL'],
      [incomeData.netProfit || 0, incomeData.netProfit >= 0 ? 'صافي الربح' : 'صافي الخسارة', 'NET-PROFIT']
    ];

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
      ['المبلغ', 'اسم المستثمر', 'الرمز المرجعي', 'نسبة الربح']
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
          `PRT-${partner.partnerId}`,
          `${partner.profitPercentage || 0}%`
        ]);
      });
    }

    const capitalSheet = XLSX.utils.aoa_to_sheet(capitalDetails);
    capitalSheet['!cols'] = [
      { wch: 15 },
      { wch: 30 },
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

      // إضافة جداول الأقسام المختلفة للطباعة
      let currentY = 65;

      // قسم رأس المال
      const capitalData = getCapitalData(incomeData);
      if (capitalData.length > 0) {
        currentY = checkPageSpace(doc, 50) + 10;
        addSectionTable(doc, capitalData, 'رأس المال والمستثمرين', currentY);
      }

      // قسم الإيرادات
      const revenueData = getRevenueData(incomeData);
      if (revenueData.length > 0) {
        currentY = checkPageSpace(doc, 50) + 15;
        addSectionTable(doc, revenueData, 'الإيرادات التشغيلية', currentY);
      }

      // قسم المصروفات
      const expenseData = getExpenseData(incomeData);
      if (expenseData.length > 0) {
        // حساب المساحة المطلوبة بناءً على عدد الصفوف (كل صف يحتاج ~8px)
        const estimatedRows = expenseData.length;
        const estimatedHeight = Math.min(estimatedRows * 8 + 40, 150); // حد أقصى 150px
        currentY = checkPageSpace(doc, estimatedHeight) + 15;
        addSectionTable(doc, expenseData, 'المصروفات التشغيلية', currentY);
      }

      // النتيجة النهائية
      const finalData = getFinalResultData(incomeData);
      if (finalData.length > 0) {
        currentY = checkPageSpace(doc, 30) + 15;
        // إضافة النتيجة النهائية بدون هيدر جدول
        const finalItem = finalData[0];
        doc.setFontSize(14);
        doc.setFont('Amiri', 'bold');
        doc.setTextColor(46, 139, 69);
        doc.text(finalItem.name, doc.internal.pageSize.width / 2, currentY, { align: 'center' });

        // إضافة تفسير الحساب في أسطر منفصلة
        doc.setFontSize(12);
        doc.setFont('Amiri', 'bold');
        doc.setTextColor(0, 0, 0);

        // السطر الأول: إجمالي الإيرادات
        const revenueText = `إجمالي الإيرادات = ${formatAmount(incomeData.totalRevenue || 0)}`;
        doc.text(revenueText, doc.internal.pageSize.width / 2, currentY + 12, { align: 'center' });

        // السطر الثاني: المصروفات التشغيلية
        const expenseText = `المصروفات التشغيلية = ${formatAmount(incomeData.totalExpenses || 0)}`;
        doc.text(expenseText, doc.internal.pageSize.width / 2, currentY + 20, { align: 'center' });

        // السطر الثالث: النتيجة النهائية
        doc.setFontSize(16);
        doc.setFont('Amiri', 'bold');
        const amountColor = finalItem.amount >= 0 ? [46, 139, 69] : [220, 38, 38];
        doc.setTextColor(amountColor[0], amountColor[1], amountColor[2]);
        const resultText = `صافي الربح = ${formatAmount(finalItem.amount)}`;
        doc.text(resultText, doc.internal.pageSize.width / 2, currentY + 32, { align: 'center' });
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