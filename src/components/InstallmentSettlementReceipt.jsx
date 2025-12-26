import React, { useState, useCallback, useEffect } from "react";
import html2pdf from "html2pdf.js";
import Api, { handleApiError } from "../config/Api";
import { notifyError } from "../utilities/toastify";

const numberToArabicWords = (num) => {
  if (num === 0) return "صفر";
  if (num < 0) return "سالب " + numberToArabicWords(-num);

  const ones = [
    "",
    "واحد",
    "اثنان",
    "ثلاثة",
    "أربعة",
    "خمسة",
    "ستة",
    "سبعة",
    "ثمانية",
    "تسعة",
  ];
  const tens = [
    "",
    "",
    "عشرون",
    "ثلاثون",
    "أربعون",
    "خمسون",
    "ستون",
    "سبعون",
    "ثمانون",
    "تسعون",
  ];
  const teens = [
    "عشرة",
    "أحد عشر",
    "اثنا عشر",
    "ثلاثة عشر",
    "أربعة عشر",
    "خمسة عشر",
    "ستة عشر",
    "سبعة عشر",
    "ثمانية عشر",
    "تسعة عشر",
  ];
  const hundreds = [
    "",
    "مئة",
    "مئتان",
    "ثلاث مئة",
    "أربع مئة",
    "خمس مئة",
    "ست مئة",
    "سبع مئة",
    "ثمان مئة",
    "تسع مئة",
  ];

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
      else {
        // للأرقام المركبة (>= 11)، نضع الوحدة بعد العدد
        result += numberToArabicWords(part) + " " + s.singular;
      }

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
    if (o > 0) {
      // استخدام التنسيق "واحد وعشرون" بدلاً من "عشرون وواحد"
      result += ones[o] + " و" + tens[t];
    } else {
      result += tens[t];
    }
  } else if (num >= 10) {
    result += teens[num - 10];
  } else if (num > 0) {
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

  const hijriFormatter = new Intl.DateTimeFormat(
    "ar-SA-u-ca-islamic-umalqura",
    {
      day: "numeric",
      month: "long",
      year: "numeric",
      timeZone: "Asia/Riyadh",
    }
  );

  let hijriDate = hijriFormatter.format(today);
  hijriDate = hijriDate.replace(/\s+/g, " ").trim();
  hijriDate = hijriDate.replace(" ", " من ");
  if (!hijriDate.includes("هـ")) hijriDate = `${hijriDate} هـ`;

  const gregorianFormatter = new Intl.DateTimeFormat("ar-SA-u-ca-gregory", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Asia/Riyadh",
  });

  const gregorianDate = gregorianFormatter.format(now);

  return {
    gregorianDate: `الموافق ${gregorianDate}`,
    hijriDate,
  };
};

const InstallmentSettlementReceipt = React.forwardRef(
  (
    {
      installmentData,
      loanData,
      clientData,
      templateContent,
      onContractGenerated,
      employeeName = "",
      autoGenerate = false,
    },
    ref
  ) => {
    const [contractHtml, setContractHtml] = useState("");
    const [isGenerating, setIsGenerating] = useState(false);

    // Upload PDF to server function
    const uploadPDFToServer = useCallback(
      async (pdfBlob) => {
        try {
          const formData = new FormData();
          const filename = `سند_تسوية_الدفعة_${
            installmentData.id
          }_${Date.now()}.pdf`;
          formData.append("file", pdfBlob, filename);

          const endpoint = `/api/loans/${loanData.id}/upload-Settlement`;


          const response = await Api.post(endpoint, formData, {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          });

          return response.data;
        } catch (error) {
          console.error("Error uploading settlement receipt PDF:", error);
          throw error;
        }
      },
      [installmentData?.id, loanData?.id]
    );

    // Generate PDF from HTML
    const generatePDF = useCallback(
      async (htmlContent = contractHtml) => {
        const contentToUse = htmlContent || contractHtml;

        if (!contentToUse) {
          console.error("No settlement receipt HTML to generate PDF");
          notifyError("لا يوجد محتوى سند التسوية لتحويله إلى PDF");
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

          const options = {
            margin: 0,
            filename: `settlement_receipt_${
              installmentData.id
            }_${Date.now()}.pdf`,
            image: { type: "jpeg", quality: 1 },
            html2canvas: {
              scale: 2,
              useCORS: true,
              backgroundColor: "#ffffff",
              scrollX: 0,
              scrollY: 0,
              windowWidth: 794,
            },
            jsPDF: {
              unit: "mm",
              format: "a4",
              orientation: "portrait",
              compress: true,
            },
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
            .outputPdf("blob");

          // إزالة العنصر المؤقت
          document.body.removeChild(tempElement);

          await uploadPDFToServer(pdfBlob);

          if (onContractGenerated) {
            onContractGenerated(pdfBlob, "SETTLEMENT_RECEIPT");
          }

          return pdfBlob;
        } catch (error) {
          console.error("Error generating settlement receipt PDF:", error);
          notifyError("حدث خطأ أثناء إنشاء ملف PDF");
          handleApiError(error);
          throw error;
        } finally {
          setIsGenerating(false);
        }
      },
      [
        contractHtml,
        installmentData?.id,
        uploadPDFToServer,
        onContractGenerated,
      ]
    );

    // Generate filled settlement receipt from template
    const generateContract = useCallback(
      async (generatePdf = autoGenerate, customData = null) => {
        const dataToUse = customData || {
          installmentData,
          loanData,
          clientData,
          employeeName,
        };

        console.log('InstallmentSettlementReceipt - loanData:', dataToUse.loanData);
        console.log('debtAcknowledgmentNumber:', dataToUse.loanData?.debtAcknowledgmentNumber);
        console.log('promissoryNoteNumber:', dataToUse.loanData?.promissoryNoteNumber);

        if (
          !dataToUse.installmentData ||
          !dataToUse.clientData ||
          !templateContent
        ) {
          notifyError("بيانات الدفعة أو العميل أو قالب السند غير متوفر");
          return;
        }

        try {

          const { gregorianDate, hijriDate } = getCurrentDates();

          const amount = dataToUse.loanData?.totalAmount || 0;
          const amountInWords = numberToArabicWords(amount);

          let filledTemplate = templateContent
            .replace(/{{اسم_العميل}}/g, dataToUse.clientData.name || "")
            .replace(
              /{{رقم_هوية_العميل}}/g,
              dataToUse.clientData.nationalId || ""
            )
            .replace(/{{رقم_الدفعة}}/g, dataToUse.installmentData.count || "N/A")
            .replace(
              /{{رقم_السند}}/g,
              dataToUse.loanData.promissoryNoteNumber || "غير محدد"
            )
            .replace(
              /{{رقم_الإقرار}}/g,
              dataToUse.loanData.debtAcknowledgmentNumber || "غير محدد"
            )

            .replace(
              /{{المبلغ_رقما}}/g,
              `${amount?.toLocaleString("en-US") || "0"}`
            )
            .replace(/{{المبلغ_كتابة}}/g, `${amountInWords}`)

            .replace(/{{التاريخ_الهجري}}/g, hijriDate)
            .replace(/{{التاريخ_الميلادي}}/g, gregorianDate)

            .replace(
            /{{توقيع_الدائن}}/g,
              dataToUse.loanData?.partner?.name || "ربيش سالم ناصر الهمامي"
            )
            .replace(/{{المكان}}/g, "الرياض");

          setContractHtml(filledTemplate);

          if (generatePdf) {

            setTimeout(async () => {
              try {
                await generatePDF(filledTemplate);
              } catch (error) {
                console.error(
                  "Error in auto-generating settlement receipt PDF:",
                  error
                );
              }
            }, 500);

            return filledTemplate;
          }

          return filledTemplate;
        } catch (error) {
          console.error("Error generating settlement receipt:", error);
          throw error;
        }
      },
      [
        installmentData,
        loanData,
        clientData,
        employeeName,
        templateContent,
        autoGenerate,
        generatePDF,
      ]
    );

    useEffect(() => {
      if (autoGenerate && installmentData && clientData && templateContent) {
        generateContract(true);
      }
    }, [
      autoGenerate,
      installmentData,
      clientData,
      templateContent,
      generateContract,
    ]);

    // Expose methods through ref
    React.useImperativeHandle(ref, () => ({
      generateContract,
      generatePDF: () => generatePDF(contractHtml),
    }));

    // إذا كان التوليد تلقائي، لا تعرض المعاينة
    if (autoGenerate) {
      return null;
    }

    return (
      <div
        style={{
          width: "100%",
          border: "1px solid #ddd",
          marginBottom: "20px",
          padding: "10px",
        }}
      >
        {isGenerating && (
          <div
            style={{
              textAlign: "center",
              padding: "20px",
              backgroundColor: "#f5f5f5",
            }}
          >
            جاري إنشاء PDF...
          </div>
        )}
      </div>
    );
  }
);
export default InstallmentSettlementReceipt;