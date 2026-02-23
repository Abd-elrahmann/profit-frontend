import React from "react";
import { Search } from "lucide-react";

const LoanTabs = ({
  activeTab,
  setActiveTab,
  resetLoanForm,
  isSmallScreen,
  permissions,
  isClientConversion,
  isViewMode,
  isEditMode,
  isAdditionalLoan,
  searchQuery,
  onSearchChange,
}) => {
  const handleTabChange = (newValue) => {
    setActiveTab(newValue);
    if (newValue === 0 || newValue === 2 || newValue === 3) {
      resetLoanForm();
    }
  };

  const tabs = [
    { actualIndex: 0, label: "جميع السلفات" },
    ...(permissions.includes("loans_Add")
      ? [
          {
            actualIndex: 1,
            label: isClientConversion
              ? "نقل مديونية السلفة"
              : isViewMode
              ? "عرض تفاصيل السلفة"
              : isEditMode
              ? "تعديل السلفة"
              : isAdditionalLoan
              ? "إنشاء سلفة إضافية"
              : "إنشاء سلفة جديدة",
          },
        ]
      : []),
    { actualIndex: 2, label: "إنشاء سلفة بدون فائدة" },
    { actualIndex: 3, label: "عرض السلفات بدون فائدة" },
  ];

  return (
    <div className={`mb-4 ${isSmallScreen ? "mb-4" : "mb-8"}`}>
      {/* Tabs row */}
      <div className="flex gap-4 overflow-x-auto border-b border-slate-200 px-4 py-2 md:gap-8 dark:border-slate-800">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.actualIndex;
          return (
            <button
              key={tab.actualIndex}
              type="button"
              role="tab"
              onClick={() => handleTabChange(tab.actualIndex)}
              className={`whitespace-nowrap border-b-2 pb-4 font-bold transition-all ${
                isActive
                  ? "border-primary text-primary"
                  : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
              } ${isSmallScreen ? "text-sm" : "text-base"}`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Search row - below tabs, same position */}
      {activeTab === 0 && (
        <div className="px-4 pt-4">
          <div className="relative inline-flex items-center">
            <Search className="absolute right-3 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="ابحث باسم العميل أو رقم السلفة..."
              value={searchQuery || ""}
              onChange={(e) => onSearchChange?.(e)}
              className={`rounded-xl border-none bg-slate-100 py-2 pr-10 pl-4 text-sm focus:ring-2 focus:ring-primary dark:bg-slate-800 ${
                isSmallScreen ? "w-[200px]" : "w-[300px]"
              }`}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default LoanTabs;
