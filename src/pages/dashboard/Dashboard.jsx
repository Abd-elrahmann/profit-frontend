import React, { useState, useEffect, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import PageSkeleton from '../../components/PageSkeleton';
import { useDashboardPermissions } from './useDashboardPermissions';
import { TabPanel, DashboardTabs, DashboardEmptyState, DashboardHeader } from './components';
import { DashboardFilterProvider } from './DashboardFilterContext';
import { useExportDashboard } from './useExportDashboard';

const Dashboard = React.memo(() => {
  const [value, setValue] = useState(0);
  const { permissionsLoading, availableTabs } = useDashboardPermissions();
  const handleExport = useExportDashboard('dashboard-export-area');

  useEffect(() => {
    if (availableTabs.length > 0 && value >= availableTabs.length) {
      setValue(0);
    }
  }, [availableTabs.length, value]);

  const handleTabChange = useCallback((event, newValue) => {
    setValue(newValue);
  }, []);

  if (permissionsLoading) {
    return (
      <div className="min-h-screen bg-[#f6f8f6] dark:bg-[#141e16] py-1">
        <Helmet>
          <title>لوحة التحكم - النظام المالي</title>
        </Helmet>
        <PageSkeleton type="dashboard" />
      </div>
    );
  }

  if (availableTabs.length === 0) {
    return (
      <>
        <Helmet>
          <title>لوحة التحكم - النظام المالي</title>
        </Helmet>
        <DashboardEmptyState />
      </>
    );
  }

  return (
    <DashboardFilterProvider>
      <div className="relative flex h-auto min-h-screen w-full flex-col overflow-x-hidden dark:bg-[#141e16]">
        <Helmet>
          <title>نظام التمويل الذكي - لوحة التحكم</title>
          <meta name="description" content="لوحة التحكم الرئيسية للنظام المالي" />
        </Helmet>

        {/* Fixed Header: Title + Filters + Export */}
        <div className="sticky top-0 z-50 bg-white dark:bg-[#141e16] border-b border-primary/10 shadow-sm">
          <div className="max-w-[1200px] mx-auto px-4 sm:px-6 md:px-10">
            <DashboardHeader onExport={handleExport} showExport />
          </div>
        </div>

        {/* Sub-tabs Navigation */}
        <div className="bg-white dark:bg-[#141e16] border-b border-primary/10">
          <div className="max-w-[1200px] mx-auto flex px-4 sm:px-6 md:px-10 gap-4 md:gap-8 overflow-x-auto scrollbar-thin">
            <DashboardTabs
              value={value}
              onChange={handleTabChange}
              tabs={availableTabs}
              variant="topNav"
            />
          </div>
        </div>

        {/* Main Content Area - Export target (no sidebar/nav) */}
        <main id="dashboard-export-area" className="max-w-[1200px] mx-auto w-full p-4 sm:p-6 flex-1 bg-[#f6f8f6] dark:bg-[#141e16]">
          {availableTabs.map((tab, index) => (
            <TabPanel key={tab.permission} value={value} index={index} tabTitle={tab.label}>
              <tab.Component />
            </TabPanel>
          ))}
        </main>
      </div>
    </DashboardFilterProvider>
  );
});

Dashboard.displayName = 'Dashboard';

export default Dashboard;
