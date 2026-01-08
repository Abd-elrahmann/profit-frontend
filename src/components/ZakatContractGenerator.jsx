// components/contracts/ZakatContractGenerator.jsx
import React, { useState, useCallback, useEffect } from "react";
import html2pdf from "html2pdf.js";
import Api, { handleApiError } from "../../config/Api";
import { notifyError } from "../../utilities/toastify";

const numberToArabicWords = (num) => {
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
    "مائة",
    "مئتان",
    "ثلاثمائة",
    "أربعمائة",
    "خمسمائة",
    "ستمائة",
    "سبعمائة",
    "ثمانمائة",
    "تسعمائة",
  ];

  if (num === 0) return "صفر";
  if (num < 0) return "سالب " + numberToArabicWords(-num);

  let result = "";
  let hasThousands = false;

  // Handle millions
  if (num >= 1000000) {
    const millionsPart = Math.floor(num / 1000000);
    if (millionsPart === 1) {
      result += "مليون ";
    } else if (millionsPart === 2) {
      result += "مليونان ";
    } else if (millionsPart < 11) {
      result += ones[millionsPart] + " ملايين ";
    } else {
      result += numberToArabicWords(millionsPart) + " مليون ";
    }
    num %= 1000000;
  }

  // Handle thousands
  if (num >= 1000) {
    const thousandsPart = Math.floor(num / 1000);
    if (thousandsPart === 1) {
      result += "ألف ";
    } else if (thousandsPart === 2) {
      result += "ألفان ";
    } else if (thousandsPart >= 10 && thousandsPart <= 19) {
      if (thousandsPart === 10) {
        result += "عشرة آلاف ";
      } else {
        result += teens[thousandsPart - 10] + " ألفاً ";
      }
    } else if (thousandsPart < 11) {
      result += ones[thousandsPart] + " آلاف ";
    } else {
      // Fix: For compound numbers >= 20, use proper Arabic grammar
      if (thousandsPart >= 20) {
        const thousandsTens = Math.floor(thousandsPart / 10);
        const thousandsOnes = thousandsPart % 10;
        if (thousandsOnes > 0) {
          result += ones[thousandsOnes] + " و" + tens[thousandsTens] + " ألف ";
        } else {
          result += tens[thousandsTens] + " ألف ";
        }
      } else {
        result += numberToArabicWords(thousandsPart) + " ألف ";
      }
    }
    num %= 1000;
    hasThousands = true;
  }

  // Handle hundreds
  if (num >= 100) {
    const hundredsPart = Math.floor(num / 100);
    if (hasThousands) {
      result += "و" + hundreds[hundredsPart] + " ";
    } else {
      result += hundreds[hundredsPart] + " ";
    }
    num %= 100;
  }

  // Handle tens and ones (add "و" between hundreds and tens if both exist)
  if (num >= 20) {
    const tensPart = Math.floor(num / 10);
    const onesPart = num % 10;
    const hasHundredsInResult = result.includes("مئة") || result.includes("مئتان") || result.includes("ثلاث مئة") || result.includes("أربع مئة") || result.includes("خمس مئة") || result.includes("ست مئة") || result.includes("سبع مئة") || result.includes("ثمان مئة") || result.includes("تسع مئة");

    if (hasHundredsInResult && !result.trim().endsWith("و")) {
      result = result.trim() + " و";
    }

    if (onesPart > 0) {
      result += ones[onesPart] + " و" + tens[tensPart];
    } else {
      result += tens[tensPart];
    }
  } else if (num >= 10) {
    const hasHundredsInResult = result.includes("مئة") || result.includes("مئتان") || result.includes("ثلاث مئة") || result.includes("أربع مئة") || result.includes("خمس مئة") || result.includes("ست مئة") || result.includes("سبع مئة") || result.includes("ثمان مئة") || result.includes("تسع مئة");

    if (hasHundredsInResult && !result.trim().endsWith("و")) {
      result = result.trim() + " و";
    }
    result += teens[num - 10];
  } else if (num > 0) {
    const hasHundredsInResult = result.includes("مئة") || result.includes("مئتان") || result.includes("ثلاث مئة") || result.includes("أربع مئة") || result.includes("خمس مئة") || result.includes("ست مئة") || result.includes("سبع مئة") || result.includes("ثمان مئة") || result.includes("تسع مئة");

    if (hasHundredsInResult && !result.trim().endsWith("و")) {
      result = result.trim() + " و";
    }
    result += ones[num];
  }

  return result.trim();
};

const getCurrentDates = () => {
  const now = new Date();
  const saudiDate = new Date(now.toLocaleString("en-US", {timeZone: "Asia/Riyadh"}));
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
  hijriDate = hijriDate.replace(" هـ", "").trim();

  const gregorianFormatter = new Intl.DateTimeFormat("ar-SA-u-ca-gregory", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Asia/Riyadh",
  });

  const gregorianDate = gregorianFormatter.format(today);

  return {
    gregorianDate,
    hijriDate,
  };
};

const ZakatContractGenerator = React.forwardRef(
  (
    {
      withdrawData,
      partnerData,
      userData,
      templateContent,
      onContractGenerated,
      contractType = "PAYMENT_VOUCHER",
      autoGenerate = false,
    },
    ref
  ) => {
    const [contractHtml, setContractHtml] = useState("");
    const [isGenerating, setIsGenerating] = useState(false);

    const uploadPDFToServer = useCallback(
      async (pdfBlob, withdrawDataParam = null) => {
        try {
          const withdrawDataToUse = withdrawDataParam || withdrawData;

          if (!withdrawDataToUse?.id) {
            throw new Error("Withdraw data not available for PDF upload");
          }

          const formData = new FormData();
          const filename = `سند_صرف_زكاة_${withdrawDataToUse.id}_${Date.now()}.pdf`;
          formData.append("file", pdfBlob, filename);

          const response = await Api.post("/api/zakat/upload", formData, {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          });

          return response.data;
        } catch (error) {
          console.error("Error uploading PDF:", error);
          throw error;
        }
      },
      []
    );

    const generatePDF = useCallback(
      async (htmlContent = contractHtml, withdrawDataParam = null) => {
        const contentToUse = htmlContent || contractHtml;
    
        if (!contentToUse) {
          notifyError("لا يوجد محتوى عقد لتحويله إلى PDF");
          return;
        }
    
        try {
          setIsGenerating(true);
    
          // إنشاء HTML كامل مع CSS مضمّن
          const fullHtml = `
<!DOCTYPE html>
<html dir="rtl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    @page {
      size: A4 portrait;
      margin: 15mm;
    }
    
    body {
      margin: 0;
      padding: 0;
      width: 210mm;
      min-height: 297mm;
      background: white;
      font-family: "Cairo", "Tajawal", "Noto Sans Arabic", sans-serif;
      direction: rtl;
      text-align: right;
    }
    
    .contract-print-wrapper {
      width: 180mm;
      margin: 0 auto;
      padding: 20mm 25mm;
      background: white;
      box-sizing: border-box;
    }
    
    ${contentToUse.includes('<style>') 
      ? contentToUse.match(/<style>([\s\S]*?)<\/style>/)?.[1] || '' 
      : ''}
    
    @media print {
      body {
        width: 210mm !important;
        height: 297mm !important;
        margin: 0 !important;
        padding: 0 !important;
      }
      
      .contract-print-wrapper {
        width: 180mm !important;
        max-width: 180mm !important;
        margin: 0 auto !important;
        padding: 15mm 20mm !important;
        border: none !important;
        border-radius: 0 !important;
        box-shadow: none !important;
      }
    }
  </style>
</head>
<body>
  <div class="contract-print-wrapper">
    ${contentToUse.replace(/<style>[\s\S]*?<\/style>/, '')}
  </div>
</body>
</html>`;

          const withdrawDataToUse = withdrawDataParam || withdrawData;

          const options = {
            margin: [15, 15, 15, 15],
            filename: `سند_صرف_زكاة_${withdrawDataToUse?.id || Date.now()}.pdf`,
            image: { type: "jpeg", quality: 1.0 },
            html2canvas: {
              scale: 2,
              useCORS: true,
              letterRendering: true,
              backgroundColor: "#ffffff",
              width: 794,
              height: 1123,
              windowWidth: 794,
              windowHeight: 1123,
              scrollX: 0,
              scrollY: 0,
              x: 0,
              y: 0,
              onclone: (clonedDoc) => {
                clonedDoc.body.style.margin = '0';
                clonedDoc.body.style.padding = '0';
                clonedDoc.body.style.width = '794px';
                clonedDoc.body.style.height = '1123px';
                clonedDoc.body.style.backgroundColor = 'white';
                
                const wrapper = clonedDoc.querySelector('.contract-print-wrapper');
                if (wrapper) {
                  wrapper.style.margin = '0 auto';
                  wrapper.style.display = 'block';
                }
              }
            },
            jsPDF: {
              unit: "mm",
              format: "a4",
              orientation: "portrait",
              compress: true,
              hotfixes: ["px_scaling"],
              putOnlyUsedFonts: true,
            },
          };

          const tempElement = document.createElement('div');
          tempElement.innerHTML = fullHtml;
          document.body.appendChild(tempElement);

          await new Promise(resolve => setTimeout(resolve, 500));

          const pdfBlob = await html2pdf()
            .from(tempElement)
            .set(options)
            .outputPdf("blob");

          document.body.removeChild(tempElement);

          await uploadPDFToServer(pdfBlob, withdrawDataParam);

          if (onContractGenerated) {
            onContractGenerated(pdfBlob, contractType);
          }

          return pdfBlob;
        } catch (error) {
          notifyError("حدث خطأ أثناء إنشاء ملف PDF");
          handleApiError(error);
          throw error;
        } finally {
          setIsGenerating(false);
        }
      },
      [uploadPDFToServer, onContractGenerated, withdrawData]
    );

    const generateContract = useCallback(
      async (generatePdf = autoGenerate, customWithdrawData = null) => {
        const withdrawDataToUse = customWithdrawData || withdrawData;
        
        if (!withdrawDataToUse || !templateContent) {
          console.error("Missing data:", { withdrawDataToUse, templateContent });
          notifyError("بيانات السحب أو قالب العقد غير متوفر");
          return;
        }

        try {
          const { gregorianDate, hijriDate } = getCurrentDates();
          const amount = withdrawDataToUse.amount || 0;
          const amountInWords = numberToArabicWords(amount);

          let filledTemplate = templateContent
            .replace(/{{المبلغ_رقما}}/g, `${amount?.toLocaleString("ar-SA") || "0"}`)
            .replace(/{{المبلغ_كتابة}}/g, `${amountInWords} ريال`)
            .replace(/{{التاريخ_الهجري}}/g, hijriDate)
            .replace(/{{التاريخ_الميلادي}}/g, gregorianDate)
            .replace(/{{رقم_السند}}/g, `ZK-${withdrawDataToUse.id}`)
            .replace(/{{سبب_الصرف}}/g, "سحب زكاة")
            .replace(/{{اسم_المساهم}}/g, partnerData?.name || "الإدارة العامة")
            .replace(/{{رقم_هوية_المساهم}}/g, partnerData?.nationalId || "الإدارة العامة")
            .replace(/{{اسم_المستلم}}/g, userData?.name || "المستلم")
            .replace(/{{رقم_هوية_المستلم}}/g, userData?.nationalId || "المستلم");

          setContractHtml(filledTemplate);

          if (generatePdf) {
            setTimeout(async () => {
              try {
                await generatePDF(filledTemplate, withdrawDataToUse);
              } catch (error) {
                console.error("Error in auto-generating PDF:", error);
              }
            }, 500);

            return filledTemplate;
          }

          return filledTemplate;
        } catch (error) {
          console.error("Error generating contract:", error);
          throw error;
        }
      },
      [withdrawData, partnerData, userData, templateContent, autoGenerate, generatePDF]
    );

    useEffect(() => {
      if (autoGenerate && withdrawData && templateContent) {
        generateContract(true, withdrawData);
      }
    }, [autoGenerate, withdrawData, templateContent, generateContract]);

    React.useImperativeHandle(ref, () => ({
      generateContract,
      generatePDF: (htmlContent, withdrawDataParam) => 
        generatePDF(htmlContent || contractHtml, withdrawDataParam || withdrawData),
    }));

    if (autoGenerate) {
      return null;
    }

    return (
      <div style={{ display: "none" }}>
        {isGenerating && (
          <div style={{ textAlign: "center", padding: "20px", backgroundColor: "#f5f5f5" }}>
            جاري إنشاء PDF...
          </div>
        )}
      </div>
    );
  }
);

ZakatContractGenerator.displayName = 'ZakatContractGenerator';
export default ZakatContractGenerator;