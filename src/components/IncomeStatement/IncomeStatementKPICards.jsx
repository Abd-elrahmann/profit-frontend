import React from 'react';
import { TrendingUp, Receipt, Wallet } from 'lucide-react';
import { formatNumber, formatSignedNumber } from './incomeStatementUtils';
const IncomeStatementKPICards = ({ incomeData }) => {
  if (!incomeData) return null;
  const totalRevenues = incomeData.revenues?.total || 0;
  const totalExpenses = incomeData.totalExpenses || 0;
  const netProfit = incomeData.netProfit || 0;
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm">
        <div className="flex justify-between items-start mb-4">
          <div className="p-2 bg-primary/10 rounded-lg">
            <TrendingUp className="size-5 text-primary" />
          </div>
        </div>
        <h3 className="text-slate-500 dark:text-slate-400 text-sm font-medium">إجمالي الإيرادات</h3>
        <p className="text-3xl font-extrabold text-slate-900 dark:text-slate-100 mt-2">
          {formatNumber(totalRevenues)} <span className="text-sm font-normal text-slate-400">ر.س</span>
        </p>
      </div>
      <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm">
        <div className="flex justify-between items-start mb-4">
          <div className="p-2 bg-orange-100 dark:bg-orange-900/20 rounded-lg">
            <Receipt className="size-5 text-orange-600" />
          </div>
        </div>
        <h3 className="text-slate-500 dark:text-slate-400 text-sm font-medium">إجمالي المصروفات</h3>
        <p className="text-3xl font-extrabold text-slate-900 dark:text-slate-100 mt-2">
          {formatNumber(totalExpenses)} <span className="text-sm font-normal text-slate-400">ر.س</span>
        </p>
      </div>
      <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm ring-2 ring-primary/20">
        <div className="flex justify-between items-start mb-4">
          <div className="p-2 bg-primary rounded-lg">
            <Wallet className="size-5 text-white" />
          </div>
        </div>
        <h3 className="text-slate-500 dark:text-slate-400 text-sm font-medium">
          {netProfit >= 0 ? 'صافي الربح' : 'صافي الخسارة'}
        </h3>
        <p className={`text-3xl font-extrabold mt-2 ${netProfit >= 0 ? 'text-primary' : 'text-red-600 dark:text-red-400'}`}>
          {formatSignedNumber(netProfit)} <span className="text-sm font-normal text-slate-400">ر.س</span>
        </p>
      </div>
    </div>
  );
};
export default IncomeStatementKPICards;
