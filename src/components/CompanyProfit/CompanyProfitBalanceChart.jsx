import React from 'react';
import { North } from '@mui/icons-material';
import { formatNum } from './companyProfitUtils';
const CompanyProfitBalanceChart = ({ chartData }) => {
  const maxBalance = Math.max(...(chartData || []).map((d) => d.balance), 1);
  return (
    <div className="lg:col-span-2 bg-white dark:bg-slate-800 p-6 rounded-2xl border border-primary/5 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h4 className="text-lg font-bold">تطور الرصيد المتاح للسحب</h4>
          <p className="text-slate-400 text-xs">تحليل السيولة خلال آخر 7 أيام</p>
        </div>
        {chartData?.length >= 2 && chartData[chartData.length - 1]?.balance > chartData[0]?.balance && (
          <div className="flex items-center gap-2 text-primary bg-primary/5 px-3 py-1 rounded-lg">
            <North sx={{ fontSize: 18 }} />
            <span className="text-sm font-bold">+</span>
          </div>
        )}
      </div>
      <div className="h-64 w-full flex items-end gap-1">
        {chartData?.length ? (
          chartData.map((d) => (
            <div key={d.date} className="flex-1 flex flex-col items-center gap-1">
              <div
                className="w-full rounded-t bg-primary/30 min-h-[4px] transition-all"
                style={{ height: `${Math.max(4, (d.balance / maxBalance) * 100)}%` }}
              />
              <span className="text-[10px] text-slate-400 font-bold">{d.label}</span>
            </div>
          ))
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-400 text-sm">لا توجد بيانات للرسم</div>
        )}
      </div>
    </div>
  );
};
export default CompanyProfitBalanceChart;