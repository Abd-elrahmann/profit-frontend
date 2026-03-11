import React, { useState, useCallback } from 'react';
import html2pdf from 'html2pdf.js';
import Api, { handleApiError } from '../../config/Api';
import { notifyError } from '../../utilities/toastify';
import { ensureFontsReady } from '../../utilities/fontLoader';
import PartnerWithdrawVoucher from '../Contracts/PartnerWithdrawVoucher';

const numberToArabicWords = (num) => {
  const ones = ['', 'واحد', 'اثنان', 'ثلاثة', 'أربعة', 'خمسة', 'ستة', 'سبعة', 'ثمانية', 'تسعة'];
  const tens = ['', '', 'عشرون', 'ثلاثون', 'أربعون', 'خمسون', 'ستون', 'سبعون', 'ثمانون', 'تسعون'];
  const teens = ['عشرة', 'أحد عشر', 'اثنا عشر', 'ثلاثة عشر', 'أربعة عشر', 'خمسة عشر', 'ستة عشر', 'سبعة عشر', 'ثمانية عشر', 'تسعة عشر'];
  const hundreds = ['', 'مائة', 'مئتان', 'ثلاثمائة', 'أربعمائة', 'خمسمائة', 'ستمائة', 'سبعمائة', 'ثمانمائة', 'تسعمائة'];
  
  if (num === 0) return 'صفر';
  if (num < 0) return 'سالب ' + numberToArabicWords(-num);
  
  let result = '';
  let hasThousands = false;
  
  if (num >= 1000000) {
    const millionsPart = Math.floor(num / 1000000);
    if (millionsPart === 1) {
      result += 'مليون ';
    } else if (millionsPart === 2) {
      result += 'مليونان ';
    } else if (millionsPart < 11) {
      result += ones[millionsPart] + ' ملايين ';
    } else {
      result += numberToArabicWords(millionsPart) + ' مليون ';
    }
    num %= 1000000;
  }
  
  if (num >= 1000) {
    const thousandsPart = Math.floor(num / 1000);
    if (thousandsPart === 1) {
      result += 'ألف ';
    } else if (thousandsPart === 2) {
      result += 'ألفان ';
    } else if (thousandsPart >= 3 && thousandsPart <= 9) {
      result += ones[thousandsPart] + ' آلاف ';
    } else if (thousandsPart === 10) {
      result += 'عشرة آلاف ';
    } else {
      result += numberToArabicWords(thousandsPart) + ' ألف ';
    }
    num %= 1000;
    hasThousands = true;
  }
  
  if (num >= 100) {
    const hundredsPart = Math.floor(num / 100);
    if (hasThousands) {
      result += 'و' + hundreds[hundredsPart];
    } else {
      result += hundreds[hundredsPart];
    }
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

const getMonthName = (month) => {
  const months = [
    'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
    'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
  ];
  return months[month - 1] || '';
};

const PartnerWithdrawVoucherGenerator = React.forwardRef(
  ({ scheduleData, partnerData, withdrawalData, currentUserName = '', onVoucherGenerated }, ref) => {
    const [voucherHtml, setVoucherHtml] = useState('');
    // eslint-disable-next-line no-unused-vars
    const [isGenerating, setIsGenerating] = useState(false);

    const uploadPDFToServer = useCallback(async (pdfBlob, scheduleId) => {
      try {
        const formData = new FormData();
        const filename = `سند_صرف_مساهم_${Date.now()}.pdf`;
        formData.append('file', pdfBlob, filename);
        const response = await Api.post(`/api/partner-withdraw/upload-voucher/${scheduleId}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        return response.data?.voucherUrl;
      } catch (error) {
        handleApiError(error);
        throw error;
      }
    }, []);

    const generatePDF = useCallback(
      async (htmlContent = voucherHtml, scheduleId = null) => {
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
            filename: `سند_صرف_مساهم_${Date.now()}.pdf`,
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
          
          let voucherUrl = null;
          if (scheduleId) {
            voucherUrl = await uploadPDFToServer(pdfBlob, scheduleId);
          }
          
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
      (customScheduleData = null, customPartnerData = null, customWithdrawalData = null, receiptNumOverride = null, approverName = null) => {
        const schedule = customScheduleData || scheduleData;
        const partner = customPartnerData || partnerData;
        const withdrawal = customWithdrawalData || withdrawalData;
        const responsibleName = approverName || currentUserName || '';
        
        if (!schedule || !partner) {
          notifyError('لا توجد بيانات للسند');
          return null;
        }
        
        const originalAmount = schedule.amount || 0;
        const carryAmount = schedule.carryAmount || 0;
        const totalAmount = originalAmount + carryAmount;
        const { gregorianDate, hijriDate } = getCurrentDates();
        const receiptNum = receiptNumOverride != null ? String(receiptNumOverride) : String(Date.now());
        const amountInWords = `${numberToArabicWords(Math.round(totalAmount))} ريال`;
        const monthName = `${getMonthName(schedule.month)} ${schedule.year}`;
        const partnerTotalProfit = partner?.totalProfit || 0;
        const withdrawalCapital = withdrawal?.remainingCapital || withdrawal?.totalCapital || 0;
        const totalCapital = withdrawalCapital + partnerTotalProfit;
        
        let amountDetails = '';
        if (carryAmount > 0 && originalAmount > 0) {
          amountDetails = ` (${originalAmount.toLocaleString('en-US')} ريال دفعة أصلية + ${carryAmount.toLocaleString('en-US')} ريال مُرحّل من الدفعة السابقة)`;
        } else if (carryAmount > 0 && originalAmount === 0) {
          amountDetails = ` (مبلغ مُرحّل من الدفعة السابقة)`;
        }

        const template = PartnerWithdrawVoucher();
        const filledTemplate = template
          .replace(/{{رقم_السند}}/g, receiptNum)
          .replace(/{{الشهر}}/g, monthName)
          .replace(/{{التاريخ_الهجري}}/g, hijriDate)
          .replace(/{{التاريخ_الميلادي}}/g, gregorianDate)
          .replace(/{{المبلغ_رقما}}/g, totalAmount?.toLocaleString('en-US') || '0')
          .replace(/{{المبلغ_كتابة}}/g, amountInWords)
          .replace(/{{تفاصيل_المبلغ}}/g, amountDetails)
          .replace(/{{اسم_المساهم}}/g, partner?.name || '')
          .replace(/{{رقم_الهوية}}/g, partner?.nationalId || '')
          .replace(/{{رأس_المال_الكلي}}/g, totalCapital?.toLocaleString('en-US') || '0')
          .replace(/{{اسم_المسؤول_عن_الصرف}}/g, responsibleName);

        setVoucherHtml(filledTemplate);
        return filledTemplate;
      },
      [scheduleData, partnerData, withdrawalData, currentUserName]
    );

    React.useImperativeHandle(ref, () => ({
      generateVoucher,
      generatePDF: (scheduleId) => generatePDF(voucherHtml, scheduleId),
      getVoucherHtml: () => voucherHtml,
    }));

    return null;
  }
);

export default PartnerWithdrawVoucherGenerator;
