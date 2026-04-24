import { saveAs } from 'file-saver';
import dayjs from 'dayjs';
import { exportUnifiedReport } from './unifiedReportTemplate';
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
      const rows = (schedule || []).map((item) => ({
        paidAt: item.paidAt ? dayjs(item.paidAt).format('DD/MM/YYYY') : '-',
        status: getScheduleStatusText(item.status),
        paidAmount: item.paidAmount || 0,
        totalAmount: (item.amount || 0) + (item.carryAmount || 0),
        carryAmount: item.carryAmount || 0,
        amount: item.amount || 0,
        month: getArabicMonth(item.month) || item.month,
        year: item.year || '-',
      }));
      const doc = await exportUnifiedReport({
        reportTitle: 'تقرير انسحاب المستثمر',
        fileName: `تقرير_انسحاب_${partner?.name?.replace(/[^a-zA-Z0-9\u0600-\u06FF]/g, '_') || 'مستثمر'}`,
        orientation: 'landscape',
        subtitle: `المستثمر: ${partner?.name || '-'} | رقم الهوية: ${partner?.nationalId || '-'} | حالة السحب: ${getWithdrawingStatusText(partner?.withdrawingStatus)} | رأس المال المتبقي: ${(withdrawal?.remainingCapital || 0).toLocaleString('en-US')}`,
        columns: [
          { header: 'تاريخ الدفع', dataKey: 'paidAt', width: 22 },
          { header: 'الحالة', dataKey: 'status', width: 22, align: 'right' },
          { header: 'المدفوع', dataKey: 'paidAmount', width: 22, format: 'number0' },
          { header: 'إجمالي المبلغ', dataKey: 'totalAmount', width: 25, format: 'number0' },
          { header: 'المرحل', dataKey: 'carryAmount', width: 22, format: 'number0' },
          { header: 'المبلغ', dataKey: 'amount', width: 22, format: 'number0' },
          { header: 'الشهر', dataKey: 'month', width: 22, align: 'right' },
          { header: 'السنة', dataKey: 'year', width: 22 },
        ],
        rows,
      });
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
