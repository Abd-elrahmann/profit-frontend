import React from 'react';
import {
  MdDashboard as DashboardIcon,
  MdPeople as People,
  MdAccountBalance as AccountBalance,
  MdTrendingUp as TrendingUp,
  MdAssessment as Assessment,
  MdSettings as Settings,
  MdSecurity as Security,
  MdBadge as Badge,
  MdDescription as Contract
} from 'react-icons/md';

const Dashboard = React.lazy(() => import('./pages/Dashboard'));
const Login = React.lazy(() => import('./pages/auth/Login'));
const Employees = React.lazy(() => import('./pages/Employees/Employees'));
const Roles = React.lazy(() => import('./pages/Roles/Roles'));
const Clients = React.lazy(() => import('./pages/Clients/Clients'));
const ContractTemplates = React.lazy(() => import('./pages/Templates/ContractTemplates'));
const routes = [
  // Public routes
  {
    path: '/login',
    element: Login,
    protected: false,
    showInSidebar: false
  },
 
  // Protected routes
  {
    path: '/dashboard',
    element: Dashboard,
    protected: true,
    showInSidebar: true,
    label: 'لوحة التحكم',
    icon: DashboardIcon,
    module: 'dashboard',
    requiresPermissions: false // Dashboard doesn't need CRUD permissions
  },

  {
    path: '/employees',
    element: Employees,
    protected: true,
    showInSidebar: true,
    label: 'الموظفين',
    icon: Badge,
    module: 'users',
    requiresPermissions: true
  },
  {
    path: '/roles',
    element: Roles,
    protected: true,
    showInSidebar: true,
    label: 'الأدوار',
    icon: Security,
    module: 'roles',
    requiresPermissions: true
  },
  {
    path: '/clients',
    element: Clients,
    protected: true,
    showInSidebar: true,
    label: 'العملاء',
    icon: People,
    module: 'clients',
    requiresPermissions: true
  },
  {
    path: '/contract-templates',
    element: ContractTemplates,
    protected: true,
    showInSidebar: true,
    label: 'القوالب القانونية',
    icon: Contract,
    module: 'contract-templates',
    requiresPermissions: true
  },
];

export const getSidebarMenuItems = () => {
  return routes.filter(route => route.showInSidebar && route.protected);
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
