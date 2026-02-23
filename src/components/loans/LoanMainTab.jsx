import React from "react";

const LoanMainTab = ({
  loansNeedingContracts,
  subTab,
  setSubTab,
  handleViewLoanDetails,
  statusCounts = { PENDING: 0, ACTIVE: 0, COMPLETED: 0 },
}) => {
  return (
    <div className="flex w-full flex-col">
      {/* Alert for loans needing contracts */}
      {loansNeedingContracts && loansNeedingContracts.length > 0 && (
        <div className="mb-6 flex flex-col gap-4 rounded-xl border-2 border-amber-500 bg-amber-50 p-4 dark:border-amber-600 dark:bg-amber-900/20">
          <p className="text-sm font-bold text-amber-900 dark:text-amber-100">
            السلف التالية تحتاج إلى حفظ العقود:
          </p>
          <div className="flex flex-col gap-3">
            {loansNeedingContracts.map((loan) => (
              <div
                key={loan.id}
                className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between"
              >
                <p className="flex-1 pr-2 text-sm text-amber-800 dark:text-amber-200">
                  السلفة #{loan.id} - العميل: {loan.client?.name}
                  {!loan.DEBT_ACKNOWLEDGMENT && !loan.PROMISSORY_NOTE && " (إقرار الدين وسند الأمر)"}
                  {!loan.DEBT_ACKNOWLEDGMENT && loan.PROMISSORY_NOTE && " (إقرار الدين)"}
                  {loan.DEBT_ACKNOWLEDGMENT && !loan.PROMISSORY_NOTE && " (سند الأمر)"}
                </p>
                <button
                  type="button"
                  onClick={() => handleViewLoanDetails(loan.id)}
                  className="shrink-0 rounded-lg border border-primary bg-transparent px-4 py-2 text-sm font-semibold text-primary transition-colors hover:bg-primary/10"
                >
                  عرض تفاصيل السلفة
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sub-tabs for loan status filtering */}
      <div className="mb-8">
        <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-slate-500">
          تصفية حسب الحالة
        </h3>
        <div className="flex flex-wrap gap-3">
          {[
            { value: 0, label: "قيد الانتظار", status: "PENDING" },
            { value: 1, label: "نشطة", status: "ACTIVE" },
            { value: 2, label: "مكتملة", status: "COMPLETED" },
          ].map((tab) => (
            <button
              key={tab.value}
              type="button"
              onClick={() => setSubTab(tab.value)}
              className={`flex items-center gap-2 rounded-full border px-5 py-2 text-sm font-medium transition-all ${
                subTab === tab.value
                  ? "border-primary/20 bg-primary/10 text-primary font-bold"
                  : "border-slate-200 bg-white text-slate-600 hover:border-primary/50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400"
              }`}
            >
              {tab.label} ({statusCounts[tab.status] ?? 0})
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LoanMainTab;
