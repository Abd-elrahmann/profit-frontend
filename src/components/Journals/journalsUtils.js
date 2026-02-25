/**
 * Flattens a tree structure of accounts into a single array
 */
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

/**
 * Checks if journal debit and credit totals are balanced (within 0.01 tolerance)
 */
export const isJournalBalanced = (debit, credit) => {
  const difference = Math.abs(debit - credit);
  return difference < 0.01;
};

/**
 * Maps journal source type to Arabic text
 */
export const getJournalSourceTypeText = (sourceType) => {
  const sourceTypeMap = {
    LOAN: "سلفة",
    REPAYMENT: "سداد دفعة",
    LOAN_INTEREST: "فوائد سلفة",
    LOAN_CONVERSION: "نقل مديونية",
    PARTNER: "انضمام شريك",
    PERIOD_CLOSING: "إقفال فترة",
    PARTNER_TRANSACTION_WITHDRAWAL: "سحب مالي لشريك",
    COMPANY_PROFIT_WITHDRAWAL: "سحب ربح شركة",
    PARTNER_TRANSACTION_DEPOSIT: "إيداع مالي لشريك",
    EXPENSES: "مصروف",
    SAVING: "ادخار",
    PARTNER_WITHDRAWING: "انسحاب مالي لشريك",
    ZAKAT: "سحب زكاة",
    PARTNER_PROFIT_WITHDRAWAL: "سحب ارباح شريك",
    OTHER: "أخرى",
  };
  return sourceTypeMap[sourceType] || sourceType || "-";
};

/**
 * Maps journal status to Arabic text
 */
export const getStatusText = (status) => {
  const statusMap = {
    DRAFT: "مسودة",
    POSTED: "معتمد",
    CANCELLED: "ملغي",
  };
  return statusMap[status] || status;
};

/**
 * Maps journal type to Arabic text
 */
export const getJournalTypeText = (type) => {
  const typeMap = {
    GENERAL: "عام",
    OPENING: "افتتاحي",
    CLOSING: "ختامي",
    ADJUSTMENT: "تسوية",
  };
  return typeMap[type] || type || "-";
};

/**
 * Calculates totals for table display (from journalData or journalLines)
 */
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

/**
 * Calculates totals including current line being edited
 */
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

/**
 * Maps journal lines from API to form format
 */
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
