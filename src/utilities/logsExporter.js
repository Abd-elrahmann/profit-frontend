import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

import { saveAs } from 'file-saver';
import { pdfTableBaseStyles, createDidDrawTable } from './pdfTableStyles';
import { registerArabicFonts, drawReportHeader, drawSeparatorLine, drawReportFooter, getCenteredTableMargins, PRIMARY_COLOR } from './pdfReportUtils';
import dayjs from 'dayjs';

export const exportLogsToPDF = async (logsData, filters = {}) => {
  return new Promise((resolve, reject) => {
    try {
      // Create new PDF document
      const doc = new jsPDF();
      
      // Register Arabic fonts
      registerArabicFonts(doc);
      
      // Set document properties
      doc.setProperties({
        title: 'سجلات النشاطات',
        subject: 'سجل الأنشطة والنظام',
        author: 'نظام إدارة السلف',
        keywords: 'سجلات, أنشطة, نظام, تدقيق',
        creator: 'نظام إدارة السلف'
      });

      const headerEndY = drawReportHeader(doc, {
        reportTitle: 'سجلات النشاطات',
        metadata: { date: dayjs().format('YYYY/MM/DD'), time: dayjs().format('hh:mm A') }
      });
      let yPosition = drawSeparatorLine(doc, headerEndY + 4);

      let filtersInfo = '';
      if (filters.search) filtersInfo += `بحث: "${filters.search}" `;
      if (filters.screen) filtersInfo += `شاشة: ${getScreenText(filters.screen)} `;
      if (filters.action) filtersInfo += `إجراء: ${getActionText(filters.action)} `;
      if (filters.userName) filtersInfo += `مستخدم: ${filters.userName} `;
      if (filters.from) filtersInfo += `من: ${filters.from} `;
      if (filters.to) filtersInfo += `إلى: ${filters.to} `;
      
      if (filtersInfo) {
        doc.setFontSize(10);
        doc.setFont('Amiri', 'bold');
        doc.text(filtersInfo, doc.internal.pageSize.width / 2, yPosition, { align: 'center' });
        yPosition += 8;
      }
      
      const totalLogs = logsData.length;
      const dateRange = getDateRangeText(logsData);
      doc.setFontSize(11);
      doc.setFont('Amiri', 'bold');
      doc.text(`إجمالي السجلات: ${totalLogs} | ${dateRange}`, doc.internal.pageSize.width / 2, yPosition, { align: 'center' });
      yPosition += 12;
      
      // Prepare table data (RTL order)
      const tableData = logsData.map(log => [
        dayjs(log.createdAt).format('DD/MM/YYYY HH:mm'),
        log.description || '-',
        getActionText(log.action),
        getScreenText(log.screen),
        log.user.name
      ]);
      
      // Table headers (RTL order)
      const headers = [
        ['التاريخ والوقت', 'الوصف', 'الإجراء', 'الشاشة', 'المستخدم']
      ];
      
      // Create table with RTL support
      const pageWidth = doc.internal.pageSize.width;
      
      // Optimize column widths to fit on one page
      const columnWidths = {
        0: 25, // التاريخ والوقت
        1: 65, // الوصف
        2: 20, // الإجراء
        3: 30, // الشاشة
        4: 30  // المستخدم
      };
      
      const totalColumnWidth = Object.values(columnWidths).reduce((sum, width) => sum + width, 0);
      const tableMargins = getCenteredTableMargins(doc, totalColumnWidth);
      
      autoTable(doc, {
        startY: yPosition,
        head: headers,
        body: tableData,
        ...pdfTableBaseStyles,
        styles: { ...pdfTableBaseStyles.styles, fontStyle: 'bold', fontSize: 9, cellPadding: 4 },
        headStyles: { ...pdfTableBaseStyles.headStyles, fillColor: PRIMARY_COLOR, textColor: [255, 255, 255], fontSize: 9, cellPadding: 4 },
        bodyStyles: { ...pdfTableBaseStyles.bodyStyles, fontStyle: 'bold', cellPadding: 4 },
        columnStyles: {
          0: { cellWidth: columnWidths[0], fontSize: 9 }, // التاريخ والوقت
          1: { cellWidth: columnWidths[1], fontSize: 9, halign: 'right' }, // الوصف
          2: { cellWidth: columnWidths[2], fontSize: 9 }, // الإجراء
          3: { cellWidth: columnWidths[3], fontSize: 9 }, // الشاشة
          4: { cellWidth: columnWidths[4], fontSize: 9 }  // المستخدم
        },
        margin: { top: yPosition, left: tableMargins.left, right: tableMargins.right, bottom: 25 },
        tableWidth: totalColumnWidth,
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
      const fileName = `سجلات_النشاطات_${dayjs().format('YYYY-MM-DD')}.pdf`;
      doc.save(fileName);
      resolve();
    } catch (error) {
      console.error('PDF export error:', error.message);
      reject(error);
    }
  });
};

export const exportLogsToExcel = async (logsData, filters = {}) => {
  try {
    // Lazy load XLSX library
    const XLSX = await import('xlsx');

    // Create workbook
    const workbook = XLSX.utils.book_new();
    
    // Calculate summary statistics
    const totalLogs = logsData.length;
    const dateRange = getDateRangeText(logsData);

    // Summary data
    const summaryData = [
      ['سجلات النشاطات'],
      [''],
      ['إحصائيات'],
      ['إجمالي السجلات', totalLogs],
      ['الفترة', dateRange],
      ['تاريخ التصدير', dayjs().format('DD/MM/YYYY HH:mm')],
      ['']
    ];
    
    // Add filters info if exists
    let filtersInfo = [];
    if (filters.search) filtersInfo.push(['بحث', filters.search]);
    if (filters.screen) filtersInfo.push(['شاشة', getScreenText(filters.screen)]);
    if (filters.action) filtersInfo.push(['إجراء', getActionText(filters.action)]);
    if (filters.userName) filtersInfo.push(['مستخدم', filters.userName]);
    if (filters.from) filtersInfo.push(['من تاريخ', filters.from]);
    if (filters.to) filtersInfo.push(['إلى تاريخ', filters.to]);
    
    if (filtersInfo.length > 0) {
      summaryData.splice(2, 0, ['فلترة البيانات']);
      filtersInfo.forEach(([key, value]) => {
        summaryData.splice(3, 0, [key, value]);
      });
      summaryData.splice(3 + filtersInfo.length, 0, ['']);
    }
    
    // Logs data
    const logsSheetData = logsData.map(log => ({
      'المستخدم': log.user.name,
      'الشاشة': getScreenText(log.screen),
      'الإجراء': getActionText(log.action),
      'الوصف': log.description,
      'التاريخ والوقت': dayjs(log.createdAt).format('DD/MM/YYYY HH:mm')
    }));
    
    // Create summary sheet
    const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
    
    // Create logs sheet
    const logsSheet = XLSX.utils.json_to_sheet(logsSheetData);
    
    // Auto-size columns for better Excel display
    const wscols = [
      { wch: 20 }, // المستخدم
      { wch: 20 }, // الشاشة
      { wch: 15 }, // الإجراء
      { wch: 50 }, // الوصف
      { wch: 20 }  // التاريخ والوقت
    ];
    logsSheet['!cols'] = wscols;
    
    // Add sheets to workbook
    XLSX.utils.book_append_sheet(workbook, summarySheet, 'ملخص');
    XLSX.utils.book_append_sheet(workbook, logsSheet, 'سجلات النشاطات');
    
    // Generate Excel file
    const excelBuffer = XLSX.write(workbook, { 
      bookType: 'xlsx', 
      type: 'array',
      bookSST: false 
    });
    
    const blob = new Blob([excelBuffer], { 
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
    });
    
    const fileName = `سجلات_النشاطات_${dayjs().format('YYYY-MM-DD')}.xlsx`;
    saveAs(blob, fileName);
    
  } catch (error) {
    console.error('Excel export error:', error.message);
    throw error;
  }
};

// Helper functions
const getActionText = (action) => {
  switch (action) {
    case "CREATE":
      return "إنشاء";
    case "UPDATE":
      return "تعديل";
    case "DELETE":
      return "حذف";
    case "VIEW":
      return "عرض";
    case "POST":
      return "اعتماد";
    case "UNPOST":
      return "إلغاء الاعتماد";
    case "login":
      return "تسجيل دخول";
    case "logout":
      return "تسجيل خروج";
    default:
      return action;
  }
};

const getScreenText = (screen) => {
  const screenTranslations = {
    "Auth": "المصادقة",
    "Bank Accounts": "الحسابات البنكية",
    "Clients": "العملاء",
    "Journals": "القيود اليومية",
    "Loans": "السلف",
    "Partners": "المستثمرين",
    "Repayments": "الدفعات",
    "Roles": "الأدوار",
    "Templates": "القوالب",
    "Users": "المستخدمين",
  };
  return screenTranslations[screen] || screen;
};

const getDateRangeText = (logsData) => {
  if (!logsData || logsData.length === 0) return 'لا توجد بيانات';
  
  const dates = logsData.map(log => new Date(log.createdAt));
  const minDate = new Date(Math.min(...dates));
  const maxDate = new Date(Math.max(...dates));
  
  if (minDate.toDateString() === maxDate.toDateString()) {
    return `في ${dayjs(minDate).format('DD/MM/YYYY')}`;
  } else {
    return `من ${dayjs(minDate).format('DD/MM/YYYY')} إلى ${dayjs(maxDate).format('DD/MM/YYYY')}`;
  }
};

