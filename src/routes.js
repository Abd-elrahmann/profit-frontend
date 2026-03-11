import React from 'react';
const Dashboard = React.lazy(() => import('./pages/dashboard/Dashboard'));
const Login = React.lazy(() => import('./pages/auth/Login'));
const Employees = React.lazy(() => import('./pages/Employees/Employees'));
const Roles = React.lazy(() => import('./pages/Roles/Roles'));
const Clients = React.lazy(() => import('./pages/Clients/Clients'));
const AddClientPage = React.lazy(() => import('./pages/Clients/AddClientPage'));
const AddKafeelPage = React.lazy(() => import('./pages/Clients/AddKafeelPage'));
const EditDocumentsPage = React.lazy(() => import('./pages/Clients/EditDocumentsPage'));
const EditKafeelDocumentsPage = React.lazy(() => import('./pages/Clients/EditKafeelDocumentsPage'));
const ContractTemplates = React.lazy(() => import('./pages/Templates/ContractTemplates'));
const Investors = React.lazy(() => import('./pages/Investors/Investors'));
const AddInvestorPage = React.lazy(() => import('./pages/Investors/AddInvestorPage'));
const Loans = React.lazy(() => import('./pages/Loans/Loans'));
const Banks = React.lazy(() => import('./pages/Banks/Banks'));
const Installments = React.lazy(() => import('./pages/Installments/Installments'));
const MessagesTemplates = React.lazy(() => import('./pages/Templates/MessagesTemplates'));
const Journals = React.lazy(() => import('./pages/Journals/Journals'));
const Logs = React.lazy(() => import('./pages/logs/logs'));
const Treasury = React.lazy(() => import('./pages/treasury/treasury'));
const GeneralLedger = React.lazy(() => import('./pages/generalLedger/GeneralLedger'));
const PeriodClosing = React.lazy(() => import('./pages/periodClosing/periodClosing'));
const ProfitDistribution = React.lazy(() => import('./pages/profit/ProfitDistribution'));
const Profile = React.lazy(() => import('./pages/Profile'));
const ChartOfAccounts = React.lazy(() => import('./pages/chartOfAccounts/chartOfAccounts'));
const Zakah = React.lazy(() => import('./pages/Zakah/zakah'));
const Saving = React.lazy(() => import('./pages/Saving/Saving'));
const ClientCollections = React.lazy(() => import('./pages/clientCollections/ClientCollections'));
const CompanyProfit = React.lazy(() => import('./pages/companyProfit/CompanyProfit'));
const Expenses = React.lazy(() => import('./pages/Expenses/Expenses'));
const InvestorsWithdrawal = React.lazy(() => import('./pages/investorsWithdrawal/investorsWithdrawal'));
const IncomeStatement = React.lazy(() => import('./pages/incomeStatement/incomeStatement'));
const Settings = React.lazy(() => import('./pages/Settings/Settings'));
const routes = [
  {
    path: '/login',
    element: Login,
    protected: false,
    showInSidebar: false
  },
  {
    path: '/dashboard',
    element: Dashboard,
    protected: true,
    showInSidebar: true,
    module: 'dashboard',
    requiresPermissions: true
  },
  {
    path: '/logs',
    element: Logs,
    protected: true,
    showInSidebar: true,
    module: 'logs',
    requiresPermissions: true
  },
  {
    path: '/employees',
    element: Employees,
    protected: true,
    showInSidebar: true,
    module: 'users',
    requiresPermissions: true
  },
  {
    path: '/roles',
    element: Roles,
    protected: true,
    showInSidebar: true,
    module: 'roles',
    requiresPermissions: true
  },
  {
    path: '/clients',
    element: Clients,
    protected: true,
    showInSidebar: true,
    module: 'clients',
    requiresPermissions: true
  },
  {
    path: '/clients/add',
    element: AddClientPage,
    protected: true,
    showInSidebar: false,
    module: 'clients',
    requiresPermissions: true
  },
  {
    path: '/clients/:clientId/add-kafeel',
    element: AddKafeelPage,
    protected: true,
    showInSidebar: false,
    module: 'clients',
    requiresPermissions: true
  },
  {
    path: '/clients/:clientId/edit-documents',
    element: EditDocumentsPage,
    protected: true,
    showInSidebar: false,
    module: 'clients',
    requiresPermissions: true
  },
  {
    path: '/clients/:clientId/kafeels/:kafeelId/edit-documents',
    element: EditKafeelDocumentsPage,
    protected: true,
    showInSidebar: false,
    module: 'clients',
    requiresPermissions: true
  },
  {
    path: '/client-collections',
    element: ClientCollections,
    protected: true,
    showInSidebar: true,
    module: 'client-report',
    requiresPermissions: true
  },
  {
    path: '/investors',
    element: Investors,
    protected: true,
    showInSidebar: true,
    module: 'partners',
    requiresPermissions: true
  },
  {
    path: '/investors/add',
    element: AddInvestorPage,
    protected: true,
    showInSidebar: false,
    module: 'partners',
    requiresPermissions: true
  },
  {
    path: '/investors-withdraw',
    element: InvestorsWithdrawal,
    protected: true,
    showInSidebar: true,
    module: 'partners-withdraw',
    requiresPermissions: true
  },
  {
    path: '/expenses',
    element: Expenses,
    protected: true,
    showInSidebar: true,
    module: 'expenses',
    requiresPermissions: true
  },
  {
    path: '/income-statement',
    element: IncomeStatement,
    protected: true,
    showInSidebar: true,
    module: 'income-statement',
    requiresPermissions: true
  },
  {
    path: '/chart-of-accounts',
    element: ChartOfAccounts,
    protected: true,
    showInSidebar: true,
    module: 'accounts',
    requiresPermissions: true
  },
  {
    path: '/journal-entries',
    element: Journals,
    protected: true,
    showInSidebar: true,
    module: 'journals',
    requiresPermissions: true
  },
  {
    path: '/general-ledger',
    element: GeneralLedger,
    protected: true,
    showInSidebar: true,
    module: 'general-ledger',
    requiresPermissions: true
  },
  {
    path: '/period-closing',
    element: PeriodClosing,
    protected: true,
    showInSidebar: true,
    module: 'period',
    requiresPermissions: true
  },
  {
    path: '/loans',
    element: Loans,
    protected: true,
    showInSidebar: true,
    module: 'loans',
    requiresPermissions: true
  },
  {
    path: '/banks',
    element: Banks,
    protected: true,
    showInSidebar: true,
    module: 'banks',
    requiresPermissions: true
  },
  {
    path: '/installments',
    element: Installments,
    protected: true,
    showInSidebar: true,
    module: 'repayments',
    requiresPermissions: true
  },
  {
    path: '/installments/:loanId',
    element: Installments,
    protected: true,
    showInSidebar: false,
    module: 'repayments',
    requiresPermissions: true
  },
  {
    path: '/treasury',
    element: Treasury,
    protected: true,
    showInSidebar: true,
    module: 'treasury',
    requiresPermissions: true
  },
  {
    path: '/company-profit',
    element: CompanyProfit,
    protected: true,
    showInSidebar: true,
    module: 'company',
    requiresPermissions: true
  },
  {
    path: '/profit-distribution',
    element: ProfitDistribution,
    protected: true,
    showInSidebar: true,
    module: 'distribution',
    requiresPermissions: true
  },
  {
    path: '/zakah',
    element: Zakah,
    protected: true,
    showInSidebar: true,
    module: 'zakat',
    requiresPermissions: true
  },
  {
    path: '/saving',
    element: Saving,
    protected: true,
    showInSidebar: true,
    module: 'saving',
    requiresPermissions: true
  },
  {
    path: '/contract-templates',
    element: ContractTemplates,
    protected: true,
    showInSidebar: true,
    module: 'templates',
    requiresPermissions: true
  },
  {
    path: '/messages-templates',
    element: MessagesTemplates,
    protected: true,
    showInSidebar: true,
    module: 'templates',
    requiresPermissions: true
  },
  {
    path: '/profile',
    element: Profile,
    protected: true,
    showInSidebar: false,
    requiresPermissions: false
  },
  {
    path: '/settings',
    element: Settings,
    protected: true,
    showInSidebar: true,
    module: 'settings',
    requiresPermissions: true
  }
];
export { getSidebarMenuItems } from './sidebar.config.js';
import { sidebarItems } from './sidebar.config.js';
export const getAvailableModules = () => {
  const sidebarModules = sidebarItems
    .filter(item => item.requiresPermissions && item.module)
    .map(item => ({ value: item.module, label: item.label }));
  const seen = new Set();
  return sidebarModules.filter((m) => {
    if (seen.has(m.value)) return false;
    seen.add(m.value);
    return true;
  });
};

/** الصفحات التي تحتوي على ملفات ويمكن التحكم في صلاحية الوصول لملفاتها */
export const getFileAccessModules = () => [
  { value: 'files-clients', label: 'العملاء', module: 'clients' },
  { value: 'files-partners', label: 'المستثمرين', module: 'partners' },
  { value: 'files-loans', label: 'السلف', module: 'loans' },
  { value: 'files-repayments', label: 'الدفعات', module: 'repayments' },
  { value: 'files-expenses', label: 'المصروفات', module: 'expenses' },
  { value: 'files-partners-withdraw', label: 'الانسحابات', module: 'partners-withdraw' },
  { value: 'files-zakat', label: 'الزكاة', module: 'zakat' },
];
export default routes;