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
    FILTER_OPTIONS,
    isCustom,
  } = useDashboardFilter();

  return (
    <header className="bg-white dark:bg-[#141e16] py-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white">
          {tabTitle}
        </h2>
        <div className="flex flex-wrap items-center gap-3">
          {/* Filters - Dropdown */}
          <FormControl size="small" sx={{ minWidth: 140 }}>
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
            <div className="flex items-center gap-2 flex-wrap">
              <div className="flex items-center gap-1">
                <span className="text-xs text-slate-500">من</span>
                <input
                  type="date"
                  value={customFrom}
                  onChange={(e) => setCustomFrom(e.target.value)}
                  className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-2 py-1.5 text-sm"
                />
              </div>
              <div className="flex items-center gap-1">
                <span className="text-xs text-slate-500">إلى</span>
                <input
                  type="date"
                  value={customTo}
                  onChange={(e) => setCustomTo(e.target.value)}
                  className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-2 py-1.5 text-sm"
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
