import React from 'react';
export default function InstallmentsSummaryCards({
  amount,
  interestAmount,
  totalAmount,
  totalPaidAmount,
  totalRemainingAmount,
  totalDiscounts,
  paidRepayments,
  totalRepayments,
}) {
  const remainingRepayments = (totalRepayments || 0) - (paidRepayments || 0);
  const formatValue = (val) => (val ?? 0).toLocaleString('en-US');
  const cards = [
    { label: 'مبلغ السلفة', value: formatValue(amount), color: 'text-slate-900 dark:text-slate-100' },
    { label: 'إجمالي الفائدة', value: formatValue(interestAmount), color: 'text-slate-900 dark:text-slate-100' },
    { label: 'المبلغ الإجمالي', value: formatValue(totalAmount), color: 'text-primary' },
    { label: 'المبلغ المدفوع', value: formatValue(totalPaidAmount), color: 'text-slate-900 dark:text-slate-100' },
    {
      label: 'المبلغ المتبقي',
      value: formatValue(totalRemainingAmount),
      color: 'text-amber-600 dark:text-amber-500',
      highlight: true,
    },
    { label: 'إجمالي الخصومات', value: formatValue(totalDiscounts), color: 'text-slate-900 dark:text-slate-100' },
    {
      label: 'الدفعات المدفوعة',
      value: `${paidRepayments || 0} / ${totalRepayments || 0}`,
      color: 'text-slate-900 dark:text-slate-100',
    },
    {
      label: 'الدفعات المتبقية',
      value: remainingRepayments,
      color: 'text-slate-900 dark:text-slate-100',
    },
  ];
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
      {cards.map((card) => (
        <div
          key={card.label}
          className={`bg-white dark:bg-slate-900 p-3 sm:p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm ${
            card.highlight ? 'border-r-4 border-r-amber-500' : ''
          }`}
        >
          <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm font-medium">{card.label}</p>
          <div className="flex items-baseline gap-2 mt-1 sm:mt-2">
            <p className={`text-xl sm:text-2xl font-bold ${card.color}`}>{card.value}</p>
            {!card.label.includes('الدفعات') && <span className="text-xs text-slate-400">ر.س</span>}
          </div>
        </div>
      ))}
    </div>
  );
}