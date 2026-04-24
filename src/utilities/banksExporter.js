import { saveAs } from 'file-saver';
import dayjs from 'dayjs';
import { exportUnifiedReport } from './unifiedReportTemplate';
export const exportBanksToPDF = async (banksData, searchQuery = '') => {
  const activeBanks = banksData.filter((bank) => bank.status === 'Active').length;
  const expiredBanks = banksData.filter((bank) => bank.status === 'Expired').length;
  const totalBanks = banksData.length;
  const subtitle = `إجمالي الحسابات: ${totalBanks} | نشطة: ${activeBanks} | منتهية: ${expiredBanks}${searchQuery ? ` | بحث: ${searchQuery}` : ''}`;

  return exportUnifiedReport({
    reportTitle: 'الحسابات البنكية',
    fileName: 'الحسابات_البنكية',
    orientation: 'landscape',
    subtitle,
    columns: [
      { header: 'الحالة', dataKey: 'statusAr', width: 18 },
      { header: 'السلف المسموح بها', dataKey: 'limit', width: 28, format: 'number0' },
      { header: 'رقم الايبان', dataKey: 'IBAN', width: 40 },
      { header: 'رقم الحساب', dataKey: 'accountNumber', width: 25 },
      { header: 'اسم المالك', dataKey: 'owner', width: 30, align: 'right' },
      { header: 'اسم الحساب', dataKey: 'name', width: 35, align: 'right' },
      { header: '#', dataKey: 'id', width: 12 },
    ],
    rows: banksData.map((bank) => ({
      ...bank,
      statusAr: getStatusArabic(bank.status),
      limit: bank.limit || 0,
      IBAN: bank.IBAN || '-',
      accountNumber: bank.accountNumber || '-',
      owner: bank.owner || '-',
      name: bank.name || '-',
      id: String(bank.id ?? ''),
    })),
  });
};
export const exportBanksToExcel = async (banksData, searchQuery = '') => {
  try {
      const XLSX = await import('xlsx');
    const workbook = XLSX.utils.book_new();
    const activeBanks = banksData.filter(bank => bank.status === 'Active').length;
    const expiredBanks = banksData.filter(bank => bank.status === 'Expired').length;
    const totalBanks = banksData.length;
    const summaryData = [
      ['الحسابات البنكية'],
      [''],
      ['إحصائيات'],
      ['إجمالي الحسابات', totalBanks],
      ['الحسابات النشطة', activeBanks],
      ['الحسابات المنتهية', expiredBanks],
      ['تاريخ التصدير', dayjs().format('DD/MM/YYYY HH:mm')],
      ['']
    ];
    if (searchQuery) {
      summaryData.splice(2, 0, [`نتائج البحث عن: "${searchQuery}"`]);
    }
    const banksSheetData = banksData.map(bank => ({
      '#': bank.id,
      'اسم الحساب': bank.name,
      'اسم المالك': bank.owner,
      'رقم الحساب': bank.accountNumber,
      'رقم الايبان': bank.IBAN,
      'السلف المسموح بها': bank.limit,
      'الحالة': getStatusArabic(bank.status)
    }));
    const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
    const banksSheet = XLSX.utils.json_to_sheet(banksSheetData);
    const wscols = [
      { wch: 8 },  
      { wch: 25 }, 
      { wch: 20 }, 
      { wch: 20 }, 
      { wch: 30 }, 
      { wch: 18 }, 
      { wch: 12 }  
    ];
    banksSheet['!cols'] = wscols;
    XLSX.utils.book_append_sheet(workbook, summarySheet, 'ملخص');
    XLSX.utils.book_append_sheet(workbook, banksSheet, 'الحسابات البنكية');
    const excelBuffer = XLSX.write(workbook, { 
      bookType: 'xlsx', 
      type: 'array',
      bookSST: false 
    });
    const blob = new Blob([excelBuffer], { 
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
    });
    const fileName = `الحسابات_البنكية_${dayjs().format('YYYY-MM-DD')}.xlsx`;
    saveAs(blob, fileName);
  } catch (error) {
    console.error('Excel export error:', error.message);
    throw error;
  }
};
const getStatusArabic = (status) => {
  const statusMap = {
    'Active': 'نشط',
    'Expired': 'منتهي',
    'Pending': 'قيد الانتظار',
    'Suspended': 'موقوف'
  };
  return statusMap[status] || status;
};
