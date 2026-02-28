import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { saveAs } from 'file-saver';
import { createDidDrawTable } from './pdfTableStyles';
import { registerArabicFonts, drawReportHeader, drawSeparatorLine, drawReportFooter, drawReportSummary, PAGE_MARGIN, PRIMARY_COLOR } from './pdfReportUtils';
import dayjs from 'dayjs';
const normalizePartnerData = (partnerData) => {
  if (partnerData.AccountPayable && typeof partnerData.AccountPayable === 'object') {
    return {
      id: partnerData.id,
      name: partnerData.name,
      nationalId: partnerData.nationalId,
      phone: partnerData.phone || '-',
      email: partnerData.email || 'لا يوجد',
      address: partnerData.address || '-',
      city: partnerData.city || '-',
      capitalAmount: partnerData.capitalAmount || 0,
      orgProfitPercent: partnerData.orgProfitPercent || 0,
      partnerProfitPercent: partnerData.partnerProfitPercent || 0,
      totalProfit: partnerData.totalProfit || 0,
      totalAmount: partnerData.totalAmount || 0,
      createdAt: partnerData.createdAt,
      isActive: partnerData.isActive !== undefined ? partnerData.isActive : true,
      transactions: partnerData.transactions || [],
      loans: partnerData.loans || [],
      AccountEquity: partnerData.AccountEquity || null,
      AccountPayable: partnerData.AccountPayable || null,
      totalSaving: partnerData.totalSaving || 0,
      totalAvilableSaving: partnerData.totalAvilableSaving || 0,
      totalWithdrawal: partnerData.totalWithdrawal || 0,
      yearlyZakatRequired: partnerData.yearlyZakatRequired || 0,
      yearlyZakatPaid: partnerData.yearlyZakatPaid || 0,
      yearlyZakatBalance: partnerData.yearlyZakatBalance || 0,
      upcomingProfit: partnerData.upcomingProfit || 0,
      newCapitalAmount: partnerData.newCapitalAmount || 0,
      newCapitalPercent: partnerData.newCapitalPercent || 0,
      total: partnerData.total || 0,
      summary: partnerData.summary || {},
    };
  }
  if (partnerData.accountPayableId || partnerData.accountEquityId) {
    return {
      id: partnerData.id,
      name: partnerData.name,
      nationalId: partnerData.nationalId,
      phone: partnerData.phone || '-',
      email: partnerData.email || 'لا يوجد',
      address: partnerData.address || '-',
      capitalAmount: partnerData.capitalAmount || 0,
      orgProfitPercent: partnerData.orgProfitPercent || 0,
      partnerProfitPercent: partnerData.partnerProfitPercent || 0,
      totalProfit: partnerData.totalProfit || 0,
      totalAmount: partnerData.totalAmount || 0,
      createdAt: partnerData.createdAt,
      isActive: partnerData.isActive !== undefined ? partnerData.isActive : true,
      transactions: partnerData.transactions || [],
      loans: partnerData.loans || [],
      AccountEquity: partnerData.AccountEquity || { name: partnerData.accountEquityName || `رأس مال - ${partnerData.name}` },
      AccountPayable: partnerData.AccountPayable || { name: partnerData.accountPayableName || `مستحق - ${partnerData.name}` },
      totalSaving: partnerData.totalSaving || 0,
      yearlyZakatRequired: partnerData.yearlyZakatRequired || 0,
      yearlyZakatPaid: partnerData.yearlyZakatPaid || 0,
      yearlyZakatBalance: partnerData.yearlyZakatBalance || 0,
      upcomingProfit: partnerData.upcomingProfit || 0,
      newCapitalAmount: partnerData.newCapitalAmount || 0,
      newCapitalPercent: partnerData.newCapitalPercent || 0,
      total: partnerData.total || 0,
    };
  }
  if (partnerData.profile) {
    return {
      id: partnerData.profile.id,
      name: partnerData.profile.name,
      nationalId: partnerData.profile.nationalId,
      phone: partnerData.profile.phone || '-',
      email: partnerData.profile.email || 'لا يوجد',
      address: partnerData.profile.address || '-',
      capitalAmount: partnerData.profile.capitalAmount || 0,
      orgProfitPercent: partnerData.profile.orgProfitPercent || 0,
      partnerProfitPercent: partnerData.profile.partnerProfitPercent || 0,
      totalProfit: partnerData.profile.totalProfit || 0,
      totalAmount: partnerData.profile.totalAmount || 0,
      createdAt: partnerData.profile.createdAt,
      isActive: partnerData.profile.isActive !== undefined ? partnerData.profile.isActive : true,
      transactions: partnerData.transactions || [],
      loans: partnerData.loans || [],
      summary: partnerData.summary || {},
      AccountEquity: partnerData.AccountEquity || null,
      AccountPayable: partnerData.AccountPayable || null,
      upcomingProfit: partnerData.upcomingProfit || 0,
      newCapitalAmount: partnerData.profile?.newCapitalAmount || 0,
      newCapitalPercent: partnerData.profile?.newCapitalPercent || 0,
      total: partnerData.total || 0,
    };
  }
  return {
    id: partnerData.id,
    name: partnerData.name,
    nationalId: partnerData.nationalId,
    phone: partnerData.phone || '-',
    email: partnerData.email || 'لا يوجد',
    address: partnerData.address || '-',
    capitalAmount: partnerData.capitalAmount || 0,
    orgProfitPercent: partnerData.orgProfitPercent || 0,
    partnerProfitPercent: partnerData.partnerProfitPercent || 0,
    totalProfit: partnerData.totalProfit || 0,
    totalAmount: partnerData.totalAmount || 0,
    accountBalance: partnerData.accountBalance || 0,
    loansCount: partnerData.loansCount || 0,
    totalDeposits: partnerData.totalDeposits || 0,
    totalWithdrawals: partnerData.totalWithdrawals || 0,
    totalAccruedProfit: partnerData.totalAccruedProfit || 0,
    zakat: partnerData.zakat || {},
    createdAt: partnerData.createdAt,
    isActive: partnerData.isActive !== undefined ? partnerData.isActive : true,
    transactions: partnerData.transactions || [],
    loans: partnerData.loans || [],
    AccountEquity: partnerData.AccountEquity || null,
    AccountPayable: partnerData.AccountPayable || null,
    upcomingProfit: partnerData.upcomingProfit || 0,
    newCapitalAmount: partnerData.newCapitalAmount || 0,
    newCapitalPercent: partnerData.newCapitalPercent || 0,
    total: partnerData.total || 0,
  };
};
export const exportInvestorsToPDF = async (investorsData) => {
  return new Promise((resolve, reject) => {
    try {
      if (!investorsData || !Array.isArray(investorsData) || investorsData.length === 0) {
        throw new Error('لا توجد بيانات للتصدير');
      }
      const doc = new jsPDF('landscape');
      registerArabicFonts(doc);
      doc.setProperties({
        title: 'تقرير المستثمرين',
        subject: 'بيانات المستثمرين',
        author: 'نظام إدارة السلف',
        keywords: 'مستثمرين, تقرير, بيانات',
        creator: 'نظام إدارة السلف'
      });
      let yPosition = drawReportHeader(doc, {
        reportTitle: 'تقرير المستثمرين',
        metadata: { date: dayjs().format('DD/MM/YYYY'), time: dayjs().format('HH:mm') }
      });
      yPosition = drawSeparatorLine(doc, yPosition);
      const summaryText = `إجمالي المستثمرين: ${investorsData.length} | تاريخ التصدير: ${dayjs().format('DD/MM/YYYY HH:mm')}`;
      yPosition = drawReportSummary(doc, yPosition, summaryText);
      const pageWidth = doc.internal.pageSize.width;
      investorsData.forEach((partnerData, index) => {
        const investor = normalizePartnerData(partnerData);
        if (index > 0) {
          doc.addPage();
          yPosition = 20;
        }
        doc.setFontSize(16);
        doc.setFont('Amiri', 'bold');
        doc.setTextColor(13, 64, 165);
        doc.text(`المستثمر: ${investor.name}`, pageWidth / 2, yPosition, { align: 'center' });
        yPosition += 8;
        doc.setFontSize(11);
        doc.setFont('Amiri', 'bold');
        doc.setTextColor(100, 100, 100);
        doc.text(`رقم الهوية الوطنية: ${investor.nationalId}`, pageWidth / 2, yPosition, { align: 'center' });
        yPosition += 12;
        doc.setFontSize(12);
        doc.setFont('Amiri', 'bold');
        doc.setTextColor(0, 0, 0);
        doc.text('التفاصيل الشخصية', pageWidth / 2, yPosition, { align: 'center' });
        yPosition += 8;
        const personalHeaders = [['القيمة', 'المعلومة']];
        const personalData = [
          [investor.name || '-', 'الاسم الكامل'],
          [investor.nationalId || '-', 'رقم الهوية الوطنية'],
          [investor.phone || '-', 'رقم الجوال'],
          [investor.email || 'لا يوجد', 'البريد الإلكتروني'],
          [investor.address || '-', 'العنوان'],
          [investor.city || '-', 'المدينة'],
          [investor.createdAt ? dayjs(investor.createdAt).format('DD/MM/YYYY') : '-', 'تاريخ الانضمام الميلادي'],
          [investor.isActive ? 'نشط' : 'غير نشط', 'الحالة']
        ];
        autoTable(doc, {
          startY: yPosition,
          head: personalHeaders,
          body: personalData,
          theme: 'striped',
          styles: {
            font: 'Amiri',
            fontStyle: 'bold',
            fontSize: 9,
            cellPadding: { top: 4, bottom: 4, left: 4, right: 4 },
            lineColor: [220, 220, 220],
            lineWidth: 0.2,
            halign: 'right',
            valign: 'middle',
            overflow: 'linebreak',
            direction: 'rtl'
          },
          headStyles: {
            fillColor: PRIMARY_COLOR,
            textColor: [255, 255, 255],
            fontStyle: 'bold',
            fontSize: 10,
            halign: 'right',
            valign: 'middle',
            cellPadding: { top: 6, bottom: 6, left: 6, right: 6 },
            overflow: 'linebreak',
            minCellHeight: 10,
            direction: 'rtl'
          },
          bodyStyles: {
            fontStyle: 'bold',
            halign: 'right',
            valign: 'middle',
            cellPadding: 4,
            direction: 'rtl'
          },
          columnStyles: {
            0: { cellWidth: 'auto', halign: 'right' },
            1: { cellWidth: 'auto', halign: 'right' }
          },
          margin: { top: yPosition, left: PAGE_MARGIN, right: PAGE_MARGIN },
          tableWidth: 'auto',
          horizontalPageBreak: false,
          didDrawTable: createDidDrawTable(doc)
        });
        yPosition = doc.lastAutoTable.finalY + 12;
        doc.addPage();
        yPosition = 20;
        doc.setFontSize(12);
        doc.setFont('Amiri', 'bold');
        doc.setTextColor(0, 0, 0);
        doc.text('المعلومات المالية', pageWidth / 2, yPosition, { align: 'center' });
        yPosition += 8;
        const financialHeaders = [['القيمة', 'المعلومة']];
        const financialData = [
          [investor.capitalAmount ? investor.capitalAmount.toLocaleString('en-US') : '-', 'رأس المال الأصلي'],
          [investor.newCapitalAmount ? investor.newCapitalAmount.toLocaleString('en-US') : '-', 'رأس المال الجديد'],
          [investor.total ? investor.total.toLocaleString('en-US') : '-', 'إجمالي مبلغ الاستثمار'],
          [investor.newCapitalPercent ? investor.newCapitalPercent + '%' : '-', 'نسبة رأس المال الجديد'],
          [investor.upcomingProfit ? investor.upcomingProfit.toLocaleString('en-US') : '0', 'الأرباح القادمة'],
          [investor.totalProfit ? investor.totalProfit.toLocaleString('en-US') : '0', 'إجمالي الأرباح الفعلي'],
          [investor.totalSaving ? investor.totalSaving.toLocaleString('en-US') : '0', 'إجمالي الادخار'],
          [investor.partnerProfitPercent ? investor.partnerProfitPercent + '%' : '-', 'نسبة أرباح المستثمر'],
          [investor.orgProfitPercent ? investor.orgProfitPercent + '%' : '-', 'نسبة أرباح المنشأة']
        ];
        autoTable(doc, {
          startY: yPosition,
          head: financialHeaders,
          body: financialData,
          theme: 'striped',
          styles: {
            font: 'Amiri',
            fontStyle: 'bold',
            fontSize: 9,
            cellPadding: { top: 4, bottom: 4, left: 4, right: 4 },
            lineColor: [220, 220, 220],
            lineWidth: 0.2,
            halign: 'right',
            valign: 'middle',
            overflow: 'linebreak',
            direction: 'rtl'
          },
          headStyles: {
            fillColor: PRIMARY_COLOR,
            textColor: [255, 255, 255],
            fontStyle: 'bold',
            fontSize: 10,
            halign: 'right',
            valign: 'middle',
            cellPadding: { top: 6, bottom: 6, left: 6, right: 6 },
            overflow: 'linebreak',
            minCellHeight: 10,
            direction: 'rtl'
          },
          bodyStyles: {
            fontStyle: 'bold',
            halign: 'right',
            valign: 'middle',
            cellPadding: 4,
            direction: 'rtl'
          },
          columnStyles: {
            0: { cellWidth: 'auto', halign: 'right' },
            1: { cellWidth: 'auto', halign: 'right' }
          },
          margin: { top: yPosition, left: PAGE_MARGIN, right: PAGE_MARGIN },
          tableWidth: 'auto',
          horizontalPageBreak: false,
          didDrawTable: createDidDrawTable(doc)
        });
        yPosition = doc.lastAutoTable.finalY + 12;
        if (investor.summary || investor.loans) {
          doc.addPage();
          yPosition = 20;
          doc.setFontSize(12);
          doc.setFont('Amiri', 'bold');
          doc.setTextColor(0, 0, 0);
          doc.text('ملخص البيانات', pageWidth / 2, yPosition, { align: 'center' });
          yPosition += 8;
          const summaryHeaders = [['القيمة', 'الملخص']];
          const totalLoans = investor.loans ? investor.loans.length : 0;
          const activeLoans = investor.loans ? investor.loans.filter(loan => loan.status === 'ACTIVE').length : 0;
          const completedLoans = investor.loans ? investor.loans.filter(loan => loan.status === 'COMPLETED').length : 0;
          const totalLoanAmount = investor.loans ? investor.loans.reduce((sum, loan) => sum + (loan.amount || 0), 0) : 0;
          const summaryData = [
            [investor.totalAmount ? investor.totalAmount.toLocaleString('en-US') : '0', 'إجمالي الأرباح'],
            [investor.summary?.profits?.totalCompanyCut ? investor.summary.profits.totalCompanyCut.toLocaleString('en-US') : ((investor.totalAmount || 0) - (investor.totalProfit || 0)).toLocaleString('en-US'), 'حصة المنشأة من الأرباح'],
            [investor.totalProfit ? investor.totalProfit.toLocaleString('en-US') : '0', 'حصة المستثمر من الأرباح'],
            [investor.summary?.profits?.distributedProfit ? investor.summary.profits.distributedProfit.toLocaleString('en-US') : '0', 'الأرباح المحصلة'],
            [investor.summary?.profits?.undistributedProfit ? investor.summary.profits.undistributedProfit.toLocaleString('en-US') : investor.totalProfit ? investor.totalProfit.toLocaleString('en-US') : '0', 'الأرباح المتبقية'],
            [totalLoans.toString(), 'إجمالي السلف'],
            [activeLoans.toString(), 'السلف النشطة'],
            [completedLoans.toString(), 'السلف المكتملة'],
            [totalLoanAmount.toLocaleString('en-US'), 'إجمالي مبلغ السلف'],
            [investor.summary?.transactions?.totalDeposits ? investor.summary.transactions.totalDeposits.toLocaleString('en-US') : '0', 'إجمالي الإيداعات'],
            [investor.summary?.transactions?.totalWithdrawals ? investor.summary.transactions.totalWithdrawals.toLocaleString('en-US') : '0', 'إجمالي السحوبات'],
            [investor.totalAvilableSaving ? investor.totalAvilableSaving.toLocaleString('en-US') : '0', 'الرصيد المتاح للسحب'],
            [investor.totalWithdrawal ? investor.totalWithdrawal.toLocaleString('en-US') : '0', 'المبلغ المسحوب'],
            [investor.yearlyZakatRequired ? investor.yearlyZakatRequired.toLocaleString('en-US') : (investor.summary?.zakat?.totalZakatAccrued ? investor.summary.zakat.totalZakatAccrued.toLocaleString('en-US') : '0'), 'المستحقة'],
            [investor.yearlyZakatPaid ? investor.yearlyZakatPaid.toLocaleString('en-US') : (investor.summary?.zakat?.totalZakatPaid ? investor.summary.zakat.totalZakatPaid.toLocaleString('en-US') : '0'), 'المدفوعة'],
            [investor.yearlyZakatBalance ? investor.yearlyZakatBalance.toLocaleString('en-US') : (investor.summary?.zakat?.zakatBalance ? investor.summary.zakat.zakatBalance.toLocaleString('en-US') : '0'), 'الرصيد'],
          ];
          const initialPage = doc.internal.getCurrentPageInfo().pageNumber;
          autoTable(doc, {
            startY: yPosition,
            head: summaryHeaders,
            body: summaryData,
            theme: 'striped',
            styles: {
              font: 'Amiri',
              fontStyle: 'bold',
              fontSize: 9,
              cellPadding: { top: 4, bottom: 4, left: 4, right: 4 },
              lineColor: [220, 220, 220],
              lineWidth: 0.2,
              halign: 'right',
              valign: 'middle',
              overflow: 'linebreak',
              direction: 'rtl'
            },
            headStyles: {
            fillColor: PRIMARY_COLOR,
            textColor: [255, 255, 255],
              fontStyle: 'bold',
              fontSize: 10,
              halign: 'right',
              valign: 'middle',
              cellPadding: { top: 6, bottom: 6, left: 6, right: 6 },
              overflow: 'linebreak',
              minCellHeight: 10,
              direction: 'rtl'
            },
            bodyStyles: {
              fontStyle: 'bold',
              halign: 'right',
              valign: 'middle',
              cellPadding: 4,
              direction: 'rtl'
            },
            columnStyles: {
              0: { cellWidth: 'auto', halign: 'right' },
              1: { cellWidth: 'auto', halign: 'right' }
            },
            margin: { top: yPosition, left: PAGE_MARGIN, right: PAGE_MARGIN },
            tableWidth: 'auto',
            horizontalPageBreak: false,
            pageBreak: 'auto',
            showHead: 'everyPage',
            didDrawPage: (data) => {
              if (data.pageNumber > initialPage) {
                data.table.startY = 20;
                data.table.margin.top = 20;
              }
            },
            didDrawTable: createDidDrawTable(doc)
          });
          yPosition = doc.lastAutoTable.finalY + 12;
        }
        if (investor.transactions && Array.isArray(investor.transactions) && investor.transactions.length > 0) {
          doc.addPage();
          yPosition = 20;
          doc.setFontSize(12);
          doc.setFont('Amiri', 'bold');
          doc.setTextColor(0, 0, 0);
          doc.text('العمليات المالية', pageWidth / 2, yPosition, { align: 'center' });
          yPosition += 8;
          const transactionsData = investor.transactions.map(transaction => [
            transaction.reference || '-',
            getTransactionTypeText(transaction.type),
            transaction.amount ? transaction.amount.toLocaleString('en-US') : '0',
            dayjs(transaction.date).format('DD/MM/YYYY HH:mm')
          ]);
          const transactionsHeaders = [['المرجع', 'نوع العملية', 'المبلغ', 'التاريخ']];
          autoTable(doc, {
            startY: yPosition,
            head: transactionsHeaders,
            body: transactionsData,
            theme: 'striped',
            styles: {
              font: 'Amiri',
              fontStyle: 'bold',
              fontSize: 9,
              cellPadding: { top: 4, bottom: 4, left: 4, right: 4 },
              lineColor: [220, 220, 220],
              lineWidth: 0.2,
              halign: 'right',
              valign: 'middle',
              overflow: 'linebreak',
              direction: 'rtl'
            },
            headStyles: {
            fillColor: PRIMARY_COLOR,
            textColor: [255, 255, 255],
              fontStyle: 'bold',
              fontSize: 10,
              halign: 'right',
              valign: 'middle',
              cellPadding: { top: 6, bottom: 6, left: 6, right: 6 },
              overflow: 'linebreak',
              minCellHeight: 10,
              direction: 'rtl'
            },
            bodyStyles: {
              fontStyle: 'bold',
              halign: 'right',
              valign: 'middle',
              cellPadding: 4,
              direction: 'rtl'
            },
            columnStyles: {
              0: { cellWidth: 'auto', halign: 'right' },
              1: { cellWidth: 'auto', halign: 'right' },
              2: { cellWidth: 'auto', halign: 'right' },
              3: { cellWidth: 'auto', halign: 'right' }
            },
            margin: { top: yPosition, left: PAGE_MARGIN, right: PAGE_MARGIN },
            tableWidth: 'auto',
            horizontalPageBreak: false,
            pageBreak: 'auto',
            showHead: 'everyPage',
            didDrawTable: createDidDrawTable(doc)
          });
          yPosition = doc.lastAutoTable.finalY + 8;
        }
      });
      const pageCount = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        drawReportFooter(doc, i, pageCount);
      }
      const fileName = `تقرير_المستثمرين_${dayjs().format('YYYY-MM-DD')}.pdf`;
      doc.save(fileName);
      resolve();
    } catch (error) {
      console.error('PDF export error:', error.message);
      reject(error);
    }
  });
};
export const exportInvestorsToExcel = async (investorsData) => {
  try {
    if (!investorsData || !Array.isArray(investorsData) || investorsData.length === 0) {
      throw new Error('لا توجد بيانات للتصدير');
    }
    const XLSX = await import('xlsx');
    const workbook = XLSX.utils.book_new();
    investorsData.forEach((partnerData, index) => {
      const investor = normalizePartnerData(partnerData);
      const sheetName = `${investor.name.substring(0, 25)}` || `مستثمر ${index + 1}`;
      const personalData = [
        ['التفاصيل الشخصية'],
        [''],
        [investor.name || '-', 'الاسم الكامل'],
        [investor.nationalId || '-', 'رقم الهوية الوطنية'],
        [investor.phone || '-', 'رقم الجوال'],
        [investor.email || 'لا يوجد', 'البريد الإلكتروني'],
        [investor.address || '-', 'العنوان'],
        [investor.city || '-', 'المدينة'],
        [investor.createdAt ? dayjs(investor.createdAt).format('DD/MM/YYYY') : '-', 'تاريخ الانضمام الميلادي'],
        [investor.isActive ? 'نشط' : 'غير نشط', 'الحالة'],
        [''],
        ['المعلومات المالية'],
        [''],
        [investor.capitalAmount || 0, 'رأس المال الأصلي'],
        [investor.newCapitalAmount || 0, 'رأس المال الجديد'],
        [investor.total || 0, 'إجمالي مبلغ الاستثمار'],
        [investor.newCapitalPercent || 0, 'نسبة رأس المال الجديد'],
        [investor.upcomingProfit || 0, 'الأرباح القادمة'],
        [investor.totalProfit || 0, 'إجمالي الأرباح الفعلي'],
        [investor.totalSaving || 0, 'إجمالي الادخار'],
        [investor.partnerProfitPercent || 0, 'نسبة أرباح المستثمر بالنسبة لباقي المستثمرين'],
        [investor.orgProfitPercent || 0, 'نسبة أرباح المنشأة'],
      ];
      if (investor.summary || investor.loans) {
        const totalLoans = investor.loans ? investor.loans.length : 0;
        const activeLoans = investor.loans ? investor.loans.filter(loan => loan.status === 'ACTIVE').length : 0;
        const completedLoans = investor.loans ? investor.loans.filter(loan => loan.status === 'COMPLETED').length : 0;
        const totalLoanAmount = investor.loans ? investor.loans.reduce((sum, loan) => sum + (loan.amount || 0), 0) : 0;
        personalData.push(['']);
        personalData.push(['ملخص الأرباح']);
        personalData.push(['']);
        personalData.push([investor.totalAmount || 0, 'إجمالي الأرباح']);
        personalData.push([investor.summary?.profits?.totalCompanyCut || ((investor.totalAmount || 0) - (investor.totalProfit || 0)), 'حصة المنشأة من الأرباح']);
        personalData.push([investor.totalProfit || 0, 'حصة المستثمر من الأرباح']);
        personalData.push([investor.summary?.profits?.distributedProfit || 0, 'الأرباح المحصلة']);
        personalData.push([investor.summary?.profits?.undistributedProfit || investor.totalProfit || 0, 'الأرباح المتبقية']);
        personalData.push(['']);
        personalData.push(['ملخص السلف']);
        personalData.push(['']);
        personalData.push([totalLoans, 'إجمالي السلف']);
        personalData.push([activeLoans, 'السلف النشطة']);
        personalData.push([completedLoans, 'السلف المكتملة']);
        personalData.push([totalLoanAmount, 'إجمالي مبلغ السلف']);
        personalData.push(['']);
        personalData.push(['ملخص المعاملات']);
        personalData.push(['']);
        personalData.push([investor.summary?.transactions?.totalDeposits || 0, 'إجمالي الإيداعات']);
        personalData.push([investor.summary?.transactions?.totalWithdrawals || 0, 'إجمالي السحوبات']);
        personalData.push(['']);
        personalData.push(['تفاصيل المدخرات']);
        personalData.push(['']);
        personalData.push([investor.totalAvilableSaving || 0, 'الرصيد المتاح للسحب']);
        personalData.push([investor.totalWithdrawal || 0, 'المبلغ المسحوب']);
        personalData.push(['']);
        personalData.push(['الزكاة السنوية']);
        personalData.push(['']);
        personalData.push([investor.yearlyZakatRequired || investor.summary?.zakat?.totalZakatAccrued || 0, 'المستحقة']);
        personalData.push([investor.yearlyZakatPaid || investor.summary?.zakat?.totalZakatPaid || 0, 'المدفوعة']);
        personalData.push([investor.yearlyZakatBalance || investor.summary?.zakat?.zakatBalance || 0, 'الرصيد']);
      } else {
        personalData.push(['']);
        personalData.push([investor.totalDeposits || 0, 'إجمالي الإيداعات']);
        personalData.push([investor.totalWithdrawals || 0, 'إجمالي السحوبات']);
        personalData.push([investor.totalAccruedProfit || 0, 'إجمالي الأرباح المستحقة']);
        personalData.push([investor.accountBalance || 0, 'رصيد الحساب']);
        if (investor.zakat) {
          personalData.push(['']);
          personalData.push([investor.zakat.required || 0, 'الزكاة المستحقة']);
          personalData.push([investor.zakat.paid || 0, 'الزكاة المدفوعة']);
          personalData.push([investor.zakat.balance || 0, 'رصيد الزكاة']);
        }
      }
      personalData.push(['']);
      if (investor.transactions && Array.isArray(investor.transactions) && investor.transactions.length > 0) {
        personalData.push(['العمليات المالية']);
        personalData.push(['']);
        personalData.push(['المرجع', 'نوع العملية', 'المبلغ', 'التاريخ']);
        investor.transactions.forEach(transaction => {
          personalData.push([
            transaction.reference || '-',
            getTransactionTypeText(transaction.type),
            transaction.amount || 0,
            dayjs(transaction.date).format('DD/MM/YYYY HH:mm')
          ]);
        });
        personalData.push(['']);
      }
      const sheet = XLSX.utils.aoa_to_sheet(personalData);
      sheet['!cols'] = [
        { wch: 30 },
        { wch: 25 }
      ];
      XLSX.utils.book_append_sheet(workbook, sheet, sheetName);
    });
    const excelBuffer = XLSX.write(workbook, { 
      bookType: 'xlsx', 
      type: 'array',
      bookSST: false 
    });
    const blob = new Blob([excelBuffer], { 
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
    });
    const fileName = `تقرير_المستثمرين_${dayjs().format('YYYY-MM-DD')}.xlsx`;
    saveAs(blob, fileName);
  } catch (error) {
    console.error('Excel export error:', error.message);
    throw error;
  }
};
const getTransactionTypeText = (type) => {
  switch (type) {
    case "DEPOSIT":
      return "إيداع";
    case "WITHDRAWAL":
      return "سحب من رأس المال";
    case "PROFIT_WITHDRAWAL":
      return "سحب أرباح";
    case "SAVING_WITHDRAWAL":
      return "سحب ادخار";
    default:
      return type;
  }
};