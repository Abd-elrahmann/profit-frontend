import React from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import { BarChart3, PieChart, Lightbulb } from 'lucide-react';
import { formatNumber } from './incomeStatementUtils';
const IncomeStatementChartsSection = ({ incomeData }) => {
  if (!incomeData) return null;
  const monthlyBreakdown = incomeData.monthlyBreakdown ?? [];
  const expenseByType = incomeData.expenseByType || [];
  const totalExpenses = incomeData.totalExpenses || 0;
  const netProfit = incomeData.netProfit || 0;
  const totalRevenues = incomeData.revenues?.total || 0;
  return (
    <div className="space-y-6">
      {}
      <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm">
        <h3 className="text-sm font-bold mb-6 flex items-center gap-2">
          <BarChart3 className="size-5 text-primary" />
          الإيرادات والمصروفات (شهرياً)
        </h3>
        {monthlyBreakdown.length > 0 ? (
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={monthlyBreakdown}
                margin={{ top: 10, right: 10, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-600" />
                <XAxis
                  dataKey="monthName"
                  tick={{ fill: 'currentColor', fontSize: 11 }}
                  className="text-slate-500"
                />
                <YAxis
                  tick={{ fill: 'currentColor', fontSize: 11 }}
                  tickFormatter={(v) => formatNumber(v)}
                  className="text-slate-500"
                />
                <Tooltip
                  formatter={(value, name) => [
                    formatNumber(value),
                    name === 'revenue' ? 'إيرادات' : 'مصروفات',
                  ]}
                  labelFormatter={(label) => label}
                  contentStyle={{
                    borderRadius: '8px',
                    border: '1px solid rgb(226 232 240)',
                  }}
                />
                <Legend />
                <Bar dataKey="revenue" name="إيرادات" fill="#2e8a45" radius={[4, 4, 0, 0]} />
                <Bar dataKey="expenses" name="مصروفات" fill="#ea580c" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-64 flex items-center justify-center text-slate-400 text-sm">
            لا توجد بيانات شهرية للفترة المحددة
          </div>
        )}
      </div>
      {}
      <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm">
        <h3 className="text-sm font-bold mb-6 flex items-center gap-2">
          <PieChart className="size-5 text-primary" />
          توزيع المصروفات التشغيلية
        </h3>
        {expenseByType.length > 0 ? (
          <>
            <div className="relative flex justify-center items-center py-4">
              <div className="size-48 rounded-full border-[18px] border-slate-100 dark:border-slate-700 relative flex items-center justify-center overflow-hidden">
                <div
                  className="absolute inset-0 rounded-full"
                  style={{
                    background: (() => {
                      let acc = 0;
                      const stops = expenseByType.slice(0, 5).map((item, idx) => {
                        const start = acc;
                        acc += item.percentage;
                        const colors = ['rgb(46 138 69)', 'rgb(46 138 69 / 0.7)', 'rgb(46 138 69 / 0.5)', 'rgb(46 138 69 / 0.35)', 'rgb(46 138 69 / 0.2)'];
                        return `${colors[idx % 5]} ${start}% ${acc}%`;
                      });
                      return `conic-gradient(from 0deg, ${stops.join(', ')})`;
                    })(),
                  }}
                />
                <div className="text-center relative z-10 bg-white dark:bg-slate-800 rounded-full size-28 flex items-center justify-center m-2">
                  <div>
                    <span className="text-xs text-slate-400 block">الإجمالي</span>
                    <span className="text-xl font-black text-slate-800 dark:text-white">
                      {formatNumber(totalExpenses)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-4 space-y-3">
              {expenseByType.slice(0, 5).map((item, idx) => (
                <div key={idx} className="flex justify-between items-center text-xs">
                  <div className="flex items-center gap-2">
                    <div
                      className="size-2 rounded-full"
                      style={{
                        backgroundColor: idx === 0 ? 'rgb(46 138 69)' : idx === 1 ? 'rgb(46 138 69 / 0.6)' : 'rgb(46 138 69 / 0.3)',
                      }}
                    />
                    <span>{item.type}</span>
                  </div>
                  <span className="font-bold">{item.percentage}%</span>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="py-8 flex flex-col items-center justify-center text-slate-400 text-sm">
            <div className="size-24 rounded-full border-4 border-slate-200 dark:border-slate-600 flex items-center justify-center mb-4">
              <span className="text-lg font-bold">0</span>
            </div>
            لا توجد مصروفات للفترة
          </div>
        )}
      </div>
      {}
      <div className="bg-gradient-to-br from-primary to-emerald-700 p-6 rounded-xl text-white shadow-lg shadow-primary/20">
        <h4 className="font-bold mb-2 flex items-center gap-2">
          <Lightbulb className="size-5 text-white/80" />
          رؤى ذكية
        </h4>
        <p className="text-sm text-white/90 leading-relaxed">
          {netProfit >= 0
            ? `صافي الربح بلغ ${formatNumber(netProfit)} ر.س. الإيرادات التشغيلية ${formatNumber(totalRevenues)} ر.س والمصروفات ${formatNumber(totalExpenses)} ر.س.`
            : `صافي الخسارة بلغ ${formatNumber(Math.abs(netProfit))} ر.س. المصروفات تجاوزت الإيرادات خلال هذه الفترة.`}
        </p>
      </div>
    </div>
  );
};
export default IncomeStatementChartsSection;