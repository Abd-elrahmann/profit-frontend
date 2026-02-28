import React from "react";
import { Check as CheckIcon, Cancel as CancelIcon, Savings as SavingsIcon } from "@mui/icons-material";
import { hasDistribution } from "./profitDistributionUtils";
export default function ProfitDistributionActions({
  periodData,
  theme,
  permissions,
  enableSaving,
  savingPercentage,
  onEnableSavingChange,
  onOpenSavingDialog,
  onOpenDistributionDialog,
  selectedPeriod,
}) {
  const distributed = hasDistribution(periodData);
  return (
    <div className="bg-white dark:bg-background-dark/50 rounded-xl border border-primary/10 p-4 shadow-sm">
      <p className="text-sm font-bold text-primary mb-3">الإجراءات</p>
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        {!distributed && (
          <div className="flex items-center gap-2 flex-wrap">
            <label className="flex items-center gap-2 cursor-pointer text-sm">
              <input
                type="checkbox"
                checked={enableSaving}
                onChange={(e) => {
                  onEnableSavingChange(e.target.checked);
                  if (e.target.checked && savingPercentage === 0) {
                    onOpenSavingDialog();
                  }
                }}
                className="w-4 h-4 rounded border-primary text-primary focus:ring-primary"
              />
              <span className="text-slate-700 dark:text-slate-300">ادخار من التوزيع</span>
            </label>
            {enableSaving && (
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm text-slate-600 dark:text-slate-400">
                  نسبة الادخار: <strong>{savingPercentage.toFixed(2)}%</strong>
                </span>
                <button
                  type="button"
                  onClick={onOpenSavingDialog}
                  className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-primary hover:bg-primary/10 rounded transition-colors"
                >
                  <SavingsIcon sx={{ fontSize: 16 }} />
                  تعديل
                </button>
              </div>
            )}
          </div>
        )}
        {permissions?.includes("distribution_Post") && (
          <div className="flex gap-2">
            {!distributed && (
              <button
                type="button"
                onClick={() =>
                  onOpenDistributionDialog(selectedPeriod, periodData?.name, "post")
                }
                className="flex items-center gap-1 px-3 py-1.5 bg-primary text-white rounded-lg text-sm font-bold hover:bg-primary/90 transition-all"
              >
                <CheckIcon sx={{ fontSize: 18 }} />
                توزيع الأرباح
              </button>
            )}
            {distributed && (
              <button
                type="button"
                onClick={() =>
                  onOpenDistributionDialog(selectedPeriod, periodData?.name, "unpost")
                }
                className="flex items-center gap-1 px-3 py-1.5 border border-red-500 text-red-600 rounded-lg text-sm font-bold hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
              >
                <CancelIcon sx={{ fontSize: 18 }} />
                إلغاء التوزيع
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}