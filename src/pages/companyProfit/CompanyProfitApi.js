import Api from '../../config/Api';
export const getCompanyProfitReport = async (page = 1) => {
  const response = await Api.get(`/api/company/profit-report/${page}`);
  return response.data;
};
export const withdrawCompanyProfit = async (amount, BankId) => {
  const body = { amount };
  if (BankId != null) body.BankId = BankId;
  const response = await Api.post('/api/company/withdraw-profit', body);
  return response.data;
};