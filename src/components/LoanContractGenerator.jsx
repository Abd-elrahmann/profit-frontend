// components/contracts/LoanContractGenerator.jsx
import React, { useState, useCallback, useEffect } from "react";
import html2pdf from "html2pdf.js";
import Api, { handleApiError } from "../config/Api";
import { notifyError } from "../utilities/toastify";
import contractCounterService from "../utilities/contractCounterService";

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

  // Handle tens and ones with proper Arabic grammar
  if (num >= 20) {
    const tensPart = Math.floor(num / 10);
    const onesPart = num % 10;
    const hasHigherUnits = result.length > 0;

    if (hasHigherUnits && !result.trim().endsWith("و")) {
      result = result.trim() + " و";
    }

    if (onesPart > 0) {
      result += ones[onesPart] + " و" + tens[tensPart];
    } else {
      result += tens[tensPart];
    }
  } else if (num >= 10) {
    const hasHigherUnits = result.length > 0;

    if (hasHigherUnits && !result.trim().endsWith("و")) {
      result = result.trim() + " و";
    }
    result += teens[num - 10];
  } else if (num > 0) {
    const hasHigherUnits = result.length > 0;

    if (hasHigherUnits && !result.trim().endsWith("و")) {
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

const formatRepaymentDay = (repaymentDay) => {
  if (!repaymentDay) return "لدى الاطلاع";

  const date = new Date(repaymentDay);

  const hijriFormatter = new Intl.DateTimeFormat(
    "ar-SA-u-ca-islamic-umalqura",
    {
      day: "numeric",
      month: "long",
      year: "numeric",
      timeZone: "Asia/Riyadh",
    }
  );

  let hijriDate = hijriFormatter.format(date);
  hijriDate = hijriDate.replace(/\s+/g, " ").trim();
  hijriDate = hijriDate.replace(" ", " من ");
  hijriDate = hijriDate.replace(" هـ", "").trim();

  const gregorianFormatter = new Intl.DateTimeFormat("ar-SA-u-ca-gregory", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Asia/Riyadh",
  });

  const gregorianDate = gregorianFormatter.format(date);

  return `${hijriDate} هـ الموافق ${gregorianDate}`;
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
      async (pdfBlob, loanDataParam = null, contractNumbers = {}) => {
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

          // إضافة أرقام العقود إلى البيانات المرسلة
          console.log('uploadPDFToServer - contractNumbers:', contractNumbers);
          if (contractNumbers.debtAcknowledgmentNumber) {
            formData.append("debtAcknowledgmentNumber", contractNumbers.debtAcknowledgmentNumber);
            console.log('Added debtAcknowledgmentNumber:', contractNumbers.debtAcknowledgmentNumber);
          }
          if (contractNumbers.promissoryNoteNumber) {
            formData.append("promissoryNoteNumber", contractNumbers.promissoryNoteNumber);
            console.log('Added promissoryNoteNumber:', contractNumbers.promissoryNoteNumber);
          }

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
      async (htmlContent = contractHtml, loanDataParam = null, contractNumbers = {}) => {
        const contentToUse = htmlContent || contractHtml;

        if (!contentToUse) {
          notifyError("لا يوجد محتوى عقد لتحويله إلى PDF");
          return;
        }

        try {
          setIsGenerating(true);

          // Regenerate contract with actual numbers for saving if not already provided
          let finalContent = contentToUse;

          if (!contractNumbers.debtAcknowledgmentNumber || !contractNumbers.promissoryNoteNumber) {
            finalContent = await generateContract(false, loanDataParam, null, true);
          }
    
          // إزالة أي div إضافي محيط بالمحتوى
          let cleanedContent = finalContent;

          // إذا كان المحتوى يحتوي على div إضافي من template، نستخرجه
          const tempDiv = document.createElement('div');
          tempDiv.innerHTML = finalContent;
          
          // البحث عن contract-wrapper داخل المحتوى
          const contractWrapper = tempDiv.querySelector('.contract-wrapper');
          
          if (contractWrapper) {
            // أخذ المحتوى الداخلي فقط
            cleanedContent = contractWrapper.outerHTML;
          }
    
          const loanDataToUse = loanDataParam || loanData;
          const clientDataToUse = loanDataToUse?.client || clientData;
    
          const options = {
            margin: 0,
            filename: `${contractType.toLowerCase()}_${
              clientDataToUse?.id || loanDataToUse.id
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
    
          const tempElement = document.createElement("div");
          tempElement.style.width = "794px";
          tempElement.style.backgroundColor = "#ffffff";
          tempElement.style.margin = "0 auto";
          tempElement.style.padding = "0";
          tempElement.style.position = "relative";
          
          tempElement.innerHTML = cleanedContent;
          document.body.appendChild(tempElement);
          
          // انتظار قليل لتحميل الخطوط والصور
          await new Promise(resolve => setTimeout(resolve, 500));
    
          const pdfBlob = await html2pdf()
            .from(tempElement)
            .set(options)
            .outputPdf("blob");
    
          // إزالة العنصر المؤقت
          document.body.removeChild(tempElement);
    
          await uploadPDFToServer(pdfBlob, loanDataParam, contractNumbers);

          // Increment the appropriate counter after successful save
          if (contractType === "DEBT_ACKNOWLEDGMENT") {
            contractCounterService.generateContractNumber(contractCounterService.COUNTER_TYPES.DEBT_ACKNOWLEDGMENT);
          } else if (contractType === "PROMISSORY_NOTE") {
            contractCounterService.generateContractNumber(contractCounterService.COUNTER_TYPES.PROMISSORY_NOTE);
          }

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
      async (generatePdf = autoGenerate, customLoanData = null, customKafeelData = null, isForSaving = false) => {
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
          const amountInWords = `${numberToArabicWords(totalAmount)} ريال`;

          const clientDataToUse = loanDataToUse.client || clientData;

          // توليد أرقام العقود بناءً على ما إذا كنا نحفظ أم نعاين
          let promissoryNoteNumber, debtAcknowledgmentNumber;

          // Use saved numbers if they exist in loanData, otherwise use current counter numbers
          if (loanDataToUse.debtAcknowledgmentNumber && loanDataToUse.promissoryNoteNumber) {
            // Use the numbers already saved in the database
            promissoryNoteNumber = loanDataToUse.promissoryNoteNumber;
            debtAcknowledgmentNumber = loanDataToUse.debtAcknowledgmentNumber;
          } else {
            // Use current counter numbers for preview or when numbers aren't saved yet
            const settlementNumbers = contractCounterService.getSettlementContractNumbers();
            promissoryNoteNumber = settlementNumbers.promissoryNoteNumber;
            debtAcknowledgmentNumber = settlementNumbers.debtAcknowledgmentNumber;
          }

          if (isForSaving) {
            // حفظ الأرقام في قاعدة البيانات مباشرة
            // Only save if numbers are not already saved (should not happen with new logic)
            const shouldSaveNumbers = !loanDataToUse.debtAcknowledgmentNumber || !loanDataToUse.promissoryNoteNumber;

            if (shouldSaveNumbers) {
              try {
                console.log('Saving contract numbers:', { debtAcknowledgmentNumber, promissoryNoteNumber });
                await Api.post(`/api/loans/${loanDataToUse.id}/save-contract-numbers`, {
                  debtAcknowledgmentNumber,
                  promissoryNoteNumber
                });
              } catch (error) {
                console.error('Error saving contract numbers:', error);
              }
            }
          }

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
            .replace(/{{تاريخ_الاستحقاق}}/g,
              loanDataToUse?.promissoryNoteType === "manual" && loanDataToUse?.promissoryNoteDate
                ? formatRepaymentDay(loanDataToUse.promissoryNoteDate)
                : "لدى الاطلاع"
            )

            .replace(/{{اسم_الدائن}}/g, loanDataToUse?.partner?.name || "لا يوجد كفيل")
            .replace(/{{اسم_المدين}}/g, clientDataToUse?.name || "")
            .replace(/{{رقم_السند}}/g, promissoryNoteNumber)
            .replace(/{{رقم_الإقرار}}/g, debtAcknowledgmentNumber)
            .replace(/{{مدينة_الاصدار}}/g, loanDataToUse?.issuanceCity || "شروة - المملكة العربية السعودية")
            .replace(/{{مدينة_الوفاء}}/g, loanDataToUse?.paymentCity || "الرياض - المملكة العربية السعودية")
            .replace(/{{سبب_انشاء_السند}}/g, "سلفة مالية")
            .replace(/{{العملة}}/g, "ريال")

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
                await generatePDF(filledTemplate, loanDataToUse, {
                  debtAcknowledgmentNumber,
                  promissoryNoteNumber
                });
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

    // إخفاء المكون تماماً إلا عند الحاجة لعرض رسالة التحميل
    if (!isGenerating) {
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
        <div
          style={{
            textAlign: "center",
            padding: "20px",
            backgroundColor: "#f5f5f5",
          }}
        >
          جاري إنشاء PDF...
        </div>
      </div>
    );
  }
);
export default LoanContractGenerator;