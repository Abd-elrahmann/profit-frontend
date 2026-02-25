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

export const getCurrentJournals = (currentData, monthParam) => {
  if (!currentData?.journalsByMonth) return [];

  if (monthParam && currentData.journalsByMonth[monthParam]) {
    return currentData.journalsByMonth[monthParam].entries;
  }

  return Object.values(currentData.journalsByMonth)
    .flatMap((month) => month.entries)
    .sort((a, b) => new Date(b.date) - new Date(a.date));
};
