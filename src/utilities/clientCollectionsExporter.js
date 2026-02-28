import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { saveAs } from 'file-saver';
import { getPdfTableStyles, createDidDrawTable } from './pdfTableStyles';
import {
  registerArabicFonts,
  drawReportHeader,
  drawSeparatorLine,
  drawReportFooter,
  drawReportSummary,
  PAGE_MARGIN,
  PRIMARY_COLOR,
} from './pdfReportUtils';
import dayjs from 'dayjs';
const formatCurrency = (amount) => {
  return amount?.toLocaleString('en-US') || '0';
};
const getExportColumnValue = (client, columnId, index) => {
  switch(columnId) {
    case 'id':
      return index + 1;
    case 'client':
      return `${client.name || '-'}\n${client.phone || '-'}`;
    case 'address':
      return client.address || '-';
    case 'loansCount':
      return client.loansSummary?.loansCount || 0;
    case 'paidRepayments':
      return client.repaymentSummary?.paidRepayments || 0;
    case 'remainingRepayments':
      return client.repaymentSummary?.remainingRepayments || 0;
    case 'totalDebit':
      return client.financials?.totalDebit || 0;
    case 'totalPaid':
      return client.financials?.totalPaid || 0;
    case 'totalInterest':
      return client.financials?.totalInterestPaid || 0;
    case 'totalDiscounts':
      return client.financials?.totalDiscounts || 0;
    case 'monthlyInstallment':
      return client.financials?.averageMonthlyInstallment || 0;
    case 'remaining':
      return Math.abs(client.financials?.remaining) || 0;
    case 'note':
      return '-'; 
    default:
      return '';
  }
};
const getFormattedColumnValue = (client, columnId, index) => {
  if (columnId === 'client') {
    return getExportColumnValue(client, columnId, index);
  }
  const value = getExportColumnValue(client, columnId, index);
  if (['totalDebit', 'totalPaid', 'totalInterest', 'totalDiscounts', 'remaining', 'monthlyInstallment'].includes(columnId)) {
    return formatCurrency(value);
  }
  return value;
};
export const exportClientCollectionsToPDF = async (clientsData, status = 'ACTIVE', visibleColumns = []) => {
  return new Promise((resolve, reject) => {
    try {
      if (!clientsData || !clientsData.data || !Array.isArray(clientsData.data) || clientsData.data.length === 0) {
        throw new Error('لا توجد بيانات للتصدير');
      }
      const columnsToExport = visibleColumns.length > 0 ? visibleColumns : [
        { id: 'id', label: 'م' },
        { id: 'client', label: 'العميل' },
        { id: 'address', label: 'العنوان' },
        { id: 'loansCount', label: 'عدد السلف' },
        { id: 'paidRepayments', label: 'الدفعات المدفوعة' },
        { id: 'remainingRepayments', label: 'الدفعات المتبقية' },
        { id: 'monthlyInstallment', label: 'الدفعة الشهرية' },
        { id: 'totalDebit', label: 'إجمالي المديونية' },
        { id: 'totalPaid', label: 'إجمالي المدفوع' },
        { id: 'totalInterest', label: 'إجمالي الفوائد' },
        { id: 'totalDiscounts', label: 'الخصومات' },
        { id: 'remaining', label: 'المتبقي' },
        { id: 'note', label: 'ملاحظات' },
      ];
      const doc = new jsPDF('landscape'); 
      registerArabicFonts(doc);
      const statusTitle = status === 'ACTIVE' ? 'العملاء المديونين' : 'العملاء المسددين';
      const documentTitle = `كشف تحصيل ${statusTitle}`;
      doc.setProperties({
        title: documentTitle,
        subject: 'تقرير تحصيل العملاء',
        author: 'نظام إدارة السلف',
        keywords: 'تحصيل, عملاء, تقرير',
        creator: 'نظام إدارة السلف'
      });
      const headerEndY = drawReportHeader(doc, {
        reportTitle: documentTitle,
        metadata: { date: dayjs().format('DD/MM/YYYY'), time: dayjs().format('HH:mm') },
      });
      let yPosition = drawSeparatorLine(doc, headerEndY + 4);
      const totalDebit = clientsData.data.reduce((sum, c) => sum + (c.financials?.totalDebit || 0), 0);
      const totalPaid = clientsData.data.reduce((sum, c) => sum + (c.financials?.totalPaid || 0), 0);
      const totalRemaining = clientsData.data.reduce((sum, c) => sum + (Math.abs(c.financials?.remaining) || 0), 0);
      const summaryText = `إجمالي العملاء: ${clientsData.totalClients || clientsData.data.length} | إجمالي المديونية: ${formatCurrency(totalDebit)} | إجمالي المدفوع: ${formatCurrency(totalPaid)} | المتبقي: ${formatCurrency(totalRemaining)} | تاريخ التصدير: ${dayjs().format('DD/MM/YYYY HH:mm')}`;
      yPosition = drawReportSummary(doc, yPosition, summaryText);
      const tableData = clientsData.data.map((client, index) => 
        columnsToExport.map(column => getFormattedColumnValue(client, column.id, index))
      );
      const headers = [columnsToExport.map(col => col.label).reverse()];
      const pageWidth = doc.internal.pageSize.width;
      const columnCount = columnsToExport.length;
      const availableWidth = pageWidth - 2 * PAGE_MARGIN;
      const baseWidths = {};
      columnsToExport.forEach((col) => {
        if (col.id === 'id') baseWidths[col.id] = 8;
        else if (col.id === 'client') baseWidths[col.id] = 28;
        else if (col.id === 'address') baseWidths[col.id] = 24;
        else if (col.id === 'note') baseWidths[col.id] = 38;
        else baseWidths[col.id] = 18;
      });
      const usedWidth = columnsToExport.reduce((sum, col) => sum + baseWidths[col.id], 0);
      const remainingWidth = availableWidth - usedWidth;
      const columnWidths = {};
      const noteExists = columnsToExport.some(col => col.id === 'note');
      const clientExists = columnsToExport.some(col => col.id === 'client');
      const addressExists = columnsToExport.some(col => col.id === 'address');
      let extraForNote = 0;
      let extraForClient = 0;
      let extraForAddress = 0;
      if (remainingWidth > 0) {
        if (noteExists) {
          extraForNote = remainingWidth * 0.6;
          const leftover = remainingWidth * 0.4;
          if (clientExists && addressExists) {
            extraForClient = leftover * 0.5;
            extraForAddress = leftover * 0.5;
          } else if (clientExists) {
            extraForClient = leftover;
          } else if (addressExists) {
            extraForAddress = leftover;
          } else {
            extraForNote += leftover;
          }
        } else if (clientExists && addressExists) {
          extraForClient = remainingWidth * 0.5;
          extraForAddress = remainingWidth * 0.5;
        } else if (clientExists) {
          extraForClient = remainingWidth;
        } else if (addressExists) {
          extraForAddress = remainingWidth;
        }
      }
      columnsToExport.forEach((col, index) => {
        let width = baseWidths[col.id];
        if (col.id === 'note') width += extraForNote;
        else if (col.id === 'client') width += extraForClient;
        else if (col.id === 'address') width += extraForAddress;
        columnWidths[columnCount - 1 - index] = width; 
      });
      let totalColumnWidth = Object.values(columnWidths).reduce((sum, width) => sum + width, 0);
      if (totalColumnWidth > availableWidth) {
        const scale = availableWidth / totalColumnWidth;
        Object.keys(columnWidths).forEach((k) => {
          columnWidths[k] = Math.round(columnWidths[k] * scale);
        });
      }
      autoTable(doc, {
        startY: yPosition,
        head: headers,
        body: tableData.map(row => row.reverse()),
        ...getPdfTableStyles({
          styles: { halign: 'right', fontStyle: 'bold', fontSize: 8, cellPadding: 3 },
          headStyles: { halign: 'right', fontSize: 9, cellPadding: 4, fillColor: PRIMARY_COLOR, textColor: [255, 255, 255] },
          bodyStyles: { halign: 'right', fontStyle: 'bold', cellPadding: 3, fontSize: 8 }
        }),
        columnStyles: columnWidths,
        margin: { left: PAGE_MARGIN, right: PAGE_MARGIN, top: yPosition, bottom: 25 },
        tableWidth: 'auto',
        horizontalPageBreak: true,
        pageBreak: 'auto',
        showHead: 'everyPage',
        didDrawTable: createDidDrawTable(doc)
      });
      const pageCount = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        drawReportFooter(doc, i, pageCount);
      }
      const statusSuffix = status === 'ACTIVE' ? 'المديونين' : 'المسددين';
      const fileName = `كشف_تحصيل_العملاء_${statusSuffix}_${dayjs().format('YYYY-MM-DD')}.pdf`;
      doc.save(fileName);
      resolve();
    } catch (error) {
      console.error('PDF export error:', error.message);
      reject(error);
    }
  });
};
export const exportClientCollectionsToExcel = async (clientsData, status = 'ACTIVE', visibleColumns = []) => {
  try {
    if (!clientsData || !clientsData.data || !Array.isArray(clientsData.data) || clientsData.data.length === 0) {
      throw new Error('لا توجد بيانات للتصدير');
    }
    const columnsToExport = visibleColumns.length > 0 ? visibleColumns : [
      { id: 'id', label: 'م' },
      { id: 'client', label: 'العميل' },
      { id: 'address', label: 'العنوان' },
      { id: 'loansCount', label: 'عدد السلف' },
      { id: 'paidRepayments', label: 'الدفعات المدفوعة' },
      { id: 'remainingRepayments', label: 'الدفعات المتبقية' },
      { id: 'totalDebit', label: 'إجمالي المديونية' },
      { id: 'totalPaid', label: 'إجمالي المدفوع' },
      { id: 'totalInterest', label: 'إجمالي الفوائد' },
      { id: 'totalDiscounts', label: 'الخصومات' },
      { id: 'remaining', label: 'المتبقي' },
      { id: 'note', label: 'ملاحظات' },
    ];
    const XLSX = await import('xlsx');
    const workbook = XLSX.utils.book_new();
    const statusTitle = status === 'ACTIVE' ? 'العملاء المديونين' : 'العملاء المسددين';
    const summaryData = [
      [`كشف تحصيل ${statusTitle}`],
      [`تاريخ التصدير: ${dayjs().format('DD/MM/YYYY HH:mm')}`],
      [`إجمالي العملاء: ${clientsData.totalClients || clientsData.data.length}`],
      [''],
      ['ملخص الإحصائيات'],
      [''],
      ['إجمالي المديونية', clientsData.data.reduce((sum, c) => sum + (c.financials.totalDebit || 0), 0)],
      ['إجمالي المدفوع', clientsData.data.reduce((sum, c) => sum + (c.financials.totalPaid || 0), 0)],
      ['إجمالي الفوائد', clientsData.data.reduce((sum, c) => sum + (c.financials.totalInterestPaid || 0), 0)],
      ['إجمالي الخصومات', clientsData.data.reduce((sum, c) => sum + (c.financials.totalDiscounts || 0), 0)],
      ['إجمالي الدفعات الشهرية', clientsData.data.reduce((sum, c) => sum + (c.financials.averageMonthlyInstallment || 0), 0)],
      ['إجمالي المتبقي', clientsData.data.reduce((sum, c) => sum + (Math.abs(c.financials.remaining) || 0), 0)],
      [''],
      ['تفاصيل العملاء'],
      ['']
    ];
    const headersRow = columnsToExport.map(col => col.label);
    const clientsTableData = [headersRow];
    clientsData.data.forEach((client, index) => {
      const rowData = columnsToExport.map(column => getExportColumnValue(client, column.id, index));
      clientsTableData.push(rowData);
    });
    const allData = [...summaryData, ...clientsTableData];
    const sheet = XLSX.utils.aoa_to_sheet(allData);
    const columnWidths = columnsToExport.map(col => {
      if (col.id === 'id') return { wch: 6 };
      if (col.id === 'client') return { wch: 28 };
      if (col.id === 'address') return { wch: 25 };
      if (col.id === 'note') return { wch: 35 };
      return { wch: 16 };
    });
    sheet['!cols'] = columnWidths;
    const headerRowIndex = summaryData.length;
    if (!sheet['!rows']) sheet['!rows'] = [];
    for (let col = 0; col < headersRow.length; col++) {
      const cellAddress = XLSX.utils.encode_cell({ r: headerRowIndex, c: col });
      if (!sheet[cellAddress]) continue;
      if (!sheet[cellAddress].s) sheet[cellAddress].s = {};
      sheet[cellAddress].s.font = { bold: true, color: { rgb: "FFFFFF" } };
      sheet[cellAddress].s.fill = { fgColor: { rgb: "0D40A5" } };
      sheet[cellAddress].s.alignment = { horizontal: "center", vertical: "center" };
    }
    XLSX.utils.book_append_sheet(workbook, sheet, 'كشف التحصيل');
    const excelBuffer = XLSX.write(workbook, { 
      bookType: 'xlsx', 
      type: 'array',
      bookSST: false 
    });
    const blob = new Blob([excelBuffer], { 
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
    });
    const statusSuffix = status === 'ACTIVE' ? 'المديونين' : 'المسددين';
    const fileName = `كشف_تحصيل_العملاء_${statusSuffix}_${dayjs().format('YYYY-MM-DD')}.xlsx`;
    saveAs(blob, fileName);
  } catch (error) {
    console.error('Excel export error:', error.message);
    throw error;
  }
};
export const printClientCollections = async (clientsData, status = 'ACTIVE', visibleColumns = []) => {
  return new Promise((resolve, reject) => {
    try {
      if (!clientsData || !clientsData.data || !Array.isArray(clientsData.data) || clientsData.data.length === 0) {
        throw new Error('لا توجد بيانات للطباعة');
      }
      const columnsToExport = visibleColumns.length > 0 ? visibleColumns : [
        { id: 'id', label: 'م' },
        { id: 'client', label: 'العميل' },
        { id: 'address', label: 'العنوان' },
        { id: 'loansCount', label: 'عدد السلف' },
        { id: 'paidRepayments', label: 'الدفعات المدفوعة' },
        { id: 'remainingRepayments', label: 'الدفعات المتبقية' },
        { id: 'monthlyInstallment', label: 'الدفعة الشهرية' },
        { id: 'totalDebit', label: 'إجمالي المديونية' },
        { id: 'totalPaid', label: 'إجمالي المدفوع' },
        { id: 'totalInterest', label: 'إجمالي الفوائد' },
        { id: 'totalDiscounts', label: 'الخصومات' },
        { id: 'remaining', label: 'المتبقي' },
        { id: 'note', label: 'ملاحظات' },
      ];
      const doc = new jsPDF('landscape');
      registerArabicFonts(doc);
      const statusTitle = status === 'ACTIVE' ? 'العملاء المديونين' : 'العملاء المسددين';
      const documentTitle = `كشف تحصيل ${statusTitle}`;
      const headerEndY = drawReportHeader(doc, {
        reportTitle: documentTitle,
        metadata: { date: dayjs().format('DD/MM/YYYY'), time: dayjs().format('HH:mm') },
      });
      let yPosition = drawSeparatorLine(doc, headerEndY + 4);
      const totalDebit = clientsData.data.reduce((sum, c) => sum + (c.financials?.totalDebit || 0), 0);
      const totalPaid = clientsData.data.reduce((sum, c) => sum + (c.financials?.totalPaid || 0), 0);
      const totalRemaining = clientsData.data.reduce((sum, c) => sum + (Math.abs(c.financials?.remaining) || 0), 0);
      const summaryText = `إجمالي العملاء: ${clientsData.totalClients || clientsData.data.length} | إجمالي المديونية: ${formatCurrency(totalDebit)} | إجمالي المدفوع: ${formatCurrency(totalPaid)} | المتبقي: ${formatCurrency(totalRemaining)} | تاريخ الطباعة: ${dayjs().format('DD/MM/YYYY HH:mm')}`;
      yPosition = drawReportSummary(doc, yPosition, summaryText);
      const tableData = clientsData.data.map((client, index) => 
        columnsToExport.map(column => getFormattedColumnValue(client, column.id, index))
      );
      const headers = [columnsToExport.map(col => col.label).reverse()];
      const pageWidth = doc.internal.pageSize.width;
      const columnCount = columnsToExport.length;
      const availableWidth = pageWidth - 2 * PAGE_MARGIN;
      const baseWidths = {};
      columnsToExport.forEach((col) => {
        if (col.id === 'id') baseWidths[col.id] = 8;
        else if (col.id === 'client') baseWidths[col.id] = 28;
        else if (col.id === 'address') baseWidths[col.id] = 24;
        else if (col.id === 'note') baseWidths[col.id] = 38;
        else baseWidths[col.id] = 18;
      });
      const usedWidth = columnsToExport.reduce((sum, col) => sum + baseWidths[col.id], 0);
      const remainingWidth = availableWidth - usedWidth;
      const columnWidths = {};
      const noteExists = columnsToExport.some(col => col.id === 'note');
      const clientExists = columnsToExport.some(col => col.id === 'client');
      const addressExists = columnsToExport.some(col => col.id === 'address');
      let extraForNote = 0;
      let extraForClient = 0;
      let extraForAddress = 0;
      if (remainingWidth > 0) {
        if (noteExists) {
          extraForNote = remainingWidth * 0.6;
          const leftover = remainingWidth * 0.4;
          if (clientExists && addressExists) {
            extraForClient = leftover * 0.5;
            extraForAddress = leftover * 0.5;
          } else if (clientExists) {
            extraForClient = leftover;
          } else if (addressExists) {
            extraForAddress = leftover;
          } else {
            extraForNote += leftover;
          }
        } else if (clientExists && addressExists) {
          extraForClient = remainingWidth * 0.5;
          extraForAddress = remainingWidth * 0.5;
        } else if (clientExists) {
          extraForClient = remainingWidth;
        } else if (addressExists) {
          extraForAddress = remainingWidth;
        }
      }
      columnsToExport.forEach((col, index) => {
        let width = baseWidths[col.id];
        if (col.id === 'note') width += extraForNote;
        else if (col.id === 'client') width += extraForClient;
        else if (col.id === 'address') width += extraForAddress;
        columnWidths[columnCount - 1 - index] = width; 
      });
      let totalColumnWidth = Object.values(columnWidths).reduce((sum, width) => sum + width, 0);
      if (totalColumnWidth > availableWidth) {
        const scale = availableWidth / totalColumnWidth;
        Object.keys(columnWidths).forEach((k) => {
          columnWidths[k] = Math.round(columnWidths[k] * scale);
        });
      }
      autoTable(doc, {
        startY: yPosition,
        head: headers,
        body: tableData.map(row => row.reverse()),
        ...getPdfTableStyles({
          styles: { halign: 'right', fontStyle: 'bold', fontSize: 8, cellPadding: 3 },
          headStyles: { halign: 'right', fontSize: 9, cellPadding: 4, fillColor: PRIMARY_COLOR, textColor: [255, 255, 255] },
          bodyStyles: { halign: 'right', fontStyle: 'bold', cellPadding: 3, fontSize: 8 }
        }),
        columnStyles: columnWidths,
        margin: { left: PAGE_MARGIN, right: PAGE_MARGIN, top: yPosition, bottom: 25 },
        tableWidth: 'auto',
        horizontalPageBreak: true,
        pageBreak: 'auto',
        showHead: 'everyPage',
        didDrawTable: createDidDrawTable(doc)
      });
      const pageCount = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        drawReportFooter(doc, i, pageCount);
      }
      const pdfBlob = doc.output('blob');
      const pdfUrl = URL.createObjectURL(pdfBlob);
      const printWindow = window.open(pdfUrl);
      if (printWindow) {
        printWindow.onload = function() {
          printWindow.print();
          setTimeout(() => {
            URL.revokeObjectURL(pdfUrl);
          }, 1000);
        };
      }
      resolve();
    } catch (error) {
      console.error('Print error:', error.message);
      reject(error);
    }
  });
};