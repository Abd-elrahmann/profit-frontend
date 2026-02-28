import React from "react";
import { Description, Payments, PendingActions } from "@mui/icons-material";
export default function JournalsListSummaryCards({
  total = 0,
  posted = 0,
  draft = 0,
}) {
  const cardClass =
    "bg-white dark:bg-background-dark/50 p-6 rounded-xl border border-primary/10 shadow-sm flex items-center gap-4";
  return (
    <>
      <div className={cardClass}>
        <div className="h-12 w-12 rounded-lg bg-primary/5 flex items-center justify-center text-primary shrink-0">
          <Description sx={{ fontSize: 30 }} color="primary" />
        </div>
        <div>
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            عدد القيود
          </p>
          <h3 className="text-2xl font-black text-slate-900 dark:text-white">
            {total.toLocaleString("en-US")}{" "}
            <span className="text-sm font-normal text-slate-400">قيد</span>
          </h3>
        </div>
      </div>
      <div className={cardClass}>
        <div className="h-12 w-12 rounded-lg bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
          <Payments sx={{ fontSize: 30 }} color="success" />
        </div>
        <div>
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            المعتمد
          </p>
          <h3 className="text-2xl font-black text-slate-900 dark:text-white">
            {posted.toLocaleString("en-US")}{" "}
            <span className="text-sm font-normal text-slate-400">قيد</span>
          </h3>
        </div>
      </div>
      <div className={cardClass}>
        <div className="h-12 w-12 rounded-lg bg-amber-50 dark:bg-amber-900/30 flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0">
          <PendingActions sx={{ fontSize: 30 }} color="warning" />
        </div>
        <div>
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            الغير معتمد
          </p>
          <h3 className="text-2xl font-black text-slate-900 dark:text-white">
            {draft.toLocaleString("en-US")}{" "}
            <span className="text-sm font-normal text-slate-400">قيد</span>
          </h3>
        </div>
      </div>
    </>
  );
}