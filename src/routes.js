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

const Dashboard = React.lazy(() => import('./pages/Dashboard'));
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
const Logs = React.lazy(() => import('./pages/Logs/Logs'));

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
    label: 'الموظفين',
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
    label: 'الأدوار',
    icon: Security,
    module: 'roles',
    requiresPermissions: true,
    parent: 'إدارة المستخدمين'
  },

  // العملاء والمستثمرين مجموعة واحدة
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
    path: '/investors',
    element: Investors,
    protected: true,
    showInSidebar: true,
    label: 'المستثمرين',
    icon: TrendingUp,
    module: 'partners',
    requiresPermissions: true,
    parent: 'إدارة العملاء'
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

  // المالية مجموعة واحدة
  {
    path: '/loans',
    element: Loans,
    protected: true,
    showInSidebar: true,
    label: 'السلف',
    icon: LoanIcon,
    module: 'loans',
    requiresPermissions: true,
    parent: 'إدارة المالية'
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
    parent: 'إدارة المالية'
  },
  {
    path: '/installments',
    element: Installments,
    protected: true,
    showInSidebar: true,
    label: 'القسط',
    module: 'repayments',
    requiresPermissions: true,
    icon: InstallmentsIcon,
    parent: 'إدارة المالية'
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
    parent: 'إدارة المالية'
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