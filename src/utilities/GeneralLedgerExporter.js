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
      doc.text('دفتر الأستاذ العام', doc.internal.pageSize.width / 2, 25, { align: 'center' });
      
      doc.setFontSize(13);
      doc.setFont('Amiri', 'bold');
      doc.text(`الحساب: ${account.name} (${account.code})`, doc.internal.pageSize.width / 2, 35, { align: 'center' });
      
      // Date range
      if (searchParams.fromDate || searchParams.toDate) {
        const fromDate = searchParams.fromDate ? dayjs(searchParams.fromDate).format('DD/MM/YYYY') : 'بداية';
        const toDate = searchParams.toDate ? dayjs(searchParams.toDate).format('DD/MM/YYYY') : 'نهاية';
        doc.setFontSize(11);
        doc.text(`الفترة: من ${fromDate} إلى ${toDate}`, doc.internal.pageSize.width / 2, 42, { align: 'center' });
      }
      
      // Calculate totals from journal lines
      const totalDebit = ledgerData.journals?.reduce((sum, journal) => {
        return sum + journal.lines.reduce((lineSum, line) => lineSum + (line.debit || 0), 0);
      }, 0) || 0;
      
      const totalCredit = ledgerData.journals?.reduce((sum, journal) => {
        return sum + journal.lines.reduce((lineSum, line) => lineSum + (line.credit || 0), 0);
      }, 0) || 0;
      
      const closingBalance = ledgerData.account?.balance || 0;
      
      // Summary section - single row, centered
      doc.setFontSize(11);
      doc.setFont('Amiri', 'bold');
      const summaryY = 55;
      const summaryText = `إجمالي المدين: ${totalDebit.toLocaleString('en-US')}  |  إجمالي الدائن: ${totalCredit.toLocaleString('en-US')}  |  الرصيد الختامي: ${closingBalance.toLocaleString('en-US')}  |  عدد القيود: ${ledgerData.totalJournals || 0}`;
      doc.text(summaryText, doc.internal.pageSize.width / 2, summaryY, { align: 'center' });
      
      let yPosition = summaryY + 12;
      
      // Prepare table data (RTL order) - flatten journal lines
      const tableData = [];
      ledgerData.journals?.forEach(journal => {
        journal.lines.forEach(line => {
          tableData.push([
            line.balance.toLocaleString('en-US'),
            line.credit > 0 ? line.credit.toLocaleString('en-US') : '0',
            line.debit > 0 ? line.debit.toLocaleString('en-US') : '0',
            line.description || journal.description || '-',
            journal.reference || '-',
            dayjs(journal.date).format('DD/MM/YYYY HH:mm')
          ]);
        });
      });
      
      // Table headers (RTL order)
      const headers = [
        ['الرصيد', 'دائن', 'مدين', 'الوصف', 'المرجع', 'التاريخ']
      ];
      
      // Create table with RTL support - centered and larger, no extra borders
      const pageWidth = doc.internal.pageSize.width;
      
      // Optimize column widths to fit on one page - reduce widths to ensure all headers fit
      const columnWidths = {
        1: 26, // الرصيد
        2: 22, // دائن
        3: 22, // مدين
        4: 45, // الوصف
        5: 22, // المرجع
        6: 26  // التاريخ
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
          fillColor: [240, 249, 244],
          textColor: [46, 139, 69],
          fontStyle: 'bold',
          fontSize: 9,
          halign: 'center',
          valign: 'middle',
          cellPadding: 4,
          lineColor: [13, 64, 165],
          lineWidth: 0.1
        },
        bodyStyles: {
          fontStyle: 'bold',
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
          1: { cellWidth: columnWidths[1], fontSize: 8 }, // الرصيد
          2: { cellWidth: columnWidths[2], fontSize: 8 }, // دائن
          3: { cellWidth: columnWidths[3], fontSize: 8 }, // مدين
          4: { cellWidth: columnWidths[4], fontSize: 7, halign: 'right' }, // الوصف
          5: { cellWidth: columnWidths[5], fontSize: 7 }, // المرجع
          6: { cellWidth: columnWidths[6], fontSize: 7 }  // التاريخ
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
    
    // Calculate totals from journal lines
    const totalDebit = ledgerData.journals?.reduce((sum, journal) => {
      return sum + journal.lines.reduce((lineSum, line) => lineSum + (line.debit || 0), 0);
    }, 0) || 0;
    
    const totalCredit = ledgerData.journals?.reduce((sum, journal) => {
      return sum + journal.lines.reduce((lineSum, line) => lineSum + (line.credit || 0), 0);
    }, 0) || 0;
    
    const closingBalance = ledgerData.account?.balance || 0;

    // Summary data
    const summaryData = [
      ['دفتر الأستاذ العام'],
      [`الحساب: ${account.name}`],
      [`كود الحساب: ${account.code}`],
      [`نوع الحساب: ${getAccountTypeArabic(account.type)}`],
      [''],
      ['إجمالي المدين', totalDebit],
      ['إجمالي الدائن', totalCredit],
      ['الرصيد الختامي', closingBalance],
      ['عدد القيود', ledgerData.totalJournals || 0],
      ['']
    ];
    
    // Add date range if exists
    if (searchParams.fromDate || searchParams.toDate) {
      const fromDate = searchParams.fromDate ? dayjs(searchParams.fromDate).format('DD/MM/YYYY') : 'بداية';
      const toDate = searchParams.toDate ? dayjs(searchParams.toDate).format('DD/MM/YYYY') : 'نهاية';
      summaryData.splice(4, 0, [`الفترة: من ${fromDate} إلى ${toDate}`]);
    }
    
    // Journals data - flatten journal lines
    const journalsData = [];
    ledgerData.journals?.forEach(journal => {
      journal.lines.forEach(line => {
        journalsData.push({
          'التاريخ': dayjs(journal.date).format('DD/MM/YYYY HH:mm'),
          'المرجع': journal.reference || '-',
          'الوصف': line.description || journal.description || '-',
          'مدين': line.debit > 0 ? line.debit : 0,
          'دائن': line.credit > 0 ? line.credit : 0,
          'الرصيد': line.balance,
          'المرحل بواسطة': journal.postedBy || 'غير محدد'
        });
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