import React from 'react';
import { Add, Download, ExpandMore, PictureAsPdf, TableChart } from '@mui/icons-material';
const ChartOfAccountsHeader = ({ onAddClick, onExportPDF, onExportExcel, canAdd, isSmallScreen }) => (
  <header className={`bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 sticky top-0 z-10 ${isSmallScreen ? 'px-4 py-3 flex flex-col gap-3' : 'px-6 md:px-8 py-4 flex items-center justify-between'}`}>
    <h2 className={`font-bold text-slate-900 dark:text-slate-100 ${isSmallScreen ? 'text-lg' : 'text-xl'}`}>دليل الحسابات</h2>
    <div className={`flex items-center ${isSmallScreen ? 'gap-2 flex-wrap' : 'gap-4'}`}>
      <div className={`flex ${isSmallScreen ? 'gap-1.5 flex-1 min-w-0' : 'gap-2'}`}>
        {canAdd && (
          <button
            type="button"
            onClick={onAddClick}
            className={`bg-primary text-white font-bold rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2 ${isSmallScreen ? 'py-1.5 px-3 text-xs' : 'py-2 px-4 text-sm'}`}
          >
            <Add sx={{ fontSize: isSmallScreen ? 18 : 20 }} />
            {isSmallScreen ? 'إضافة' : 'إضافة حساب جديد'}
          </button>
        )}
        <div className="relative group">
          <button
            type="button"
            className={`bg-white dark:bg-slate-800 dark:border-slate-600 text-slate-700 dark:text-slate-300 font-bold rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors flex items-center gap-2 ${isSmallScreen ? 'py-1.5 px-3 text-xs' : 'py-2 px-4 text-sm'}`}
          >
            <Download sx={{ fontSize: isSmallScreen ? 18 : 20 }} />
            تصدير
            <ExpandMore sx={{ fontSize: isSmallScreen ? 16 : 18 }} />
          </button>
          <div className="hidden group-hover:block group-focus-within:block absolute left-0 top-full mt-0 w-32 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg shadow-xl z-20">
            <button
              type="button"
              onClick={onExportPDF}
              className="w-full text-right px-4 py-2 text-sm hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-2"
            >
              <PictureAsPdf sx={{ fontSize: 20, color: '#dc2626' }} />
              PDF
            </button>
            <button
              type="button"
              onClick={onExportExcel}
              className="w-full text-right px-4 py-2 text-sm hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-2 border-t border-slate-100 dark:border-slate-600"
            >
              <TableChart sx={{ fontSize: 20, color: '#16a34a' }} />
              Excel
            </button>
          </div>
        </div>
      </div>
    </div>
  </header>
);
export default React.memo(ChartOfAccountsHeader);