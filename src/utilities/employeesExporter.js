import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

import { saveAs } from 'file-saver';
import dayjs from 'dayjs';
import logo from '/assets/images/logo.webp';

// Register Arabic fonts
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
      // Create new PDF document
      const doc = new jsPDF();
      
      // Register Arabic fonts
      registerArabicFonts(doc);
      
      // Set document properties
      doc.setProperties({
        title: 'الموظفين',
        subject: 'قائمة الموظفين',
        author: 'نظام إدارة السلف',
        keywords: 'موظفين, إدارة, سلف',
        creator: 'نظام إدارة السلف'
      });

      // Set Arabic as primary font
      doc.setFont('Amiri', 'bold');
      
      // Logo positioned on the right - small and at the very top
      const logoWidth = 10;
      const logoHeight = 10;
      const logoX = doc.internal.pageSize.width - logoWidth - 5;
      const logoY = 5;
      doc.addImage(logo, 'PNG', logoX, logoY, logoWidth, logoHeight);
      
      // Title section - start after logo
      doc.setFontSize(18);
      doc.setFont('Amiri', 'bold');
      doc.text('قائمة الموظفين', doc.internal.pageSize.width / 2, 25, { align: 'center' });
      
      // Search query info if exists
      if (searchQuery) {
        doc.setFontSize(11);
        doc.setFont('Amiri', 'bold');
        doc.text(`نتائج البحث عن: "${searchQuery}"`, doc.internal.pageSize.width / 2, 35, { align: 'center' });
      }
      
      // Summary section
      doc.setFontSize(11);
      doc.setFont('Amiri', 'bold');
      const summaryY = searchQuery ? 45 : 35;
      const activeEmployees = employeesData.filter(emp => emp.isActive).length;
      const inactiveEmployees = employeesData.filter(emp => !emp.isActive).length;
      const totalEmployees = employeesData.length;
      
      const summaryText = `إجمالي الموظفين: ${totalEmployees} | نشطين: ${activeEmployees} | غير نشطين: ${inactiveEmployees} | تاريخ التصدير: ${dayjs().format('DD/MM/YYYY HH:mm')}`;
      doc.text(summaryText, doc.internal.pageSize.width / 2, summaryY, { align: 'center' });
      
      let yPosition = summaryY + 12;
      
      // Prepare table data (RTL order)
      const tableData = employeesData.map(employee => [
        dayjs(employee.createdAt).format('DD/MM/YYYY'),
        employee.role?.name || 'بدون دور',
        getStatusArabic(employee.isActive),
        employee.phone || '-',
        employee.email,
        employee.name,
        employee.id.toString()
      ]);
      
      // Table headers (RTL order)
      const headers = [
        ['تاريخ الإنشاء', 'الدور', 'الحالة', 'رقم الهاتف', 'البريد الإلكتروني', 'الاسم', '#']
      ];
      
      // Create table with RTL support
      const pageWidth = doc.internal.pageSize.width;
      
      // Optimize column widths to fit on one page
      const columnWidths = {
        0: 22, // تاريخ الإنشاء
        1: 25, // الدور
        2: 18, // الحالة
        3: 25, // رقم الهاتف
        4: 45, // البريد الإلكتروني
        5: 35, // الاسم
        6: 12  // #
      };
      
      // Calculate table width to center it properly
      const totalColumnWidth = Object.values(columnWidths).reduce((sum, width) => sum + width, 0);
      const tableStartX = (pageWidth - totalColumnWidth) / 2;
      
      autoTable(doc, {
        startY: yPosition,
        startX: tableStartX,
        head: headers,
        body: tableData,
        theme: 'striped',
        styles: {
          font: 'Amiri',
          fontStyle: 'bold',
          fontSize: 8,
          cellPadding: 3,
          lineColor: [200, 200, 200],
          lineWidth: 0.1,
          halign: 'center',
          valign: 'middle'
        },
        headStyles: {
          fillColor: [240, 240, 240],
          textColor: [46, 139, 69],
          fontStyle: 'bold',
          fontSize: 9,
          halign: 'center',
          valign: 'middle',
          cellPadding: 4
        },
        bodyStyles: {
          fontStyle: 'bold',
          halign: 'center',
          valign: 'middle',
          cellPadding: 2
        },
        alternateRowStyles: {
          fillColor: [250, 250, 250]
        },
        columnStyles: {
          0: { cellWidth: columnWidths[0], fontSize: 7 }, // تاريخ الإنشاء
          1: { cellWidth: columnWidths[1], fontSize: 8 }, // الدور
          2: { cellWidth: columnWidths[2], fontSize: 8 }, // الحالة
          3: { cellWidth: columnWidths[3], fontSize: 8 }, // رقم الهاتف
          4: { cellWidth: columnWidths[4], fontSize: 7 }, // البريد الإلكتروني
          5: { cellWidth: columnWidths[5], fontSize: 8 }, // الاسم
          6: { cellWidth: columnWidths[6], fontSize: 8 }  // #
        },
        margin: { top: yPosition, bottom: 20 },
        tableWidth: totalColumnWidth,
        horizontalPageBreak: false,
        pageBreak: 'auto',
        showHead: 'everyPage',
       
      });
      
      // Footer - Professional styling
      const pageCount = doc.internal.getNumberOfPages();
      const footerMargin = 10;
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        
        // Draw footer line
        doc.setDrawColor(200, 200, 200);
        doc.setLineWidth(0.5);
        doc.line(
          footerMargin,
          doc.internal.pageSize.height - 15,
          doc.internal.pageSize.width - footerMargin,
          doc.internal.pageSize.height - 15
        );
        
        // Footer text
        doc.setFontSize(9);
        doc.setFont('Amiri', 'bold');
        doc.setTextColor(100, 100, 100);
        
        // Page number - centered
        doc.text(
          `صفحة ${i} من ${pageCount}`,
          doc.internal.pageSize.width / 2,
          doc.internal.pageSize.height - 8,
          { align: 'center' }
        );
        
        // Creation date - right aligned
        const creationDate = dayjs().format('DD/MM/YYYY HH:mm');
        doc.text(
          `تم الإنشاء في: ${creationDate}`,
          doc.internal.pageSize.width - footerMargin,
          doc.internal.pageSize.height - 8,
          { align: 'right' }
        );
        
        // Reset text color
        doc.setTextColor(0, 0, 0);
      }
      
      // Save PDF
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
    // Lazy load XLSX library
    const XLSX = await import('xlsx');

    // Create workbook
    const workbook = XLSX.utils.book_new();
    
    // Calculate summary statistics
    const activeEmployees = employeesData.filter(emp => emp.isActive).length;
    const inactiveEmployees = employeesData.filter(emp => !emp.isActive).length;
    const totalEmployees = employeesData.length;

    // Summary data
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
    
    // Add search query if exists
    if (searchQuery) {
      summaryData.splice(2, 0, [`نتائج البحث عن: "${searchQuery}"`]);
    }
    
    // Employees data
    const employeesSheetData = employeesData.map(employee => ({
      '#': employee.id,
      'الاسم': employee.name,
      'البريد الإلكتروني': employee.email,
      'رقم الهاتف': employee.phone || '-',
      'الحالة': getStatusArabic(employee.isActive),
      'الدور': employee.role?.name || 'بدون دور',
      'تاريخ الإنشاء': dayjs(employee.createdAt).format('DD/MM/YYYY')
    }));
    
    // Create summary sheet
    const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
    
    // Create employees sheet
    const employeesSheet = XLSX.utils.json_to_sheet(employeesSheetData);
    
    // Auto-size columns for better Excel display
    const wscols = [
      { wch: 8 },  // #
      { wch: 25 }, // الاسم
      { wch: 30 }, // البريد الإلكتروني
      { wch: 15 }, // رقم الهاتف
      { wch: 12 }, // الحالة
      { wch: 20 }, // الدور
      { wch: 15 }  // تاريخ الإنشاء
    ];
    employeesSheet['!cols'] = wscols;
    
    // Add sheets to workbook
    XLSX.utils.book_append_sheet(workbook, summarySheet, 'ملخص');
    XLSX.utils.book_append_sheet(workbook, employeesSheet, 'الموظفين');
    
    // Generate Excel file
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

