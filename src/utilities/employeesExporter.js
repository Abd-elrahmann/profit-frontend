import { saveAs } from 'file-saver';
import dayjs from 'dayjs';
import { exportUnifiedReport } from './unifiedReportTemplate';
export const exportEmployeesToPDF = async (employeesData, searchQuery = '') => {
  const activeEmployees = employeesData.filter((emp) => emp.isActive).length;
  const inactiveEmployees = employeesData.filter((emp) => !emp.isActive).length;
  const totalEmployees = employeesData.length;
  const subtitle = `إجمالي الموظفين: ${totalEmployees} | نشطين: ${activeEmployees} | غير نشطين: ${inactiveEmployees}${searchQuery ? ` | بحث: ${searchQuery}` : ''}`;

  return exportUnifiedReport({
    reportTitle: 'قائمة الموظفين',
    fileName: 'الموظفين',
    orientation: 'landscape',
    subtitle,
    columns: [
      { header: 'تاريخ الإنشاء', dataKey: 'createdAt', width: 26, format: 'date' },
      { header: 'الدور', dataKey: 'roleName', width: 25, align: 'right' },
      { header: 'الحالة', dataKey: 'statusAr', width: 18 },
      { header: 'رقم الهاتف', dataKey: 'phone', width: 25 },
      { header: 'البريد الإلكتروني', dataKey: 'email', width: 45, align: 'right' },
      { header: 'الاسم', dataKey: 'name', width: 35, align: 'right' },
      { header: '#', dataKey: 'id', width: 12 },
    ],
    rows: employeesData.map((employee) => ({
      ...employee,
      roleName: employee.role?.name || 'بدون دور',
      statusAr: getStatusArabic(employee.isActive),
      phone: employee.phone || '-',
      email: employee.email || '-',
      id: String(employee.id ?? ''),
    })),
  });
};
export const exportEmployeesToExcel = async (employeesData, searchQuery = '') => {
  try {
    const XLSX = await import('xlsx');
    const workbook = XLSX.utils.book_new();
    const activeEmployees = employeesData.filter(emp => emp.isActive).length;
    const inactiveEmployees = employeesData.filter(emp => !emp.isActive).length;
    const totalEmployees = employeesData.length;
    const summaryData = [
      ['قائمة الموظفين'],
      [''],
      ['إحصائيات'],
      ['إجمالي الموظفين', totalEmployees],
      ['الموظفين النشطين', activeEmployees],
      ['الموظفين غير النشطين', inactiveEmployees],
      ['تاريخ التصدير', dayjs().format('DD/MM/YYYY HH:mm')],
      ['']
    ];
    if (searchQuery) {
      summaryData.splice(2, 0, [`نتائج البحث عن: "${searchQuery}"`]);
    }
    const employeesSheetData = employeesData.map(employee => ({
      '#': employee.id,
      'الاسم': employee.name,
      'البريد الإلكتروني': employee.email,
      'رقم الهاتف': employee.phone || '-',
      'الحالة': getStatusArabic(employee.isActive),
      'الدور': employee.role?.name || 'بدون دور',
      'تاريخ الإنشاء': dayjs(employee.createdAt).format('DD/MM/YYYY')
    }));
      const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
    const employeesSheet = XLSX.utils.json_to_sheet(employeesSheetData);
    const wscols = [
      { wch: 8 },
      { wch: 25 },
      { wch: 30 },
      { wch: 15 },
      { wch: 12 },
      { wch: 20 },
      { wch: 18 }
    ];
    employeesSheet['!cols'] = wscols;
    XLSX.utils.book_append_sheet(workbook, summarySheet, 'ملخص');
    XLSX.utils.book_append_sheet(workbook, employeesSheet, 'الموظفين');
    const excelBuffer = XLSX.write(workbook, { 
      bookType: 'xlsx', 
      type: 'array',
      bookSST: false 
    });
    const blob = new Blob([excelBuffer], { 
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
    });
    const fileName = `الموظفين_${dayjs().format('YYYY-MM-DD')}.xlsx`;
    saveAs(blob, fileName);
  } catch (error) {
    console.error('Excel export error:', error.message);
    throw error;
  }
};
const getStatusArabic = (isActive) => {
  return isActive ? 'نشط' : 'غير نشط';
};