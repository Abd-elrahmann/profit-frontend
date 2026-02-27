import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

import { saveAs } from 'file-saver';
import { pdfTableBaseStyles, getPdfTableStyles, createDidDrawTable } from './pdfTableStyles';
import { registerArabicFonts, drawReportHeader, drawSeparatorLine, drawReportFooter, getCenteredTableMargins, PRIMARY_COLOR } from './pdfReportUtils';
import dayjs from 'dayjs';
import * as XLSX from 'xlsx';

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

      let yPosition = drawReportHeader(doc, {
        reportTitle: 'تفاصيل القيد المحاسبي',
        metadata: { date: dayjs().format('DD/MM/YYYY'), time: dayjs().format('HH:mm') }
      });
      yPosition = drawSeparatorLine(doc, yPosition);

      doc.setFontSize(11);
      doc.setFont('Amiri', 'bold');
      doc.text(`رقم القيد: ${journalData.reference || journalData.id}`, doc.internal.pageSize.width / 2, yPosition, { align: 'center' });
      yPosition += 8;

      // Journal header info as a table
      const headerTableY = yPosition;
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
      const headerTableMargins = getCenteredTableMargins(doc, headerTableWidth);
      
      autoTable(doc, {
        startY: headerTableY,
        head: headerTableHeaders,
        body: headerTableData,
        ...getPdfTableStyles({
          styles: { halign: 'right', fontStyle: 'bold', fontSize: 9, cellPadding: 4 },
          headStyles: { halign: 'center', fillColor: PRIMARY_COLOR, textColor: [255, 255, 255], fontSize: 9, cellPadding: 4 },
          bodyStyles: { halign: 'right', fontStyle: 'bold', cellPadding: 4 }
        }),
        columnStyles: {
          0: { cellWidth: 40, halign: 'right', fontStyle: 'bold' }, // المعلومة
          1: { cellWidth: 60, halign: 'right' }  // القيمة
        },
        margin: { 
          top: headerTableY, 
          left: headerTableMargins.left,
          right: headerTableMargins.right,
          bottom: 25 
        },
        tableWidth: headerTableWidth,
        horizontalPageBreak: false,
        didDrawTable: createDidDrawTable(doc)
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
      
      const totalColumnWidth = Object.values(columnWidths).reduce((sum, width) => sum + width, 0);
      const journalTableMargins = getCenteredTableMargins(doc, totalColumnWidth);
      
      autoTable(doc, {
        startY: yPosition,
        head: headers,
        body: tableData,
        ...pdfTableBaseStyles,
        styles: { ...pdfTableBaseStyles.styles, fontStyle: 'bold', fontSize: 9, cellPadding: 4 },
        headStyles: { ...pdfTableBaseStyles.headStyles, fillColor: PRIMARY_COLOR, textColor: [255, 255, 255], fontSize: 9, cellPadding: 4 },
        bodyStyles: { ...pdfTableBaseStyles.bodyStyles, fontStyle: 'bold', cellPadding: 4 },
        columnStyles: {
          0: { cellWidth: columnWidths[0], fontSize: 9 }, // الرصيد
          1: { cellWidth: columnWidths[1], fontSize: 9 }, // دائن
          2: { cellWidth: columnWidths[2], fontSize: 9 }, // مدين
          3: { cellWidth: columnWidths[3], fontSize: 9, halign: 'right' }, // الوصف
          4: { cellWidth: columnWidths[4], fontSize: 9, halign: 'right', overflow: 'linebreak' }  // الحساب - allow wrapping
        },
        margin: { top: yPosition, left: journalTableMargins.left, right: journalTableMargins.right, bottom: 25 },
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
        },
        didDrawTable: createDidDrawTable(doc)
      });
      
      const pageCount = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        drawReportFooter(doc, i, pageCount);
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
    // Lazy load XLSX library
    const XLSX = await import('xlsx');

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
      return "سداد دفعة";
    case "LOAN_INTEREST":
      return "فوائد سلفة";
    case "LOAN_CONVERSION":
      return "نقل مديونية";
    case "PARTNER":
      return "انضمام شريك";
    case "PERIOD_CLOSING":
      return "إقفال فترة";
    case "PARTNER_TRANSACTION_WITHDRAWAL":
      return "سحب مالي لشريك";
    case "COMPANY_PROFIT_WITHDRAWAL":
      return "سحب ربح شركة";
    case "PARTNER_TRANSACTION_DEPOSIT":
      return "إيداع مالي لشريك";
    case "EXPENSES":
      return "مصروف";
    case "PARTNER_WITHDRAWING":
      return "انسحاب مالي لشريك";
    case "ZAKAT": 
      return "سحب زكاة";
    case "SAVING":
      return "ادخار";
    case "PARTNER_PROFIT_WITHDRAWAL":
      return "سحب ارباح شريك";
    case "OTHER":
      return "أخرى";
    default:
      return sourceType || "-";
  }
};

// ---------- Bulk Journals Export (list) ----------
const normalizeJournalRow = (journal) => ({
  reference: journal.reference || "-",
  type: getJournalTypeArabic(journal.type),
  status: getJournalStatusArabic(journal.status),
  source: getJournalSourceTypeText(journal.sourceType),
  postedBy: journal.postedBy?.name || "لم يتم الاعتماد",
  createdAt: journal.createdAt ? dayjs(journal.createdAt).format('DD/MM/YYYY') : '-',
});

export const exportJournalsTableToPDF = async (journals) => {
  return new Promise((resolve, reject) => {
    try {
      if (!Array.isArray(journals) || journals.length === 0) {
        throw new Error('لا توجد بيانات للتصدير');
      }

      const doc = new jsPDF();
      registerArabicFonts(doc);

      doc.setProperties({
        title: 'تقرير القيود المحاسبية',
        subject: 'جميع القيود',
        author: 'نظام إدارة السلف',
        keywords: 'قيود, محاسبة',
        creator: 'نظام إدارة السلف'
      });

      let yPosition = drawReportHeader(doc, {
        reportTitle: 'تقرير القيود المحاسبية',
        metadata: { date: dayjs().format('DD/MM/YYYY'), time: dayjs().format('HH:mm') }
      });
      yPosition = drawSeparatorLine(doc, yPosition);

      doc.setFontSize(11);
      doc.setFont('Amiri', 'bold');
      doc.text(`إجمالي القيود: ${journals.length}`, doc.internal.pageSize.width / 2, yPosition, { align: 'center' });
      yPosition += 10;

      // Table data
      const headers = [['تاريخ الإنشاء', 'المعتمد بواسطة', 'المصدر', 'الحالة', 'النوع']];
      const body = journals.map((journal) => {
        const normalized = normalizeJournalRow(journal);
        return [
          normalized.createdAt,
          normalized.postedBy,
          normalized.source,
          normalized.status,
          normalized.type,
        ];
      });

      const journalsTableWidth = 170;
      const journalsTableMargins = getCenteredTableMargins(doc, journalsTableWidth);
      autoTable(doc, {
        startY: yPosition,
        head: headers,
        body,
        ...getPdfTableStyles({
          styles: { halign: 'right', fontStyle: 'bold', fontSize: 9, cellPadding: 4 },
          headStyles: { halign: 'right', fillColor: PRIMARY_COLOR, textColor: [255, 255, 255], fontSize: 9, cellPadding: 4 },
          bodyStyles: { halign: 'right', fontStyle: 'bold', cellPadding: 4 }
        }),
        margin: { top: yPosition, left: journalsTableMargins.left, right: journalsTableMargins.right, bottom: 25 },
        tableWidth: journalsTableWidth,
        horizontalPageBreak: false,
        pageBreak: 'auto',
        showHead: 'everyPage',
        columnStyles: {
          0: { cellWidth: 'auto' }, // تاريخ الإنشاء
          1: { cellWidth: 'auto' }, // المعتمد بواسطة
          2: { cellWidth: 'auto' }, // المصدر
          3: { cellWidth: 'auto' }, // الحالة
          4: { cellWidth: 32 }, // النوع (أعرض)
        },
        didDrawTable: createDidDrawTable(doc)
      });

      const pageCount = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        drawReportFooter(doc, i, pageCount);
      }

      const fileName = `تقرير_القيود_${dayjs().format('YYYY-MM-DD')}.pdf`;
      doc.save(fileName);
      resolve();
    } catch (error) {
      console.error('PDF export error:', error.message);
      reject(error);
    }
  });
};

export const exportJournalsTableToExcel = async (journals) => {
  try {
    if (!Array.isArray(journals) || journals.length === 0) {
      throw new Error('لا توجد بيانات للتصدير');
    }

    const workbook = XLSX.utils.book_new();
    const sheetData = [
      ['تاريخ الإنشاء', 'المعتمد بواسطة', 'المصدر', 'الحالة', 'النوع'],
      ...journals.map((journal) => {
        const normalized = normalizeJournalRow(journal);
        return [
          normalized.createdAt,
          normalized.postedBy,
          normalized.source,
          normalized.status,
          normalized.type,
        ];
      }),
    ];

    const sheet = XLSX.utils.aoa_to_sheet(sheetData);
    sheet['!cols'] = [
      { wch: 15 }, // تاريخ الإنشاء
      { wch: 20 }, // المعتمد بواسطة
      { wch: 18 }, // المصدر
      { wch: 10 }, // الحالة
      { wch: 18 }, // النوع أعرض
    ];

    XLSX.utils.book_append_sheet(workbook, sheet, 'القيود');

    const excelBuffer = XLSX.write(workbook, {
      bookType: 'xlsx',
      type: 'array',
      bookSST: false
    });

    const blob = new Blob([excelBuffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    });

    const fileName = `تقرير_القيود_${dayjs().format('YYYY-MM-DD')}.xlsx`;
    saveAs(blob, fileName);
  } catch (error) {
    console.error('Excel export error:', error.message);
    throw error;
  }
};

