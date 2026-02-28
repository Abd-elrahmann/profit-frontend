import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { saveAs } from 'file-saver';
import { pdfTableBaseStyles, createDidDrawTable } from './pdfTableStyles';
import { registerArabicFonts, drawReportHeader, drawSeparatorLine, drawReportFooter, drawReportSummary, PAGE_MARGIN, getFullWidthColumnStyles, PRIMARY_COLOR } from './pdfReportUtils';
import dayjs from 'dayjs';
export const exportLogsToPDF = async (logsData, filters = {}) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new jsPDF('landscape');
      registerArabicFonts(doc);
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
      const totalLogs = logsData.length;
      const dateRange = getDateRangeText(logsData);
      let filtersInfo = '';
      if (filters.search) filtersInfo += `بحث: "${filters.search}" `;
      if (filters.screen) filtersInfo += `شاشة: ${getScreenText(filters.screen)} `;
      if (filters.action) filtersInfo += `إجراء: ${getActionText(filters.action)} `;
      if (filters.userName) filtersInfo += `مستخدم: ${filters.userName} `;
      if (filters.from) filtersInfo += `من: ${filters.from} `;
      if (filters.to) filtersInfo += `إلى: ${filters.to} `;
      const summaryText = `إجمالي السجلات: ${totalLogs} | ${dateRange}${filtersInfo ? ` | ${filtersInfo}` : ''} | تاريخ التصدير: ${dayjs().format('DD/MM/YYYY HH:mm')}`;
      yPosition = drawReportSummary(doc, yPosition, summaryText);
      const tableData = logsData.map(log => [
        dayjs(log.createdAt).format('DD/MM/YYYY HH:mm'),
        log.description || '-',
        getActionText(log.action),
        getScreenText(log.screen),
        log.user.name
      ]);
      const headers = [
        ['التاريخ والوقت', 'الوصف', 'الإجراء', 'الشاشة', 'المستخدم']
      ];
      const baseWidths = [25, 65, 20, 30, 30];
      const columnStyles = getFullWidthColumnStyles(doc, baseWidths);
      Object.keys(columnStyles).forEach((k) => {
        columnStyles[k] = { ...columnStyles[k], fontSize: 9 };
      });
      columnStyles[1].halign = 'right';
      autoTable(doc, {
        startY: yPosition,
        head: headers,
        body: tableData,
        ...pdfTableBaseStyles,
        styles: { ...pdfTableBaseStyles.styles, fontStyle: 'bold', fontSize: 9, cellPadding: 4 },
        headStyles: { ...pdfTableBaseStyles.headStyles, fillColor: PRIMARY_COLOR, textColor: [255, 255, 255], fontSize: 9, cellPadding: 4 },
        bodyStyles: { ...pdfTableBaseStyles.bodyStyles, fontStyle: 'bold', cellPadding: 4 },
        columnStyles,
        margin: { top: yPosition, left: PAGE_MARGIN, right: PAGE_MARGIN, bottom: 25 },
        tableWidth: 'auto',
        horizontalPageBreak: false,
        pageBreak: 'auto',
        showHead: 'everyPage',
        didDrawTable: createDidDrawTable(doc)
      });
      const pageCount = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        drawReportFooter(doc, i, pageCount);
      }
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
    const XLSX = await import('xlsx');
    const workbook = XLSX.utils.book_new();
    const totalLogs = logsData.length;
    const dateRange = getDateRangeText(logsData);
    const summaryData = [
      ['سجلات النشاطات'],
      [''],
      ['إحصائيات'],
      ['إجمالي السجلات', totalLogs],
      ['الفترة', dateRange],
      ['تاريخ التصدير', dayjs().format('DD/MM/YYYY HH:mm')],
      ['']
    ];
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
    const logsSheetData = logsData.map(log => ({
      'المستخدم': log.user.name,
      'الشاشة': getScreenText(log.screen),
      'الإجراء': getActionText(log.action),
      'الوصف': log.description,
      'التاريخ والوقت': dayjs(log.createdAt).format('DD/MM/YYYY HH:mm')
    }));
    const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
    const logsSheet = XLSX.utils.json_to_sheet(logsSheetData);
    const wscols = [
      { wch: 20 },
      { wch: 20 },
      { wch: 15 },
      { wch: 50 },
      { wch: 20 }
    ];
    logsSheet['!cols'] = wscols;
    XLSX.utils.book_append_sheet(workbook, summarySheet, 'ملخص');
    XLSX.utils.book_append_sheet(workbook, logsSheet, 'سجلات النشاطات');
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