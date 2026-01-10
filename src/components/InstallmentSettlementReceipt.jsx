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

  const scale = [
    { value: 1e9, singular: "مليار", dual: "ملياران", plural: "مليارات" },
    { value: 1e6, singular: "مليون", dual: "مليونان", plural: "ملايين" },
    { value: 1e3, singular: "ألف", dual: "ألفان", plural: "آلاف" },
  ];
  
  for (let s of scale) {
    if (num >= s.value) {
      const part = Math.floor(num / s.value);
      if (part === 1) result += s.singular + " ";
      else if (part === 2) result += s.dual + " ";
      else if (part < 11) result += ones[part] + " " + s.plural + " ";
      else {
        if (part >= 20) {
          const partTens = Math.floor(part / 10);
          const partOnes = part % 10;
          if (partOnes > 0) {
            result += ones[partOnes] + " و" + tens[partTens] + " " + s.singular + " ";
          } else {
            result += tens[partTens] + " " + s.singular + " ";
          }
        } else {
          result += numberToArabicWords(part) + " " + s.singular + " ";
        }
      }

      num %= s.value;
      if (s.value === 1e3) hasThousands = true;
    }
  }

// Handle hundreds
if (num >= 100) {
  const hundredsPart = Math.floor(num / 100);

  if (hasThousands) {
    result += "و" + hundreds[hundredsPart]; // ❌ شيل المسافة
  } else {
    result += hundreds[hundredsPart];
  }

  num %= 100;

  if (num > 0) result += " ";
}

  if (num >= 20) {
    const t = Math.floor(num / 10);
    const o = num % 10;
    const hasHigherUnits = result.length > 0;

    if (hasHigherUnits && !result.trim().endsWith("و")) {
      result += "و";
    }

    if (o > 0) {
      result += ones[o] + " و" + tens[t];
    } else {
      result += tens[t];
    }
  } else if (num >= 10) {
    const hasHigherUnits = result.length > 0;

    if (hasHigherUnits && !result.trim().endsWith("و")) {
      result += "و";
    }
    result += teens[num - 10];
  } else if (num > 0) {
    const hasHigherUnits = result.length > 0;

    if (hasHigherUnits && !result.trim().endsWith("و")) {
      result += "و";
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

          let cleanedContent = contentToUse;

          const tempDiv = document.createElement('div');
          tempDiv.innerHTML = contentToUse;

          const contractWrapper = tempDiv.querySelector('.contract-wrapper');

          if (contractWrapper) {
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

          const tempElement = document.createElement('div');
          tempElement.style.width = '794px';
          tempElement.style.backgroundColor = 'white';
          tempElement.style.margin = '0 auto';
          tempElement.style.padding = '0';
          tempElement.innerHTML = cleanedContent;

          document.body.appendChild(tempElement);

          await new Promise(resolve => setTimeout(resolve, 500));

          const pdfBlob = await html2pdf()
            .from(tempElement)
            .set(options)
            .outputPdf("blob");

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

    const generateContract = useCallback(
      async (generatePdf = autoGenerate, customData = null) => {
        const dataToUse = customData || {
          installmentData,
          loanData,
          clientData,
          employeeName,
        };

        const promissoryNoteNumber = dataToUse.loanData?.promissoryNoteNumber || "غير محدد";
        const debtAcknowledgmentNumber = dataToUse.loanData?.debtAcknowledgmentNumber || "غير محدد";

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

          let amount = 0;
          
          const totalAmount = Number(dataToUse.loanData?.totalAmount || 0);
          const earlyPaidAmount = Number(dataToUse.loanData?.earlyPaidAmount || 0);
          const earlyPaymentDiscount = Number(dataToUse.loanData?.earlyPaymentDiscount || 0);
          
          // حساب المبلغ من الدفعات إذا كانت متوفرة
          let calculatedFromInstallments = 0; // المبلغ بعد خصم الخصومات
          let totalFromAllInstallments = 0; // مجموع جميع الدفعات قبل الخصومات
          let totalDiscounts = 0; // إجمالي الخصومات
          let allInstallmentsPaid = false;
          if (dataToUse.loanData?.allInstallments && Array.isArray(dataToUse.loanData.allInstallments)) {
            const paidInstallments = dataToUse.loanData.allInstallments.filter(
              inst => inst.status === 'PAID' || inst.status === 'EARLY_PAID' || inst.status === 'COMPLETED'
            );
            // حساب المبلغ بعد خصم الخصومات من الدفعات المدفوعة
            calculatedFromInstallments = paidInstallments.reduce(
              (sum, inst) => sum + (Number(inst.amount) || 0) - (Number(inst.discount) || 0),
              0
            );
            // حساب مجموع جميع الدفعات قبل الخصومات
            totalFromAllInstallments = dataToUse.loanData.allInstallments.reduce(
              (sum, inst) => sum + (Number(inst.amount) || 0),
              0
            );
            // حساب إجمالي الخصومات من جميع الدفعات المدفوعة
            totalDiscounts = paidInstallments.reduce(
              (sum, inst) => sum + (Number(inst.discount) || 0),
              0
            );
            // التحقق إذا كانت جميع الدفعات مدفوعة
            allInstallmentsPaid = dataToUse.loanData.allInstallments.length > 0 && 
                                  dataToUse.loanData.allInstallments.every(
                                    inst => inst.status === 'PAID' || inst.status === 'EARLY_PAID' || inst.status === 'COMPLETED'
                                  );
          }
          
          // استخدام المبلغ المحسوب مسبقاً إذا كان متوفراً
          if (dataToUse.loanData?.calculatedSettlementAmount !== undefined && 
              dataToUse.loanData.calculatedSettlementAmount > 0) {
            amount = Number(dataToUse.loanData.calculatedSettlementAmount);
          }
          // إذا كانت جميع الدفعات مدفوعة، استخدم المبلغ بعد خصم الخصومات
          else if (allInstallmentsPaid) {
            // أولوية: المبلغ المحسوب من الدفعات بعد خصم الخصومات
            if (calculatedFromInstallments > 0) {
              amount = calculatedFromInstallments;
            }
            // إذا لم يكن متوفراً، احسب من المبلغ الإجمالي مطروحاً منه الخصومات
            else if (totalAmount > 0) {
              amount = Math.max(0, totalAmount - totalDiscounts);
            } 
            // أو استخدم مجموع الدفعات مطروحاً منه الخصومات
            else if (totalFromAllInstallments > 0) {
              amount = Math.max(0, totalFromAllInstallments - totalDiscounts);
            }
          }
          // استخدام المبلغ المحسوب من الدفعات
          else if (calculatedFromInstallments > 0) {
            amount = calculatedFromInstallments;
          }
          // استخدام earlyPaidAmount إذا كان متوفراً
          else if (earlyPaidAmount > 0 && earlyPaymentDiscount >= 0) {
            amount = Math.max(0, earlyPaidAmount - earlyPaymentDiscount);
          }
          // استخدام totalRemainingAmount من pagination
          else if (dataToUse.loanData?.pagination?.totalRemainingAmount !== undefined && 
                   dataToUse.loanData.pagination.totalRemainingAmount !== null &&
                   dataToUse.loanData.pagination.totalRemainingAmount > 0) {
            amount = Number(dataToUse.loanData.pagination.totalRemainingAmount);
          } 
          // استخدام totalRemainingAmount مباشرة
          else if (dataToUse.loanData?.totalRemainingAmount !== undefined && 
                   dataToUse.loanData.totalRemainingAmount !== null &&
                   dataToUse.loanData.totalRemainingAmount > 0) {
            amount = Number(dataToUse.loanData.totalRemainingAmount);
          } 
          // استخدام remainingBalance
          else if (dataToUse.loanData?.remainingBalance !== undefined && 
                   dataToUse.loanData.remainingBalance !== null &&
                   dataToUse.loanData.remainingBalance > 0) {
            amount = Number(dataToUse.loanData.remainingBalance);
          } 
          // حساب من totalPaidAmount
          else if (dataToUse.loanData?.pagination?.totalPaidAmount !== undefined) {
            const totalPaidAmount = Number(dataToUse.loanData.pagination.totalPaidAmount);
            amount = Math.max(0, totalAmount - totalPaidAmount);
          }
          // استخدام totalAmount كحل أخير
          else {
            amount = totalAmount;
          }
          
          const amountInWords = `${numberToArabicWords(amount)} ريال`;

          let filledTemplate = templateContent
            .replace(/{{اسم_العميل}}/g, dataToUse.clientData.name || "")
            .replace(
              /{{رقم_هوية_العميل}}/g,
              dataToUse.clientData.nationalId || ""
            )
            .replace(/{{رقم_الدفعة}}/g, dataToUse.installmentData.count || "N/A")
            .replace(
              /{{رقم_السند}}/g,
              promissoryNoteNumber
            )
            .replace(
              /{{رقم_الإقرار}}/g,
              debtAcknowledgmentNumber
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

    React.useImperativeHandle(ref, () => ({
      generateContract,
      generatePDF: () => generatePDF(contractHtml),
    }));

    if (autoGenerate) {
      return null;
    }

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