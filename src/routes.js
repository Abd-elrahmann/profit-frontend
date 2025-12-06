import React from 'react';
import {
  MdDashboard as DashboardIcon,
  MdPeople as People,
  MdAccountBalance as AccountBalance,
  MdTrendingUp as TrendingUp,
  MdSecurity as Security,
  MdBadge as Badge,
  MdDescription as Contract,
} from 'react-icons/md';
import { History as HistoryIcon } from '@mui/icons-material';
import { MdAttachMoney as LoanIcon } from 'react-icons/md';
import { MdAttachMoney as InstallmentsIcon } from 'react-icons/md';
import { MdMessage as Message } from 'react-icons/md';
import { MdDescription as JournalIcon } from 'react-icons/md';
import { CalendarMonth as CalendarMonthIcon } from '@mui/icons-material';
import { Savings as SavingsIcon } from '@mui/icons-material';
import { ReceiptLong as ReceiptLongIcon } from '@mui/icons-material';

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
    requiresPermissions: true
  },

  // صفحات فردية بدون أب
  {
    path: '/logs',
    element: Logs,
    protected: true,
    showInSidebar: true,
    label: 'السجلات',
    module: 'logs',
    requiresPermissions: true,
    icon: HistoryIcon,
  },

  // الموظفين والأدوار مجموعة واحدة
  {
    path: '/employees',
    element: Employees,
    protected: true,
    showInSidebar: true,
    label: 'المسؤولين',
    icon: Badge,
    module: 'users',
    requiresPermissions: true,
    parent: 'إدارة المستخدمين'
  },
  {
    path: '/roles',
    element: Roles,
    protected: true,
    showInSidebar: true,
    label: 'الصلاحيات',
    icon: Security,
    module: 'roles',
    requiresPermissions: true,
    parent: 'إدارة المستخدمين'
  },

  // العملاء مجموعة منفصلة
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
    label: 'كشف تحصيلات العملاء',
    icon: ReceiptLongIcon,
    module: 'client-report',
    requiresPermissions: true,
    parent: 'إدارة العملاء'
  },

  // المستثمرين مجموعة منفصلة
  {
    path: '/investors',
    element: Investors,
    protected: true,
    showInSidebar: true,
    label: 'المستثمرين',
    icon: TrendingUp,
    module: 'partners',
    requiresPermissions: true,
    parent: 'إدارة المستثمرين'
  },

  // القوالب مجموعة واحدة
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

  // المحاسبة المالية
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
    module: 'generalLedger',
    requiresPermissions: true,
    icon: JournalIcon,
    parent: 'المحاسبة المالية'
  },
  {
    path: '/period-closing',
    element: PeriodClosing,
    protected: true,
    showInSidebar: true,
    label: 'تقفيل الفترات',
    module: 'period',
    requiresPermissions: true,
    icon: CalendarMonthIcon,
    parent: 'المحاسبة المالية'
  },

  // العمليات المالية
  {
    path: '/loans',
    element: Loans,
    protected: true,
    showInSidebar: true,
    label: 'السلف',
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
    label: 'البنوك',
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
    icon: AccountBalance,
    parent: 'العمليات المالية'
  },

  // الأرباح والتقارير
  {
    path: '/company-profit',
    element: CompanyProfit,
    protected: true,
    showInSidebar: true,
    label: 'أرباح الشركة',
    module: 'company',
    requiresPermissions: true,
    icon: AccountBalance,
    parent: 'الأرباح والتقارير'
  },
  {
    path: '/profit-distribution',
    element: ProfitDistribution,
    protected: true,
    showInSidebar: true,
    label: 'توزيع الأرباح',
    module: 'distribution',
    icon: AccountBalance,
    requiresPermissions: true,
    parent: 'الأرباح والتقارير'
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
    path: '/profile',
    element: Profile,
    protected: true,
    showInSidebar: false,
    requiresPermissions: false
  }
];

export const getSidebarMenuItems = () => {
  const routesWithParent = routes.filter(route => route.showInSidebar && route.protected);
  
  // تجميع العناصر حسب الأب
  const groupedItems = {};
  const singleItems = [];
  
  routesWithParent.forEach(route => {
    if (route.parent) {
      if (!groupedItems[route.parent]) {
        groupedItems[route.parent] = {
          label: route.parent,
          children: []
        };
      }
      groupedItems[route.parent].children.push(route);
    } else {
      singleItems.push(route);
    }
  });
  
  // تحويل الكائن إلى مصفوفة وإضافة العناصر الفردية
  const result = [];
  
  // إضافة المجموعات
  Object.values(groupedItems).forEach(group => {
    result.push(group);
  });
  
  // إضافة العناصر الفردية
  singleItems.forEach(item => {
    result.push(item);
  });
  
  return result;
};

export const getAvailableModules = () => {
  return routes
    .filter(route => route.protected && route.module && route.requiresPermissions)
    .map(route => ({
      value: route.module,
      label: route.label
    }));
};

export default routes;