import React from 'react';
import { Menu, MenuItem } from '@mui/material';
import { Add, PictureAsPdf, FileDownload, Search, FilterListOff } from '@mui/icons-material';
const ExpensesToolbar = ({
  isSmallScreen,
  hasAddPermission,
  hasExportPermission,
  hasExpenses,
  hasActiveSearch,
  onAddClick,
  onPdfClick,
  onExcelClick,
  onPdfMenuOpen,
  onExcelMenuOpen,
  pdfAnchorEl,
  excelAnchorEl,
  onPdfMenuClose,
  onExcelMenuClose,
  onExportAllPdf,
  onExportAllExcel,
  onExportFilterPdf,
  onExportFilterExcel,
  onAdvancedSearchClick,
  onResetFilters,
}) => (
  <div className={`flex items-center gap-2 flex-wrap ${isSmallScreen ? 'w-full' : ''}`}>
    {onAdvancedSearchClick && (
      <button
        type="button"
        onClick={onAdvancedSearchClick}
        className={`flex items-center gap-2.5 rounded-lg text-sm font-bold transition-all bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-600 dark:hover:border-slate-500 ${isSmallScreen ? 'px-3 py-2 flex-1 min-w-0' : 'px-4 py-2.5'}`}
      >
        <Search className="text-xl shrink-0" />
        <span>بحث متقدم</span>
      </button>
    )}
    {hasActiveSearch && onResetFilters && (
      <button
        type="button"
        onClick={onResetFilters}
        className={`flex items-center gap-2 rounded-lg text-sm font-bold transition-all bg-amber-100 dark:bg-amber-900/30 hover:bg-amber-200 dark:hover:bg-amber-900/50 text-amber-700 dark:text-amber-400 border border-amber-400/50 ${isSmallScreen ? 'px-3 py-2' : 'px-4 py-2.5'}`}
      >
        <FilterListOff className="text-xl" />
        <span>إلغاء الفلاتر</span>
      </button>
    )}
    {hasExportPermission && (
      <>
        <button
          type="button"
          onClick={onExcelClick || onExcelMenuOpen}
          disabled={!hasExpenses}
          className={`flex items-center gap-2 rounded-lg text-sm font-bold transition-all bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 hover:border-emerald-500/50 ${isSmallScreen ? 'px-3 py-2 flex-1 min-w-0' : 'px-4 py-2.5'}`}
        >
          <FileDownload className="text-xl" />
          تصدير Excel
        </button>
        <Menu anchorEl={excelAnchorEl} open={Boolean(excelAnchorEl)} onClose={onExcelMenuClose}>
          <MenuItem onClick={onExportAllExcel}>تصدير الكل</MenuItem>
          <MenuItem onClick={onExportFilterExcel}>اختيار مصروف محدد</MenuItem>
        </Menu>
        <button
          type="button"
          onClick={onPdfClick || onPdfMenuOpen}
          disabled={!hasExpenses}
          className={`flex items-center gap-2 rounded-lg text-sm font-bold transition-all bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed text-red-600 dark:text-red-400 border border-red-500/30 hover:border-red-500/50 ${isSmallScreen ? 'px-3 py-2 flex-1 min-w-0' : 'px-4 py-2.5'}`}
        >
          <PictureAsPdf className="text-xl" />
          تصدير PDF
        </button>
        <Menu anchorEl={pdfAnchorEl} open={Boolean(pdfAnchorEl)} onClose={onPdfMenuClose}>
          <MenuItem onClick={onExportAllPdf}>تصدير الكل</MenuItem>
          <MenuItem onClick={onExportFilterPdf}>اختيار مصروف محدد</MenuItem>
        </Menu>
      </>
    )}
    {hasAddPermission && (
      <button
        type="button"
        onClick={onAddClick}
        className={`flex items-center gap-2 bg-primary hover:bg-primary/90 text-white rounded-lg text-sm font-bold shadow-lg shadow-primary/20 transition-all ${isSmallScreen ? 'px-4 py-2 w-full' : 'px-6 py-2.5'}`}
      >
        <Add className="text-xl" />
        إضافة مصروف
      </button>
    )}
  </div>
);
export default React.memo(ExpensesToolbar);