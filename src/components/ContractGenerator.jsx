import React, { useState, useCallback } from 'react';
import html2pdf from 'html2pdf.js';
import ContractPreview from './ContractPreview';
import Api, { handleApiError } from '../config/Api';
import { notifySuccess, notifyError } from '../utilities/toastify';

const numberToArabicWords = (num) => {
  if (num === null || num === undefined || isNaN(num)) {
    return 'صفر';
  }
  
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
    } else if (thousandsPart >= 11 && thousandsPart <= 999) {
      result += numberToArabicWords(thousandsPart) + ' ألف ';
    } else {
      result += numberToArabicWords(thousandsPart) + ' ألف ';
    }
    num %= 1000;
    hasThousands = true;
  }

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

  if (num >= 20) {
    const tensPart = Math.floor(num / 10);
    const onesPart = num % 10;
    const hasHigherUnits = result.length > 0;

    if (hasHigherUnits) {
      result = result.trim();
      if (!result.endsWith('و')) {
        result += ' و';
      }
      result += ' ';
    }

    if (onesPart > 0) {
      result += ones[onesPart] + ' و' + tens[tensPart];
    } else {
      result += tens[tensPart];
    }
  } else if (num >= 10) {
    const hasHigherUnits = result.length > 0;

    if (hasHigherUnits) {
      result = result.trim();
      if (!result.endsWith('و')) {
        result += ' و';
      }
      result += ' ';
    }
    result += teens[num - 10];
  } else if (num > 0) {
    const hasHigherUnits = result.length > 0;

    if (hasHigherUnits) {
      result = result.trim();
      if (!result.endsWith('و')) {
        result += ' و';
      }
      result += ' ';
    }
    result += ones[num];
  }

  return result.trim();
};

const getCurrentDates = () => {
  const now = new Date();
  const saudiDate = new Date(now.toLocaleString("en-US", {timeZone: "Asia/Riyadh"}));

  const today = new Date(saudiDate.getFullYear(), saudiDate.getMonth(), saudiDate.getDate());

  const gregorianDate = today.toLocaleDateString('ar-EG', {
    day: 'numeric',
    month: 'numeric',
    year: 'numeric'
  });

  const hijriDate = today.toLocaleDateString('ar-SA-u-ca-islamic-umalqura', {
    day: 'numeric',
    month: 'numeric',
    year: 'numeric'
  });

  return { gregorianDate, hijriDate };
};

const ContractGenerator = React.forwardRef(({
  investorData,
  templateContent,
  onContractGenerated,
  onPreviewClose,
  contractType = 'MUDARABAH'
}, ref) => {
  const [showPreview, setShowPreview] = useState(false);
  const [contractHtml, setContractHtml] = useState('');
  const [loading, setLoading] = useState(false);

  const generateContract = useCallback(async (forPDF = false) => {
    if (!investorData || !templateContent) {
      const errorMsg = 'بيانات المستثمر أو قالب العقد غير متوفر';
      if (!forPDF) {
        notifyError(errorMsg);
      }
      return forPDF ? '' : undefined;
    }

    if (!investorData.name || investorData.capitalAmount === undefined || investorData.capitalAmount === null) {
      const errorMsg = 'بيانات المستثمر غير كاملة (الاسم أو رأس المال مفقود)';
      if (!forPDF) {
        notifyError(errorMsg);
      }
      return forPDF ? '' : undefined;
    }

    try {
      const { gregorianDate, hijriDate } = getCurrentDates();
      const capitalAmount = Number(investorData.capitalAmount) || 0;
      
      if (capitalAmount === 0) {
        if (!forPDF) {
          notifyError('تحذير: رأس المال يساوي صفر. يرجى التحقق من بيانات المستثمر.');
        }
      }
      
      const capitalInWords = `${numberToArabicWords(capitalAmount)} ريال`;
    
      const orgProfitPercent = investorData.orgProfitPercent || 0;
      const partnerProfitPercent = 100 - orgProfitPercent;
      const orgProfitDivided = (orgProfitPercent / 2);
      const formattedOrgProfitDivided = orgProfitDivided % 1 === 0 ? 
        orgProfitDivided.toString() : 
        orgProfitDivided.toFixed(1);

      let filledTemplate = templateContent
        .replace(/{{اسم_رب_المال}}/g, investorData.name || '')
        .replace(/{{اسم_رب_المال_النسبة}}/g, investorData.name || '')
        .replace(/{{هوية_رب_المال}}/g, investorData.nationalId || '')
        .replace(/{{عنوان_رب_المال}}/g, investorData.address || '')
        .replace(/{{اسم_العميل}}/g, investorData.name || '')
        .replace(/{{رقم_هوية_العميل}}/g, investorData.nationalId || '')
        .replace(/{{عنوان_العميل}}/g, investorData.address || '')
        .replace(/{{هاتف_العميل}}/g, investorData.phone || '')
        .replace(/{{بريد_العميل}}/g, investorData.email || '')

        .replace(/{{رأس_المال}}/g, capitalAmount.toLocaleString('en-US') || '0')
        .replace(/{{المبلغ_رقما}}/g, capitalAmount.toLocaleString('en-US') || '0')
        
        .replace(/{{رأس_المال_كتابة}}/g, capitalInWords.replace(/مائة/gi, 'مئة'))
        .replace(/{{المبلغ_كتابة}}/g, capitalInWords.replace(/مائة/gi, 'مئة'))
        
        .replace(/{{نسبة_أرباح_المنشأة}}/g, String(orgProfitPercent || '0'))
        .replace(/{{نسبة_أرباح_المستثمر}}/g, String(partnerProfitPercent || '0'))
        .replace(/{{نسبة_أرباح_المنشأة_مقسمة}}/g, String(formattedOrgProfitDivided))

        .replace(/{{التاريخ_الهجري}}/g, hijriDate)
        .replace(/{{التاريخ_الميلادي}}/g, gregorianDate)
        .replace(/{{تاريخ_العقد_هجري}}/g, hijriDate)
        .replace(/{{تاريخ_العقد_ميلادي}}/g, gregorianDate)

        .replace(/{{اسم_المضارب_1}}/g, 'ربيش سالم ناصر الهمامي')
        .replace(/{{هوية_المضارب_1}}/g, '1116369545')
        .replace(/{{عنوان_المضارب_1}}/g, 'المملكة العربية السعودية - شرورة')
        .replace(/{{اسم_المضارب_2}}/g, 'مبارك سالم ناصر الهمامي')
        .replace(/{{هوية_المضارب_2}}/g, '1116369511')
        .replace(/{{عنوان_المضارب_2}}/g, 'المملكة العربية السعودية - شرورة')
        .replace(/{{مدينة_العقد}}/g, investorData.city || 'الرياض')
        .replace(/{{مدينة_العقد_الثابتة}}/g, 'الرياض')

        .replace(/{{اسم_الدائن}}/g, investorData.name || '')
        .replace(/{{اسم_المدين}}/g, investorData.name || '')
        .replace(/{{رقم_السند}}/g, '')
        .replace(/{{تاريخ_الانشاء}}/g, gregorianDate)
        .replace(/{{تاريخ_الاستحقاق}}/g, gregorianDate)
        .replace(/{{مدينة_الاصدار}}/g, 'الرياض')
        .replace(/{{مدينة_الوفاء}}/g, 'الرياض')
        .replace(/{{سبب_انشاء_السند}}/g, 'استثمار في المضاربة')
        .replace(/{{قيمة_السند_رقما}}/g, capitalAmount.toLocaleString('en-US') || '0')
        .replace(/{{قيمة_السند_كتابة}}/g, capitalInWords.replace(/مائة/gi, 'مئة'));

      if (forPDF) {
        return filledTemplate;
      }

      setContractHtml(filledTemplate);
      setShowPreview(true);
      return filledTemplate;
    } catch (error) {
      console.error('Error generating contract:', error);
      notifyError('حدث خطأ أثناء توليد العقد');
      return forPDF ? '' : undefined;
    }
  }, [investorData, templateContent]);

  const uploadPDFToServer = useCallback(async (pdfBlob) => {
    if (!investorData || !investorData.id) {
      throw new Error('بيانات المستثمر غير كاملة');
    }
    
    try {
      const formData = new FormData();
      formData.append('file', pdfBlob, `mudarabah_contract_${investorData.name || 'unknown'}_${Date.now()}.pdf`);
      formData.append('investorId', investorData.id);
      formData.append('contractType', contractType);

      formData.append('partnerProfitPercent', 100 - (investorData.orgProfitPercent || 0));
      formData.append('orgProfitPercent', investorData.orgProfitPercent || 0);

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
  }, [investorData, contractType]);

  const generatePDF = useCallback(async () => {
    if (!investorData || !templateContent) {
      notifyError('بيانات المستثمر أو قالب العقد غير متوفر');
      return;
    }

    setLoading(true);
    try {
      const finalContractHtml = await generateContract(true);
      
      if (!finalContractHtml || finalContractHtml.trim() === '') {
        notifyError('فشل في توليد محتوى العقد');
        setLoading(false);
        return;
      }

      const element = document.getElementById('contract-preview');
      if (!element) {
        throw new Error('عنصر معاينة العقد غير موجود');
      }

      element.innerHTML = finalContractHtml;


      const options = {
        margin: 0,
        filename: `mudarabah_contract_${investorData?.name || 'unknown'}_${Date.now()}.pdf`,
        image: { type: 'jpeg', quality: 1.0 },
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
        }
      };

      const pdfBlob = await html2pdf()
        .from(element)
        .set(options)
        .outputPdf('blob');

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
  }, [contractHtml, investorData, onContractGenerated, uploadPDFToServer, generateContract]);
 
  React.useImperativeHandle(ref, () => ({
    generateContract
  }));

  return (
    <>
      <ContractPreview
        open={showPreview}
        onClose={() => {
          setShowPreview(false);  
          if (onPreviewClose) {
            onPreviewClose();
          }
        }}
        contractHtml={contractHtml}
        onGeneratePDF={generatePDF}
        loading={loading}
        contractTitle={`معاينة عقد المضاربة - ${investorData?.name || ''}`}
        profitInfo={
          investorData?.orgProfitPercent ? 
          `(نسبة الأرباح: ${100 - investorData.orgProfitPercent}% للمستثمر، ${investorData.orgProfitPercent}% للشركة)` : 
          ''
        }
      />
    </>
  );
});

export default ContractGenerator;