import React from 'react';
export const DASHBOARD_MODULES = [
  'client-stats',
  'partner-stats',
  'loan-stats',
  'monthly-collection',
  'expense-stats',
  'Upcoming-Repayments',
  'Last-Actions',
];
export const DASHBOARD_TABS = [
  { label: 'إحصائيات العملاء', permission: 'client-stats', index: 0, Component: React.lazy(() => import('../../components/dashboardSections/ClientStats')) },
  { label: 'إحصائيات الشركاء', permission: 'partner-stats', index: 1, Component: React.lazy(() => import('../../components/dashboardSections/PartnerStats')) },
  { label: 'إحصائيات السلف', permission: 'loan-stats', index: 2, Component: React.lazy(() => import('../../components/dashboardSections/LoanStats')) },
  { label: 'التحصيل الشهري', permission: 'monthly-collection', index: 3, Component: React.lazy(() => import('../../components/dashboardSections/CollectionStats')) },
  { label: 'احصائيات المصاريف', permission: 'expense-stats', index: 4, Component: React.lazy(() => import('../../components/dashboardSections/ExpenseStats')) },
  { label: 'الدفعات القادمة', permission: 'Upcoming-Repayments', index: 5, Component: React.lazy(() => import('../../components/dashboardSections/UpcomingRepayments')) },
  { label: 'آخر الأنشطة', permission: 'Last-Actions', index: 6, Component: React.lazy(() => import('../../components/dashboardSections/LastActions')) },
];
export const DASHBOARD_CONTENT_MAX_WIDTH = 1200;