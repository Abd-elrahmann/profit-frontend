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

// Get status text and color
const getStatusText = (client) => {
  // إذا لم يكن لدى العميل أي ديون أو مدفوعات (عميل جديد)
  if (client.totalDebit === 0 && client.totalPaid === 0) {
    return 'عميل جديد';
  }

  if (client.remaining > 0) return 'مديون';
  if (client.remaining === 0) return 'مدفوع بالكامل';
  return 'لديه رصيد';
};

const getStatusColor = (client) => {
  // إذا لم يكن لدى العميل أي ديون أو مدفوعات (عميل جديد)
  if (client.totalDebit === 0 && client.totalPaid === 0) {
    return [128, 128, 128]; // gray for new client
  }

  if (client.remaining > 0) return [220, 53, 69]; // error red
  if (client.remaining === 0) return [40, 167, 69]; // success green
  return [23, 162, 184]; // info blue
};

// Format currency
const formatCurrency = (amount) => {
  return amount?.toLocaleString('en-US') || '0';
};

export const exportClientCollectionsToPDF = async (clientsData) => {
  return new Promise((resolve, reject) => {
    try {
      // Validate data
      if (!clientsData || !clientsData.data || !Array.isArray(clientsData.data) || clientsData.data.length === 0) {
        throw new Error('لا توجد بيانات للتصدير');
      }

      // Create new PDF document
      const doc = new jsPDF('landscape'); // Landscape for wider table
      
      // Register Arabic fonts
      registerArabicFonts(doc);
      
      // Set document properties
      doc.setProperties({
        title: 'كشف تحصيل العملاء',
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
      doc.text('كشف تحصيل العملاء', doc.internal.pageSize.width / 2, 25, { align: 'center' });
      
      doc.setFontSize(11);
      doc.setFont('Amiri', 'bold');
      const summaryText = `إجمالي العملاء: ${clientsData.totalClients || clientsData.data.length} | تاريخ التصدير: ${dayjs().format('DD/MM/YYYY HH:mm')}`;
      doc.text(summaryText, doc.internal.pageSize.width / 2, 35, { align: 'center' });
      
      const pageWidth = doc.internal.pageSize.width;
      let yPosition = 45;

      // Prepare table data
      const tableData = clientsData.data.map(client => [
        getStatusText(client.remaining),
        formatCurrency(Math.abs(client.remaining)),
        formatCurrency(client.totalPaid),
        formatCurrency(client.totalDebit),
        client.phone || '-',
        client.name
      ]);

      // Table headers (RTL order)
      const headers = [
        ['الحالة', 'المتبقي', 'إجمالي المدفوع', 'إجمالي المديونية', 'الهاتف', 'اسم العميل']
      ];

      // Column widths for landscape
      const columnWidths = {
        0: 25, // الحالة
        1: 30, // المتبقي
        2: 30, // إجمالي المدفوع
        3: 30, // إجمالي المديونية
        4: 30, // الهاتف
        5: 50  // اسم العميل
      };

      const totalColumnWidth = Object.values(columnWidths).reduce((sum, width) => sum + width, 0);
      const tableStartX = (pageWidth - totalColumnWidth) / 2;

      // Create table
      autoTable(doc, {
        startY: yPosition,
        startX: tableStartX,
        head: headers,
        body: tableData,
        theme: 'striped',
        styles: {
          font: 'Amiri',
          fontStyle: 'bold',
          fontSize: 8,
          cellPadding: 3,
          lineColor: [200, 200, 200],
          lineWidth: 0.1,
          halign: 'right',
          valign: 'middle',
          overflow: 'linebreak',
          direction: 'rtl'
        },
        headStyles: {
          fillColor: [13, 64, 165],
          textColor: 255,
          fontStyle: 'bold',
          fontSize: 9,
          halign: 'right',
          valign: 'middle',
          cellPadding: 5,
          overflow: 'hidden',
          direction: 'rtl'
        },
        bodyStyles: {
          halign: 'right',
          valign: 'middle',
          cellPadding: 3,
          direction: 'rtl'
        },
        columnStyles: {
          0: { 
            cellWidth: columnWidths[0],
            cellPadding: 4,
            halign: 'center'
          },
          1: { cellWidth: columnWidths[1], halign: 'right' },
          2: { cellWidth: columnWidths[2], halign: 'right' },
          3: { cellWidth: columnWidths[3], halign: 'right' },
          4: { cellWidth: columnWidths[4], halign: 'right' },
          5: { cellWidth: columnWidths[5], halign: 'right' }
        },
        didParseCell: function (data) {
          // Color status cells based on remaining amount
          if (data.column.index === 0 && data.row.index >= 0) {
            const client = clientsData.data[data.row.index];
            if (client) {
              const color = getStatusColor(client.remaining);
              data.cell.styles.fillColor = color;
              data.cell.styles.textColor = [255, 255, 255];
            }
          }
        },
        margin: { top: yPosition, bottom: 20 },
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
      const fileName = `كشف_تحصيل_العملاء_${dayjs().format('YYYY-MM-DD')}.pdf`;
      doc.save(fileName);
      resolve();
    } catch (error) {
      console.error('PDF export error:', error.message);
      reject(error);
    }
  });
};

export const exportClientDetailsToPDF = async (clientDetails) => {
  return new Promise((resolve, reject) => {
    try {
      // Validate data
      if (!clientDetails || !clientDetails.client) {
        throw new Error('لا توجد بيانات للتصدير');
      }

      // Create new PDF document
      const doc = new jsPDF();
      
      // Register Arabic fonts
      registerArabicFonts(doc);
      
      // Set document properties
      doc.setProperties({
        title: `كشف تحصيل - ${clientDetails.client.name}`,
        subject: 'كشف تحصيل العميل',
        author: 'نظام إدارة السلف',
        keywords: 'تحصيل, عميل, تقرير',
        creator: 'نظام إدارة السلف'
      });

      // Set Arabic as primary font
      doc.setFont('Amiri', 'bold');
      
      // Logo positioned on the right
      const logoWidth = 10;
      const logoHeight = 10;
      const logoX = doc.internal.pageSize.width - logoWidth - 5;
      const logoY = 5;
      doc.addImage(logo, 'PNG', logoX, logoY, logoWidth, logoHeight);
      
      // Title section
      doc.setFontSize(18);
      doc.setFont('Amiri', 'bold');
      doc.text('كشف تحصيل العميل', doc.internal.pageSize.width / 2, 25, { align: 'center' });
      
      doc.setFontSize(13);
      doc.setFont('Amiri', 'bold');
      doc.text(`العميل: ${clientDetails.client.name}`, doc.internal.pageSize.width / 2, 35, { align: 'center' });
      
      doc.setFontSize(11);
      doc.text(`تاريخ التصدير: ${dayjs().format('DD/MM/YYYY HH:mm')}`, doc.internal.pageSize.width / 2, 42, { align: 'center' });
      
      let yPosition = 55;

      // Client Information Section
      doc.setFontSize(14);
      doc.setFont('Amiri', 'bold');
      doc.text('معلومات العميل', doc.internal.pageSize.width / 2, yPosition, { align: 'center' });
      yPosition += 10;

      const clientInfoData = [
        [clientDetails.client.name || '-', 'اسم العميل'],
        [clientDetails.client.phone || '-', 'الهاتف'],
        [clientDetails.client.email || 'لا يوجد', 'البريد الإلكتروني'],
        [clientDetails.client.address || '-', 'العنوان'],
        [clientDetails.client.status || '-', 'الحالة'],
        [clientDetails.client.createdAt ? dayjs(clientDetails.client.createdAt).format('DD/MM/YYYY') : '-', 'تاريخ الانضمام']
      ];

      const clientInfoHeaders = [['القيمة', 'المعلومة']];
      const clientInfoTableData = clientInfoData.map(row => [row[0], row[1]]);

      const pageWidth = doc.internal.pageSize.width;
      const tableWidth = 190; // 60 + 130
      const startX = pageWidth - tableWidth - 10; // Start from right with 10mm margin

      autoTable(doc, {
        startY: yPosition,
        startX: startX,
        head: clientInfoHeaders,
        body: clientInfoTableData,
        theme: 'striped',
        styles: {
          font: 'Amiri',
          fontStyle: 'bold',
          fontSize: 9,
          cellPadding: 4,
          halign: 'right',
          valign: 'middle',
          direction: 'rtl'
        },
        headStyles: {
          fillColor: [13, 64, 165],
          textColor: 255,
          fontStyle: 'bold',
          fontSize: 10,
          halign: 'right',
          valign: 'middle',
          cellPadding: 5,
          direction: 'rtl'
        },
        columnStyles: {
          0: { cellWidth: 130, halign: 'right' }, // القيمة (Value) - wider column
          1: { cellWidth: 60, halign: 'right' }    // المعلومة (Information) - narrower column
        },
        margin: { top: yPosition, bottom: 10 },
        tableWidth: tableWidth
      });

      yPosition = doc.lastAutoTable.finalY + 15;

      // Financial Summary Section
      doc.setFontSize(14);
      doc.setFont('Amiri', 'bold');
      doc.text('الملخص المالي', doc.internal.pageSize.width / 2, yPosition, { align: 'center' });
      yPosition += 10;

      const totals = clientDetails.totals || {};
      const summaryData = [
        [formatCurrency(totals.totalDebit || 0), 'إجمالي المديونية'],
        [formatCurrency(totals.totalPaid || 0), 'إجمالي المدفوع'],
        [formatCurrency(Math.abs(totals.remaining || 0)), 'المتبقي'],
        [formatCurrency(totals.totalDiscounts || 0), 'إجمالي الخصومات'],
        [totals.paidRepayments || 0, 'دفعات مدفوعة'],
        [totals.pendingRepayments || 0, 'دفعات معلقة'],
        [totals.overdueRepayments || 0, 'دفعات متأخرة']
      ];

      const summaryHeaders = [['القيمة', 'البند']];
      const summaryTableData = summaryData.map(row => [row[0], row[1]]);

      const summaryTableWidth = 190; // 60 + 130
      const summaryStartX = pageWidth - summaryTableWidth - 10; // Start from right

      autoTable(doc, {
        startY: yPosition,
        startX: summaryStartX,
        head: summaryHeaders,
        body: summaryTableData,
        theme: 'striped',
        styles: {
          font: 'Amiri',
          fontStyle: 'bold',
          fontSize: 9,
          cellPadding: 4,
          halign: 'right',
          valign: 'middle',
          direction: 'rtl'
        },
        headStyles: {
          fillColor: [13, 64, 165],
          textColor: 255,
          fontStyle: 'bold',
          fontSize: 10,
          halign: 'right',
          valign: 'middle',
          cellPadding: 5,
          direction: 'rtl'
        },
        columnStyles: {
          0: { cellWidth: 130, halign: 'right', fontStyle: 'bold' }, // القيمة (Value) - wider column
          1: { cellWidth: 60, halign: 'right' }                        // البند (Item) - narrower column
        },
        margin: { top: yPosition, bottom: 10 },
        tableWidth: summaryTableWidth
      });

      yPosition = doc.lastAutoTable.finalY + 15;

      // Loans Table Section
      if (clientDetails.loans && clientDetails.loans.length > 0) {
        // Check if we need a new page
        if (yPosition > doc.internal.pageSize.height - 60) {
          doc.addPage();
          yPosition = 20;
        }

        doc.setFontSize(14);
        doc.setFont('Amiri', 'bold');
        doc.text('السلف والدفعات', doc.internal.pageSize.width / 2, yPosition, { align: 'center' });
        yPosition += 10;

        // Simplified loans data - reduce columns to fit page width (reversed order for RTL)
        const loansData = clientDetails.loans.map(loan => [
          loan.code,
          getStatusText(loan.remaining),
          `${loan.paidCount}/${loan.pendingCount}/${loan.overdueCount}`,
          formatCurrency(loan.amount),
          formatCurrency(loan.paidAmount),
          formatCurrency(Math.abs(loan.remaining))
        ]);

        const loansHeaders = [['كود السلفة', 'الحالة', 'الدفعات (م/ع/ت)', 'المبلغ', 'المدفوع', 'المتبقي']];

        const loansTableWidth = 190; // 30+30+30+35+30+35
        const loansStartX = pageWidth - loansTableWidth - 10; // Start from right

        autoTable(doc, {
          startY: yPosition,
          startX: loansStartX,
          head: loansHeaders,
          body: loansData,
          theme: 'striped',
          styles: {
            font: 'Amiri',
            fontStyle: 'bold',
            fontSize: 8,
            cellPadding: 3,
            halign: 'right',
            valign: 'middle',
            direction: 'rtl',
            overflow: 'linebreak',
            cellWidth: 'wrap'
          },
          headStyles: {
            fillColor: [13, 64, 165],
            textColor: 255,
            fontStyle: 'bold',
            fontSize: 9,
            halign: 'right',
            valign: 'middle',
            cellPadding: 4,
            direction: 'rtl'
          },
          columnStyles: {
            0: { cellWidth: 35, halign: 'right', fontStyle: 'bold' }, // كود السلفة
            1: { cellWidth: 30, halign: 'center' },                    // الحالة
            2: { cellWidth: 35, halign: 'center', fontSize: 7 },       // الدفعات
            3: { cellWidth: 30, halign: 'right' },                     // المبلغ
            4: { cellWidth: 30, halign: 'right' },                     // المدفوع
            5: { cellWidth: 30, halign: 'right' }                      // المتبقي
          },
          margin: { top: yPosition, bottom: 20 },
          tableWidth: loansTableWidth,
          pageBreak: 'auto',
          showHead: 'everyPage',
          rowPageBreak: 'avoid'
        });
      }
      
      // Footer
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
      
      const fileName = `كشف_تحصيل_${clientDetails.client.name}_${dayjs().format('YYYY-MM-DD')}.pdf`;
      doc.save(fileName);
      resolve();
    } catch (error) {
      console.error('PDF export error:', error.message);
      reject(error);
    }
  });
};

export const exportClientDetailsToExcel = async (clientDetails) => {
  try {
    // Validate data
    if (!clientDetails || !clientDetails.client) {
      throw new Error('لا توجد بيانات للتصدير');
    }

    // Create workbook
    const workbook = XLSX.utils.book_new();
    
    // Client Information Sheet
    const clientInfoData = [
      ['كشف تحصيل العميل'],
      [`العميل: ${clientDetails.client.name}`],
      [`تاريخ التصدير: ${dayjs().format('DD/MM/YYYY HH:mm')}`],
      [''],
      ['معلومات العميل'],
      [''],
      ['اسم العميل', clientDetails.client.name || '-'],
      ['الهاتف', clientDetails.client.phone || '-'],
      ['البريد الإلكتروني', clientDetails.client.email || 'لا يوجد'],
      ['العنوان', clientDetails.client.address || '-'],
      ['الحالة', clientDetails.client.status || '-'],
      ['تاريخ الانضمام', clientDetails.client.createdAt ? dayjs(clientDetails.client.createdAt).format('DD/MM/YYYY') : '-'],
      [''],
      ['الملخص المالي'],
      ['']
    ];

    const totals = clientDetails.totals || {};
    clientInfoData.push(['إجمالي المديونية', totals.totalDebit || 0]);
    clientInfoData.push(['إجمالي المدفوع', totals.totalPaid || 0]);
    clientInfoData.push(['المتبقي', Math.abs(totals.remaining || 0)]);
    clientInfoData.push(['إجمالي الخصومات', totals.totalDiscounts || 0]);
    clientInfoData.push(['دفعات مدفوعة', totals.paidRepayments || 0]);
    clientInfoData.push(['دفعات معلقة', totals.pendingRepayments || 0]);
    clientInfoData.push(['دفعات متأخرة', totals.overdueRepayments || 0]);

    // Loans Sheet
    if (clientDetails.loans && clientDetails.loans.length > 0) {
      clientInfoData.push(['']);
      clientInfoData.push(['السلف والدفعات']);
      clientInfoData.push(['']);
      // Reversed order for RTL - start from right
      clientInfoData.push(['الحالة', 'متأخرة', 'معلقة', 'مدفوعة', 'المتبقي', 'المدفوع', 'الخصم', 'الفائدة', 'المبلغ', 'كود السلفة']);

      clientDetails.loans.forEach(loan => {
        // Reversed order to match RTL direction
        clientInfoData.push([
          getStatusText(loan.remaining),
          loan.overdueCount || 0,
          loan.pendingCount || 0,
          loan.paidCount || 0,
          Math.abs(loan.remaining) || 0,
          loan.paidAmount || 0,
          loan.discount || 0,
          loan.interest || 0,
          loan.amount || 0,
          loan.code
        ]);
      });
    }

    // Create sheet
    const sheet = XLSX.utils.aoa_to_sheet(clientInfoData);
    
    // Auto-size columns
    sheet['!cols'] = [
      { wch: 20 },
      { wch: 25 }
    ];
    
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
    
    const fileName = `كشف_تحصيل_${clientDetails.client.name}_${dayjs().format('YYYY-MM-DD')}.xlsx`;
    saveAs(blob, fileName);
    
  } catch (error) {
    console.error('Excel export error:', error.message);
    throw error;
  }
};

export const exportClientCollectionsToExcel = async (clientsData) => {
  try {
    // Validate data
    if (!clientsData || !clientsData.data || !Array.isArray(clientsData.data) || clientsData.data.length === 0) {
      throw new Error('لا توجد بيانات للتصدير');
    }

    // Create workbook
    const workbook = XLSX.utils.book_new();
    
    // Summary data
    const summaryData = [
      ['كشف تحصيل العملاء'],
      [`تاريخ التصدير: ${dayjs().format('DD/MM/YYYY HH:mm')}`],
      [`إجمالي العملاء: ${clientsData.totalClients || clientsData.data.length}`],
      [''],
      ['ملخص الإحصائيات'],
      [''],
      ['إجمالي المديونية', clientsData.data.reduce((sum, c) => sum + (c.totalDebit || 0), 0)],
      ['إجمالي المدفوع', clientsData.data.reduce((sum, c) => sum + (c.totalPaid || 0), 0)],
      ['إجمالي المتبقي', clientsData.data.reduce((sum, c) => sum + (Math.abs(c.remaining) || 0), 0)],
      [''],
      ['تفاصيل العملاء'],
      ['']
    ];
    
    // Clients data
    const clientsTableData = [
      ['اسم العميل', 'الهاتف', 'إجمالي المديونية', 'إجمالي المدفوع', 'المتبقي', 'الحالة', 'عدد القروض', 'عدد الدفعات']
    ];
    
    clientsData.data.forEach(client => {
      clientsTableData.push([
        client.name || '-',
        client.phone || '-',
        client.totalDebit || 0,
        client.totalPaid || 0,
        Math.abs(client.remaining) || 0,
        getStatusText(client.remaining),
        client.loansCount || 0,
        client.repaymentsCount || 0
      ]);
    });
    
    // Combine summary and table data
    const allData = [...summaryData, ...clientsTableData];
    
    // Create sheet
    const sheet = XLSX.utils.aoa_to_sheet(allData);
    
    // Auto-size columns
    sheet['!cols'] = [
      { wch: 25 }, // اسم العميل
      { wch: 15 }, // الهاتف
      { wch: 18 }, // إجمالي المديونية
      { wch: 18 }, // إجمالي المدفوع
      { wch: 15 }, // المتبقي
      { wch: 15 }, // الحالة
      { wch: 12 }, // عدد القروض
      { wch: 12 }  // عدد الدفعات
    ];
    
    // Style header row (row 12 in 0-indexed, which is row 13 in Excel)
    const headerRowIndex = summaryData.length;
    if (!sheet['!rows']) sheet['!rows'] = [];
    for (let col = 0; col < clientsTableData[0].length; col++) {
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
    
    const fileName = `كشف_تحصيل_العملاء_${dayjs().format('YYYY-MM-DD')}.xlsx`;
    saveAs(blob, fileName);
    
  } catch (error) {
    console.error('Excel export error:', error.message);
    throw error;
  }
};

