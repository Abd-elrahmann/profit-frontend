import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

import { saveAs } from 'file-saver';
import { pdfTableBaseStyles, createDidDrawTable } from './pdfTableStyles';
import { registerArabicFonts, drawReportHeader, drawSeparatorLine, drawReportFooter, getCenteredTableMargins, PRIMARY_COLOR } from './pdfReportUtils';
import dayjs from 'dayjs';
import 'dayjs/locale/ar';

const formatInt = (value) => {
  const num = Number(value || 0);
  if (!Number.isFinite(num)) return '0';
  return num.toLocaleString();
};

export const exportZakahToPDF = async (zakahData, filters = {}) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new jsPDF();

      registerArabicFonts(doc);

      doc.setProperties({
        title: 'تقرير الزكاة',
        subject: 'تقرير الزكاة والعمليات المالية',
        author: 'نظام إدارة السلف',
        keywords: 'زكاة, تقرير, عمليات مالية',
        creator: 'نظام إدارة السلف'
      });

      let yPosition = drawReportHeader(doc, {
        reportTitle: 'تقرير الزكاة',
        metadata: { date: dayjs().format('DD/MM/YYYY'), time: dayjs().format('HH:mm') }
      });
      yPosition = drawSeparatorLine(doc, yPosition);
      
      // إضافة معلومات التصفية
      if (filters.month && filters.year) {
        doc.setFontSize(11);
        doc.setFont('Amiri', 'bold');
        doc.text(`الشهر: ${filters.month}/${filters.year}`, doc.internal.pageSize.width / 2, yPosition, { align: 'center' });
        yPosition += 8;
      } else if (filters.partner && filters.year) {
        doc.setFontSize(11);
        doc.setFont('Amiri', 'bold');
        doc.text(`الشريك: ${filters.partner} | السنة: ${filters.year}`, doc.internal.pageSize.width / 2, yPosition, { align: 'center' });
        yPosition += 8;
      }

      doc.setFontSize(11);
      doc.setFont('Amiri', 'bold');

      const isArrayData = Array.isArray(zakahData);
      const isAccountData = !isArrayData && !!zakahData?.account;
      const isPartnerArray = (isArrayData && !!filters.partner) || (!isArrayData && !!zakahData?.monthlyBreakdown);
      const isPartnersList = isArrayData && !filters.partner;   

      // إضافة ملخص البيانات
      if (isAccountData) {
        const summaryText = `رصيد الحساب: ${zakahData.account.balance?.toLocaleString() || 0} | المدفوع: ${zakahData.account.credit?.toLocaleString() || 0} | المتبقي: ${zakahData.account.debit?.toLocaleString() || 0} | تاريخ التصدير: ${dayjs().format('DD/MM/YYYY HH:mm')}`;
        doc.text(summaryText, doc.internal.pageSize.width / 2, yPosition, { align: 'center' });
        yPosition += 12;
      } else if (isPartnerArray) {
        const partnerData = isArrayData
          ? zakahData.find(item => item.year === filters.year) || zakahData[0]
          : zakahData;
        if (partnerData) {
          const summaryText = `اسم الشريك: ${partnerData.partnerName || '-'} | رأس المال: ${partnerData.capitalAmount?.toLocaleString() || 0} | الزكاة السنوية: ${partnerData.annualZakat?.toLocaleString() || 0} | الزكاة الشهرية الحالية: ${partnerData.currentMonthlyZakat?.toLocaleString() || 0} | تاريخ التصدير: ${dayjs().format('DD/MM/YYYY HH:mm')}`;
          doc.text(summaryText, doc.internal.pageSize.width / 2, yPosition, { align: 'center' });
          yPosition += 12;
        }
      } else if (isPartnersList) {
        const summaryText = `عدد الشركاء: ${zakahData.length} | السنة: ${filters.year || ''} | تاريخ التصدير: ${dayjs().format('DD/MM/YYYY HH:mm')}`;
        doc.text(summaryText, doc.internal.pageSize.width / 2, yPosition, { align: 'center' });
        yPosition += 12;
      }

      // معالجة البيانات للجدول
      let allEntries = [];
      if (zakahData.journalsByMonth) {
        Object.entries(zakahData.journalsByMonth).forEach(([month, data]) => {
          if (data.entries && data.entries.length > 0) {
            data.entries.forEach(entry => {
              allEntries.push({
                ...entry,
                month: month,
                requiredZakat: data.requiredZakat || 0
              });
            });
          }
        });
      } else if (isPartnerArray) {
        const partnerData = isArrayData
          ? zakahData.find(item => item.year === filters.year) || zakahData[0]
          : zakahData;
        const partnerYear = partnerData?.year || filters.year;
        if (partnerData?.monthlyBreakdown) {
          partnerData.monthlyBreakdown.forEach(month => {
            allEntries.push({
              ...month,
              month: month.month.toString().padStart(2, '0'),
              description: `زكاة شهر ${month.month}`,
              date: `${partnerYear}-${month.month.toString().padStart(2, '0')}-01`,
              reference: `ZAKAH-${partnerData.partnerName || 'UNKNOWN'}-${partnerYear}-${month.month.toString().padStart(2, '0')}`,
              postedBy: 'النظام',
              type: 'GENERAL',
              status: 'POSTED',
              debit: 0,
              credit: month.amount || 0,
              balance: month.amount || 0
            });
          });
        }
      } else if (isPartnersList) {
        zakahData.forEach((item) => {
          allEntries.push({
            ...item,
            month: filters.month ? filters.month.toString().padStart(2, '0') : '',
            date: `${item.year || filters.year || dayjs().year()}-01-01`,
            partnerName: item.partnerName || '-',
          });
        });
      }

      if (allEntries.length > 0) {
        allEntries.sort((a, b) => new Date(b.date) - new Date(a.date));

        let tableData, headers;

        if (isAccountData) {
          tableData = allEntries.map(entry => [
            `${dayjs(entry.date).locale("ar").format("D [من] MMMM [الساعة] h:mm") + " " + (dayjs(entry.date).hour() < 12 ? "صباحًا" : "مساءً")}\n${entry.hijriDate || ''}`,
            entry.description || '-',
            entry.debit?.toLocaleString() || '0',
            entry.credit?.toLocaleString() || '0',
            entry.balance?.toLocaleString() || '0'
          ]);

          headers = [
            ['التاريخ', 'الوصف', 'مدين', 'دائن', 'الرصيد']
          ];
        } else if (isPartnerArray) {
          tableData = allEntries.map(entry => [
            entry.month, 
            dayjs(entry.date).format('DD/MM/YYYY'),
            entry.description || '-',
            formatInt(entry.credit)
          ]);

          headers = [
            ['الشهر', 'التاريخ', 'الوصف', 'المبلغ']
          ];
        } else {
          // ترتيب مقلوب للاعمدة كما طلبت
          tableData = allEntries.map(entry => [
            formatInt(entry.remaining),          // المتبقي
            formatInt(entry.totalPaid),          // المدفوع
            formatInt(entry.annualZakat),        // الزكاة السنوية
            formatInt(entry.capitalAmount),      // رأس المال
            entry.year || filters.year || '-',   // السنة
            entry.partnerName || '-',            // اسم الشريك
          ]);

          const totals = allEntries.reduce((acc, entry) => ({
            capitalAmount: acc.capitalAmount + Number(entry.capitalAmount || 0),
            annualZakat: acc.annualZakat + Number(entry.annualZakat || 0),
            totalPaid: acc.totalPaid + Number(entry.totalPaid || 0),
            remaining: acc.remaining + Number(entry.remaining || 0),
          }), { capitalAmount: 0, annualZakat: 0, totalPaid: 0, remaining: 0 });

          tableData.push([
            formatInt(totals.remaining),          // المتبقي
            formatInt(totals.totalPaid),          // المدفوع
            formatInt(totals.annualZakat),        // الزكاة السنوية
            formatInt(totals.capitalAmount),      // رأس المال
            filters.year || allEntries[0]?.year || '-', // السنة
            'الإجمالي',                           // اسم الشريك
          ]);

          headers = [
            ['المتبقي', 'المدفوع', 'الزكاة السنوية', 'رأس المال', 'السنة', 'اسم الشريك']
          ];
        }

        const pageWidth = doc.internal.pageSize.getWidth();
        
        let columnWidths;
        let tableWidth;
        if (isAccountData) {
          columnWidths = { 0: 45, 1: 65, 2: 25, 3: 25, 4: 30 };
          tableWidth = 190;
        } else if (isPartnerArray) {
          columnWidths = { 0: 28, 1: 38, 2: 85, 3: 38 };
          tableWidth = 189;
        } else {
          columnWidths = { 0: 23, 1: 23, 2: 31, 3: 31, 4: 23, 5: 61 };
          tableWidth = 192;
        }

        const tableMargins = getCenteredTableMargins(doc, tableWidth);

        autoTable(doc, {
          startY: yPosition + 5,
          head: headers,
          body: tableData,
          rtl: true,
          ...pdfTableBaseStyles,
          styles: { ...pdfTableBaseStyles.styles, fontSize: 9, cellPadding: 4 },
          headStyles: { ...pdfTableBaseStyles.headStyles, fillColor: PRIMARY_COLOR, textColor: [255, 255, 255], fontSize: 9, cellPadding: 4 },
          bodyStyles: { ...pdfTableBaseStyles.bodyStyles, fontSize: 9, cellPadding: 4 },
          columnStyles: Object.keys(columnWidths).reduce((styles, key) => {
            styles[key] = { 
              cellWidth: columnWidths[key],
              halign: 'center',
              valign: 'middle'
            };
            return styles;
          }, {}),
          margin: { 
            top: yPosition, 
            bottom: 25, 
            left: tableMargins.left, 
            right: tableMargins.right 
          },
          tableWidth,
          horizontalPageBreak: false,
          pageBreak: 'auto',
          showHead: 'everyPage',
          didParseCell: function(data) {
            // تلوين صف الإجمالي فقط
            if (data.row.index === tableData.length - 1 && !isAccountData && !isPartnerArray) {
              data.cell.styles.fillColor = [240, 240, 240];
              data.cell.styles.fontStyle = 'bold';
            }
            
            // جعل النص على سطر واحد في الرأس
            if (data.section === 'head') {
              data.cell.styles.overflow = 'hidden';
              data.cell.styles.minCellHeight = 20; // ارتفاع مناسب للرأس
            }
            
            // جعل النص على سطر واحد في الجسم إذا كان اسم الشريك طويلاً
            if (data.column.index === 5 && data.section === 'body') { // عمود اسم الشريك
              data.cell.styles.overflow = 'hidden';
              data.cell.styles.minCellHeight = 15;
            }
          },
          didDrawTable: createDidDrawTable(doc)
        });
      } else {
        doc.setFontSize(14);
        doc.setFont('Amiri', 'bold');
        doc.text('لا توجد عمليات مالية في الفترة المحددة', doc.internal.pageSize.width / 2, yPosition + 20, { align: 'center' });
      }

      const pageCount = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        drawReportFooter(doc, i, pageCount);
      }

      const fileName = `تقرير_الزكاة_${dayjs().format('YYYY-MM-DD')}.pdf`;
      doc.save(fileName);
      resolve();
    } catch (error) {
      console.error('PDF export error:', error.message);
      reject(error);
    }
  });
};

export const exportZakahToExcel = async (zakahData, filters = {}) => {
  try {
    // Lazy load XLSX library
    const XLSX = await import('xlsx');

    const workbook = XLSX.utils.book_new();

    const summaryData = [
      ['تقرير الزكاة'],
      ['']
    ];

    if (filters.month && filters.year) {
      summaryData.push([`الشهر: ${filters.month}/${filters.year}`]);
      summaryData.push(['']);
    } else if (filters.partner && filters.year) {
      summaryData.push([`الشريك: ${filters.partner} | السنة: ${filters.year}`]);
      summaryData.push(['']);
    }

    const isArrayData = Array.isArray(zakahData);
    const isAccountData = !isArrayData && !!zakahData?.account;
    // دعم حالة الشريك المفرد بكائن monthlyBreakdown أيضاً
    const isPartnerArray = (isArrayData && !!filters.partner) || (!isArrayData && !!zakahData?.monthlyBreakdown);
    const isPartnersList = isArrayData && !filters.partner;   

    if (isAccountData) {
      summaryData.push(['إحصائيات الحساب']);
      summaryData.push(['رصيد الحساب', zakahData.account.balance || 0]);
      summaryData.push(['المدفوع', zakahData.account.credit || 0]);
      summaryData.push(['المتبقي', zakahData.account.debit || 0]);
      summaryData.push(['تاريخ التصدير', dayjs().format('DD/MM/YYYY HH:mm')]);
      summaryData.push(['']);
    } else if (isPartnerArray) {
      const partnerData = isArrayData
        ? zakahData.find(item => item.year === filters.year) || zakahData[0]
        : zakahData;
      if (partnerData) {
        summaryData.push(['إحصائيات الزكاة']);
        summaryData.push(['اسم الشريك', partnerData.partnerName || '-']);
        summaryData.push(['رأس المال', partnerData.capitalAmount || 0]);
        summaryData.push(['الزكاة السنوية', partnerData.annualZakat || 0]);
        summaryData.push(['المدفوع', partnerData.totalPaid || 0]);
        summaryData.push(['المتبقي', partnerData.remaining || 0]);
        summaryData.push(['تاريخ التصدير', dayjs().format('DD/MM/YYYY HH:mm')]);
        summaryData.push(['']);
      }
    } else if (isPartnersList) {
      summaryData.push(['إحصائيات الشركاء']);
      summaryData.push(['عدد الشركاء', zakahData.length]);
      summaryData.push(['السنة', filters.year || '-']);
      summaryData.push(['تاريخ التصدير', dayjs().format('DD/MM/YYYY HH:mm')]);
      summaryData.push(['']);
    }

    let allEntries = [];
    if (zakahData.journalsByMonth) {
      Object.entries(zakahData.journalsByMonth).forEach(([month, data]) => {
        if (data.entries && data.entries.length > 0) {
          data.entries.forEach(entry => {
            allEntries.push({
              ...entry,
              month: month,
              requiredZakat: data.requiredZakat || 0
            });
          });
        }
      });
    } else if (isPartnerArray) {
      const partnerData = isArrayData
        ? zakahData.find(item => item.year === filters.year) || zakahData[0]
        : zakahData;
      const partnerYear = partnerData?.year || filters.year;
      if (partnerData?.monthlyBreakdown) {
        partnerData.monthlyBreakdown.forEach(month => {
          allEntries.push({
            month: month.month.toString().padStart(2, '0'),
            date: `${partnerYear}-${month.month.toString().padStart(2, '0')}-01`,
            reference: `ZAKAH-${partnerData.partnerName || 'UNKNOWN'}-${partnerYear}-${month.month.toString().padStart(2, '0')}`,
            description: `زكاة شهر ${month.month}`,
            postedBy: 'النظام',
            type: 'GENERAL',
            status: month.status || 'PENDING',
            debit: 0,
            credit: month.amount || 0,
            balance: month.amount || 0
          });
        });
      }
    } else if (isPartnersList) {
      zakahData.forEach((item) => {
        allEntries.push({
          ...item,
          month: filters.month ? filters.month.toString().padStart(2, '0') : '',
          date: `${item.year || filters.year || dayjs().year()}-01-01`,
          partnerName: item.partnerName || '-',
        });
      });
    }

    allEntries.sort((a, b) => new Date(b.date) - new Date(a.date));

    let excelData;
    if (isAccountData) {
      excelData = allEntries.map(entry => ({
        'التاريخ الميلادي': dayjs(entry.date).locale("ar").format("D [من] MMMM [الساعة] h:mm") + " " + (dayjs(entry.date).hour() < 12 ? "صباحًا" : "مساءً"),
        'التاريخ الهجري': entry.hijriDate || '',
        'الوصف': entry.description || '-',
        'مدين': entry.debit || 0,
        'دائن': entry.credit || 0,
        'الرصيد': entry.balance || 0
      }));
    } else if (isPartnerArray) {
      excelData = allEntries.map(entry => ({
        'الشهر': entry.month,
        'التاريخ': dayjs(entry.date).format('DD/MM/YYYY'),
        'الوصف': entry.description || '-',
        'المبلغ': entry.credit || 0
      }));
    } else {
      // ترتيب مقلوب للاعمدة في Excel أيضًا
      excelData = allEntries.map(entry => ({
        'المتبقي': Number(entry.remaining) || 0,
        'المدفوع': Number(entry.totalPaid) || 0,
        'الزكاة السنوية': Number(entry.annualZakat) || 0,
        'رأس المال': Number(entry.capitalAmount) || 0,
        'السنة': entry.year || filters.year || '-',
        'اسم الشريك': entry.partnerName || '-',
      }));

      const totals = allEntries.reduce((acc, entry) => ({
        capitalAmount: acc.capitalAmount + Number(entry.capitalAmount || 0),
        annualZakat: acc.annualZakat + Number(entry.annualZakat || 0),
        totalPaid: acc.totalPaid + Number(entry.totalPaid || 0),
        remaining: acc.remaining + Number(entry.remaining || 0),
      }), { capitalAmount: 0, annualZakat: 0, totalPaid: 0, remaining: 0 });

      excelData.push({
        'المتبقي': totals.remaining,
        'المدفوع': totals.totalPaid,
        'الزكاة السنوية': totals.annualZakat,
        'رأس المال': totals.capitalAmount,
        'السنة': filters.year || allEntries[0]?.year || '-',
        'اسم الشريك': 'الإجمالي',
      });
    }

    const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);

    const dataSheet = XLSX.utils.json_to_sheet(excelData);

    let wscols;
    if (isAccountData) {
      wscols = [
        { wch: 25 }, // التاريخ الميلادي
        { wch: 15 }, // التاريخ الهجري
        { wch: 40 }, // الوصف
        { wch: 15 }, // مدين
        { wch: 15 }, // دائن
        { wch: 18 }  // الرصيد
      ];
    } else if (isPartnerArray) {
      wscols = [
        { wch: 12 }, // الشهر
        { wch: 18 }, // التاريخ
        { wch: 40 }, // الوصف
        { wch: 14 }  // المبلغ
      ];
    } else {
      // أبعاد أكبر للExcel مع ترتيب مقلوب
      wscols = [
        { wch: 18 }, // المتبقي
        { wch: 18 }, // المدفوع
        { wch: 20 }, // الزكاة السنوية
        { wch: 20 }, // رأس المال
        { wch: 15 }, // السنة
        { wch: 30 }, // اسم الشريك
      ];
    }
    dataSheet['!cols'] = wscols;

    XLSX.utils.book_append_sheet(workbook, summarySheet, 'ملخص');
    XLSX.utils.book_append_sheet(workbook, dataSheet, 'العمليات المالية');

    const excelBuffer = XLSX.write(workbook, {
      bookType: 'xlsx',
      type: 'array',
      bookSST: false
    });

    const blob = new Blob([excelBuffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    });

    const fileName = `تقرير_الزكاة_${dayjs().format('YYYY-MM-DD')}.xlsx`;
    saveAs(blob, fileName);

  } catch (error) {
    console.error('Excel export error:', error.message);
    throw error;
  }
};