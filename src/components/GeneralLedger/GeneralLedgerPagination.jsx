import React from 'react';
import { ChevronRight, ChevronLeft } from '@mui/icons-material';
const GeneralLedgerPagination = ({ currentPage, totalPages, onPageChange }) => {
  if (!totalPages || totalPages <= 1) return null;
  const pages = [];
  let start = Math.max(1, currentPage - 2);
  let end = Math.min(totalPages, start + 4);
  if (end - start < 4) start = Math.max(1, end - 4);
  for (let p = start; p <= end; p++) pages.push(p);
  const showStart = start > 1;
  const showEnd = end < totalPages;
  const showEndDots = end < totalPages - 1;
  const isFirstPage = currentPage <= 1;
  const isLastPage = currentPage >= totalPages;
  return (
    <div className="px-6 py-4 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between">
      <button
        type="button"
        disabled={isFirstPage}
        onClick={() => onPageChange(null, currentPage - 1)}
        className="flex items-center gap-1 text-sm font-bold text-slate-400 hover:text-slate-600 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <ChevronRight sx={{ fontSize: 20 }} />
        السابق
      </button>
      <div className="flex items-center gap-2">
        {showStart && (
          <>
            <button
              type="button"
              onClick={() => onPageChange(null, 1)}
              className="size-8 rounded flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs font-bold"
            >
              1
            </button>
            {start > 2 ? <span className="text-slate-300">...</span> : null}
          </>
        )}
        {pages.map((page) => (
          <button
            key={page}
            type="button"
            onClick={() => onPageChange(null, page)}
            className={`size-8 rounded flex items-center justify-center text-xs font-bold transition-colors ${
              currentPage === page
                ? 'bg-primary text-white'
                : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'
            }`}
          >
            {page}
          </button>
        ))}
        {showEnd && (
          <>
            {showEndDots && <span className="text-slate-300">...</span>}
            <button
              type="button"
              onClick={() => onPageChange(null, totalPages)}
              className="size-8 rounded flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs font-bold"
            >
              {totalPages}
            </button>
          </>
        )}
      </div>
      <button
        type="button"
        disabled={isLastPage}
        onClick={() => onPageChange(null, currentPage + 1)}
        className="flex items-center gap-1 text-sm font-bold text-primary hover:text-primary/80 disabled:cursor-not-allowed disabled:opacity-50"
      >
        التالي
        <ChevronLeft sx={{ fontSize: 20 }} />
      </button>
    </div>
  );
};
export default React.memo(GeneralLedgerPagination);