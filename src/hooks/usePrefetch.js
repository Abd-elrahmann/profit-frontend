import { useCallback, useRef } from 'react';

export const usePrefetch = () => {
  const prefetchedPages = useRef(new Set());

  const prefetchPage = useCallback(async (pageName) => {
    if (prefetchedPages.current.has(pageName)) {
      return;
    }

    try {
      switch (pageName) {
        case 'dashboard':
          await import('../pages/dashboard/Dashboard');
          break;
        case 'clients':
          await import('../pages/Clients/Clients');
          break;
        case 'loans':
          await import('../pages/Loans/Loans');
          break;
        case 'investors':
          await import('../pages/Investors/Investors');
          break;
        case 'treasury':
          await import('../pages/treasury/treasury');
          break;
        case 'journals':
          await import('../pages/Journals/Journals');
          break;
        case 'banks':
          await import('../pages/Banks/Banks');
          break;
        case 'employees':
          await import('../pages/Employees/Employees');
          break;
        case 'expenses':
          await import('../pages/Expenses/Expenses');
          break;
        case 'saving':
          await import('../pages/Saving/Saving');
          break;
        case 'zakah':
          await import('../pages/Zakah/zakah');
          break;
        case 'contract-templates':
          await import('../pages/Templates/ContractTemplates');
          break;
        case 'messages-templates':
          await import('../pages/Templates/MessagesTemplates');
          break;
        case 'chart-of-accounts':
          await import('../pages/chartOfAccounts/chartOfAccounts');
          break;
        case 'general-ledger':
          await import('../pages/generalLedger/GeneralLedger');
          break;
        case 'income-statement':
          await import('../pages/incomeStatement/incomeStatement');
          break;
        case 'company-profit':
          await import('../pages/companyProfit/CompanyProfit');
          break;
        case 'profit-distribution':
          await import('../pages/profit/ProfitDistribution');
          break;
        case 'period-closing':
          await import('../pages/periodClosing/periodClosing');
          break;
        case 'investors-withdraw':
          await import('../pages/investorsWithdrawal/investorsWithdrawal');
          break;
        case 'client-collections':
          await import('../pages/clientCollections/ClientCollections');
          break;
        case 'logs':
          await import('../pages/logs/logs');
          break;
        case 'roles':
          await import('../pages/Roles/Roles');
          break;
        case 'profile':
          await import('../pages/Profile');
          break;
        default:
          break;
      }

      prefetchedPages.current.add(pageName);

    } catch (error) {
      console.warn(`Failed to prefetch ${pageName}:`, error);
    }
  }, []);

  const prefetchCommonPages = useCallback(() => {
    setTimeout(() => {
      prefetchPage('dashboard');
      prefetchPage('clients');
      prefetchPage('loans');
    }, 2000);
  }, [prefetchPage]);

  return { prefetchPage, prefetchCommonPages };
};
