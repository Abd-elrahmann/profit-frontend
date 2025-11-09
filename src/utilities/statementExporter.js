import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

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
      doc.setFont('Amiri', 'normal');
      doc.setFontSize(16);
      
      // Title
      doc.text('كشف حساب العميل', 105, 20, { align: 'center' });
      doc.setFontSize(12);
      doc.text(`العميل: ${clientName}`, 105, 30, { align: 'center' });
      doc.text(`رقم الهوية: ${statementData.client.nationalId}`, 105, 37, { align: 'center' });
      
      // Summary section
      doc.setFontSize(10);
      let yPosition = 50;
      
      doc.text(`الرصيد الافتتاحي: ${statementData.openingBalance.toLocaleString('en-US')} ريال`, 14, yPosition);
      yPosition += 7;
      doc.text(`الرصيد الختامي: ${statementData.closingBalance.toLocaleString('en-US')} ريال`, 14, yPosition);
      yPosition += 7;
      doc.text(`إجمالي المدين: ${statementData.client.debit.toLocaleString('en-US')} ريال`, 14, yPosition);
      yPosition += 7;
      doc.text(`إجمالي الدائن: ${statementData.client.credit.toLocaleString('en-US')} ريال`, 14, yPosition);
      
      yPosition += 15;
      
      // Prepare table data (RTL order - reversed columns)
      const tableData = statementData.transactions.map(transaction => [
        transaction.balance.toLocaleString('en-US') + ' ريال',
        transaction.credit > 0 ? transaction.credit.toLocaleString('en-US') + ' ريال' : 0,
        transaction.debit > 0 ? transaction.debit.toLocaleString('en-US') + ' ريال' : 0,
        transaction.description,
        getTransactionTypeArabic(transaction.type),
        new Date(transaction.date).toLocaleDateString('en-US')
      ]);
      
      // Table headers (RTL order - reversed)
      const headers = [
        ['الرصيد', 'دائن', 'مدين', 'الوصف', 'نوع المعاملة', 'التاريخ']
      ];
      
      // Create table with RTL support
      autoTable(doc, {
        startY: yPosition,
        head: headers,
        body: tableData,
        theme: 'grid',
        tableLineColor: [0, 0, 0],
        tableLineWidth: 0.1,
        styles: {
          font: 'Amiri',
          fontStyle: 'normal',
          fontSize: 8,
          cellPadding: 2,
          lineColor: [0, 0, 0],
          lineWidth: 0.1
        },
        headStyles: {
          fillColor: [13, 64, 165],
          textColor: 255,
          fontStyle: 'bold',
          fontSize: 9
        },
        columnStyles: {
          0: { cellWidth: 25 }, // الرصيد
          1: { cellWidth: 25 }, // دائن
          2: { cellWidth: 25 }, // مدين
          3: { cellWidth: 50 }, // الوصف
          4: { cellWidth: 25 }, // نوع المعاملة
          5: { cellWidth: 25 }  // التاريخ
        },
        margin: { top: yPosition, right: 14, left: 14 },
        tableWidth: 'auto',
        horizontalPageBreak: true
      });
      
      // Footer
      const pageCount = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.text(
          `صفحة ${i} من ${pageCount}`,
          doc.internal.pageSize.width / 2,
          doc.internal.pageSize.height - 10,
          { align: 'center' }
        );
        doc.text(
          `تم الإنشاء في: ${new Date().toLocaleDateString('ar-SA')}`,
          doc.internal.pageSize.width - 14,
          doc.internal.pageSize.height - 10,
          { align: 'left' }
        );
      }
      
      // Save PDF
      const fileName = `كشف_حساب_${clientName}_${new Date().toISOString().split('T')[0]}.pdf`;
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
      'التاريخ': new Date(transaction.date).toLocaleDateString('en-US')
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
    
    const fileName = `كشف_حساب_${clientName}_${new Date().toISOString().split('T')[0]}.xlsx`;
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