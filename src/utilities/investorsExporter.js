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

export const exportInvestorsToPDF = async (investorsData) => {
  return new Promise((resolve, reject) => {
    try {
      // Validate data
      if (!investorsData || !Array.isArray(investorsData) || investorsData.length === 0) {
        throw new Error('لا توجد بيانات للتصدير');
      }

      // Create new PDF document
      const doc = new jsPDF();
      
      // Register Arabic fonts
      registerArabicFonts(doc);
      
      // Set document properties
      doc.setProperties({
        title: 'تقرير المستثمرين',
        subject: 'بيانات المستثمرين',
        author: 'نظام إدارة السلف',
        keywords: 'مستثمرين, تقرير, بيانات',
        creator: 'نظام إدارة السلف'
      });

      // Set Arabic as primary font
      doc.setFont('Amiri', 'normal');
      
      // Logo positioned on the right - small and at the very top
      const logoWidth = 10;
      const logoHeight = 10;
      const logoX = doc.internal.pageSize.width - logoWidth - 5;
      const logoY = 5;
      doc.addImage(logo, 'PNG', logoX, logoY, logoWidth, logoHeight);
      
      // Title section - with more spacing to avoid overlap
      doc.setFontSize(18);
      doc.setFont('Amiri', 'bold');
      doc.text('تقرير المستثمرين', doc.internal.pageSize.width / 2, 30, { align: 'center' });
      
      doc.setFontSize(11);
      doc.setFont('Amiri', 'normal');
      const summaryText = `إجمالي المستثمرين: ${investorsData.length} | تاريخ التصدير: ${dayjs().format('DD/MM/YYYY HH:mm')}`;
      doc.text(summaryText, doc.internal.pageSize.width / 2, 45, { align: 'center' });
      
      const pageWidth = doc.internal.pageSize.width;
      const tableMargin = 5; // Reduced margin to widen table

      // Process each investor - each investor gets a new page
      investorsData.forEach((investor, index) => {
        // Start new page for each investor (except first one)
        if (index > 0) {
          doc.addPage();
        }

        let yPosition = 60; // Increased starting position to avoid overlap with title and summary

        // Investor header - Name and National ID
        doc.setFontSize(14);
        doc.setFont('Amiri', 'bold');
        doc.text(`المستثمر: ${investor.name}`, pageWidth / 2, yPosition, { align: 'center' });
        yPosition += 10;
        
        doc.setFontSize(11);
        doc.setFont('Amiri', 'normal');
        doc.text(`رقم الهوية الوطنية: ${investor.nationalId}`, pageWidth / 2, yPosition, { align: 'center' });
        yPosition += 15;

        // Tab 1: Personal Details Table - Horizontal layout
        const personalHeaders = [['الاسم الكامل', 'رقم الهوية', 'البريد الإلكتروني', 'رقم الجوال', 'العنوان', 'تاريخ الانضمام', 'الحالة']];
        const personalData = [[
          investor.name || '-',
          investor.nationalId || '-',
          investor.email || 'لا يوجد',
          investor.phone || '-',
          investor.address || '-',
          investor.createdAt ? dayjs(investor.createdAt).format('DD/MM/YYYY') : '-',
          investor.isActive ? 'نشط' : 'غير نشط'
        ]];

        const personalTableWidth = pageWidth - (tableMargin * 2);
        const personalTableStartX = tableMargin;

        autoTable(doc, {
          startY: yPosition,
          startX: personalTableStartX,
          head: personalHeaders,
          body: personalData,
          theme: 'striped',
          styles: {
            font: 'Amiri',
            fontStyle: 'normal',
            fontSize: 8,
            cellPadding: 3,
            lineColor: [200, 200, 200],
            lineWidth: 0.1,
            halign: 'right',
            valign: 'middle',
            overflow: 'linebreak',
            direction: 'rtl'
          },
          headStyles: {
            fillColor: [13, 64, 165],
            textColor: 255,
            fontStyle: 'bold',
            fontSize: 9,
            halign: 'right',
            valign: 'middle',
            cellPadding: 5,
            overflow: 'hidden', // Prevent line break in headers
            direction: 'rtl'
          },
          bodyStyles: {
            halign: 'right',
            valign: 'middle',
            cellPadding: 3,
            direction: 'rtl'
          },
          columnStyles: {
            0: { cellWidth: 25, halign: 'right' },
            1: { cellWidth: 20, halign: 'right' },
            2: { cellWidth: 30, halign: 'right' },
            3: { cellWidth: 20, halign: 'right' },
            4: { cellWidth: 35, halign: 'right' },
            5: { cellWidth: 20, halign: 'right' },
            6: { cellWidth: 15, halign: 'right' }
          },
          margin: { top: yPosition, bottom: 5 },
          tableWidth: personalTableWidth,
          horizontalPageBreak: false
        });

        yPosition = doc.lastAutoTable.finalY + 10;

        // Tab 2: Financial Information Table - Horizontal layout
        const financialHeaders = [['رأس المال', 'نسبة أرباح المنشأة', 'نسبة أرباح المستثمر', 'حساب رأس المال', 'حساب المستحقات']];
        const financialData = [[
          investor.capitalAmount ? investor.capitalAmount.toLocaleString('en-US') + ' ريال' : '-',
          investor.orgProfitPercent ? investor.orgProfitPercent + '%' : '-',
          investor.partnerProfitPercent ? investor.partnerProfitPercent + '%' : '-',
          investor.AccountEquity?.name || '-',
          investor.AccountPayable?.name || '-'
        ]];

        autoTable(doc, {
          startY: yPosition,
          startX: personalTableStartX,
          head: financialHeaders,
          body: financialData,
          theme: 'striped',
          styles: {
            font: 'Amiri',
            fontStyle: 'normal',
            fontSize: 8,
            cellPadding: 3,
            lineColor: [200, 200, 200],
            lineWidth: 0.1,
            halign: 'right',
            valign: 'middle',
            overflow: 'linebreak',
            direction: 'rtl'
          },
          headStyles: {
            fillColor: [13, 64, 165],
            textColor: 255,
            fontStyle: 'bold',
            fontSize: 9,
            halign: 'right',
            valign: 'middle',
            cellPadding: 5,
            overflow: 'hidden', // Prevent line break in headers
            direction: 'rtl'
          },
          bodyStyles: {
            halign: 'right',
            valign: 'middle',
            cellPadding: 3,
            direction: 'rtl'
          },
          columnStyles: {
            0: { cellWidth: 35, halign: 'right' },
            1: { cellWidth: 30, halign: 'right' },
            2: { cellWidth: 30, halign: 'right' },
            3: { cellWidth: 40, halign: 'right' },
            4: { cellWidth: 40, halign: 'right' }
          },
          margin: { top: yPosition, bottom: 5 },
          tableWidth: personalTableWidth,
          horizontalPageBreak: false
        });

        yPosition = doc.lastAutoTable.finalY + 10;

        // Tab 3: Financial Transactions Table (if available)
        if (investor.transactions && Array.isArray(investor.transactions) && investor.transactions.length > 0) {
          // Check if we need a new page for transactions (within same investor page)
          if (yPosition > doc.internal.pageSize.height - 80) {
            doc.addPage();
            yPosition = 60;
            // Redraw investor header on new page
            doc.setFontSize(14);
            doc.setFont('Amiri', 'bold');
            doc.text(`المستثمر: ${investor.name}`, pageWidth / 2, yPosition, { align: 'center' });
            yPosition += 10;
            doc.setFontSize(11);
            doc.setFont('Amiri', 'normal');
            doc.text(`رقم الهوية الوطنية: ${investor.nationalId}`, pageWidth / 2, yPosition, { align: 'center' });
            yPosition += 15;
          }

          const transactionsData = investor.transactions.map(transaction => [
            transaction.reference || '-',
            getTransactionTypeText(transaction.type),
            transaction.amount ? transaction.amount.toLocaleString('en-US') + ' ريال' : '0',
            dayjs(transaction.date).format('DD/MM/YYYY HH:mm')
          ]);

          const transactionsHeaders = [['المرجع', 'نوع العملية', 'المبلغ', 'التاريخ']];
          
          const transactionsTableWidth = pageWidth - (tableMargin * 2);
          const transactionsTableStartX = tableMargin;

          autoTable(doc, {
            startY: yPosition,
            startX: transactionsTableStartX,
            head: transactionsHeaders,
            body: transactionsData,
            theme: 'striped',
            styles: {
              font: 'Amiri',
              fontStyle: 'normal',
              fontSize: 8,
              cellPadding: 3,
              lineColor: [200, 200, 200],
              lineWidth: 0.1,
              halign: 'right',
              valign: 'middle',
              overflow: 'linebreak',
              direction: 'rtl'
            },
            headStyles: {
              fillColor: [13, 64, 165],
              textColor: 255,
              fontStyle: 'bold',
              fontSize: 9,
              halign: 'right',
              valign: 'middle',
              cellPadding: 5,
              overflow: 'hidden', // Prevent line break in headers
              direction: 'rtl'
            },
            bodyStyles: {
              halign: 'right',
              valign: 'middle',
              cellPadding: 2,
              direction: 'rtl'
            },
            columnStyles: {
              0: { cellWidth: (transactionsTableWidth * 0.2), fontSize: 7, halign: 'right' },
              1: { cellWidth: (transactionsTableWidth * 0.25), fontSize: 7, halign: 'right' },
              2: { cellWidth: (transactionsTableWidth * 0.25), fontSize: 8, halign: 'right' },
              3: { cellWidth: (transactionsTableWidth * 0.3), fontSize: 7, halign: 'right' }
            },
            margin: { top: yPosition, bottom: 5 },
            tableWidth: transactionsTableWidth,
            horizontalPageBreak: false,
            pageBreak: 'auto',
            showHead: 'everyPage'
          });

          yPosition = doc.lastAutoTable.finalY + 8;
        }

        // Tab 4: Documents (if available)
        if (investor.mudarabahFileUrl) {
          if (yPosition > doc.internal.pageSize.height - 50) {
            doc.addPage();
            yPosition = 60;
            // Redraw investor header on new page
            doc.setFontSize(14);
            doc.setFont('Amiri', 'bold');
            doc.text(`المستثمر: ${investor.name}`, pageWidth / 2, yPosition, { align: 'center' });
            yPosition += 10;
            doc.setFontSize(11);
            doc.setFont('Amiri', 'normal');
            doc.text(`رقم الهوية الوطنية: ${investor.nationalId}`, pageWidth / 2, yPosition, { align: 'center' });
            yPosition += 15;
          }

          const documentsData = [
            ['عقد المضاربة', 'مرفوع']
          ];

          const documentsHeaders = [['المستند', 'الحالة']];
          const documentsTableWidth = pageWidth - (tableMargin * 2);
          const documentsTableStartX = tableMargin;

          autoTable(doc, {
            startY: yPosition,
            startX: documentsTableStartX,
            head: documentsHeaders,
            body: documentsData,
            theme: 'striped',
            styles: {
              font: 'Amiri',
              fontStyle: 'normal',
              fontSize: 9,
              cellPadding: 3,
              lineColor: [200, 200, 200],
              lineWidth: 0.1,
              halign: 'right',
              valign: 'middle',
              overflow: 'linebreak',
              direction: 'rtl'
            },
            headStyles: {
              fillColor: [13, 64, 165],
              textColor: 255,
              fontStyle: 'bold',
              fontSize: 9,
              halign: 'right',
              valign: 'middle',
              cellPadding: 5,
              overflow: 'hidden', // Prevent line break in headers
              direction: 'rtl'
            },
            bodyStyles: {
              halign: 'right',
              valign: 'middle',
              cellPadding: 3,
              direction: 'rtl'
            },
            columnStyles: {
              0: { cellWidth: (documentsTableWidth / 2), halign: 'right' },
              1: { cellWidth: (documentsTableWidth / 2), halign: 'right' }
            },
            margin: { top: yPosition, bottom: 5 },
            tableWidth: documentsTableWidth,
            horizontalPageBreak: false
          });

          yPosition = doc.lastAutoTable.finalY + 10;
        }
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
        doc.setFont('Amiri', 'normal');
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
      const fileName = `تقرير_المستثمرين_${dayjs().format('YYYY-MM-DD')}.pdf`;
      doc.save(fileName);
      resolve();
    } catch (error) {
      console.error('PDF export error:', error.message);
      reject(error);
    }
  });
};

export const exportInvestorsToExcel = async (investorsData) => {
  try {
    // Validate data
    if (!investorsData || !Array.isArray(investorsData) || investorsData.length === 0) {
      throw new Error('لا توجد بيانات للتصدير');
    }

    // Create workbook
    const workbook = XLSX.utils.book_new();
    
    // Process each investor
    investorsData.forEach((investor, index) => {
      const sheetName = `${investor.name.substring(0, 25)}` || `مستثمر ${index + 1}`;
      
      // Personal Details
      const personalData = [
        ['التفاصيل الشخصية'],
        [''],
        ['الاسم الكامل', investor.name || '-'],
        ['رقم الهوية الوطنية', investor.nationalId || '-'],
        ['البريد الإلكتروني', investor.email || 'لا يوجد'],
        ['رقم الجوال', investor.phone || '-'],
        ['العنوان', investor.address || '-'],
        ['تاريخ الانضمام', investor.createdAt ? dayjs(investor.createdAt).format('DD/MM/YYYY') : '-'],
        ['الحالة', investor.isActive ? 'نشط' : 'غير نشط'],
        [''],
        ['المعلومات المالية'],
        [''],
        ['رأس المال', investor.capitalAmount || 0],
        ['نسبة أرباح المنشأة', investor.orgProfitPercent || 0],
        ['نسبة أرباح المستثمر', investor.partnerProfitPercent || 0],
        ['حساب رأس المال', investor.AccountEquity?.name || '-'],
        ['حساب المستحقات', investor.AccountPayable?.name || '-'],
        ['']
      ];

      // Financial Transactions
      if (investor.transactions && Array.isArray(investor.transactions) && investor.transactions.length > 0) {
        personalData.push(['العمليات المالية']);
        personalData.push(['']);
        personalData.push(['المرجع', 'نوع العملية', 'المبلغ', 'التاريخ']);
        investor.transactions.forEach(transaction => {
          personalData.push([
            transaction.reference || '-',
            getTransactionTypeText(transaction.type),
            transaction.amount || 0,
            dayjs(transaction.date).format('DD/MM/YYYY HH:mm')
          ]);
        });
        personalData.push(['']);
      }

      // Documents
      if (investor.mudarabahFileUrl) {
        personalData.push(['المستندات']);
        personalData.push(['']);
        personalData.push(['عقد المضاربة', 'مرفوع']);
      }

      // Create sheet
      const sheet = XLSX.utils.aoa_to_sheet(personalData);
      
      // Auto-size columns
      sheet['!cols'] = [
        { wch: 25 },
        { wch: 30 }
      ];
      
      // Add sheet to workbook
      XLSX.utils.book_append_sheet(workbook, sheet, sheetName);
    });
    
    // Generate Excel file
    const excelBuffer = XLSX.write(workbook, { 
      bookType: 'xlsx', 
      type: 'array',
      bookSST: false 
    });
    
    const blob = new Blob([excelBuffer], { 
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
    });
    
    const fileName = `تقرير_المستثمرين_${dayjs().format('YYYY-MM-DD')}.xlsx`;
    saveAs(blob, fileName);
    
  } catch (error) {
    console.error('Excel export error:', error.message);
    throw error;
  }
};

const getTransactionTypeText = (type) => {
  switch (type) {
    case "DEPOSIT":
      return "إيداع";
    case "WITHDRAWAL":
      return "سحب";
    default:
      return type;
  }
};

