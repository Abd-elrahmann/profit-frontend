import { saveAs } from 'file-saver';
import dayjs from 'dayjs';
import { exportUnifiedReport } from './unifiedReportTemplate';
export const exportRepaymentsToPDF = async (repaymentsData, loanData) => {
  if (!repaymentsData || !Array.isArray(repaymentsData) || repaymentsData.length === 0) {
    throw new Error('لا توجد بيانات للتصدير');
  }
  const clientName = loanData?.client?.name || 'غير محدد';
  const totalDiscounts = repaymentsData.reduce((sum, repayment) => sum + (repayment.discount || 0), 0);
  return exportUnifiedReport({
    reportTitle: 'تقرير دفعات السلفه',
    fileName: `تقرير_دفعات_السلفه_${clientName}`,
    orientation: 'landscape',
    subtitle: `العميل: ${clientName} | إجمالي الدفعات: ${repaymentsData.length} | إجمالي الخصومات: ${totalDiscounts.toLocaleString('en-US')}`,
    columns: [
      { header: 'حالة الدفع', dataKey: 'paymentStatusText', width: 24, align: 'right' },
      { header: 'المبلغ المدفوع', dataKey: 'paidAmount', width: 22, format: 'number0' },
      { header: 'الحالة', dataKey: 'statusText', width: 20, align: 'right' },
      { header: 'إجمالي الدفعة', dataKey: 'amount', width: 22, format: 'number0' },
      { header: 'الفائدة', dataKey: 'interestAmount', width: 20, format: 'number0' },
      { header: 'المبلغ الأساسي', dataKey: 'principalAmount', width: 22, format: 'number0' },
      { header: 'تاريخ الاستحقاق', dataKey: 'dueDateText', width: 22 },
      { header: 'رقم الدفعة', dataKey: 'count', width: 18 },
    ],
    rows: repaymentsData.map((repayment) => ({
      ...repayment,
      count: repayment.count || repayment.installmentNumber || '-',
      dueDateText: repayment.dueDate ? dayjs(repayment.dueDate).format('DD/MM/YYYY') : '-',
      principalAmount: repayment.principalAmount || 0,
      interestAmount: repayment.interestAmount || 0,
      amount: repayment.amount || 0,
      statusText: getStatusText(repayment.status),
      paidAmount: repayment.paidAmount || 0,
      paymentStatusText: getPaymentStatusText(repayment.status),
    })),
  });
};
export const exportRepaymentsToExcel = async (repaymentsData, loanData) => {
  try {
    if (!repaymentsData || !Array.isArray(repaymentsData) || repaymentsData.length === 0) {
      throw new Error('لا توجد بيانات للتصدير');
    }
    const XLSX = await import('xlsx');
    const workbook = XLSX.utils.book_new();
    const clientName = loanData?.client?.name || 'غير محدد';
    const totalDiscounts = repaymentsData.reduce((sum, repayment) => sum + (repayment.discount || 0), 0);
    const summaryData = [
      ['ملخص السلفة'],
      [''],
      [loanData?.amount || 0, 'مبلغ السلفة'],
      [loanData?.interestAmount || 0, 'إجمالي الفائدة'],
      [loanData?.totalAmount || 0, 'المبلغ الإجمالي'],
      [loanData?.pagination?.totalPaidAmount || 0, 'المبلغ المدفوع'],
      [loanData?.pagination?.totalRemainingAmount || 0, 'المبلغ المتبقي'],
      [totalDiscounts, 'إجمالي الخصومات'],
      [''],
      ['تفاصيل السلفة'],
      [''],
      [clientName, 'العميل'],
      [loanData?.type || '', 'نوع السلفة'],
      [loanData?.startDate ? dayjs(loanData.startDate).format('DD/MM/YYYY') : '', 'تاريخ البداية'],
      [loanData?.status || '', 'حالة السلفة'],
    ];
    const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
    summarySheet['!cols'] = [
      { wch: 25 },
      { wch: 30 }
    ];
    XLSX.utils.book_append_sheet(workbook, summarySheet, 'ملخص السلفة');
    const repaymentsHeaders = ['حالة الدفع', 'المبلغ المدفوع', 'الحالة', 'إجمالي الدفعة', 'الفائدة', 'المبلغ الأساسي', 'تاريخ الاستحقاق', 'رقم الدفعة'];
    const repaymentsTableData = [
      repaymentsHeaders,
      ...repaymentsData.map(repayment => ([
        getPaymentStatusText(repayment.status),
        repayment.paidAmount || 0,
        getStatusText(repayment.status),
        repayment.amount || 0,
        repayment.interestAmount || 0,
        repayment.principalAmount || 0,
        repayment.dueDate ? dayjs(repayment.dueDate).format('DD/MM/YYYY') : '-',
        repayment.count || repayment.installmentNumber || '-',
      ]))
    ];
    const repaymentsSheet = XLSX.utils.aoa_to_sheet(repaymentsTableData);
    repaymentsSheet['!cols'] = [
      { wch: 20 },
      { wch: 20 },
      { wch: 15 },
      { wch: 20 },
      { wch: 15 },
      { wch: 20 },
      { wch: 20 },
      { wch: 15 }
    ];
    XLSX.utils.book_append_sheet(workbook, repaymentsSheet, 'جدول الدفعات');
    const excelBuffer = XLSX.write(workbook, {
      bookType: 'xlsx',
      type: 'array',
      bookSST: false
    });
    const blob = new Blob([excelBuffer], {
      type: 'application/vnd.openxmlformats-officdocument.spreadsheetml.sheet'
    });
    const fileName = `تقرير_دفعات_السلفه_${clientName}_${dayjs().format('YYYY-MM-DD')}.xlsx`;
    saveAs(blob, fileName);
  } catch (error) {
    console.error('Excel export error:', error.message);
    throw error;
  }
};
const getStatusText = (status) => {
  switch (status) {
    case "PENDING":
      return "معلق";
    case "PAID":
      return "مدفوع";
    case "PARTIAL":
      return "مدفوع جزئياً";
    case "OVERDUE":
      return "متأخر";
    default:
      return status;
  }
};
const getPaymentStatusText = (status) => {
  switch (status) {
    case "PENDING":
      return "لم يتم الدفع";
    case "PAID":
      return "تم الدفع";
    case "EARLY_PAID":
      return "تم الدفع مبكراً";
    case "PARTIAL_PAID":
      return "دفع جزئي";
    case "COMPLETED":
      return "مكتملة";
    case "OVERDUE":
      return "متأخرة";
    case "CANCELLED":
      return "ملغية";
    default:
      return status;
  }
};
