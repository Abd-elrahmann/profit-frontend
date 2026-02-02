import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

import { saveAs } from 'file-saver';
import { pdfTableBaseStyles, createDidDrawTable } from './pdfTableStyles';
import dayjs from 'dayjs';
import logo from '/assets/images/logo.webp';

const registerArabicFonts = (doc) => {
  try {
    doc.addFont('/assets/fonts/Amiri-Regular.ttf', 'Amiri', 'normal');
    doc.addFont('/assets/fonts/Amiri-Bold.ttf', 'Amiri', 'bold');
  } catch (error) {
    console.warn('Arabic fonts not found, using default fonts', error);
  }
};

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
      doc.setFont('Amiri', 'bold');
      
      const logoWidth = 10;
      const logoHeight = 10;
      const logoX = doc.internal.pageSize.width - logoWidth - 5;
      const logoY = 5;
      doc.addImage(logo, 'PNG', logoX, logoY, logoWidth, logoHeight);
      
      doc.setFontSize(18);
      doc.setFont('Amiri', 'bold');
      doc.text('قائمة الموظفين', doc.internal.pageSize.width / 2, 25, { align: 'center' });
      
      if (searchQuery) {
        doc.setFontSize(11);
        doc.setFont('Amiri', 'bold');
        doc.text(`نتائج البحث عن: "${searchQuery}"`, doc.internal.pageSize.width / 2, 35, { align: 'center' });
      }
      
      doc.setFontSize(11);
      doc.setFont('Amiri', 'bold');
      const summaryY = searchQuery ? 45 : 35;
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
      const tableStartX = (pageWidth - totalColumnWidth) / 2;
      
      autoTable(doc, {
        startY: yPosition,
        startX: tableStartX,
        head: headers,
        body: tableData,
        ...pdfTableBaseStyles,
        styles: { ...pdfTableBaseStyles.styles, fontStyle: 'bold', fontSize: 8 },
        bodyStyles: { ...pdfTableBaseStyles.bodyStyles, fontStyle: 'bold', cellPadding: 2 },
        columnStyles: {
            0: { cellWidth: columnWidths[0], fontSize: 7 }, 
          1: { cellWidth: columnWidths[1], fontSize: 8 }, 
          2: { cellWidth: columnWidths[2], fontSize: 8 }, 
          3: { cellWidth: columnWidths[3], fontSize: 8 }, 
          4: { cellWidth: columnWidths[4], fontSize: 7 }, 
          5: { cellWidth: columnWidths[5], fontSize: 8 }, 
          6: { cellWidth: columnWidths[6], fontSize: 8 }  
        },
        margin: { top: yPosition, bottom: 20 },
        tableWidth: totalColumnWidth,
        horizontalPageBreak: false,
        pageBreak: 'auto',
        showHead: 'everyPage',
        didDrawTable: createDidDrawTable(doc)
      });
      
      const pageCount = doc.internal.getNumberOfPages();
      const footerMargin = 10;
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        
        doc.setDrawColor(200, 200, 200);
        doc.setLineWidth(0.5);
        doc.line(
          footerMargin,
          doc.internal.pageSize.height - 15,
          doc.internal.pageSize.width - footerMargin,
          doc.internal.pageSize.height - 15
        );
        
        doc.setFontSize(9);
        doc.setFont('Amiri', 'bold');
        doc.setTextColor(100, 100, 100);
        
        doc.text(
          `صفحة ${i} من ${pageCount}`,
          doc.internal.pageSize.width / 2,
          doc.internal.pageSize.height - 8,
          { align: 'center' }
        );
        
        const creationDate = dayjs().format('DD/MM/YYYY HH:mm');
        doc.text(
          `تم الإنشاء في: ${creationDate}`,
          doc.internal.pageSize.width - footerMargin,
          doc.internal.pageSize.height - 8,
          { align: 'right' }
        );
        
        doc.setTextColor(0, 0, 0);
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

