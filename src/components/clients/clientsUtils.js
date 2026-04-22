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
export {
  integerToArabicWords,
  numberToArabicWords,
  amountToArabicSarInWords,
} from "../../utilities/arabicAmountWords";
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