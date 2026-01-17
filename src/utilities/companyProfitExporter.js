import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

import { saveAs } from 'file-saver';
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

export const exportCompanyProfitToPDF = async (profitData) => {
  return new Promise((resolve, reject) => {
    try {
      if (!profitData) {
        throw new Error('لا توجد بيانات للتصدير');
      }

      const doc = new jsPDF();

      registerArabicFonts(doc);

      doc.setProperties({
        title: 'تقرير أرباح الشركة',
        subject: 'تقرير أرباح الشركة وسجل السحوبات',
        author: 'نظام إدارة السلف',
        keywords: 'أرباح, شركة, سحوبات, محاسبة',
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
      doc.text('تقرير أرباح الشركة', doc.internal.pageSize.width / 2, 25, { align: 'center' });

      doc.setFontSize(13);
      doc.setFont('Amiri', 'bold');
      doc.text('ملخص أرباح الشركة', doc.internal.pageSize.width / 2, 40, { align: 'center' });

      const availableAmount = profitData.availableAmount || 0;
      const upcomingProfit = profitData.upcomingProfit || 0;
      const cents = profitData.cents || 0;
      const totalUpcoming = profitData.totalUpcoming || 0;
      const totalWithdrawals = profitData.data?.length || 0;
      const withdrawals = profitData.data || [];
      const periodsProfit = profitData.periodsProfit || null;

      doc.setFontSize(10);
      doc.setFont('Amiri', 'bold');
      const summaryY = 50;

      const summaryText1 = `صافي الأرباح القادمة للشركة: ${upcomingProfit.toLocaleString('en-US')}  |  باقي أرباح الشركاء: ${cents.toLocaleString('en-US')}`;
      doc.text(summaryText1, doc.internal.pageSize.width / 2, summaryY, { align: 'center' });

      const summaryText2 = `إجمالي الأرباح: ${totalUpcoming.toLocaleString('en-US')}  |  الرصيد المتاح للسحب: ${availableAmount.toLocaleString('en-US')}`;
      doc.text(summaryText2, doc.internal.pageSize.width / 2, summaryY + 10, { align: 'center' });

      const totalWithdrawnAmount = withdrawals.reduce((sum, withdrawal) => sum + (withdrawal.amount || 0), 0);
      const summaryText3 = `إجمالي عمليات السحب: ${totalWithdrawals}  |  إجمالي المبالغ المسحوبة: ${totalWithdrawnAmount.toLocaleString('en-US')}`;
      doc.text(summaryText3, doc.internal.pageSize.width / 2, summaryY + 20, { align: 'center' });

      let yPosition = summaryY + 30;

      if (periodsProfit && periodsProfit.periods && periodsProfit.periods.length > 0) {
        doc.setFontSize(13);
        doc.setFont('Amiri', 'bold');
        doc.text('مصادر أرباح الشركة', doc.internal.pageSize.width / 2, yPosition, { align: 'center' });
        yPosition += 10;

        const periodsTableData = [];
        periodsProfit.periods.forEach(period => {
          periodsTableData.push([
            (period.totalCompany || 0).toLocaleString('en-US'),
            (period.cents || 0).toLocaleString('en-US'),
            (period.companyProfit || 0).toLocaleString('en-US'),
            `${period.companyPercentage || 0}%`,
            (period.totalPeriodProfit || 0).toLocaleString('en-US'),
            period.periodName || `الفترة ${periodsTableData.length + 1}`
          ]);
        });

        const periodsHeaders = [
          ['الإجمالي', 'باقي الشركاء', 'أرباح الشركة', 'النسبة', 'إجمالي الأرباح', 'الفترة']
        ];

        const periodsColumnWidths = {
          0: 30, 
          1: 30, 
          2: 30, 
          3: 25, 
          4: 35, 
          5: 50  
        };

        const periodsTotalColumnWidth = Object.values(periodsColumnWidths).reduce((sum, width) => sum + width, 0);
        const periodsTableStartX = (doc.internal.pageSize.width - periodsTotalColumnWidth) / 2;

        autoTable(doc, {
          startY: yPosition,
          startX: periodsTableStartX,
          head: periodsHeaders,
          body: periodsTableData,
          theme: 'striped',
          styles: {
            font: 'Amiri',
            fontSize: 11,
            cellPadding: 3,
            halign: 'center',
            valign: 'middle',
            direction: 'rtl',
            fontStyle: 'bold',
            overflow: 'linebreak',
            cellWidth: 'wrap'
          },
          headStyles: {
            fillColor: [240, 240, 240],
            textColor: [46, 139, 69],
            fontStyle: 'bold',
            halign: 'center',
            direction: 'rtl',
            cellPadding: 2,
            minCellHeight: 8
          },
          bodyStyles: {
            halign: 'center',
            direction: 'rtl',
            fontStyle: 'bold'
          },
          alternateRowStyles: {
            fillColor: [250, 250, 250]
          },
          columnStyles: {
            0: { cellWidth: periodsColumnWidths[0], halign: 'center', fontStyle: 'bold' }, 
            1: { cellWidth: periodsColumnWidths[1], halign: 'center', fontStyle: 'bold' }, 
            2: { cellWidth: periodsColumnWidths[2], halign: 'center', fontStyle: 'bold' }, 
            3: { cellWidth: periodsColumnWidths[3], halign: 'center', fontStyle: 'bold' }, 
            4: { cellWidth: periodsColumnWidths[4], halign: 'center', fontStyle: 'bold' }, 
            5: { cellWidth: periodsColumnWidths[5], halign: 'center', fontStyle: 'bold' } 
          },
          margin: { left: 14, right: 14 },
          tableWidth: periodsTotalColumnWidth,
          horizontalPageBreak: false,
          pageBreak: 'auto',
          rowPageBreak: 'avoid',
          showHead: 'everyPage'
        });

        yPosition = doc.lastAutoTable.finalY + 15;
      }

      if (withdrawals.length === 0) {
        doc.setFontSize(14);
        doc.setFont('Amiri', 'bold');
        doc.text('لا توجد عمليات سحب حتى الآن', doc.internal.pageSize.width / 2, yPosition, { align: 'center' });
      } else {
        const tableData = [];
        withdrawals.forEach(withdrawal => {
          tableData.push([
            withdrawal.amount.toLocaleString('en-US'),
            withdrawal.description || '-',
            `${dayjs(withdrawal.date).format('DD/MM/YYYY')}\n${withdrawal.hijriDate || ''}`
          ]);
        });

        const headers = [
          ['المبلغ المسحوب', 'الوصف', 'التاريخ']
        ];

        const pageWidth = doc.internal.pageSize.width;

        const columnWidths = {
          0: 35, 
          1: 80, 
          2: 55  
        };

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
            fontSize: 11,
            cellPadding: 3,
            halign: 'center',
            valign: 'middle',
            direction: 'rtl',
            fontStyle: 'bold',
            overflow: 'linebreak',
            cellWidth: 'wrap'
          },
          headStyles: {
            fillColor: [240, 240, 240],
            textColor: [46, 139, 69],
            fontStyle: 'bold',
            halign: 'center',
            direction: 'rtl',
            cellPadding: 2,
            minCellHeight: 8
          },
          bodyStyles: {
            halign: 'center',
            direction: 'rtl',
            fontStyle: 'bold'
          },
          alternateRowStyles: {
            fillColor: [250, 250, 250]
          },
          columnStyles: {
            0: { cellWidth: columnWidths[0], halign: 'center', fontStyle: 'bold' }, 
            1: { cellWidth: columnWidths[1], halign: 'center', fontStyle: 'bold' }, 
            2: { cellWidth: columnWidths[2], halign: 'center', fontStyle: 'bold' }  
          },
          margin: { left: 14, right: 14 },
          tableWidth: totalColumnWidth,
          horizontalPageBreak: false,
          pageBreak: 'auto',
          rowPageBreak: 'avoid',
          showHead: 'everyPage',
          didParseCell: function (data) {
            if (data.cell.text && data.cell.text.length > 0) {
              const maxLength = data.column.index === 1 ? 60 : 25; 
              if (data.cell.text[0].length > maxLength) {
                data.cell.text[0] = data.cell.text[0].substring(0, maxLength) + '...';
              }
            }
          }
        });
      }

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

      const fileName = `تقرير_أرباح_الشركة_${dayjs().format('YYYY-MM-DD')}.pdf`;
      doc.save(fileName);
      resolve();
    } catch (error) {
      console.error('PDF export error:', error.message);
      reject(error);
    }
  });
};

export const exportCompanyProfitToExcel = async (profitData) => {
  try { 
    if (!profitData) {
      throw new Error('لا توجد بيانات للتصدير');
    }

    const XLSX = await import('xlsx');

    const workbook = XLSX.utils.book_new();

    const availableAmount = profitData.availableAmount || 0;
    const upcomingProfit = profitData.upcomingProfit || 0;
    const cents = profitData.cents || 0;
    const totalUpcoming = profitData.totalUpcoming || 0;
    const totalWithdrawals = profitData.data?.length || 0;
    const withdrawals = profitData.data || [];
    const periodsProfit = profitData.periodsProfit || null;
    const totalWithdrawnAmount = withdrawals.reduce((sum, withdrawal) => sum + (withdrawal.amount || 0), 0);

    const summaryData = [
      ['تقرير أرباح الشركة'],
      [''],
      ['ملخص الأرباح'],
      ['صافي الأرباح القادمة للشركة', upcomingProfit],
      ['باقي أرباح الشركاء', cents],
      ['إجمالي الأرباح', totalUpcoming],
      ['الرصيد المتاح للسحب', availableAmount],
      ['إجمالي عمليات السحب', totalWithdrawals],
      ['إجمالي المبالغ المسحوبة', totalWithdrawnAmount],
      [''],
      ['تفاصيل السحوبات']
    ];

    const withdrawalsData = [];
    withdrawals.forEach(withdrawal => {
      withdrawalsData.push({
        'التاريخ الميلادي': dayjs(withdrawal.date).format('DD/MM/YYYY'),
        'التاريخ الهجري': withdrawal.hijriDate || '',
        'الوصف': withdrawal.description || '-',
        'المبلغ المسحوب': withdrawal.amount || 0
      });
    });

    const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);

    let withdrawalsSheet;
    if (withdrawalsData.length > 0) {
      withdrawalsSheet = XLSX.utils.json_to_sheet(withdrawalsData);

      const wscols = [
        { wch: 15 }, 
        { wch: 15 }, 
        { wch: 60 }, 
        { wch: 25 }  
      ];
      withdrawalsSheet['!cols'] = wscols;
    }

    let periodsSheet;
    if (periodsProfit && periodsProfit.periods && periodsProfit.periods.length > 0) {
      const periodsData = [];
      periodsProfit.periods.forEach(period => {
        periodsData.push({
          'الفترة': period.periodName || `الفترة ${periodsData.length + 1}`,
          'إجمالي الأرباح': period.totalPeriodProfit || 0,
          'النسبة': `${period.companyPercentage || 0}%`,
          'أرباح الشركة': period.companyProfit || 0,
          'باقي الشركاء': period.cents || 0,
          'الإجمالي': period.totalCompany || 0
        });
      });

      periodsSheet = XLSX.utils.json_to_sheet(periodsData);

      const periodsCols = [
        { wch: 25 }, 
        { wch: 20 }, 
        { wch: 15 }, 
        { wch: 20 }, 
        { wch: 20 }, 
        { wch: 20 }  
      ];
      periodsSheet['!cols'] = periodsCols;
    }

    XLSX.utils.book_append_sheet(workbook, summarySheet, 'ملخص الأرباح');

    if (periodsSheet) {
      XLSX.utils.book_append_sheet(workbook, periodsSheet, 'مصادر أرباح الشركة');
    }

    if (withdrawalsSheet) {
      XLSX.utils.book_append_sheet(workbook, withdrawalsSheet, 'سجل السحوبات');
    }
    
    const excelBuffer = XLSX.write(workbook, {
      bookType: 'xlsx',
      type: 'array',
      bookSST: false
    });

    const blob = new Blob([excelBuffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    });

    const fileName = `تقرير_أرباح_الشركة_${dayjs().format('YYYY-MM-DD')}.xlsx`;
    saveAs(blob, fileName);

  } catch (error) {
    console.error('Excel export error:', error.message);
    throw error;
  }
};

