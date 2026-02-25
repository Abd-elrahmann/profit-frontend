export const AVAILABLE_COLUMNS = [
  { id: 'id', label: 'م', show: true, required: true },
  { id: 'client', label: 'العميل', show: true },
  { id: 'address', label: 'العنوان', show: true },
  { id: 'loansCount', label: 'عدد السلف', show: true },
  { id: 'paidRepayments', label: 'الدفعات المدفوعة', show: true },
  { id: 'remainingRepayments', label: 'الدفعات المتبقية', show: true },
  { id: 'monthlyInstallment', label: 'الدفعة الشهرية', show: true },
  { id: 'totalDebit', label: 'إجمالي المديونية', show: true },
  { id: 'totalPaid', label: 'إجمالي المدفوع', show: true },
  { id: 'totalInterest', label: 'إجمالي الفوائد', show: true },
  { id: 'totalDiscounts', label: 'الخصومات', show: true },
  { id: 'remaining', label: 'المتبقي', show: true },
  { id: 'note', label: 'ملاحظات', show: true },
];

export const TAB_CONFIG = {
  ACTIVE: { label: 'العملاء المديونين', color: '#d32f2f' },
  COMPLETE: { label: 'العملاء المسددين', color: '#2e7d32' },
};
