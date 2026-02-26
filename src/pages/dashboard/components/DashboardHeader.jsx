import React from 'react';
import { Download } from 'lucide-react';
import { FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import { useDashboardFilter } from '../DashboardFilterContext';

const DashboardHeader = ({ onExport, showExport = true }) => {
  const {
    filter,
    setFilter,
    customFrom,
    setCustomFrom,
    customTo,
    setCustomTo,
    tabTitle,
    tabSubtitle,
    FILTER_OPTIONS,
    isCustom,
  } = useDashboardFilter();

  return (
    <header className="bg-transparent py-3 sm:py-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <div className="min-w-0">
          <h2 className="text-lg sm:text-xl md:text-2xl font-black text-slate-900 dark:text-white truncate">
            {tabTitle}
          </h2>
          {tabSubtitle && (
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
              {tabSubtitle}
            </p>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 min-w-0">
          {/* Filters - Dropdown */}
          <FormControl size="small" sx={{ minWidth: 120, flex: { xs: '1 1 100%', sm: '0 0 auto' } }}>
            <InputLabel>الفترة</InputLabel>
            <Select
              value={filter}
              label="الفترة"
              onChange={(e) => setFilter(e.target.value)}
              sx={{
                borderRadius: 2,
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'divider',
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'primary.main',
                },
              }}
            >
              {FILTER_OPTIONS.map((opt) => (
                <MenuItem key={opt.value} value={opt.value}>
                  {opt.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          {isCustom && (
            <div className="flex items-center gap-2 flex-wrap w-full sm:w-auto">
              <div className="flex items-center gap-1 min-w-0">
                <span className="text-xs text-slate-500 shrink-0">من</span>
                <input
                  type="date"
                  value={customFrom}
                  onChange={(e) => setCustomFrom(e.target.value)}
                  className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-2 py-1.5 text-sm min-w-0 max-w-[140px] sm:max-w-none"
                />
              </div>
              <div className="flex items-center gap-1 min-w-0">
                <span className="text-xs text-slate-500 shrink-0">إلى</span>
                <input
                  type="date"
                  value={customTo}
                  onChange={(e) => setCustomTo(e.target.value)}
                  className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-2 py-1.5 text-sm min-w-0 max-w-[140px] sm:max-w-none"
                />
              </div>
            </div>
          )}
          {showExport && (
            <button
              type="button"
              onClick={onExport}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-white text-sm font-bold hover:bg-primary/90 transition-colors"
            >
              <Download className="size-4" />
              تصدير
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;
