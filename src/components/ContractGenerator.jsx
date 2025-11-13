import React, { useState, useCallback } from 'react';
import html2pdf from 'html2pdf.js';
import ContractPreview from './ContractPreview';
import Api, { handleApiError } from '../config/Api';
import { notifySuccess, notifyError } from '../utilities/toastify';

const numberToArabicWords = (num) => {
  const ones = ['', 'واحد', 'اثنان', 'ثلاثة', 'أربعة', 'خمسة', 'ستة', 'سبعة', 'ثمانية', 'تسعة'];
  const tens = ['', '', 'عشرون', 'ثلاثون', 'أربعون', 'خمسون', 'ستون', 'سبعون', 'ثمانون', 'تسعون'];
  const teens = ['عشرة', 'أحد عشر', 'اثنا عشر', 'ثلاثة عشر', 'أربعة عشر', 'خمسة عشر', 'ستة عشر', 'سبعة عشر', 'ثمانية عشر', 'تسعة عشر'];
  const hundreds = ['', 'مائة', 'مائتان', 'ثلاثمائة', 'أربعمائة', 'خمسمائة', 'ستمائة', 'سبعمائة', 'ثمانمائة', 'تسعمائة'];

  if (num === 0) return 'صفر';
  if (num < 0) return 'سالب ' + numberToArabicWords(-num);

  let result = '';

  // الآلاف
  if (num >= 1000) {
    const thousandsPart = Math.floor(num / 1000);

    if (thousandsPart === 1) {
      result += 'ألف';
    } else if (thousandsPart === 2) {
      result += 'ألفان';
    } else if (thousandsPart < 11) {
      result += ones[thousandsPart] + ' آلاف';
    } else {
      result += numberToArabicWords(thousandsPart) + ' ألف';
    }

    num %= 1000;

    // ✅ إضافة حرف (و) لو فيه بقية بعد الألف
    if (num > 0) {
      result += ' و ';
    } else {
      result += ' ';
    }
  }

  // المئات
  if (num >= 100) {
    const hundredsPart = Math.floor(num / 100);
    result += hundreds[hundredsPart];
    num %= 100;
    if (num > 0) result += ' و ';
  }

  // العشرات والآحاد
  if (num >= 20) {
    const tensPart = Math.floor(num / 10);
    const onesPart = num % 10;
    result += tens[tensPart];
    if (onesPart > 0) {
      result += ' و' + ones[onesPart];
    }
  } else if (num >= 10) {
    result += teens[num - 10];
  } else if (num > 0) {
    result += ones[num];
  }

  return result.trim();
};


const getCurrentDates = () => {
  const now = new Date();
  const gregorianDate = now.toLocaleDateString('ar-SA');

  const hijriYear = Math.floor((now.getFullYear() - 622) * 1.030684) + 1;
  const hijriDate = `${now.getDate()}/${now.getMonth() + 1}/${hijriYear}`;

  return { gregorianDate, hijriDate };
};

const ContractGenerator = React.forwardRef(({ 
  investorData,   
  templateContent, 
  onContractGenerated,
  contractType = 'MUDARABAH'
}, ref) => {
  const [showPreview, setShowPreview] = useState(false);
  const [contractHtml, setContractHtml] = useState('');
  const [loading, setLoading] = useState(false);

  // Generate filled contract from template
  const generateContract = useCallback(async () => {
    if (!investorData || !templateContent) {
      notifyError('بيانات المستثمر أو قالب العقد غير متوفر');
      return;
    }

    try {
      console.log('Investor Data:', investorData);
      console.log('Template Content:', templateContent);

      const { gregorianDate, hijriDate } = getCurrentDates();
      const capitalInWords = numberToArabicWords(investorData.capitalAmount);

      console.log('Capital in words:', capitalInWords);
      console.log('Dates:', { gregorianDate, hijriDate });

      // Replace placeholders in template
      let filledTemplate = templateContent
        // Basic investor data
        .replace(/{{اسم_العميل}}/g, investorData.name || '')
        .replace(/{{رقم_هوية_العميل}}/g, investorData.nationalId || '')
        .replace(/{{عنوان_العميل}}/g, investorData.address || '')
        .replace(/{{هاتف_العميل}}/g, investorData.phone || '')
        .replace(/{{بريد_العميل}}/g, investorData.email || '')

        // Financial data
        .replace(/{{رأس_المال}}/g, investorData.capitalAmount?.toLocaleString('ar-SA') || '0')
        .replace(/{{رأس_المال_كتابة}}/g, capitalInWords)
        .replace(/{{المبلغ_رقما}}/g, investorData.capitalAmount?.toLocaleString('ar-SA') || '0')
        .replace(/{{المبلغ_كتابة}}/g, capitalInWords)
        .replace(/{{نسبة_أرباح_المنشأة}}/g, String(investorData.orgProfitPercent || '0'))
        .replace(/{{نسبة_أرباح_المستثمر}}/g, String(investorData.partnerProfitPercent || '0'))

        // Dates
        .replace(/{{التاريخ_الهجري}}/g, hijriDate)
        .replace(/{{التاريخ_الميلادي}}/g, gregorianDate)
        .replace(/{{تاريخ_العقد_هجري}}/g, hijriDate)
        .replace(/{{تاريخ_العقد_ميلادي}}/g, gregorianDate)

        // Mudarabah specific fields
        .replace(/{{اسم_رب_المال}}/g, investorData.name || '')
        .replace(/{{هوية_رب_المال}}/g, investorData.nationalId || '')
        .replace(/{{عنوان_رب_المال}}/g, investorData.address || '')
        .replace(/{{اسم_المضارب_1}}/g, 'ربيش سالم ناصر الهمامي')
        .replace(/{{هوية_المضارب_1}}/g, '1116369545')
        .replace(/{{عنوان_المضارب_1}}/g, 'المملكة العربية السعودية - شرورة')
        .replace(/{{اسم_المضارب_2}}/g, 'مبارك سالم ناصر الهمامي')
        .replace(/{{هوية_المضارب_2}}/g, '1116369511')
        .replace(/{{عنوان_المضارب_2}}/g, 'المملكة العربية السعودية - شرورة')
        .replace(/{{مدينة_العقد}}/g, 'الرياض')

        // Default values for other contract types
        .replace(/{{اسم_الدائن}}/g, investorData.name || '')
        .replace(/{{اسم_المدين}}/g, investorData.name || '')
        .replace(/{{رقم_السند}}/g, `${Date.now()}`)
        .replace(/{{تاريخ_الانشاء}}/g, gregorianDate)
        .replace(/{{تاريخ_الاستحقاق}}/g, gregorianDate)
        .replace(/{{مدينة_الاصدار}}/g, 'الرياض')
        .replace(/{{مدينة_الوفاء}}/g, 'الرياض')
        .replace(/{{سبب_انشاء_السند}}/g, 'استثمار في المضاربة')
        .replace(/{{قيمة_السند_رقما}}/g, investorData.capitalAmount?.toLocaleString() || '0')
        .replace(/{{قيمة_السند_كتابة}}/g, capitalInWords);

      console.log('Filled Template:', filledTemplate);

      setContractHtml(filledTemplate);
      setShowPreview(true);
    } catch (error) {
      console.error('Error generating contract:', error);
      notifyError('حدث خطأ أثناء توليد العقد');
    }
  }, [investorData, templateContent]);

  // Generate PDF from HTML
  const generatePDF = useCallback(async () => {
    if (!contractHtml) {
      notifyError('لا يوجد محتوى عقد لتحويله إلى PDF');
      return;
    }

    setLoading(true);
    try {
      const element = document.getElementById('contract-preview');
      if (!element) {
        throw new Error('عنصر معاينة العقد غير موجود');
      }
















































      // PDF generation options
      const options = {
        margin: [5, 5, 5, 5],
        filename: `mudarabah_contract_${Date.now()}.pdf`,
        image: { type: 'jpeg', quality: 1.0 },
        html2canvas: { 
          scale: 3,
          useCORS: true,
          letterRendering: true,
          allowTaint: true,
          logging: false,
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

      // Generate PDF blob






      const pdfBlob = await html2pdf()
        .from(element)
        .set(options)
        .outputPdf('blob');




      // Upload PDF to server
      await uploadPDFToServer(pdfBlob);

      notifySuccess('تم إنشاء وحفظ العقد بنجاح');
      setShowPreview(false);

      if (onContractGenerated) {
        onContractGenerated(pdfBlob);
      }
    } catch (error) {
      console.error('Error generating PDF:', error);
      notifyError('حدث خطأ أثناء إنشاء ملف PDF');
      handleApiError(error);
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contractHtml, investorData, onContractGenerated]);

  // Upload PDF to server
  const uploadPDFToServer = async (pdfBlob) => {
    try {
      const formData = new FormData();
      formData.append('file', pdfBlob, `mudarabah_contract_${Date.now()}.pdf`);
      formData.append('investorId', investorData.id);
      formData.append('contractType', contractType);

      const response = await Api.post(`/api/partners/upload/${investorData.id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return response.data;
    } catch (error) {
      console.error('Error uploading PDF:', error);
      throw error;
    }
  };

  // Expose generateContract method through ref
  React.useImperativeHandle(ref, () => ({
    generateContract
  }));

  return (
    <>
      <ContractPreview
        open={showPreview}
        onClose={() => setShowPreview(false)}
        contractHtml={contractHtml}
        onGeneratePDF={generatePDF}
        loading={loading}
        contractTitle={`معاينة عقد المضاربة - ${investorData?.name || ''}`}
      />
    </>
  );
});

export default ContractGenerator;