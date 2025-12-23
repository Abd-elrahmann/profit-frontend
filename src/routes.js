import React from 'react';
import {
  MdDashboard as DashboardIcon,
  MdPeople as People,
  MdAccountBalance as AccountBalance,
  MdTrendingUp as TrendingUp,
  MdSecurity as Security,
  MdBadge as Badge,
  MdDescription as Contract,
  MdEngineering as EngineeringIcon,
  MdBusinessCenter as BusinessCenterIcon,
  MdReceiptLong as ReceiptLongIcon,
  MdCalculate as AccountingIcon,
  MdAccountBalanceWallet as FinancialOpsIcon,
  MdAnalytics as AnalyticsIcon,
  MdMosque as ZakatIcon,
  MdArticle as ArticleIcon,
  MdAccountBalanceWallet as TreasuryIcon,
  MdPieChart as ProfitDistributionIcon,
  MdBusiness as CompanyProfitIcon,
  MdPersonSearch as InvestorsIcon,
  MdAdminPanelSettings as AdminPanelIcon,
  MdPayment as PaymentIcon,
  MdAccountBalance as IncomeStatementIcon,
} from 'react-icons/md';
import { History as HistoryIcon } from '@mui/icons-material';
import { MdAttachMoney as LoanIcon } from 'react-icons/md';
import { MdAttachMoney as InstallmentsIcon } from 'react-icons/md';
import { MdMessage as Message } from 'react-icons/md';
import { MdDescription as JournalIcon } from 'react-icons/md';
import { CalendarMonth as CalendarMonthIcon } from '@mui/icons-material';
import { Savings as SavingsIcon } from '@mui/icons-material';
import { MdReceipt as ReceiptIcon } from 'react-icons/md';

const Dashboard = React.lazy(() => import('./pages/dashboard/Dashboard'));
const Login = React.lazy(() => import('./pages/auth/Login'));
const Employees = React.lazy(() => import('./pages/Employees/Employees'));
const Roles = React.lazy(() => import('./pages/Roles/Roles'));
const Clients = React.lazy(() => import('./pages/Clients/Clients'));
const ContractTemplates = React.lazy(() => import('./pages/Templates/ContractTemplates'));  
const Investors = React.lazy(() => import('./pages/Investors/Investors'));
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
    label: 'لوحة التحكم',
    icon: DashboardIcon,
    module: 'dashboard',
    requiresPermissions: true,
    color: '#2196F3' // Blue
  },

  {
    path: '/logs',
    element: Logs,
    protected: true,
    showInSidebar: true,
    label: 'السجلات',
    module: 'logs',
    requiresPermissions: true,
    icon: HistoryIcon,
    color: '#FF9800' // Orange
  },

  {
    path: '/employees',
    element: Employees,
    protected: true,
    showInSidebar: true,
    label: 'الموظفين',
    icon: Badge,
    module: 'users',
    requiresPermissions: true,
    parent: 'إدارة الموظفين'
  },
  {
    path: '/roles',
    element: Roles,
    protected: true,
    showInSidebar: true,
    label: 'الصلاحيات',
    icon: AdminPanelIcon,
    module: 'roles',
    requiresPermissions: true,
    parent: 'إدارة الموظفين'
  },

  {
    path: '/clients',
    element: Clients,
    protected: true,
    showInSidebar: true,
    label: 'العملاء',
    icon: People,
    module: 'clients',
    requiresPermissions: true,
    parent: 'إدارة العملاء'
  },
  {
    path: '/client-collections',
    element: ClientCollections,
    protected: true,
    showInSidebar: true,
    label: 'كشف التحصيلات ',
    icon: ReceiptLongIcon,
    module: 'client-report',
    requiresPermissions: true,
    parent: 'إدارة العملاء'
  },

  {
    path: '/investors',
    element: Investors,
    protected: true,
    showInSidebar: true,
    label: 'المستثمرين',
    icon: InvestorsIcon,
    module: 'partners',
    requiresPermissions: true,
    parent: 'إدارة المستثمرين'
  },
  {
    path: '/investors-withdraw',
    element: InvestorsWithdrawal,
    protected: true,
    showInSidebar: true,
    module: 'partners-withdraw',
    label: 'الانسحابات',
    icon: PaymentIcon,
    requiresPermissions: true,
    parent: 'إدارة المستثمرين'
  },

  {
    path: '/expenses',
    element: Expenses,
    protected: true,
    showInSidebar: true,
    label: 'المصروفات',
    module: 'expenses',
    requiresPermissions: true,
    icon: ReceiptIcon,
    parent: 'ادارة المصروفات'
  },

  {
    path: '/income-statement',
    element: IncomeStatement,
    protected: true,
    showInSidebar: true,
    label: 'قائمة الدخل',
    module: 'income-statement',
    requiresPermissions: true,
    icon: IncomeStatementIcon,
    parent: 'القوائم المالية'
  },
  {
    path: '/chart-of-accounts',
    element: ChartOfAccounts,
    protected: true,
    showInSidebar: true,
    label: 'شجرة الحسابات',
    icon: AccountBalance,
    module: 'accounts',
    requiresPermissions: true,
    parent: 'المحاسبة المالية'
  },
  {
    path: '/journal-entries',
    element: Journals,
    protected: true,
    showInSidebar: true,
    label: 'القيود اليومية',
    module: 'journals',
    requiresPermissions: true,
    icon: JournalIcon,
    parent: 'المحاسبة المالية'
  },
  {
    path: '/general-ledger',
    element: GeneralLedger,
    protected: true,
    showInSidebar: true,
    label: 'دفتر الأستاذ العام',
    module: 'general-ledger',
    requiresPermissions: true,
    icon: JournalIcon,
    parent: 'المحاسبة المالية'
  },
  {
    path: '/period-closing',
    element: PeriodClosing,
    protected: true,
    showInSidebar: true,
    label: 'إقفال الفترات',
    module: 'period',
    requiresPermissions: true,
    icon: CalendarMonthIcon,
    parent: 'القوائم المالية'
  },

  {
    path: '/loans',
    element: Loans,
    protected: true,
    showInSidebar: true,
    label: 'السلفات',
    icon: LoanIcon,
    module: 'loans',
    requiresPermissions: true,
    parent: 'العمليات المالية'
  },
  {
    path: '/banks',
    element: Banks,
    protected: true,
    showInSidebar: true,
    label: 'الحسابات البنكية',
    icon: AccountBalance,
    module: 'banks',
    requiresPermissions: true,
    parent: 'العمليات المالية'
  },
  {
    path: '/installments',
    element: Installments,
    protected: true,
    showInSidebar: true,
    label: 'الدفعات',
    module: 'repayments',
    requiresPermissions: true,
    icon: InstallmentsIcon,
    parent: 'العمليات المالية'
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
    label: 'الصندوق',
    module: 'treasury',
    requiresPermissions: true,
    icon: TreasuryIcon,
    parent: 'العمليات المالية'
  },

  {
    path: '/company-profit',
    element: CompanyProfit,
    protected: true,
    showInSidebar: true,
    label: 'أرباح الشركة',
    module: 'company',
    requiresPermissions: true,
    icon: CompanyProfitIcon,
    parent: 'القوائم المالية'
  },
  {
    path: '/profit-distribution',
    element: ProfitDistribution,
    protected: true,
    showInSidebar: true,
    label: 'توزيع الأرباح',
    module: 'distribution',
    icon: ProfitDistributionIcon,
    requiresPermissions: true,
    parent: 'القوائم المالية'
  },

  {
    path: '/zakah',
    element: Zakah,
    protected: true,
    showInSidebar: true,
    label: 'الزكاة',
    module: 'zakat',
    requiresPermissions: true,
    icon: AccountBalance,
    parent: 'الزكاة والادخار'
  },
  {
    path: '/saving',
    element: Saving,
    protected: true,
    showInSidebar: true,
    label: 'الادخار',
    module: 'saving',
    requiresPermissions: true,
    icon: SavingsIcon,
    parent: 'الزكاة والادخار'
  },

  {
    path: '/contract-templates',
    element: ContractTemplates,
    protected: true,
    showInSidebar: true,
    label: 'القوالب العقدية',
    icon: Contract,
    module: 'templates',
    requiresPermissions: true,
    parent: 'القوالب'
  },
  {
    path: '/messages-templates',
    element: MessagesTemplates,
    protected: true,
    showInSidebar: true,
    label: 'قوالب الرسائل',
    icon: Message,
    module: 'templates',
    requiresPermissions: true,
    parent: 'القوالب'
  },
  {
    path: '/profile',
    element: Profile,
    protected: true,
    showInSidebar: false,
    requiresPermissions: false
  }
];

export const getSidebarMenuItems = () => {
  const routesWithParent = routes.filter(route => route.showInSidebar && route.protected);
  
  const parentOrder = [
    'إدارة الموظفين',
    'إدارة العملاء',
    'إدارة المستثمرين',
    'ادارة المصروفات',
    'المحاسبة المالية',
    'العمليات المالية',
    'القوائم المالية',
    'الزكاة والادخار',
    'القوالب'
  ];

  const parentIcons = {
    'إدارة الموظفين': EngineeringIcon,
    'إدارة العملاء': People,
    'إدارة المستثمرين': BusinessCenterIcon,
    'ادارة المصروفات': ReceiptLongIcon,
    'المحاسبة المالية': AccountingIcon,
    'العمليات المالية': FinancialOpsIcon,
    'القوائم المالية': AnalyticsIcon,
    'الزكاة والادخار': ZakatIcon,
    'القوالب': ArticleIcon,
  };

  const parentColors = {
    'إدارة الموظفين': '#D84315', // Dark Orange
    'إدارة العملاء': '#00897B', // Dark Teal
    'إدارة المستثمرين': '#1565C0', // Dark Blue
    'ادارة المصروفات': '#F57C00', // Dark Orange-Yellow
    'المحاسبة المالية': '#7B1FA2', // Dark Purple
    'العمليات المالية': '#C62828', // Dark Red
    'القوائم المالية': '#2E7D32', // Dark Green
    'الزكاة والادخار': '#6A1B9A', // Dark Purple
    'القوالب': '#424242', // Dark Gray
  };
  
  const groupedItems = {};
  const singleItems = [];
  
  routesWithParent.forEach(route => {
    if (route.parent) {
      if (!groupedItems[route.parent]) {
        groupedItems[route.parent] = {
          label: route.parent,
          children: [],
          icon: parentIcons[route.parent],
          color: parentColors[route.parent]
        };
      }
      groupedItems[route.parent].children.push(route);
    } else {
      singleItems.push(route);
    }
  });
  
  const result = [];
  
  singleItems.forEach(item => {
    result.push(item);
  });
  
  parentOrder.forEach(parentLabel => {
    if (groupedItems[parentLabel]) {
      result.push(groupedItems[parentLabel]);
    }
  });
  
  Object.keys(groupedItems).forEach(parentLabel => {
    if (!parentOrder.includes(parentLabel)) {
      result.push(groupedItems[parentLabel]);
    }
  });
  
  return result;
};

export const getAvailableModules = () => {
  return routes
    .filter(route => route.protected && route.requiresPermissions && route.label && route.showInSidebar)
    .map(route => ({
      value: route.module,
      label: route.label
    }));
};

export default routes;