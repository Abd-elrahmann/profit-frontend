import React from 'react';
import { formatNum } from './companyProfitUtils';
const CompanyProfitSourcesTableTailwind = ({ periods }) => {
  if (!periods?.length) return null;
  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-primary/5 shadow-sm overflow-hidden">
      <div className="p-6 border-b border-primary/5">
        <h4 className="text-lg font-bold">مصادر أرباح الشركة</h4>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-right">
          <thead className="bg-primary/5 text-primary text-sm font-bold">
            <tr>
              <th className="px-6 py-4">الفترة</th>
              <th className="px-6 py-4">إجمالي الأرباح</th>
              <th className="px-6 py-4">نسبة الشركة</th>
              <th className="px-6 py-4">أرباح الشركة</th>
              <th className="px-6 py-4">باقي أرباح الشركاء</th>
              <th className="px-6 py-4">إجمالي أرباح الشركة</th>
            </tr>
          </thead>
          <tbody className="text-sm divide-y divide-primary/5">
            {periods.map((p, i) => (
              <tr key={i} className="hover:bg-primary/5 transition-colors">
                <td className="px-6 py-4 font-bold">{p.periodName}</td>
                <td className="px-6 py-4 text-slate-500">{formatNum(p.totalPeriodProfit)}</td>
                <td className="px-6 py-4 text-slate-500">{p.companyPercentage || 0}%</td>
                <td className="px-6 py-4 font-bold">{formatNum(p.companyProfit)}</td>
                <td className="px-6 py-4 text-slate-500">{formatNum(p.cents)}</td>
                <td className="px-6 py-4 font-bold text-primary">{formatNum(p.totalCompany)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
export default CompanyProfitSourcesTableTailwind;