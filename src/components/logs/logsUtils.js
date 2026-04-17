export const getActionText = (action) => {
  const map = {
    CREATE: 'إنشاء',
    UPDATE: 'تعديل',
    DELETE: 'حذف',
    VIEW: 'عرض',
    POST: 'اعتماد',
    UNPOST: 'إلغاء الاعتماد',
    login: 'تسجيل دخول',
    logout: 'تسجيل خروج',
  };
  return map[action] || action;
};
export const getActionColor = (action) => {
  const map = {
    CREATE: 'success',
    UPDATE: 'warning',
    DELETE: 'error',
    VIEW: 'info',
    POST: 'success',
    UNPOST: 'error',
    login: 'primary',
    logout: 'secondary',
  };
  return map[action] || 'default';
};
export const getScreenText = (screen) => {
  const screenTranslations = {
    Auth: 'المصادقة',
    Dashboard: 'لوحة التحكم',
    Logs: 'السجلات',
    Users: 'الموظفين',
    Employees: 'الموظفين',
    Roles: 'الصلاحيات',
    Clients: 'العملاء',
    'Client Collections': 'كشف التحصيلات',
    Partners: 'المستثمرين',
    Investors: 'المستثمرين',
    PartnerWithdrawals: 'الانسحابات',
    Expenses: 'المصروفات',
    'Income Statement': 'قائمة الدخل',
    'Chart of Accounts': 'دليل الحسابات',
    Journals: 'القيود اليومية',
    'Journal Entries': 'القيود اليومية',
    'General Ledger': 'دفتر الأستاذ العام',
    Period: 'إقفال الفترات',
    Loans: 'السلف',
    Banks: 'الحسابات البنكية',
    'Bank Accounts': 'الحسابات البنكية',
    Repayments: 'الدفعات',
    Installments: 'الدفعات',
    Treasury: 'الصندوق',
    'Company Profit': 'أرباح الشركة',
    Distribution: 'توزيع الأرباح',
    'Profit Distribution': 'توزيع الأرباح',
    Zakah: 'الزكاة',
    Saving: 'الادخار',
    Templates: 'القوالب العقدية',
    'Contract Templates': 'القوالب العقدية',
    'Messages Templates': 'قوالب الرسائل',
    Profile: 'الملف الشخصي',
  };
  return screenTranslations[screen] || screen;
};
