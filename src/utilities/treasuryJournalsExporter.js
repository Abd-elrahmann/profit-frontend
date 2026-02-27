import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

import { saveAs } from 'file-saver';
import { pdfTableBaseStyles, createDidDrawTable } from './pdfTableStyles';
import { registerArabicFonts, drawReportHeader, drawSeparatorLine, drawReportFooter, getCenteredTableMargins, PRIMARY_COLOR } from './pdfReportUtils';
import dayjs from 'dayjs';

export const exportJournalsToPDF = async (journalData, accountName) => {
  return new Promise((resolve, reject) => {
    try {
    
      if (!journalData) {
        throw new Error('لا توجد بيانات للتصدير');
      }

      const doc = new jsPDF();
      
      registerArabicFonts(doc);
      
      doc.setProperties({
        title: `سجل القيود - ${accountName}`,
        subject: 'سجل القيود المحاسبية',
        author: 'نظام إدارة السلف',
        keywords: 'قيود, محاسبة, صندوق, سلف',
        creator: 'نظام إدارة السلف'
      });

      let yPosition = drawReportHeader(doc, {
        reportTitle: 'سجل القيود المحاسبية',
        metadata: { date: dayjs().format('DD/MM/YYYY'), time: dayjs().format('HH:mm') }
      });
      yPosition = drawSeparatorLine(doc, yPosition);

      doc.setFontSize(13);
      doc.setFont('Amiri', 'bold');
      doc.text(`الحساب: ${accountName}`, doc.internal.pageSize.width / 2, yPosition, { align: 'center' });
      yPosition += 10;
      
      const allJournals = [];
      if (journalData.journalsByMonth) {
        Object.values(journalData.journalsByMonth).forEach(monthData => {
          if (monthData.entries && Array.isArray(monthData.entries)) {
            allJournals.push(...monthData.entries);
          }
        });
      }
      
      if (allJournals.length === 0 && journalData.journals && Array.isArray(journalData.journals)) {
        allJournals.push(...journalData.journals);
      }
      
      allJournals.sort((a, b) => new Date(b.date) - new Date(a.date));
      
      const totalDebit = allJournals.reduce((sum, journal) => sum + (journal.debit || 0), 0);
      const totalCredit = allJournals.reduce((sum, journal) => sum + (journal.credit || 0), 0);
      const currentBalance = journalData.account?.balance || 0;
      const totalJournals = allJournals.length;
      
      doc.setFontSize(11);
      doc.setFont('Amiri', 'bold');
      const summaryY = yPosition;
      const summaryText = `إجمالي المدين: ${totalDebit.toLocaleString('en-US')}  |  إجمالي الدائن: ${totalCredit.toLocaleString('en-US')}  |  الرصيد الحالي: ${currentBalance.toLocaleString('en-US')}  |  عدد القيود: ${totalJournals}`;
      doc.text(summaryText, doc.internal.pageSize.width / 2, summaryY, { align: 'center' });
      
      yPosition = summaryY + 12;
      
      const tableData = [];
      allJournals.forEach(journal => {
        tableData.push([
          (journal.balance || 0).toLocaleString('en-US'),
          journal.credit > 0 ? journal.credit.toLocaleString('en-US') : '0',
          journal.debit > 0 ? journal.debit.toLocaleString('en-US') : '0',
          journal.description || '-',
          journal.postedBy || 'غير محدد',
          dayjs(journal.date).format('DD/MM/YYYY hh:mm')
        ]);
      });
      
      const headers = [
        ['الرصيد', 'دائن', 'مدين', 'الوصف', 'المرحل بواسطة', 'التاريخ']
      ];
      
      const pageWidth = doc.internal.pageSize.width;
      
      const columnWidths = {
        0: 25,
        1: 22,
        2: 22,
        3: 45,
        4: 28,
        5: 26
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
          3: { cellWidth: columnWidths[3], fontSize: 9, halign: 'right' },
          4: { cellWidth: columnWidths[4], fontSize: 9 },
          5: { cellWidth: columnWidths[5], fontSize: 9 }
        },
        margin: { top: yPosition, left: tableMargins.left, right: tableMargins.right, bottom: 25 },
        tableWidth: totalColumnWidth,
        horizontalPageBreak: false,
        pageBreak: 'auto',
        showHead: 'everyPage',
        didParseCell: function (data) {
          if (data.section === 'head') {
            if (data.cell.text && data.cell.text.length > 0) {
              const textLength = data.cell.text[0].length;
              const columnWidth = columnWidths[data.column.index];
              
              if (textLength > 8 && columnWidth < 25) {
                data.cell.styles.fontSize = 7;
              } else if (textLength > 12) {
                data.cell.styles.fontSize = 7;
              }
              
              data.cell.styles.cellPadding = 3;
            }
          } else {
            if (data.cell.text && data.cell.text.length > 0) {
              const maxLength = data.column.index === 3 ? 45 : 20;
              if (data.cell.text[0].length > maxLength) {
                data.cell.text[0] = data.cell.text[0].substring(0, maxLength) + '...';
              }
            }
          }
        },
        didDrawTable: createDidDrawTable(doc)
      });
      
      const pageCount = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        drawReportFooter(doc, i, pageCount);
      }
      
      const fileName = `سجل_القيود_${accountName}_${dayjs().format('YYYY-MM-DD')}.pdf`;
      doc.save(fileName);
      resolve();
    } catch (error) {
      console.error('PDF export error:', error.message);
      reject(error);
    }
  });
};

export const exportJournalsToExcel = async (journalData, accountName) => {
  try {
    if (!journalData) {
      throw new Error('لا توجد بيانات للتصدير');
    }

    const allJournals = [];
    if (journalData.journalsByMonth) {
      Object.values(journalData.journalsByMonth).forEach(monthData => {
        if (monthData.entries && Array.isArray(monthData.entries)) {
          allJournals.push(...monthData.entries);
        }
      });
    }
    
    if (allJournals.length === 0 && journalData.journals && Array.isArray(journalData.journals)) {
      allJournals.push(...journalData.journals);
    }
    
    allJournals.sort((a, b) => new Date(b.date) - new Date(a.date));

    // Lazy load XLSX library
    const XLSX = await import('xlsx');

    const workbook = XLSX.utils.book_new();
    
    const totalDebit = allJournals.reduce((sum, journal) => sum + (journal.debit || 0), 0);
    const totalCredit = allJournals.reduce((sum, journal) => sum + (journal.credit || 0), 0);
    const currentBalance = journalData.account?.balance || 0;
    const totalJournals = allJournals.length;
    
    const summaryData = [
      ['سجل القيود المحاسبية'],
      [`الحساب: ${accountName}`],
      [''],
      ['إجمالي المدين', totalDebit],
      ['إجمالي الدائن', totalCredit],
      ['الرصيد الحالي', currentBalance],
      ['عدد القيود', totalJournals],
      ['']
    ];
    
    const journalsData = [];
    allJournals.forEach(journal => {
      journalsData.push({
        'التاريخ': dayjs(journal.date).format('DD/MM/YYYY hh:mm'),
        'الوصف': journal.description || '-',
        'مدين': journal.debit > 0 ? journal.debit : 0,
        'دائن': journal.credit > 0 ? journal.credit : 0,
        'الرصيد': journal.balance || 0,
        'المرحل بواسطة': journal.postedBy || 'غير محدد',
        'نوع القيد': getJournalTypeArabic(journal.type)
      });
    });
    
    const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
    
    const journalsSheet = XLSX.utils.json_to_sheet(journalsData);
    
    const wscols = [
      { wch: 20 },
      { wch: 40 },
      { wch: 12 },
      { wch: 12 },
      { wch: 15 },
      { wch: 15 },
      { wch: 15 }
    ];
    journalsSheet['!cols'] = wscols;
    
    XLSX.utils.book_append_sheet(workbook, summarySheet, 'ملخص');
    XLSX.utils.book_append_sheet(workbook, journalsSheet, 'القيود');
    
    const excelBuffer = XLSX.write(workbook, { 
      bookType: 'xlsx', 
      type: 'array',
      bookSST: false 
    });
    
    const blob = new Blob([excelBuffer], { 
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
    });
    
    const fileName = `سجل_القيود_${accountName}_${dayjs().format('YYYY-MM-DD')}.xlsx`;
    saveAs(blob, fileName);
    
  } catch (error) {
    console.error('Excel export error:', error.message);
    throw error;
  }
};

const getJournalTypeArabic = (type) => {
  const typeMap = {
    'GENERAL': 'عام',
    'LOAN_DISBURSEMENT': 'صرف سلفة',
    'REPAYMENT': 'سداد',
    'CAPITAL': 'رأس المال',
    'WITHDRAWAL': 'سحب',
    'DEPOSIT': 'إيداع'
  };
  return typeMap[type] || type;
};

export const exportStatisticsToPDF = async (statisticsData, accountName) => {
  return new Promise((resolve, reject) => {
    try {
      if (!statisticsData) {
        throw new Error('لا توجد بيانات للتصدير');
      }

      const doc = new jsPDF();
      
      registerArabicFonts(doc);
      
      doc.setProperties({
        title: `إحصائيات الصندوق - ${accountName}`,
        subject: 'إحصائيات الصندوق',
        author: 'نظام إدارة السلف',
        keywords: 'إحصائيات, صندوق, محاسبة',
        creator: 'نظام إدارة السلف'
      });

      let statsYPosition = drawReportHeader(doc, {
        reportTitle: 'إحصائيات الصندوق',
        metadata: { date: dayjs().format('DD/MM/YYYY'), time: dayjs().format('HH:mm') }
      });
      statsYPosition = drawSeparatorLine(doc, statsYPosition);

      doc.setFontSize(13);
      doc.setFont('Amiri', 'bold');
      doc.text(`الحساب: ${accountName}`, doc.internal.pageSize.width / 2, statsYPosition, { align: 'center' });
      statsYPosition += 10;
      
      const availableBalance = statisticsData.account?.balance || 0;
      const totalDebit = statisticsData.account?.debit || 0;
      const totalCredit = statisticsData.account?.credit || 0;
      const loansBalance = statisticsData.loansBalance || 0;
      const total = statisticsData.total || 0;
      const totalRepaymentsAmount = statisticsData.repayments?.totalAmount || 0;
      const paidRepaymentsUntilNow = statisticsData.repayments?.paidUntilNow || 0;
      const remainingRepayments = totalRepaymentsAmount - paidRepaymentsUntilNow;
      const repaymentsProgress =
        totalRepaymentsAmount > 0
          ? Math.min(
              100,
              Math.max(0, (paidRepaymentsUntilNow / totalRepaymentsAmount) * 100)
            )
          : 0;

      // Current month collection data
      const currentMonthTotalAmount = statisticsData.currentMonth?.totalAmount || 0;
      const currentMonthPaidUntilNow = statisticsData.currentMonth?.paidUntilNow || 0;
      const currentMonthRemaining = currentMonthTotalAmount - currentMonthPaidUntilNow;
      const currentMonthProgress =
        currentMonthTotalAmount > 0
          ? Math.min(
              100,
              Math.max(0, (currentMonthPaidUntilNow / currentMonthTotalAmount) * 100)
            )
          : 0;
      
      const pageWidth = doc.internal.pageSize.width;
      const yPosition = statsYPosition + 5;
      
      const statisticsDataTable = [
        [availableBalance.toLocaleString('en-US'), 'الرصيد المتاح'],
        [totalDebit.toLocaleString('en-US'), 'إجمالي الوارد'],
        [totalCredit.toLocaleString('en-US'), 'إجمالي الصادر'],
        [loansBalance.toLocaleString('en-US'), 'الرصيد في السوق'],
        [total.toLocaleString('en-US'), 'الإجمالي (المتاح + في السوق)']
      ];
      
      const headers = [['القيمة', 'المؤشر']];
      
      const columnWidths = {
        0: 70,
        1: 100
      };
      
      const totalColumnWidth = Object.values(columnWidths).reduce((sum, width) => sum + width, 0);
      const leftMargin = (pageWidth - totalColumnWidth) / 2;
      
      autoTable(doc, {
        startY: yPosition,
        head: headers,
        body: statisticsDataTable,
        theme: 'striped',
        styles: {
          font: 'Amiri',
          fontStyle: 'bold',
          fontSize: 10, // smaller font for readability
          cellPadding: 6,
          lineColor: [200, 200, 200],
          lineWidth: 0.1,
          halign: 'center',
          valign: 'middle'
        },
        headStyles: {
          fillColor: PRIMARY_COLOR,
          textColor: [255, 255, 255],
          fontStyle: 'bold',
          fontSize: 9,
          halign: 'center',
          valign: 'middle',
          cellPadding: 4,
          lineColor: [13, 64, 165],
          lineWidth: 0.1
        },
        bodyStyles: {
          fontStyle: 'bold',
          halign: 'center',
          valign: 'middle',
          cellPadding: 6,
          lineColor: [220, 220, 220],
          lineWidth: 0.1
        },
        alternateRowStyles: {
          fillColor: [250, 250, 250]
        },
        columnStyles: {
          0: { cellWidth: columnWidths[0], halign: 'center' },
          1: { cellWidth: columnWidths[1], halign: 'right' }
        },
        margin: { 
          top: yPosition, 
          bottom: 20,
          left: leftMargin,
          right: leftMargin
        },
        tableWidth: totalColumnWidth,
        didDrawTable: createDidDrawTable(doc)
      });

      // ملخص التحصيلات + مؤشر التقدم
      if (totalRepaymentsAmount > 0) {
        const repaymentsHeaders = [['القيمة', 'ملخص التحصيلات']];
        const repaymentsTable = [
          [totalRepaymentsAmount.toLocaleString('en-US'), 'إجمالي التحصيلات'],
          [paidRepaymentsUntilNow.toLocaleString('en-US'), 'واصل حتى الآن'],
          [remainingRepayments.toLocaleString('en-US'), 'متبقي'],
          [`${repaymentsProgress.toFixed(1)}%`, 'نسبة التحصيل']
        ];

        const repaymentsColumnWidths = {
          0: 70,
          1: 100
        };

        const repaymentsTotalWidth = Object.values(repaymentsColumnWidths).reduce((sum, width) => sum + width, 0);
        const repaymentsLeftMargin = (pageWidth - repaymentsTotalWidth) / 2;

        autoTable(doc, {
          startY: doc.lastAutoTable.finalY + 12,
          head: repaymentsHeaders,
          body: repaymentsTable,
          theme: 'striped',
        styles: {
          font: 'Amiri',
          fontStyle: 'bold',
          fontSize: 10, // smaller font for readability
          cellPadding: 6,
            lineColor: [200, 200, 200],
            lineWidth: 0.1,
            halign: 'center',
            valign: 'middle'
          },
          headStyles: {
            fillColor: PRIMARY_COLOR,
            textColor: [255, 255, 255],
            fontStyle: 'bold',
          fontSize: 11, // smaller header font
            halign: 'center',
            valign: 'middle',
          cellPadding: 6,
            lineColor: [46, 125, 50],
            lineWidth: 0.1
          },
          bodyStyles: {
            fontStyle: 'bold',
            halign: 'center',
            valign: 'middle',
          cellPadding: 6,
            lineColor: [220, 220, 220],
            lineWidth: 0.1
          },
          alternateRowStyles: {
            fillColor: [250, 250, 250]
          },
          columnStyles: {
            0: { cellWidth: repaymentsColumnWidths[0], halign: 'center' },
            1: { cellWidth: repaymentsColumnWidths[1], halign: 'right' }
          },
          margin: { 
            top: doc.lastAutoTable.finalY + 12, 
            bottom: 20,
            left: repaymentsLeftMargin,
            right: repaymentsLeftMargin
          },
          tableWidth: repaymentsTotalWidth,
          didDrawTable: createDidDrawTable(doc)
        });

        // شريط تقدم بصري مبسط لنسبة التحصيل
        const barStartY = doc.lastAutoTable.finalY + 8;
        const barWidth = 120;
        const barHeight = 8;
        const barX = (pageWidth - barWidth) / 2;
        doc.setFillColor(224, 224, 224);
        doc.roundedRect(barX, barStartY, barWidth, barHeight, 2, 2, 'F');
        doc.setFillColor(46, 125, 50);
        const filledWidth = (Math.max(0, Math.min(100, repaymentsProgress)) / 100) * barWidth;
        doc.roundedRect(barX, barStartY, filledWidth, barHeight, 2, 2, 'F');
        doc.setFontSize(9); // smaller caption font
        doc.setFont('Amiri', 'bold');
        doc.text(
          `نسبة التحصيل: ${repaymentsProgress.toFixed(1)}%`,
          pageWidth / 2,
          barStartY + barHeight + 6,
          { align: 'center' }
        );
      }

      // جدول تحصيل هذا الشهر
      if (currentMonthTotalAmount > 0) {
        const currentMonthHeaders = [['القيمة', 'تحصيل هذا الشهر']];
        const currentMonthTable = [
          [currentMonthTotalAmount.toLocaleString('en-US'), 'إجمالي التحصيلات'],
          [currentMonthPaidUntilNow.toLocaleString('en-US'), 'تم تحصيله'],
          [currentMonthRemaining.toLocaleString('en-US'), 'متبقي'],
          [`${currentMonthProgress.toFixed(1)}%`, 'نسبة التحصيل']
        ];

        const currentMonthColumnWidths = {
          0: 70,
          1: 100
        };

        const currentMonthTotalWidth = Object.values(currentMonthColumnWidths).reduce((sum, width) => sum + width, 0);
        const currentMonthLeftMargin = (pageWidth - currentMonthTotalWidth) / 2;

        autoTable(doc, {
          startY: doc.lastAutoTable.finalY + 15,
          head: currentMonthHeaders,
          body: currentMonthTable,
          theme: 'striped',
          styles: {
            font: 'Amiri',
            fontStyle: 'bold',
            fontSize: 10,
            cellPadding: 6,
            lineColor: [200, 200, 200],
            lineWidth: 0.1,
            halign: 'center',
            valign: 'middle'
          },
          headStyles: {
            fillColor: PRIMARY_COLOR, // خلفية فاتحة
            textColor: [255, 255, 255], // نص أخضر داكن
            fontStyle: 'bold',
            fontSize: 11,
            halign: 'center',
            valign: 'middle',
            cellPadding: 6,
            lineColor: [46, 125, 50],
            lineWidth: 0.1
          },
          bodyStyles: {
            fontStyle: 'bold',
            halign: 'center',
            valign: 'middle',
            cellPadding: 6,
            lineColor: [220, 220, 220],
            lineWidth: 0.1
          },
          alternateRowStyles: {
            fillColor: [250, 250, 250]
          },
          columnStyles: {
            0: { cellWidth: currentMonthColumnWidths[0], halign: 'center' },
            1: { cellWidth: currentMonthColumnWidths[1], halign: 'right' }
          },
          margin: {
            top: doc.lastAutoTable.finalY + 15,
            bottom: 20,
            left: currentMonthLeftMargin,
            right: currentMonthLeftMargin
          },
          tableWidth: currentMonthTotalWidth,
          didDrawTable: createDidDrawTable(doc)
        });

        // شريط تقدم بصري لتحصيل هذا الشهر
        const currentMonthBarStartY = doc.lastAutoTable.finalY + 8;
        const currentMonthBarWidth = 120;
        const currentMonthBarHeight = 8;
        const currentMonthBarX = (pageWidth - currentMonthBarWidth) / 2;
        doc.setFillColor(224, 224, 224);
        doc.roundedRect(currentMonthBarX, currentMonthBarStartY, currentMonthBarWidth, currentMonthBarHeight, 2, 2, 'F');
        doc.setFillColor(46, 125, 50); // Green color matching other tables
        const currentMonthFilledWidth = (Math.max(0, Math.min(100, currentMonthProgress)) / 100) * currentMonthBarWidth;
        doc.roundedRect(currentMonthBarX, currentMonthBarStartY, currentMonthFilledWidth, currentMonthBarHeight, 2, 2, 'F');
        doc.setFontSize(9);
        doc.setFont('Amiri', 'bold');
        doc.text(
          `نسبة تحصيل هذا الشهر: ${currentMonthProgress.toFixed(1)}%`,
          pageWidth / 2,
          currentMonthBarStartY + currentMonthBarHeight + 6,
          { align: 'center' }
        );
      }
      
      const pageCount = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        drawReportFooter(doc, i, pageCount);
      }
      
      const fileName = `إحصائيات_الصندوق_${accountName}_${dayjs().format('YYYY-MM-DD')}.pdf`;
      doc.save(fileName);
      resolve();
    } catch (error) {
      console.error('PDF export error:', error.message);
      reject(error);
    }
  });
};

export const exportStatisticsToExcel = async (statisticsData, accountName) => {
  try {
    if (!statisticsData) {
      throw new Error('لا توجد بيانات للتصدير');
    }

    const availableBalance = statisticsData.account?.balance || 0;
    const totalDebit = statisticsData.account?.debit || 0;
    const totalCredit = statisticsData.account?.credit || 0;
    const loansBalance = statisticsData.loansBalance || 0;
    const total = statisticsData.total || 0;
    const totalRepaymentsAmount = statisticsData.repayments?.totalAmount || 0;
    const paidRepaymentsUntilNow = statisticsData.repayments?.paidUntilNow || 0;
    const remainingRepayments = totalRepaymentsAmount - paidRepaymentsUntilNow;
    const repaymentsProgress =
      totalRepaymentsAmount > 0
        ? Math.min(
            100,
            Math.max(0, (paidRepaymentsUntilNow / totalRepaymentsAmount) * 100)
          )
        : 0;

    // Current month collection data
    const currentMonthTotalAmount = statisticsData.currentMonth?.totalAmount || 0;
    const currentMonthPaidUntilNow = statisticsData.currentMonth?.paidUntilNow || 0;
    const currentMonthRemaining = currentMonthTotalAmount - currentMonthPaidUntilNow;
    const currentMonthProgress =
      currentMonthTotalAmount > 0
        ? Math.min(
            100,
            Math.max(0, (currentMonthPaidUntilNow / currentMonthTotalAmount) * 100)
          )
        : 0;

    // Lazy load XLSX library
    const XLSX = await import('xlsx');

    const workbook = XLSX.utils.book_new();
    
    const statisticsDataArray = [
      ['إحصائيات الصندوق'],
      [`الحساب: ${accountName}`],
      [''],
      ['القيمة', 'المؤشر'],
      [availableBalance, 'الرصيد المتاح'],
      [totalDebit, 'إجمالي الوارد'],
      [totalCredit, 'إجمالي الصادر'],
      [loansBalance, 'الرصيد في السوق'],
      [total, 'الإجمالي (المتاح + في السوق)']
    ];

    if (totalRepaymentsAmount > 0) {
      statisticsDataArray.push(
        [''],
        ['القيمة', 'ملخص التحصيلات'],
        [totalRepaymentsAmount, 'إجمالي التحصيلات'],
        [paidRepaymentsUntilNow, 'واصل حتى الآن'],
        [remainingRepayments, 'متبقي'],
        [`${repaymentsProgress.toFixed(1)}%`, 'نسبة التحصيل']
      );
    }

    if (currentMonthTotalAmount > 0) {
      statisticsDataArray.push(
        [''],
        ['القيمة', 'تحصيل هذا الشهر'],
        [currentMonthTotalAmount, 'إجمالي التحصيلات'],
        [currentMonthPaidUntilNow, 'تم تحصيله'],
        [currentMonthRemaining, 'متبقي'],
        [`${currentMonthProgress.toFixed(1)}%`, 'نسبة التحصيل']
      );
    }
    
    const statisticsSheet = XLSX.utils.aoa_to_sheet(statisticsDataArray);
    
    statisticsSheet['!cols'] = [
      { wch: 20 },
      { wch: 30 }
    ];
    
    XLSX.utils.book_append_sheet(workbook, statisticsSheet, 'الإحصائيات');
    
    const excelBuffer = XLSX.write(workbook, { 
      bookType: 'xlsx', 
      type: 'array',
      bookSST: false 
    });
    
    const blob = new Blob([excelBuffer], { 
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
    });
    
    const fileName = `إحصائيات_الصندوق_${accountName}_${dayjs().format('YYYY-MM-DD')}.xlsx`;
    saveAs(blob, fileName);
    
  } catch (error) {
    console.error('Excel export error:', error.message);
    throw error;
  }
};

