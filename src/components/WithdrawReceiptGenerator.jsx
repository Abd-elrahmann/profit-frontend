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
    fullDate: `${gregorianDate} - ${hijriDate}`,
  };
};

const WithdrawReceiptGenerator = React.forwardRef(
  (
    {
      withdrawalData,
      templateContent,
      onReceiptGenerated,
      autoGenerate = false,
    },
    ref
  ) => {
    const [receiptHtml, setReceiptHtml] = useState("");
    const [isGenerating, setIsGenerating] = useState(false);

    const uploadPDFToServer = useCallback(
      async (pdfBlob) => {
        try {
          const formData = new FormData();
          const filename = `مخالصة_${withdrawalData?.partner?.name?.replace(/[^a-zA-Z0-9\u0600-\u06FF]/g, '_')}_${Date.now()}.pdf`;
          formData.append("file", pdfBlob, filename);

          const endpoint = `/api/partner-withdraw/upload-receipt/${withdrawalData?.partner?.id}`;

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
      [withdrawalData?.partner?.id]
    );

    const generatePDF = useCallback(
      async (htmlContent = receiptHtml) => {
        const contentToUse = htmlContent || receiptHtml;

        if (!contentToUse) {
          notifyError("لا يوجد محتوى مخالصة لتحويله إلى PDF");
          return;
        }

        try {
          setIsGenerating(true);

          const previewContainer = document.createElement("div");
          previewContainer.id = `receipt-preview-${Date.now()}`;

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
            filename: `مخالصة_${withdrawalData?.partner?.name?.replace(/[^a-zA-Z0-9\u0600-\u06FF]/g, '_')}_${Date.now()}.pdf`,
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

          await uploadPDFToServer(pdfBlob);

          if (onReceiptGenerated) {
            onReceiptGenerated(pdfBlob);
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
      [withdrawalData?.partner?.name, uploadPDFToServer, onReceiptGenerated, receiptHtml]
    );

    const generateContract = useCallback(
      async (generatePdf = autoGenerate, customWithdrawalData = null) => {
        const withdrawalDataToUse = customWithdrawalData || withdrawalData;
        
        if (!withdrawalDataToUse || !templateContent) {
          console.error("Missing data:", {
            withdrawalDataToUse,
            templateContent,
          });
          notifyError("بيانات الانسحاب أو قالب المخالصة غير متوفر");
          return;
        }

        try {
          const { gregorianDate, hijriDate, fullDate } = getCurrentDates();
          
          const totalCapital = withdrawalDataToUse.withdrawal?.totalCapital || 0;
          // خصم نصيب المساهم من الخسائر
          const defaultShare = withdrawalDataToUse.withdrawal?.defaultShare || 0;

          // المدخرات المستحقة للمساهم
          const savingsAmount = withdrawalDataToUse.partner?.savings || withdrawalDataToUse.withdrawal?.savingAmount || 0;

          // Calculate net amount due: رأس المال + المدخرات - الخسائر
          const netAmountDue = totalCapital + savingsAmount - defaultShare;

          // Calculate number of installments from schedule
          const numberOfInstallments = withdrawalDataToUse.schedule?.length || 9;
          
          const totalCapitalWords = numberToArabicWords(totalCapital);
          const netAmountDueWords = numberToArabicWords(netAmountDue);

          const withdrawalDate = withdrawalDataToUse.withdrawal?.createdAt 
            ? new Date(withdrawalDataToUse.withdrawal.createdAt).toISOString().split("T")[0]
            : new Date().toISOString().split("T")[0];

          let filledTemplate = templateContent
            // Basic Information
            .replace(/{{رقم_المرجع}}/g, `WR-${withdrawalDataToUse.partner?.id || Date.now()}`)
            .replace(/{{اسم_المضارب}}/g, "المضارب (الإدارة)")
            .replace(/{{رقم_هوية_المضارب}}/g, "")
            .replace(/{{اسم_المساهم}}/g, withdrawalDataToUse.partner?.name || "")
            .replace(/{{رقم_هوية_المساهم}}/g, withdrawalDataToUse.partner?.nationalId || "")
            .replace(/{{تاريخ_الخروج}}/g, withdrawalDate)
            .replace(/{{التاريخ_الكامل}}/g, fullDate)
            .replace(/{{التاريخ_الهجري}}/g, hijriDate)
            .replace(/{{تاريخ_الإنشاء}}/g, gregorianDate)
            
            // Financial Details - استخدام en-US لتنسيق الأرقام
            .replace(/{{رأس_مال_المساهم}}/g, totalCapital?.toLocaleString("en-US") || "0")
            .replace(/{{خصم_نصيب_المساهم_من_الخسائر}}/g, defaultShare?.toLocaleString("en-US") || "0")
            .replace(/{{المدخرات_المستحقة_للمساهم}}/g, savingsAmount?.toLocaleString("en-US") || "0")
            .replace(/{{صافي_المبلغ_المستحق_بعد_الخصم}}/g, netAmountDue?.toLocaleString("en-US") || "0")
            
            // Amount in Words
            .replace(/{{رأس_مال_المساهم_كتابة}}/g, totalCapitalWords)
            .replace(/{{صافي_المبلغ_المستحق_كتابة}}/g, netAmountDueWords)

            // Terms
            .replace(/{{طريقة_السداد}}/g, "دفعات حسب السيولة والوضع الفعلي")
            .replace(/{{الحد_الأقصى_للدفعة}}/g, "5,000")
            .replace(/{{مدة_السداد}}/g, numberOfInstallments.toString())
            .replace(/{{تاريخ_بدء_السداد}}/g, withdrawalDate);

          setReceiptHtml(filledTemplate);

          if (generatePdf) {
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
          console.error("Error generating receipt:", error);
          throw error;
        }
      },
      [withdrawalData, templateContent, autoGenerate, generatePDF]
    );

    useEffect(() => {
      if (autoGenerate && withdrawalData && templateContent) {
        generateContract(true, withdrawalData);
      }
    }, [autoGenerate, withdrawalData, templateContent, generateContract]);

    React.useImperativeHandle(ref, () => ({
      generateContract,
      generatePDF: () => generatePDF(receiptHtml),
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
          display: "none", // Hidden component
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

export default WithdrawReceiptGenerator;