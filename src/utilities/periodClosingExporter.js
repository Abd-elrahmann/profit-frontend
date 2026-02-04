import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { saveAs } from 'file-saver';
import { pdfTableBaseStyles, getPdfTableStyles, createDidDrawTable } from './pdfTableStyles';
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

const getJournalTypeArabic = (type) => {
  const typeMap = {
    'GENERAL': 'عام',
    'OPENING': 'افتتاحي',
    'CLOSING': 'ختامي',
    'ADJUSTMENT': 'تسوية'
  };
  return typeMap[type] || type;
};

const getJournalStatusArabic = (status) => {
  const statusMap = {
    'POSTED': 'معتمد',
    'DRAFT': 'مسودة',
    'PENDING': 'قيد الانتظار',
    'CANCELLED': 'ملغي'
  };
  return statusMap[status] || status;
};

export const exportPeriodClosingToPDF = async (periodData) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new jsPDF();
      registerArabicFonts(doc);

      doc.setProperties({
        title: `تقرير تقفيل الفترة - ${periodData.name}`,
        subject: 'تفاصيل تقفيل الفترة',
        author: 'نظام إدارة السلف',
        keywords: 'فترة, تقفيل, محاسبة',
        creator: 'نظام إدارة السلف'
      });

      doc.setFont('Amiri', 'bold');

      // Logo
      const logoWidth = 10;
      const logoHeight = 10;
      const logoX = doc.internal.pageSize.width - logoWidth - 5;
      const logoY = 5;
      doc.addImage(logo, 'PNG', logoX, logoY, logoWidth, logoHeight);

      // Title
      doc.setFontSize(18);
      doc.text('تقرير تقفيل الفترة', doc.internal.pageSize.width / 2, 25, { align: 'center' });

      doc.setFontSize(13);
      doc.text(`${periodData.name}`, doc.internal.pageSize.width / 2, 35, { align: 'center' });

      // Period Info Table
      let yPosition = 42;
      const periodInfoData = [
        [periodData.name || '-', 'اسم الفترة'],
        [dayjs(periodData.startDate).format('DD/MM/YYYY'), 'تاريخ البداية'],
        [dayjs(periodData.endDate).format('DD/MM/YYYY'), 'تاريخ النهاية'],
        [periodData.isClosed ? 'مقفلة' : 'مفتوحة', 'الحالة'],
        [periodData.journals?.length || 0, 'عدد القيود']
      ];

      const pageWidth = doc.internal.pageSize.width;

      autoTable(doc, {
        startY: yPosition,
        head: [['القيمة', 'المعلومة']],
        body: periodInfoData,
        ...getPdfTableStyles({
          styles: { halign: 'right', fontStyle: 'bold' },
          headStyles: { halign: 'center' },
          bodyStyles: { halign: 'right', fontStyle: 'bold', cellPadding: 3 }
        }),
        columnStyles: {
          0: { cellWidth: 'auto', halign: 'right', fontStyle: 'bold' },
          1: { cellWidth: 'auto', halign: 'right' }
        },
        margin: { 
          top: yPosition, 
          left: 10,
          right: 10,
          bottom: 5 
        },
        tableWidth: 'auto',
        horizontalPageBreak: false,
        didDrawTable: createDidDrawTable(doc)
      });

      yPosition = doc.lastAutoTable.finalY + 10;

      // Financial Summary
      doc.setFontSize(14);
      doc.setFont('Amiri', 'bold');
      doc.text('الملخص المالي', doc.internal.pageSize.width / 2, yPosition, { align: 'center' });
      yPosition += 8;

      const totalDebit = periodData.journals?.reduce((sum, j) => sum + (j.totalDebit || 0), 0) || 0;
      const totalCredit = periodData.journals?.reduce((sum, j) => sum + (j.totalCredit || 0), 0) || 0;
      const balance = totalDebit - totalCredit;

      const summaryData = [
        [Math.round(totalDebit).toLocaleString('en-US'), 'إجمالي المدين'],
        [Math.round(totalCredit).toLocaleString('en-US'), 'إجمالي الدائن'],
        [Math.round(balance).toLocaleString('en-US'), 'إجمالي الرصيد'],
        [(periodData.grossProfit?.total || 0).toLocaleString('en-US'), 'الأرباح الإجمالية'],
        [`-(${(periodData.expenseDistribution?.totalExpenses || 0).toLocaleString('en-US')})`, 'المصروفات المخصومة'],
        [(periodData.totalProfit || 0).toLocaleString('en-US'), 'صافي الأرباح']
      ];

      autoTable(doc, {
        startY: yPosition,
        head: [['القيمة', 'البيان']],
        body: summaryData,
        ...getPdfTableStyles({
          styles: { halign: 'right', fontStyle: 'bold' },
          headStyles: { halign: 'center' },
          bodyStyles: { halign: 'right', fontStyle: 'bold', cellPadding: 3 }
        }),
        columnStyles: {
          0: { cellWidth: 'auto', halign: 'right', fontStyle: 'bold' },
          1: { cellWidth: 'auto', halign: 'right' }
        },
        margin: { 
          left: 10,
          right: 10
        },
        tableWidth: 'auto',
        didDrawTable: createDidDrawTable(doc)
      });

      yPosition = doc.lastAutoTable.finalY + 10;

      // Partner Profits Table (if exists)
      if (periodData.partnerProfits && periodData.partnerProfits.length > 0) {
        doc.setFontSize(14);
        doc.text('أرباح الشركاء', doc.internal.pageSize.width / 2, yPosition, { align: 'center' });
        yPosition += 8;

        const partnerHeaders = [['صافي الربح', 'حصة المصروفات', 'الربح الإجمالي', 'اسم الشريك']];
        const partnerBody = periodData.partnerProfits.map(p => [
          (p.netProfit || 0).toLocaleString('en-US'),
          `-(${(p.expenseShare || 0).toLocaleString('en-US')})`,
          (p.grossProfit || 0).toLocaleString('en-US'),
          p.partnerName
        ]);

        // Add totals row
        partnerBody.push([
          (periodData.totalPartnerProfit || 0).toLocaleString('en-US'),
          `-(${(periodData.expenseDistribution?.partnersShare || 0).toLocaleString('en-US')})`,
          (periodData.grossProfit?.partnerTotal || 0).toLocaleString('en-US'),
          'الإجمالي'
        ]);

        autoTable(doc, {
          startY: yPosition,
          head: partnerHeaders,
          body: partnerBody,
          ...getPdfTableStyles({
            styles: { halign: 'right', fontStyle: 'bold', fontSize: 9 },
            headStyles: { halign: 'center' },
            bodyStyles: { halign: 'right', fontStyle: 'bold', cellPadding: 3 }
          }),
          columnStyles: {
            0: { cellWidth: 'auto' },
            1: { cellWidth: 'auto' },
            2: { cellWidth: 'auto' },
            3: { cellWidth: 'auto' }
          },
          margin: { left: 10, right: 10 },
          tableWidth: 'auto',
          didParseCell: function (data) {
            if (data.row.index === partnerBody.length - 1) {
              data.cell.styles.fillColor = [240, 240, 240];
              data.cell.styles.fontStyle = 'bold';
            }
          },
          didDrawTable: createDidDrawTable(doc)
        });

        yPosition = doc.lastAutoTable.finalY + 10;
      }

      // Journals Table
      if (periodData.journals && periodData.journals.length > 0) {
        doc.setFontSize(14);
        doc.text(`قيود الفترة (${periodData.journals.length})`, doc.internal.pageSize.width / 2, yPosition, { align: 'center' });
        yPosition += 8;

        const journalHeaders = [['الرصيد', 'دائن', 'مدين', 'الوصف', 'النوع', 'الحالة', 'التاريخ']];
        const journalBody = periodData.journals.map(j => [
          Math.round((j.totalDebit || 0) - (j.totalCredit || 0)).toLocaleString('en-US'),
          Math.round(j.totalCredit || 0).toLocaleString('en-US'),
          Math.round(j.totalDebit || 0).toLocaleString('en-US'),
          j.description || '-',
          getJournalTypeArabic(j.type),
          getJournalStatusArabic(j.status),
          dayjs(j.date).format('DD/MM/YYYY')
        ]);

        // Add totals row
        journalBody.push([
          Math.round(balance).toLocaleString('en-US'),
          Math.round(totalCredit).toLocaleString('en-US'),
          Math.round(totalDebit).toLocaleString('en-US'),
          'الإجمالي',
          '',
          '',
          ''
        ]);

        autoTable(doc, {
          startY: yPosition,
          head: journalHeaders,
          body: journalBody,
          ...getPdfTableStyles({
            styles: { halign: 'right', fontStyle: 'bold', fontSize: 8 },
            headStyles: { halign: 'center', fontSize: 9 },
            bodyStyles: { halign: 'right', fontStyle: 'bold', cellPadding: 2 }
          }),
          columnStyles: {
            0: { cellWidth: 'auto' },
            1: { cellWidth: 'auto' },
            2: { cellWidth: 'auto' },
            3: { cellWidth: 'auto', fontSize: 7 },
            4: { cellWidth: 'auto' },
            5: { cellWidth: 'auto' },
            6: { cellWidth: 'auto' }
          },
          margin: { left: 10, right: 10 },
          tableWidth: 'auto',
          pageBreak: 'auto',
          showHead: 'everyPage',
          didParseCell: function (data) {
            if (data.row.index === journalBody.length - 1) {
              data.cell.styles.fillColor = [240, 240, 240];
              data.cell.styles.fontStyle = 'bold';
              data.cell.styles.fontSize = 9;
            }
          },
          didDrawTable: createDidDrawTable(doc)
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

      const fileName = `تقرير_تقفيل_الفترة_${periodData.name}_${dayjs().format('YYYY-MM-DD')}.pdf`;
      doc.save(fileName);
      resolve();
    } catch (error) {
      console.error('PDF export error:', error.message);
      reject(error);
    }
  });
};

export const exportPeriodClosingToExcel = async (periodData) => {
  try {
    const XLSX = await import('xlsx');
    const workbook = XLSX.utils.book_new();

    // Period Info Sheet
    const periodInfoData = [
      ['تقرير تقفيل الفترة'],
      [''],
      ['معلومات الفترة'],
      ['اسم الفترة', periodData.name || '-'],
      ['تاريخ البداية', dayjs(periodData.startDate).format('DD/MM/YYYY')],
      ['تاريخ النهاية', dayjs(periodData.endDate).format('DD/MM/YYYY')],
      ['الحالة', periodData.isClosed ? 'مقفلة' : 'مفتوحة'],
      ['عدد القيود', periodData.journals?.length || 0],
      [''],
      ['الملخص المالي'],
      ['إجمالي المدين', Math.round(periodData.journals?.reduce((sum, j) => sum + (j.totalDebit || 0), 0) || 0)],
      ['إجمالي الدائن', Math.round(periodData.journals?.reduce((sum, j) => sum + (j.totalCredit || 0), 0) || 0)],
      ['إجمالي الرصيد', Math.round((periodData.journals?.reduce((sum, j) => sum + (j.totalDebit || 0), 0) || 0) - (periodData.journals?.reduce((sum, j) => sum + (j.totalCredit || 0), 0) || 0))],
      ['الأرباح الإجمالية', periodData.grossProfit?.total || 0],
      ['المصروفات المخصومة', -(periodData.expenseDistribution?.totalExpenses || 0)],
      ['صافي الأرباح', periodData.totalProfit || 0],
      ['']
    ];

    const periodInfoSheet = XLSX.utils.aoa_to_sheet(periodInfoData);
    periodInfoSheet['!cols'] = [{ wch: 25 }, { wch: 30 }];
    XLSX.utils.book_append_sheet(workbook, periodInfoSheet, 'معلومات الفترة');

    // Partner Profits Sheet
    if (periodData.partnerProfits && periodData.partnerProfits.length > 0) {
      const partnerData = periodData.partnerProfits.map(p => ({
        'اسم الشريك': p.partnerName,
        'الربح الإجمالي': p.grossProfit || 0,
        'حصة المصروفات': -(p.expenseShare || 0),
        'صافي الربح': p.netProfit || 0
      }));

      partnerData.push({
        'اسم الشريك': 'الإجمالي',
        'الربح الإجمالي': periodData.grossProfit?.partnerTotal || 0,
        'حصة المصروفات': -(periodData.expenseDistribution?.partnersShare || 0),
        'صافي الربح': periodData.totalPartnerProfit || 0
      });

      const partnerSheet = XLSX.utils.json_to_sheet(partnerData);
      partnerSheet['!cols'] = [
        { wch: 25 },
        { wch: 18 },
        { wch: 18 },
        { wch: 18 }
      ];
      XLSX.utils.book_append_sheet(workbook, partnerSheet, 'أرباح الشركاء');
    }

    // Journals Sheet
    if (periodData.journals && periodData.journals.length > 0) {
      const journalData = periodData.journals.map(j => ({
        'التاريخ': dayjs(j.date).format('DD/MM/YYYY'),
        'الحالة': getJournalStatusArabic(j.status),
        'النوع': getJournalTypeArabic(j.type),
        'الوصف': j.description || '-',
        'مدين': Math.round(j.totalDebit || 0),
        'دائن': Math.round(j.totalCredit || 0),
        'الرصيد': Math.round((j.totalDebit || 0) - (j.totalCredit || 0))
      }));

      const totalDebit = periodData.journals.reduce((sum, j) => sum + (j.totalDebit || 0), 0);
      const totalCredit = periodData.journals.reduce((sum, j) => sum + (j.totalCredit || 0), 0);

      journalData.push({
        'التاريخ': '',
        'الحالة': '',
        'النوع': '',
        'الوصف': 'الإجمالي',
        'مدين': Math.round(totalDebit),
        'دائن': Math.round(totalCredit),
        'الرصيد': Math.round(totalDebit - totalCredit)
      });

      const journalSheet = XLSX.utils.json_to_sheet(journalData);
      journalSheet['!cols'] = [
        { wch: 15 },
        { wch: 12 },
        { wch: 12 },
        { wch: 40 },
        { wch: 15 },
        { wch: 15 },
        { wch: 15 }
      ];
      XLSX.utils.book_append_sheet(workbook, journalSheet, 'قيود الفترة');
    }

    const excelBuffer = XLSX.write(workbook, {
      bookType: 'xlsx',
      type: 'array',
      bookSST: false
    });

    const blob = new Blob([excelBuffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    });

    const fileName = `تقرير_تقفيل_الفترة_${periodData.name}_${dayjs().format('YYYY-MM-DD')}.xlsx`;
    saveAs(blob, fileName);
  } catch (error) {
    console.error('Excel export error:', error.message);
    throw error;
  }
};
