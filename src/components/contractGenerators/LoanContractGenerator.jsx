import React, { useState, useCallback, useEffect } from "react";
import html2pdf from "html2pdf.js";
import Api, { handleApiError } from "../../config/Api";
import { notifyError } from "../../utilities/toastify";
import { ensureFontsReady } from "../../utilities/fontLoader";
import { amountToArabicSarInWords } from "../../utilities/arabicAmountWords";
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
    const uploadPDFToServer = useCallback(
      async (pdfBlob, loanDataParam = null, contractNumbers = {}) => {
        try {
          const loanDataToUse = loanDataParam;

          if (!loanDataToUse?.id) {
            throw new Error("Loan data not available for PDF upload");
          }
          const formData = new FormData();
          const filename =
            contractType === "DEBT_ACKNOWLEDGMENT"
              ? `إقرار الدين_${loanDataToUse.id}_${Date.now()}.pdf`
              : `سند الأمر_${loanDataToUse.id}_${Date.now()}.pdf`;
          formData.append("file", pdfBlob, filename);

          if (contractNumbers.debtAcknowledgmentNumber) {
            formData.append("debtAcknowledgmentNumber", contractNumbers.debtAcknowledgmentNumber);

          }
          if (contractNumbers.promissoryNoteNumber) {
            formData.append("promissoryNoteNumber", contractNumbers.promissoryNoteNumber);

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
          let finalContent = contentToUse;
          let cleanedContent = finalContent;
          const tempDiv = document.createElement('div');
          tempDiv.innerHTML = finalContent;
          const contractWrapper = tempDiv.querySelector('.contract-wrapper');
          if (contractWrapper) {
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
          await ensureFontsReady();
          const pdfBlob = await html2pdf()
            .from(tempElement)
            .set(options)
            .outputPdf("blob");
          document.body.removeChild(tempElement);
          await uploadPDFToServer(pdfBlob, loanDataParam, contractNumbers);
          if (onContractGenerated) {
            onContractGenerated(pdfBlob, contractType);
          }
          return pdfBlob;
        } catch (error) {
          notifyError("حدث خطأ أثناء إنشاء ملف PDF");
          handleApiError(error);
          throw error;
        }
      },
      [contractType, uploadPDFToServer, onContractGenerated, loanData, clientData, contractHtml]
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
          const grossPrincipal = Number(loanDataToUse.amount) || 0;
          const advancePayment = Number(loanDataToUse.advancePayment) || 0;
          const principalNet = Math.max(0, grossPrincipal - advancePayment);
          const interestAmount =
            Number(loanDataToUse.interestAmount ?? loanDataToUse.TotalInterest ?? 0) || 0;
          const totalAmount = principalNet + interestAmount;
          const totalAmountFormatted = Number(totalAmount).toLocaleString("en-US", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          });
          const amountInWords = amountToArabicSarInWords(totalAmount).replace(/مائة/gi, "مئة");
          const clientDataToUse = loanDataToUse.client || clientData;
          let promissoryNoteNumber, debtAcknowledgmentNumber;
          if (loanDataToUse.debtAcknowledgmentNumber && loanDataToUse.promissoryNoteNumber) {
            promissoryNoteNumber = loanDataToUse.promissoryNoteNumber;
            debtAcknowledgmentNumber = loanDataToUse.debtAcknowledgmentNumber;
          } else {
            try {
              const countResponse = await Api.get(`/api/loans/get/counts/${loanDataToUse.id}`);
              const count = countResponse.data.count;
              promissoryNoteNumber = count.toString();
              debtAcknowledgmentNumber = count.toString();
            } catch (error) {
              console.error('Error fetching loan count:', error);
              notifyError("حدث خطأ في جلب رقم العقد");
              return;
            }
          }
          if (isForSaving) {
            const shouldSaveNumbers = !loanDataToUse.debtAcknowledgmentNumber || !loanDataToUse.promissoryNoteNumber;
            if (shouldSaveNumbers) {
              try {

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
              totalAmountFormatted || "0.00"
            )
            .replace(/{{المبلغ_كتابة}}/g, `${amountInWords}`)
            .replace(
              /{{قيمة_السند_رقما}}/g,
              totalAmountFormatted || "0.00"
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
    return null;
  }
);
export default LoanContractGenerator;