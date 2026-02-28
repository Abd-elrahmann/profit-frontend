import React from 'react';
import { ArrowUpward, Pending } from '@mui/icons-material';
import { formatNum } from './companyProfitUtils';
const CompanyProfitSummarySection = ({ profitData }) => {
  return (
    <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-primary/5 shadow-sm">
      <h4 className="text-lg font-bold mb-6">ملخص العمليات</h4>
      <div className="space-y-4">
        <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl border border-slate-100 dark:border-slate-600">
          <div className="flex items-center gap-3">
            <ArrowUpward className="text-primary" sx={{ fontSize: 22 }} />
            <div>
              <p className="text-xs text-slate-400">إجمالي السحوبات</p>
              <p className="text-sm font-bold">{formatNum(profitData?.totalWithdrawnAmount)}</p>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl border border-slate-100 dark:border-slate-600">
          <div className="flex items-center gap-3">
            <Pending className="text-amber-500" sx={{ fontSize: 22 }} />
            <div>
              <p className="text-xs text-slate-400">عمليات معلقة</p>
              <p className="text-sm font-bold">0</p>
            </div>
          </div>
        </div>
      </div>
      <div className="mt-8">
        <p className="text-xs text-slate-400 mb-2">حالة الحساب</p>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          <span className="text-sm font-medium">نشط ومحدث</span>
        </div>
      </div>
    </div>
  );
};
export default CompanyProfitSummarySection;