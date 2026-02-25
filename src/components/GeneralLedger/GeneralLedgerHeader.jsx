import React from 'react';
import { Search, Notifications, Help } from '@mui/icons-material';

const GeneralLedgerHeader = () => (
  <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 px-6 md:px-8 py-4 flex items-center justify-between sticky top-0 z-10">
    <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">دفتر الأستاذ العام</h2>
    <div className="flex items-center gap-3">
      <div className="relative">
        <span className="absolute right-3 top-1/2 -translate-y-1/2">
        <Search sx={{ fontSize: 20, color: '#94a3b8' }} />
      </span>
        <input
          type="text"
          placeholder="بحث سريع..."
          className="pr-10 pl-4 py-2 bg-slate-100 dark:bg-slate-800 border-none rounded-lg text-sm focus:ring-2 focus:ring-primary/20 w-48 md:w-64 outline-none"
          readOnly
          tabIndex={-1}
        />
      </div>
      <button
        type="button"
        className="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full relative transition-colors"
        aria-label="الإشعارات"
      >
        <Notifications sx={{ fontSize: 24 }} />
        <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-slate-900" />
      </button>
      <button
        type="button"
        className="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
        aria-label="المساعدة"
      >
        <Help sx={{ fontSize: 24 }} />
      </button>
    </div>
  </header>
);

export default React.memo(GeneralLedgerHeader);
