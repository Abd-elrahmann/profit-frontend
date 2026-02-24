import React, { useEffect } from 'react';
import PageSkeleton from '../../../components/PageSkeleton';
import { useDashboardFilter } from '../DashboardFilterContext';

const TabPanel = React.memo(({ children, value, index, tabTitle }) => {
  const { setTabTitle } = useDashboardFilter();

  useEffect(() => {
    if (value === index && tabTitle) {
      setTabTitle(tabTitle);
    }
  }, [value, index, tabTitle, setTabTitle]);

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`dashboard-tabpanel-${index}`}
      aria-labelledby={`dashboard-tab-${index}`}
      className="w-full"
    >
      {value === index && (
        <div className="w-full">
          <React.Suspense fallback={<PageSkeleton type="dashboard" />}>
            {children}
          </React.Suspense>
        </div>
      )}
    </div>
  );
});

TabPanel.displayName = 'TabPanel';

export default TabPanel;
