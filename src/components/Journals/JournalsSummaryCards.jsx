import React from "react";
export default function JournalsSummaryCards({ totals, isDarkMode = false, isSmallScreen = false }) {
  const totalDebit = Number(totals?.totalDebit || 0);
  const totalCredit = Number(totals?.totalCredit || 0);
  const totalBalance = totalDebit - totalCredit;

  const formatNumber = (value) =>
    value ? Math.round(value).toLocaleString() : "0";
  const cards = [
    {
      label: "إجمالي المدين",
      value: formatNumber(totalDebit),
      valueColor: "#2563eb",
    },
    {
      label: "إجمالي الدائن",
      value: formatNumber(totalCredit),
      valueColor: "#dc2626",
    },
    {
      label: "الفرق",
      value: formatNumber(totalBalance),
      valueColor: totalBalance === 0 ? "#2E8B45" : "#D91656",
    },
  ];

  return (
    <section className="w-full">
        <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-gutter">
          {cards.map((card) => (
            <div
              key={card.label}
              className="bg-surface-container-lowest rounded-xl p-card-padding border border-outline-variant flex flex-col gap-1 items-center"
            >
              <span className="font-label-md text-label-md text-on-surface-variant">{card.label}</span>
              <span
                className="font-display-md text-display-md"
                style={{ color: card.valueColor || (isDarkMode ? "#e2e8f0" : "#0f172a") }}
              >
                {card.value}
              </span>
            </div>
          ))}

          <div
            className="md:col-span-3 rounded-lg p-compact-padding flex items-center justify-center gap-2 mt-4 bg-[#f0fff4] text-[#00174b]"
          >
            <span className="font-label-md text-label-md uppercase tracking-wider">
              {totalBalance === 0 ? "القيد متوازن - جاهز للترحيل" : "القيد غير متوازن"}
            </span>
          </div>
        </div>
    </section>
  );
}