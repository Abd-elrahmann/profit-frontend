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

// Format currency
const formatCurrency = (amount) => {
  return amount?.toLocaleString('en-US') || '0';
};

// Get column value for export
const getExportColumnValue = (client, columnId, index) => {
  switch(columnId) {
    case 'id':
      return index + 1;
    case 'client':
      return `${client.name || '-'}\n${client.phone || '-'}`;
    case 'address':
      return client.address || '-';
    case 'loansCount':
      return client.loansSummary?.loansCount || 0;
    case 'paidRepayments':
      return client.repaymentSummary?.paidRepayments || 0;
    case 'remainingRepayments':
      return client.repaymentSummary?.remainingRepayments || 0;
    case 'totalDebit':
      return client.financials?.totalDebit || 0;
    case 'totalPaid':
      return client.financials?.totalPaid || 0;
    case 'totalInterest':
      return client.financials?.totalInterestPaid || 0;
    case 'totalDiscounts':
      return client.financials?.totalDiscounts || 0;
    case 'remaining':
      return Math.abs(client.financials?.remaining) || 0;
    case 'note':
      return '-'; // ملاحظات فارغة
    default:
      return '';
  }
};

// Get formatted column value for display
const getFormattedColumnValue = (client, columnId, index) => {
  // For client column, return the already formatted value with line breaks
  if (columnId === 'client') {
    return getExportColumnValue(client, columnId, index);
  }

  // For individual columns, format currency values
  const value = getExportColumnValue(client, columnId, index);
  if (['totalDebit', 'totalPaid', 'totalInterest', 'totalDiscounts', 'remaining'].includes(columnId)) {
    return formatCurrency(value);
  }
  return value;
};

export const exportClientCollectionsToPDF = async (clientsData, status = 'ACTIVE', visibleColumns = []) => {
  return new Promise((resolve, reject) => {
    try {
      // Validate data
      if (!clientsData || !clientsData.data || !Array.isArray(clientsData.data) || clientsData.data.length === 0) {
        throw new Error('لا توجد بيانات للتصدير');
      }

      // إذا لم يتم تحديد أعمدة، استخدم جميع الأعمدة
      const columnsToExport = visibleColumns.length > 0 ? visibleColumns : [
        { id: 'id', label: 'م' },
        { id: 'client', label: 'العميل' },
        { id: 'address', label: 'العنوان' },
        { id: 'loansCount', label: 'عدد السلف' },
        { id: 'paidRepayments', label: 'الدفعات المدفوعة' },
        { id: 'remainingRepayments', label: 'الدفعات المتبقية' },
        { id: 'totalDebit', label: 'إجمالي المديونية' },
        { id: 'totalPaid', label: 'إجمالي المدفوع' },
        { id: 'totalInterest', label: 'إجمالي الفوائد' },
        { id: 'totalDiscounts', label: 'الخصومات' },
        { id: 'remaining', label: 'المتبقي' },
        { id: 'note', label: 'ملاحظات' },
      ];

      // Create new PDF document
      const doc = new jsPDF('landscape'); // Landscape for wider table
      
      // Register Arabic fonts
      registerArabicFonts(doc);
      
      // Determine title based on status
      const statusTitle = status === 'ACTIVE' ? 'العملاء المديونين' : 'العملاء المسددين';
      const documentTitle = `كشف تحصيل ${statusTitle}`;
      
      // Set document properties
      doc.setProperties({
        title: documentTitle,
        subject: 'تقرير تحصيل العملاء',
        author: 'نظام إدارة السلف',
        keywords: 'تحصيل, عملاء, تقرير',
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
      
      // Title section
      doc.setFontSize(18);
      doc.setFont('Amiri', 'bold');
      doc.text(documentTitle, doc.internal.pageSize.width / 2, 25, { align: 'center' });
      
      doc.setFontSize(11);
      doc.setFont('Amiri', 'bold');
      const summaryText = `إجمالي العملاء: ${clientsData.totalClients || clientsData.data.length} | تاريخ التصدير: ${dayjs().format('DD/MM/YYYY HH:mm')}`;
      doc.text(summaryText, doc.internal.pageSize.width / 2, 35, { align: 'center' });
      
      // حساب ملخص المديونيات
      const totalDebit = clientsData.data.reduce((sum, c) => sum + (c.financials?.totalDebit || 0), 0);
      const totalPaid = clientsData.data.reduce((sum, c) => sum + (c.financials?.totalPaid || 0), 0);
      const totalRemaining = clientsData.data.reduce((sum, c) => sum + (Math.abs(c.financials?.remaining) || 0), 0);
      
      // عرض ملخص المديونيات
      doc.setFontSize(10);
      doc.setFont('Amiri', 'bold');
      const financialSummary = `إجمالي المديونية: ${formatCurrency(totalDebit)} | إجمالي المدفوع: ${formatCurrency(totalPaid)} | إجمالي المتبقي: ${formatCurrency(totalRemaining)}`;
      doc.text(financialSummary, doc.internal.pageSize.width / 2, 43, { align: 'center' });
      
      const pageWidth = doc.internal.pageSize.width;
      let yPosition = 52;

      // Prepare table data
      const tableData = clientsData.data.map((client, index) => 
        columnsToExport.map(column => getFormattedColumnValue(client, column.id, index))
      );

      // Table headers (RTL order - reverse the columns array)
      const headers = [columnsToExport.map(col => col.label).reverse()];

      // Column widths - استخدام كامل عرض الصفحة مع توزيع ديناميكي
      const columnCount = columnsToExport.length;
      const availableWidth = pageWidth - 16; // هامش صغير جداً 8 من كل جانب
      
      // تحديد العرض الأساسي لكل عمود
      const baseWidths = {};
      columnsToExport.forEach((col) => {
        if (col.id === 'id') baseWidths[col.id] = 10;
        else if (col.id === 'client') baseWidths[col.id] = 32;
        else if (col.id === 'address') baseWidths[col.id] = 28;
        else if (col.id === 'note') baseWidths[col.id] = 55;
        else baseWidths[col.id] = 16;
      });
      
      // حساب العرض الإجمالي المستخدم
      const usedWidth = columnsToExport.reduce((sum, col) => sum + baseWidths[col.id], 0);
      const remainingWidth = availableWidth - usedWidth;
      
      // توزيع المساحة المتبقية - الأولوية للملاحظات ثم العميل والعنوان
      const columnWidths = {};
      const noteExists = columnsToExport.some(col => col.id === 'note');
      const clientExists = columnsToExport.some(col => col.id === 'client');
      const addressExists = columnsToExport.some(col => col.id === 'address');
      
      let extraForNote = 0;
      let extraForClient = 0;
      let extraForAddress = 0;
      
      if (remainingWidth > 0) {
        if (noteExists) {
          // الملاحظات تأخذ 60% من المساحة المتبقية
          extraForNote = remainingWidth * 0.6;
          const leftover = remainingWidth * 0.4;
          if (clientExists && addressExists) {
            extraForClient = leftover * 0.5;
            extraForAddress = leftover * 0.5;
          } else if (clientExists) {
            extraForClient = leftover;
          } else if (addressExists) {
            extraForAddress = leftover;
          } else {
            extraForNote += leftover;
          }
        } else if (clientExists && addressExists) {
          extraForClient = remainingWidth * 0.5;
          extraForAddress = remainingWidth * 0.5;
        } else if (clientExists) {
          extraForClient = remainingWidth;
        } else if (addressExists) {
          extraForAddress = remainingWidth;
        }
      }
      
      columnsToExport.forEach((col, index) => {
        let width = baseWidths[col.id];
        if (col.id === 'note') width += extraForNote;
        else if (col.id === 'client') width += extraForClient;
        else if (col.id === 'address') width += extraForAddress;
        columnWidths[columnCount - 1 - index] = width; // عكس الفهرس لأن الجدول RTL
      });

      const totalColumnWidth = Object.values(columnWidths).reduce((sum, width) => sum + width, 0);
      const tableStartX = (pageWidth - totalColumnWidth) / 2;

      // Create table
      autoTable(doc, {
        startY: yPosition,
        startX: tableStartX,
        head: headers,
        body: tableData.map(row => row.reverse()), // عكس الصفوف لتناسب RTL
        theme: 'striped',
        styles: {
          font: 'Amiri',
          fontStyle: 'bold',
          fontSize: 7,
          cellPadding: 2,
          lineColor: [200, 200, 200],
          lineWidth: 0.1,
          halign: 'right',
          valign: 'middle',
          overflow: 'linebreak',
          direction: 'rtl'
        },
        headStyles: {
          fillColor: [240, 240, 240], // خلفية فاتحة
          textColor: [46, 139, 69], // نص أخضر داكن
          fontStyle: 'bold',
          fontSize: 8,
          halign: 'right',
          valign: 'middle',
          cellPadding: 3,
          overflow: 'hidden',
          direction: 'rtl'
        },
        bodyStyles: {
          fontStyle: 'bold',
          halign: 'right',
          valign: 'middle',
          cellPadding: 2,
          direction: 'rtl',
          fontSize: 7,
        },
        columnStyles: columnWidths,
        margin: { left: 8, right: 8, top: yPosition, bottom: 15 },
        tableWidth: totalColumnWidth,
        horizontalPageBreak: false,
        pageBreak: 'auto',
        showHead: 'everyPage'
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
      const statusSuffix = status === 'ACTIVE' ? 'المديونين' : 'المسددين';
      const fileName = `كشف_تحصيل_العملاء_${statusSuffix}_${dayjs().format('YYYY-MM-DD')}.pdf`;
      doc.save(fileName);
      resolve();
    } catch (error) {
      console.error('PDF export error:', error.message);
      reject(error);
    }
  });
};

export const exportClientCollectionsToExcel = async (clientsData, status = 'ACTIVE', visibleColumns = []) => {
  try {
    // Validate data
    if (!clientsData || !clientsData.data || !Array.isArray(clientsData.data) || clientsData.data.length === 0) {
      throw new Error('لا توجد بيانات للتصدير');
    }

    // إذا لم يتم تحديد أعمدة، استخدم جميع الأعمدة
    const columnsToExport = visibleColumns.length > 0 ? visibleColumns : [
      { id: 'id', label: 'م' },
      { id: 'client', label: 'العميل' },
      { id: 'address', label: 'العنوان' },
      { id: 'loansCount', label: 'عدد السلف' },
      { id: 'paidRepayments', label: 'الدفعات المدفوعة' },
      { id: 'remainingRepayments', label: 'الدفعات المتبقية' },
      { id: 'totalDebit', label: 'إجمالي المديونية' },
      { id: 'totalPaid', label: 'إجمالي المدفوع' },
      { id: 'totalInterest', label: 'إجمالي الفوائد' },
      { id: 'totalDiscounts', label: 'الخصومات' },
      { id: 'remaining', label: 'المتبقي' },
      { id: 'note', label: 'ملاحظات' },
    ];

    // Create workbook
    const workbook = XLSX.utils.book_new();
    
    // Determine title based on status
    const statusTitle = status === 'ACTIVE' ? 'العملاء المديونين' : 'العملاء المسددين';
    
    // Summary data
    const summaryData = [
      [`كشف تحصيل ${statusTitle}`],
      [`تاريخ التصدير: ${dayjs().format('DD/MM/YYYY HH:mm')}`],
      [`إجمالي العملاء: ${clientsData.totalClients || clientsData.data.length}`],
      [''],
      ['ملخص الإحصائيات'],
      [''],
      ['إجمالي المديونية', clientsData.data.reduce((sum, c) => sum + (c.financials.totalDebit || 0), 0)],
      ['إجمالي المدفوع', clientsData.data.reduce((sum, c) => sum + (c.financials.totalPaid || 0), 0)],
      ['إجمالي الفوائد', clientsData.data.reduce((sum, c) => sum + (c.financials.totalInterestPaid || 0), 0)],
      ['إجمالي الخصومات', clientsData.data.reduce((sum, c) => sum + (c.financials.totalDiscounts || 0), 0)],
      ['إجمالي المتبقي', clientsData.data.reduce((sum, c) => sum + (Math.abs(c.financials.remaining) || 0), 0)],
      [''],
      ['تفاصيل العملاء'],
      ['']
    ];
    
    // Headers
    const headersRow = columnsToExport.map(col => col.label);
    
    // Clients data
    const clientsTableData = [headersRow];
    
    clientsData.data.forEach((client, index) => {
      const rowData = columnsToExport.map(column => getExportColumnValue(client, column.id, index));
      clientsTableData.push(rowData);
    });
    
    // Combine summary and table data
    const allData = [...summaryData, ...clientsTableData];
    
    // Create sheet
    const sheet = XLSX.utils.aoa_to_sheet(allData);
    
    // Auto-size columns
    const columnWidths = columnsToExport.map(col => {
      if (col.id === 'id') return { wch: 6 };
      if (col.id === 'client') return { wch: 25 }; // عرض مناسب للعميل
      if (col.id === 'address') return { wch: 20 }; // عرض مناسب للعنوان
      if (col.id === 'note') return { wch: 30 }; // عرض أوسع للملاحظات
      return { wch: 12 }; // عرض افتراضي للباقي
    });
    
    sheet['!cols'] = columnWidths;
    
    // Style header row
    const headerRowIndex = summaryData.length;
    if (!sheet['!rows']) sheet['!rows'] = [];
    for (let col = 0; col < headersRow.length; col++) {
      const cellAddress = XLSX.utils.encode_cell({ r: headerRowIndex, c: col });
      if (!sheet[cellAddress]) continue;
      if (!sheet[cellAddress].s) sheet[cellAddress].s = {};
      sheet[cellAddress].s.font = { bold: true, color: { rgb: "FFFFFF" } };
      sheet[cellAddress].s.fill = { fgColor: { rgb: "0D40A5" } };
      sheet[cellAddress].s.alignment = { horizontal: "center", vertical: "center" };
    }
    
    // Add sheet to workbook
    XLSX.utils.book_append_sheet(workbook, sheet, 'كشف التحصيل');
    
    // Generate Excel file
    const excelBuffer = XLSX.write(workbook, { 
      bookType: 'xlsx', 
      type: 'array',
      bookSST: false 
    });
    
    const blob = new Blob([excelBuffer], { 
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
    });
    
    const statusSuffix = status === 'ACTIVE' ? 'المديونين' : 'المسددين';
    const fileName = `كشف_تحصيل_العملاء_${statusSuffix}_${dayjs().format('YYYY-MM-DD')}.xlsx`;
    saveAs(blob, fileName);
    
  } catch (error) {
    console.error('Excel export error:', error.message);
    throw error;
  }
};

// دالة الطباعة
export const printClientCollections = async (clientsData, status = 'ACTIVE', visibleColumns = []) => {
  return new Promise((resolve, reject) => {
    try {
      // Validate data
      if (!clientsData || !clientsData.data || !Array.isArray(clientsData.data) || clientsData.data.length === 0) {
        throw new Error('لا توجد بيانات للطباعة');
      }

      // إذا لم يتم تحديد أعمدة، استخدم جميع الأعمدة
      const columnsToExport = visibleColumns.length > 0 ? visibleColumns : [
        { id: 'id', label: 'م' },
        { id: 'client', label: 'العميل' },
        { id: 'address', label: 'العنوان' },
        { id: 'loansCount', label: 'عدد السلف' },
        { id: 'paidRepayments', label: 'الدفعات المدفوعة' },
        { id: 'remainingRepayments', label: 'الدفعات المتبقية' },
        { id: 'totalDebit', label: 'إجمالي المديونية' },
        { id: 'totalPaid', label: 'إجمالي المدفوع' },
        { id: 'totalInterest', label: 'إجمالي الفوائد' },
        { id: 'totalDiscounts', label: 'الخصومات' },
        { id: 'remaining', label: 'المتبقي' },
        { id: 'note', label: 'ملاحظات' },
      ];

      // Create new PDF document للطباعة
      const doc = new jsPDF('landscape');
      
      // Register Arabic fonts
      registerArabicFonts(doc);
      
      // Determine title based on status
      const statusTitle = status === 'ACTIVE' ? 'العملاء المديونين' : 'العملاء المسددين';
      const documentTitle = `كشف تحصيل ${statusTitle}`;
      
      // Set Arabic as primary font
      doc.setFont('Amiri', 'bold');
      
      // Title section
      doc.setFontSize(16);
      doc.setFont('Amiri', 'bold');
      doc.text(documentTitle, doc.internal.pageSize.width / 2, 20, { align: 'center' });
      
      doc.setFontSize(10);
      doc.setFont('Amiri', 'bold');
      const summaryText = `إجمالي العملاء: ${clientsData.totalClients || clientsData.data.length} | تاريخ الطباعة: ${dayjs().format('DD/MM/YYYY HH:mm')}`;
      doc.text(summaryText, doc.internal.pageSize.width / 2, 28, { align: 'center' });
      
      // حساب ملخص المديونيات
      const totalDebit = clientsData.data.reduce((sum, c) => sum + (c.financials?.totalDebit || 0), 0);
      const totalPaid = clientsData.data.reduce((sum, c) => sum + (c.financials?.totalPaid || 0), 0);
      const totalRemaining = clientsData.data.reduce((sum, c) => sum + (Math.abs(c.financials?.remaining) || 0), 0);
      
      // عرض ملخص المديونيات
      doc.setFontSize(9);
      doc.setFont('Amiri', 'bold');
      const financialSummary = `إجمالي المديونية: ${formatCurrency(totalDebit)} | إجمالي المدفوع: ${formatCurrency(totalPaid)} | إجمالي المتبقي: ${formatCurrency(totalRemaining)}`;
      doc.text(financialSummary, doc.internal.pageSize.width / 2, 35, { align: 'center' });
      
      const pageWidth = doc.internal.pageSize.width;
      let yPosition = 42;

      // Prepare table data
      const tableData = clientsData.data.map((client, index) => 
        columnsToExport.map(column => getFormattedColumnValue(client, column.id, index))
      );

      // Table headers
      const headers = [columnsToExport.map(col => col.label).reverse()];

      // Column widths - استخدام كامل عرض الصفحة مع توزيع ديناميكي
      const columnCount = columnsToExport.length;
      const availableWidth = pageWidth - 16; // هامش صغير جداً 8 من كل جانب
      
      // تحديد العرض الأساسي لكل عمود
      const baseWidths = {};
      columnsToExport.forEach((col) => {
        if (col.id === 'id') baseWidths[col.id] = 10;
        else if (col.id === 'client') baseWidths[col.id] = 32;
        else if (col.id === 'address') baseWidths[col.id] = 28;
        else if (col.id === 'note') baseWidths[col.id] = 55;
        else baseWidths[col.id] = 16;
      });
      
      // حساب العرض الإجمالي المستخدم
      const usedWidth = columnsToExport.reduce((sum, col) => sum + baseWidths[col.id], 0);
      const remainingWidth = availableWidth - usedWidth;
      
      // توزيع المساحة المتبقية - الأولوية للملاحظات ثم العميل والعنوان
      const columnWidths = {};
      const noteExists = columnsToExport.some(col => col.id === 'note');
      const clientExists = columnsToExport.some(col => col.id === 'client');
      const addressExists = columnsToExport.some(col => col.id === 'address');
      
      let extraForNote = 0;
      let extraForClient = 0;
      let extraForAddress = 0;
      
      if (remainingWidth > 0) {
        if (noteExists) {
          // الملاحظات تأخذ 60% من المساحة المتبقية
          extraForNote = remainingWidth * 0.6;
          const leftover = remainingWidth * 0.4;
          if (clientExists && addressExists) {
            extraForClient = leftover * 0.5;
            extraForAddress = leftover * 0.5;
          } else if (clientExists) {
            extraForClient = leftover;
          } else if (addressExists) {
            extraForAddress = leftover;
          } else {
            extraForNote += leftover;
          }
        } else if (clientExists && addressExists) {
          extraForClient = remainingWidth * 0.5;
          extraForAddress = remainingWidth * 0.5;
        } else if (clientExists) {
          extraForClient = remainingWidth;
        } else if (addressExists) {
          extraForAddress = remainingWidth;
        }
      }
      
      columnsToExport.forEach((col, index) => {
        let width = baseWidths[col.id];
        if (col.id === 'note') width += extraForNote;
        else if (col.id === 'client') width += extraForClient;
        else if (col.id === 'address') width += extraForAddress;
        columnWidths[columnCount - 1 - index] = width; // عكس الفهرس لأن الجدول RTL
      });

      const totalColumnWidth = Object.values(columnWidths).reduce((sum, width) => sum + width, 0);
      const tableStartX = (pageWidth - totalColumnWidth) / 2;

      // Create table
      autoTable(doc, {
        startY: yPosition,
        startX: tableStartX,
        head: headers,
        body: tableData.map(row => row.reverse()),
        theme: 'striped',
        styles: {
          font: 'Amiri',
          fontStyle: 'bold',
          fontSize: 7,
          cellPadding: 2,
          lineColor: [200, 200, 200],
          lineWidth: 0.1,
          halign: 'right',
          valign: 'middle',
          overflow: 'linebreak',
          direction: 'rtl'
        },
        headStyles: {
          fillColor: [240, 240, 240], // خلفية فاتحة
          textColor: [46, 139, 69], // نص أخضر داكن
          fontStyle: 'bold',
          fontSize: 8,
          halign: 'right',
          valign: 'middle',
          cellPadding: 3,
          direction: 'rtl'
        },
        bodyStyles: {
          fontStyle: 'bold',
          halign: 'right',
          valign: 'middle',
          cellPadding: 2,
          direction: 'rtl',
          fontSize: 7,
        },
        columnStyles: columnWidths,
        margin: { left: 8, right: 8, top: yPosition, bottom: 15 },
        tableWidth: totalColumnWidth,
        pageBreak: 'auto',
        showHead: 'everyPage'
      });
      
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
      }
      
      resolve();
    } catch (error) {
      console.error('Print error:', error.message);
      reject(error);
    }
  });
};