import { saveAs } from 'file-saver';
import dayjs from 'dayjs';
import { exportUnifiedReport } from './unifiedReportTemplate';
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
  if (!investorsData || !Array.isArray(investorsData) || investorsData.length === 0) {
    throw new Error('لا توجد بيانات للتصدير');
  }

  const normalized = investorsData.map((partnerData) => normalizePartnerData(partnerData));
  return exportUnifiedReport({
    reportTitle: 'تقرير المستثمرين',
    fileName: 'تقرير_المستثمرين',
    orientation: 'landscape',
    subtitle: `إجمالي المستثمرين: ${normalized.length}`,
    columns: [
      { header: 'الاسم', dataKey: 'name', width: 35, align: 'right' },
      { header: 'رقم الهوية', dataKey: 'nationalId', width: 26 },
      { header: 'الجوال', dataKey: 'phone', width: 20 },
      { header: 'رأس المال الأصلي', dataKey: 'capitalAmount', width: 24, format: 'number0' },
      { header: 'رأس المال الجديد', dataKey: 'newCapitalAmount', width: 24, format: 'number0' },
      { header: 'إجمالي الأرباح', dataKey: 'totalProfit', width: 22, format: 'number0' },
      { header: 'الحالة', dataKey: 'statusAr', width: 15 },
    ],
    rows: normalized.map((investor) => ({
      ...investor,
      statusAr: investor.isActive ? 'نشط' : 'غير نشط',
    })),
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