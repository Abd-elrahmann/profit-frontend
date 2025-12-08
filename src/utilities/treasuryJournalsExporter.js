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

export const exportJournalsToPDF = async (journalData, accountName) => {
  return new Promise((resolve, reject) => {
    try {
      // Validate data
      if (!journalData) {
        throw new Error('لا توجد بيانات للتصدير');
      }

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
      doc.text('سجل القيود المحاسبية', doc.internal.pageSize.width / 2, 25, { align: 'center' });
      
      doc.setFontSize(13);
      doc.setFont('Amiri', 'bold');
      doc.text(`الحساب: ${accountName}`, doc.internal.pageSize.width / 2, 35, { align: 'center' });
      
      // Collect all journals from journalsByMonth
      const allJournals = [];
      if (journalData.journalsByMonth) {
        Object.values(journalData.journalsByMonth).forEach(monthData => {
          if (monthData.entries && Array.isArray(monthData.entries)) {
            allJournals.push(...monthData.entries);
          }
        });
      }
      
      // Fallback to journals if journalsByMonth doesn't exist
      if (allJournals.length === 0 && journalData.journals && Array.isArray(journalData.journals)) {
        allJournals.push(...journalData.journals);
      }
      
      // Sort by date (newest first)
      allJournals.sort((a, b) => new Date(b.date) - new Date(a.date));
      
      // Calculate totals
      const totalDebit = allJournals.reduce((sum, journal) => sum + (journal.debit || 0), 0);
      const totalCredit = allJournals.reduce((sum, journal) => sum + (journal.credit || 0), 0);
      const currentBalance = journalData.account?.balance || 0;
      const totalJournals = allJournals.length;
      
      // Summary section - single row, centered
      doc.setFontSize(11);
      doc.setFont('Amiri', 'bold');
      const summaryY = 45;
      const summaryText = `إجمالي المدين: ${totalDebit.toLocaleString('en-US')}  |  إجمالي الدائن: ${totalCredit.toLocaleString('en-US')}  |  الرصيد الحالي: ${currentBalance.toLocaleString('en-US')}  |  عدد القيود: ${totalJournals}`;
      doc.text(summaryText, doc.internal.pageSize.width / 2, summaryY, { align: 'center' });
      
      let yPosition = summaryY + 12;
      
      // Prepare table data (RTL order)
      const tableData = [];
      allJournals.forEach(journal => {
        tableData.push([
          getJournalStatusArabic(journal.status),
          (journal.balance || 0).toLocaleString('en-US'),
          journal.credit > 0 ? journal.credit.toLocaleString('en-US') : '0',
          journal.debit > 0 ? journal.debit.toLocaleString('en-US') : '0',
          journal.description || '-',
          journal.reference || '-',
          journal.postedBy || 'غير محدد',
          dayjs(journal.date).format('DD/MM/YYYY HH:mm')
        ]);
      });
      
      // Table headers (RTL order)
      const headers = [
        ['الحالة', 'الرصيد', 'دائن', 'مدين', 'الوصف', 'المرجع', 'المرحل بواسطة', 'التاريخ']
      ];
      
      // Create table with RTL support - centered and larger, no extra borders
      const pageWidth = doc.internal.pageSize.width;
      
      // Optimize column widths to fit on one page
      const columnWidths = {
        0: 15, // الحالة
        1: 22, // الرصيد
        2: 20, // دائن
        3: 20, // مدين
        4: 40, // الوصف
        5: 20, // المرجع
        6: 25, // المرحل بواسطة
        7: 25  // التاريخ
      };
      
      // Calculate table width to center it properly
      const totalColumnWidth = Object.values(columnWidths).reduce((sum, width) => sum + width, 0);
      const tableStartX = (pageWidth - totalColumnWidth) / 2;
      
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
          0: { cellWidth: columnWidths[0], fontSize: 7 }, // الحالة
          1: { cellWidth: columnWidths[1], fontSize: 8 }, // الرصيد
          2: { cellWidth: columnWidths[2], fontSize: 8 }, // دائن
          3: { cellWidth: columnWidths[3], fontSize: 8 }, // مدين
          4: { cellWidth: columnWidths[4], fontSize: 7, halign: 'right' }, // الوصف
          5: { cellWidth: columnWidths[5], fontSize: 7 }, // المرجع
          6: { cellWidth: columnWidths[6], fontSize: 7 }, // المرحل بواسطة
          7: { cellWidth: columnWidths[7], fontSize: 7 }  // التاريخ
        },
        margin: { top: yPosition, bottom: 20 },
        tableWidth: totalColumnWidth,
        horizontalPageBreak: false, // Disable horizontal page break to keep headers together
        pageBreak: 'auto',
        showHead: 'everyPage',
        didParseCell: function (data) {
          // Prevent cell content from being too wide
          if (data.cell.text && data.cell.text.length > 0) {
            const maxLength = data.column.index === 4 ? 40 : 20; // Longer for description
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
    // Validate data
    if (!journalData) {
      throw new Error('لا توجد بيانات للتصدير');
    }

    // Collect all journals from journalsByMonth
    const allJournals = [];
    if (journalData.journalsByMonth) {
      Object.values(journalData.journalsByMonth).forEach(monthData => {
        if (monthData.entries && Array.isArray(monthData.entries)) {
          allJournals.push(...monthData.entries);
        }
      });
    }
    
    // Fallback to journals if journalsByMonth doesn't exist
    if (allJournals.length === 0 && journalData.journals && Array.isArray(journalData.journals)) {
      allJournals.push(...journalData.journals);
    }
    
    // Sort by date (newest first)
    allJournals.sort((a, b) => new Date(b.date) - new Date(a.date));

    // Create workbook
    const workbook = XLSX.utils.book_new();
    
    // Calculate totals
    const totalDebit = allJournals.reduce((sum, journal) => sum + (journal.debit || 0), 0);
    const totalCredit = allJournals.reduce((sum, journal) => sum + (journal.credit || 0), 0);
    const currentBalance = journalData.account?.balance || 0;
    const totalJournals = allJournals.length;
    
    // Summary data
    const summaryData = [
      ['سجل القيود المحاسبية'],
      [`الحساب: ${accountName}`],
      [''],
      ['إجمالي المدين', totalDebit],
      ['إجمالي الدائن', totalCredit],
      ['الرصيد الحالي', currentBalance],
      ['عدد القيود', totalJournals],
      ['']
    ];
    
    // Journals data
    const journalsData = [];
    allJournals.forEach(journal => {
      journalsData.push({
        'التاريخ': dayjs(journal.date).format('DD/MM/YYYY HH:mm'),
        'المرجع': journal.reference || '-',
        'الوصف': journal.description || '-',
        'مدين': journal.debit > 0 ? journal.debit : 0,
        'دائن': journal.credit > 0 ? journal.credit : 0,
        'الرصيد': journal.balance || 0,
        'الحالة': getJournalStatusArabic(journal.status),
        'المرحل بواسطة': journal.postedBy || 'غير محدد',
        'نوع القيد': getJournalTypeArabic(journal.type)
      });
    });
    
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
