import { useCallback, useRef } from 'react';

const MODULE_IMPORTS = {
  dashboard: () => import('../pages/dashboard/Dashboard'),
  logs: () => import('../pages/logs/logs'),
  settings: () => import('../pages/Settings/Settings'),
  users: () => import('../pages/Employees/Employees'),
  roles: () => import('../pages/Roles/Roles'),
  clients: () => import('../pages/Clients/Clients'),
  'client-report': () => import('../pages/clientCollections/ClientCollections'),
  partners: () => import('../pages/Investors/Investors'),
  'partners-withdraw': () => import('../pages/investorsWithdrawal/investorsWithdrawal'),
  expenses: () => import('../pages/Expenses/Expenses'),
  'income-statement': () => import('../pages/incomeStatement/incomeStatement'),
  accounts: () => import('../pages/chartOfAccounts/chartOfAccounts'),
  journals: () => import('../pages/Journals/Journals'),
  'general-ledger': () => import('../pages/generalLedger/GeneralLedger'),
  period: () => import('../pages/periodClosing/periodClosing'),
  loans: () => import('../pages/Loans/Loans'),
  banks: () => import('../pages/Banks/Banks'),
  repayments: () => import('../pages/Installments/Installments'),
  treasury: () => import('../pages/treasury/treasury'),
  company: () => import('../pages/companyProfit/CompanyProfit'),
  distribution: () => import('../pages/profit/ProfitDistribution'),
  zakat: () => import('../pages/Zakah/zakah'),
  saving: () => import('../pages/Saving/Saving'),
  templates: () => import('../pages/Templates/ContractTemplates'),
  profile: () => import('../pages/Profile'),
};

const COMMON_MODULES = [
  'dashboard',
  'clients',
  'loans',
  'banks',
  'repayments',
  'expenses',
  'partners',
  'treasury',
  'settings',
];

export const usePrefetch = () => {
  const prefetchedPages = useRef(new Set());
  const prefetchPage = useCallback(async (moduleName) => {
    if (!moduleName || prefetchedPages.current.has(moduleName)) {
      return;
    }
    const importFn = MODULE_IMPORTS[moduleName];
    if (!importFn) return;
    try {
      await importFn();
      prefetchedPages.current.add(moduleName);
    } catch (error) {
      console.warn(`Failed to prefetch ${moduleName}:`, error);
    }
  }, []);

  const prefetchCommonPages = useCallback(() => {
    // تشغيل فوري بدون تأخير - import() غير متزامن ولا يعطل الواجهة
    COMMON_MODULES.forEach((moduleName) => {
      prefetchPage(moduleName);
    });
  }, [prefetchPage]);

  return { prefetchPage, prefetchCommonPages };
};
