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

export const exportGeneralLedgerToPDF = async (ledgerData, account, searchParams) => {
  return new Promise((resolve, reject) => {
    try {
      // Create new PDF document
      const doc = new jsPDF();
      
      // Register Arabic fonts
      registerArabicFonts(doc);
      
      // Set document properties
      doc.setProperties({
        title: `دفتر الأستاذ - ${account.name}`,
        subject: 'دفتر الأستاذ العام',
        author: 'نظام إدارة السلف',
        keywords: 'دفتر, أستاذ, محاسبة, سلف',
        creator: 'نظام إدارة السلف'
      });

      // Set Arabic as primary font
      doc.setFont('Amiri', 'normal');
      doc.setFontSize(16);
      
      // Title
      doc.text('دفتر الأستاذ العام', 105, 20, { align: 'center' });
      doc.setFontSize(12);
      doc.text(`الحساب: ${account.name} (${account.code})`, 105, 30, { align: 'center' });
      
      // Date range
      if (searchParams.fromDate || searchParams.toDate) {
        const fromDate = searchParams.fromDate ? dayjs(searchParams.fromDate).format('DD/MM/YYYY') : 'بداية';
        const toDate = searchParams.toDate ? dayjs(searchParams.toDate).format('DD/MM/YYYY') : 'نهاية';
        doc.text(`الفترة: من ${fromDate} إلى ${toDate}`, 105, 37, { align: 'center' });
      }
      
      // Summary section
      doc.setFontSize(10);
      let yPosition = 50;
      
      doc.text(`الرصيد الافتتاحي: ${ledgerData.openingBalance?.toLocaleString('en-US') || 0} ريال`, 14, yPosition);
      yPosition += 7;
      doc.text(`إجمالي المدين: ${ledgerData.totalDebit?.toLocaleString('en-US') || 0} ريال`, 14, yPosition);
      yPosition += 7;
      doc.text(`إجمالي الدائن: ${ledgerData.totalCredit?.toLocaleString('en-US') || 0} ريال`, 14, yPosition);
      yPosition += 7;
      doc.text(`الرصيد الختامي: ${ledgerData.closingBalance?.toLocaleString('en-US') || 0} ريال`, 14, yPosition);
      yPosition += 7;
      doc.text(`عدد القيود: ${ledgerData.journals?.length || 0}`, 14, yPosition);
      
      yPosition += 15;
      
      // Prepare table data (RTL order)
      const tableData = ledgerData.journals?.map(journal => [
        journal.balance.toLocaleString('en-US') + ' ريال',
        journal.credit > 0 ? journal.credit.toLocaleString('en-US') + ' ريال' : '0',
        journal.debit > 0 ? journal.debit.toLocaleString('en-US') + ' ريال' : '0',
        journal.description || '-',
        journal.reference || '-',
        dayjs(journal.date).format('DD/MM/YYYY HH:mm')
      ]) || [];
      
      // Table headers (RTL order)
      const headers = [
        ['الرصيد', 'دائن', 'مدين', 'الوصف', 'المرجع', 'التاريخ']
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
          halign: 'center'
        },
        columnStyles: {
          0: { cellWidth: 25 }, // الرصيد
          1: { cellWidth: 20 }, // دائن
          2: { cellWidth: 20 }, // مدين
          3: { cellWidth: 50 }, // الوصف
          4: { cellWidth: 25 }, // المرجع
          5: { cellWidth: 25 }  // التاريخ
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
      const fileName = `دفتر_الأستاذ_${account.name}_${dayjs().format('YYYY-MM-DD')}.pdf`;
      doc.save(fileName);
      resolve();
    } catch (error) {
      console.error('PDF export error:', error.message);
      reject(error);
    }
  });
};

export const exportGeneralLedgerToExcel = async (ledgerData, account, searchParams) => {
  try {
    // Create workbook
    const workbook = XLSX.utils.book_new();
    
    // Summary data
    const summaryData = [
      ['دفتر الأستاذ العام'],
      [`الحساب: ${account.name}`],
      [`كود الحساب: ${account.code}`],
      [`نوع الحساب: ${getAccountTypeArabic(account.type)}`],
      [''],
      ['الرصيد الافتتاحي', ledgerData.openingBalance || 0],
      ['إجمالي المدين', ledgerData.totalDebit || 0],
      ['إجمالي الدائن', ledgerData.totalCredit || 0],
      ['الرصيد الختامي', ledgerData.closingBalance || 0],
      ['عدد القيود', ledgerData.journals?.length || 0],
      ['']
    ];
    
    // Add date range if exists
    if (searchParams.fromDate || searchParams.toDate) {
      const fromDate = searchParams.fromDate ? dayjs(searchParams.fromDate).format('DD/MM/YYYY') : 'بداية';
      const toDate = searchParams.toDate ? dayjs(searchParams.toDate).format('DD/MM/YYYY') : 'نهاية';
      summaryData.splice(4, 0, [`الفترة: من ${fromDate} إلى ${toDate}`]);
    }
    
    // Journals data
    const journalsData = ledgerData.journals?.map(journal => ({
      'التاريخ': dayjs(journal.date).format('DD/MM/YYYY HH:mm'),
      'المرجع': journal.reference || '-',
      'الوصف': journal.description || '-',
      'مدين': journal.debit > 0 ? journal.debit : 0,
      'دائن': journal.credit > 0 ? journal.credit : 0,
      'الرصيد': journal.balance,
      'الحالة': getJournalStatusArabic(journal.status),
      'المرحل بواسطة': journal.postedBy || 'غير محدد'
    })) || [];
    
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
      { wch: 15 }  // المرحل بواسطة
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
    
    const fileName = `دفتر_الأستاذ_${account.name}_${dayjs().format('YYYY-MM-DD')}.xlsx`;
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

const getAccountTypeArabic = (type) => {
  const typeMap = {
    'ASSET': 'أصول',
    'LIABILITY': 'خصوم',
    'EQUITY': 'حقوق ملكية',
    'REVENUE': 'إيرادات',
    'EXPENSE': 'مصروفات'
  };
  return typeMap[type] || type;
};