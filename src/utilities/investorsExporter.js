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
  // Check if it's the direct partner data format (new format)
  if (partnerData.AccountPayable && typeof partnerData.AccountPayable === 'object') {
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
      createdAt: partnerData.createdAt,
      isActive: partnerData.isActive !== undefined ? partnerData.isActive : true,
      transactions: partnerData.transactions || [],
      loans: partnerData.loans || [],
      AccountEquity: partnerData.AccountEquity || null,
      AccountPayable: partnerData.AccountPayable || null,
      totalSaving: partnerData.totalSaving || 0,
      yearlyZakatRequired: partnerData.yearlyZakatRequired || 0,
      yearlyZakatPaid: partnerData.yearlyZakatPaid || 0,
      yearlyZakatBalance: partnerData.yearlyZakatBalance || 0,
    };
  }

  // Check if it's partner data with account IDs (alternative format)
  if (partnerData.accountPayableId || partnerData.accountEquityId) {
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
      createdAt: partnerData.createdAt,
      isActive: partnerData.isActive !== undefined ? partnerData.isActive : true,
      transactions: partnerData.transactions || [],
      loans: partnerData.loans || [],
      AccountEquity: partnerData.AccountEquity || { name: partnerData.accountEquityName || `رأس مال - ${partnerData.name}` },
      AccountPayable: partnerData.AccountPayable || { name: partnerData.accountPayableName || `مستحق - ${partnerData.name}` },
      totalSaving: partnerData.totalSaving || 0,
      yearlyZakatRequired: partnerData.yearlyZakatRequired || 0,
      yearlyZakatPaid: partnerData.yearlyZakatPaid || 0,
      yearlyZakatBalance: partnerData.yearlyZakatBalance || 0,
    };
  }

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
      doc.setFont('Amiri', 'bold');
      
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
      doc.setFont('Amiri', 'bold');
      const summaryText = `إجمالي المستثمرين: ${investorsData.length} | تاريخ التصدير: ${dayjs().format('DD/MM/YYYY HH:mm')}`;
      doc.text(summaryText, doc.internal.pageSize.width / 2, 45, { align: 'center' });
      
      const pageWidth = doc.internal.pageSize.width;
      const pageHeight = doc.internal.pageSize.height;

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
        doc.setFont('Amiri', 'bold');
        doc.setTextColor(100, 100, 100);
        doc.text(`رقم الهوية الوطنية: ${investor.nationalId}`, pageWidth / 2, yPosition, { align: 'center' });
        yPosition += 12;

        // Add section title
        doc.setFontSize(12);
        doc.setFont('Amiri', 'bold');
        doc.setTextColor(0, 0, 0);
        doc.text('التفاصيل الشخصية', pageWidth / 2, yPosition, { align: 'center' });
        yPosition += 8;

        // Tab 1: Personal Details Table - Vertical layout (like summary table)
        const personalHeaders = [['القيمة', 'المعلومة']];
        const personalData = [
          [investor.name || '-', 'الاسم الكامل'],
          [investor.nationalId || '-', 'رقم الهوية الوطنية'],
          [investor.phone || '-', 'رقم الجوال'],
          [investor.email || 'لا يوجد', 'البريد الإلكتروني'],
          [investor.address || '-', 'العنوان'],
          [investor.createdAt ? dayjs(investor.createdAt).format('DD/MM/YYYY') : '-', 'تاريخ الانضمام'],
          [investor.isActive ? 'نشط' : 'غير نشط', 'الحالة']
        ];

        autoTable(doc, {
          startY: yPosition,
          head: personalHeaders,
          body: personalData,
          theme: 'striped',
          styles: {
            font: 'Amiri',
            fontStyle: 'bold',
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
            fillColor: [240, 249, 244],
            textColor: [46, 139, 69],
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
            fontStyle: 'bold',
            halign: 'right',
            valign: 'middle',
            cellPadding: 4,
            direction: 'rtl'
          },
          columnStyles: {
            0: { cellWidth: 'auto', halign: 'right' },
            1: { cellWidth: 'auto', halign: 'right' }
          },
          margin: { top: yPosition, left: 15, right: 15 },
          tableWidth: 'auto',
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
        const financialHeaders = [['رأس المال', 'نسبة أرباح المنشأة', 'نسبة أرباح المستثمر']];
        const financialData = [[
          investor.capitalAmount ? investor.capitalAmount.toLocaleString('en-US') : '-',
          investor.orgProfitPercent ? investor.orgProfitPercent + '%' : '-',
          investor.partnerProfitPercent ? investor.partnerProfitPercent + '%' : '-'
        ]];

        autoTable(doc, {
          startY: yPosition,
          head: financialHeaders,
          body: financialData,
          theme: 'striped',
          styles: {
            font: 'Amiri',
            fontStyle: 'bold',
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
            fillColor: [240, 249, 244],
            textColor: [46, 139, 69],
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
            fontStyle: 'bold',
            halign: 'right',
            valign: 'middle',
            cellPadding: 4,
            direction: 'rtl'
          },
          columnStyles: {
            0: { cellWidth: 'auto', halign: 'right' },
            1: { cellWidth: 'auto', halign: 'right' },
            2: { cellWidth: 'auto', halign: 'right' },
            3: { cellWidth: 'auto', halign: 'right' },
            4: { cellWidth: 'auto', halign: 'right' }
          },
          margin: { top: yPosition, left: 15, right: 15 },
          tableWidth: 'auto',
          horizontalPageBreak: false
        });

        yPosition = doc.lastAutoTable.finalY + 12;

        // Summary Section (for new data format or detailed endpoint)
        if (investor.summary || investor.loans) {
          // Check if we need a new page
          if (yPosition > pageHeight - 120) {
            doc.addPage();
            // ابدأ من أعلى الصفحة للملخص عند الانتقال
            yPosition = 20;
            // إعادة رسم عنوان المستثمر للتسلسل
            doc.setFontSize(14);
            doc.setFont('Amiri', 'bold');
            doc.setTextColor(13, 64, 165);
            doc.text(`المستثمر: ${investor.name}`, pageWidth / 2, yPosition, { align: 'center' });
            yPosition += 8;
            doc.setFontSize(10);
            doc.setFont('Amiri', 'bold');
            doc.setTextColor(100, 100, 100);
            doc.text(`رقم الهوية الوطنية: ${investor.nationalId}`, pageWidth / 2, yPosition, { align: 'center' });
            yPosition += 10;
          }

          // Add section title
          doc.setFontSize(12);
          doc.setFont('Amiri', 'bold');
          doc.setTextColor(0, 0, 0);
          doc.text('ملخص البيانات', pageWidth / 2, yPosition, { align: 'center' });
          yPosition += 8;

          // Summary Headers
          const summaryHeaders = [['القيمة', 'الملخص']];

          // Calculate loan statistics
          const totalLoans = investor.loans ? investor.loans.length : 0;
          const activeLoans = investor.loans ? investor.loans.filter(loan => loan.status === 'ACTIVE').length : 0;
          const completedLoans = investor.loans ? investor.loans.filter(loan => loan.status === 'COMPLETED').length : 0;
          const totalLoanAmount = investor.loans ? investor.loans.reduce((sum, loan) => sum + (loan.amount || 0), 0) : 0;

          const summaryData = [
            [investor.totalAmount ? investor.totalAmount.toLocaleString('en-US') : '0', 'إجمالي الأرباح الخام'],
            [investor.summary?.profits?.totalCompanyCut ? investor.summary.profits.totalCompanyCut.toLocaleString('en-US') : ((investor.totalAmount || 0) - (investor.totalProfit || 0)).toLocaleString('en-US'), 'حصة الشركة'],
            [investor.totalProfit ? investor.totalProfit.toLocaleString('en-US') : '0', 'إجمالي أرباح المستثمر'],
            [investor.summary?.profits?.distributedProfit ? investor.summary.profits.distributedProfit.toLocaleString('en-US') : '0', 'الأرباح الموزعة'],
            [investor.summary?.profits?.undistributedProfit ? investor.summary.profits.undistributedProfit.toLocaleString('en-US') : investor.totalProfit ? investor.totalProfit.toLocaleString('en-US') : '0', 'الأرباح غير الموزعة'],
            [totalLoans.toString(), 'إجمالي القروض'],
            [activeLoans.toString(), 'القروض النشطة'],
            [completedLoans.toString(), 'القروض المكتملة'],
            [totalLoanAmount.toLocaleString('en-US'), 'إجمالي مبلغ القروض'],
            [investor.summary?.transactions?.totalDeposits ? investor.summary.transactions.totalDeposits.toLocaleString('en-US') : '0', 'إجمالي الإيداعات'],
            [investor.summary?.transactions?.totalWithdrawals ? investor.summary.transactions.totalWithdrawals.toLocaleString('en-US') : '0', 'إجمالي السحوبات'],
            [investor.yearlyZakatRequired ? investor.yearlyZakatRequired.toLocaleString('en-US') : (investor.summary?.zakat?.totalZakatAccrued ? investor.summary.zakat.totalZakatAccrued.toLocaleString('en-US') : '0'), 'الزكاة المستحقة'],
            [investor.yearlyZakatPaid ? investor.yearlyZakatPaid.toLocaleString('en-US') : (investor.summary?.zakat?.totalZakatPaid ? investor.summary.zakat.totalZakatPaid.toLocaleString('en-US') : '0'), 'الزكاة المدفوعة'],
            [investor.yearlyZakatBalance ? investor.yearlyZakatBalance.toLocaleString('en-US') : (investor.summary?.zakat?.zakatBalance ? investor.summary.zakat.zakatBalance.toLocaleString('en-US') : '0'), 'رصيد الزكاة'],
          ];

          // Track initial page for summary table
          const initialPage = doc.internal.getCurrentPageInfo().pageNumber;

          autoTable(doc, {
            startY: yPosition,
            head: summaryHeaders,
            body: summaryData,
            theme: 'striped',
            styles: {
              font: 'Amiri',
              fontStyle: 'bold',
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
              fillColor: [240, 249, 244],
              textColor: [46, 139, 69],
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
              fontStyle: 'bold',
              halign: 'right',
              valign: 'middle',
              cellPadding: 4,
              direction: 'rtl'
            },
            columnStyles: {
              0: { cellWidth: 'auto', halign: 'right' },
              1: { cellWidth: 'auto', halign: 'right' }
            },
            margin: { top: yPosition, left: 15, right: 15 },
            tableWidth: 'auto',
            horizontalPageBreak: false,
            pageBreak: 'auto',
            showHead: 'everyPage',
            didDrawPage: (data) => {
              // If table moved to a new page, adjust startY to start from top (20 instead of large margin)
              if (data.pageNumber > initialPage) {
                // Set startY to small value for continuation pages
                data.table.startY = 20;
                data.table.margin.top = 20;
              }
            }
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
            doc.setFont('Amiri', 'bold');
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
            transaction.amount ? transaction.amount.toLocaleString('en-US') :
            dayjs(transaction.date).format('DD/MM/YYYY HH:mm')
          ]);

          const transactionsHeaders = [['المرجع', 'نوع العملية', 'المبلغ', 'التاريخ']];
          
          autoTable(doc, {
            startY: yPosition,
            head: transactionsHeaders,
            body: transactionsData,
            theme: 'striped',
            styles: {
              font: 'Amiri',
              fontStyle: 'bold',
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
              fillColor: [240, 249, 244],
              textColor: [46, 139, 69],
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
              fontStyle: 'bold',
              halign: 'right',
              valign: 'middle',
              cellPadding: 4,
              direction: 'rtl'
            },
            columnStyles: {
              0: { cellWidth: 'auto', halign: 'right' },
              1: { cellWidth: 'auto', halign: 'right' },
              2: { cellWidth: 'auto', halign: 'right' },
              3: { cellWidth: 'auto', halign: 'right' }
            },
            margin: { top: yPosition, left: 15, right: 15 },
            tableWidth: 'auto',
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
        [investor.name || '-', 'الاسم الكامل'],
        [investor.nationalId || '-', 'رقم الهوية الوطنية'],
        [investor.phone || '-', 'رقم الجوال'],
        [investor.email || 'لا يوجد', 'البريد الإلكتروني'],
        [investor.address || '-', 'العنوان'],
        [investor.createdAt ? dayjs(investor.createdAt).format('DD/MM/YYYY') : '-', 'تاريخ الانضمام'],
        [investor.isActive ? 'نشط' : 'غير نشط', 'الحالة'],
        [''],
        ['المعلومات المالية'],
        [''],
        [investor.capitalAmount || 0, 'رأس المال'],
        [investor.orgProfitPercent || 0, 'نسبة أرباح المنشأة'],
        [investor.partnerProfitPercent || 0, 'نسبة أرباح المستثمر'],
      ];

      // Add summary data (for new format or detailed endpoint)
      if (investor.summary || investor.loans) {
        // Calculate loan statistics
        const totalLoans = investor.loans ? investor.loans.length : 0;
        const activeLoans = investor.loans ? investor.loans.filter(loan => loan.status === 'ACTIVE').length : 0;
        const completedLoans = investor.loans ? investor.loans.filter(loan => loan.status === 'COMPLETED').length : 0;
        const totalLoanAmount = investor.loans ? investor.loans.reduce((sum, loan) => sum + (loan.amount || 0), 0) : 0;

        personalData.push(['']);
        personalData.push(['ملخص الأرباح']);
        personalData.push(['']);
        personalData.push([investor.totalAmount || 0, 'إجمالي الأرباح الخام']);
        personalData.push([investor.summary?.profits?.totalCompanyCut || ((investor.totalAmount || 0) - (investor.totalProfit || 0)), 'حصة الشركة']);
        personalData.push([investor.totalProfit || 0, 'إجمالي أرباح المستثمر']);
        personalData.push([investor.summary?.profits?.distributedProfit || 0, 'الأرباح الموزعة']);
        personalData.push([investor.summary?.profits?.undistributedProfit || investor.totalProfit || 0, 'الأرباح غير الموزعة']);
        personalData.push(['']);
        personalData.push(['ملخص القروض']);
        personalData.push(['']);
        personalData.push([totalLoans, 'إجمالي القروض']);
        personalData.push([activeLoans, 'القروض النشطة']);
        personalData.push([completedLoans, 'القروض المكتملة']);
        personalData.push([totalLoanAmount, 'إجمالي مبلغ القروض']);
        personalData.push(['']);
        personalData.push(['ملخص المعاملات']);
        personalData.push(['']);
        personalData.push([investor.summary?.transactions?.totalDeposits || 0, 'إجمالي الإيداعات']);
        personalData.push([investor.summary?.transactions?.totalWithdrawals || 0, 'إجمالي السحوبات']);
        personalData.push(['']);
        personalData.push(['ملخص الزكاة']);
        personalData.push(['']);
        personalData.push([investor.yearlyZakatRequired || investor.summary?.zakat?.totalZakatAccrued || 0, 'الزكاة المستحقة']);
        personalData.push([investor.yearlyZakatPaid || investor.summary?.zakat?.totalZakatPaid || 0, 'الزكاة المدفوعة']);
        personalData.push([investor.yearlyZakatBalance || investor.summary?.zakat?.zakatBalance || 0, 'رصيد الزكاة']);
      } else {
        // Add summary from basic endpoint
        personalData.push(['']);
        personalData.push([investor.totalDeposits || 0, 'إجمالي الإيداعات']);
        personalData.push([investor.totalWithdrawals || 0, 'إجمالي السحوبات']);
        personalData.push([investor.totalAccruedProfit || 0, 'إجمالي الأرباح المستحقة']);
        personalData.push([investor.accountBalance || 0, 'رصيد الحساب']);
        if (investor.zakat) {
          personalData.push(['']);
          personalData.push([investor.zakat.required || 0, 'الزكاة المستحقة']);
          personalData.push([investor.zakat.paid || 0, 'الزكاة المدفوعة']);
          personalData.push([investor.zakat.balance || 0, 'رصيد الزكاة']);
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
        { wch: 30 },
        { wch: 25 }
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

