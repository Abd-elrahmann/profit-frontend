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
      else result += numberToArabicWords(part) + " " + s.singular;

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
    result += tens[t];
    if (o > 0) result += " و " + ones[o];
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

          console.log("Uploading settlement receipt to endpoint:", endpoint);

          const response = await Api.post(endpoint, formData, {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          });

          console.log("Upload response:", response.data);
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

          // إنشاء عنصر ثابت في الصفحة

          const previewContainer = document.createElement("div");
          previewContainer.id = `settlement-receipt-preview-${Date.now()}`;

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
            filename: `settlement_receipt_${
              installmentData.id
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

          console.log("Generating settlement receipt PDF...");

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
            "Settlement receipt PDF generated and uploaded successfully"
          );

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

        if (
          !dataToUse.installmentData ||
          !dataToUse.clientData ||
          !templateContent
        ) {
          console.error("Missing data:", dataToUse);
          notifyError("بيانات الدفعة أو العميل أو قالب السند غير متوفر");
          return;
        }

        try {
          console.log("Generating settlement receipt:", dataToUse);

          const { gregorianDate, hijriDate } = getCurrentDates();

          const amount = dataToUse.loanData?.totalAmount || 0;
          const amountInWords = numberToArabicWords(amount);

          console.log(
            "Total Loan Amount:",
            amount,
            "Amount in words:",
            amountInWords
          );

          let filledTemplate = templateContent
            // Client data
            .replace(/{{اسم_العميل}}/g, dataToUse.clientData.name || "")
            .replace(
              /{{رقم_هوية_العميل}}/g,
              dataToUse.clientData.nationalId || ""
            )
            .replace(/{{رقم_الدفعة}}/g, dataToUse.installmentData.count || "N/A")
            .replace(
              /{{رقم_السند}}/g,
              `SETTLEMENT-${dataToUse.installmentData.id}-${Date.now()}`
            )

            // Amount data
            .replace(
              /{{المبلغ_رقما}}/g,
              `${amount?.toLocaleString("en-US") || "0"} ريال سعودي`
            )
            .replace(/{{المبلغ_كتابة}}/g, `${amountInWords} ريال سعودي`)

            // Dates
            .replace(/{{التاريخ_الهجري}}/g, hijriDate)
            .replace(/{{التاريخ_الميلادي}}/g, gregorianDate)

            // Employee data
            .replace(
              /{{اسم_الموظف}}/g,
              dataToUse.employeeName || "ربيش سالم ناصر الهمامي"
            );

          console.log("Settlement receipt template generated successfully");

          setContractHtml(filledTemplate);

          // إذا كان التوليد تلقائي، انتقل مباشرة لإنشاء PDF
          if (generatePdf) {
            console.log("Auto-generating settlement receipt PDF...");

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

    // التوليد التلقائي عند تغيير البيانات
    useEffect(() => {
      if (autoGenerate && installmentData && clientData && templateContent) {
        console.log("Auto-generating settlement receipt...");
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