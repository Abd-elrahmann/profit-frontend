import React from 'react';
import { Search } from '@mui/icons-material';

const ChartOfAccountsSearch = ({ value, onChange, placeholder = 'بحث بكود أو اسم الحساب...', isSmallScreen }) => (
  <div className={`relative ${isSmallScreen ? 'w-full' : 'w-full md:w-96'}`}>
    <span className="absolute right-3 top-1/2 -translate-y-1/2">
      <Search sx={{ fontSize: 20, color: '#94a3b8' }} />
    </span>
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={`w-full pr-10 pl-4 bg-transparent border border-slate-200 dark:border-slate-600 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all ${isSmallScreen ? 'py-2' : 'py-2.5'}`}
    />
  </div>
);

export default React.memo(ChartOfAccountsSearch);
