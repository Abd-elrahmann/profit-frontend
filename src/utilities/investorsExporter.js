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

// Normalize partner data from different endpoints to a consistent format
const normalizePartnerData = (partnerData) => {
  // Check if it's the detailed format from getPartnerDetails endpoint
  if (partnerData.profile) {
    return {
      id: partnerData.profile.id,
      name: partnerData.profile.name,
      nationalId: partnerData.profile.nationalId,
      phone: partnerData.profile.phone || '-',
      email: partnerData.profile.email || 'لا يوجد',
      address: partnerData.profile.address || '-',
      capitalAmount: partnerData.profile.capitalAmount || 0,
      orgProfitPercent: partnerData.profile.orgProfitPercent || 0,
      partnerProfitPercent: 100 - (partnerData.profile.orgProfitPercent || 0),
      totalProfit: partnerData.profile.totalProfit || 0,
      totalAmount: partnerData.profile.totalAmount || 0,
      createdAt: partnerData.profile.createdAt,
      isActive: partnerData.profile.isActive !== undefined ? partnerData.profile.isActive : true,
      transactions: partnerData.transactions || [],
      loans: partnerData.loans || [],
      summary: partnerData.summary || {},
      AccountEquity: partnerData.AccountEquity || null,
      AccountPayable: partnerData.AccountPayable || null,
    };
  }
  
  // Otherwise, it's the summary format from getAllPartners endpoint
  return {
    id: partnerData.id,
    name: partnerData.name,
    nationalId: partnerData.nationalId,
    phone: partnerData.phone || '-',
    email: partnerData.email || 'لا يوجد',
    address: partnerData.address || '-',
    capitalAmount: partnerData.capitalAmount || 0,
    orgProfitPercent: partnerData.orgProfitPercent || 0,
    partnerProfitPercent: partnerData.partnerProfitPercent || 0,
    totalProfit: partnerData.totalProfit || 0,
    totalAmount: partnerData.totalAmount || 0,
    accountBalance: partnerData.accountBalance || 0,
    loansCount: partnerData.loansCount || 0,
    totalDeposits: partnerData.totalDeposits || 0,
    totalWithdrawals: partnerData.totalWithdrawals || 0,
    totalAccruedProfit: partnerData.totalAccruedProfit || 0,
    zakat: partnerData.zakat || {},
    createdAt: partnerData.createdAt,
    isActive: partnerData.isActive !== undefined ? partnerData.isActive : true,
    transactions: partnerData.transactions || [],
    loans: partnerData.loans || [],
    AccountEquity: partnerData.AccountEquity || null,
    AccountPayable: partnerData.AccountPayable || null,
  };
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
      const pageHeight = doc.internal.pageSize.height;
      const tableMargin = 10; // Professional margin
      const tableMaxWidth = pageWidth - (tableMargin * 2);

      // Process each investor - each investor gets a new page
      investorsData.forEach((partnerData, index) => {
        // Normalize partner data to consistent format
        const investor = normalizePartnerData(partnerData);
        
        // Start new page for each investor (except first one)
        if (index > 0) {
          doc.addPage();
        }

        let yPosition = 55; // Starting position

        // Investor header - Name and National ID with better styling
        doc.setFontSize(16);
        doc.setFont('Amiri', 'bold');
        doc.setTextColor(13, 64, 165);
        doc.text(`المستثمر: ${investor.name}`, pageWidth / 2, yPosition, { align: 'center' });
        yPosition += 8;
        
        doc.setFontSize(11);
        doc.setFont('Amiri', 'normal');
        doc.setTextColor(100, 100, 100);
        doc.text(`رقم الهوية الوطنية: ${investor.nationalId}`, pageWidth / 2, yPosition, { align: 'center' });
        yPosition += 12;

        // Add section title
        doc.setFontSize(12);
        doc.setFont('Amiri', 'bold');
        doc.setTextColor(0, 0, 0);
        doc.text('التفاصيل الشخصية', pageWidth / 2, yPosition, { align: 'center' });
        yPosition += 8;

        // Tab 1: Personal Details Table - Professional layout
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

        // Calculate centered table position
        const personalTableWidth = Math.min(tableMaxWidth, 190);
        const personalTableStartX = (pageWidth - personalTableWidth) / 2;

        autoTable(doc, {
          startY: yPosition,
          startX: personalTableStartX,
          head: personalHeaders,
          body: personalData,
          theme: 'striped',
          styles: {
            font: 'Amiri',
            fontStyle: 'normal',
            fontSize: 9,
            cellPadding: { top: 4, bottom: 4, left: 4, right: 4 },
            lineColor: [220, 220, 220],
            lineWidth: 0.2,
            halign: 'right',
            valign: 'middle',
            overflow: 'linebreak',
            direction: 'rtl'
          },
          headStyles: {
            fillColor: [13, 64, 165],
            textColor: 255,
            fontStyle: 'bold',
            fontSize: 10,
            halign: 'right',
            valign: 'middle',
            cellPadding: { top: 6, bottom: 6, left: 6, right: 6 },
            overflow: 'linebreak',
            minCellHeight: 10,
            direction: 'rtl'
          },
          bodyStyles: {
            halign: 'right',
            valign: 'middle',
            cellPadding: 4,
            direction: 'rtl'
          },
          columnStyles: {
            0: { cellWidth: 28, halign: 'right' },
            1: { cellWidth: 25, halign: 'right' },
            2: { cellWidth: 32, halign: 'right' },
            3: { cellWidth: 25, halign: 'right' },
            4: { cellWidth: 35, halign: 'right' },
            5: { cellWidth: 25, halign: 'right' },
            6: { cellWidth: 20, halign: 'right' }
          },
          margin: { top: yPosition, bottom: 5 },
          tableWidth: personalTableWidth,
          horizontalPageBreak: false
        });

        yPosition = doc.lastAutoTable.finalY + 12;

        // Add section title
        doc.setFontSize(12);
        doc.setFont('Amiri', 'bold');
        doc.setTextColor(0, 0, 0);
        doc.text('المعلومات المالية', pageWidth / 2, yPosition, { align: 'center' });
        yPosition += 8;

        // Tab 2: Financial Information Table - Professional layout
        const financialHeaders = [['رأس المال', 'نسبة أرباح المنشأة', 'نسبة أرباح المستثمر', 'حساب رأس المال', 'حساب المستحقات']];
        const financialData = [[
          investor.capitalAmount ? investor.capitalAmount.toLocaleString('en-US') + ' ريال' : '-',
          investor.orgProfitPercent ? investor.orgProfitPercent + '%' : '-',
          investor.partnerProfitPercent ? investor.partnerProfitPercent + '%' : '-',
          investor.AccountEquity?.name || '-',
          investor.AccountPayable?.name || '-'
        ]];

        const financialTableWidth = Math.min(tableMaxWidth, 190);
        const financialTableStartX = (pageWidth - financialTableWidth) / 2;

        autoTable(doc, {
          startY: yPosition,
          startX: financialTableStartX,
          head: financialHeaders,
          body: financialData,
          theme: 'striped',
          styles: {
            font: 'Amiri',
            fontStyle: 'normal',
            fontSize: 9,
            cellPadding: { top: 4, bottom: 4, left: 4, right: 4 },
            lineColor: [220, 220, 220],
            lineWidth: 0.2,
            halign: 'right',
            valign: 'middle',
            overflow: 'linebreak',
            direction: 'rtl'
          },
          headStyles: {
            fillColor: [13, 64, 165],
            textColor: 255,
            fontStyle: 'bold',
            fontSize: 10,
            halign: 'right',
            valign: 'middle',
            cellPadding: { top: 6, bottom: 6, left: 6, right: 6 },
            overflow: 'linebreak',
            minCellHeight: 10,
            direction: 'rtl'
          },
          bodyStyles: {
            halign: 'right',
            valign: 'middle',
            cellPadding: 4,
            direction: 'rtl'
          },
          columnStyles: {
            0: { cellWidth: 38, halign: 'right' },
            1: { cellWidth: 35, halign: 'right' },
            2: { cellWidth: 35, halign: 'right' },
            3: { cellWidth: 40, halign: 'right' },
            4: { cellWidth: 40, halign: 'right' }
          },
          margin: { top: yPosition, bottom: 5 },
          tableWidth: financialTableWidth,
          horizontalPageBreak: false
        });

        yPosition = doc.lastAutoTable.finalY + 12;

        // Summary Section (if available from detailed endpoint)
        if (investor.summary) {
          // Check if we need a new page
          if (yPosition > pageHeight - 120) {
            doc.addPage();
            yPosition = 55;
            doc.setFontSize(16);
            doc.setFont('Amiri', 'bold');
            doc.setTextColor(13, 64, 165);
            doc.text(`المستثمر: ${investor.name}`, pageWidth / 2, yPosition, { align: 'center' });
            yPosition += 8;
            doc.setFontSize(11);
            doc.setFont('Amiri', 'normal');
            doc.setTextColor(100, 100, 100);
            doc.text(`رقم الهوية الوطنية: ${investor.nationalId}`, pageWidth / 2, yPosition, { align: 'center' });
            yPosition += 12;
          }

          // Add section title
          doc.setFontSize(12);
          doc.setFont('Amiri', 'bold');
          doc.setTextColor(0, 0, 0);
          doc.text('ملخص البيانات', pageWidth / 2, yPosition, { align: 'center' });
          yPosition += 8;

          // Summary Headers
          const summaryHeaders = [['الملخص', 'القيمة']];
          const summaryData = [
            ['إجمالي الأرباح الخام', investor.summary.profits?.totalRawShare?.toLocaleString('en-US') + ' ريال' || '0'],
            ['حصة الشركة', investor.summary.profits?.totalCompanyCut?.toLocaleString('en-US') + ' ريال' || '0'],
            ['إجمالي أرباح المستثمر', investor.summary.profits?.totalPartnerProfit?.toLocaleString('en-US') + ' ريال' || '0'],
            ['الأرباح الموزعة', investor.summary.profits?.distributedProfit?.toLocaleString('en-US') + ' ريال' || '0'],
            ['الأرباح غير الموزعة', investor.summary.profits?.undistributedProfit?.toLocaleString('en-US') + ' ريال' || '0'],
            [''],
            ['إجمالي القروض', investor.summary.loans?.totalLoans || '0'],
            ['القروض النشطة', investor.summary.loans?.activeLoans || '0'],
            ['القروض المكتملة', investor.summary.loans?.completedLoans || '0'],
            ['إجمالي مبلغ القروض', investor.summary.loans?.totalLoanAmount?.toLocaleString('en-US') + ' ريال' || '0'],
            [''],
            ['إجمالي الإيداعات', investor.summary.transactions?.totalDeposits?.toLocaleString('en-US') + ' ريال' || '0'],
            ['إجمالي السحوبات', investor.summary.transactions?.totalWithdrawals?.toLocaleString('en-US') + ' ريال' || '0'],
            [''],
            ['الزكاة المستحقة', investor.summary.zakat?.totalZakatAccrued?.toLocaleString('en-US') + ' ريال' || '0'],
            ['الزكاة المدفوعة', investor.summary.zakat?.totalZakatPaid?.toLocaleString('en-US') + ' ريال' || '0'],
            ['رصيد الزكاة', investor.summary.zakat?.zakatBalance?.toLocaleString('en-US') + ' ريال' || '0'],
          ];

          const summaryTableWidth = Math.min(tableMaxWidth, 120);
          const summaryTableStartX = (pageWidth - summaryTableWidth) / 2;

          autoTable(doc, {
            startY: yPosition,
            startX: summaryTableStartX,
            head: summaryHeaders,
            body: summaryData,
            theme: 'striped',
            styles: {
              font: 'Amiri',
              fontStyle: 'normal',
              fontSize: 9,
              cellPadding: { top: 4, bottom: 4, left: 4, right: 4 },
              lineColor: [220, 220, 220],
              lineWidth: 0.2,
              halign: 'right',
              valign: 'middle',
              overflow: 'linebreak',
              direction: 'rtl'
            },
            headStyles: {
              fillColor: [13, 64, 165],
              textColor: 255,
              fontStyle: 'bold',
              fontSize: 10,
              halign: 'right',
              valign: 'middle',
              cellPadding: { top: 6, bottom: 6, left: 6, right: 6 },
              overflow: 'linebreak',
              minCellHeight: 10,
              direction: 'rtl'
            },
            bodyStyles: {
              halign: 'right',
              valign: 'middle',
              cellPadding: 4,
              direction: 'rtl'
            },
            columnStyles: {
              0: { cellWidth: (summaryTableWidth * 0.55), halign: 'right' },
              1: { cellWidth: (summaryTableWidth * 0.45), halign: 'right' }
            },
            margin: { top: yPosition, bottom: 5 },
            tableWidth: summaryTableWidth,
            horizontalPageBreak: false
          });

          yPosition = doc.lastAutoTable.finalY + 12;
        }

        // Tab 3: Financial Transactions Table (if available)
        if (investor.transactions && Array.isArray(investor.transactions) && investor.transactions.length > 0) {
          // Check if we need a new page for transactions (within same investor page)
          if (yPosition > pageHeight - 80) {
            doc.addPage();
            yPosition = 55;
            // Redraw investor header on new page
            doc.setFontSize(16);
            doc.setFont('Amiri', 'bold');
            doc.setTextColor(13, 64, 165);
            doc.text(`المستثمر: ${investor.name}`, pageWidth / 2, yPosition, { align: 'center' });
            yPosition += 8;
            doc.setFontSize(11);
            doc.setFont('Amiri', 'normal');
            doc.setTextColor(100, 100, 100);
            doc.text(`رقم الهوية الوطنية: ${investor.nationalId}`, pageWidth / 2, yPosition, { align: 'center' });
            yPosition += 12;
          }

          // Add section title
          doc.setFontSize(12);
          doc.setFont('Amiri', 'bold');
          doc.setTextColor(0, 0, 0);
          doc.text('العمليات المالية', pageWidth / 2, yPosition, { align: 'center' });
          yPosition += 8;

          const transactionsData = investor.transactions.map(transaction => [
            transaction.reference || '-',
            getTransactionTypeText(transaction.type),
            transaction.amount ? transaction.amount.toLocaleString('en-US') + ' ريال' : '0',
            dayjs(transaction.date).format('DD/MM/YYYY HH:mm')
          ]);

          const transactionsHeaders = [['المرجع', 'نوع العملية', 'المبلغ', 'التاريخ']];
          
          const transactionsTableWidth = Math.min(tableMaxWidth, 190);
          const transactionsTableStartX = (pageWidth - transactionsTableWidth) / 2;

          autoTable(doc, {
            startY: yPosition,
            startX: transactionsTableStartX,
            head: transactionsHeaders,
            body: transactionsData,
            theme: 'striped',
            styles: {
              font: 'Amiri',
              fontStyle: 'normal',
              fontSize: 9,
              cellPadding: { top: 4, bottom: 4, left: 4, right: 4 },
              lineColor: [220, 220, 220],
              lineWidth: 0.2,
              halign: 'right',
              valign: 'middle',
              overflow: 'linebreak',
              direction: 'rtl'
            },
            headStyles: {
              fillColor: [13, 64, 165],
              textColor: 255,
              fontStyle: 'bold',
              fontSize: 10,
              halign: 'right',
              valign: 'middle',
              cellPadding: { top: 6, bottom: 6, left: 6, right: 6 },
              overflow: 'linebreak',
              minCellHeight: 10,
              direction: 'rtl'
            },
            bodyStyles: {
              halign: 'right',
              valign: 'middle',
              cellPadding: 4,
              direction: 'rtl'
            },
            columnStyles: {
              0: { cellWidth: (transactionsTableWidth * 0.22), halign: 'right' },
              1: { cellWidth: (transactionsTableWidth * 0.25), halign: 'right' },
              2: { cellWidth: (transactionsTableWidth * 0.28), halign: 'right' },
              3: { cellWidth: (transactionsTableWidth * 0.25), halign: 'right' }
            },
            margin: { top: yPosition, bottom: 5 },
            tableWidth: transactionsTableWidth,
            horizontalPageBreak: false,
            pageBreak: 'auto',
            showHead: 'everyPage'
          });

          yPosition = doc.lastAutoTable.finalY + 8;
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
    investorsData.forEach((partnerData, index) => {
      // Normalize partner data to consistent format
      const investor = normalizePartnerData(partnerData);
      
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
      ];

      // Add summary data if available (from detailed endpoint)
      if (investor.summary) {
        personalData.push(['']);
        personalData.push(['ملخص الأرباح']);
        personalData.push(['']);
        personalData.push(['إجمالي الأرباح الخام', investor.summary.profits?.totalRawShare || 0]);
        personalData.push(['حصة الشركة', investor.summary.profits?.totalCompanyCut || 0]);
        personalData.push(['إجمالي أرباح المستثمر', investor.summary.profits?.totalPartnerProfit || 0]);
        personalData.push(['الأرباح الموزعة', investor.summary.profits?.distributedProfit || 0]);
        personalData.push(['الأرباح غير الموزعة', investor.summary.profits?.undistributedProfit || 0]);
        personalData.push(['']);
        personalData.push(['ملخص القروض']);
        personalData.push(['']);
        personalData.push(['إجمالي القروض', investor.summary.loans?.totalLoans || 0]);
        personalData.push(['القروض النشطة', investor.summary.loans?.activeLoans || 0]);
        personalData.push(['القروض المكتملة', investor.summary.loans?.completedLoans || 0]);
        personalData.push(['إجمالي مبلغ القروض', investor.summary.loans?.totalLoanAmount || 0]);
        personalData.push(['']);
        personalData.push(['ملخص المعاملات']);
        personalData.push(['']);
        personalData.push(['إجمالي الإيداعات', investor.summary.transactions?.totalDeposits || 0]);
        personalData.push(['إجمالي السحوبات', investor.summary.transactions?.totalWithdrawals || 0]);
        personalData.push(['']);
        personalData.push(['ملخص الزكاة']);
        personalData.push(['']);
        personalData.push(['الزكاة المستحقة', investor.summary.zakat?.totalZakatAccrued || 0]);
        personalData.push(['الزكاة المدفوعة', investor.summary.zakat?.totalZakatPaid || 0]);
        personalData.push(['رصيد الزكاة', investor.summary.zakat?.zakatBalance || 0]);
      } else {
        // Add summary from basic endpoint
        personalData.push(['']);
        personalData.push(['إجمالي الإيداعات', investor.totalDeposits || 0]);
        personalData.push(['إجمالي السحوبات', investor.totalWithdrawals || 0]);
        personalData.push(['إجمالي الأرباح المستحقة', investor.totalAccruedProfit || 0]);
        personalData.push(['رصيد الحساب', investor.accountBalance || 0]);
        if (investor.zakat) {
          personalData.push(['']);
          personalData.push(['الزكاة المستحقة', investor.zakat.required || 0]);
          personalData.push(['الزكاة المدفوعة', investor.zakat.paid || 0]);
          personalData.push(['رصيد الزكاة', investor.zakat.balance || 0]);
        }
      }
      
      personalData.push(['']);

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

