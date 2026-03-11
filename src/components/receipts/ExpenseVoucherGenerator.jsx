import React, { useState, useCallback } from 'react';
import html2pdf from 'html2pdf.js';
import Api, { handleApiError } from '../../config/Api';
import { notifyError } from '../../utilities/toastify';
import { ensureFontsReady } from '../../utilities/fontLoader';
import ExpenseVoucher from '../Contracts/ExpenseVoucher';

const numberToArabicWords = (num) => {
  const ones = ['', 'واحد', 'اثنان', 'ثلاثة', 'أربعة', 'خمسة', 'ستة', 'سبعة', 'ثمانية', 'تسعة'];
  const tens = ['', '', 'عشرون', 'ثلاثون', 'أربعون', 'خمسون', 'ستون', 'سبعون', 'ثمانون', 'تسعون'];
  const teens = ['عشرة', 'أحد عشر', 'اثنا عشر', 'ثلاثة عشر', 'أربعة عشر', 'خمسة عشر', 'ستة عشر', 'سبعة عشر', 'ثمانية عشر', 'تسعة عشر'];
  const hundreds = ['', 'مائة', 'مئتان', 'ثلاثمائة', 'أربعمائة', 'خمسمائة', 'ستمائة', 'سبعمائة', 'ثمانمائة', 'تسعمائة'];
  if (num === 0) return 'صفر';
  if (num < 0) return 'سالب ' + numberToArabicWords(-num);
  let result = '';
  let hasThousands = false;
  if (num >= 1000) {
    const thousandsPart = Math.floor(num / 1000);
    result += thousandsPart === 1 ? 'ألف ' : numberToArabicWords(thousandsPart) + ' ألف ';
    num %= 1000;
    hasThousands = true;
  }
  if (num >= 100) {
    const hundredsPart = Math.floor(num / 100);
    result += (hasThousands ? 'و' : '') + hundreds[hundredsPart];
    num %= 100;
    if (num > 0) result += ' و';
  }
  if (num >= 20) {
    const t = Math.floor(num / 10);
    const o = num % 10;
    result += o > 0 ? ones[o] + ' و' + tens[t] : tens[t];
  } else if (num >= 10) {
    result += teens[num - 10];
  } else if (num > 0) {
    result += ones[num];
  }
  return result.trim();
};

const getCurrentDates = () => {
  const now = new Date();
  const hijriFormatter = new Intl.DateTimeFormat('ar-SA-u-ca-islamic-umalqura', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'Asia/Riyadh',
  });
  let hijriDate = hijriFormatter.format(now);
  hijriDate = hijriDate.replace(/\s+/g, ' ').trim();
  hijriDate = hijriDate.replace(' ', ' من ');
  if (!hijriDate.includes('هـ')) hijriDate = `${hijriDate} هـ`;
  const gregorianFormatter = new Intl.DateTimeFormat('ar-SA-u-ca-gregory', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'Asia/Riyadh',
  });
  const gregorianDate = gregorianFormatter.format(now);
  return { gregorianDate, hijriDate };
};

const ExpenseVoucherGenerator = React.forwardRef(
  ({ expenseData, employeesList = [], currentUserName = '', onVoucherGenerated }, ref) => {
    const [voucherHtml, setVoucherHtml] = useState('');
    // eslint-disable-next-line no-unused-vars
    const [isGenerating, setIsGenerating] = useState(false);

    const uploadPDFToServer = useCallback(async (pdfBlob) => {
      try {
        const formData = new FormData();
        const filename = `سند_صرف_${Date.now()}.pdf`;
        formData.append('file', pdfBlob, filename);
        const response = await Api.post('/api/expenses/upload-voucher', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        return response.data?.voucherUrl;
      } catch (error) {
        handleApiError(error);
        throw error;
      }
    }, []);

    const generatePDF = useCallback(
      async (htmlContent = voucherHtml) => {
        const contentToUse = htmlContent || voucherHtml;
        if (!contentToUse) {
          notifyError('لا يوجد محتوى سند لتحويله إلى PDF');
          return null;
        }
        try {
          setIsGenerating(true);
          let cleanedContent = contentToUse;
          const tempDiv = document.createElement('div');
          tempDiv.innerHTML = contentToUse;
          const contractWrapper = tempDiv.querySelector('.contract-wrapper');
          if (contractWrapper) {
            cleanedContent = contractWrapper.outerHTML;
          }
          const tempElement = document.createElement('div');
          tempElement.style.width = '794px';
          tempElement.style.backgroundColor = '#ffffff';
          tempElement.style.margin = '0 auto';
          tempElement.style.padding = '0';
          tempElement.style.position = 'relative';
          tempElement.innerHTML = cleanedContent;
          document.body.appendChild(tempElement);
          await ensureFontsReady();
          const options = {
            margin: 0,
            filename: `سند_صرف_${Date.now()}.pdf`,
            image: { type: 'jpeg', quality: 1 },
            html2canvas: {
              scale: 2,
              useCORS: true,
              backgroundColor: '#ffffff',
              scrollX: 0,
              scrollY: 0,
              windowWidth: 794,
            },
            jsPDF: {
              unit: 'mm',
              format: 'a4',
              orientation: 'portrait',
              compress: true,
            },
          };
          const pdfBlob = await html2pdf().from(tempElement).set(options).outputPdf('blob');
          document.body.removeChild(tempElement);
          const voucherUrl = await uploadPDFToServer(pdfBlob);
          if (onVoucherGenerated) onVoucherGenerated(pdfBlob, voucherUrl);
          return voucherUrl;
        } catch (error) {
          notifyError('حدث خطأ أثناء إنشاء ملف PDF');
          handleApiError(error);
          throw error;
        } finally {
          setIsGenerating(false);
        }
      },
      [voucherHtml, uploadPDFToServer, onVoucherGenerated]
    );

    const generateVoucher = useCallback(
      (customData = null, receiptNumOverride = null) => {
        const data = customData || expenseData;
        if (!data?.expenses?.length) {
          notifyError('لا توجد بيانات مصروفات');
          return null;
        }
        const expenses = data.expenses;
        const totalAmount = expenses.reduce((sum, e) => sum + (e.amount || 0), 0);
        const { gregorianDate, hijriDate } = getCurrentDates();
        const receiptNum = receiptNumOverride != null ? String(receiptNumOverride) : String(Date.now());
        const amountInWords = `${numberToArabicWords(totalAmount)} ريال`;

        const firstExpense = expenses[0];
        const isSalary = firstExpense.type === 'مصروف رواتب';
        const firstEmployee = firstExpense.userId && employeesList.find((u) => u.id === firstExpense.userId);
        const recipientName = isSalary
          ? (firstEmployee?.name || 'غير محدد')
          : (expenses.length > 1 ? 'صرف مصروفات متعددة: ' + expenses.map((e) => e.type).join('، ') : (firstExpense.type || 'مصروفات'));
        const recipientPhone = firstEmployee?.phone || '-';
        const phoneRowHtml = isSalary
          ? `<div class="row"><p>رقم الهاتف:</p> <span>${recipientPhone}</span></div>`
          : '';

        let band = firstExpense.type || 'مصروفات';
        if (expenses.length > 1) {
          band = 'صرف مصروفات متعددة: ' + expenses.map((e) => e.type).join('، ');
        }

        const template = ExpenseVoucher();
        const filledTemplate = template
          .replace(/{{رقم_السند}}/g, receiptNum)
          .replace(/{{البند}}/g, band)
          .replace(/{{التاريخ_الهجري}}/g, hijriDate)
          .replace(/{{التاريخ_الميلادي}}/g, gregorianDate)
          .replace(/{{المبلغ_رقما}}/g, totalAmount?.toLocaleString('en-US') || '0')
          .replace(/{{المبلغ_كتابة}}/g, amountInWords)
          .replace(/{{اسم_المستلم}}/g, recipientName)
          .replace(/{{صف_رقم_الهاتف}}/g, phoneRowHtml)
          .replace(/{{اسم_المسؤول_عن_الصرف}}/g, currentUserName || '');

        setVoucherHtml(filledTemplate);
        return filledTemplate;
      },
      [expenseData, employeesList, currentUserName]
    );

    React.useImperativeHandle(ref, () => ({
      generateVoucher,
      generatePDF: () => generatePDF(voucherHtml),
      getVoucherHtml: () => voucherHtml,
    }));

    return null;
  }
);

export default ExpenseVoucherGenerator;
