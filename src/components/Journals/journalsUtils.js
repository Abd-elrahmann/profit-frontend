export const flattenAccountsTree = (accounts) => {
  if (!accounts || !Array.isArray(accounts)) return [];
  const flattened = [];
  const traverse = (account) => {
    if (!account) return;
    const { children: _children, ...accountWithoutChildren } = account;
    flattened.push(accountWithoutChildren);
    if (account.children && Array.isArray(account.children)) {
      account.children.forEach((child) => traverse(child));
    }
  };
  accounts.forEach((account) => traverse(account));
  return flattened;
};
export const isJournalBalanced = (debit, credit) => {
  const difference = Math.abs(debit - credit);
  return difference < 0.01;
};
const JOURNAL_SOURCE_TYPE_LABELS = {
  LOAN: "سلفة",
  SMALL_LOAN: "سلفة صغيرة",
  REPAYMENT: "سداد دفعة",
  LOAN_INTEREST: "فوائد سلفة",
  LOAN_CONVERSION: "نقل مديونية",
  PARTNER: "انضمام شريك",
  PERIOD_CLOSING: "إقفال فترة",
  PARTNER_TRANSACTION_WITHDRAWAL: "سحب مالي لشريك",
  COMPANY_PROFIT_WITHDRAWAL: "سحب ربح شركة",
  PARTNER_TRANSACTION_DEPOSIT: "إيداع مالي لشريك",
  PARTNER_PROFIT_WITHDRAWAL: "سحب ارباح شريك",
  PARTNER_SAVING_WITHDRAWAL: "سحب ادخار شريك",
  EXPENSES: "مصروف",
  LOSSES: "خسائر",
  SAVING: "ادخار",
  PARTNER_WITHDRAWING: "انسحاب مالي لشريك",
  ZAKAT: "سحب زكاة",
  CLIENT: "عميل",
  EXTERNAL_PROFIT: "ربح خارجي",
  OTHER: "أخرى",
};

/** ترتيب يطابق enum JournalSourceType في Prisma */
export const JOURNAL_SOURCE_TYPE_OPTIONS = [
  "LOAN",
  "REPAYMENT",
  "PARTNER",
  "PARTNER_TRANSACTION_WITHDRAWAL",
  "PARTNER_TRANSACTION_DEPOSIT",
  "PARTNER_PROFIT_WITHDRAWAL",
  "PARTNER_SAVING_WITHDRAWAL",
  "PERIOD_CLOSING",
  "ZAKAT",
  "SAVING",
  "COMPANY_PROFIT_WITHDRAWAL",
  "EXPENSES",
  "LOSSES",
  "PARTNER_WITHDRAWING",
  "SMALL_LOAN",
  "LOAN_CONVERSION",
  "LOAN_INTEREST",
  "CLIENT",
  "EXTERNAL_PROFIT",
  "OTHER",
].map((value) => ({ value, label: JOURNAL_SOURCE_TYPE_LABELS[value] }));

export const getJournalSourceTypeText = (sourceType) => {
  return JOURNAL_SOURCE_TYPE_LABELS[sourceType] || sourceType || "-";
};
export const getStatusText = (status) => {
  const statusMap = {
    DRAFT: "غير معتمد",
    POSTED: "معتمد",
  };
  return statusMap[status] || status;
};
export const getStatusColor = (status) => {
  switch (status) {
    case "DRAFT":
      return "warning";
    case "POSTED":
      return "success";
    default:
      return "default";
  }
};
export const getJournalTypeText = (type) => {
  const typeMap = {
    GENERAL: "عام",
    OPENING: "افتتاحي",
    CLOSING: "ختامي",
    ADJUSTMENT: "تسوية",
  };
  return typeMap[type] || type || "-";
};
export const calculateTotalsForTable = (journalData, journalLines) => {
  if (journalData?.totals) {
    return journalData.totals;
  }
  const totalDebit = journalLines.reduce(
    (sum, line) => sum + (line.debit || 0),
    0
  );
  const totalCredit = journalLines.reduce(
    (sum, line) => sum + (line.credit || 0),
    0
  );
  const totalBalance = totalDebit - totalCredit;
  return { totalDebit, totalCredit, totalBalance };
};
export const calculateTotals = (
  journalData,
  journalLines,
  editingLineIndex,
  currentLine
) => {
  if (journalData?.totals) {
    return journalData.totals;
  }
  let totalDebit = 0;
  let totalCredit = 0;
  if (editingLineIndex !== null && journalLines[editingLineIndex]) {
    journalLines.forEach((line, index) => {
      if (index !== editingLineIndex) {
        totalDebit += line.debit || 0;
        totalCredit += line.credit || 0;
      }
    });
    if (currentLine) {
      totalDebit += currentLine.debit || 0;
      totalCredit += currentLine.credit || 0;
    }
  } else {
    totalDebit = journalLines.reduce(
      (sum, line) => sum + (line.debit || 0),
      0
    );
    totalCredit = journalLines.reduce(
      (sum, line) => sum + (line.credit || 0),
      0
    );
    if (
      currentLine &&
      ((currentLine.debit || 0) > 0 || (currentLine.credit || 0) > 0)
    ) {
      totalDebit += currentLine.debit || 0;
      totalCredit += currentLine.credit || 0;
    }
  }
  const totalBalance = totalDebit - totalCredit;
  return { totalDebit, totalCredit, totalBalance };
};
export const mapJournalLinesFromApi = (lines) => {
  if (!lines || !Array.isArray(lines)) return [];
  return lines.map((line) => ({
    id: line.id,
    accountId: line.account?.id,
    account: line.account,
    debit: line.debit || 0,
    credit: line.credit || 0,
    balance: line.balance || 0,
    description: line.description || "",
  }));
};
