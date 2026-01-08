import React, { useState, useCallback } from 'react';
import html2pdf from 'html2pdf.js';
import ContractPreview from './ContractPreview';
import Api, { handleApiError } from '../config/Api';
import { notifySuccess, notifyError } from '../utilities/toastify';
import contractCounterService from '../utilities/contractCounterService';

const numberToArabicWords = (num) => {
  const ones = ['', 'واحد', 'اثنان', 'ثلاثة', 'أربعة', 'خمسة', 'ستة', 'سبعة', 'ثمانية', 'تسعة'];
  const tens = ['', '', 'عشرون', 'ثلاثون', 'أربعون', 'خمسون', 'ستون', 'سبعون', 'ثمانون', 'تسعون'];
  const teens = ['عشرة', 'أحد عشر', 'اثنا عشر', 'ثلاثة عشر', 'أربعة عشر', 'خمسة عشر', 'ستة عشر', 'سبعة عشر', 'ثمانية عشر', 'تسعة عشر'];
  const hundreds = ['', 'مائة', 'مئتان', 'ثلاثمائة', 'أربعمائة', 'خمسمائة', 'ستمائة', 'سبعمائة', 'ثمانمائة', 'تسعمائة'];

  if (num === 0) return 'صفر';
  if (num < 0) return 'سالب ' + numberToArabicWords(-num);

  let result = '';
  let hasThousands = false;

  // الملايين
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

  // الآلاف
  if (num >= 1000) {
    const thousandsPart = Math.floor(num / 1000);
    if (thousandsPart === 1) {
      result += 'ألف ';
    } else if (thousandsPart === 2) {
      result += 'ألفان ';
    } else if (thousandsPart >= 10 && thousandsPart <= 19) {
      if (thousandsPart === 10) {
        result += 'عشرة آلاف ';
      } else {
        result += teens[thousandsPart - 10] + ' ألفاً ';
      }
    } else if (thousandsPart < 11) {
      result += ones[thousandsPart] + ' آلاف ';
    } else {
      // Fix: For compound numbers >= 20, use proper Arabic grammar
      if (thousandsPart >= 20) {
        const thousandsTens = Math.floor(thousandsPart / 10);
        const thousandsOnes = thousandsPart % 10;
        if (thousandsOnes > 0) {
          result += ones[thousandsOnes] + ' و' + tens[thousandsTens] + ' ألف ';
        } else {
          result += tens[thousandsTens] + ' ألف ';
        }
      } else {
        result += numberToArabicWords(thousandsPart) + ' ألف ';
      }
    }
    num %= 1000;
    hasThousands = true;
  }

  // المئات
  if (num >= 100) {
    const hundredsPart = Math.floor(num / 100);
    if (hasThousands) {
      result += 'و' + hundreds[hundredsPart] + ' ';
    } else {
      result += hundreds[hundredsPart] + ' ';
    }
    num %= 100;
  }

  // العشرات والآحاد مع قواعد نحو عربية صحيحة
  if (num >= 20) {
    const tensPart = Math.floor(num / 10);
    const onesPart = num % 10;
    const hasHigherUnits = result.length > 0;

    if (hasHigherUnits && !result.trim().endsWith('و')) {
      result = result.trim() + ' و';
    }

    if (onesPart > 0) {
      result += ones[onesPart] + ' و' + tens[tensPart];
    } else {
      result += tens[tensPart];
    }
  } else if (num >= 10) {
    const hasHigherUnits = result.length > 0;

    if (hasHigherUnits && !result.trim().endsWith('و')) {
      result = result.trim() + ' و';
    }
    result += teens[num - 10];
  } else if (num > 0) {
    const hasHigherUnits = result.length > 0;

    if (hasHigherUnits && !result.trim().endsWith('و')) {
      result = result.trim() + ' و';
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

  // التاريخ الميلادي
  const gregorianDate = today.toLocaleDateString('ar-EG', {
    day: 'numeric',
    month: 'numeric',
    year: 'numeric'
  });

  // التاريخ الهجري
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
          const { gregorianDate, hijriDate } = getCurrentDates();
          const capitalInWords = `${numberToArabicWords(investorData.capitalAmount)} ريال`;
    
    // حساب النسب الديناميكية
    const orgProfitPercent = investorData.orgProfitPercent || 0;
    const partnerProfitPercent = 100 - orgProfitPercent;
    // إصلاح النقطة الرابعة: إزالة العلامة العشرية إذا كان الرقم صحيح
    const orgProfitDivided = (orgProfitPercent / 2);
    const formattedOrgProfitDivided = orgProfitDivided % 1 === 0 ? 
      orgProfitDivided.toString() : 
      orgProfitDivided.toFixed(1);

    let filledTemplate = templateContent
      // معلومات المستثمر الأساسية
      .replace(/{{اسم_رب_المال}}/g, investorData.name || '')
      .replace(/{{اسم_رب_المال_النسبة}}/g, investorData.name || '')
      .replace(/{{هوية_رب_المال}}/g, investorData.nationalId || '')
      .replace(/{{عنوان_رب_المال}}/g, investorData.address || '')
      .replace(/{{اسم_العميل}}/g, investorData.name || '')
      .replace(/{{رقم_هوية_العميل}}/g, investorData.nationalId || '')
      .replace(/{{عنوان_العميل}}/g, investorData.address || '')
      .replace(/{{هاتف_العميل}}/g, investorData.phone || '')
      .replace(/{{بريد_العميل}}/g, investorData.email || '')

      // المعلومات المالية - إصلاح النقطة الثالثة
      // تحويل المبلغ إلى تنسيق إنجليزي
      .replace(/{{رأس_المال}}/g, investorData.capitalAmount?.toLocaleString('en-US') || '0')
      .replace(/{{المبلغ_رقما}}/g, investorData.capitalAmount?.toLocaleString('en-US') || '0')
      
      // إصلاح النقطة الثالثة: تحويل "مائة" إلى "مئة"
      .replace(/{{رأس_المال_كتابة}}/g, capitalInWords.replace(/مائة/gi, 'مئة'))
      .replace(/{{المبلغ_كتابة}}/g, capitalInWords.replace(/مائة/gi, 'مئة'))
      
      // النسب الديناميكية - إصلاح النقطة الرابعة
      .replace(/{{نسبة_أرباح_المنشأة}}/g, String(orgProfitPercent || '0'))
      .replace(/{{نسبة_أرباح_المستثمر}}/g, String(partnerProfitPercent || '0'))
      .replace(/{{نسبة_أرباح_المنشأة_مقسمة}}/g, String(formattedOrgProfitDivided))

      // بقية الاستبدالات...
      .replace(/{{التاريخ_الهجري}}/g, hijriDate)
      .replace(/{{التاريخ_الميلادي}}/g, gregorianDate)
      .replace(/{{تاريخ_العقد_هجري}}/g, hijriDate)
      .replace(/{{تاريخ_العقد_ميلادي}}/g, gregorianDate)

      // معلومات المضاربين (ثابتة)
      .replace(/{{اسم_المضارب_1}}/g, 'ربيش سالم ناصر الهمامي')
      .replace(/{{هوية_المضارب_1}}/g, '1116369545')
      .replace(/{{عنوان_المضارب_1}}/g, 'المملكة العربية السعودية - شرورة')
      .replace(/{{اسم_المضارب_2}}/g, 'مبارك سالم ناصر الهمامي')
      .replace(/{{هوية_المضارب_2}}/g, '1116369511')
      .replace(/{{عنوان_المضارب_2}}/g, 'المملكة العربية السعودية - شرورة')
      .replace(/{{مدينة_العقد}}/g, investorData.city || 'الرياض')
      .replace(/{{مدينة_العقد_الثابتة}}/g, 'الرياض')

      // معلومات إضافية للعقود الأخرى
      .replace(/{{اسم_الدائن}}/g, investorData.name || '')
      .replace(/{{اسم_المدين}}/g, investorData.name || '')
      .replace(/{{رقم_السند}}/g, contractCounterService.getCurrentContractNumber(contractCounterService.COUNTER_TYPES.MUDARABAH))
      .replace(/{{تاريخ_الانشاء}}/g, gregorianDate)
      .replace(/{{تاريخ_الاستحقاق}}/g, gregorianDate)
      .replace(/{{مدينة_الاصدار}}/g, 'الرياض')
      .replace(/{{مدينة_الوفاء}}/g, 'الرياض')
      .replace(/{{سبب_انشاء_السند}}/g, 'استثمار في المضاربة')
      .replace(/{{قيمة_السند_رقما}}/g, investorData.capitalAmount?.toLocaleString('en-US') || '0')
      .replace(/{{قيمة_السند_كتابة}}/g, capitalInWords.replace(/مائة/gi, 'مئة'));

    setContractHtml(filledTemplate);
    setShowPreview(true);
  } catch (error) {
    console.error('Error generating contract:', error);
    notifyError('حدث خطأ أثناء توليد العقد');
  }
  }, [investorData, templateContent]);

  // Upload PDF to server
  const uploadPDFToServer = useCallback(async (pdfBlob) => {
    try {
      const formData = new FormData();
      formData.append('file', pdfBlob, `mudarabah_contract_${investorData?.name || 'unknown'}_${Date.now()}.pdf`);
      formData.append('investorId', investorData.id);
      formData.append('contractType', contractType);

      // Include profit percentages for reference
      formData.append('partnerProfitPercent', 100 - (investorData?.orgProfitPercent || 0));
      formData.append('orgProfitPercent', investorData?.orgProfitPercent || 0);

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

  // Generate PDF from HTML
  const generatePDF = useCallback(async () => {
    if (!contractHtml) {
      notifyError('لا يوجد محتوى عقد لتحويله إلى PDF');
      return;
    }

    setLoading(true);
    try {
      // Regenerate contract with saving numbers for PDF generation
      const finalContractHtml = await generateContract(true);

      const element = document.getElementById('contract-preview');
      if (!element) {
        throw new Error('عنصر معاينة العقد غير موجود');
      }

      // Update the preview with the final contract HTML
      element.innerHTML = finalContractHtml;


      // PDF generation options
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

      // Generate PDF blob
      const pdfBlob = await html2pdf()
        .from(element)
        .set(options)
        .outputPdf('blob');

      // Upload PDF to server
      await uploadPDFToServer(pdfBlob);

      // Increment the counter after successful save
      contractCounterService.generateContractNumber(contractCounterService.COUNTER_TYPES.MUDARABAH);

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
  }, [contractHtml, investorData, onContractGenerated, uploadPDFToServer, generateContract]);

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