import React from 'react';

const DashboardTabs = React.memo(({ value, onChange, tabs, variant = 'standalone' }) => {
  const isTopNav = variant === 'topNav';

  return (
    <>
      {tabs.map((tab, index) => (
        <button
          key={tab.permission}
          type="button"
          role="tab"
          aria-selected={value === index}
          aria-controls={`dashboard-tabpanel-${index}`}
          id={`dashboard-tab-${index}`}
          onClick={(e) => onChange(e, index)}
          className={`
            flex flex-col items-center justify-center pb-3 pt-4 font-bold text-sm tracking-wide whitespace-nowrap
            border-b-[3px] transition-colors
            ${
              value === index
                ? 'border-primary text-primary'
                : 'border-transparent text-slate-500 hover:text-primary transition-colors font-medium'
            }
          `}
        >
          {tab.label}
        </button>
      ))}
    </>
  );
});

DashboardTabs.displayName = 'DashboardTabs';

export default DashboardTabs;
