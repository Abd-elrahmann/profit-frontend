import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { saveAs } from 'file-saver';
import { pdfTableBaseStyles, getPdfTableStyles, createDidDrawTable } from './pdfTableStyles';
import { registerArabicFonts, drawReportHeader, drawSeparatorLine, drawReportFooter, drawReportSummary, PAGE_MARGIN, getFullWidthColumnStyles, PRIMARY_COLOR } from './pdfReportUtils';
import dayjs from 'dayjs';
import * as XLSX from 'xlsx';
export const exportJournalToPDF = async (journalData) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new jsPDF('landscape');
      registerArabicFonts(doc);
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
      const summaryText = `رقم القيد: ${journalData.reference || journalData.id} | تاريخ التصدير: ${dayjs().format('DD/MM/YYYY HH:mm')}`;
      yPosition = drawReportSummary(doc, yPosition, summaryText);
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
      const headerColumnStyles = getFullWidthColumnStyles(doc, [40, 60]);
      headerColumnStyles[0].halign = 'right';
      headerColumnStyles[0].fontStyle = 'bold';
      headerColumnStyles[1].halign = 'right';
      autoTable(doc, {
        startY: headerTableY,
        head: headerTableHeaders,
        body: headerTableData,
        ...getPdfTableStyles({
          styles: { halign: 'right', fontStyle: 'bold', fontSize: 9, cellPadding: 4 },
          headStyles: { halign: 'center', fillColor: PRIMARY_COLOR, textColor: [255, 255, 255], fontSize: 9, cellPadding: 4 },
          bodyStyles: { halign: 'right', fontStyle: 'bold', cellPadding: 4 }
        }),
        columnStyles: headerColumnStyles,
        margin: { top: headerTableY, left: PAGE_MARGIN, right: PAGE_MARGIN, bottom: 25 },
        tableWidth: 'auto',
        horizontalPageBreak: false,
        didDrawTable: createDidDrawTable(doc)
      });
      yPosition = doc.lastAutoTable.finalY + 8;
      const totalDebit = journalData.lines?.reduce((sum, line) => sum + (line.debit || 0), 0) || 0;
      const totalCredit = journalData.lines?.reduce((sum, line) => sum + (line.credit || 0), 0) || 0;
      const balance = totalDebit - totalCredit;
      const linesSummaryText = `إجمالي المدين: ${totalDebit.toLocaleString('en-US')} | إجمالي الدائن: ${totalCredit.toLocaleString('en-US')} | الفرق: ${balance.toLocaleString('en-US')} | عدد البنود: ${journalData.lines?.length || 0} | تاريخ التصدير: ${dayjs().format('DD/MM/YYYY HH:mm')}`;
      yPosition = drawReportSummary(doc, yPosition, linesSummaryText);
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
      tableData.push([
        balance.toLocaleString('en-US'),
        totalCredit.toLocaleString('en-US'),
        totalDebit.toLocaleString('en-US'),
        'الإجمالي',
        ''
      ]);
      const headers = [
        ['الرصيد', 'دائن', 'مدين', 'الوصف', 'الحساب']
      ];
      const journalBaseWidths = [25, 25, 25, 50, 55];
      const journalColumnStyles = getFullWidthColumnStyles(doc, journalBaseWidths);
      Object.keys(journalColumnStyles).forEach((k) => {
        journalColumnStyles[k] = { ...journalColumnStyles[k], fontSize: 9 };
      });
      journalColumnStyles[3].halign = 'right';
      journalColumnStyles[4].halign = 'right';
      journalColumnStyles[4].overflow = 'linebreak';
      autoTable(doc, {
        startY: yPosition,
        head: headers,
        body: tableData,
        ...pdfTableBaseStyles,
        styles: { ...pdfTableBaseStyles.styles, fontStyle: 'bold', fontSize: 9, cellPadding: 4 },
        headStyles: { ...pdfTableBaseStyles.headStyles, fillColor: PRIMARY_COLOR, textColor: [255, 255, 255], fontSize: 9, cellPadding: 4 },
        bodyStyles: { ...pdfTableBaseStyles.bodyStyles, fontStyle: 'bold', cellPadding: 4 },
        columnStyles: journalColumnStyles,
        margin: { top: yPosition, left: PAGE_MARGIN, right: PAGE_MARGIN, bottom: 25 },
        tableWidth: 'auto',
        horizontalPageBreak: false,
        pageBreak: 'auto',
        showHead: 'everyPage',
        didParseCell: function (data) {
          if (data.row.index === tableData.length - 1) {
            data.cell.styles.fillColor = [240, 240, 240];
            data.cell.styles.fontStyle = 'bold';
            data.cell.styles.fontSize = 9;
          }
          if (data.cell.text && data.cell.text.length > 0 && data.column.index !== 4) {
            const maxLength = data.column.index === 3 ? 40 : 25;
            if (data.cell.text[0].length > maxLength) {
              data.cell.text[0] = data.cell.text[0].substring(0, maxLength) + '...';
            }
          }
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
    const XLSX = await import('xlsx');
    const workbook = XLSX.utils.book_new();
    const totalDebit = journalData.lines?.reduce((sum, line) => sum + (line.debit || 0), 0) || 0;
    const totalCredit = journalData.lines?.reduce((sum, line) => sum + (line.credit || 0), 0) || 0;
    const balance = totalDebit - totalCredit;
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
    const linesData = journalData.lines?.map(line => ({
      'الحساب': `${line.account?.code || ''} - ${line.account?.name || ''}`,
      'الوصف': line.description || '-',
      'مدين': line.debit > 0 ? line.debit : 0,
      'دائن': line.credit > 0 ? line.credit : 0,
      'الرصيد': line.balance || (line.debit - line.credit)
    })) || [];
    linesData.push({
      'الحساب': '',
      'الوصف': 'الإجمالي',
      'مدين': totalDebit,
      'دائن': totalCredit,
      'الرصيد': balance
    });
    const headerSheet = XLSX.utils.aoa_to_sheet(headerData);
    const linesSheet = XLSX.utils.json_to_sheet(linesData);
    const headerCols = [
      { wch: 20 },
      { wch: 30 }
    ];
    headerSheet['!cols'] = headerCols;
    const linesCols = [
      { wch: 30 },
      { wch: 40 },
      { wch: 15 },
      { wch: 15 },
      { wch: 15 }
    ];
    linesSheet['!cols'] = linesCols;
    XLSX.utils.book_append_sheet(workbook, headerSheet, 'معلومات القيد');
    XLSX.utils.book_append_sheet(workbook, linesSheet, 'بنود القيد');
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
      const doc = new jsPDF('landscape');
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
      const summaryText = `إجمالي القيود: ${journals.length} | تاريخ التصدير: ${dayjs().format('DD/MM/YYYY HH:mm')}`;
      yPosition = drawReportSummary(doc, yPosition, summaryText);
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
      const journalsBaseWidths = [35, 35, 40, 30, 35];
      const journalsColumnStyles = getFullWidthColumnStyles(doc, journalsBaseWidths);
      autoTable(doc, {
        startY: yPosition,
        head: headers,
        body,
        ...getPdfTableStyles({
          styles: { halign: 'right', fontStyle: 'bold', fontSize: 9, cellPadding: 4 },
          headStyles: { halign: 'right', fillColor: PRIMARY_COLOR, textColor: [255, 255, 255], fontSize: 9, cellPadding: 4 },
          bodyStyles: { halign: 'right', fontStyle: 'bold', cellPadding: 4 }
        }),
        margin: { top: yPosition, left: PAGE_MARGIN, right: PAGE_MARGIN, bottom: 25 },
        tableWidth: 'auto',
        horizontalPageBreak: false,
        pageBreak: 'auto',
        showHead: 'everyPage',
        columnStyles: journalsColumnStyles,
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
      { wch: 15 },
      { wch: 20 },
      { wch: 18 },
      { wch: 10 },
      { wch: 18 },
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