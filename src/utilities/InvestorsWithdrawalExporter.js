import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
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

// Get withdrawal status text in Arabic
const getWithdrawingStatusText = (status) => {
  switch (status) {
    case 'WITHDRAWING':
      return 'قيد السحب';
    case 'WITHDRAWN':
      return 'تم السحب';
    default:
      return status || '-';
  }
};

// Get schedule status text in Arabic
const getScheduleStatusText = (status) => {
  switch (status) {
    case 'PAID':
      return 'مدفوع';
    case 'PENDING':
      return 'قيد الانتظار';
    default:
      return status || '-';
  }
};

// Get Arabic month name
const getArabicMonth = (month) => {
  const months = {
    1: 'يناير', 2: 'فبراير', 3: 'مارس', 4: 'أبريل',
    5: 'مايو', 6: 'يونيو', 7: 'يوليو', 8: 'أغسطس',
    9: 'سبتمبر', 10: 'أكتوبر', 11: 'نوفمبر', 12: 'ديسمبر'
  };
  return months[month] || month;
};

export const exportWithdrawalDetailsToPDF = async (withdrawalDetails) => {
  return new Promise((resolve, reject) => {
    try {
      if (!withdrawalDetails) {
        throw new Error('لا توجد بيانات للتصدير');
      }

      const { partner, withdrawal, schedule } = withdrawalDetails;

      // Create new PDF document
      const doc = new jsPDF();
      
      // Register Arabic fonts
      registerArabicFonts(doc);
      
      // Set document properties
      doc.setProperties({
        title: 'تقرير انسحاب المستثمر',
        subject: 'بيانات انسحاب المستثمر',
        author: 'نظام إدارة السلف',
        keywords: 'انسحاب, مستثمر, تقرير',
        creator: 'نظام إدارة السلف'
      });

      doc.setFont('Amiri', 'bold');
      
      const pageWidth = doc.internal.pageSize.width;
      const pageHeight = doc.internal.pageSize.height;
      
      // Logo positioned on the right
      const logoWidth = 10;
      const logoHeight = 10;
      const logoX = pageWidth - logoWidth - 5;
      const logoY = 5;
      doc.addImage(logo, 'PNG', logoX, logoY, logoWidth, logoHeight);
      
      // Title section
      doc.setFontSize(18);
      doc.setFont('Amiri', 'bold');
      doc.text('تقرير انسحاب المستثمر', pageWidth / 2, 30, { align: 'center' });
      
      doc.setFontSize(11);
      doc.setFont('Amiri', 'bold');
      doc.setTextColor(100, 100, 100);
      doc.text(`تاريخ التصدير: ${dayjs().format('DD/MM/YYYY HH:mm')}`, pageWidth / 2, 40, { align: 'center' });
      doc.setTextColor(0, 0, 0);

      let yPosition = 55;

      // ============================================
      // Table 1: معلومات المستثمر
      // ============================================
      doc.setFontSize(14);
      doc.setFont('Amiri', 'bold');
      doc.setTextColor(13, 64, 165);
      doc.text('معلومات المستثمر', pageWidth / 2, yPosition, { align: 'center' });
      yPosition += 10;

      const investorHeaders = [['القيمة', 'البيان']];
      const investorData = [
        [partner?.name || '-', 'الاسم'],
        [partner?.nationalId || '-', 'رقم الهوية الوطنية'],
        [getWithdrawingStatusText(partner?.withdrawingStatus), 'حالة السحب'],
        [partner?.isFrozen ? 'مجمّد' : 'نشط', 'الحالة'],
      ];

      autoTable(doc, {
        startY: yPosition,
        head: investorHeaders,
        body: investorData,
        theme: 'striped',
        styles: {
          font: 'Amiri',
          fontStyle: 'bold',
          fontSize: 10,
          cellPadding: { top: 5, bottom: 5, left: 6, right: 6 },
          lineColor: [220, 220, 220],
          lineWidth: 0.2,
          halign: 'right',
          valign: 'middle',
          direction: 'rtl'
        },
        headStyles: {
          fillColor: [46, 139, 69],
          textColor: 255,
          fontStyle: 'bold',
          fontSize: 11,
          halign: 'right',
          cellPadding: { top: 6, bottom: 6, left: 6, right: 6 },
        },
        columnStyles: {
          0: { cellWidth: 'auto', halign: 'right' },
          1: { cellWidth: 60, halign: 'right' }
        },
        margin: { left: 15, right: 15 },
        tableWidth: 'auto',
      });

      yPosition = doc.lastAutoTable.finalY + 15;

      // ============================================
      // Table 2: معلومات طلب الانسحاب
      // ============================================
      if (withdrawal) {
        doc.setFontSize(14);
        doc.setFont('Amiri', 'bold');
        doc.setTextColor(13, 64, 165);
        doc.text('معلومات طلب الانسحاب', pageWidth / 2, yPosition, { align: 'center' });
        yPosition += 10;

        const withdrawalHeaders = [['القيمة', 'البيان']];
        const withdrawalData = [
          [withdrawal.totalCapital?.toLocaleString('en-US') || '0', 'رأس المال الإجمالي'],
          [withdrawal.defaultShare?.toLocaleString('en-US') || '0', 'مبلغ التعثرات'],
          [withdrawal.remainingCapital?.toLocaleString('en-US') || '0', 'رأس المال المتبقي'],
          [withdrawal.savingAmount?.toLocaleString('en-US') || '0', 'مبلغ الادخار'],
          [withdrawal.monthlyAmount?.toLocaleString('en-US') || '0', 'المبلغ الشهري'],
          [withdrawal.createdAt ? dayjs(withdrawal.createdAt).format('DD/MM/YYYY') : '-', 'تاريخ الطلب'],
        ];

        autoTable(doc, {
          startY: yPosition,
          head: withdrawalHeaders,
          body: withdrawalData,
          theme: 'striped',
          styles: {
            font: 'Amiri',
            fontStyle: 'bold',
            fontSize: 10,
            cellPadding: { top: 5, bottom: 5, left: 6, right: 6 },
            lineColor: [220, 220, 220],
            lineWidth: 0.2,
            halign: 'right',
            valign: 'middle',
            direction: 'rtl'
          },
          headStyles: {
            fillColor: [46, 139, 69],
            textColor: 255,
            fontStyle: 'bold',
            fontSize: 11,
            halign: 'right',
            cellPadding: { top: 6, bottom: 6, left: 6, right: 6 },
          },
          columnStyles: {
            0: { cellWidth: 'auto', halign: 'right' },
            1: { cellWidth: 60, halign: 'right' }
          },
          margin: { left: 15, right: 15 },
          tableWidth: 'auto',
        });

        yPosition = doc.lastAutoTable.finalY + 15;
      }

      // ============================================
      // Table 3: جدول السحب
      // ============================================
      if (schedule && schedule.length > 0) {
        // Check if we need a new page
        if (yPosition > pageHeight - 80) {
          doc.addPage();
          yPosition = 25;
        }

        doc.setFontSize(14);
        doc.setFont('Amiri', 'bold');
        doc.setTextColor(13, 64, 165);
        doc.text('جدول السحب', pageWidth / 2, yPosition, { align: 'center' });
        yPosition += 10;

        const scheduleHeaders = [['تاريخ الدفع', 'الحالة', 'المدفوع', 'إجمالي المبلغ', 'المرحل', 'المبلغ', 'الشهر', 'السنة']];
        const scheduleData = schedule.map(item => [
          item.paidAt ? dayjs(item.paidAt).format('DD/MM/YYYY') : '-',
          getScheduleStatusText(item.status),
          item.paidAmount?.toLocaleString('en-US') || '0',
          ((item.amount || 0) + (item.carryAmount || 0)).toLocaleString('en-US'),
          item.carryAmount?.toLocaleString('en-US') || '0',
          item.amount?.toLocaleString('en-US') || '0',
          getArabicMonth(item.month) || item.month,
          item.year || '-',
        ]);

        autoTable(doc, {
          startY: yPosition,
          head: scheduleHeaders,
          body: scheduleData,
          theme: 'striped',
          styles: {
            font: 'Amiri',
            fontStyle: 'bold',
            fontSize: 9,
            cellPadding: { top: 4, bottom: 4, left: 3, right: 3 },
            lineColor: [220, 220, 220],
            lineWidth: 0.2,
            halign: 'center',
            valign: 'middle',
            direction: 'rtl'
          },
          headStyles: {
            fillColor: [46, 139, 69],
            textColor: 255,
            fontStyle: 'bold',
            fontSize: 9,
            halign: 'center',
            cellPadding: { top: 5, bottom: 5, left: 3, right: 3 },
          },
          columnStyles: {
            0: { cellWidth: 22 },
            1: { cellWidth: 22 },
            2: { cellWidth: 22 },
            3: { cellWidth: 25 },
            4: { cellWidth: 20 },
            5: { cellWidth: 22 },
            6: { cellWidth: 22 },
            7: { cellWidth: 18 },
          },
          margin: { left: 10, right: 10 },
          tableWidth: 'auto',
          pageBreak: 'auto',
          showHead: 'everyPage',
        });
      }

      // Footer
      const pageCount = doc.internal.getNumberOfPages();
      const footerMargin = 10;
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        
        doc.setDrawColor(200, 200, 200);
        doc.setLineWidth(0.5);
        doc.line(
          footerMargin,
          pageHeight - 15,
          pageWidth - footerMargin,
          pageHeight - 15
        );
        
        doc.setFontSize(9);
        doc.setFont('Amiri', 'bold');
        doc.setTextColor(100, 100, 100);
        
        doc.text(
          `صفحة ${i} من ${pageCount}`,
          pageWidth / 2,
          pageHeight - 8,
          { align: 'center' }
        );
        
        doc.text(
          `تم الإنشاء في: ${dayjs().format('DD/MM/YYYY HH:mm')}`,
          pageWidth - footerMargin,
          pageHeight - 8,
          { align: 'right' }
        );
        
        doc.setTextColor(0, 0, 0);
      }
      
      // Save PDF
      const fileName = `تقرير_انسحاب_${partner?.name?.replace(/[^a-zA-Z0-9\u0600-\u06FF]/g, '_') || 'مستثمر'}_${dayjs().format('YYYY-MM-DD')}.pdf`;
      doc.save(fileName);
      resolve();
    } catch (error) {
      console.error('PDF export error:', error.message);
      reject(error);
    }
  });
};

export const exportWithdrawalDetailsToExcel = async (withdrawalDetails) => {
  try {
    if (!withdrawalDetails) {
      throw new Error('لا توجد بيانات للتصدير');
    }

    const { partner, withdrawal, schedule } = withdrawalDetails;

    // Create workbook
    const workbook = XLSX.utils.book_new();
    
    // ============================================
    // Sheet 1: معلومات المستثمر
    // ============================================
    const investorData = [
      ['معلومات المستثمر'],
      [''],
      ['البيان', 'القيمة'],
      ['الاسم', partner?.name || '-'],
      ['رقم الهوية الوطنية', partner?.nationalId || '-'],
      ['حالة السحب', getWithdrawingStatusText(partner?.withdrawingStatus)],
      ['الحالة', partner?.isFrozen ? 'مجمّد' : 'نشط'],
    ];

    const investorSheet = XLSX.utils.aoa_to_sheet(investorData);
    investorSheet['!cols'] = [{ wch: 25 }, { wch: 35 }];
    XLSX.utils.book_append_sheet(workbook, investorSheet, 'معلومات المستثمر');

    // ============================================
    // Sheet 2: معلومات طلب الانسحاب
    // ============================================
    if (withdrawal) {
      const withdrawalData = [
        ['معلومات طلب الانسحاب'],
        [''],
        ['البيان', 'القيمة'],
        ['رأس المال الإجمالي', withdrawal.totalCapital || 0],
        ['مبلغ التعثرات', withdrawal.defaultShare || 0],
        ['رأس المال المتبقي', withdrawal.remainingCapital || 0],
        ['مبلغ الادخار', withdrawal.savingAmount || 0],
        ['المبلغ الشهري', withdrawal.monthlyAmount || 0],
        ['تاريخ الطلب', withdrawal.createdAt ? dayjs(withdrawal.createdAt).format('DD/MM/YYYY') : '-'],
      ];

      const withdrawalSheet = XLSX.utils.aoa_to_sheet(withdrawalData);
      withdrawalSheet['!cols'] = [{ wch: 25 }, { wch: 25 }];
      XLSX.utils.book_append_sheet(workbook, withdrawalSheet, 'طلب الانسحاب');
    }

    // ============================================
    // Sheet 3: جدول السحب
    // ============================================
    if (schedule && schedule.length > 0) {
      const scheduleData = [
        ['جدول السحب'],
        [''],
        ['السنة', 'الشهر', 'المبلغ', 'المرحل', 'إجمالي المبلغ', 'المدفوع', 'الحالة', 'تاريخ الدفع'],
        ...schedule.map(item => [
          item.year || '-',
          getArabicMonth(item.month) || item.month,
          item.amount || 0,
          item.carryAmount || 0,
          (item.amount || 0) + (item.carryAmount || 0),
          item.paidAmount || 0,
          getScheduleStatusText(item.status),
          item.paidAt ? dayjs(item.paidAt).format('DD/MM/YYYY') : '-',
        ])
      ];

      // Add totals row
      const totalAmount = schedule.reduce((sum, item) => sum + (item.amount || 0), 0);
      const totalCarry = schedule.reduce((sum, item) => sum + (item.carryAmount || 0), 0);
      const totalPaid = schedule.reduce((sum, item) => sum + (item.paidAmount || 0), 0);
      scheduleData.push(['']);
      scheduleData.push([
        'الإجمالي',
        '',
        totalAmount,
        totalCarry,
        totalAmount + totalCarry,
        totalPaid,
        '',
        ''
      ]);

      const scheduleSheet = XLSX.utils.aoa_to_sheet(scheduleData);
      scheduleSheet['!cols'] = [
        { wch: 12 },
        { wch: 15 },
        { wch: 15 },
        { wch: 15 },
        { wch: 18 },
        { wch: 15 },
        { wch: 15 },
        { wch: 15 },
      ];
      XLSX.utils.book_append_sheet(workbook, scheduleSheet, 'جدول السحب');
    }

    // Generate Excel file
    const excelBuffer = XLSX.write(workbook, { 
      bookType: 'xlsx', 
      type: 'array',
      bookSST: false 
    });
    
    const blob = new Blob([excelBuffer], { 
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
    });
    
    const fileName = `تقرير_انسحاب_${partner?.name?.replace(/[^a-zA-Z0-9\u0600-\u06FF]/g, '_') || 'مستثمر'}_${dayjs().format('YYYY-MM-DD')}.xlsx`;
    saveAs(blob, fileName);
    
  } catch (error) {
    console.error('Excel export error:', error.message);
    throw error;
  }
};
