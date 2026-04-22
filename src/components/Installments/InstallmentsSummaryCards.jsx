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
  advancePayment = 0,
}) {
  const remainingRepayments = (totalRepayments || 0) - (paidRepayments || 0);
  const formatValue = (val) => (Number(val) || 0).toLocaleString('en-US');
  const adv = Number(advancePayment) || 0;
  const grossPrincipal = Number(amount) || 0;
  const netPrincipal = Math.max(0, grossPrincipal - adv);

  const principalCards =
    adv > 0
      ? [
          {
            label: 'مبلغ السلفة الأصلي',
            value: formatValue(grossPrincipal),
            color: 'text-slate-900 dark:text-slate-100',
            showCurrency: true,
          },
          {
            label: 'دفع مقدم',
            value: formatValue(adv),
            color: 'text-red-600 dark:text-red-400',
            showCurrency: true,
            sub: 'يُخصم من أصل السلفة',
            highlightAdvance: true,
          },
          {
            label: 'أصل السلفة بعد الخصم',
            value: formatValue(netPrincipal),
            color: 'text-slate-900 dark:text-slate-100',
            showCurrency: true,
          },
        ]
      : [
          {
            label: 'مبلغ السلفة',
            value: formatValue(grossPrincipal),
            color: 'text-slate-900 dark:text-slate-100',
            showCurrency: true,
          },
        ];

  const cards = [
    ...principalCards,
    { label: 'إجمالي الفائدة', value: formatValue(interestAmount), color: 'text-slate-900 dark:text-slate-100', showCurrency: true },
    { label: 'المبلغ الإجمالي', value: formatValue(totalAmount), color: 'text-primary', showCurrency: true },
    { label: 'المبلغ المدفوع', value: formatValue(totalPaidAmount), color: 'text-slate-900 dark:text-slate-100', showCurrency: true },
    {
      label: 'المبلغ المتبقي',
      value: formatValue(totalRemainingAmount),
      color: 'text-amber-600 dark:text-amber-500',
      highlight: true,
      showCurrency: true,
    },
    { label: 'إجمالي الخصومات', value: formatValue(totalDiscounts), color: 'text-slate-900 dark:text-slate-100', showCurrency: true },
    {
      label: 'الدفعات المدفوعة',
      value: `${paidRepayments || 0} / ${totalRepayments || 0}`,
      color: 'text-slate-900 dark:text-slate-100',
      showCurrency: false,
    },
    {
      label: 'الدفعات المتبقية',
      value: remainingRepayments,
      color: 'text-slate-900 dark:text-slate-100',
      showCurrency: false,
    },
  ];
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
      {cards.map((card) => (
        <div
          key={card.label}
          className={`bg-white dark:bg-slate-900 p-3 sm:p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm ${
            card.highlight ? 'border-r-4 border-r-amber-500' : ''
          } ${card.highlightAdvance ? 'border-r-4 border-r-red-400 dark:border-r-red-500' : ''}`}
        >
          <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm font-medium">{card.label}</p>
          {card.sub ? (
            <p className="text-slate-400 dark:text-slate-500 text-[11px] sm:text-xs mt-0.5">{card.sub}</p>
          ) : null}
          <div className="flex items-baseline gap-2 mt-1 sm:mt-2">
            <p className={`text-xl sm:text-2xl font-bold ${card.color}`}>{card.value}</p>
            {card.showCurrency ? <span className="text-xs text-slate-400">ر.س</span> : null}
          </div>
        </div>
      ))}
    </div>
  );
}