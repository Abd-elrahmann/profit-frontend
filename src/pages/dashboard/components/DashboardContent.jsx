import React from 'react';
import { DASHBOARD_CONTENT_MAX_WIDTH } from '../constants';

/**
 * غلاف موحد لمحتوى الداشبورد - يضمن نفس العرض والمحاذاة الرأسية لجميع الأقسام
 */
const DashboardContent = React.memo(({ children }) => (
  <div
    className="w-full mx-auto px-4 sm:px-6 md:px-8 flex flex-col items-stretch"
    style={{ maxWidth: DASHBOARD_CONTENT_MAX_WIDTH }}
  >
    {children}
  </div>
));

DashboardContent.displayName = 'DashboardContent';

export default DashboardContent;
