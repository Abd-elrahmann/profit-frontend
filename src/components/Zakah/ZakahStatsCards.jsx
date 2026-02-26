import React from 'react';
import {
  AccountBalance,
  AccountBalanceWallet,
  CheckCircle,
  PendingActions,
} from '@mui/icons-material';

const formatCurrency = (amount) => amount?.toLocaleString() ?? '0';

const StatCard = ({ icon: Icon, label, value, variant = 'default', badge }) => (
  <div className="bg-white dark:bg-background-dark p-4 sm:p-6 rounded-xl border border-primary/10 shadow-sm hover:shadow-md transition-shadow">
    <div className="flex justify-between items-start mb-4">
      <div
        className={`p-2 rounded-lg ${
          variant === 'blue'
            ? 'bg-blue-50 text-blue-600'
            : variant === 'primary'
              ? 'bg-primary/10 text-primary'
              : variant === 'emerald'
                ? 'bg-emerald-50 text-emerald-600'
                : variant === 'orange'
                  ? 'bg-orange-50 text-orange-600'
                  : 'bg-primary/10 text-primary'
        }`}
      >
        <Icon sx={{ fontSize: 24 }} />
      </div>
      {badge && (
        <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded">
          {badge}
        </span>
      )}
    </div>
    <p className="text-slate-500 text-sm font-medium">{label}</p>
    <h3 className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-slate-100 mt-1 break-words">
      {value}
    </h3>
  </div>
);

const ZakahStatsCards = ({ totals }) => {
  const { capitalAmount, annualZakat, totalPaid, remaining } = totals ?? {};

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
      <StatCard
        icon={AccountBalance}
        label="إجمالي رأس المال"
        value={formatCurrency(capitalAmount)}
        variant="blue"
        badge="+2.5%"
      />
      <StatCard
        icon={AccountBalanceWallet}
        label="إجمالي الزكاة السنوية"
        value={formatCurrency(annualZakat)}
        variant="primary"
      />
      <StatCard
        icon={CheckCircle}
        label="إجمالي المدفوع"
        value={formatCurrency(totalPaid)}
        variant="emerald"
      />
      <StatCard
        icon={PendingActions}
        label="إجمالي المتبقي"
        value={formatCurrency(remaining)}
        variant="orange"
      />
    </div>
  );
};

export default ZakahStatsCards;
