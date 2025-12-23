// components/contracts/LoanContractGenerator.jsx
import React, { useState, useCallback, useEffect } from "react";
import html2pdf from "html2pdf.js";
import Api, { handleApiError } from "../config/Api";
import { notifyError } from "../utilities/toastify";

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
      result += numberToArabicWords(thousandsPart) + " ألف ";
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
  // Remove هـ if it exists to avoid duplication
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

const LoanContractGenerator = React.forwardRef(
  (
    {
      loanData,
      clientData,
      kafeelData,
      templateContent,
      onContractGenerated,
      contractType = "DEBT_ACKNOWLEDGMENT",
      autoGenerate = false,
    },
    ref
  ) => {
    const [contractHtml, setContractHtml] = useState("");
    const [isGenerating, setIsGenerating] = useState(false);

    const uploadPDFToServer = useCallback(
      async (pdfBlob, loanDataParam = null) => {
        try {
          const loanDataToUse = loanDataParam;
          console.log("uploadPDFToServer - loanDataToUse:", loanDataToUse);

          if (!loanDataToUse?.id) {
            throw new Error("Loan data not available for PDF upload");
          }

          const formData = new FormData();
          const filename =
            contractType === "DEBT_ACKNOWLEDGMENT"
              ? `إقرار الدين_${loanDataToUse.id}_${Date.now()}.pdf`
              : `سند الأمر_${loanDataToUse.id}_${Date.now()}.pdf`;
          formData.append("file", pdfBlob, filename);

          const endpoint =
            contractType === "DEBT_ACKNOWLEDGMENT"
              ? `/api/loans/${loanDataToUse.id}/upload-debt-acknowledgment`
              : `/api/loans/${loanDataToUse.id}/upload-promissory-note`;


          const response = await Api.post(endpoint, formData, {
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
      [contractType]
    );

    const generatePDF = useCallback(
      async (htmlContent = contractHtml, loanDataParam = null) => {
        const contentToUse = htmlContent || contractHtml;

        if (!contentToUse) {
          notifyError("لا يوجد محتوى عقد لتحويله إلى PDF");
          return;
        }

        try {
          setIsGenerating(true);

          const previewContainer = document.createElement("div");
          previewContainer.id = `contract-preview-${Date.now()}`;

          previewContainer.style.width = "210mm";
          previewContainer.style.minHeight = "297mm";

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

          const loanDataToUse = loanDataParam || loanData;
          const clientDataToUse = loanDataToUse?.client || clientData;

          const options = {
            margin: 0,
            filename: `${contractType.toLowerCase()}_${
              clientDataToUse?.id || loanDataToUse.id
            }_${Date.now()}.pdf`,
            image: { type: "jpeg", quality: 1.0 },
            html2canvas: {
              scale: 3,
              useCORS: true,
              letterRendering: true,
              allowTaint: true,
              logging: true,
              backgroundColor: "#ffffff",
            },
            jsPDF: {
              unit: "mm",
              format: "a4",
              orientation: "portrait",
              compress: false,
              hotfixes: ["px_scaling"],
            },
          };

          await new Promise((resolve) => setTimeout(resolve, 1000));

          const container = document.getElementById(previewContainer.id);
          const pdfBlob = await html2pdf()
            .from(container)
            .set(options)
            .outputPdf("blob");

          document.body.removeChild(previewContainer);

          await uploadPDFToServer(pdfBlob, loanDataParam);

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
      // eslint-disable-next-line react-hooks/exhaustive-deps
      [contractType, uploadPDFToServer, onContractGenerated, loanData]
    );

    const generateContract = useCallback(
      async (generatePdf = autoGenerate, customLoanData = null, customKafeelData = null) => {
        const loanDataToUse = customLoanData || loanData;
        const kafeelDataToUse = customKafeelData || kafeelData;
        if (!loanDataToUse || !templateContent) {
          console.error("Missing data:", {
            loanDataToUse,
            templateContent,
            kafeelDataToUse,
          });
          notifyError("بيانات السلفة أو العميل أو قالب العقد غير متوفر");
          return;
        }

        try {
          const { gregorianDate, hijriDate } = getCurrentDates();
          const finalDate = `${hijriDate}\n${gregorianDate}`;

          const amount = loanDataToUse.amount || 0;
          const interestAmount = loanDataToUse.interestAmount || loanDataToUse.TotalInterest || 0;
          const totalAmount = amount + interestAmount;
          const amountInWords = numberToArabicWords(totalAmount);

          const clientDataToUse = loanDataToUse.client || clientData;

          let filledTemplate = templateContent
            .replace(/{{اسم_العميل}}/g, clientDataToUse?.name || "")
            .replace(/{{رقم_هوية_العميل}}/g, clientDataToUse?.nationalId || "")
            .replace(
              /{{عنوان_العميل}}/g,
              (clientDataToUse?.city && clientDataToUse?.district) ? `${clientDataToUse.city} - ${clientDataToUse.district}` : ""
            )

            .replace(
              /{{المبلغ_رقما}}/g,
              `${totalAmount?.toLocaleString("en-US") || "0"}`
            )
            .replace(/{{المبلغ_كتابة}}/g, `${amountInWords}`)
            .replace(
              /{{قيمة_السند_رقما}}/g,
              `${totalAmount?.toLocaleString("ar-SA") || "0"}`
            )
            .replace(/{{قيمة_السند_كتابة}}/g, `${amountInWords}`)

            .replace(/{{التاريخ_الهجري}}/g, hijriDate)
            .replace(/{{التاريخ_الميلادي}}/g, gregorianDate)
            .replace(/{{تاريخ_الانشاء}}/g, finalDate)
            .replace(/{{تاريخ_الاستحقاق}}/g, "لدي الاطلاع")

            .replace(/{{اسم_الدائن}}/g, loanDataToUse?.partner?.name || "لا يوجد كفيل")
            .replace(/{{اسم_المدين}}/g, clientDataToUse?.name || "")
            .replace(/{{رقم_السند}}/g, `NOTE-${loanDataToUse.id}`)
            .replace(/{{رقم_الإقرار}}/g, `ACK-${loanDataToUse.id}`)
            .replace(/{{مدينة_الاصدار}}/g, "شروة - المملكة العربية السعودية")
            .replace(/{{مدينة_الوفاء}}/g, "الرياض - المملكة العربية السعودية")
            .replace(/{{سبب_انشاء_السند}}/g, "سلفة مالية")

            .replace(/{{رقم_هوية_الدائن}}/g,loanDataToUse?.partner?.nationalId || "لا يوجد كفيل")
            .replace(/{{رقم_هوية_المدين}}/g, clientDataToUse?.nationalId || "")
            .replace(/{{رقم_هوية_الكفيل}}/g, kafeelDataToUse?.nationalId || "لا يوجد كفيل")
            .replace(/{{هوية_الدائن}}/g,loanDataToUse?.partner?.nationalId || "لا يوجد كفيل")
            .replace(/{{هوية_المدين}}/g, clientDataToUse?.nationalId || "")
            .replace(/{{اسم_الكفيل}}/g, kafeelDataToUse?.name || "لا يوجد كفيل")
            .replace(/{{هوية_الكفيل}}/g, kafeelDataToUse?.nationalId || "لا يوجد كفيل");

          setContractHtml(filledTemplate);

          if (generatePdf) {
            setTimeout(async () => {
              try {
                await generatePDF(filledTemplate, loanDataToUse);
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
      // eslint-disable-next-line react-hooks/exhaustive-deps
      [
        loanData,
        clientData,
        kafeelData,
        templateContent,
        contractType,
        autoGenerate,
        generatePDF,
      ]
    );
    useEffect(() => {
      if (autoGenerate && loanData && clientData && templateContent) {
        generateContract(true, loanData, kafeelData || null);
      }
    }, [
      autoGenerate,
      loanData,
      clientData,
      kafeelData,
      templateContent,
      contractType,
      generateContract,
    ]);

    React.useImperativeHandle(ref, () => ({
      generateContract,
      generatePDF: (htmlContent, loanDataParam) => generatePDF(htmlContent || contractHtml, loanDataParam || loanData),
    }));

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
export default LoanContractGenerator;