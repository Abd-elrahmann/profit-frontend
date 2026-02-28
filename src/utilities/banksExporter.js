import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { saveAs } from 'file-saver';
import { pdfTableBaseStyles, createDidDrawTable } from './pdfTableStyles';
import { registerArabicFonts, drawReportHeader, drawSeparatorLine, drawReportFooter, drawReportSummary, PAGE_MARGIN, getFullWidthColumnStyles, PRIMARY_COLOR } from './pdfReportUtils';
import dayjs from 'dayjs';
export const exportBanksToPDF = async (banksData, searchQuery = '') => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new jsPDF('landscape');
      registerArabicFonts(doc);
      doc.setProperties({
        title: 'الحسابات البنكية',
        subject: 'قائمة الحسابات البنكية',
        author: 'نظام إدارة السلف',
        keywords: 'بنوك, حسابات, سلف',
        creator: 'نظام إدارة السلف'
      });
      let yPosition = drawReportHeader(doc, {
        reportTitle: 'الحسابات البنكية',
        metadata: { date: dayjs().format('DD/MM/YYYY'), time: dayjs().format('HH:mm') }
      });
      yPosition = drawSeparatorLine(doc, yPosition);
      const activeBanks = banksData.filter(bank => bank.status === 'Active').length;
      const expiredBanks = banksData.filter(bank => bank.status === 'Expired').length;
      const totalBanks = banksData.length;
      const summaryText = `إجمالي الحسابات: ${totalBanks} | نشطة: ${activeBanks} | منتهية: ${expiredBanks} | تاريخ التصدير: ${dayjs().format('DD/MM/YYYY HH:mm')}`;
      yPosition = drawReportSummary(doc, yPosition, summaryText);
      if (searchQuery) {
        doc.setFontSize(10);
        doc.setFont('Amiri', 'bold');
        doc.text(`نتائج البحث عن: "${searchQuery}"`, doc.internal.pageSize.width / 2, yPosition, { align: 'center' });
        yPosition += 8;
      }
      const tableData = banksData.map(bank => [
        getStatusArabic(bank.status),
        bank.limit ? bank.limit.toLocaleString('en-US') : '0',
        bank.IBAN || '-',
        bank.accountNumber || '-',
        bank.owner || '-',
        bank.name || '-',
        bank.id.toString()
      ]);
      const headers = [
        ['الحالة', 'السلف المسموح بها', 'رقم الايبان', 'رقم الحساب', 'اسم المالك', 'اسم الحساب', '#']
      ];
      const baseWidths = [18, 28, 40, 25, 30, 35, 12];
      const columnStyles = getFullWidthColumnStyles(doc, baseWidths);
      Object.keys(columnStyles).forEach((k) => {
        columnStyles[k] = { ...columnStyles[k], fontSize: 9 };
      });
      autoTable(doc, {
        startY: yPosition,
        head: headers,
        body: tableData,
        ...pdfTableBaseStyles,
        styles: { ...pdfTableBaseStyles.styles, fontStyle: 'bold', fontSize: 9, cellPadding: 4 },
        headStyles: { ...pdfTableBaseStyles.headStyles, fillColor: PRIMARY_COLOR, textColor: [255, 255, 255], fontSize: 9, cellPadding: 4 },
        bodyStyles: { ...pdfTableBaseStyles.bodyStyles, fontStyle: 'bold', cellPadding: 4 },
        columnStyles,
        margin: { top: yPosition, left: PAGE_MARGIN, right: PAGE_MARGIN, bottom: 25 },
        tableWidth: 'auto',
        horizontalPageBreak: false,
        pageBreak: 'auto',
        showHead: 'everyPage',
        didParseCell: function (data) {
          if (data.column.index === 0) {
            if (data.cell.text[0] === 'نشط') {
              data.cell.styles.textColor = [46, 125, 50]; 
            } else if (data.cell.text[0] === 'منتهي') {
              data.cell.styles.textColor = [237, 108, 57]; 
            }
          }
          if (data.cell.text && data.cell.text.length > 0) {
            const maxLength = data.column.index === 2 ? 20 : 15; 
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
      const fileName = `الحسابات_البنكية_${dayjs().format('YYYY-MM-DD')}.pdf`;
      doc.save(fileName);
      resolve();
    } catch (error) {
      console.error('PDF export error:', error.message);
      reject(error);
    }
  });
};
export const exportBanksToExcel = async (banksData, searchQuery = '') => {
  try {
      const XLSX = await import('xlsx');
    const workbook = XLSX.utils.book_new();
    const activeBanks = banksData.filter(bank => bank.status === 'Active').length;
    const expiredBanks = banksData.filter(bank => bank.status === 'Expired').length;
    const totalBanks = banksData.length;
    const summaryData = [
      ['الحسابات البنكية'],
      [''],
      ['إحصائيات'],
      ['إجمالي الحسابات', totalBanks],
      ['الحسابات النشطة', activeBanks],
      ['الحسابات المنتهية', expiredBanks],
      ['تاريخ التصدير', dayjs().format('DD/MM/YYYY HH:mm')],
      ['']
    ];
    if (searchQuery) {
      summaryData.splice(2, 0, [`نتائج البحث عن: "${searchQuery}"`]);
    }
    const banksSheetData = banksData.map(bank => ({
      '#': bank.id,
      'اسم الحساب': bank.name,
      'اسم المالك': bank.owner,
      'رقم الحساب': bank.accountNumber,
      'رقم الايبان': bank.IBAN,
      'السلف المسموح بها': bank.limit,
      'الحالة': getStatusArabic(bank.status)
    }));
    const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
    const banksSheet = XLSX.utils.json_to_sheet(banksSheetData);
    const wscols = [
      { wch: 8 },  
      { wch: 25 }, 
      { wch: 20 }, 
      { wch: 20 }, 
      { wch: 30 }, 
      { wch: 18 }, 
      { wch: 12 }  
    ];
    banksSheet['!cols'] = wscols;
    XLSX.utils.book_append_sheet(workbook, summarySheet, 'ملخص');
    XLSX.utils.book_append_sheet(workbook, banksSheet, 'الحسابات البنكية');
    const excelBuffer = XLSX.write(workbook, { 
      bookType: 'xlsx', 
      type: 'array',
      bookSST: false 
    });
    const blob = new Blob([excelBuffer], { 
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
    });
    const fileName = `الحسابات_البنكية_${dayjs().format('YYYY-MM-DD')}.xlsx`;
    saveAs(blob, fileName);
  } catch (error) {
    console.error('Excel export error:', error.message);
    throw error;
  }
};
const getStatusArabic = (status) => {
  const statusMap = {
    'Active': 'نشط',
    'Expired': 'منتهي',
    'Pending': 'قيد الانتظار',
    'Suspended': 'موقوف'
  };
  return statusMap[status] || status;
};