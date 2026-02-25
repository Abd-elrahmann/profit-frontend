import dayjs from 'dayjs';
import { MONTHS } from './constants';

export const formatNumber = (amount) =>
  new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Math.abs(amount || 0));

export const formatCapitalNumber = (amount) =>
  new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Math.abs(amount || 0));

export const negformatCapitalNumber = (amount) =>
  new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount || 0);

export const getChipColor = (expenseType) => {
  const colors = {
    'مصروف رواتب': 'primary',
    'مصروف بنزين': 'warning',
    'مصروفات انترنت': 'info',
    'مصروفات ورقية': 'default',
    'مصروفات كهرباء': 'secondary',
    'مصروفات تشغيلية': 'success',
  };
  return colors[expenseType] || 'default';
};

export const getPeriodInfo = (incomeData, selectedMonth, selectedYear) => {
  if (!incomeData?.period) return null;

  const period = incomeData.period;
  let periodText = '';

  if (period.source === 'MONTH') {
    periodText = `${MONTHS[selectedMonth]} ${selectedYear}`;
  } else if (period.source === 'CUSTOM') {
    periodText = `من ${dayjs(period.from).format('DD/MM/YYYY')} إلى ${dayjs(period.to).format('DD/MM/YYYY')}`;
  } else if (period.source === 'CURRENT_PERIOD') {
    periodText = `الفترة الحالية (${dayjs(period.from).format('DD/MM/YYYY')} - ${dayjs(period.to).format('DD/MM/YYYY')})`;
  } else if (period.source === 'PERIOD') {
    periodText = `فترة محاسبية محددة (${dayjs(period.from).format('DD/MM/YYYY')} - ${dayjs(period.to).format('DD/MM/YYYY')})`;
  } else {
    periodText = `من ${dayjs(period.from).format('DD/MM/YYYY')} إلى ${dayjs(period.to).format('DD/MM/YYYY')}`;
  }

  return { text: periodText, from: period.from, to: period.to, source: period.source };
};
