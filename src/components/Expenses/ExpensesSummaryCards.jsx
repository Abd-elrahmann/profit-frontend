import React from 'react';
import { TrendingUp, ListAlt, CalendarToday, AccountBalanceWallet } from '@mui/icons-material';

const ExpensesSummaryCards = ({ totalAmount, totalCount }) => {
  if (!totalAmount && !totalCount) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full md:w-auto md:min-w-[400px]">
      <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-primary/10 shadow-sm flex items-center justify-between overflow-hidden relative group">
        <div className="relative z-10">
          <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">عدد المصروفات المسجلة</p>
          <h3 className="text-4xl font-black text-primary mt-2">{totalCount.toLocaleString('en-US')}</h3>
          <p className="text-xs text-primary/60 mt-2 flex items-center gap-1">
            <TrendingUp sx={{ fontSize: 14 }} />
            إجمالي عدد البنود المسجلة
          </p>
        </div>
        <div className="size-16 rounded-full bg-primary/10 flex items-center justify-center text-primary relative z-10 transition-transform group-hover:scale-110">
          <ListAlt sx={{ fontSize: 30 }} color="primary" />
        </div>
        <div className="absolute -right-4 -bottom-4 size-32 bg-primary/5 rounded-full" />
      </div>

      <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-primary/10 shadow-sm flex items-center justify-between overflow-hidden relative group">
        <div className="relative z-10">
          <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">إجمالي مبالغ المصروفات</p>
          <h3 className="text-4xl font-black text-slate-900 dark:text-slate-100 mt-2">
            {totalAmount.toLocaleString('en-US')}{' '}
          </h3>
          <p className="text-xs text-slate-400 mt-2 flex items-center gap-1">
            <CalendarToday sx={{ fontSize: 14 }} />
            محدث حتى تاريخ اليوم
          </p>
        </div>
        <div className="size-16 rounded-full bg-primary/10 flex items-center justify-center text-primary relative z-10 transition-transform group-hover:scale-110">
          <AccountBalanceWallet sx={{ fontSize: 30 }} color="primary" />
        </div>
        <div className="absolute -right-4 -bottom-4 size-32 bg-primary/5 rounded-full" />
      </div>
    </div>
  );
};

export default React.memo(ExpensesSummaryCards);
