import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

import { saveAs } from 'file-saver';
import { pdfTableBaseStyles, createDidDrawTable } from './pdfTableStyles';
import { registerArabicFonts, drawReportHeader, drawSeparatorLine, drawReportFooter, getCenteredTableMargins, PRIMARY_COLOR } from './pdfReportUtils';
import dayjs from 'dayjs';

export const exportEmployeesToPDF = async (employeesData, searchQuery = '') => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new jsPDF();
      
      registerArabicFonts(doc);
      
      doc.setProperties({
        title: 'الموظفين',
        subject: 'قائمة الموظفين',
        author: 'نظام إدارة السلف',
        keywords: 'موظفين, إدارة, سلف',
        creator: 'نظام إدارة السلف'
      });
      let yPosition = drawReportHeader(doc, {
        reportTitle: 'قائمة الموظفين',
        metadata: { date: dayjs().format('DD/MM/YYYY'), time: dayjs().format('HH:mm') }
      });
      yPosition = drawSeparatorLine(doc, yPosition);
      
      if (searchQuery) {
        doc.setFontSize(11);
        doc.setFont('Amiri', 'bold');
        doc.text(`نتائج البحث عن: "${searchQuery}"`, doc.internal.pageSize.width / 2, yPosition, { align: 'center' });
        yPosition += 10;
      }
      
      doc.setFontSize(11);
      doc.setFont('Amiri', 'bold');
      const summaryY = yPosition;
      const activeEmployees = employeesData.filter(emp => emp.isActive).length;
      const inactiveEmployees = employeesData.filter(emp => !emp.isActive).length;
      const totalEmployees = employeesData.length;
      
      const summaryText = `إجمالي الموظفين: ${totalEmployees} | نشطين: ${activeEmployees} | غير نشطين: ${inactiveEmployees} | تاريخ التصدير: ${dayjs().format('DD/MM/YYYY HH:mm')}`;
      doc.text(summaryText, doc.internal.pageSize.width / 2, summaryY, { align: 'center' });
      
      let yPosition = summaryY + 12;
      
      const tableData = employeesData.map(employee => [
        dayjs(employee.createdAt).format('DD/MM/YYYY'),
        employee.role?.name || 'بدون دور',
        getStatusArabic(employee.isActive),
        employee.phone || '-',
        employee.email,
        employee.name,
        employee.id.toString()
      ]);
      
      const headers = [
        ['تاريخ الإنشاء', 'الدور', 'الحالة', 'رقم الهاتف', 'البريد الإلكتروني', 'الاسم', '#']
      ];
      
      const pageWidth = doc.internal.pageSize.width;
      
      const columnWidths = {
        0: 22, 
        1: 25, 
        2: 18, 
        3: 25, 
        4: 45, 
        5: 35, 
        6: 12  
      };
      
      const totalColumnWidth = Object.values(columnWidths).reduce((sum, width) => sum + width, 0);
      const tableMargins = getCenteredTableMargins(doc, totalColumnWidth);
      
      autoTable(doc, {
        startY: yPosition,
        head: headers,
        body: tableData,
        ...pdfTableBaseStyles,
        styles: { ...pdfTableBaseStyles.styles, fontStyle: 'bold', fontSize: 9, cellPadding: 4 },
        headStyles: { ...pdfTableBaseStyles.headStyles, fillColor: PRIMARY_COLOR, textColor: [255, 255, 255], fontSize: 9, cellPadding: 4 },
        bodyStyles: { ...pdfTableBaseStyles.bodyStyles, fontStyle: 'bold', cellPadding: 4 },
        columnStyles: {
          0: { cellWidth: columnWidths[0], fontSize: 9 }, 
          1: { cellWidth: columnWidths[1], fontSize: 9 }, 
          2: { cellWidth: columnWidths[2], fontSize: 9 }, 
          3: { cellWidth: columnWidths[3], fontSize: 9 }, 
          4: { cellWidth: columnWidths[4], fontSize: 9 }, 
          5: { cellWidth: columnWidths[5], fontSize: 9 }, 
          6: { cellWidth: columnWidths[6], fontSize: 9 }  
        },
        margin: { top: yPosition, left: tableMargins.left, right: tableMargins.right, bottom: 25 },
        tableWidth: totalColumnWidth,
        horizontalPageBreak: false,
        pageBreak: 'auto',
        showHead: 'everyPage',
        didDrawTable: createDidDrawTable(doc)
      });
      
      const pageCount = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        drawReportFooter(doc, i, pageCount);
      }
      
      const fileName = `الموظفين_${dayjs().format('YYYY-MM-DD')}.pdf`;
      doc.save(fileName);
      resolve();
    } catch (error) {
      console.error('PDF export error:', error.message);
      reject(error);
    }
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
      { wch: 15 }  
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

