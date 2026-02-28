export const getStatusColor = (status) => {
  if (!status) return "default";
  const normalized = status.toString().trim();
  switch (normalized.toUpperCase()) {
    case "PENDING":
      return "warning";
    case "ACTIVE":
      return "success";
    case "COMPLETED":
      return "info";
    case "DEFAULTED":
      return "error";
    default:
      switch (normalized) {
        case "نشط":
          return "success";
        case "منتهي":
          return "warning";
        case "متعثر":
          return "error";
        case "قيد المراجعة":
          return "warning";
        default:
          return "default";
      }
  }
};
export const getStatusText = (status) => {
  switch (status) {
    case "PENDING":
      return "قيد المراجعة";
    case "ACTIVE":
      return "نشط";
    case "COMPLETED":
      return "مكتمل";
    case "DEFAULTED":
      return "متأخر";
    default:
      return status;
  }
};
export const getTypeText = (type) => {
  switch (type) {
    case "DAILY":
      return "يومي";
    case "WEEKLY":
      return "أسبوعي";
    case "MONTHLY":
      return "شهري";
    default:
      return type;
  }
};
export const getSourceText = (source) => {
  switch (source) {
    case "GENERAL":
      return "عام";
    case "NEW_CAPITAL":
      return "رأس مال جديد";
    case "MIX":
      return "عام و رأس مال جديد";
    default:
      return source || "غير محدد";
  }
};
export const getClientStatusColor = (status) => {
  switch (status) {
    case "الكل":
      return "primary";
    case "نشط":
      return "success";
    case "منتهي":
      return "warning";
    case "متعثر":
      return "error";
    default:
      return "default";
  }
};
export const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
};
export { isImageFile } from "../../utilities/fileUtils";
export const CLIENT_DOCUMENT_TYPES = {
  clientIdImage: "صورة هوية العميل",
  clientWorkCard: "بطاقة عمل العميل",
  salaryReport: "تقرير الراتب",
  simaReport: "تقرير SIMA",
  DEBT_ACKNOWLEDGMENT: "إقرار الدين",
  PROMISSORY_NOTE: "سند الأمر",
  SETTLEMENT: " تسوية سلفة ",
};
export const KAFEEL_DOCUMENT_TYPES = {
  kafeelIdImage: "صورة هوية الكفيل",
  kafeelWorkCard: "بطاقة عمل الكفيل",
};
export const numberToArabicWords = (num) => {
  if (num === null || num === undefined || isNaN(num)) return "صفر";
  const ones = ["", "واحد", "اثنان", "ثلاثة", "أربعة", "خمسة", "ستة", "سبعة", "ثمانية", "تسعة"];
  const tens = ["", "", "عشرون", "ثلاثون", "أربعون", "خمسون", "ستون", "سبعون", "ثمانون", "تسعون"];
  const teens = ["عشرة", "أحد عشر", "اثنا عشر", "ثلاثة عشر", "أربعة عشر", "خمسة عشر", "ستة عشر", "سبعة عشر", "ثمانية عشر", "تسعة عشر"];
  const hundreds = ["", "مائة", "مئتان", "ثلاثمائة", "أربعمائة", "خمسمائة", "ستمائة", "سبعمائة", "ثمانمائة", "تسعمائة"];
  if (num === 0) return "صفر";
  if (num < 0) return "سالب " + numberToArabicWords(-num);
  let result = "";
  let hasThousands = false;
  if (num >= 1000000) {
    const millionsPart = Math.floor(num / 1000000);
    if (millionsPart === 1) result += "مليون ";
    else if (millionsPart === 2) result += "مليونان ";
    else if (millionsPart < 11) result += ones[millionsPart] + " ملايين ";
    else result += numberToArabicWords(millionsPart) + " مليون ";
    num %= 1000000;
  }
  if (num >= 1000) {
    const thousandsPart = Math.floor(num / 1000);
    if (thousandsPart === 1) result += "ألف ";
    else if (thousandsPart === 2) result += "ألفان ";
    else if (thousandsPart >= 3 && thousandsPart <= 9) result += ones[thousandsPart] + " آلاف ";
    else if (thousandsPart === 10) result += "عشرة آلاف ";
    else result += numberToArabicWords(thousandsPart) + " ألف ";
    num %= 1000;
    hasThousands = true;
  }
  if (num >= 100) {
    const hundredsPart = Math.floor(num / 100);
    if (hundredsPart > 0) {
      result += hasThousands ? "و" + hundreds[hundredsPart] : hundreds[hundredsPart];
      if (num % 100 > 0) result += " ";
    }
    num %= 100;
  }
  if (num >= 20) {
    const tensPart = Math.floor(num / 10);
    const onesPart = num % 10;
    if (result.length > 0) result += result.trim().endsWith("و") ? " " : " و ";
    result += onesPart > 0 ? ones[onesPart] + " و" + tens[tensPart] : tens[tensPart];
  } else if (num >= 10) {
    if (result.length > 0) result += result.trim().endsWith("و") ? " " : " و ";
    result += teens[num - 10];
  } else if (num > 0) {
    if (result.length > 0) result += result.trim().endsWith("و") ? " " : " و ";
    result += ones[num];
  }
  return result.trim();
};
export const getOrdinalText = (num) => {
  const ordinals = [
    "الأولى",
    "الثانية",
    "الثالثة",
    "الرابعة",
    "الخامسة",
    "السادسة",
    "السابعة",
    "الثامنة",
    "التاسعة",
    "العاشرة",
    "الحادية عشرة",
    "الثانية عشرة",
    "الثالثة عشرة",
    "الرابعة عشرة",
    "الخامسة عشرة",
    "السادسة عشرة",
    "السابعة عشرة",
    "الثامنة عشرة",
    "التاسعة عشرة",
    "العشرون",
  ];
  return ordinals[num] || `ال${num + 1}`;
};