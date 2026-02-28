import React from 'react';
import { TrendingUp, Analytics, PieChart, AccountBalanceWallet } from '@mui/icons-material';
import { formatNum } from './companyProfitUtils';
const CompanyProfitKPICards = ({ profitData }) => {
  if (!profitData) return null;
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-primary/5 shadow-sm">
        <div className="flex justify-between items-start mb-4">
          <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-bold">أرباح قادمة</span>
          <TrendingUp className="text-primary" sx={{ fontSize: 24 }} />
        </div>
        <p className="text-slate-500 text-sm font-medium">صافي الأرباح القادمة</p>
        <div className="flex items-baseline gap-1 mt-1">
          <h3 className="text-3xl font-black text-slate-900 dark:text-white">{formatNum(profitData.upcomingProfit)}</h3>
        </div>
      </div>
      <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-primary/5 shadow-sm">
        <div className="flex justify-between items-start mb-4">
          <span className="bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 px-3 py-1 rounded-full text-xs font-bold">باقي الأرباح</span>
          <Analytics className="text-slate-400" sx={{ fontSize: 24 }} />
        </div>
        <p className="text-slate-500 text-sm font-medium">باقي أرباح الشركاء</p>
        <div className="flex items-baseline gap-1 mt-1">
          <h3 className="text-3xl font-black text-slate-900 dark:text-white">{formatNum(profitData.cents)}</h3>
        </div>
      </div>
      <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-primary/5 shadow-sm">
        <div className="flex justify-between items-start mb-4">
          <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-bold">إجمالي</span>
          <PieChart className="text-primary/60" sx={{ fontSize: 24 }} />
        </div>
        <p className="text-slate-500 text-sm font-medium">إجمالي الأرباح</p>
        <div className="flex items-baseline gap-1 mt-1">
          <h3 className="text-3xl font-black text-slate-900 dark:text-white">
            {formatNum(profitData.periodsProfit?.totalCompanyProfit)}
          </h3>
        </div>
      </div>
      <div className="bg-primary p-6 rounded-2xl border border-primary shadow-xl shadow-primary/20">
        <div className="flex justify-between items-start mb-4">
          <span className="bg-white/20 text-white px-3 py-1 rounded-full text-xs font-bold">متاح للسحب</span>
          <AccountBalanceWallet className="text-white/60" sx={{ fontSize: 24 }} />
        </div>
        <p className="text-white/80 text-sm font-medium">الرصيد المتاح للسحب</p>
        <div className="flex items-baseline gap-1 mt-1">
          <h3 className="text-3xl font-black text-white">{formatNum(profitData.availableAmount)}</h3>
        </div>
      </div>
    </div>
  );
};
export default CompanyProfitKPICards;