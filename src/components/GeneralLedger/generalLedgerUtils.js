import dayjs from 'dayjs';
import 'dayjs/locale/ar';

export const formatArabicDate = (date) => {
  return (
    dayjs(date).locale('ar').format('D [من] MMMM [الساعة] h:mm') +
    ' ' +
    (dayjs(date).hour() < 12 ? 'صباحًا' : 'مساءً')
  );
};

export const getAccountTypeArabic = (type) => {
  const typeMap = {
    ASSET: 'أصول',
    LIABILITY: 'خصوم',
    EQUITY: 'حقوق ملكية',
    REVENUE: 'إيرادات',
    EXPENSE: 'مصروفات',
  };
  return typeMap[type] || type;
};
