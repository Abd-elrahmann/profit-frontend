import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { saveAs } from 'file-saver';
import { pdfTableBaseStyles, createDidDrawTable } from './pdfTableStyles';
import {
  registerArabicFonts,
  drawReportHeader,
  drawSeparatorLine,
  drawReportFooter,
  drawReportSummary,
  PAGE_MARGIN,
  getFullWidthColumnStyles,
  PRIMARY_COLOR,
} from './pdfReportUtils';
import dayjs from 'dayjs';
const formatAmount = (value) => {
  const numeric = Number(value || 0);
  const truncated = Number.isFinite(numeric) ? Math.trunc(numeric) : 0;
  return truncated.toLocaleString('en-US', {
    maximumFractionDigits: 0,
    minimumFractionDigits: 0,
  });
};
const getRepaymentStatusText = (status) => {
  const textMap = {
    PENDING: 'قيد الانتظار',
    COMPLETED: 'مكتمل',
    PAID: 'مدفوع',
    PARTIAL_PAID: 'مدفوع جزئياً',
    OVERDUE: 'متأخر',
    EARLY_PAID: 'مدفوع مبكراً',
  };
  return textMap[status] || status;
};
export const exportStatementToPDF = async (statementData, clientName, fromDate = '', toDate = '') => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new jsPDF('landscape');
      registerArabicFonts(doc);
      doc.setProperties({
        title: `كشف حساب - ${clientName}`,
        subject: 'كشف حساب العميل',
        author: 'نظام إدارة السلف',
        keywords: 'كشف, حساب, عميل, سلف',
        creator: 'نظام إدارة السلف'
      });
      const reportTitle = `كشف حساب - ${clientName}`;
      const headerEndY = drawReportHeader(doc, {
        reportTitle,
        metadata: {
          date: dayjs().format('YYYY/MM/DD'),
          time: dayjs().format('hh:mm A'),
        },
      });
      const separatorEndY = drawSeparatorLine(doc, headerEndY + 4);
      const pageWidth = doc.internal.pageSize.width;
      const line1 = `العميل: ${clientName} | رقم الهوية: ${statementData.client?.nationalId || '—'} | من: ${fromDate || '—'} إلى: ${toDate || '—'} | تاريخ التصدير: ${dayjs().format('DD/MM/YYYY HH:mm')}`;
      const line2 = `مدين: ${formatAmount(statementData.client?.debit)} | دائن: ${formatAmount(statementData.client?.credit)} | رصيد: ${formatAmount(statementData.client?.balance)} | معاملات: ${statementData.totalTransactions || 0} | دفعات: ${statementData.paidRepaymentsCount || 0} | متبقي: ${formatAmount(statementData.totalRemainingAmount)}`;
      let yPosition = drawReportSummary(doc, separatorEndY, line1);
      yPosition = drawReportSummary(doc, yPosition, line2);
      if ((statementData.client?.balance || 0) > 0) {
        doc.setFontSize(11);
        doc.setTextColor(...PRIMARY_COLOR);
        doc.text(`مدين/عليه ${formatAmount(statementData.client?.balance)} ريال سعودي`, pageWidth / 2, yPosition, { align: 'center' });
        doc.setTextColor(0, 0, 0);
        yPosition += 10;
      }
      yPosition += 4;
      const repayments = statementData.repayments || [];
      if (repayments.length > 0) {
        const tableData = repayments.map((r) => [
          formatAmount(r.remaining),
          formatAmount(r.paidAmount),
          formatAmount(r.amount),
          getRepaymentStatusText(r.status),
          r.paymentDate ? dayjs(r.paymentDate).format('DD/MM/YYYY') : '—',
          r.dueDate ? dayjs(r.dueDate).format('DD/MM/YYYY') : '—',
          r.loanCode || r.loanId || '—',
          r.count || '—'
        ]);
        const headers = [['المتبقي', 'المدفوع', 'المبلغ', 'الحالة', 'تاريخ\nالدفع', 'تاريخ\nالاستحقاق', 'رقم\nالسلفة', 'رقم\nالدفعة']];
        const baseWidths = [22, 24, 22, 22, 24, 32, 24, 24];
        const columnStyles = getFullWidthColumnStyles(doc, baseWidths);
        Object.keys(columnStyles).forEach((k) => {
          columnStyles[k] = { ...columnStyles[k], fontSize: 9, overflow: [4, 5, 6, 7].includes(Number(k)) ? 'linebreak' : 'hidden' };
        });
        autoTable(doc, {
          startY: yPosition,
          head: headers,
          body: tableData,
          ...pdfTableBaseStyles,
          headStyles: {
            ...pdfTableBaseStyles.headStyles,
            fillColor: PRIMARY_COLOR,
            textColor: [255, 255, 255],
            minCellHeight: 14,
          },
          styles: { ...pdfTableBaseStyles.styles, fontSize: 9 },
          bodyStyles: { ...pdfTableBaseStyles.bodyStyles, cellPadding: 4 },
          columnStyles,
          margin: { top: yPosition, bottom: 25, left: PAGE_MARGIN, right: PAGE_MARGIN },
          tableWidth: 'auto',
          horizontalPageBreak: false,
          pageBreak: 'auto',
          showHead: 'everyPage',
          didDrawTable: createDidDrawTable(doc)
        });
      }
      const pageCount = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        drawReportFooter(doc, i, pageCount);
      }
      const fileName = `كشف_حساب_${clientName}_${dayjs().format('YYYY-MM-DD')}.pdf`;
      doc.save(fileName);
      resolve();
    } catch (error) {
      console.error('PDF export error:', error.message);
      reject(error);
    }
  });
};
export const exportStatementToExcel = async (statementData, clientName, fromDate = '', toDate = '') => {
  try {
    const XLSX = await import('xlsx');
    const workbook = XLSX.utils.book_new();
    const summaryData = [
      ['كشف حساب العميل'],
      [`اسم الحساب: ${clientName}`],
      [`رقم الهوية: ${statementData.client?.nationalId || '—'}`],
      [`من تاريخ: ${fromDate || '—'}  إلى تاريخ: ${toDate || '—'}`],
      [''],
      ['إجمالي المدين', formatAmount(statementData.client?.debit)],
      ['إجمالي الدائن', formatAmount(statementData.client?.credit)],
      ['الرصيد الحالي', formatAmount(statementData.client?.balance)],
      ['عدد المعاملات', statementData.totalTransactions || 0],
      ['الدفعات المدفوعة', statementData.paidRepaymentsCount || 0],
      ['المتبقي', formatAmount(statementData.totalRemainingAmount)],
      ...((statementData.client?.balance || 0) > 0 ? [['مدين ب', `${formatAmount(statementData.client?.balance)} ريال`]] : []),
      ['']
    ];
    const repayments = statementData.repayments || [];
    const repaymentsData = repayments.map((r) => ({
      'رقم الدفعة': r.count,
      'رقم السلفة': r.loanCode || r.loanId,
      'تاريخ الاستحقاق': r.dueDate ? dayjs(r.dueDate).format('DD/MM/YYYY') : '—',
      'تاريخ الدفع': r.paymentDate ? dayjs(r.paymentDate).format('DD/MM/YYYY') : '—',
      'المبلغ': formatAmount(r.amount),
      'المدفوع': formatAmount(r.paidAmount),
      'المتبقي': formatAmount(r.remaining),
      'الحالة': getRepaymentStatusText(r.status),
    }));
    const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
    const repaymentsSheet = XLSX.utils.json_to_sheet(repaymentsData);
    XLSX.utils.book_append_sheet(workbook, summarySheet, 'ملخص');
    XLSX.utils.book_append_sheet(workbook, repaymentsSheet, 'جدول الدفعات');
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    });
    const fileName = `كشف_حساب_${clientName}_${dayjs().format('YYYY-MM-DD')}.xlsx`;
    saveAs(blob, fileName);
  } catch (error) {
    console.error('Excel export error:', error.message);
    throw error;
  }
};