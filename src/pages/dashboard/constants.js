export const DASHBOARD_MODULES = [
  'client-stats',
  'partner-stats',
  'loan-stats',
  'monthly-collection',
  'Upcoming-Repayments',
  'Last-Actions',
];

export const DASHBOARD_TABS = [
  { label: 'إحصائيات العملاء', permission: 'client-stats', index: 0 },
  { label: 'إحصائيات الشركاء', permission: 'partner-stats', index: 1 },
  { label: 'إحصائيات السلف', permission: 'loan-stats', index: 2 },
  { label: 'التحصيل الشهري', permission: 'monthly-collection', index: 3 },
  { label: 'الدفعات القادمة', permission: 'Upcoming-Repayments', index: 4 },
  { label: 'آخر الأنشطة', permission: 'Last-Actions', index: 5 },
];
