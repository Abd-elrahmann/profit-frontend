// Separate sidebar configuration for better performance
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
  CalendarMonth as CalendarMonthIcon,
  Savings as SavingsIcon,
  Receipt as ReceiptIcon,
} from '@mui/icons-material';

export const parentOrder = [
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

export const parentIcons = {
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

export const parentColors = {
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

// Sidebar items configuration
export const sidebarItems = [
  {
    path: '/dashboard',
    label: 'لوحة التحكم',
    icon: DashboardIcon,
    module: 'dashboard',
    requiresPermissions: true,
    color: '#2196F3', // Blue
    parent: null
  },
  {
    path: '/logs',
    label: 'السجلات',
    module: 'logs',
    requiresPermissions: true,
    icon: HistoryIcon,
    color: '#FF9800', // Orange
    parent: null
  },
  {
    path: '/employees',
    label: 'الموظفين',
    icon: Badge,
    module: 'users',
    requiresPermissions: true,
    parent: 'إدارة الموظفين'
  },
  {
    path: '/roles',
    label: 'الصلاحيات',
    icon: AdminPanelIcon,
    module: 'roles',
    requiresPermissions: true,
    parent: 'إدارة الموظفين'
  },
  {
    path: '/clients',
    label: 'العملاء',
    icon: People,
    module: 'clients',
    requiresPermissions: true,
    parent: 'إدارة العملاء'
  },
  {
    path: '/client-collections',
    label: 'كشف التحصيلات ',
    icon: ReceiptLongIcon,
    module: 'client-report',
    requiresPermissions: true,
    parent: 'إدارة العملاء'
  },
  {
    path: '/investors',
    label: 'المستثمرين',
    icon: InvestorsIcon,
    module: 'partners',
    requiresPermissions: true,
    parent: 'إدارة المستثمرين'
  },
  {
    path: '/investors-withdraw',
    label: 'الانسحابات',
    icon: PaymentIcon,
    module: 'partners-withdraw',
    requiresPermissions: true,
    parent: 'إدارة المستثمرين'
  },
  {
    path: '/expenses',
    label: 'المصروفات',
    module: 'expenses',
    requiresPermissions: true,
    icon: ReceiptIcon,
    parent: 'ادارة المصروفات'
  },
  {
    path: '/income-statement',
    label: 'قائمة الدخل',
    module: 'income-statement',
    requiresPermissions: true,
    icon: IncomeStatementIcon,
    parent: 'القوائم المالية'
  },
  {
    path: '/chart-of-accounts',
    label: 'شجرة الحسابات',
    icon: AccountBalance,
    module: 'accounts',
    requiresPermissions: true,
    parent: 'المحاسبة المالية'
  },
  {
    path: '/journal-entries',
    label: 'القيود اليومية',
    module: 'journals',
    requiresPermissions: true,
    icon: JournalIcon,
    parent: 'المحاسبة المالية'
  },
  {
    path: '/general-ledger',
    label: 'دفتر الأستاذ العام',
    module: 'general-ledger',
    requiresPermissions: true,
    icon: JournalIcon,
    parent: 'المحاسبة المالية'
  },
  {
    path: '/period-closing',
    label: 'إقفال الفترات',
    module: 'period',
    requiresPermissions: true,
    icon: CalendarMonthIcon,
    parent: 'القوائم المالية'
  },
  {
    path: '/loans',
    label: 'السلف',
    icon: LoanIcon,
    module: 'loans',
    requiresPermissions: true,
    parent: 'العمليات المالية'
  },
  {
    path: '/banks',
    label: 'الحسابات البنكية',
    icon: AccountBalance,
    module: 'banks',
    requiresPermissions: true,
    parent: 'العمليات المالية'
  },
  {
    path: '/installments',
    label: 'الدفعات',
    module: 'repayments',
    requiresPermissions: true,
    icon: InstallmentsIcon,
    parent: 'العمليات المالية'
  },
  {
    path: '/treasury',
    label: 'الصندوق',
    module: 'treasury',
    requiresPermissions: true,
    icon: TreasuryIcon,
    parent: 'العمليات المالية'
  },
  {
    path: '/company-profit',
    label: 'أرباح الشركة',
    module: 'company',
    requiresPermissions: true,
    icon: CompanyProfitIcon,
    parent: 'القوائم المالية'
  },
  {
    path: '/profit-distribution',
    label: 'توزيع الأرباح',
    module: 'distribution',
    icon: ProfitDistributionIcon,
    requiresPermissions: true,
    parent: 'القوائم المالية'
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
    parent: 'القوالب'
  },
  {
    path: '/messages-templates',
    label: 'قوالب الرسائل',
    icon: Message,
    module: 'templates',
    requiresPermissions: true,
    parent: 'القوالب'
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
