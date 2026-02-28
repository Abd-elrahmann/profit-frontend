import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { saveAs } from 'file-saver';
import { createDidDrawTable } from './pdfTableStyles';
import { registerArabicFonts, drawReportHeader, drawSeparatorLine, drawReportFooter, drawReportSummary, PAGE_MARGIN, getFullWidthColumnStyles, PRIMARY_COLOR } from './pdfReportUtils';
import dayjs from 'dayjs';
const loadPDFFromURL = async (url) => {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`فشل تحميل الملف: ${response.status}`);
    }
    const arrayBuffer = await response.arrayBuffer();
    return new Uint8Array(arrayBuffer);
  } catch (error) {
    console.error('خطأ في تحميل ملف PDF:', error);
    throw error;
  }
};
const getWithdrawingStatusText = (status) => {
  switch (status) {
    case 'WITHDRAWING':
      return 'قيد السحب';
    case 'WITHDRAWN':
      return 'تم السحب';
    default:
      return status || '-';
  }
};
const getScheduleStatusText = (status) => {
  switch (status) {
    case 'PAID':
      return 'مدفوع';
    case 'PENDING':
      return 'قيد الانتظار';
    default:
      return status || '-';
  }
};
const getArabicMonth = (month) => {
  const months = {
    1: 'يناير', 2: 'فبراير', 3: 'مارس', 4: 'أبريل',
    5: 'مايو', 6: 'يونيو', 7: 'يوليو', 8: 'أغسطس',
    9: 'سبتمبر', 10: 'أكتوبر', 11: 'نوفمبر', 12: 'ديسمبر'
  };
  return months[month] || month;
};
const mergePDFs = async (mainPDF, receiptPDF) => {
  try {
    const { PDFDocument } = await import('pdf-lib');
    const mergedPdf = await PDFDocument.create();
    const mainDoc = await PDFDocument.load(mainPDF);
    const mainPages = await mergedPdf.copyPages(mainDoc, mainDoc.getPageIndices());
    mainPages.forEach(page => mergedPdf.addPage(page));
    if (receiptPDF) {
      const receiptDoc = await PDFDocument.load(receiptPDF);
      const receiptPages = await mergedPdf.copyPages(receiptDoc, receiptDoc.getPageIndices());
      receiptPages.forEach(page => mergedPdf.addPage(page));
    }
    return await mergedPdf.save();
  } catch (error) {
    console.error('خطأ في دمج ملفات PDF:', error);
    throw error;
  }
};
export const exportWithdrawalDetailsToPDF = async (withdrawalDetails) => {
  // eslint-disable-next-line no-async-promise-executor
  return new Promise(async (resolve, reject) => {
    try {
      if (!withdrawalDetails) {
        throw new Error('لا توجد بيانات للتصدير');
      }
      const { partner, withdrawal, schedule } = withdrawalDetails;
      const hasReceipt = withdrawal?.WITHDRAWAL_RECEIPT;
      let receiptPDF = null;
      if (hasReceipt) {
        try {
          receiptPDF = await loadPDFFromURL(withdrawal.WITHDRAWAL_RECEIPT);

        } catch (error) {
          console.warn('لا يمكن تحميل عقد المخالصة:', error);
        }
      }
      const doc = new jsPDF('landscape');
      registerArabicFonts(doc);
      doc.setProperties({
        title: 'تقرير انسحاب المستثمر',
        subject: 'بيانات انسحاب المستثمر',
        author: 'نظام إدارة السلف',
        keywords: 'انسحاب, مستثمر, تقرير',
        creator: 'نظام إدارة السلف'
      });
      const pageWidth = doc.internal.pageSize.width;
      const pageHeight = doc.internal.pageSize.height;
      let yPosition = drawReportHeader(doc, {
        reportTitle: 'تقرير انسحاب المستثمر',
        metadata: { date: dayjs().format('DD/MM/YYYY'), time: dayjs().format('HH:mm') }
      });
      yPosition = drawSeparatorLine(doc, yPosition);
      const summaryText = `المستثمر: ${partner?.name || '-'} | رقم الهوية: ${partner?.nationalId || '-'} | تاريخ التصدير: ${dayjs().format('DD/MM/YYYY HH:mm')}`;
      yPosition = drawReportSummary(doc, yPosition, summaryText);
      doc.setFontSize(14);
      doc.setFont('Amiri', 'bold');
      doc.setTextColor(13, 64, 165);
      doc.text('معلومات المستثمر', pageWidth / 2, yPosition, { align: 'center' });
      yPosition += 10;
      const investorHeaders = [['القيمة', 'البيان']];
      const investorData = [
        [partner?.name || '-', 'الاسم'],
        [partner?.nationalId || '-', 'رقم الهوية الوطنية'],
        [getWithdrawingStatusText(partner?.withdrawingStatus), 'حالة السحب'],
        [partner?.isFrozen ? 'مجمّد' : 'نشط', 'الحالة'],
      ];
      autoTable(doc, {
        startY: yPosition,
        head: investorHeaders,
        body: investorData,
        theme: 'striped',
        styles: {
          font: 'Amiri',
          fontStyle: 'bold',
          fontSize: 10,
          cellPadding: { top: 5, bottom: 5, left: 6, right: 6 },
          lineColor: [220, 220, 220],
          lineWidth: 0.2,
          halign: 'right',
          valign: 'middle',
          direction: 'rtl'
        },
        headStyles: {
          fillColor: PRIMARY_COLOR,
          textColor: [255, 255, 255],
          fontStyle: 'bold',
          fontSize: 11,
          halign: 'right',
          cellPadding: { top: 6, bottom: 6, left: 6, right: 6 },
        },
        columnStyles: getFullWidthColumnStyles(doc, [80, 60]),
        margin: { left: PAGE_MARGIN, right: PAGE_MARGIN },
        tableWidth: 'auto',
        didDrawTable: createDidDrawTable(doc)
      });
      yPosition = doc.lastAutoTable.finalY + 15;
      if (withdrawal) {
        doc.setFontSize(14);
        doc.setFont('Amiri', 'bold');
        doc.setTextColor(13, 64, 165);
        doc.text('معلومات طلب الانسحاب', pageWidth / 2, yPosition, { align: 'center' });
        yPosition += 10;
        const withdrawalHeaders = [['القيمة', 'البيان']];
        const withdrawalData = [
          [withdrawal.totalCapital?.toLocaleString('en-US') || '0', 'رأس المال الإجمالي'],
          [withdrawal.defaultShare?.toLocaleString('en-US') || '0', 'مبلغ التعثرات'],
          [withdrawal.remainingCapital?.toLocaleString('en-US') || '0', 'رأس المال المتبقي'],
          [withdrawal.savingAmount?.toLocaleString('en-US') || '0', 'مبلغ الادخار'],
          [withdrawal.monthlyAmount?.toLocaleString('en-US') || '0', 'المبلغ الشهري'],
          [withdrawal.createdAt ? dayjs(withdrawal.createdAt).format('DD/MM/YYYY') : '-', 'تاريخ الطلب'],
        ];
        autoTable(doc, {
          startY: yPosition,
          head: withdrawalHeaders,
          body: withdrawalData,
          theme: 'striped',
          styles: {
            font: 'Amiri',
            fontStyle: 'bold',
            fontSize: 10,
            cellPadding: { top: 5, bottom: 5, left: 6, right: 6 },
            lineColor: [220, 220, 220],
            lineWidth: 0.2,
            halign: 'right',
            valign: 'middle',
            direction: 'rtl'
          },
          headStyles: {
            fillColor: PRIMARY_COLOR,
            textColor: [255, 255, 255],
            fontStyle: 'bold',
            fontSize: 11,
            halign: 'right',
            cellPadding: { top: 6, bottom: 6, left: 6, right: 6 },
          },
          columnStyles: getFullWidthColumnStyles(doc, [80, 60]),
          margin: { left: PAGE_MARGIN, right: PAGE_MARGIN },
          tableWidth: 'auto',
          didDrawTable: createDidDrawTable(doc)
        });
        yPosition = doc.lastAutoTable.finalY + 15;
      }
      if (schedule && schedule.length > 0) {
        if (yPosition > pageHeight - 80) {
          doc.addPage();
          yPosition = 25;
        }
        doc.setFontSize(14);
        doc.setFont('Amiri', 'bold');
        doc.setTextColor(13, 64, 165);
        doc.text('جدول السحب', pageWidth / 2, yPosition, { align: 'center' });
        yPosition += 10;
        const scheduleHeaders = [['تاريخ الدفع', 'الحالة', 'المدفوع', 'إجمالي المبلغ', 'المرحل', 'المبلغ', 'الشهر', 'السنة']];
        const scheduleData = schedule.map(item => [
          item.paidAt ? dayjs(item.paidAt).format('DD/MM/YYYY') : '-',
          getScheduleStatusText(item.status),
          item.paidAmount?.toLocaleString('en-US') || '0',
          ((item.amount || 0) + (item.carryAmount || 0)).toLocaleString('en-US'),
          item.carryAmount?.toLocaleString('en-US') || '0',
          item.amount?.toLocaleString('en-US') || '0',
          getArabicMonth(item.month) || item.month,
          item.year || '-',
        ]);
        autoTable(doc, {
          startY: yPosition,
          head: scheduleHeaders,
          body: scheduleData,
          theme: 'striped',
          styles: {
            font: 'Amiri',
            fontStyle: 'bold',
            fontSize: 9,
            cellPadding: { top: 4, bottom: 4, left: 3, right: 3 },
            lineColor: [220, 220, 220],
            lineWidth: 0.2,
            halign: 'center',
            valign: 'middle'
          },
          headStyles: {
            fillColor: PRIMARY_COLOR,
            textColor: [255, 255, 255],
            fontStyle: 'bold',
            fontSize: 9,
            halign: 'center',
            cellPadding: { top: 5, bottom: 5, left: 3, right: 3 },
          },
          columnStyles: getFullWidthColumnStyles(doc, [22, 22, 22, 25, 22, 22, 22, 22]),
          margin: { left: PAGE_MARGIN, right: PAGE_MARGIN },
          pageBreak: 'auto',
          showHead: 'everyPage',
          didDrawTable: createDidDrawTable(doc)
        });
      }
      const pageCount = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        drawReportFooter(doc, i, pageCount);
      }
      if (hasReceipt && receiptPDF) {
        try {
          const mainPDF = doc.output('arraybuffer');
          const mergedPDF = await mergePDFs(mainPDF, receiptPDF);
          const fileName = `تقرير_انسحاب_${partner?.name?.replace(/[^a-zA-Z0-9\u0600-\u06FF]/g, '_') || 'مستثمر'}_${dayjs().format('YYYY-MM-DD')}.pdf`;
          const blob = new Blob([mergedPDF], { type: 'application/pdf' });
          saveAs(blob, fileName);
          resolve();
        } catch (error) {
          console.error('Error merging PDFs:', error.message);
          const fileName = `تقرير_انسحاب_${partner?.name?.replace(/[^a-zA-Z0-9\u0600-\u06FF]/g, '_') || 'مستثمر'}_${dayjs().format('YYYY-MM-DD')}.pdf`;
          doc.save(fileName);
          resolve();
        }
      } else {
        const fileName = `تقرير_انسحاب_${partner?.name?.replace(/[^a-zA-Z0-9\u0600-\u06FF]/g, '_') || 'مستثمر'}_${dayjs().format('YYYY-MM-DD')}.pdf`;
        doc.save(fileName);
        resolve();
      }
    } catch (error) {
      console.error('PDF export error:', error.message);
      reject(error);
    }
  });
};
export const exportWithdrawalDetailsToExcel = async (withdrawalDetails) => {
  try {
    if (!withdrawalDetails) {
      throw new Error('لا توجد بيانات للتصدير');
    }
    const { partner, withdrawal, schedule } = withdrawalDetails;
    const XLSX = await import('xlsx');
    const workbook = XLSX.utils.book_new();
    const investorData = [
      ['معلومات المستثمر'],
      [''],
      ['البيان', 'القيمة'],
      ['الاسم', partner?.name || '-'],
      ['رقم الهوية الوطنية', partner?.nationalId || '-'],
      ['حالة السحب', getWithdrawingStatusText(partner?.withdrawingStatus)],
      ['الحالة', partner?.isFrozen ? 'مجمّد' : 'نشط'],
    ];
    const investorSheet = XLSX.utils.aoa_to_sheet(investorData);
    investorSheet['!cols'] = [{ wch: 25 }, { wch: 35 }];
    XLSX.utils.book_append_sheet(workbook, investorSheet, 'معلومات المستثمر');
    if (withdrawal) {
      const withdrawalData = [
        ['معلومات طلب الانسحاب'],
        [''],
        ['البيان', 'القيمة'],
        ['رأس المال الإجمالي', withdrawal.totalCapital || 0],
        ['مبلغ التعثرات', withdrawal.defaultShare || 0],
        ['رأس المال المتبقي', withdrawal.remainingCapital || 0],
        ['مبلغ الادخار', withdrawal.savingAmount || 0],
        ['المبلغ الشهري', withdrawal.monthlyAmount || 0],
        ['تاريخ الطلب', withdrawal.createdAt ? dayjs(withdrawal.createdAt).format('DD/MM/YYYY') : '-'],
        ['عقد المخالصة', withdrawal.WITHDRAWAL_RECEIPT || 'غير متاح'],
      ];
      const withdrawalSheet = XLSX.utils.aoa_to_sheet(withdrawalData);
      withdrawalSheet['!cols'] = [{ wch: 25 }, { wch: 50 }];
      XLSX.utils.book_append_sheet(workbook, withdrawalSheet, 'طلب الانسحاب');
    }
    if (schedule && schedule.length > 0) {
      const scheduleData = [
        ['جدول السحب'],
        [''],
        ['السنة', 'الشهر', 'المبلغ', 'المرحل', 'إجمالي المبلغ', 'المدفوع', 'الحالة', 'تاريخ الدفع'],
        ...schedule.map(item => [
          item.year || '-',
          getArabicMonth(item.month) || item.month,
          item.amount || 0,
          item.carryAmount || 0,
          (item.amount || 0) + (item.carryAmount || 0),
          item.paidAmount || 0,
          getScheduleStatusText(item.status),
          item.paidAt ? dayjs(item.paidAt).format('DD/MM/YYYY') : '-',
        ])
      ];
      const totalAmount = schedule.reduce((sum, item) => sum + (item.amount || 0), 0);
      const totalCarry = schedule.reduce((sum, item) => sum + (item.carryAmount || 0), 0);
      const totalPaid = schedule.reduce((sum, item) => sum + (item.paidAmount || 0), 0);
      scheduleData.push(['']);
      scheduleData.push([
        'الإجمالي',
        '',
        totalAmount,
        totalCarry,
        totalAmount + totalCarry,
        totalPaid,
        '',
        ''
      ]);
      const scheduleSheet = XLSX.utils.aoa_to_sheet(scheduleData);
      scheduleSheet['!cols'] = [
        { wch: 12 },
        { wch: 15 },
        { wch: 15 },
        { wch: 15 },
        { wch: 18 },
        { wch: 15 },
        { wch: 15 },
        { wch: 15 },
      ];
      XLSX.utils.book_append_sheet(workbook, scheduleSheet, 'جدول السحب');
    }
    const excelBuffer = XLSX.write(workbook, { 
      bookType: 'xlsx', 
      type: 'array',
      bookSST: false 
    });
    const blob = new Blob([excelBuffer], { 
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
    });
    const fileName = `تقرير_انسحاب_${partner?.name?.replace(/[^a-zA-Z0-9\u0600-\u06FF]/g, '_') || 'مستثمر'}_${dayjs().format('YYYY-MM-DD')}.xlsx`;
    saveAs(blob, fileName);
  } catch (error) {
    console.error('Excel export error:', error.message);
    throw error;
  }
};