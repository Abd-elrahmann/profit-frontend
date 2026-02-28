import React from 'react';
import { DASHBOARD_CONTENT_MAX_WIDTH } from '../constants';
const DashboardContent = React.memo(({ children }) => (
  <div
    className="w-full max-w-full mx-auto px-2 sm:px-4 md:px-6 lg:px-8 flex flex-col items-stretch"
    style={{ maxWidth: DASHBOARD_CONTENT_MAX_WIDTH }}
  >
    {children}
  </div>
));
DashboardContent.displayName = 'DashboardContent';
export default DashboardContent;