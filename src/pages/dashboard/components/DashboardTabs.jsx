import React from 'react';
import { Select, MenuItem, FormControl, useMediaQuery } from '@mui/material';
const DashboardTabs = React.memo(({ value, onChange, tabs, variant = 'standalone' }) => {
  const isMobile = useMediaQuery('(max-width: 640px)');
  const isTablet = useMediaQuery('(min-width: 641px) and (max-width: 1024px)');
  if (isMobile) {
    return (
      <FormControl size="small" sx={{ minWidth: 180, width: '100%' }}>
        <Select
          value={value}
          onChange={(e) => onChange(e, e.target.value)}
          displayEmpty
          sx={{
            borderRadius: 2,
            fontWeight: 'bold',
            '& .MuiSelect-select': { py: 1.5 },
          }}
        >
          {tabs.map((tab, index) => (
            <MenuItem key={tab.permission} value={index}>
              {tab.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    );
  }
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
            flex flex-col items-center justify-center pb-3 pt-4 px-2 sm:px-3 font-bold text-xs sm:text-sm tracking-wide whitespace-nowrap shrink-0
            border-b-[3px] transition-colors
            ${isTablet ? 'min-w-[80px]' : ''}
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