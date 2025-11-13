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
    "مائة",
    "مائتان",
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
        result += teens[thousandsPart - 10] + " ألف ";
      }
    } else if (thousandsPart < 11) {
      result += ones[thousandsPart] + " آلاف ";
    } else {
      result += numberToArabicWords(thousandsPart) + " ألف ";
    }
    num %= 1000;
  }

  // Handle hundreds
  if (num >= 100) {
    const hundredsPart = Math.floor(num / 100);
    result += hundreds[hundredsPart] + " ";
    num %= 100;
  }

  // Handle tens and ones
  if (num >= 20) {
    const tensPart = Math.floor(num / 10);
    const onesPart = num % 10;
    if (onesPart > 0) {
      result += ones[onesPart] + " و" + tens[tensPart];
    } else {
      result += tens[tensPart];
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

  const hijriFormatter = new Intl.DateTimeFormat(
    "ar-SA-u-ca-islamic-umalqura",
    {
      day: "numeric",
      month: "long",
      year: "numeric",
      timeZone: "Asia/Riyadh",
    }
  );

  let hijriDate = hijriFormatter.format(now);

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
      async (pdfBlob) => {
        try {
          const formData = new FormData();
          const filename =
            contractType === "DEBT_ACKNOWLEDGMENT"
              ? `إقرار الدين_${loanData.id}_${Date.now()}.pdf`
              : `سند الأمر_${loanData.id}_${Date.now()}.pdf`;
          formData.append("file", pdfBlob, filename);

          const endpoint =
            contractType === "DEBT_ACKNOWLEDGMENT"
              ? `/api/loans/${loanData.id}/upload-debt-acknowledgment`
              : `/api/loans/${loanData.id}/upload-promissory-note`;

          console.log("Uploading to endpoint:", endpoint);

          const response = await Api.post(endpoint, formData, {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          });

          console.log("Upload response:", response.data);
          return response.data;
        } catch (error) {
          console.error("Error uploading PDF:", error);
          throw error;
        }
      },
      [contractType, loanData?.id]
    );

    const generatePDF = useCallback(
      async (htmlContent = contractHtml) => {
        const contentToUse = htmlContent || contractHtml;

        if (!contentToUse) {
          console.error("No contract HTML to generate PDF");
          notifyError("لا يوجد محتوى عقد لتحويله إلى PDF");
          return;
        }

        try {
          setIsGenerating(true);

          // إنشاء عنصر ثابت في الصفحة

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

          const options = {
            margin: 0,
            filename: `${contractType.toLowerCase()}_${
              clientData.id
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

          console.log("Generating PDF for:", contractType);

          // انتظر قليلاً للتأكد من تحميل الخطوط والصور
          await new Promise((resolve) => setTimeout(resolve, 1000));

          // Generate PDF from the preview container
          const container = document.getElementById(previewContainer.id);
          const pdfBlob = await html2pdf()
            .from(container)
            .set(options)
            .outputPdf("blob");

          // تنظيف عنصر المعاينة
          document.body.removeChild(previewContainer);

          await uploadPDFToServer(pdfBlob);

          console.log(
            "PDF generated and uploaded successfully for:",
            contractType
          );

          if (onContractGenerated) {
            onContractGenerated(pdfBlob, contractType);
          }

          return pdfBlob;
        } catch (error) {
          console.error("Error generating PDF:", error);
          notifyError("حدث خطأ أثناء إنشاء ملف PDF");
          handleApiError(error);
          throw error;
        } finally {
          setIsGenerating(false);
        }
      },
      // eslint-disable-next-line react-hooks/exhaustive-deps
      [contractType, loanData?.id, uploadPDFToServer, onContractGenerated]
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
          console.log("Generating contract:", contractType);
          console.log("Loan Data to use:", loanDataToUse);

          const { gregorianDate, hijriDate } = getCurrentDates();
          const finalDate = `${hijriDate}\n${gregorianDate}`;

          const amount = loanDataToUse.amount || 0;
          const amountInWords = numberToArabicWords(amount);

          console.log("Amount:", amount, "Amount in words:", amountInWords);

          let filledTemplate = templateContent
            .replace(/{{اسم_العميل}}/g, clientData.name || "")
            .replace(/{{رقم_هوية_العميل}}/g, clientData.nationalId || "")
            .replace(
              /{{عنوان_العميل}}/g,
              clientData.city + " - " + clientData.district || ""
            )

            .replace(
              /{{المبلغ_رقما}}/g,
              `${amount?.toLocaleString("en-US") || "0"} ريال سعودي`
            )
            .replace(/{{المبلغ_كتابة}}/g, `${amountInWords} ريال سعودي`)
            .replace(
              /{{قيمة_السند_رقما}}/g,
              `${amount?.toLocaleString("ar-SA") || "0"} ريال سعودي`
            )
            .replace(/{{قيمة_السند_كتابة}}/g, `${amountInWords} ريال سعودي`)

            .replace(/{{التاريخ_الهجري}}/g, hijriDate)
            .replace(/{{التاريخ_الميلادي}}/g, gregorianDate)
            .replace(/{{تاريخ_الانشاء}}/g, finalDate)
            .replace(/{{تاريخ_الاستحقاق}}/g, "لدي الاطلاع")

            .replace(/{{اسم_الدائن}}/g, "أحمد لحول")
            .replace(/{{اسم_المدين}}/g, clientData.name || "")
            .replace(/{{رقم_السند}}/g, `LOAN-${Date.now()}`)
            .replace(/{{رقم_الإقرار}}/g, `ACK-${Date.now()}`)
            .replace(/{{مدينة_الاصدار}}/g, "شروة - المملكة العربية السعودية")
            .replace(/{{مدينة_الوفاء}}/g, "الرياض - المملكة العربية السعودية")
            .replace(/{{سبب_انشاء_السند}}/g, "سلفة مالية")

            .replace(/{{رقم_هوية_الدائن}}/g, "1234567890")
            .replace(/{{رقم_هوية_المدين}}/g, clientData.nationalId || "")
            .replace(/{{رقم_هوية_الكفيل}}/g, clientData.nationalId || "")
            .replace(/{{هوية_الدائن}}/g, "1234567890")
            .replace(/{{هوية_المدين}}/g, clientData.nationalId || "")
            .replace(/{{اسم_الكفيل}}/g, kafeelDataToUse.name || "")
            .replace(/{{هوية_الكفيل}}/g, kafeelDataToUse.nationalId || "");

          console.log("Filled Template generated successfully");
          console.log("Filled Template Content:", filledTemplate);
          console.log("Contract HTML length:", filledTemplate.length);

          setContractHtml(filledTemplate);

          if (generatePdf) {
            console.log("Auto-generating PDF for:", contractType);

            setTimeout(async () => {
              try {
                await generatePDF(filledTemplate);
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
      if (autoGenerate && loanData && clientData && templateContent && kafeelData) {
        console.log("Auto-generating contract:", contractType);
        generateContract(true, loanData, kafeelData);
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
      generatePDF: () => generatePDF(contractHtml),
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