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