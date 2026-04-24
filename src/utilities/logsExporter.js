import { saveAs } from 'file-saver';
import dayjs from 'dayjs';
import { exportUnifiedReport } from './unifiedReportTemplate';
export const exportLogsToPDF = async (logsData, filters = {}) => {
  const totalLogs = logsData.length;
  const dateRange = getDateRangeText(logsData);
  let filtersInfo = '';
  if (filters.search) filtersInfo += `بحث: "${filters.search}" `;
  if (filters.screen) filtersInfo += `شاشة: ${getScreenText(filters.screen)} `;
  if (filters.action) filtersInfo += `إجراء: ${getActionText(filters.action)} `;
  if (filters.userName) filtersInfo += `مستخدم: ${filters.userName} `;
  if (filters.from) filtersInfo += `من: ${filters.from} `;
  if (filters.to) filtersInfo += `إلى: ${filters.to} `;

  const subtitle = `إجمالي السجلات: ${totalLogs} | ${dateRange}${filtersInfo ? ` | ${filtersInfo.trim()}` : ''}`;

  return exportUnifiedReport({
    reportTitle: 'سجلات النشاطات',
    fileName: 'سجلات_النشاطات',
    orientation: 'landscape',
    subtitle,
    columns: [
      { header: 'التاريخ والوقت', dataKey: 'createdAtText', width: 25 },
      { header: 'الوصف', dataKey: 'description', width: 65, align: 'right' },
      { header: 'الإجراء', dataKey: 'actionText', width: 20 },
      { header: 'الشاشة', dataKey: 'screenText', width: 30, align: 'right' },
      { header: 'المستخدم', dataKey: 'userName', width: 30, align: 'right' },
    ],
    rows: logsData.map((log) => ({
      ...log,
      createdAtText: dayjs(log.createdAt).format('DD/MM/YYYY HH:mm'),
      description: log.description || '-',
      actionText: getActionText(log.action),
      screenText: getScreenText(log.screen),
      userName: log.user?.name || '-',
    })),
  });
};
export const exportLogsToExcel = async (logsData, filters = {}) => {
  try {
    const XLSX = await import('xlsx');
    const workbook = XLSX.utils.book_new();
    const totalLogs = logsData.length;
    const dateRange = getDateRangeText(logsData);
    const summaryData = [
      ['سجلات النشاطات'],
      [''],
      ['إحصائيات'],
      ['إجمالي السجلات', totalLogs],
      ['الفترة', dateRange],
      ['تاريخ التصدير', dayjs().format('DD/MM/YYYY HH:mm')],
      ['']
    ];
    let filtersInfo = [];
    if (filters.search) filtersInfo.push(['بحث', filters.search]);
    if (filters.screen) filtersInfo.push(['شاشة', getScreenText(filters.screen)]);
    if (filters.action) filtersInfo.push(['إجراء', getActionText(filters.action)]);
    if (filters.userName) filtersInfo.push(['مستخدم', filters.userName]);
    if (filters.from) filtersInfo.push(['من تاريخ', filters.from]);
    if (filters.to) filtersInfo.push(['إلى تاريخ', filters.to]);
    if (filtersInfo.length > 0) {
      summaryData.splice(2, 0, ['فلترة البيانات']);
      filtersInfo.forEach(([key, value]) => {
        summaryData.splice(3, 0, [key, value]);
      });
      summaryData.splice(3 + filtersInfo.length, 0, ['']);
    }
    const logsSheetData = logsData.map(log => ({
      'المستخدم': log.user.name,
      'الشاشة': getScreenText(log.screen),
      'الإجراء': getActionText(log.action),
      'الوصف': log.description,
      'التاريخ والوقت': dayjs(log.createdAt).format('DD/MM/YYYY HH:mm')
    }));
    const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
    const logsSheet = XLSX.utils.json_to_sheet(logsSheetData);
    const wscols = [
      { wch: 20 },
      { wch: 20 },
      { wch: 15 },
      { wch: 50 },
      { wch: 20 }
    ];
    logsSheet['!cols'] = wscols;
    XLSX.utils.book_append_sheet(workbook, summarySheet, 'ملخص');
    XLSX.utils.book_append_sheet(workbook, logsSheet, 'سجلات النشاطات');
    const excelBuffer = XLSX.write(workbook, { 
      bookType: 'xlsx', 
      type: 'array',
      bookSST: false 
    });
    const blob = new Blob([excelBuffer], { 
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
    });
    const fileName = `سجلات_النشاطات_${dayjs().format('YYYY-MM-DD')}.xlsx`;
    saveAs(blob, fileName);
  } catch (error) {
    console.error('Excel export error:', error.message);
    throw error;
  }
};
const getActionText = (action) => {
  switch (action) {
    case "CREATE":
      return "إنشاء";
    case "UPDATE":
      return "تعديل";
    case "DELETE":
      return "حذف";
    case "VIEW":
      return "عرض";
    case "POST":
      return "اعتماد";
    case "UNPOST":
      return "إلغاء الاعتماد";
    case "login":
      return "تسجيل دخول";
    case "logout":
      return "تسجيل خروج";
    default:
      return action;
  }
};
const getScreenText = (screen) => {
  const screenTranslations = {
    "Auth": "المصادقة",
    "Bank Accounts": "الحسابات البنكية",
    "Clients": "العملاء",
    "Journals": "القيود اليومية",
    "Loans": "السلف",
    "Partners": "المستثمرين",
    "Repayments": "الدفعات",
    "Roles": "الأدوار",
    "Templates": "القوالب",
    "Users": "المستخدمين",
  };
  return screenTranslations[screen] || screen;
};
const getDateRangeText = (logsData) => {
  if (!logsData || logsData.length === 0) return 'لا توجد بيانات';
  const dates = logsData.map(log => new Date(log.createdAt));
  const minDate = new Date(Math.min(...dates));
  const maxDate = new Date(Math.max(...dates));
  if (minDate.toDateString() === maxDate.toDateString()) {
    return `في ${dayjs(minDate).format('DD/MM/YYYY')}`;
  } else {
    return `من ${dayjs(minDate).format('DD/MM/YYYY')} إلى ${dayjs(maxDate).format('DD/MM/YYYY')}`;
  }
};
