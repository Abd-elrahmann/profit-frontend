import React from 'react';
import { AccountTree, List } from '@mui/icons-material';

const ChartOfAccountsViewToggle = ({ view, onChange, isSmallScreen }) => (
  <div className="dark:bg-slate-800 dark:border-slate-600 p-1 rounded-lg flex gap-1">
    <button
      type="button"
      onClick={() => onChange('tree')}
      className={`flex items-center gap-2 rounded-md font-medium transition-colors ${isSmallScreen ? 'px-3 py-1 text-xs' : 'px-4 py-1.5 text-sm'} ${
        view === 'tree'
          ? 'bg-primary text-white font-bold'
          : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'
      }`}
    >
      <AccountTree sx={{ fontSize: 20 }} />
      عرض شجري
    </button>
    <button
      type="button"
      onClick={() => onChange('list')}
      className={`flex items-center gap-2 rounded-md font-medium transition-colors ${isSmallScreen ? 'px-3 py-1 text-xs' : 'px-4 py-1.5 text-sm'} ${
        view === 'list'
          ? 'bg-primary text-white font-bold'
          : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'
      }`}
    >
      <List sx={{ fontSize: 20 }} />
      عرض قائمة
    </button>
  </div>
);

export default React.memo(ChartOfAccountsViewToggle);
