import dayjs from "dayjs";
import "dayjs/locale/ar";

export const formatArabicDate = (date) => {
  return dayjs(date)
    .locale("ar")
    .format("D [من] MMMM [الساعة] h:mm")
    + " "
    + (dayjs(date).hour() < 12 ? "صباحًا" : "مساءً");
};

export const formatArabicDateOnly = (date) => {
  return dayjs(date)
    .locale("ar")
    .format("D MMMM YYYY");
};

export const getMonthName = (monthNumber) => {
  const months = [
    'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
    'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
  ];
  return months[monthNumber - 1] || monthNumber;
};

export const getInvestorStatus = (investor) => {
  if (investor?.WithdrawingStatus === 'WITHDRAWING' || investor?.WithdrawingStatus === 'WITHDRAWN') return 'WITHDRAWN';
  if (investor?.isNewPartner) return 'NEW';
  return 'OLD';
};

export const getStatusColor = (investor) => {
  const status = typeof investor === 'object' ? getInvestorStatus(investor) : investor;
  switch (status) {
    case 'NEW':
      return 'success';
    case 'OLD':
      return 'info';
    case 'WITHDRAWN':
      return 'warning';
    default:
      return 'default';
  }
};

export const getStatusText = (investor) => {
  const status = typeof investor === 'object' ? getInvestorStatus(investor) : investor;
  switch (status) {
    case 'NEW':
      return 'جديد';
    case 'OLD':
      return 'قديم';
    case 'WITHDRAWN':
      return 'منسحب';
    default:
      return 'غير معروف';
  }
};

export const getTransactionTypeText = (type) => {
  switch (type) {
    case "DEPOSIT":
      return "إيداع";
    case "WITHDRAWAL":
      return "سحب من رأس المال";
    case "PROFIT_WITHDRAWAL":
      return "سحب أرباح";
    case "SAVING_WITHDRAWAL":
      return "سحب ادخار";
    default:
      return type;
  }
};

export const getTransactionTypeColor = (type) => {
  switch (type) {
    case "DEPOSIT":
      return "success";
    case "WITHDRAWAL":
      return "error";
    case "PROFIT_WITHDRAWAL":
      return "warning";
    case "SAVING_WITHDRAWAL":
      return "info";
    default:
      return "default";
  }
};

export const isImageFile = (url) => {
  if (!url) return false;
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.svg'];
  const lowerUrl = url.toLowerCase();
  return imageExtensions.some(ext => lowerUrl.includes(ext));
};

export const normalizeDecimal = (value) => parseFloat(Number(value).toFixed(2));

export const calculateWithdrawalPreview = (
  withdrawAmount,
  investorDetails,
  withdrawPreviewData,
  formatArabicDateFn,
  firstPaymentDate
) => {
  if (!withdrawAmount || parseFloat(withdrawAmount) <= 0 || !investorDetails) {
    return null;
  }

  const monthlyAmount = parseFloat(Number(withdrawAmount).toFixed(2));
  if (monthlyAmount <= 0) return null;

  let partnerDefaultShare = withdrawPreviewData?.partnerDefaultShare || 0;

  if (partnerDefaultShare < 0) partnerDefaultShare = 0;
  partnerDefaultShare = normalizeDecimal(partnerDefaultShare);

  const totalAmount = investorDetails.totalAmount + (investorDetails.totalProfit || 0);
  const remainingCapital = normalizeDecimal(totalAmount - partnerDefaultShare);

  const savingsAmount = investorDetails.totalSaving || 0;

  const monthlyPayment = normalizeDecimal(monthlyAmount);
  const schedule = [];
  let remaining = remainingCapital;
  let monthIndex = 0;
  const startDate = firstPaymentDate ? new Date(firstPaymentDate) : new Date();

  while (remaining > 0 && schedule.length < 100) {
    const amount = remaining - monthlyPayment > 0 ? monthlyPayment : remaining;

    const payDate = new Date(startDate);
    payDate.setMonth(startDate.getMonth() + monthIndex);

    schedule.push({
      month: monthIndex + 1,
      date: formatArabicDateOnly(payDate),
      amount: normalizeDecimal(amount),
      remaining: normalizeDecimal(remaining - amount)
    });

    remaining = normalizeDecimal(remaining - amount);
    monthIndex++;
  }

  return {
    originalCapital: investorDetails.totalAmount,
    totalProfit: investorDetails.totalProfit || 0,
    totalAmount: totalAmount,
    estimatedDefaultShare: partnerDefaultShare,
    remainingCapital: remainingCapital,
    savingsAmount: savingsAmount,
    monthlyPayment: monthlyPayment,
    totalMonths: schedule.length,
    schedule: schedule
  };
};

export const extractCapitalAmount = (freshInvestorData, selectedInvestor, investorDetails) => {
  let capitalAmount = null;

  if (freshInvestorData?.newCapitalAmount !== null && freshInvestorData?.newCapitalAmount !== undefined) {
    const newCapitalValue = Number(freshInvestorData.newCapitalAmount);
    if (!isNaN(newCapitalValue) && newCapitalValue > 0) {
      capitalAmount = newCapitalValue;
    }
  }

  if (!capitalAmount && freshInvestorData?.PartnerNewCapital && Array.isArray(freshInvestorData.PartnerNewCapital) && freshInvestorData.PartnerNewCapital.length > 0) {
    const newCapital = freshInvestorData.PartnerNewCapital[0];
    if (newCapital?.amount !== null && newCapital?.amount !== undefined) {
      const newCapitalValue = Number(newCapital.amount);
      if (!isNaN(newCapitalValue) && newCapitalValue > 0) {
        capitalAmount = newCapitalValue;
      }
    }
  }

  if (!capitalAmount && freshInvestorData?.total !== null && freshInvestorData?.total !== undefined) {
    const totalValue = Number(freshInvestorData.total);
    if (!isNaN(totalValue) && totalValue > 0) {
      capitalAmount = totalValue;
    }
  }

  if (!capitalAmount && freshInvestorData?.capitalAmount !== null && freshInvestorData?.capitalAmount !== undefined) {
    const capitalValue = Number(freshInvestorData.capitalAmount);
    if (!isNaN(capitalValue) && capitalValue > 0) {
      capitalAmount = capitalValue;
    }
  }

  if (!capitalAmount && selectedInvestor) {
    if (selectedInvestor.newCapitalAmount !== null && selectedInvestor.newCapitalAmount !== undefined) {
      const newCapitalValue = Number(selectedInvestor.newCapitalAmount);
      if (!isNaN(newCapitalValue) && newCapitalValue > 0) {
        capitalAmount = newCapitalValue;
      }
    }

    if (!capitalAmount && selectedInvestor.PartnerNewCapital && Array.isArray(selectedInvestor.PartnerNewCapital) && selectedInvestor.PartnerNewCapital.length > 0) {
      const newCapital = selectedInvestor.PartnerNewCapital[0];
      if (newCapital?.amount !== null && newCapital?.amount !== undefined) {
        const newCapitalValue = Number(newCapital.amount);
        if (!isNaN(newCapitalValue) && newCapitalValue > 0) {
          capitalAmount = newCapitalValue;
        }
      }
    }

    if (!capitalAmount && selectedInvestor.total !== null && selectedInvestor.total !== undefined) {
      const totalValue = Number(selectedInvestor.total);
      if (!isNaN(totalValue) && totalValue > 0) {
        capitalAmount = totalValue;
      }
    }

    if (!capitalAmount && selectedInvestor.capitalAmount !== null && selectedInvestor.capitalAmount !== undefined) {
      const capitalValue = Number(selectedInvestor.capitalAmount);
      if (!isNaN(capitalValue) && capitalValue > 0) {
        capitalAmount = capitalValue;
      }
    }
  }

  if (!capitalAmount && investorDetails) {
    const cachedData = investorDetails.partner || investorDetails;
    if (cachedData) {
      if (cachedData.newCapitalAmount !== null && cachedData.newCapitalAmount !== undefined) {
        const newCapitalValue = Number(cachedData.newCapitalAmount);
        if (!isNaN(newCapitalValue) && newCapitalValue > 0) {
          capitalAmount = newCapitalValue;
        }
      }

      if (!capitalAmount && cachedData.PartnerNewCapital && Array.isArray(cachedData.PartnerNewCapital) && cachedData.PartnerNewCapital.length > 0) {
        const newCapital = cachedData.PartnerNewCapital[0];
        if (newCapital?.amount !== null && newCapital?.amount !== undefined) {
          const newCapitalValue = Number(newCapital.amount);
          if (!isNaN(newCapitalValue) && newCapitalValue > 0) {
            capitalAmount = newCapitalValue;
          }
        }
      }

      if (!capitalAmount && cachedData.total !== null && cachedData.total !== undefined) {
        const totalValue = Number(cachedData.total);
        if (!isNaN(totalValue) && totalValue > 0) {
          capitalAmount = totalValue;
        }
      }

      if (!capitalAmount && cachedData.capitalAmount !== null && cachedData.capitalAmount !== undefined) {
        const capitalValue = Number(cachedData.capitalAmount);
        if (!isNaN(capitalValue) && capitalValue > 0) {
          capitalAmount = capitalValue;
        }
      }
    }
  }

  if (!capitalAmount) {
    capitalAmount = 0;
  }

  return capitalAmount;
};
