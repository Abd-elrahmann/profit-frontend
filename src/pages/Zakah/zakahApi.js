import Api from '../../config/Api';
export const getZakahByYear = async (year, page = 1, limit = 10) => {
  const response = await Api.get(`/api/zakat/year/${year}?page=${page}&limit=${limit}`);
  return response.data;
};
export const getPartnerZakah = async (partnerId) => {
  const response = await Api.get(`/api/zakat/partner/${partnerId}`);
  return response.data;
};
export const getZakatAccountReport = async (month = null) => {
  const params = month ? `?month=${month}` : '';
  const response = await Api.get(`/api/zakat/account${params}`);
  return response.data;
};
export const withdrawZakat = async (amount) => {
  const response = await Api.post('/api/zakat/withdraw', { amount });
  return response.data;
};