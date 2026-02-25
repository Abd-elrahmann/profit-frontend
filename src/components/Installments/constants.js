export const REVIEW_STEPS = [
  'بإنتظار رفع الإيصال',
  'مراجعة الإيصال المرفوع',
  'إتمام العملية',
];

export const DEFAULT_EMPLOYEE_NAME = 'ربيش سالم ناصر الهمامي';

export const STATUS_FILTER_OPTIONS = [
  { value: 'ALL', label: 'الكل' },
  { value: 'PENDING', label: 'قيد الانتظار' },
  { value: 'PENDING_REVIEW', label: 'قيد المراجعة' },
  { value: 'PAID', label: 'مدفوع' },
  { value: 'PARTIAL_PAID', label: 'مدفوع جزئياً' },
  { value: 'EARLY_PAID', label: 'مدفوع مبكراً' },
  { value: 'COMPLETED', label: 'مكتمل' },
  { value: 'OVERDUE', label: 'متأخر' },
];
