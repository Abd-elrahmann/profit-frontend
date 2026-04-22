import React, { useState, useCallback } from 'react';
import html2pdf from 'html2pdf.js';
import ContractPreview from './ContractPreview';
import Api, { handleApiError } from '../../config/Api';
import { ensureFontsReady } from '../../utilities/fontLoader';
import { notifySuccess, notifyError } from '../../utilities/toastify';
import { amountToArabicSarInWords } from '../../utilities/arabicAmountWords';
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
  contractType = 'MUDARABAH',
  formDataForCreate = null,
  isPendingCreate = false,
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
      const capitalInWords = amountToArabicSarInWords(capitalAmount);
      const orgProfitPercent = investorData.orgProfitPercent || 0;
      const partnerProfitPercent = 100 - orgProfitPercent;
      const orgProfitDivided = (orgProfitPercent / 2);
      const formattedOrgProfitDivided = orgProfitDivided % 1 === 0 ? 
        orgProfitDivided.toString() : 
        orgProfitDivided.toFixed(1);
      
      // Format capital amount - handle both integer and decimal values
      const capitalFormatted = Number.isInteger(capitalAmount) 
        ? capitalAmount.toLocaleString('en-US')
        : capitalAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
      
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
        .replace(/{{رأس_المال}}/g, capitalFormatted || '0')
        .replace(/{{المبلغ_رقما}}/g, capitalFormatted || '0')
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
        .replace(/{{قيمة_السند_رقما}}/g, capitalFormatted || '0')
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
  const uploadPDFToServer = useCallback(async (pdfBlob, partnerId) => {
    if (!partnerId) {
      throw new Error('معرف المستثمر غير متوفر');
    }
    try {
      const formData = new FormData();
      formData.append('file', pdfBlob, `mudarabah_contract_${investorData?.name || 'unknown'}_${Date.now()}.pdf`);
      formData.append('investorId', partnerId);
      formData.append('contractType', contractType);
      formData.append('partnerProfitPercent', 100 - (investorData?.orgProfitPercent || 0));
      formData.append('orgProfitPercent', investorData?.orgProfitPercent || 0);
      const response = await Api.post(`/api/partners/upload/${partnerId}`, formData, {
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
      let partnerId = investorData.id;
      if (isPendingCreate && formDataForCreate) {
        const response = await Api.post('/api/partners', formDataForCreate);
        const partnerData = response.data.partner || response.data;
        partnerId = partnerData.id;
        if (!partnerId) {
          throw new Error('فشل في إنشاء المستثمر');
        }
      }
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
      await ensureFontsReady();
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
      await uploadPDFToServer(pdfBlob, partnerId);
      notifySuccess('تم إنشاء وحفظ العقد وإضافة المستثمر بنجاح');
      setShowPreview(false);
      if (onContractGenerated) {
        onContractGenerated(pdfBlob);
      }
    } catch (error) {
      console.error('Error generating PDF:', error);
      notifyError(error.response?.data?.message || 'حدث خطأ أثناء إنشاء ملف PDF');
      handleApiError(error);
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contractHtml, investorData, onContractGenerated, uploadPDFToServer, generateContract, isPendingCreate, formDataForCreate]);
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
        saveButtonText={isPendingCreate ? 'حفظ العقد وإضافة المستثمر' : 'حفظ كـ PDF'}
      />
    </>
  );
});
export default ContractGenerator;