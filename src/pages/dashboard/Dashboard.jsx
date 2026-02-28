import React, { useState, useEffect, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import PageSkeleton from '../../components/ui/PageSkeleton';
import { useDashboardPermissions } from './useDashboardPermissions';
import { TabPanel, DashboardTabs, DashboardEmptyState, DashboardHeader } from './components';
import { DashboardFilterProvider } from './DashboardFilterContext';
const Dashboard = React.memo(() => {
  const [value, setValue] = useState(0);
  const { permissionsLoading, availableTabs } = useDashboardPermissions();
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
      <div className="relative flex h-auto min-h-screen w-full max-w-full flex-col overflow-x-hidden dark:bg-[#141e16]">
        <Helmet>
          <title>نظام التمويل الذكي - لوحة التحكم</title>
          <meta name="description" content="لوحة التحكم الرئيسية للنظام المالي" />
        </Helmet>
        {}
        <div className="sticky top-0 z-50 w-full max-w-full bg-transparent border-b border-primary/10 shadow-sm">
          <div className="w-full max-w-full px-3 sm:px-4 md:px-6">
            <DashboardHeader />
          </div>
        </div>
        {}
        <div className="w-full max-w-full bg-transparent border-b border-primary/10">
          <div className="w-full max-w-full flex gap-3 sm:gap-4 md:gap-8 overflow-x-auto scrollbar-thin px-3 sm:px-4 md:px-6 py-2 sm:py-0">
            <DashboardTabs
              value={value}
              onChange={handleTabChange}
              tabs={availableTabs}
              variant="topNav"
            />
          </div>
        </div>
        {}
        <main className="w-full max-w-full flex-1 py-3 sm:py-4 md:py-6 px-3 sm:px-4 md:px-6 bg-[#f6f8f6] dark:bg-[#141e16] overflow-x-hidden">
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