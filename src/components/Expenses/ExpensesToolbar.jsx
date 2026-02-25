import React from 'react';
import { Menu, MenuItem } from '@mui/material';
import { Add, PictureAsPdf, FileDownload } from '@mui/icons-material';

const ExpensesToolbar = ({
  isMobile,
  hasAddPermission,
  hasExportPermission,
  hasExpenses,
  onAddClick,
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
}) => (
  <div className="flex items-center gap-3 flex-wrap">
    {hasExportPermission && (
      <>
        <button
          type="button"
          onClick={onExcelMenuOpen}
          disabled={!hasExpenses}
          className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 hover:border-emerald-500/50 rounded-lg text-sm font-bold transition-all"
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
          onClick={onPdfMenuOpen}
          disabled={!hasExpenses}
          className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed text-red-600 dark:text-red-400 border border-red-500/30 hover:border-red-500/50 rounded-lg text-sm font-bold transition-all"
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
        className="flex items-center gap-2 px-6 py-2.5 bg-primary hover:bg-primary/90 text-white rounded-lg text-sm font-bold shadow-lg shadow-primary/20 transition-all"
      >
        <Add className="text-xl" />
        إضافة مصروف
      </button>
    )}
  </div>
);

export default React.memo(ExpensesToolbar);
