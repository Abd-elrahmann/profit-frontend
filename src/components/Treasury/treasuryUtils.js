export const getMonthName = (monthKey) => {
  try {
    const [year, month] = monthKey.split('-');
    const monthNames = [
      'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
      'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر',
    ];
    const monthIndex = parseInt(month) - 1;
    if (monthIndex >= 0 && monthIndex < 12) {
      return `${monthNames[monthIndex]} ${year}`;
    }
    return monthKey;
  } catch (error) {
    console.error('Error getting month name:', error);
    return monthKey;
  }
};

const mergeChildAccountsJournalsByMonth = (childAccounts) => {
  if (!Array.isArray(childAccounts) || childAccounts.length === 0) {
    return {};
  }
  const merged = {};
  for (const child of childAccounts) {
    const jbm = child?.journalsByMonth;
    if (!jbm || typeof jbm !== 'object') continue;
    for (const [monthKey, monthData] of Object.entries(jbm)) {
      if (!merged[monthKey]) {
        merged[monthKey] = { entries: [] };
      }
      const entries = monthData?.entries;
      if (Array.isArray(entries)) {
        merged[monthKey].entries.push(...entries);
      }
    }
  }
  for (const monthKey of Object.keys(merged)) {
    const byId = new Map();
    for (const e of merged[monthKey].entries) {
      if (e && e.id != null && !byId.has(e.id)) {
        byId.set(e.id, e);
      }
    }
    const chronological = Array.from(byId.values()).sort(
      (a, b) => new Date(a.date) - new Date(b.date)
    );
    merged[monthKey].totalDebit = chronological.reduce(
      (s, e) => s + (Number(e.debit) || 0),
      0
    );
    merged[monthKey].totalCredit = chronological.reduce(
      (s, e) => s + (Number(e.credit) || 0),
      0
    );
    let apiMonthBalanceSum = 0;
    let hasApiMonthBalance = false;
    for (const child of childAccounts) {
      const tb = child?.journalsByMonth?.[monthKey]?.totalBalance;
      if (tb != null && tb !== '') {
        apiMonthBalanceSum += Number(tb);
        hasApiMonthBalance = true;
      }
    }
    merged[monthKey].totalBalance = hasApiMonthBalance
      ? apiMonthBalanceSum
      : chronological.length > 0
        ? Number(chronological[chronological.length - 1].balance) || 0
        : 0;
    merged[monthKey].entries = chronological
      .slice()
      .sort((a, b) => new Date(b.date) - new Date(a.date));
  }
  return merged;
};

/** يدعم الاستجابة القديمة (journalsByMonth على الجذر) أو الجديدة (داخل childAccounts) */
export const getJournalsByMonthResolved = (currentData) => {
  if (!currentData) return null;
  const root = currentData.journalsByMonth;
  if (root && typeof root === 'object' && Object.keys(root).length > 0) {
    return root;
  }
  const fromChildren = mergeChildAccountsJournalsByMonth(currentData.childAccounts);
  return Object.keys(fromChildren).length > 0 ? fromChildren : null;
};

export const getCurrentJournals = (currentData, monthParam) => {
  const jbm = getJournalsByMonthResolved(currentData);
  if (!jbm) return [];
  if (monthParam && jbm[monthParam]) {
    const entries = jbm[monthParam].entries || [];
    return [...entries].sort((a, b) => new Date(b.date) - new Date(a.date));
  }
  return Object.values(jbm)
    .flatMap((month) => month.entries || [])
    .sort((a, b) => new Date(b.date) - new Date(a.date));
};

/** إجماليات شهر محدد كما ترجع من الـ API (مدين/دائن/رصيد ختامي للشهر) */
export const getLedgerMonthFooterTotals = (currentData, monthParam) => {
  const jbm = getJournalsByMonthResolved(currentData);
  if (!monthParam || !jbm?.[monthParam]) return null;
  const b = jbm[monthParam];
  if (
    b.totalDebit == null &&
    b.totalCredit == null &&
    b.totalBalance == null
  ) {
    return null;
  }
  return {
    totalDebit: Number(b.totalDebit) || 0,
    totalCredit: Number(b.totalCredit) || 0,
    totalBalance: Number(b.totalBalance) || 0,
  };
};
