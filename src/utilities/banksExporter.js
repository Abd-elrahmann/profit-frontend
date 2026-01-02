import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

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

export const exportBanksToPDF = async (banksData, searchQuery = '') => {
  return new Promise((resolve, reject) => {
    try {
      // Create new PDF document
      const doc = new jsPDF();
      
      // Register Arabic fonts
      registerArabicFonts(doc);
      
      // Set document properties
      doc.setProperties({
        title: 'الحسابات البنكية',
        subject: 'قائمة الحسابات البنكية',
        author: 'نظام إدارة السلف',
        keywords: 'بنوك, حسابات, سلف',
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
      doc.text('الحسابات البنكية', doc.internal.pageSize.width / 2, 25, { align: 'center' });
      
      // Search query info if exists
      if (searchQuery) {
        doc.setFontSize(11);
        doc.setFont('Amiri', 'bold');
        doc.text(`نتائج البحث عن: "${searchQuery}"`, doc.internal.pageSize.width / 2, 35, { align: 'center' });
      }
      
      // Summary section
      doc.setFontSize(11);
      doc.setFont('Amiri', 'bold');
      const summaryY = searchQuery ? 45 : 35;
      const activeBanks = banksData.filter(bank => bank.status === 'Active').length;
      const expiredBanks = banksData.filter(bank => bank.status === 'Expired').length;
      const totalBanks = banksData.length;
      
      const summaryText = `إجمالي الحسابات: ${totalBanks} | نشطة: ${activeBanks} | منتهية: ${expiredBanks} | تاريخ التصدير: ${dayjs().format('DD/MM/YYYY HH:mm')}`;
      doc.text(summaryText, doc.internal.pageSize.width / 2, summaryY, { align: 'center' });
      
      let yPosition = summaryY + 12;
      
      // Prepare table data (RTL order)
      const tableData = banksData.map(bank => [
        getStatusArabic(bank.status),
        bank.limit ? bank.limit.toLocaleString('en-US') : '0',
        bank.IBAN || '-',
        bank.accountNumber || '-',
        bank.owner || '-',
        bank.name || '-',
        bank.id.toString()
      ]);
      
      // Table headers (RTL order)
      const headers = [
        ['الحالة', 'السلف المسموح بها', 'رقم الايبان', 'رقم الحساب', 'اسم المالك', 'اسم الحساب', '#']
      ];
      
      // Create table with RTL support
      const pageWidth = doc.internal.pageSize.width;
      
      // Optimize column widths to fit on one page
      const columnWidths = {
        0: 18, // الحالة
        1: 28, // السلف المسموح بها
        2: 40, // رقم الايبان
        3: 25, // رقم الحساب
        4: 30, // اسم المالك
        5: 35, // اسم الحساب
        6: 12  // #
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
          fontSize: 8,
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
          fontSize: 9,
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
          0: { cellWidth: columnWidths[0], fontSize: 7 }, // الحالة
          1: { cellWidth: columnWidths[1], fontSize: 8 }, // السلف المسموح بها
          2: { cellWidth: columnWidths[2], fontSize: 7 }, // رقم الايبان
          3: { cellWidth: columnWidths[3], fontSize: 8 }, // رقم الحساب
          4: { cellWidth: columnWidths[4], fontSize: 8 }, // اسم المالك
          5: { cellWidth: columnWidths[5], fontSize: 8 }, // اسم الحساب
          6: { cellWidth: columnWidths[6], fontSize: 8 }  // #
        },
        margin: { top: yPosition, bottom: 20 },
        tableWidth: totalColumnWidth,
        horizontalPageBreak: false,
        pageBreak: 'auto',
        showHead: 'everyPage',
        didParseCell: function (data) {
          // Color code status cells
          if (data.column.index === 0) {
            if (data.cell.text[0] === 'نشط') {
              data.cell.styles.textColor = [46, 125, 50]; // Green for active
            } else if (data.cell.text[0] === 'منتهي') {
              data.cell.styles.textColor = [237, 108, 57]; // Orange for expired
            }
          }
          
          // Prevent cell content from being too wide
          if (data.cell.text && data.cell.text.length > 0) {
            const maxLength = data.column.index === 2 ? 20 : 15; // Longer for IBAN
            if (data.cell.text[0].length > maxLength) {
              data.cell.text[0] = data.cell.text[0].substring(0, maxLength) + '...';
            }
          }
        }
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
      const fileName = `الحسابات_البنكية_${dayjs().format('YYYY-MM-DD')}.pdf`;
      doc.save(fileName);
      resolve();
    } catch (error) {
      console.error('PDF export error:', error.message);
      reject(error);
    }
  });
};

export const exportBanksToExcel = async (banksData, searchQuery = '') => {
  try {
    // Lazy load XLSX library
    const XLSX = await import('xlsx');

    // Create workbook
    const workbook = XLSX.utils.book_new();
    
    // Calculate summary statistics
    const activeBanks = banksData.filter(bank => bank.status === 'Active').length;
    const expiredBanks = banksData.filter(bank => bank.status === 'Expired').length;
    const totalBanks = banksData.length;

    // Summary data
    const summaryData = [
      ['الحسابات البنكية'],
      [''],
      ['إحصائيات'],
      ['إجمالي الحسابات', totalBanks],
      ['الحسابات النشطة', activeBanks],
      ['الحسابات المنتهية', expiredBanks],
      ['تاريخ التصدير', dayjs().format('DD/MM/YYYY HH:mm')],
      ['']
    ];
    
    // Add search query if exists
    if (searchQuery) {
      summaryData.splice(2, 0, [`نتائج البحث عن: "${searchQuery}"`]);
    }
    
    // Banks data
    const banksSheetData = banksData.map(bank => ({
      '#': bank.id,
      'اسم الحساب': bank.name,
      'اسم المالك': bank.owner,
      'رقم الحساب': bank.accountNumber,
      'رقم الايبان': bank.IBAN,
      'السلف المسموح بها': bank.limit,
      'الحالة': getStatusArabic(bank.status)
    }));
    
    // Create summary sheet
    const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
    
    // Create banks sheet
    const banksSheet = XLSX.utils.json_to_sheet(banksSheetData);
    
    // Auto-size columns for better Excel display
    const wscols = [
      { wch: 8 },  // #
      { wch: 25 }, // اسم الحساب
      { wch: 20 }, // اسم المالك
      { wch: 20 }, // رقم الحساب
      { wch: 30 }, // رقم الايبان
      { wch: 18 }, // السلف المسموح بها
      { wch: 12 }  // الحالة
    ];
    banksSheet['!cols'] = wscols;
    
    // Add sheets to workbook
    XLSX.utils.book_append_sheet(workbook, summarySheet, 'ملخص');
    XLSX.utils.book_append_sheet(workbook, banksSheet, 'الحسابات البنكية');
    
    // Generate Excel file
    const excelBuffer = XLSX.write(workbook, { 
      bookType: 'xlsx', 
      type: 'array',
      bookSST: false 
    });
    
    const blob = new Blob([excelBuffer], { 
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
    });
    
    const fileName = `الحسابات_البنكية_${dayjs().format('YYYY-MM-DD')}.xlsx`;
    saveAs(blob, fileName);
    
  } catch (error) {
    console.error('Excel export error:', error.message);
    throw error;
  }
};

const getStatusArabic = (status) => {
  const statusMap = {
    'Active': 'نشط',
    'Expired': 'منتهي',
    'Pending': 'قيد الانتظار',
    'Suspended': 'موقوف'
  };
  return statusMap[status] || status;
};

