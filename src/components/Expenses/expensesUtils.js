import dayjs from 'dayjs';
import 'dayjs/locale/ar';
export const formatArabicDate = (date) => {
  return (
    dayjs(date).locale('ar').format('D [من] MMMM [الساعة] h:mm') +
    ' ' +
    (dayjs(date).hour() < 12 ? 'صباحًا' : 'مساءً')
  );
};
export const groupExpensesByJournal = (expenses) => {
  if (!expenses) return [];
  const grouped = {};
  expenses.forEach((expense) => {
    const journalId = expense.journal;
    if (!grouped[journalId]) {
      grouped[journalId] = {
        journalId,
        journalReference: expense.journalReference,
        voucherUrl: expense.voucherUrl,
        date: expense.createdAt,
        createdAtHijri: expense.createdAtHijri,
        addedBy: expense.addedBy,
        totalAmount: 0,
        expenses: [],
        types: new Set(),
      };
    }
    grouped[journalId].expenses.push(expense);
    grouped[journalId].totalAmount += expense.amount;
    grouped[journalId].types.add(expense.type);
  });
  return Object.values(grouped)
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .map((group, index) => ({
      ...group,
      id: index + 1,
      types: Array.from(group.types),
    }));
};