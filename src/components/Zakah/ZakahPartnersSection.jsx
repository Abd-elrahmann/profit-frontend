import React from 'react';
import ZakahPartnersTable from './ZakahPartnersTable';
const ZakahPartnersSection = ({
  onViewDetails,
  isMobile,
  isTablet,
  isSmallScreen,
  tableYear,
  onYearChange,
  onTotalsChange,
}) => {
  return (
    <div className="bg-white dark:bg-background-dark rounded-xl border border-primary/10 shadow-sm overflow-hidden">
      <div className="p-4 sm:p-6 border-b border-primary/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">
            تفاصيل زكاة الشركاء
          </h3>
          <p className="text-sm text-slate-500 mt-1">
            عرض حالة دفع الزكاة لجميع الشركاء المسجلين
          </p>
        </div>
      </div>
      <div className="p-4 sm:p-6">
        <ZakahPartnersTable
          onViewDetails={onViewDetails}
          isMobile={isMobile}
          isTablet={isTablet}
          isSmallScreen={isSmallScreen}
          selectedYear={tableYear}
          onYearChange={onYearChange}
          onTotalsChange={onTotalsChange}
        />
      </div>
    </div>
  );
};
export default ZakahPartnersSection;