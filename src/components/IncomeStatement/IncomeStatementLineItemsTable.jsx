import React from 'react';
import { List } from 'lucide-react';
import { formatNumber } from './incomeStatementUtils';
const IncomeStatementLineItemsTable = ({ incomeData }) => {
  if (!incomeData) return null;
  const revenueLineItems = incomeData.revenueLineItems?.length
    ? incomeData.revenueLineItems
    : incomeData.revenues?.total != null
      ? [{ label: 'فوائد السلف المحصلة', amount: incomeData.revenues.total }]
      : [];
  const expenseByType = incomeData.expenseByType || [];
  const detailedExpenses = incomeData.detailedExpenses || [];
  const totalRevenues = incomeData.revenues?.total || 0;
  const totalExpenses = incomeData.totalExpenses || 0;
  const netProfit = incomeData.netProfit || 0;
  const renderExpenseRows = () => {
    if (expenseByType.length > 0) {
      return expenseByType.map((item, idx) => (
        <tr
          key={idx}
          className="border-b border-slate-50 dark:border-slate-700 hover:bg-slate-50/50 dark:hover:bg-slate-700/30 transition-colors"
        >
          <td className="px-6 py-4 pr-10">{item.type}</td>
          <td className="px-6 py-4 text-left font-medium">{formatNumber(item.amount)}</td>
        </tr>
      ));
    }
    if (detailedExpenses.length > 0) {
      return detailedExpenses.map((exp, idx) => (
        <tr
          key={idx}
          className="border-b border-slate-50 dark:border-slate-700 hover:bg-slate-50/50 dark:hover:bg-slate-700/30 transition-colors"
        >
          <td className="px-6 py-4 pr-10">{exp.description || exp.type}</td>
          <td className="px-6 py-4 text-left font-medium">{formatNumber(exp.amount)}</td>
        </tr>
      ));
    }
    return (
      <tr className="border-b border-slate-50 dark:border-slate-700">
        <td className="px-6 py-4 pr-10 text-slate-400">لا توجد مصروفات</td>
        <td className="px-6 py-4 text-left font-medium">0</td>
      </tr>
    );
  };
  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden">
      <div className="p-6 border-b border-slate-50 dark:border-slate-700 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50">
        <h3 className="text-lg font-bold flex items-center gap-2">
          <List className="size-5 text-primary" />
          بنود قائمة الدخل
        </h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-right border-collapse">
          <thead>
            <tr className="text-slate-400 text-sm uppercase tracking-wider border-b border-slate-50 dark:border-slate-700">
              <th className="px-6 py-4 font-semibold">البند المحاسبي</th>
              <th className="px-6 py-4 font-semibold text-left">المبلغ (ر.س)</th>
            </tr>
          </thead>
          <tbody className="text-slate-700 dark:text-slate-300">
            {}
            <tr className="bg-primary/5">
              <td className="px-6 py-3 font-bold text-primary text-sm uppercase tracking-wide" colSpan={2}>
                قسم الإيرادات
              </td>
            </tr>
            {revenueLineItems.map((item, idx) => (
              <tr
                key={idx}
                className="border-b border-slate-50 dark:border-slate-700 hover:bg-slate-50/50 dark:hover:bg-slate-700/30 transition-colors"
              >
                <td className="px-6 py-4 pr-10">{item.label}</td>
                <td className="px-6 py-4 text-left font-medium">{formatNumber(item.amount)}</td>
              </tr>
            ))}
            <tr className="bg-slate-50/80 dark:bg-slate-700/50 font-extrabold text-slate-900 dark:text-white border-b-2 border-primary/20">
              <td className="px-6 py-5">إجمالي الإيرادات التشغيلية</td>
              <td className="px-6 py-5 text-left text-primary">{formatNumber(totalRevenues)}</td>
            </tr>
            {}
            <tr className="bg-orange-50/50 dark:bg-orange-900/10">
              <td className="px-6 py-3 font-bold text-orange-700 dark:text-orange-400 text-sm uppercase tracking-wide" colSpan={2}>
                قسم المصروفات
              </td>
            </tr>
            {renderExpenseRows()}
            <tr className="bg-slate-50/80 dark:bg-slate-700/50 font-extrabold text-slate-900 dark:text-white border-b-2 border-orange-200 dark:border-orange-800">
              <td className="px-6 py-5">إجمالي المصروفات التشغيلية</td>
              <td className="px-6 py-5 text-left text-orange-600">({formatNumber(totalExpenses)})</td>
            </tr>
            {}
            <tr className="bg-primary/5 font-bold">
              <td className="px-6 py-6 text-lg">صافي الربح</td>
              <td className="px-6 py-6 text-left text-xl text-primary font-black">
                {formatNumber(netProfit)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};
export default IncomeStatementLineItemsTable;