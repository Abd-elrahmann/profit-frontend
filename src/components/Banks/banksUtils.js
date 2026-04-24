/** تنسيق رصيد الحساب المحاسبي المرتبط بالبنك (إن وُجد) */
export const formatAccountBalance = (value) => {
  if (value == null) return "—";
  return Number(value).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

export const getBankStatusText = (status, language = "ar") => {
  if (language === "ar") {
    if (status === "Expired") return "منتهي";
    if (status === "Active") return "نشط";
  }
  return status || "";
};
export const getBankStatusColor = (status) => {
  if (status === "Active") return "success";
  if (status === "Expired") return "warning";
  return "default";
};
