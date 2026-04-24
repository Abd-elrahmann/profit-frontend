import React from 'react';
import {
  Dashboard as DashboardIcon,
  People as People,
  AccountBalance as AccountBalance,
  TrendingUp as TrendingUp,
  Security as Security,
  Badge as Badge,
  Description as Contract,
  Engineering as EngineeringIcon,
  BusinessCenter as BusinessCenterIcon,
  ReceiptLong as ReceiptLongIcon,
  Calculate as AccountingIcon,
  AccountBalanceWallet as FinancialOpsIcon,
  Analytics as AnalyticsIcon,
  Mosque as ZakatIcon,
  Article as ArticleIcon,
  AccountBalanceWallet as TreasuryIcon,
  PieChart as ProfitDistributionIcon,
  Business as CompanyProfitIcon,
  PersonSearch as InvestorsIcon,
  AdminPanelSettings as AdminPanelIcon,
  Payment as PaymentIcon,
  AccountBalance as IncomeStatementIcon,
  History as HistoryIcon,
  AttachMoney as LoanIcon,
  AttachMoney as InstallmentsIcon,
  Message as Message,
  Description as JournalIcon,
  Balance as TrialBalanceIcon,
  Settings as SettingsIcon,
  CalendarMonth as CalendarMonthIcon,
  Savings as SavingsIcon,
  Receipt as ReceiptIcon,
  MoneyOff as MoneyOffIcon,
} from '@mui/icons-material';
export const parentOrder = [
  'الموظفين والصلاحيات',
  'العملاء والتحصيلات',
  'المستثمرين والانسحابات',
  'المصروفات والتعثرات',
  'الحسابات والقيود',
  'السلف والبنوك',
  'القوائم والأرباح',
  'الزكاة والادخار',
  'القوالب والرسائل'
];
export const parentIcons = {
  'الموظفين والصلاحيات': EngineeringIcon,
  'العملاء والتحصيلات': People,
  'المستثمرين والانسحابات': BusinessCenterIcon,
  'المصروفات والتعثرات': ReceiptLongIcon,
  'الحسابات والقيود': AccountingIcon,
  'السلف والبنوك': FinancialOpsIcon,
  'القوائم والأرباح': AnalyticsIcon,
  'الزكاة والادخار': ZakatIcon,
  'القوالب والرسائل': ArticleIcon,
};
export const parentColors = {
  'الموظفين والصلاحيات': '#D84315', 
  'العملاء والتحصيلات': '#00897B', 
  'المستثمرين والانسحابات': '#1565C0', 
  'المصروفات والتعثرات': '#F57C00', 
  'الحسابات والقيود': '#7B1FA2', 
  'السلف والبنوك': '#C62828', 
  'القوائم والأرباح': '#2E7D32', 
  'الزكاة والادخار': '#6A1B9A', 
  'القوالب والرسائل': '#424242', 
};
export const sidebarItems = [
  {
    path: '/dashboard',
    label: 'لوحة التحكم',
    icon: DashboardIcon,
    module: 'dashboard',
    requiresPermissions: true,
    color: '#2196F3', 
    parent: null
  },
  {
    path: '/logs',
    label: 'السجلات',
    module: 'logs',
    requiresPermissions: true,
    icon: HistoryIcon,
    color: '#FF9800', 
    parent: null
  },
  {
    path: '/settings',
    label: 'الإعدادات',
    module: 'settings',
    requiresPermissions: true,
    icon: SettingsIcon,
    color: '#5C6BC0',
    parent: null
  },
  {
    path: '/employees',
    label: 'الموظفين',
    icon: Badge,
    module: 'users',
    requiresPermissions: true,
    parent: 'الموظفين والصلاحيات'
  },
  {
    path: '/roles',
    label: 'الصلاحيات',
    icon: AdminPanelIcon,
    module: 'roles',
    requiresPermissions: true,
    parent: 'الموظفين والصلاحيات'
  },
  {
    path: '/clients',
    label: 'العملاء',
    icon: People,
    module: 'clients',
    requiresPermissions: true,
    parent: 'العملاء والتحصيلات'
  },
  {
    path: '/client-collections',
    label: 'كشف التحصيلات ',
    icon: ReceiptLongIcon,
    module: 'client-report',
    requiresPermissions: true,
    parent: 'العملاء والتحصيلات'
  },
  {
    path: '/investors',
    label: 'المستثمرين',
    icon: InvestorsIcon,
    module: 'partners',
    requiresPermissions: true,
    parent: 'المستثمرين والانسحابات'
  },
  {
    path: '/investors-withdraw',
    label: 'الانسحابات',
    icon: PaymentIcon,
    module: 'partners-withdraw',
    requiresPermissions: true,
    parent: 'المستثمرين والانسحابات'
  },
  {
    path: '/expenses',
    label: 'المصروفات',
    module: 'expenses',
    requiresPermissions: true,
    icon: ReceiptIcon,
    parent: 'المصروفات والتعثرات'
  },
  {
    path: '/delinquencies',
    label: 'التعثرات',
    module: 'loss',
    requiresPermissions: true,
    icon: MoneyOffIcon,
    parent: 'المصروفات والتعثرات'
  },
  {
    path: '/income-statement',
    label: 'قائمة الدخل',
    module: 'income-statement',
    requiresPermissions: true,
    icon: IncomeStatementIcon,
    parent: 'القوائم والأرباح'
  },
  {
    path: '/chart-of-accounts',
    label: 'دليل الحسابات',
    icon: AccountBalance,
    module: 'accounts',
    requiresPermissions: true,
    parent: 'الحسابات والقيود'
  },
  {
    path: '/journal-entries',
    label: 'القيود اليومية',
    module: 'journals',
    requiresPermissions: true,
    icon: JournalIcon,
    parent: 'الحسابات والقيود'
  },
  {
    path: '/general-ledger',
    label: 'دفتر الأستاذ العام',
    module: 'general-ledger',
    requiresPermissions: true,
    icon: JournalIcon,
    parent: 'الحسابات والقيود'
  },
  {
    path: '/trial-balance',
    label: 'ميزان المراجعة',
    module: 'trial-balance',
    requiresPermissions: true,
    icon: TrialBalanceIcon,
    parent: 'الحسابات والقيود'
  },
  {
    path: '/period-closing',
    label: 'إقفال الفترات',
    module: 'period',
    requiresPermissions: true,
    icon: CalendarMonthIcon,
    parent: 'القوائم والأرباح'
  },
  {
    path: '/loans',
    label: 'السلف',
    icon: LoanIcon,
    module: 'loans',
    requiresPermissions: true,
    parent: 'السلف والبنوك'
  },
  {
    path: '/banks',
    label: 'الحسابات البنكية',
    icon: AccountBalance,
    module: 'banks',
    requiresPermissions: true,
    parent: 'السلف والبنوك'
  },
  {
    path: '/installments',
    label: 'الدفعات',
    module: 'repayments',
    requiresPermissions: true,
    icon: InstallmentsIcon,
    parent: 'السلف والبنوك'
  },
  {
    path: '/treasury',
    label: 'الصندوق',
    module: 'treasury',
    requiresPermissions: true,
    icon: TreasuryIcon,
    parent: 'السلف والبنوك'
  },
  {
    path: '/company-profit',
    label: 'أرباح الشركة',
    module: 'company',
    requiresPermissions: true,
    icon: CompanyProfitIcon,
    parent: 'القوائم والأرباح'
  },
  {
    path: '/external-investments',
    label: 'الأرباح الخارجية',
    module: 'external-investments',
    requiresPermissions: true,
    icon: TrendingUp,
    parent: 'القوائم والأرباح'
  },
  {
    path: '/profit-distribution',
    label: 'توزيع الأرباح',
    module: 'distribution',
    icon: ProfitDistributionIcon,
    requiresPermissions: true,
    parent: 'القوائم والأرباح'
  },
  {
    path: '/zakah',
    label: 'الزكاة',
    module: 'zakat',
    requiresPermissions: true,
    icon: AccountBalance,
    parent: 'الزكاة والادخار'
  },
  {
    path: '/saving',
    label: 'الادخار',
    module: 'saving',
    requiresPermissions: true,
    icon: SavingsIcon,
    parent: 'الزكاة والادخار'
  },
  {
    path: '/contract-templates',
    label: 'القوالب العقدية',
    icon: Contract,
    module: 'templates',
    requiresPermissions: true,
    parent: 'القوالب والرسائل'
  },
  {
    path: '/messages-templates',
    label: 'قوالب الرسائل',
    icon: Message,
    module: 'templates',
    requiresPermissions: true,
    parent: 'القوالب والرسائل'
  }
];
export const getSidebarMenuItems = () => {
  const groupedItems = {};
  const singleItems = [];
  sidebarItems.forEach(item => {
    if (item.parent) {
      if (!groupedItems[item.parent]) {
        groupedItems[item.parent] = {
          label: item.parent,
          children: [],
          icon: parentIcons[item.parent],
          color: parentColors[item.parent]
        };
      }
      groupedItems[item.parent].children.push(item);
    } else {
      singleItems.push(item);
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
