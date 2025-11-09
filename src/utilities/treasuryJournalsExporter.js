import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import dayjs from 'dayjs';

// Register Arabic fonts
const registerArabicFonts = (doc) => {
  try {
    doc.addFont('/assets/fonts/Amiri-Regular.ttf', 'Amiri', 'normal');
    doc.addFont('/assets/fonts/Amiri-Bold.ttf', 'Amiri', 'bold');
  } catch (error) {
    console.warn('Arabic fonts not found, using default fonts', error);
  }
};

export const exportJournalsToPDF = async (journalData, accountName) => {
  return new Promise((resolve, reject) => {
    try {
      // Create new PDF document
      const doc = new jsPDF();
      
      // Register Arabic fonts
      registerArabicFonts(doc);
      
      // Set document properties
      doc.setProperties({
        title: `سجل القيود - ${accountName}`,
        subject: 'سجل القيود المحاسبية',
        author: 'نظام إدارة السلف',
        keywords: 'قيود, محاسبة, صندوق, سلف',
        creator: 'نظام إدارة السلف'
      });

      // Set Arabic as primary font
      doc.setFont('Amiri', 'normal');
      doc.setFontSize(16);
      
      // Title
      doc.text('سجل القيود المحاسبية', 105, 20, { align: 'center' });
      doc.setFontSize(12);
      doc.text(`الحساب: ${accountName}`, 105, 30, { align: 'center' });
      doc.text(`إجمالي القيود: ${journalData.totalJournalEntries}`, 105, 37, { align: 'center' });
      
      // Summary section
      doc.setFontSize(10);
      let yPosition = 50;
      
      doc.text(`الرصيد الحالي: ${journalData.account.balance.toLocaleString('en-US')} ريال`, 14, yPosition);
      yPosition += 7;
      doc.text(`إجمالي المدين: ${journalData.account.debit.toLocaleString('en-US')} ريال`, 14, yPosition);
      yPosition += 7;
      doc.text(`إجمالي الدائن: ${journalData.account.credit.toLocaleString('en-US')} ريال`, 14, yPosition);
      yPosition += 7;
      doc.text(`عدد القيود: ${journalData.totalJournalEntries}`, 14, yPosition);
      
      yPosition += 15;
      
      // Prepare table data (RTL order)
      const tableData = journalData.journals.map(journal => [
        journal.balance.toLocaleString('en-US') + ' ريال',
        journal.credit > 0 ? journal.credit.toLocaleString('en-US') + ' ريال' : '0',
        journal.debit > 0 ? journal.debit.toLocaleString('en-US') + ' ريال' : '0',
        journal.description,
        journal.postedBy || 'غير محدد',
        getJournalStatusArabic(journal.status),
        journal.reference,
        dayjs(journal.date).format('DD/MM/YYYY HH:mm')
      ]);
      
      // Table headers (RTL order)
      const headers = [
        ['الرصيد', 'دائن', 'مدين', 'الوصف', 'المرحل بواسطة', 'الحالة', 'المرجع', 'التاريخ']
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
          fontStyle: 'bold',
          fontSize: 7,
          cellPadding: 2,
          lineColor: [0, 0, 0],
          lineWidth: 0.1,
          halign: 'center'
        },
        headStyles: {
          fillColor: [13, 64, 165],
          textColor: 255,
          fontStyle: 'bold',
          fontSize: 8,
          halign: 'center'
        },
        bodyStyles: {
          halign: 'center',
          fontStyle: 'bold'
        },
        columnStyles: {
          0: { cellWidth: 20 }, // الرصيد
          1: { cellWidth: 18 }, // دائن
          2: { cellWidth: 18 }, // مدين
          3: { cellWidth: 40 }, // الوصف
          4: { cellWidth: 25 }, // المرحل بواسطة
          5: { cellWidth: 18 }, // الحالة
          6: { cellWidth: 25 }, // المرجع
          7: { cellWidth: 25 }  // التاريخ
        },
        margin: { top: yPosition, right: 10, left: 10 },
        tableWidth: 'wrap',
        horizontalPageBreak: true,
        pageBreak: 'auto'
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
          doc.internal.pageSize.width - 10,
          doc.internal.pageSize.height - 10,
          { align: 'left' }
        );
      }
      
      // Save PDF
      const fileName = `سجل_القيود_${accountName}_${dayjs().format('YYYY-MM-DD')}.pdf`;
      doc.save(fileName);
      resolve();
    } catch (error) {
      console.error('PDF export error:', error.message);
      reject(error);
    }
  });
};

export const exportJournalsToExcel = async (journalData, accountName) => {
  try {
    // Create workbook
    const workbook = XLSX.utils.book_new();
    
    // Summary data
    const summaryData = [
      ['سجل القيود المحاسبية'],
      [`الحساب: ${accountName}`],
      [`تاريخ التصدير: ${new Date().toLocaleDateString('ar-SA')}`],
      [''],
      ['الرصيد الحالي', journalData.account.balance],
      ['إجمالي المدين', journalData.account.debit],
      ['إجمالي الدائن', journalData.account.credit],
      ['عدد القيود', journalData.totalJournalEntries],
      ['']
    ];
    
    // Transactions data (RTL order - matching PDF)
    const journalsData = journalData.journals.map(journal => ({
      'التاريخ': dayjs(journal.date).format('DD/MM/YYYY HH:mm'),
      'المرجع': journal.reference,
      'الوصف': journal.description,
      'مدين': journal.debit > 0 ? journal.debit : 0,
      'دائن': journal.credit > 0 ? journal.credit : 0,
      'الرصيد': journal.balance,
      'الحالة': getJournalStatusArabic(journal.status),
      'المرحل بواسطة': journal.postedBy || 'غير محدد',
      'نوع القيد': getJournalTypeArabic(journal.type)
    }));
    
    // Create summary sheet
    const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
    
    // Create journals sheet
    const journalsSheet = XLSX.utils.json_to_sheet(journalsData);
    
    // Auto-size columns for better Excel display
    const wscols = [
      { wch: 20 }, // التاريخ
      { wch: 15 }, // المرجع
      { wch: 40 }, // الوصف
      { wch: 12 }, // مدين
      { wch: 12 }, // دائن
      { wch: 15 }, // الرصيد
      { wch: 10 }, // الحالة
      { wch: 15 }, // المرحل بواسطة
      { wch: 15 }  // نوع القيد
    ];
    journalsSheet['!cols'] = wscols;
    
    // Add sheets to workbook
    XLSX.utils.book_append_sheet(workbook, summarySheet, 'ملخص');
    XLSX.utils.book_append_sheet(workbook, journalsSheet, 'القيود');
    
    // Generate Excel file
    const excelBuffer = XLSX.write(workbook, { 
      bookType: 'xlsx', 
      type: 'array',
      bookSST: false 
    });
    
    const blob = new Blob([excelBuffer], { 
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
    });
    
    const fileName = `سجل_القيود_${accountName}_${dayjs().format('YYYY-MM-DD')}.xlsx`;
    saveAs(blob, fileName);
    
  } catch (error) {
    console.error('Excel export error:', error.message);
    throw error;
  }
};


const getJournalStatusArabic = (status) => {
  const statusMap = {
    'POSTED': 'مرحل',
    'DRAFT': 'مسودة',
    'PENDING': 'قيد الانتظار',
    'CANCELLED': 'ملغي'
  };
  return statusMap[status] || status;
};

const getJournalTypeArabic = (type) => {
  const typeMap = {
    'GENERAL': 'عام',
    'LOAN_DISBURSEMENT': 'صرف سلفة',
    'REPAYMENT': 'سداد',
    'CAPITAL': 'رأس المال',
    'WITHDRAWAL': 'سحب',
    'DEPOSIT': 'إيداع'
  };
  return typeMap[type] || type;
};