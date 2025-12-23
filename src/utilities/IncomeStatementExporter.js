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

// تنسيق الأرقام مع الأقواس للقيم السلبية
const formatAmount = (amount) => {
  if (amount < 0) {
    return `(${new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(Math.abs(amount || 0))})`;
  }
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Math.abs(amount || 0));
};

// دالة لتحويل البيانات إلى هيكل الجدول (نفس المنطق في incomeStatement.jsx)
const getTableData = (incomeData) => {
  if (!incomeData) return [];

  const data = [];

  // === قسم رأس المال ===
  data.push({
    id: "capital-section",
    name: "رأس المال",
    type: "section-header",
    section: "capital"
  });

  // رأس المال الإجمالي
  data.push({
    id: 0,
    name: "إجمالي رأس المال المدفوع الفعلي",
    code: "CAP-001",
    amount: incomeData.totalCapital || 0,
    type: "capital",
  });

  // تفاصيل المستثمرين
  if (incomeData.capitalByPartner && incomeData.capitalByPartner.length > 0) {
    data.push({
      id: "capital-partners-header",
      name: "تفاصيل المستثمرين",
      type: "subsection-header"
    });

    incomeData.capitalByPartner.forEach((partner, index) => {
      data.push({
        id: `capital-partner-${index}`,
        name: partner.partnerName,
        code: `PRT-${partner.partnerId}`,
        amount: partner.capitalAmount,
        type: "capital-detail",
        profitPercentage: partner.profitPercentage,
        section: "capital"
      });
    });
  }

  // إضافة مسافة بين الأقسام
  data.push({ id: "capital-spacer", type: "section-spacer" });

  // === قسم الإيرادات ===
  data.push({
    id: "revenue-section",
    name: "الإيرادات التشغيلية",
    type: "section-header",
    section: "revenue"
  });

  // إيرادات العملاء
  if (incomeData.revenueByClient && incomeData.revenueByClient.length > 0) {
    incomeData.revenueByClient.forEach((client, clientIndex) => {
      // إيرادات العميل
      data.push({
        id: `client-${clientIndex}`,
        name: client.clientName,
        code: `REV-CLIENT-${clientIndex + 1}`,
        amount: client.totalAmount,
        type: "client-revenue",
        clientId: client.clientId,
        entries: client.entries,
        section: "revenue"
      });

      // تفاصيل إدخالات العميل
      client.entries.forEach((entry, entryIndex) => {
        data.push({
          id: `client-${clientIndex}-entry-${entryIndex}`,
          name: entry.description,
          code: `JRN-${entry.journalId}`,
          amount: entry.amount,
          type: "revenue-detail",
          indent: true,
          date: entry.date,
          section: "revenue"
        });
      });
    });
  }

  // إجمالي الإيرادات
  data.push({
    id: 2.5,
    name: "إجمالي إيرادات الفترة",
    amount: incomeData.totalRevenue || 0,
    type: "revenue-total",
    section: "revenue"
  });

  // إضافة مسافة بين الأقسام
  data.push({ id: "revenue-spacer", type: "section-spacer" });

  // === قسم المصروفات ===
  data.push({
    id: "expense-section",
    name: "المصروفات التشغيلية",
    type: "section-header",
    section: "expense"
  });

  // المصروفات التفصيلية
  if (incomeData.detailedExpenses && incomeData.detailedExpenses.length > 0) {
    incomeData.detailedExpenses.forEach((expense, index) => {
      data.push({
        id: 4 + index,
        name: expense.description || expense.type,
        code: `EXP-${index + 1}`,
        amount: -Math.abs(expense.amount), // سالب لأنها مصروفات
        type: "expense",
        expenseType: expense.type,
        employee: expense.employee,
        date: expense.createdAt,
        section: "expense"
      });
    });
  }

  // إجمالي المصروفات
  data.push({
    id: 100,
    name: "إجمالي المصروفات التشغيلية",
    amount: -(incomeData.totalExpenses || 0),
    type: "expense-total",
    section: "expense"
  });

  // إضافة مسافة بين الأقسام
  data.push({ id: "expense-spacer", type: "section-spacer" });

  // === قسم النتيجة النهائية ===
  data.push({
    id: "final-section",
    name: "النتيجة النهائية",
    type: "section-header",
    section: "final"
  });

  // صافي الربح النهائي
  data.push({
    id: 101,
    name: "صافي الربح القابل للتوزيع بعد الإغلاق",
    code: "FIN-FINAL",
    amount: incomeData.netProfit || 0,
    type: "final-profit",
    section: "final"
  });

  return data;
};

// دالة للحصول على معلومات الفترة
const getPeriodInfo = (incomeData, periodType, selectedMonth, selectedYear, fromDate, toDate) => {
  // استخدام المعلمات المُمررة مباشرة بدلاً من الاعتماد على البيانات من الخادم
  let periodText = "";
  let from = null;
  let to = null;
  let source = periodType?.toUpperCase() || "UNKNOWN";

  if (periodType === "custom") {
    // استخدام التواريخ المخصصة
    periodText = `من ${fromDate.format('DD/MM/YYYY')} إلى ${toDate.format('DD/MM/YYYY')}`;
    from = fromDate.format('YYYY-MM-DD');
    to = toDate.format('YYYY-MM-DD');
    source = "CUSTOM";
  } else if (periodType === "monthly") {
    // استخدام الشهر والسنة المحددة
    periodText = `${getArabicMonth(selectedMonth + 1)} ${selectedYear}`;
    // حساب بداية ونهاية الشهر
    const startOfMonth = dayjs().year(selectedYear).month(selectedMonth).startOf('month');
    const endOfMonth = dayjs().year(selectedYear).month(selectedMonth).endOf('month');
    from = startOfMonth.format('YYYY-MM-DD');
    to = endOfMonth.format('YYYY-MM-DD');
    source = "MONTH";
  } else if (periodType === "yearly") {
    // سنوي - السنة الكاملة
    periodText = `السنة ${selectedYear}`;
    from = dayjs().year(selectedYear).startOf('year').format('YYYY-MM-DD');
    to = dayjs().year(selectedYear).endOf('year').format('YYYY-MM-DD');
    source = "YEAR";
  } else {
    // في حالة عدم وجود فلتر محدد، استخدام البيانات من الخادم كاحتياط
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

// تصدير PDF
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
      const tableData = getTableData(incomeData);

      // Header
      doc.setFontSize(18);
      doc.setFont('Amiri', 'bold');
      doc.text('قائمة الدخل', doc.internal.pageSize.width / 2, 20, { align: 'center' });

      doc.setFontSize(12);
      doc.setFont('Amiri', 'bold');
      doc.text('تقرير مالي رسمي - أساس لتوزيع الأرباح على المساهمين', doc.internal.pageSize.width / 2, 30, { align: 'center' });

      // Period info
      if (periodInfo) {
        doc.setFontSize(10);
        doc.setFont('Amiri', 'bold');
        doc.text(`الفترة: ${periodInfo.text}`, doc.internal.pageSize.width / 2, 40, { align: 'center' });
      }

      doc.setFontSize(8);
      doc.setFont('Amiri', 'bold');
      doc.text(`تاريخ التصدير: ${dayjs().format('DD/MM/YYYY HH:mm')}`, doc.internal.pageSize.width / 2, 50, { align: 'center' });

      // Summary Cards Data
      const summaryData = [
        ['المبلغ', 'البيان'],
        [formatAmount(incomeData.totalCapital || 0), 'رأس المال الفعلي'],
        [formatAmount(incomeData.totalRevenue || 0), 'إجمالي الإيرادات'],
        [formatAmount(incomeData.totalExpenses || 0), 'المصروفات التشغيلية'],
        [formatAmount(Math.abs(incomeData.netProfit || 0)), incomeData.netProfit >= 0 ? 'صافي الربح' : 'صافي الخسارة']
      ];

      // Summary table - نفس ألوان الجدول الثاني
      autoTable(doc, {
        head: [['المبلغ', 'البيان']],
        body: summaryData.slice(1),
        startY: 60,
        styles: {
          font: 'Amiri',
          fontSize: 9,
          cellPadding: 3,
          halign: 'center',
          valign: 'middle',
          direction: 'rtl'
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
          direction: 'rtl'
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

      // Detailed Statement - مفصول حسب الأقسام
      let currentY = doc.lastAutoTable.finalY + 20;

      // دالة لإنشاء جدول لقسم معين
      const createSectionTable = (sectionName, sectionData, startY) => {
        if (sectionData.length === 0) return startY;

        // عنوان القسم
        doc.setFontSize(12);
        doc.setFont('Amiri', 'bold');
        doc.setTextColor(46, 139, 69);
        doc.text(sectionName, doc.internal.pageSize.width / 2, startY + 10, { align: 'center' });

        const sectionTableData = sectionData.map(row => {
          // إزالة الأقواس من المصاريف - عرض المبالغ السلبية بدون أقواس
          const formattedAmount = formatAmount(row.amount);
          return [
            formattedAmount,
            row.name || ''
          ];
        });

        autoTable(doc, {
          head: [['المبلغ', 'البند']],
          body: sectionTableData,
          startY: startY + 15,
          styles: {
            font: 'Amiri',
            fontSize: 8,
            cellPadding: 3,
            halign: 'center',
            valign: 'middle',
            direction: 'rtl'
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
            direction: 'rtl'
          },
          columnStyles: {
            0: {
              cellWidth: 50,
              halign: 'center'
            },
            1: {
              cellWidth: 130,
              halign: 'center'
            }
          },
          margin: { left: 14, right: 14 }
        });

        return doc.lastAutoTable.finalY + 10;
      };

      // قسم رأس المال
      const capitalData = tableData.filter(row =>
        row.section === 'capital' && !['section-header', 'subsection-header'].includes(row.type)
      );
      if (capitalData.length > 0) {
        currentY = createSectionTable('رأس المال', capitalData, currentY);
      }

      // قسم الإيرادات
      const revenueData = tableData.filter(row =>
        row.section === 'revenue' && !['section-header'].includes(row.type)
      );
      if (revenueData.length > 0) {
        currentY = createSectionTable('الإيرادات التشغيلية', revenueData, currentY);
      }

      // قسم المصروفات
      const expenseData = tableData.filter(row =>
        row.section === 'expense' && !['section-header'].includes(row.type)
      );
      if (expenseData.length > 0) {
        currentY = createSectionTable('المصروفات التشغيلية', expenseData, currentY);
      }

      // قسم النتيجة النهائية
      const finalData = tableData.filter(row =>
        row.section === 'final' && !['section-header'].includes(row.type)
      );
      if (finalData.length > 0) {
        currentY = createSectionTable('النتيجة النهائية', finalData, currentY);
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

// تصدير Excel
export const exportIncomeStatementToExcel = async (incomeData, periodType, selectedMonth, selectedYear, fromDate, toDate) => {
  try {
    if (!incomeData) {
      throw new Error('لا توجد بيانات للتصدير');
    }

    const periodInfo = getPeriodInfo(incomeData, periodType, selectedMonth, selectedYear, fromDate, toDate);
    const tableData = getTableData(incomeData);

    // Create workbook
    const workbook = XLSX.utils.book_new();

    // ============================================
    // Sheet 1: ملخص قائمة الدخل
    // ============================================
    const summaryData = [
      ['قائمة الدخل - الملخص'],
      [''],
      ['الفترة', periodInfo ? periodInfo.text : 'غير محدد'],
      ['تاريخ التصدير', dayjs().format('DD/MM/YYYY HH:mm')],
      [''],
      ['المبلغ', 'البيان'],
      [incomeData.totalCapital || 0, 'رأس المال الفعلي'],
      [incomeData.totalRevenue || 0, 'إجمالي الإيرادات'],
      [incomeData.totalExpenses || 0, 'المصروفات التشغيلية'],
      [incomeData.netProfit || 0, incomeData.netProfit >= 0 ? 'صافي الربح' : 'صافي الخسارة']
    ];

    const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
    summarySheet['!cols'] = [{ wch: 20 }, { wch: 30 }];
    XLSX.utils.book_append_sheet(workbook, summarySheet, 'ملخص');

    // ============================================
    // Sheet 2: البيان التفصيلي
    // ============================================
    const detailedData = [
      ['قائمة الدخل - البيان التفصيلي'],
      [''],
      ['الفترة', periodInfo ? periodInfo.text : 'غير محدد'],
      ['تاريخ التصدير', dayjs().format('DD/MM/YYYY HH:mm')],
      ['']
    ];

    // إضافة بيانات كل قسم
    const sections = [
      { name: 'رأس المال', filter: row => row.section === 'capital' },
      { name: 'الإيرادات', filter: row => row.section === 'revenue' },
      { name: 'المصروفات', filter: row => row.section === 'expense' },
      { name: 'النتيجة النهائية', filter: row => row.section === 'final' }
    ];

    sections.forEach(section => {
      const sectionRows = tableData.filter(row =>
        section.filter(row) && !['section-header', 'subsection-header', 'section-spacer'].includes(row.type)
      );

      if (sectionRows.length > 0) {
        detailedData.push([`${section.name}:`]);
        detailedData.push(['المبلغ', 'البند', 'التاريخ']);

        sectionRows.forEach(row => {
          detailedData.push([
            row.amount || 0,
            row.name || '',
            row.date ? dayjs(row.date).format('DD/MM/YYYY') : ''
          ]);
        });

        detailedData.push(['', '', '']); // فاصل بين الأقسام
      }
    });

    const detailedSheet = XLSX.utils.aoa_to_sheet(detailedData);
    detailedSheet['!cols'] = [
      { wch: 15 },
      { wch: 40 },
      { wch: 15 }
    ];
    XLSX.utils.book_append_sheet(workbook, detailedSheet, 'البيان التفصيلي');

    // ============================================
    // Sheet 3: رأس المال والمستثمرين
    // ============================================
    const capitalData = [
      ['رأس المال والمستثمرين'],
      [''],
      ['الفترة', periodInfo ? periodInfo.text : 'غير محدد'],
      ['تاريخ التصدير', dayjs().format('DD/MM/YYYY HH:mm')],
      [''],
      ['المبلغ', 'البند', 'نسبة الربح']
    ];

    // إضافة رأس المال الإجمالي
    capitalData.push([
      incomeData.totalCapital || 0,
      'إجمالي رأس المال المدفوع الفعلي',
      ''
    ]);

    // إضافة تفاصيل المستثمرين
    if (incomeData.capitalByPartner && incomeData.capitalByPartner.length > 0) {
      capitalData.push(['', '', '']); // فاصل
      capitalData.push(['تفاصيل المستثمرين:', '', '']);

      incomeData.capitalByPartner.forEach(partner => {
        capitalData.push([
          partner.capitalAmount || 0,
          partner.partnerName || '',
          `${partner.profitPercentage || 0}%`
        ]);
      });
    }

    const capitalSheet = XLSX.utils.aoa_to_sheet(capitalData);
    capitalSheet['!cols'] = [
      { wch: 15 },
      { wch: 30 },
      { wch: 15 }
    ];
    XLSX.utils.book_append_sheet(workbook, capitalSheet, 'رأس المال');

    // ============================================
    // Sheet 4: إيرادات العملاء
    // ============================================
    if (incomeData.revenueByClient && incomeData.revenueByClient.length > 0) {
      const clientRevenueData = [
        ['إيرادات العملاء'],
        [''],
        ['الفترة', periodInfo ? periodInfo.text : 'غير محدد'],
        ['تاريخ التصدير', dayjs().format('DD/MM/YYYY HH:mm')],
        [''],
        ['المبلغ', 'اسم العميل', 'عدد الإدخالات']
      ];

      incomeData.revenueByClient.forEach(client => {
        clientRevenueData.push([
          client.totalAmount || 0,
          client.clientName || '',
          client.entries ? client.entries.length : 0
        ]);

        // إضافة تفاصيل الإدخالات
        if (client.entries && client.entries.length > 0) {
          client.entries.forEach(entry => {
            clientRevenueData.push([
              entry.amount || 0,
              `  - ${entry.description || ''}`,
              '',
              dayjs(entry.date).format('DD/MM/YYYY')
            ]);
          });
          clientRevenueData.push(['', '', '', '']); // فاصل
        }
      });

      const clientRevenueSheet = XLSX.utils.aoa_to_sheet(clientRevenueData);
      clientRevenueSheet['!cols'] = [
        { wch: 15 },
        { wch: 30 },
        { wch: 15 },
        { wch: 15 }
      ];
      XLSX.utils.book_append_sheet(workbook, clientRevenueSheet, 'إيرادات العملاء');
    }

    // ============================================
    // Sheet 5: المصروفات التفصيلية
    // ============================================
    if (incomeData.detailedExpenses && incomeData.detailedExpenses.length > 0) {
      const expensesData = [
        ['المصروفات التفصيلية'],
        [''],
        ['الفترة', periodInfo ? periodInfo.text : 'غير محدد'],
        ['تاريخ التصدير', dayjs().format('DD/MM/YYYY HH:mm')],
        [''],
        ['المبلغ', 'الوصف', 'النوع', 'الموظف', 'التاريخ']
      ];

      incomeData.detailedExpenses.forEach(expense => {
        expensesData.push([
          expense.amount || 0,
          expense.description || expense.type || '',
          expense.type || '',
          expense.employee || '',
          expense.createdAt ? dayjs(expense.createdAt).format('DD/MM/YYYY') : ''
        ]);
      });

      const expensesSheet = XLSX.utils.aoa_to_sheet(expensesData);
      expensesSheet['!cols'] = [
        { wch: 15 },
        { wch: 30 },
        { wch: 20 },
        { wch: 20 },
        { wch: 15 }
      ];
      XLSX.utils.book_append_sheet(workbook, expensesSheet, 'المصروفات');
    }

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

// دالة الطباعة
export const printIncomeStatement = async (incomeData, periodType, selectedMonth, selectedYear, fromDate, toDate) => {
  return new Promise((resolve, reject) => {
    try {
      // Validate data
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
      const tableData = getTableData(incomeData);

      // Header
      doc.setFontSize(18);
      doc.setFont('Amiri', 'bold');
      doc.text('قائمة الدخل', doc.internal.pageSize.width / 2, 20, { align: 'center' });

      doc.setFontSize(12);
      doc.setFont('Amiri', 'bold');
      doc.text('تقرير مالي رسمي - أساس لتوزيع الأرباح على المساهمين', doc.internal.pageSize.width / 2, 30, { align: 'center' });

      // Period info
      if (periodInfo) {
        doc.setFontSize(10);
        doc.setFont('Amiri', 'bold');
        doc.text(`الفترة: ${periodInfo.text}`, doc.internal.pageSize.width / 2, 40, { align: 'center' });
      }

      doc.setFontSize(8);
      doc.setFont('Amiri', 'bold');
      doc.text(`تاريخ الطباعة: ${dayjs().format('DD/MM/YYYY HH:mm')}`, doc.internal.pageSize.width / 2, 50, { align: 'center' });

      // Summary Cards Data
      const summaryData = [
        ['المبلغ', 'البيان'],
        [formatAmount(incomeData.totalCapital || 0), 'رأس المال الفعلي'],
        [formatAmount(incomeData.totalRevenue || 0), 'إجمالي الإيرادات'],
        [formatAmount(incomeData.totalExpenses || 0), 'المصروفات التشغيلية'],
        [formatAmount(Math.abs(incomeData.netProfit || 0)), incomeData.netProfit >= 0 ? 'صافي الربح' : 'صافي الخسارة']
      ];

      // Summary table - نفس ألوان الجدول الثاني
      autoTable(doc, {
        head: [['المبلغ', 'البيان']],
        body: summaryData.slice(1),
        startY: 60,
        styles: {
          font: 'Amiri',
          fontSize: 10,
          cellPadding: 4,
          halign: 'center',
          valign: 'middle',
          direction: 'rtl'
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
          direction: 'rtl'
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

      // Detailed Statement - مفصول حسب الأقسام
      let currentY = doc.lastAutoTable.finalY + 20;

      // دالة لإنشاء جدول لقسم معين
      const createSectionTable = (sectionName, sectionData, startY) => {
        if (sectionData.length === 0) return startY;

        // عنوان القسم
        doc.setFontSize(12);
        doc.setFont('Amiri', 'bold');
        doc.setTextColor(46, 139, 69);
        doc.text(sectionName, doc.internal.pageSize.width / 2, startY + 10, { align: 'center' });

        const sectionTableData = sectionData.map(row => {
          // إزالة الأقواس من المصاريف - عرض المبالغ السلبية بدون أقواس
          const formattedAmount = formatAmount(row.amount);
          return [
            formattedAmount,
            row.name || ''
          ];
        });

        autoTable(doc, {
          head: [['المبلغ', 'البند']],
          body: sectionTableData,
          startY: startY + 15,
          styles: {
            font: 'Amiri',
            fontSize: 9,
            cellPadding: 3,
            halign: 'center',
            valign: 'middle',
            direction: 'rtl'
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
            direction: 'rtl'
          },
          columnStyles: {
            0: {
              cellWidth: 50,
              halign: 'center'
            },
            1: {
              cellWidth: 130,
              halign: 'center'
            }
          },
          margin: { left: 14, right: 14 },
          pageBreak: 'auto',
          showHead: 'everyPage'
        });

        return doc.lastAutoTable.finalY + 10;
      };

      // قسم رأس المال
      const capitalData = tableData.filter(row =>
        row.section === 'capital' && !['section-header', 'subsection-header'].includes(row.type)
      );
      if (capitalData.length > 0) {
        currentY = createSectionTable('رأس المال', capitalData, currentY);
      }

      // قسم الإيرادات
      const revenueData = tableData.filter(row =>
        row.section === 'revenue' && !['section-header'].includes(row.type)
      );
      if (revenueData.length > 0) {
        currentY = createSectionTable('الإيرادات التشغيلية', revenueData, currentY);
      }

      // قسم المصروفات
      const expenseData = tableData.filter(row =>
        row.section === 'expense' && !['section-header'].includes(row.type)
      );
      if (expenseData.length > 0) {
        currentY = createSectionTable('المصروفات التشغيلية', expenseData, currentY);
      }

      // قسم النتيجة النهائية
      const finalData = tableData.filter(row =>
        row.section === 'final' && !['section-header'].includes(row.type)
      );
      if (finalData.length > 0) {
        currentY = createSectionTable('النتيجة النهائية', finalData, currentY);
      }

      // Footer
      const pageCount = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setFont('Amiri', 'bold');
        doc.text(`صفحة ${i} من ${pageCount}`, doc.internal.pageSize.width / 2, doc.internal.pageSize.height - 10, { align: 'center' });
      }

      // فتح نافذة الطباعة
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