import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import dayjs from 'dayjs';
import 'dayjs/locale/ar';
import logo from '/assets/images/logo.webp';

const formatInt = (value) => {
  const num = Number(value || 0);
  if (!Number.isFinite(num)) return '0';
  return Math.round(num).toLocaleString();
};

const registerArabicFonts = (doc) => {
  try {
    doc.addFont('/assets/fonts/Amiri-Regular.ttf', 'Amiri', 'normal');
    doc.addFont('/assets/fonts/Amiri-Bold.ttf', 'Amiri', 'bold');
  } catch (error) {
    console.warn('Arabic fonts not found, using default fonts', error);
  }
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

      doc.setFont('Amiri', 'bold');

      const logoWidth = 10;
      const logoHeight = 10;
      const logoX = doc.internal.pageSize.width - logoWidth - 5;
      const logoY = 5;
      doc.addImage(logo, 'PNG', logoX, logoY, logoWidth, logoHeight);

      doc.setFontSize(18);
      doc.setFont('Amiri', 'bold');
      doc.text('تقرير الزكاة', doc.internal.pageSize.width / 2, 25, { align: 'center' });

      let yPosition = 35;
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
      // اعتبر الشريك المحدد سواء كان Array أو كائن مفرد يحوي monthlyBreakdown
      const isPartnerArray = (isArrayData && !!filters.partner) || (!isArrayData && !!zakahData?.monthlyBreakdown);
      const isPartnersList = isArrayData && !filters.partner;   

      if (isAccountData) {
        const summaryText = `رصيد الحساب: ${zakahData.account.balance?.toLocaleString() || 0} | المدفوع: ${zakahData.account.credit?.toLocaleString() || 0} | المتبقي: ${zakahData.account.debit?.toLocaleString() || 0} | تاريخ التصدير: ${dayjs().format('DD/MM/YYYY HH:mm')}`;
        doc.text(summaryText, doc.internal.pageSize.width / 2, yPosition, { align: 'center' });
        yPosition += 12;
      } else if (isPartnerArray) {
        const partnerData = isArrayData
          ? zakahData.find(item => item.year === filters.year) || zakahData[0]
          : zakahData;
        if (partnerData) {
          const summaryText = `اسم الشريك: ${partnerData.partnerName || '-'} | رأس المال: ${partnerData.capitalAmount?.toLocaleString() || 0} | الزكاة السنوية: ${partnerData.annualZakat?.toLocaleString() || 0} | تاريخ التصدير: ${dayjs().format('DD/MM/YYYY HH:mm')}`;
          doc.text(summaryText, doc.internal.pageSize.width / 2, yPosition, { align: 'center' });
          yPosition += 12;
        }
      } else if (isPartnersList) {
        const summaryText = `عدد الشركاء: ${zakahData.length} | السنة: ${filters.year || ''} | تاريخ التصدير: ${dayjs().format('DD/MM/YYYY HH:mm')}`;
        doc.text(summaryText, doc.internal.pageSize.width / 2, yPosition, { align: 'center' });
        yPosition += 12;
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
          tableData = allEntries.map(entry => [
            formatInt(entry.remaining),
            formatInt(entry.totalPaid),
            formatInt(entry.monthlyZakat),
            formatInt(entry.annualZakat),
            formatInt(entry.capitalAmount),
            entry.year || filters.year || '-',
            entry.partnerName || '-',
          ]);

          const totals = allEntries.reduce((acc, entry) => ({
            capitalAmount: acc.capitalAmount + Number(entry.capitalAmount || 0),
            annualZakat: acc.annualZakat + Number(entry.annualZakat || 0),
            monthlyZakat: acc.monthlyZakat + Number(entry.monthlyZakat || 0),
            totalPaid: acc.totalPaid + Number(entry.totalPaid || 0),
            remaining: acc.remaining + Number(entry.remaining || 0),
          }), { capitalAmount: 0, annualZakat: 0, monthlyZakat: 0, totalPaid: 0, remaining: 0 });

          tableData.push([
            formatInt(totals.remaining),
            formatInt(totals.totalPaid),
            formatInt(totals.monthlyZakat),
            formatInt(totals.annualZakat),
            formatInt(totals.capitalAmount),
            filters.year || allEntries[0]?.year || '-',
            'الإجمالي',
          ]);

          headers = [
            ['المتبقي', 'المدفوع', 'الزكاة الشهرية', 'الزكاة السنوية', 'رأس المال', 'السنة', 'اسم الشريك']
          ];
        }

    
        let columnWidths;
        if (isAccountData) {
            columnWidths = {
            0: 50, // التاريخ (أكبر لأنه يحتوي على التاريخين)
            1: 60, // الوصف
            2: 25, // مدين
            3: 25, // دائن
            4: 30  // الرصيد
          };
        } else if (isPartnerArray) {
          // إجمالي عرض يقارب 150مم داخل الهوامش لتجنب القص
          columnWidths = {
            0: 18,  // الشهر
            1: 32,  // التاريخ
            2: 70,  // الوصف
            3: 28   // المبلغ
          };
        } else {
          columnWidths = {
            0: 26, 
            1: 26, 
            2: 26, 
            3: 26, 
            4: 26, 
            5: 16, 
            6: 36, 
          };
        }

      autoTable(doc, {
        startY: yPosition,
        head: headers,
        body: tableData,
        rtl: true,
          theme: 'striped',
          styles: {
            font: 'Amiri',
            fontStyle: 'bold',
            fontSize: 9, 
            cellPadding: 2,
            lineColor: [200, 200, 200],
            lineWidth: 0.1,
            halign: 'center',
            valign: 'middle'
          },
          headStyles: {
            fillColor: [240, 240, 240],
            textColor: [46, 139, 69],
            fontStyle: 'bold',
            fontSize: 10, 
            halign: 'center',
            valign: 'middle',
            cellPadding: 3
          },
          bodyStyles: {
            fontStyle: 'bold',
            halign: 'center',
            valign: 'middle',
            cellPadding: 1
          },
          alternateRowStyles: {
            fillColor: [250, 250, 250]
          },
          columnStyles: Object.keys(columnWidths).reduce((styles, key, index) => {
            styles[index] = { cellWidth: columnWidths[key], fontSize: 9 };
            return styles;
          }, {}),
          margin: { top: yPosition, bottom: 20, left: 15, right: 20 },
          horizontalPageBreak: false,
          pageBreak: 'auto',
          showHead: 'everyPage'
        });
      } else {
        doc.setFontSize(14);
        doc.setFont('Amiri', 'bold');
        doc.text('لا توجد عمليات مالية في الفترة المحددة', doc.internal.pageSize.width / 2, yPosition + 20, { align: 'center' });
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
        summaryData.push(['الزكاة الشهرية', partnerData.monthlyZakat || 0]);
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
        'المبلغ': Math.round(entry.credit || 0)
      }));
    } else {
          excelData = allEntries.map(entry => ({
            'المتبقي': Math.round(Number(entry.remaining) || 0),
            'المدفوع': Math.round(Number(entry.totalPaid) || 0),
            'الزكاة الشهرية': Math.round(Number(entry.monthlyZakat) || 0),
            'الزكاة السنوية': Math.round(Number(entry.annualZakat) || 0),
            'رأس المال': Math.round(Number(entry.capitalAmount) || 0),
            'السنة': entry.year || filters.year || '-',
            'اسم الشريك': entry.partnerName || '-',
          }));

          const totals = allEntries.reduce((acc, entry) => ({
            capitalAmount: acc.capitalAmount + Number(entry.capitalAmount || 0),
            annualZakat: acc.annualZakat + Number(entry.annualZakat || 0),
            monthlyZakat: acc.monthlyZakat + Number(entry.monthlyZakat || 0),
            totalPaid: acc.totalPaid + Number(entry.totalPaid || 0),
            remaining: acc.remaining + Number(entry.remaining || 0),
          }), { capitalAmount: 0, annualZakat: 0, monthlyZakat: 0, totalPaid: 0, remaining: 0 });

          excelData.push({
            'المتبقي': Math.round(totals.remaining),
            'المدفوع': Math.round(totals.totalPaid),
            'الزكاة الشهرية': Math.round(totals.monthlyZakat),
            'الزكاة السنوية': Math.round(totals.annualZakat),
            'رأس المال': Math.round(totals.capitalAmount),
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
      wscols = [
        { wch: 20 }, 
        { wch: 20 },
        { wch: 20 },
        { wch: 20 },
        { wch: 20 },
        { wch: 14 },
        { wch: 30 },
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
