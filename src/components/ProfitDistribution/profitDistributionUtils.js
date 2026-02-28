import dayjs from "dayjs";
import "dayjs/locale/ar";
export const formatDate = (dateString) => {
  if (!dateString) return "غير محدد";
  return new Date(dateString).toLocaleDateString("en-US");
};
export const formatArabicDate = (date) => {
  return (
    dayjs(date).locale("ar").format("D [من] MMMM [الساعة] h:mm") +
    " " +
    (dayjs(date).hour() < 12 ? "صباحًا" : "مساءً")
  );
};
export const formatNumber = (num) => {
  if (!num) return "0";
  return Number(num).toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
};
export const getJournalStatusText = (status) => {
  const statusMap = {
    DRAFT: "مسودة",
    POSTED: "معتمد",
    CANCELLED: "ملغي",
  };
  return statusMap[status] || status;
};
export const hasDistribution = (period) => {
  return (
    period?.isDistributed === true ||
    (period?.distributionJournal &&
      period.distributionJournal.status === "POSTED")
  );
};
export const calculateProfitAfterSaving = (
  periodData,
  enableSaving,
  savingPercentage
) => {
  if (!periodData)
    return {
      companyProfit: 0,
      partnerProfit: 0,
      savedAmount: 0,
      originalCompanyProfit: 0,
      originalPartnerProfit: 0,
    };
  const totalPartnerProfit =
    periodData.partners?.reduce(
      (sum, partner) => sum + (partner.finalProfit || partner.totalProfit || 0),
      0
    ) || 0;
  const companyProfit = periodData.companyProfit || 0;
  if (enableSaving && savingPercentage > 0) {
    const savedAmount = totalPartnerProfit * (savingPercentage / 100);
    const partnerProfitAfterSaving = totalPartnerProfit - savedAmount;
    return {
      savedAmount,
      companyProfit,
      partnerProfit: partnerProfitAfterSaving,
      originalCompanyProfit: companyProfit,
      originalPartnerProfit: totalPartnerProfit,
    };
  }
  if (
    periodData.totalAfterSaving !== undefined &&
    periodData.totalSaving !== undefined
  ) {
    return {
      savedAmount: periodData.totalSaving,
      companyProfit: periodData.companyProfit || 0,
      partnerProfit: periodData.totalAfterSaving,
      originalCompanyProfit: periodData.companyProfit || 0,
      originalPartnerProfit: totalPartnerProfit,
    };
  }
  return {
    savedAmount: 0,
    companyProfit,
    partnerProfit: totalPartnerProfit,
    originalCompanyProfit: companyProfit,
    originalPartnerProfit: totalPartnerProfit,
  };
};