import Api from '../../config/Api';
export const getCompanyProfitReport = async (page = 1) => {
  const response = await Api.get(`/api/company/profit-report/${page}`);
  return response.data;
};
export const withdrawCompanyProfit = async (amount) => {
  const response = await Api.post('/api/company/withdraw-profit', { amount });
  return response.data;
};