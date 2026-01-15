
import React, { useState, useCallback, useEffect } from 'react';
import Api, { handleApiError } from '../config/Api';
import { notifyError } from '../utilities/toastify';
import html2pdf from 'html2pdf.js';

const numberToArabicWords = (num) => {
  const ones = ["", "واحد", "اثنان", "ثلاثة", "أربعة", "خمسة", "ستة", "سبعة", "ثمانية", "تسعة"];
  const tens = ["", "", "عشرون", "ثلاثون", "أربعون", "خمسون", "ستون", "سبعون", "ثمانون", "تسعون"];
  const teens = ["عشرة", "أحد عشر", "اثنا عشر", "ثلاثة عشر", "أربعة عشر", "خمسة عشر", "ستة عشر", "سبعة عشر", "ثمانية عشر", "تسعة عشر"];
  const hundreds = ["", "مائة", "مئتان", "ثلاثمائة", "أربعمائة", "خمسمائة", "ستمائة", "سبعمائة", "ثمانمائة", "تسعمائة"];

  if (num === 0) return "صفر";
  if (num < 0) return "سالب " + numberToArabicWords(-num);

  let result = "";
  let hasThousands = false;

  const scale = [
    { value: 1e9, singular: "مليار", dual: "ملياران", plural: "مليارات" },
    { value: 1e6, singular: "مليون", dual: "مليونان", plural: "ملايين" },
    { value: 1e3, singular: "ألف", dual: "ألفان", plural: "آلاف" },
  ];

  // معالجة المليارات والملايين والآلاف
  for (let s of scale) {
    if (num >= s.value) {
      const part = Math.floor(num / s.value);
      if (part === 1) result += s.singular + " ";
      else if (part === 2) result += s.dual + " ";
      else if (part >= 3 && part <= 9) result += ones[part] + " " + s.plural + " ";
      else if (part === 10) result += "عشرة " + s.plural + " ";
      else {
        // أي رقم أكبر من 10
        result += numberToArabicWords(part) + " " + s.singular + " ";
      }

      num %= s.value;
      if (s.value === 1e3) hasThousands = true;
    }
  }

// Handle hundreds
if (num >= 100) {
  const hundredsPart = Math.floor(num / 100);

  if (hundredsPart > 0) {
    if (hasThousands) {
      result += "و" + hundreds[hundredsPart];
    } else {
      result += hundreds[hundredsPart];
    }
  }

  num %= 100;

  if (num > 0 && hundredsPart > 0) result += " ";
}

  // العشرات والآحاد مع قواعد نحو عربية صحيحة
  if (num >= 20) {
    const t = Math.floor(num / 10);
    const o = num % 10;
    const hasHigherUnits = result.length > 0;

    if (hasHigherUnits) {
      result = result.trim();
      if (!result.endsWith("و")) {
        result += " و";
      }
      result += " ";
    }

    if (o > 0) {
      result += ones[o] + " و" + tens[t];
    } else {
      result += tens[t];
    }
  } else if (num >= 10) {
    const hasHigherUnits = result.length > 0;

    if (hasHigherUnits) {
      result = result.trim();
      if (!result.endsWith("و")) {
        result += " و";
      }
      result += " ";
    }
    result += teens[num - 10];
  } else if (num > 0) {
    const hasHigherUnits = result.length > 0;

    if (hasHigherUnits) {
      result = result.trim();
      if (!result.endsWith("و")) {
        result += " و";
      }
      result += " ";
    }
    result += ones[num];
  }

  return result.trim();
};

const getCurrentDates = () => {
  // إنشاء تاريخ اليوم في توقيت السعودية لضمان الدقة
  const now = new Date();
  const saudiDate = new Date(now.toLocaleString("en-US", {timeZone: "Asia/Riyadh"}));

  // إنشاء تاريخ بداية اليوم (منتصف الليل) في توقيت السعودية
  const today = new Date(saudiDate.getFullYear(), saudiDate.getMonth(), saudiDate.getDate());

  const hijriFormatter = new Intl.DateTimeFormat('ar-SA-u-ca-islamic-umalqura', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'Asia/Riyadh'
  });

  let hijriDate = hijriFormatter.format(today);
  hijriDate = hijriDate.replace(/\s+/g, ' ').trim();
  hijriDate = hijriDate.replace(' ', ' من ');
  // Remove 'هـ' if it exists, since template will add it
  hijriDate = hijriDate.replace(' هـ', '');

  const gregorianFormatter = new Intl.DateTimeFormat('ar-SA-u-ca-gregory', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'Asia/Riyadh'
  });

  const gregorianDate = gregorianFormatter.format(today);

  return {
    gregorianDate: gregorianDate,
    hijriDate
  };
};

const PaymentProofGenerator = React.forwardRef(({
  installmentData,
  installmentsData = [], // Array of installments for bulk operations
  loanData,
  clientData,
  investorData,
  templateContent,
  onContractGenerated,
  employeeName = "",
  autoGenerate = false,
  discount = 0,
  receiptNumber = null // Add receiptNumber prop from backend
}, ref) => {
  const [contractHtml, setContractHtml] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const uploadPDFToServer = useCallback(async (pdfBlob, isBulkOperation = false, repaymentIds = []) => {
    try {
      const formData = new FormData();

      let filename, endpoint;
      if (isBulkOperation) {
        filename = `إيصال_سداد_الدفعات_المجمع_${Date.now()}.pdf`;
        // Send repaymentIds as array
        repaymentIds.forEach(id => {
          formData.append('repaymentIds[]', id);
        });
        endpoint = `/api/repayments/payment-proof-bulk`;
      } else {
        filename = `إيصال_سداد_الدفعة_${installmentData.id}_${Date.now()}.pdf`;
        endpoint = `/api/repayments/PaymentProof/${installmentData.id}`;
      }

      formData.append('file', pdfBlob, filename);

      const response = await Api.post(endpoint, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return response.data;
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  }, [installmentData?.id]);

  const generatePDF = useCallback(async (htmlContent = contractHtml, isBulkOperation = false, repaymentIds = []) => {
    const contentToUse = htmlContent || contractHtml;

    if (!contentToUse) {
      notifyError('لا يوجد محتوى إيصال لتحويله إلى PDF');
      return;
    }

    try {
      setIsGenerating(true);

      // إزالة أي div إضافي محيط بالمحتوى
      let cleanedContent = contentToUse;

      // إذا كان المحتوى يحتوي على div إضافي من template، نستخرجه
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = contentToUse;

      // البحث عن contract-wrapper داخل المحتوى
      const contractWrapper = tempDiv.querySelector('.contract-wrapper');

      if (contractWrapper) {
        // أخذ المحتوى الداخلي فقط
        cleanedContent = contractWrapper.outerHTML;
      }

      const filename = isBulkOperation
        ? `payment_proof_bulk_${Date.now()}.pdf`
        : `payment_proof_${installmentData?.id || 'unknown'}_${Date.now()}.pdf`;

      const options = {
        margin: 0,
        filename: filename,
        image: { type: 'jpeg', quality: 1 },
        html2canvas: {
          scale: 2,
          useCORS: true,
          backgroundColor: "#ffffff",
          scrollX: 0,
          scrollY: 0,
          windowWidth: 794,
        },
        jsPDF: {
          unit: 'mm',
          format: 'a4',
          orientation: 'portrait',
          compress: true,
        }
      };

      // إنشاء عنصر مؤقت بدون أي div إضافي
      const tempElement = document.createElement('div');
      tempElement.style.width = '794px';
      tempElement.style.backgroundColor = 'white';
      tempElement.style.margin = '0 auto';
      tempElement.style.padding = '0';
      tempElement.innerHTML = cleanedContent;

      // إضافة العنصر مؤقتاً إلى body
      document.body.appendChild(tempElement);

      // انتظار قليل لتحميل الخطوط والصور
      await new Promise(resolve => setTimeout(resolve, 500));

      const pdfBlob = await html2pdf()
        .from(tempElement)
        .set(options)
        .outputPdf('blob');

      // إزالة العنصر المؤقت
      document.body.removeChild(tempElement);

      await uploadPDFToServer(pdfBlob, isBulkOperation, repaymentIds);

      if (onContractGenerated) {
        onContractGenerated(pdfBlob, 'PAYMENT_PROOF');
      }

      return pdfBlob;
    } catch (error) {
      handleApiError(error);
      notifyError('حدث خطأ أثناء إنشاء ملف PDF');
      handleApiError(error);
      throw error;
    } finally {
      setIsGenerating(false);
    }
  }, [contractHtml, installmentData?.id, uploadPDFToServer, onContractGenerated]);

  const generateContract = useCallback(async (generatePdf = autoGenerate, customData = null) => {
    const dataToUse = customData || { installmentData, installmentsData, loanData, clientData, investorData, employeeName, discount };

    // Check if we have multiple installments or single installment
    const isBulkOperation = dataToUse.installmentsData && dataToUse.installmentsData.length > 0;

    // Extract repayment IDs for bulk operation
    const repaymentIds = isBulkOperation ? dataToUse.installmentsData.map(inst => inst.id).filter(id => id) : [];

    if (isBulkOperation) {
      // For bulk operations
      if (!dataToUse.installmentsData || !dataToUse.clientData || !templateContent) {
        notifyError('بيانات الدفعات أو العميل أو قالب الإيصال غير متوفر');
        return;
      }
    } else {
      // For single installment
      if (!dataToUse.installmentData || !dataToUse.clientData || !templateContent) {
        notifyError('بيانات الدفعة أو العميل أو قالب الإيصال غير متوفر');
        return;
      }
    }

    try {

      const { gregorianDate, hijriDate } = getCurrentDates();
      const finalDate = `${hijriDate}\n${gregorianDate}`;

      // Use receipt number from customData (for preview/save) or props (default)
      const receiptNum = dataToUse.receiptNumber || receiptNumber || 'غير محدد';

      let filledTemplate = templateContent;

      if (isBulkOperation) {
        // Bulk operation: multiple installments
        const totalAmount = dataToUse.installmentsData.reduce((sum, inst) => sum + (inst.amount || 0), 0);
        const totalAmountInWords = `${numberToArabicWords(totalAmount)} ريال`;

        // Generate installments table HTML
        const installmentsTable = `
          <table style="width: 100%; border-collapse: collapse; margin: 15px 0; border: 1px solid #ddd;">
            <thead>
              <tr style="background: rgba(46, 139, 69, 0.1);">
                <th style="border: 1px solid #ddd; padding: 8px; text-align: center; font-weight: bold;">رقم الدفعة</th>
                <th style="border: 1px solid #ddd; padding: 8px; text-align: center; font-weight: bold;">المبلغ</th>
              </tr>
            </thead>
            <tbody>
              ${dataToUse.installmentsData.map(inst => `
                <tr>
                  <td style="border: 1px solid #ddd; padding: 8px; text-align: center;">${inst.count || 'N/A'}</td>
                  <td style="border: 1px solid #ddd; padding: 8px; text-align: center;">${inst.amount?.toLocaleString('en-US') || '0'}</td>
                </tr>
              `).join('')}
              <tr style="background: rgba(46, 139, 69, 0.1); font-weight: bold;">
                <td style="border: 1px solid #ddd; padding: 8px; text-align: center;">المجموع</td>
                <td style="border: 1px solid #ddd; padding: 8px; text-align: center;">${totalAmount?.toLocaleString('en-US') || '0'}</td>
              </tr>
            </tbody>
          </table>
        `;

        filledTemplate = templateContent

          // Client data
          .replace(/{{اسم_العميل}}/g, dataToUse.clientData.name || '')
          .replace(/{{رقم_هوية_العميل}}/g, dataToUse.clientData.nationalId || '')
          .replace(/{{عنوان_العميل}}/g, dataToUse.clientData.address || '')
          .replace(/{{هاتف_العميل}}/g, dataToUse.clientData.phone || '')
          .replace(/{{اسم_رب_المال}}/g, dataToUse.investorData?.name || dataToUse.clientData?.name || '')

          // Bulk operation data
          .replace(/{{عرض_جدول_الدفعات}}/g, 'display: block;')
          .replace(/{{عرض_نص_فردي}}/g, 'display: none;')
          .replace(/{{عرض_نص_مجمع}}/g, 'display: block;')
          .replace(/{{رقم_الايصال}}/g, receiptNum)
          .replace(/{{جدول_الدفعات}}/g, installmentsTable)

          // Amount data
          .replace(/{{المبلغ_رقما}}/g, `${totalAmount?.toLocaleString('en-US') || '0'}`)
          .replace(/{{المبلغ_كتابة}}/g, `${totalAmountInWords}`)

          // Dates
          .replace(/{{التاريخ_الهجري}}/g, hijriDate)
          .replace(/{{التاريخ_الميلادي}}/g, gregorianDate)
          .replace(/{{تاريخ_السداد}}/g, finalDate)

          // Employee data
          .replace(/{{اسم_الموظف}}/g, dataToUse.employeeName || 'ربيش سالم ناصر الهمامي');

      } else {
        // Single installment operation
        const originalAmount = dataToUse.installmentData.amount || 0;
        const discount = dataToUse.discount || 0;
        const finalAmount = Math.max(0, originalAmount - discount);
        const amountInWords = `${numberToArabicWords(finalAmount)} ريال`;

        filledTemplate = templateContent
          // Client data
          .replace(/{{اسم_العميل}}/g, dataToUse.clientData.name || '')
          .replace(/{{رقم_هوية_العميل}}/g, dataToUse.clientData.nationalId || '')
          .replace(/{{عنوان_العميل}}/g, dataToUse.clientData.address || '')
          .replace(/{{هاتف_العميل}}/g, dataToUse.clientData.phone || '')
          .replace(/{{اسم_رب_المال}}/g, dataToUse.investorData?.name || dataToUse.clientData?.name || '')

          // Single operation data
          .replace(/{{عرض_جدول_الدفعات}}/g, 'display: none;')
          .replace(/{{عرض_نص_فردي}}/g, 'display: block;')
          .replace(/{{عرض_نص_مجمع}}/g, 'display: none;')
          .replace(/{{رقم_الدفعة}}/g, dataToUse.installmentData.count || 'N/A')
          .replace(/{{رقم_الايصال}}/g, receiptNum)

          // Amount data
          .replace(/{{المبلغ_رقما}}/g, `${finalAmount?.toLocaleString('en-US') || '0'} ريال`)
          .replace(/{{المبلغ_كتابة}}/g, `${amountInWords}`)

          // Dates
          .replace(/{{التاريخ_الهجري}}/g, hijriDate)
          .replace(/{{التاريخ_الميلادي}}/g, gregorianDate)
          .replace(/{{تاريخ_السداد}}/g, finalDate)

          // Employee data
          .replace(/{{اسم_الموظف}}/g, dataToUse.employeeName || 'ربيش سالم ناصر الهمامي');
      }


      setContractHtml(filledTemplate);

      if (generatePdf) {

        setTimeout(async () => {
          try {
            await generatePDF(filledTemplate, isBulkOperation, repaymentIds);
          } catch (error) {
            handleApiError(error);
          }
        }, 500);

        return filledTemplate;
      }

      return filledTemplate;
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  }, [installmentData, installmentsData, loanData, clientData, investorData, employeeName, discount, templateContent, autoGenerate, generatePDF, receiptNumber]);

  useEffect(() => {
    if (autoGenerate && ((installmentData && clientData && templateContent) || (installmentsData.length > 0 && clientData && templateContent))) {
      generateContract(true);
    }
  }, [autoGenerate, installmentData, installmentsData, clientData, investorData, templateContent, generateContract]);

  React.useImperativeHandle(ref, () => ({
    generateContract,
    generatePDF: (htmlContent, isBulkOperation = false, repaymentIds = []) =>
      generatePDF(htmlContent || contractHtml, isBulkOperation, repaymentIds)
  }));

  if (autoGenerate) {
    return null;
  }

  if (!isGenerating) {
    return null;
  }

  return (
    <div style={{ 
      width: '100%',
      border: '1px solid #ddd',
      marginBottom: '20px',
      padding: '10px'
    }}>
      {isGenerating && (
        <div style={{ 
          textAlign: 'center', 
          padding: '20px',
          backgroundColor: '#f5f5f5'
        }}>
          جاري إنشاء PDF...
        </div>
      )}
    </div>
  );
});
export default PaymentProofGenerator;