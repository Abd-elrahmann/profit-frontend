import { saveAs } from 'file-saver';
import dayjs from 'dayjs';
import 'dayjs/locale/ar';
import { exportUnifiedReport } from './unifiedReportTemplate';
const formatInt = (value) => {
  const num = Number(value || 0);
  if (!Number.isFinite(num)) return '0';
  return num.toLocaleString();
};
export const exportZakahToPDF = async (zakahData, filters = {}) => {
  const isArrayData = Array.isArray(zakahData);
  const isAccountData = !isArrayData && !!zakahData?.account;
  const isPartnerArray = (isArrayData && !!filters.partner) || (!isArrayData && !!zakahData?.monthlyBreakdown);
  const isPartnersList = isArrayData && !filters.partner;
  let allEntries = [];
      if (zakahData.journalsByMonth) {
        Object.entries(zakahData.journalsByMonth).forEach(([month, data]) => {
          if (data.entries && data.entries.length > 0) {
            data.entries.forEach(entry => {
              allEntries.push({
                ...entry,
                month: month,
                requiredZakat: data.requiredZakat || 0
              });
            });
          }
        });
      } else if (isPartnerArray) {
        const partnerData = isArrayData
          ? zakahData.find(item => item.year === filters.year) || zakahData[0]
          : zakahData;
        const partnerYear = partnerData?.year || filters.year;
        if (partnerData?.monthlyBreakdown) {
          partnerData.monthlyBreakdown.forEach(month => {
            allEntries.push({
              ...month,
              month: month.month.toString().padStart(2, '0'),
              description: `زكاة شهر ${month.month}`,
              date: `${partnerYear}-${month.month.toString().padStart(2, '0')}-01`,
              reference: `ZAKAH-${partnerData.partnerName || 'UNKNOWN'}-${partnerYear}-${month.month.toString().padStart(2, '0')}`,
              postedBy: 'النظام',
              type: 'GENERAL',
              status: 'POSTED',
              debit: 0,
              credit: month.amount || 0,
              balance: month.amount || 0
            });
          });
        }
      } else if (isPartnersList) {
        zakahData.forEach((item) => {
          allEntries.push({
            ...item,
            month: filters.month ? filters.month.toString().padStart(2, '0') : '',
            date: `${item.year || filters.year || dayjs().year()}-01-01`,
            partnerName: item.partnerName || '-',
          });
        });
      }
  allEntries.sort((a, b) => new Date(b.date) - new Date(a.date));
  if (isAccountData) {
    return exportUnifiedReport({
      reportTitle: 'تقرير الزكاة',
      fileName: 'تقرير_الزكاة',
      orientation: 'landscape',
      subtitle: `رصيد الحساب: ${zakahData.account.balance?.toLocaleString() || 0} | المدفوع: ${zakahData.account.credit?.toLocaleString() || 0} | المتبقي: ${zakahData.account.debit?.toLocaleString() || 0}`,
      columns: [
        { header: 'التاريخ', dataKey: 'dateText', width: 45 },
        { header: 'الوصف', dataKey: 'description', width: 65, align: 'right' },
        { header: 'مدين', dataKey: 'debit', width: 25, format: 'number0' },
        { header: 'دائن', dataKey: 'credit', width: 25, format: 'number0' },
        { header: 'الرصيد', dataKey: 'balance', width: 30, format: 'number0' },
      ],
      rows: allEntries.map((entry) => ({
        dateText: dayjs(entry.date).format('DD/MM/YYYY'),
        description: entry.description || '-',
        debit: entry.debit || 0,
        credit: entry.credit || 0,
        balance: entry.balance || 0,
      })),
    });
  }
  if (isPartnerArray) {
    return exportUnifiedReport({
      reportTitle: 'تقرير الزكاة',
      fileName: 'تقرير_الزكاة',
      orientation: 'landscape',
      subtitle: `الشريك: ${filters.partner || '-'} | السنة: ${filters.year || '-'} | عدد البنود: ${allEntries.length}`,
      columns: [
        { header: 'الشهر', dataKey: 'month', width: 28 },
        { header: 'التاريخ', dataKey: 'dateText', width: 38 },
        { header: 'الوصف', dataKey: 'description', width: 85, align: 'right' },
        { header: 'المبلغ', dataKey: 'credit', width: 38, format: 'number0' },
      ],
      rows: allEntries.map((entry) => ({
        month: entry.month,
        dateText: dayjs(entry.date).format('DD/MM/YYYY'),
        description: entry.description || '-',
        credit: entry.credit || 0,
      })),
    });
  }
  const totals = allEntries.reduce((acc, entry) => ({
    capitalAmount: acc.capitalAmount + Number(entry.capitalAmount || 0),
    annualZakat: acc.annualZakat + Number(entry.annualZakat || 0),
    totalPaid: acc.totalPaid + Number(entry.totalPaid || 0),
    remaining: acc.remaining + Number(entry.remaining || 0),
  }), { capitalAmount: 0, annualZakat: 0, totalPaid: 0, remaining: 0 });
  const rows = allEntries.map((entry) => ({
    remaining: Number(entry.remaining || 0),
    totalPaid: Number(entry.totalPaid || 0),
    annualZakat: Number(entry.annualZakat || 0),
    capitalAmount: Number(entry.capitalAmount || 0),
    year: entry.year || filters.year || '-',
    partnerName: entry.partnerName || '-',
  }));
  rows.push({ remaining: totals.remaining, totalPaid: totals.totalPaid, annualZakat: totals.annualZakat, capitalAmount: totals.capitalAmount, year: filters.year || '-', partnerName: 'الإجمالي' });
  return exportUnifiedReport({
    reportTitle: 'تقرير الزكاة',
    fileName: 'تقرير_الزكاة',
    orientation: 'landscape',
    subtitle: `عدد الشركاء: ${Array.isArray(zakahData) ? zakahData.length : 0} | السنة: ${filters.year || '-'} `,
    columns: [
      { header: 'المتبقي', dataKey: 'remaining', width: 23, format: 'number0' },
      { header: 'المدفوع', dataKey: 'totalPaid', width: 23, format: 'number0' },
      { header: 'الزكاة السنوية', dataKey: 'annualZakat', width: 31, format: 'number0' },
      { header: 'رأس المال', dataKey: 'capitalAmount', width: 31, format: 'number0' },
      { header: 'السنة', dataKey: 'year', width: 23 },
      { header: 'اسم الشريك', dataKey: 'partnerName', width: 61, align: 'right' },
    ],
    rows,
  });
};
export const exportZakahToExcel = async (zakahData, filters = {}) => {
  try {
    const XLSX = await import('xlsx');
    const workbook = XLSX.utils.book_new();
    const summaryData = [
      ['تقرير الزكاة'],
      ['']
    ];
    if (filters.month && filters.year) {
      summaryData.push([`الشهر: ${filters.month}/${filters.year}`]);
      summaryData.push(['']);
    } else if (filters.partner && filters.year) {
      summaryData.push([`الشريك: ${filters.partner} | السنة: ${filters.year}`]);
      summaryData.push(['']);
    }
    const isArrayData = Array.isArray(zakahData);
    const isAccountData = !isArrayData && !!zakahData?.account;
    const isPartnerArray = (isArrayData && !!filters.partner) || (!isArrayData && !!zakahData?.monthlyBreakdown);
    const isPartnersList = isArrayData && !filters.partner;   
    if (isAccountData) {
      summaryData.push(['إحصائيات الحساب']);
      summaryData.push(['رصيد الحساب', zakahData.account.balance || 0]);
      summaryData.push(['المدفوع', zakahData.account.credit || 0]);
      summaryData.push(['المتبقي', zakahData.account.debit || 0]);
      summaryData.push(['تاريخ التصدير', dayjs().format('DD/MM/YYYY HH:mm')]);
      summaryData.push(['']);
    } else if (isPartnerArray) {
      const partnerData = isArrayData
        ? zakahData.find(item => item.year === filters.year) || zakahData[0]
        : zakahData;
      if (partnerData) {
        summaryData.push(['إحصائيات الزكاة']);
        summaryData.push(['اسم الشريك', partnerData.partnerName || '-']);
        summaryData.push(['رأس المال', partnerData.capitalAmount || 0]);
        summaryData.push(['الزكاة السنوية', partnerData.annualZakat || 0]);
        summaryData.push(['المدفوع', partnerData.totalPaid || 0]);
        summaryData.push(['المتبقي', partnerData.remaining || 0]);
        summaryData.push(['تاريخ التصدير', dayjs().format('DD/MM/YYYY HH:mm')]);
        summaryData.push(['']);
      }
    } else if (isPartnersList) {
      summaryData.push(['إحصائيات الشركاء']);
      summaryData.push(['عدد الشركاء', zakahData.length]);
      summaryData.push(['السنة', filters.year || '-']);
      summaryData.push(['تاريخ التصدير', dayjs().format('DD/MM/YYYY HH:mm')]);
      summaryData.push(['']);
    }
    let allEntries = [];
    if (zakahData.journalsByMonth) {
      Object.entries(zakahData.journalsByMonth).forEach(([month, data]) => {
        if (data.entries && data.entries.length > 0) {
          data.entries.forEach(entry => {
            allEntries.push({
              ...entry,
              month: month,
              requiredZakat: data.requiredZakat || 0
            });
          });
        }
      });
    } else if (isPartnerArray) {
      const partnerData = isArrayData
        ? zakahData.find(item => item.year === filters.year) || zakahData[0]
        : zakahData;
      const partnerYear = partnerData?.year || filters.year;
      if (partnerData?.monthlyBreakdown) {
        partnerData.monthlyBreakdown.forEach(month => {
          allEntries.push({
            month: month.month.toString().padStart(2, '0'),
            date: `${partnerYear}-${month.month.toString().padStart(2, '0')}-01`,
            reference: `ZAKAH-${partnerData.partnerName || 'UNKNOWN'}-${partnerYear}-${month.month.toString().padStart(2, '0')}`,
            description: `زكاة شهر ${month.month}`,
            postedBy: 'النظام',
            type: 'GENERAL',
            status: month.status || 'PENDING',
            debit: 0,
            credit: month.amount || 0,
            balance: month.amount || 0
          });
        });
      }
    } else if (isPartnersList) {
      zakahData.forEach((item) => {
        allEntries.push({
          ...item,
          month: filters.month ? filters.month.toString().padStart(2, '0') : '',
          date: `${item.year || filters.year || dayjs().year()}-01-01`,
          partnerName: item.partnerName || '-',
        });
      });
    }
    allEntries.sort((a, b) => new Date(b.date) - new Date(a.date));
    let excelData;
    if (isAccountData) {
      excelData = allEntries.map(entry => ({
        'التاريخ الميلادي': dayjs(entry.date).locale("ar").format("D [من] MMMM [الساعة] h:mm") + " " + (dayjs(entry.date).hour() < 12 ? "صباحًا" : "مساءً"),
        'التاريخ الهجري': entry.hijriDate || '',
        'الوصف': entry.description || '-',
        'مدين': entry.debit || 0,
        'دائن': entry.credit || 0,
        'الرصيد': entry.balance || 0
      }));
    } else if (isPartnerArray) {
      excelData = allEntries.map(entry => ({
        'الشهر': entry.month,
        'التاريخ': dayjs(entry.date).format('DD/MM/YYYY'),
        'الوصف': entry.description || '-',
        'المبلغ': entry.credit || 0
      }));
    } else {
      excelData = allEntries.map(entry => ({
        'المتبقي': Number(entry.remaining) || 0,
        'المدفوع': Number(entry.totalPaid) || 0,
        'الزكاة السنوية': Number(entry.annualZakat) || 0,
        'رأس المال': Number(entry.capitalAmount) || 0,
        'السنة': entry.year || filters.year || '-',
        'اسم الشريك': entry.partnerName || '-',
      }));
      const totals = allEntries.reduce((acc, entry) => ({
        capitalAmount: acc.capitalAmount + Number(entry.capitalAmount || 0),
        annualZakat: acc.annualZakat + Number(entry.annualZakat || 0),
        totalPaid: acc.totalPaid + Number(entry.totalPaid || 0),
        remaining: acc.remaining + Number(entry.remaining || 0),
      }), { capitalAmount: 0, annualZakat: 0, totalPaid: 0, remaining: 0 });
      excelData.push({
        'المتبقي': totals.remaining,
        'المدفوع': totals.totalPaid,
        'الزكاة السنوية': totals.annualZakat,
        'رأس المال': totals.capitalAmount,
        'السنة': filters.year || allEntries[0]?.year || '-',
        'اسم الشريك': 'الإجمالي',
      });
    }
    const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
    const dataSheet = XLSX.utils.json_to_sheet(excelData);
    let wscols;
    if (isAccountData) {
      wscols = [
        { wch: 25 },
        { wch: 15 },
        { wch: 40 },
        { wch: 15 },
        { wch: 15 },
        { wch: 18 }
      ];
    } else if (isPartnerArray) {
      wscols = [
        { wch: 12 },
        { wch: 18 },
        { wch: 40 },
        { wch: 14 }
      ];
    } else {
      wscols = [
        { wch: 18 },
        { wch: 18 },
        { wch: 20 },
        { wch: 20 },
        { wch: 15 },
        { wch: 30 },
      ];
    }
    dataSheet['!cols'] = wscols;
    XLSX.utils.book_append_sheet(workbook, summarySheet, 'ملخص');
    XLSX.utils.book_append_sheet(workbook, dataSheet, 'العمليات المالية');
    const excelBuffer = XLSX.write(workbook, {
      bookType: 'xlsx',
      type: 'array',
      bookSST: false
    });
    const blob = new Blob([excelBuffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    });
    const fileName = `تقرير_الزكاة_${dayjs().format('YYYY-MM-DD')}.xlsx`;
    saveAs(blob, fileName);
  } catch (error) {
    console.error('Excel export error:', error.message);
    throw error;
  }
};