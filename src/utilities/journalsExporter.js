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

export const exportJournalToPDF = async (journalData) => {
  return new Promise((resolve, reject) => {
    try {
      // Create new PDF document
      const doc = new jsPDF();
      
      // Register Arabic fonts
      registerArabicFonts(doc);
      
      // Set document properties
      doc.setProperties({
        title: `قيد محاسبي - ${journalData.reference || journalData.id}`,
        subject: 'تفاصيل القيد المحاسبي',
        author: 'نظام إدارة السلف',
        keywords: 'قيد, محاسبة, سلف',
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
      doc.text('تفاصيل القيد المحاسبي', doc.internal.pageSize.width / 2, 25, { align: 'center' });
      
      doc.setFontSize(13);
      doc.setFont('Amiri', 'bold');
      doc.text(`رقم القيد: ${journalData.reference || journalData.id}`, doc.internal.pageSize.width / 2, 35, { align: 'center' });
      
      // Journal header info as a table
      const headerTableY = 42;
      const headerTableData = [
        ['التاريخ', dayjs(journalData.date).format('DD/MM/YYYY')],
        ['نوع القيد', getJournalTypeArabic(journalData.type)],
        ['الوصف', journalData.description || '-'],
        ['الحالة', getJournalStatusArabic(journalData.status)],
        ['نوع المصدر', getJournalSourceTypeText(journalData.sourceType)],
        ['المعتمد بواسطة', journalData.postedBy?.name || 'لم يتم الاعتماد']
      ];
      
      const headerTableHeaders = [['المعلومة', 'القيمة']];
      const pageWidth = doc.internal.pageSize.width;
      const headerTableWidth = 100;
      // Calculate left margin to center the table exactly
      const leftMargin = (pageWidth - headerTableWidth) / 2;
      
      autoTable(doc, {
        startY: headerTableY,
        head: headerTableHeaders,
        body: headerTableData,
        theme: 'striped',
        styles: {
          font: 'Amiri',
          fontStyle: 'bold',
          fontSize: 9,
          cellPadding: 3,
          lineColor: [200, 200, 200],
          lineWidth: 0.1,
          halign: 'right',
          valign: 'middle'
        },
        headStyles: {
          fillColor: [13, 64, 165],
          textColor: 255,
          fontStyle: 'bold',
          fontSize: 10,
          halign: 'center',
          valign: 'middle',
          cellPadding: 4
        },
        bodyStyles: {
          halign: 'right',
          valign: 'middle',
          cellPadding: 3
        },
        columnStyles: {
          0: { cellWidth: 40, halign: 'right', fontStyle: 'bold' }, // المعلومة
          1: { cellWidth: 60, halign: 'right' }  // القيمة
        },
        margin: { 
          top: headerTableY, 
          left: leftMargin,
          right: leftMargin,
          bottom: 5 
        },
        tableWidth: headerTableWidth,
        horizontalPageBreak: false
      });
      
      let yPosition = doc.lastAutoTable.finalY + 8;
      
      // Calculate totals
      const totalDebit = journalData.lines?.reduce((sum, line) => sum + (line.debit || 0), 0) || 0;
      const totalCredit = journalData.lines?.reduce((sum, line) => sum + (line.credit || 0), 0) || 0;
      const balance = totalDebit - totalCredit;
      
      // Summary section
      doc.setFontSize(11);
      doc.setFont('Amiri', 'bold');
      const summaryY = yPosition;
      const summaryText = `إجمالي المدين: ${totalDebit.toLocaleString('en-US')}  |  إجمالي الدائن: ${totalCredit.toLocaleString('en-US')}  |  الفرق: ${balance.toLocaleString('en-US')}  |  عدد البنود: ${journalData.lines?.length || 0}`;
      doc.text(summaryText, doc.internal.pageSize.width / 2, summaryY, { align: 'center' });
      
      yPosition = summaryY + 12;
      
      // Prepare table data for journal lines (RTL order)
      const tableData = [];
      journalData.lines?.forEach(line => {
        tableData.push([
          line.balance?.toLocaleString('en-US'),
          line.credit > 0 ? line.credit.toLocaleString('en-US') : '0',
          line.debit > 0 ? line.debit.toLocaleString('en-US') : '0',
          line.description || '-',
          `${line.account?.code || ''} - ${line.account?.name || ''}`
        ]);
      });
      
      // Add totals row
      tableData.push([
        balance.toLocaleString('en-US'),
        totalCredit.toLocaleString('en-US'),
        totalDebit.toLocaleString('en-US'),
        'الإجمالي',
        ''
      ]);
      
      // Table headers (RTL order)
      const headers = [
        ['الرصيد', 'دائن', 'مدين', 'الوصف', 'الحساب']
      ];
      
      // Optimize column widths - increase account column width
      const columnWidths = {
        0: 25, // الرصيد
        1: 25, // دائن
        2: 25, // مدين
        3: 50, // الوصف
        4: 55  // الحساب - increased to show full account name
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
          fillColor: [13, 64, 165],
          textColor: 255,
          fontStyle: 'bold',
          fontSize: 9,
          halign: 'center',
          valign: 'middle',
          cellPadding: 4
        },
        bodyStyles: {
          halign: 'center',
          valign: 'middle',
          cellPadding: 2
        },
        alternateRowStyles: {
          fillColor: [250, 250, 250]
        },
        columnStyles: {
          0: { cellWidth: columnWidths[0], fontSize: 8 }, // الرصيد
          1: { cellWidth: columnWidths[1], fontSize: 8 }, // دائن
          2: { cellWidth: columnWidths[2], fontSize: 8 }, // مدين
          3: { cellWidth: columnWidths[3], fontSize: 7, halign: 'right' }, // الوصف
          4: { cellWidth: columnWidths[4], fontSize: 7, halign: 'right', overflow: 'linebreak' }  // الحساب - allow wrapping
        },
        margin: { top: yPosition, bottom: 20 },
        tableWidth: totalColumnWidth,
        horizontalPageBreak: false,
        pageBreak: 'auto',
        showHead: 'everyPage',
        didParseCell: function (data) {
          // Style the totals row
          if (data.row.index === tableData.length - 1) {
            data.cell.styles.fillColor = [240, 240, 240];
            data.cell.styles.fontStyle = 'bold';
            data.cell.styles.fontSize = 9;
          }
          
          // Prevent cell content from being too wide - but allow account name to wrap
          if (data.cell.text && data.cell.text.length > 0 && data.column.index !== 4) {
            // Don't truncate account column (index 4), allow it to wrap
            const maxLength = data.column.index === 3 ? 40 : 25;
            if (data.cell.text[0].length > maxLength) {
              data.cell.text[0] = data.cell.text[0].substring(0, maxLength) + '...';
            }
          }
          
          // Enable text wrapping for account column
          if (data.column.index === 4) {
            data.cell.styles.cellPadding = 3;
            data.cell.styles.halign = 'right';
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
      const fileName = `قيد_${journalData.reference || journalData.id}_${dayjs().format('YYYY-MM-DD')}.pdf`;
      doc.save(fileName);
      resolve();
    } catch (error) {
      console.error('PDF export error:', error.message);
      reject(error);
    }
  });
};

export const exportJournalToExcel = async (journalData) => {
  try {
    // Create workbook
    const workbook = XLSX.utils.book_new();
    
    // Calculate totals
    const totalDebit = journalData.lines?.reduce((sum, line) => sum + (line.debit || 0), 0) || 0;
    const totalCredit = journalData.lines?.reduce((sum, line) => sum + (line.credit || 0), 0) || 0;
    const balance = totalDebit - totalCredit;

    // Journal header data
    const headerData = [
      ['تفاصيل القيد المحاسبي'],
      [''],
      ['معلومات القيد'],
      ['رقم القيد', journalData.reference || journalData.id],
      ['التاريخ', dayjs(journalData.date).format('DD/MM/YYYY')],
      ['نوع القيد', getJournalTypeArabic(journalData.type)],
      ['الوصف', journalData.description || '-'],
      ['الحالة', getJournalStatusArabic(journalData.status)],
      ['نوع المصدر', getJournalSourceTypeText(journalData.sourceType)],
      ['المعتمد بواسطة', journalData.postedBy?.name || 'لم يتم الاعتماد'],
      [''],
      ['الإجماليات'],
      ['إجمالي المدين', totalDebit],
      ['إجمالي الدائن', totalCredit],
      ['الفرق', balance],
      ['عدد البنود', journalData.lines?.length || 0],
      ['']
    ];
    
    // Journal lines data
    const linesData = journalData.lines?.map(line => ({
      'الحساب': `${line.account?.code || ''} - ${line.account?.name || ''}`,
      'الوصف': line.description || '-',
      'مدين': line.debit > 0 ? line.debit : 0,
      'دائن': line.credit > 0 ? line.credit : 0,
      'الرصيد': line.balance || (line.debit - line.credit)
    })) || [];
    
    // Add totals row
    linesData.push({
      'الحساب': '',
      'الوصف': 'الإجمالي',
      'مدين': totalDebit,
      'دائن': totalCredit,
      'الرصيد': balance
    });
    
    // Create header sheet
    const headerSheet = XLSX.utils.aoa_to_sheet(headerData);
    
    // Create lines sheet
    const linesSheet = XLSX.utils.json_to_sheet(linesData);
    
    // Auto-size columns for better Excel display
    const headerCols = [
      { wch: 20 },
      { wch: 30 }
    ];
    headerSheet['!cols'] = headerCols;
    
    const linesCols = [
      { wch: 30 }, // الحساب
      { wch: 40 }, // الوصف
      { wch: 15 }, // مدين
      { wch: 15 }, // دائن
      { wch: 15 }  // الرصيد
    ];
    linesSheet['!cols'] = linesCols;
    
    // Add sheets to workbook
    XLSX.utils.book_append_sheet(workbook, headerSheet, 'معلومات القيد');
    XLSX.utils.book_append_sheet(workbook, linesSheet, 'بنود القيد');
    
    // Generate Excel file
    const excelBuffer = XLSX.write(workbook, { 
      bookType: 'xlsx', 
      type: 'array',
      bookSST: false 
    });
    
    const blob = new Blob([excelBuffer], { 
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
    });
    
    const fileName = `قيد_${journalData.reference || journalData.id}_${dayjs().format('YYYY-MM-DD')}.xlsx`;
    saveAs(blob, fileName);
    
  } catch (error) {
    console.error('Excel export error:', error.message);
    throw error;
  }
};

const getJournalStatusArabic = (status) => {
  const statusMap = {
    'POSTED': 'معتمد',
    'DRAFT': 'مسودة',
    'PENDING': 'قيد الانتظار',
    'CANCELLED': 'ملغي'
  };
  return statusMap[status] || status;
};

const getJournalTypeArabic = (type) => {
  const typeMap = {
    'GENERAL': 'عام',
    'OPENING': 'افتتاحي',
    'CLOSING': 'ختامي',
    'ADJUSTMENT': 'تسوية'
  };
  return typeMap[type] || type;
};

const getJournalSourceTypeText = (sourceType) => {
  switch (sourceType) {
    case "LOAN":
      return "سلفة";
    case "REPAYMENT":
      return "سداد";
    case "PARTNER":
      return "شريك";
    case "PERIOD_CLOSING":
      return "إقفال فترة";
    case "PARTNER_TRANSACTION_WITHDRAWAL":
      return "سحب مالي لشريك";
    case "PARTNER_TRANSACTION_DEPOSIT":
      return "إيداع مالي لشريك";
    case "EXPENSES":
      return "مصروف";
    case "OTHER":
      return "أخرى";
    default:
      return sourceType || "-";
  }
};