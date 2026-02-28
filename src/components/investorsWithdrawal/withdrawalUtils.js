export const getStatusColor = (status) => {
  switch (status) {
    case "PAID":
      return "success";
    case "PENDING":
      return "default";
    default:
      return "default";
  }
};
export const getStatusText = (status) => {
  switch (status) {
    case "PAID":
      return "مدفوع";
    case "PENDING":
      return "قيد الانتظار";
    default:
      return status;
  }
};
export const getWithdrawingStatusColor = (status) => {
  switch (status) {
    case "WITHDRAWING":
      return "warning";
    case "WITHDRAWN":
      return "success";
    default:
      return "default";
  }
};
export const getWithdrawingStatusText = (status) => {
  switch (status) {
    case "WITHDRAWING":
      return "قيد السحب";
    case "WITHDRAWN":
      return "تم السحب";
    default:
      return status;
  }
};