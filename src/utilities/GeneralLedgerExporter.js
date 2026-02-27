import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

import { saveAs } from 'file-saver';
import { pdfTableBaseStyles, createDidDrawTable } from './pdfTableStyles';
import {
  registerArabicFonts,
  drawReportHeader,
  drawSeparatorLine,
  drawReportFooter,
  getCenteredTableMargins,
} from './pdfReportUtils';
import dayjs from 'dayjs';

export const exportGeneralLedgerToPDF = async (ledgerData, account, searchParams) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new jsPDF();
      
      registerArabicFonts(doc);
      
      doc.setProperties({
        title: `دفتر الأستاذ - ${account.name}`,
        subject: 'دفتر الأستاذ العام',
        author: 'نظام إدارة السلف',
        keywords: 'دفتر, أستاذ, محاسبة, سلف',
        creator: 'نظام إدارة السلف'
      });

      const reportTitle = `دفتر الأستاذ - ${account.name} (${account.code})`;
      const headerEndY = drawReportHeader(doc, {
        reportTitle,
        metadata: {
          date: dayjs().format('YYYY/MM/DD'),
          time: dayjs().format('hh:mm A'),
        },
      });

      const separatorEndY = drawSeparatorLine(doc, headerEndY + 4);

      const totalDebit = ledgerData.journals?.reduce((sum, journal) => {
        return sum + journal.lines.reduce((lineSum, line) => lineSum + (line.debit || 0), 0);
      }, 0) || 0;
      
      const totalCredit = ledgerData.journals?.reduce((sum, journal) => {
        return sum + journal.lines.reduce((lineSum, line) => lineSum + (line.credit || 0), 0);
      }, 0) || 0;
      
      const closingBalance = ledgerData.account?.balance || 0;
      
      const pageWidth = doc.internal.pageSize.width;
      doc.setFontSize(11);
      doc.setFont('Amiri', 'bold');
      const summaryY = separatorEndY + 6;
      if (searchParams.fromDate || searchParams.toDate) {
        const fromDate = searchParams.fromDate ? dayjs(searchParams.fromDate).format('DD/MM/YYYY') : 'بداية';
        const toDate = searchParams.toDate ? dayjs(searchParams.toDate).format('DD/MM/YYYY') : 'نهاية';
        doc.text(`الفترة: من ${fromDate} إلى ${toDate}`, pageWidth / 2, summaryY, { align: 'center' });
      }
      const summaryText = `إجمالي المدين: ${totalDebit.toLocaleString('en-US')}  |  إجمالي الدائن: ${totalCredit.toLocaleString('en-US')}  |  الرصيد الختامي: ${closingBalance.toLocaleString('en-US')}  |  عدد القيود: ${ledgerData.totalJournals || 0}`;
      doc.text(summaryText, pageWidth / 2, summaryY + 8, { align: 'center' });
      
      let yPosition = summaryY + 18;
      
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
      
      const headers = [
        ['الرصيد', 'دائن', 'مدين', 'الوصف', 'المرجع', 'التاريخ']
      ];

      const columnWidths = {
        1: 26, 
        2: 22, 
        3: 22, 
        4: 45, 
        5: 22, 
        6: 26  
      };
      
      const totalColumnWidth = Object.values(columnWidths).reduce((sum, width) => sum + width, 0);
      const tableMargins = getCenteredTableMargins(doc, totalColumnWidth);
      
      autoTable(doc, {
        startY: yPosition,
        head: headers,
        body: tableData,
        ...pdfTableBaseStyles,
        styles: { ...pdfTableBaseStyles.styles, fontSize: 9 },
        bodyStyles: { ...pdfTableBaseStyles.bodyStyles, cellPadding: 4 },
        columnStyles: {
          1: { cellWidth: columnWidths[1], fontSize: 9 }, 
          2: { cellWidth: columnWidths[2], fontSize: 9 }, 
          3: { cellWidth: columnWidths[3], fontSize: 9 }, 
          4: { cellWidth: columnWidths[4], fontSize: 9, halign: 'right', overflow: 'linebreak' }, 
          5: { cellWidth: columnWidths[5], fontSize: 9 }, 
          6: { cellWidth: columnWidths[6], fontSize: 9 }  
        },
        margin: { top: yPosition, bottom: 25, left: tableMargins.left, right: tableMargins.right },
        tableWidth: totalColumnWidth,
        horizontalPageBreak: false, 
        pageBreak: 'auto',
        showHead: 'everyPage',
        didParseCell: function (data) {
          if (data.cell.text && data.cell.text.length > 0) {
            const maxLength = data.column.index === 4 ? 40 : 20; 
            if (data.cell.text[0].length > maxLength) {
              data.cell.text[0] = data.cell.text[0].substring(0, maxLength) + '...';
            }
          }
        },
        didDrawTable: createDidDrawTable(doc)
      });
      
      const pageCount = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        drawReportFooter(doc, i, pageCount);
      }
      
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
      const XLSX = await import('xlsx');

    const workbook = XLSX.utils.book_new();
    
    const totalDebit = ledgerData.journals?.reduce((sum, journal) => {
      return sum + journal.lines.reduce((lineSum, line) => lineSum + (line.debit || 0), 0);
    }, 0) || 0;
    
    const totalCredit = ledgerData.journals?.reduce((sum, journal) => {
      return sum + journal.lines.reduce((lineSum, line) => lineSum + (line.credit || 0), 0);
    }, 0) || 0;
    
    const closingBalance = ledgerData.account?.balance || 0;

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
    
    if (searchParams.fromDate || searchParams.toDate) {
      const fromDate = searchParams.fromDate ? dayjs(searchParams.fromDate).format('DD/MM/YYYY') : 'بداية';
      const toDate = searchParams.toDate ? dayjs(searchParams.toDate).format('DD/MM/YYYY') : 'نهاية';
      summaryData.splice(4, 0, [`الفترة: من ${fromDate} إلى ${toDate}`]);
    }
    
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
    
    const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
    
    const journalsSheet = XLSX.utils.json_to_sheet(journalsData);
    
    const wscols = [
      { wch: 20 }, 
      { wch: 15 }, 
      { wch: 40 }, 
      { wch: 12 }, 
      { wch: 12 }, 
      { wch: 15 }, 
      { wch: 15 }  
    ];
    journalsSheet['!cols'] = wscols;
    
    XLSX.utils.book_append_sheet(workbook, summarySheet, 'ملخص');
    XLSX.utils.book_append_sheet(workbook, journalsSheet, 'القيود');
      
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

