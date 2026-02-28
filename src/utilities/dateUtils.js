import dayjs from 'dayjs';
import 'dayjs/locale/ar';
export const formatArabicDate = (date) => {
  if (!date) return '';
  return (
    dayjs(date).locale('ar').format('D [من] MMMM [الساعة] h:mm') +
    ' ' +
    (dayjs(date).hour() < 12 ? 'صباحًا' : 'مساءً')
  );
};