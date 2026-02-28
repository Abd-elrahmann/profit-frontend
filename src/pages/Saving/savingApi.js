import Api from '../../config/Api';
export const getAllPartnerSavings = async (page = 1, limit = 10, filters = {}) => {
  const params = new URLSearchParams();
  params.append('page', page);
  if (limit) params.append('limit', limit);
  if (filters.name) params.append('name', filters.name);
  if (filters.nationalId) params.append('nationalId', filters.nationalId);
  if (filters.phone) params.append('phone', filters.phone);
  const response = await Api.get(`/api/saving/partners/${page}?${params.toString()}`);
  return response.data;
};
export const getPartnerSavingDetails = async (partnerId) => {
  const response = await Api.get(`/api/saving/partner/${partnerId}`);
  return response.data;
};
export const getSavingAccountReport = async (month = null) => {
  const params = month ? `?month=${month}` : '';
  const response = await Api.get(`/api/saving/account-report${params}`);
  return response.data;
};
export const previewGlobalSavingWithdrawal = async (amount) => {
  const response = await Api.get(`/api/saving/withdraw-preview?amount=${amount}`);
  return response.data;
};
export const withdrawFromAllPartnersSavings = async (amount, description = '') => {
  const response = await Api.post('/api/saving/withdraw', { amount, description });
  return response.data;
};