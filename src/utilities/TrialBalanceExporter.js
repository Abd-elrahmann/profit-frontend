import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';
import dayjs from 'dayjs';
import { exportUnifiedReport } from './unifiedReportTemplate';

export const exportTrialBalanceToPDF = async (data, { from, to, userName } = {}) => {
  const totals = data?.totals || {};
  const accounts = data?.accounts || [];

  const columns = [
    { header: 'الرصيد', dataKey: 'balance', width: 32, format: 'number', align: 'center' },
    { header: 'دائن', dataKey: 'credit', width: 30, format: 'number', align: 'center' },
    { header: 'مدين', dataKey: 'debit', width: 30, format: 'number', align: 'center' },
    { header: 'اسم الحساب', dataKey: 'name', width: 90, align: 'right' },
    { header: 'كود الحساب', dataKey: 'code', width: 26, align: 'center' },
  ];

  const summaryRows = [
    {
      highlight: true,
      values: {
        balance: '',
        credit: totals.totalCredit ?? 0,
        debit: totals.totalDebit ?? 0,
        name: 'الإجمالي للتقرير',
        code: '---***---',
      },
    },
    {
      highlight: false,
      values: {
        balance: '',
        credit: '',
        debit: '',
        name: `الرصيد المحلي — ${totals.isBalanced ? 'متوازن' : 'غير متوازن'}`,
        code: '',
      },
    },
  ];

  return exportUnifiedReport({
    reportTitle: 'ميزان المراجعة',
    fileName: 'ميزان_المراجعة',
    orientation: 'landscape',
    dateFrom: from,
    dateTo: to,
    userName: userName || 'مسؤول النظام',
    columns,
    rows: accounts,
    summaryRows,
  });
};

export const exportTrialBalanceToExcel = (data, { from, to } = {}) => {
  const totals = data?.totals || {};
  const sheetData = [
    ['ميزان المراجعة'],
    ['الفترة', from && to ? `${from} → ${to}` : 'بدون تصفية'],
    [],
    ['كود الحساب', 'اسم الحساب', 'مدين', 'دائن', 'الرصيد'],
    ...(data?.accounts || []).map((a) => [
      a.code,
      a.name,
      Number(a.debit) || 0,
      Number(a.credit) || 0,
      Number(a.balance) || 0,
    ]),
    [],
    ['الإجمالي', '', totals.totalDebit ?? 0, totals.totalCredit ?? 0, ''],
    ['حالة التوازن', totals.isBalanced ? 'متوازن' : 'غير متوازن'],
  ];
  const ws = XLSX.utils.aoa_to_sheet(sheetData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'ميزان المراجعة');
  const buf = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  saveAs(
    new Blob([buf], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    }),
    `ميزان_المراجعة_${dayjs().format('YYYY-MM-DD')}.xlsx`
  );
};
