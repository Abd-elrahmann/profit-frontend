import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import dayjs from 'dayjs';
import logo from '/assets/images/logo.webp';

// Register Arabic fonts (make sure these font files exist in your public/assets/fonts directory)
const registerArabicFonts = (doc) => {
  try {
    doc.addFont('/assets/fonts/Amiri-Regular.ttf', 'Amiri', 'normal');
    doc.addFont('/assets/fonts/Amiri-Bold.ttf', 'Amiri', 'bold');
  } catch (error) {
    console.warn('Arabic fonts not found, using default fonts', error);
  }
};

export const exportStatementToPDF = async (statementData, clientName) => {
  return new Promise((resolve, reject) => {
    try {
      // Create new PDF document
      const doc = new jsPDF();
      
      // Register Arabic fonts
      registerArabicFonts(doc);
      
      // Set document properties
      doc.setProperties({
        title: `كشف حساب - ${clientName}`,
        subject: 'كشف حساب العميل',
        author: 'نظام إدارة السلف',
        keywords: 'كشف, حساب, عميل, سلف',
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
      doc.text('كشف حساب العميل', doc.internal.pageSize.width / 2, 25, { align: 'center' });
      
      doc.setFontSize(13);
      doc.setFont('Amiri', 'bold');
      doc.text(`العميل: ${clientName}`, doc.internal.pageSize.width / 2, 35, { align: 'center' });
      doc.setFontSize(11);
      doc.text(`رقم الهوية: ${statementData.client.nationalId}`, doc.internal.pageSize.width / 2, 42, { align: 'center' });
      
      // Summary section - single row, centered
      doc.setFontSize(11);
      doc.setFont('Amiri', 'bold');
      const summaryY = 55;
      const summaryText = `الرصيد الافتتاحي: ${statementData.openingBalance.toLocaleString('en-US')}  |  الرصيد الختامي: ${statementData.closingBalance.toLocaleString('en-US')}  |  إجمالي المدين: ${statementData.client.debit.toLocaleString('en-US')}  |  إجمالي الدائن: ${statementData.client.credit.toLocaleString('en-US')}`;
      doc.text(summaryText, doc.internal.pageSize.width / 2, summaryY, { align: 'center' });
      
      let yPosition = summaryY + 12;
      
      // Prepare table data (RTL order - reversed columns)
      const tableData = statementData.transactions.map(transaction => [
        transaction.balance.toLocaleString('en-US'),
        transaction.credit > 0 ? transaction.credit.toLocaleString('en-US') : '0',
        transaction.debit > 0 ? transaction.debit.toLocaleString('en-US') : '0',
        transaction.description,
        getTransactionTypeArabic(transaction.type),
        dayjs(transaction.date).format('DD/MM/YYYY HH:mm')
      ]);
      
      // Table headers (RTL order - reversed)
      const headers = [
        ['الرصيد', 'دائن', 'مدين', 'الوصف', 'نوع المعاملة', 'التاريخ']
      ];
      
      // Optimize column widths to fit on one page
      const columnWidths = {
        0: 26, // الرصيد
        1: 22, // دائن
        2: 22, // مدين
        3: 45, // الوصف
        4: 25, // نوع المعاملة
        5: 26  // التاريخ
      };
      
      // Calculate table width to center it properly
      const pageWidth = doc.internal.pageSize.width;
      const totalColumnWidth = Object.values(columnWidths).reduce((sum, width) => sum + width, 0);
      const tableStartX = (pageWidth - totalColumnWidth) / 2;
      
      // Create table with RTL support - centered and larger, no extra borders
      autoTable(doc, {
        startY: yPosition,
        startX: tableStartX, // Center the table
        head: headers,
        body: tableData,
        theme: 'striped', // Simpler theme without heavy borders
        styles: {
          font: 'Amiri',
          fontStyle: 'bold',
          fontSize: 8,
          cellPadding: 3,
          lineColor: [200, 200, 200], // Lighter borders
          lineWidth: 0.1,
          halign: 'center',
          valign: 'middle'
        },
        headStyles: {
          fillColor: [13, 64, 165],
          textColor: 255,
          fontStyle: 'bold',
          fontSize: 9,
          halign: 'center',
          valign: 'middle',
          cellPadding: 4,
          lineColor: [13, 64, 165],
          lineWidth: 0.1
        },
        bodyStyles: {
          halign: 'center',
          valign: 'middle',
          cellPadding: 2,
          lineColor: [220, 220, 220],
          lineWidth: 0.1
        },
        alternateRowStyles: {
          fillColor: [250, 250, 250]
        },
        columnStyles: {
          0: { cellWidth: columnWidths[0], fontSize: 8 }, // الرصيد
          1: { cellWidth: columnWidths[1], fontSize: 8 }, // دائن
          2: { cellWidth: columnWidths[2], fontSize: 8 }, // مدين
          3: { cellWidth: columnWidths[3], fontSize: 7, halign: 'right' }, // الوصف
          4: { cellWidth: columnWidths[4], fontSize: 7 }, // نوع المعاملة
          5: { cellWidth: columnWidths[5], fontSize: 7 }  // التاريخ
        },
        margin: { top: yPosition, bottom: 20 },
        tableWidth: totalColumnWidth,
        horizontalPageBreak: false, // Disable horizontal page break to keep headers together
        pageBreak: 'auto',
        showHead: 'everyPage',
        didParseCell: function (data) {
          // Prevent cell content from being too wide
          if (data.cell.text && data.cell.text.length > 0) {
            const maxLength = data.column.index === 3 ? 40 : 20; // Longer for description
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
      const fileName = `كشف_حساب_${clientName}_${dayjs().format('YYYY-MM-DD')}.pdf`;
      doc.save(fileName);
      resolve();
    } catch (error) {
      console.error('PDF export error:', error.message);
      reject(error);
    }
  });
};

export const exportStatementToExcel = async (statementData, clientName) => {
  try {
    // Create workbook
    const workbook = XLSX.utils.book_new();
    
    // Summary data
    const summaryData = [
      ['كشف حساب العميل'],
      [`العميل: ${clientName}`],
      [`رقم الهوية: ${statementData.client.nationalId}`],
      [''],
      ['الرصيد الافتتاحي', statementData.openingBalance],
      ['الرصيد الختامي', statementData.closingBalance],
      ['إجمالي المدين', statementData.client.debit],
      ['إجمالي الدائن', statementData.client.credit],
      ['']
    ];
    
    // Transactions data (RTL order - matching PDF)
    const transactionsData = statementData.transactions.map(transaction => ({
      'الرصيد': transaction.balance,
      'دائن': transaction.credit > 0 ? transaction.credit : '-',
      'مدين': transaction.debit > 0 ? transaction.debit : '-',
      'الوصف': transaction.description,
      'نوع المعاملة': getTransactionTypeArabic(transaction.type),
      'التاريخ': dayjs(transaction.date).format('DD/MM/YYYY HH:mm')
    }));
    
    // Create summary sheet
    const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
    
    // Create transactions sheet
    const transactionsSheet = XLSX.utils.json_to_sheet(transactionsData);
    
    // Add sheets to workbook
    XLSX.utils.book_append_sheet(workbook, summarySheet, 'ملخص');
    XLSX.utils.book_append_sheet(workbook, transactionsSheet, 'المعاملات');
    
    // Generate Excel file
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { 
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
    });
    
    const fileName = `كشف_حساب_${clientName}_${dayjs().format('YYYY-MM-DD')}.xlsx`;
    saveAs(blob, fileName);
    
  } catch (error) {
    console.error('Excel export error:', error.message);
    throw error;
  }
};

const getTransactionTypeArabic = (type) => {
  const types = {
    'LOAN_DISBURSEMENT': 'صرف سلفة',
    'REPAYMENT': 'سداد',
    'ADJUSTMENT': 'تعديل',
    'INTEREST': 'فائدة'
  };
  return types[type] || type;
};