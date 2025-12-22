import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import dayjs from 'dayjs';
import logo from '/assets/images/logo.webp';

// Register Arabic fonts
const registerArabicFonts = (doc) => {
  try {
    doc.addFont('/assets/fonts/Amiri-Regular.ttf', 'Amiri', 'normal');
    doc.addFont('/assets/fonts/Amiri-Bold.ttf', 'Amiri', 'bold');
  } catch (error) {
    console.warn('Arabic fonts not found, using default fonts', error);
  }
};

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

      // Set Arabic as primary font
      doc.setFont('Amiri', 'bold');
      
      // Logo positioned on the right - small and at the very top
      const logoWidth = 10;
      const logoHeight = 10;
      const logoX = doc.internal.pageSize.width - logoWidth - 5;
      const logoY = 5;
      doc.addImage(logo, 'PNG', logoX, logoY, logoWidth, logoHeight);
      
      // Title section - start after logo
      doc.setFontSize(18);
      doc.setFont('Amiri', 'bold');
      doc.text('سجلات النشاطات', doc.internal.pageSize.width / 2, 25, { align: 'center' });
      
      // Filters info if exists
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
        doc.text(filtersInfo, doc.internal.pageSize.width / 2, 35, { align: 'center' });
      }
      
      // Summary section
      doc.setFontSize(11);
      doc.setFont('Amiri', 'bold');
      const summaryY = filtersInfo ? 45 : 35;
      const totalLogs = logsData.length;
      const dateRange = getDateRangeText(logsData);
      
      const summaryText = `إجمالي السجلات: ${totalLogs} | ${dateRange} | تاريخ التصدير: ${dayjs().format('DD/MM/YYYY HH:mm')}`;
      doc.text(summaryText, doc.internal.pageSize.width / 2, summaryY, { align: 'center' });
      
      let yPosition = summaryY + 12;
      
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
      
      // Calculate table width to center it properly
      const totalColumnWidth = Object.values(columnWidths).reduce((sum, width) => sum + width, 0);
      const tableStartX = (pageWidth - totalColumnWidth) / 2;
      
      autoTable(doc, {
        startY: yPosition,
        startX: tableStartX,
        head: headers,
        body: tableData,
        theme: 'striped',
        styles: {
          font: 'Amiri',
          fontStyle: 'bold',
          fontSize: 7,
          cellPadding: 3,
          lineColor: [200, 200, 200],
          lineWidth: 0.1,
          halign: 'center',
          valign: 'middle'
        },
        headStyles: {
fillColor: [240, 240, 240],
          textColor: [46, 139, 69],
          fontStyle: 'bold',
          fontSize: 8,
          halign: 'center',
          valign: 'middle',
          cellPadding: 4
        },
        bodyStyles: {
          fontStyle: 'bold',
          halign: 'center',
          valign: 'middle',
          cellPadding: 2
        },
        alternateRowStyles: {
          fillColor: [250, 250, 250]
        },
        columnStyles: {
          0: { cellWidth: columnWidths[0], fontSize: 7 }, // التاريخ والوقت
          1: { cellWidth: columnWidths[1], fontSize: 6, halign: 'right' }, // الوصف
          2: { cellWidth: columnWidths[2], fontSize: 7 }, // الإجراء
          3: { cellWidth: columnWidths[3], fontSize: 7 }, // الشاشة
          4: { cellWidth: columnWidths[4], fontSize: 7 }  // المستخدم
        },
        margin: { top: yPosition, bottom: 20 },
        tableWidth: totalColumnWidth,
        horizontalPageBreak: false,
        pageBreak: 'auto',
        showHead: 'everyPage',
      });
      
      // Footer - Professional styling
      const pageCount = doc.internal.getNumberOfPages();
      const footerMargin = 10;
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        
        // Draw footer line
        doc.setDrawColor(200, 200, 200);
        doc.setLineWidth(0.5);
        doc.line(
          footerMargin,
          doc.internal.pageSize.height - 15,
          doc.internal.pageSize.width - footerMargin,
          doc.internal.pageSize.height - 15
        );
        
        // Footer text
        doc.setFontSize(9);
        doc.setFont('Amiri', 'bold');
        doc.setTextColor(100, 100, 100);
        
        // Page number - centered
        doc.text(
          `صفحة ${i} من ${pageCount}`,
          doc.internal.pageSize.width / 2,
          doc.internal.pageSize.height - 8,
          { align: 'center' }
        );
        
        // Creation date - right aligned
        const creationDate = dayjs().format('DD/MM/YYYY HH:mm');
        doc.text(
          `تم الإنشاء في: ${creationDate}`,
          doc.internal.pageSize.width - footerMargin,
          doc.internal.pageSize.height - 8,
          { align: 'right' }
        );
        
        // Reset text color
        doc.setTextColor(0, 0, 0);
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
    "Repayments": "الأقساط",
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