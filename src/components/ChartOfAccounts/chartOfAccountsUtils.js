export const getAccountTypeLabel = (type) => {
  const typeMap = {
    ASSET: 'أصول',
    LIABILITY: 'التزامات',
    EQUITY: 'حقوق ملكية',
    REVENUE: 'إيرادات',
    EXPENSE: 'مصروفات',
  };
  return typeMap[type] || type;
};

export const getAccountTypeBadgeClass = (type) => {
  const classes = {
    ASSET: 'bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary',
    LIABILITY: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
    EQUITY: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
    REVENUE: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
    EXPENSE: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
  };
  return classes[type] || 'bg-slate-100 text-slate-700';
};

export const flattenAccountsTree = (accounts, depth = 0, expandedIds = new Set(), expandAll = false) => {
  const result = [];
  for (const account of accounts || []) {
    result.push({ ...account, _depth: depth });
    const hasChildren = account.children && account.children.length > 0;
    const shouldExpand = expandAll || expandedIds.has(account.id);
    if (hasChildren && shouldExpand) {
      result.push(...flattenAccountsTree(account.children, depth + 1, expandedIds, expandAll));
    }
  }
  return result;
};

export const generateChildCode = (parent) => {
  if (!parent.children || parent.children.length === 0) {
    const baseCode = parseInt(parent.code) || 0;
    return String(baseCode + 1000).padStart(5, '0');
  }
  const lastChild = parent.children[parent.children.length - 1];
  const lastCode = parseInt(lastChild.code) || 0;
  return String(lastCode + 100).padStart(5, '0');
};
