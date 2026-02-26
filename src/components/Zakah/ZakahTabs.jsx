import React from 'react';
import { FormControl, Select, MenuItem } from '@mui/material';

const TAB_OPTIONS = [
  { value: 0, label: 'عرض جميع الزكاة' },
  { value: 1, label: 'زكاة محددة' },
  { value: 2, label: 'صندوق الزكاة' },
];

const ZakahTabs = ({ activeTab, onTabChange, selectedPartner, isCompact = false, isMobile = false }) => {
  const getTabLabel = (value) => {
    if (value === 1) return selectedPartner ? 'تفاصيل الزكاة' : 'زكاة محددة';
    return TAB_OPTIONS.find((t) => t.value === value)?.label || '';
  };

  if (isMobile) {
    return (
      <FormControl fullWidth sx={{ mb: 3 }}>
        <Select
          value={activeTab}
          onChange={(e) => onTabChange(Number(e.target.value))}
          displayEmpty
          sx={{
            fontWeight: 'bold',
            '& .MuiSelect-select': { textAlign: 'right', py: 1.5 },
          }}
        >
          <MenuItem value={0}>{TAB_OPTIONS[0].label}</MenuItem>
          <MenuItem value={1}>{getTabLabel(1)}</MenuItem>
          <MenuItem value={2}>{TAB_OPTIONS[2].label}</MenuItem>
        </Select>
      </FormControl>
    );
  }

  return (
    <div className={`border-b border-primary/10 mb-4 sm:mb-6 ${isCompact ? 'overflow-x-auto' : ''}`}>
      <nav className={`flex gap-1 ${isCompact ? 'min-w-max p-1' : ''}`} role="tablist">
        <button
          role="tab"
          aria-selected={activeTab === 0}
          onClick={() => onTabChange(0)}
          className={`px-3 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm font-bold transition-colors border-b-2 -mb-px whitespace-nowrap ${
            activeTab === 0
              ? 'text-primary border-primary'
              : 'text-slate-600 dark:text-slate-400 border-transparent hover:text-primary'
          }`}
        >
          عرض جميع الزكاة
        </button>
        <button
          role="tab"
          aria-selected={activeTab === 1}
          onClick={() => onTabChange(1)}
          className={`px-3 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm font-bold transition-colors border-b-2 -mb-px whitespace-nowrap ${
            activeTab === 1
              ? 'text-primary border-primary'
              : 'text-slate-600 dark:text-slate-400 border-transparent hover:text-primary'
          }`}
        >
          {selectedPartner ? 'تفاصيل الزكاة' : 'زكاة محددة'}
        </button>
        <button
          role="tab"
          aria-selected={activeTab === 2}
          onClick={() => onTabChange(2)}
          className={`px-3 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm font-bold transition-colors border-b-2 -mb-px whitespace-nowrap ${
            activeTab === 2
              ? 'text-primary border-primary'
              : 'text-slate-600 dark:text-slate-400 border-transparent hover:text-primary'
          }`}
        >
          صندوق الزكاة
        </button>
      </nav>
    </div>
  );
};

export default ZakahTabs;
