import React from 'react';
const DashboardEmptyState = React.memo(() => (
  <div className="min-h-screen flex justify-center items-center bg-[#f6f8f6] dark:bg-[#141e16] py-4">
    <div className="text-center">
      <p className="text-lg font-semibold text-slate-600 dark:text-slate-400 mb-2">
        لا توجد صلاحيات لعرض الداشبورد
      </p>
      <p className="text-sm text-slate-500 dark:text-slate-500">
        يرجى التواصل مع مدير النظام لمنحك الصلاحيات المطلوبة
      </p>
    </div>
  </div>
));
DashboardEmptyState.displayName = 'DashboardEmptyState';
export default DashboardEmptyState;