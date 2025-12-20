
import React, { useState, useCallback, useEffect } from 'react';
import Api, { handleApiError } from '../config/Api';
import { notifyError } from '../utilities/toastify';
import html2pdf from 'html2pdf.js';

const numberToArabicWords = (num) => {
  if (num === 0) return "صفر";
  if (num < 0) return "سالب " + numberToArabicWords(-num);

  const ones = ["", "واحد", "اثنان", "ثلاثة", "أربعة", "خمسة", "ستة", "سبعة", "ثمانية", "تسعة"];
  const tens = ["", "", "عشرون", "ثلاثون", "أربعون", "خمسون", "ستون", "سبعون", "ثمانون", "تسعون"];
  const teens = ["عشرة", "أحد عشر", "اثنا عشر", "ثلاثة عشر", "أربعة عشر", "خمسة عشر", "ستة عشر", "سبعة عشر", "ثمانية عشر", "تسعة عشر"];
  const hundreds = ["", "مئة", "مئتان", "ثلاث مئة", "أربع مئة", "خمس مئة", "ست مئة", "سبع مئة", "ثمان مئة", "تسع مئة"];

  const scale = [
    { value: 1e9, singular: "مليار", dual: "ملياران", plural: "مليارات" },
    { value: 1e6, singular: "مليون", dual: "مليونان", plural: "ملايين" },
    { value: 1e3, singular: "ألف", dual: "ألفان", plural: "آلاف" },
  ];

  let result = "";

  // معالجة المليارات والملايين والآلاف
  for (let s of scale) {
    if (num >= s.value) {
      const part = Math.floor(num / s.value);
      if (part === 1) result += s.singular;
      else if (part === 2) result += s.dual;
      else if (part < 11) result += ones[part] + " " + s.plural;
      else result += numberToArabicWords(part) + " " + s.singular;

      num %= s.value;
      if (num > 0) result += " و ";
    }
  }

  // المئات
  if (num >= 100) {
    const h = Math.floor(num / 100);
    result += hundreds[h];
    num %= 100;
    if (num > 0) result += " و ";
  }

  // العشرات والآحاد
  if (num >= 20) {
    const t = Math.floor(num / 10);
    const o = num % 10;
    result += tens[t];
    if (o > 0) result += " و " + ones[o];
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
    timeZone: 'Asia/Riyadh'
  });

  let hijriDate = hijriFormatter.format(now);
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

  const gregorianDate = gregorianFormatter.format(now);

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
  templateContent,
  onContractGenerated,
  employeeName = "",
  autoGenerate = false
}, ref) => {
  const [contractHtml, setContractHtml] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const uploadPDFToServer = useCallback(async (pdfBlob, isBulkOperation = false, installmentIds = []) => {
    try {
      const formData = new FormData();

      let filename, endpoint;
      if (isBulkOperation) {
        filename = `إيصال_سداد_الدفعات_المجمع_${Date.now()}.pdf`;
        formData.append('installmentIds', JSON.stringify(installmentIds));
        endpoint = `/api/repayments/PaymentProof/bulk`;
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

  const generatePDF = useCallback(async (htmlContent = contractHtml, isBulkOperation = false, installmentIds = []) => {
    const contentToUse = htmlContent || contractHtml;

    if (!contentToUse) {
      notifyError('لا يوجد محتوى إيصال لتحويله إلى PDF');
      return;
    }

    try {
      setIsGenerating(true);

      const previewContainer = document.createElement('div');
      previewContainer.id = `payment-proof-preview-${Date.now()}`;
      previewContainer.style.width = '210mm';
      previewContainer.style.minHeight = '297mm';
      previewContainer.innerHTML = `
        <div style="
          font-family: 'Cairo', 'Noto Sans Arabic', sans-serif;
          padding: 20mm;
          background: white;
          direction: rtl;
        ">
          ${contentToUse}
        </div>
      `;
      document.body.appendChild(previewContainer);

      const filename = isBulkOperation
        ? `payment_proof_bulk_${Date.now()}.pdf`
        : `payment_proof_${installmentData?.id || 'unknown'}_${Date.now()}.pdf`;

      const options = {
        margin: 0,
        filename: filename,
        image: { type: 'jpeg', quality: 1.0 },
        html2canvas: {
          scale: 3,
          useCORS: true,
          letterRendering: true,
          allowTaint: true,
          logging: true,
          backgroundColor: '#ffffff'
        },
        jsPDF: {
          unit: 'mm',
          format: 'a4',
          orientation: 'portrait',
          compress: false,
          hotfixes: ['px_scaling']
        }
      };

      await new Promise(resolve => setTimeout(resolve, 1000));

      const container = document.getElementById(previewContainer.id);
      const pdfBlob = await html2pdf()
        .from(container)
        .set(options)
        .outputPdf('blob');

      document.body.removeChild(previewContainer);

      await uploadPDFToServer(pdfBlob, isBulkOperation, installmentIds);

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
    const dataToUse = customData || { installmentData, installmentsData, loanData, clientData, employeeName };

    // Check if we have multiple installments or single installment
    const isBulkOperation = dataToUse.installmentsData && dataToUse.installmentsData.length > 0;

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

      let filledTemplate = templateContent;

      if (isBulkOperation) {
        // Bulk operation: multiple installments
        const totalAmount = dataToUse.installmentsData.reduce((sum, inst) => sum + (inst.amount || 0), 0);
        const totalAmountInWords = numberToArabicWords(totalAmount);

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

          // Bulk operation data
          .replace(/{{عرض_جدول_الدفعات}}/g, 'display: block;')
          .replace(/{{عرض_نص_فردي}}/g, 'display: none;')
          .replace(/{{عرض_نص_مجمع}}/g, 'display: block;')
          .replace(/{{رقم_الدفعات}}/g, dataToUse.installmentsData.map(inst => inst.count).join(', '))
          .replace(/{{رقم_الايصال}}/g, `${Math.floor(Math.random() * 9000) + 1000}`)
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
        const amount = dataToUse.installmentData.amount || 0;
        const amountInWords = numberToArabicWords(amount);

        filledTemplate = templateContent
          // Client data
          .replace(/{{اسم_العميل}}/g, dataToUse.clientData.name || '')
          .replace(/{{رقم_هوية_العميل}}/g, dataToUse.clientData.nationalId || '')
          .replace(/{{عنوان_العميل}}/g, dataToUse.clientData.address || '')
          .replace(/{{هاتف_العميل}}/g, dataToUse.clientData.phone || '')

          // Single operation data
          .replace(/{{عرض_جدول_الدفعات}}/g, 'display: none;')
          .replace(/{{عرض_نص_فردي}}/g, 'display: block;')
          .replace(/{{عرض_نص_مجمع}}/g, 'display: none;')
          .replace(/{{رقم_الدفعة}}/g, dataToUse.installmentData.count || 'N/A')
          .replace(/{{رقم_الايصال}}/g, `${Math.floor(Math.random() * 9000) + 1000}`)

          // Amount data
          .replace(/{{المبلغ_رقما}}/g, `${amount?.toLocaleString('en-US') || '0'}`)
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
            await generatePDF(filledTemplate);
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
  }, [installmentData, loanData, clientData, employeeName, templateContent, autoGenerate, generatePDF]);

  useEffect(() => {
    if (autoGenerate && ((installmentData && clientData && templateContent) || (installmentsData.length > 0 && clientData && templateContent))) {
      generateContract(true);
    }
  }, [autoGenerate, installmentData, installmentsData, clientData, templateContent, generateContract]);

  React.useImperativeHandle(ref, () => ({
    generateContract,
    generatePDF: (htmlContent, isBulkOperation = false, installmentIds = []) =>
      generatePDF(htmlContent || contractHtml, isBulkOperation, installmentIds)
  }));

  if (autoGenerate) {
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