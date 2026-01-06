import Api from '../../config/Api';

// Get all partners savings with pagination
export const getAllPartnerSavings = async (page = 1, limit = 10, filters = {}) => {
  const params = new URLSearchParams();
  params.append('page', page);
  if (limit) params.append('limit', limit);
  if (filters.name) params.append('name', filters.name);
  if (filters.nationalId) params.append('nationalId', filters.nationalId);
  if (filters.phone) params.append('phone', filters.phone);
  
  const response = await Api.get(`/api/saving/${page}?${params.toString()}`);
  return response.data;
};

// Get saving details for specific partner
export const getPartnerSavingDetails = async (partnerId) => {
  const response = await Api.get(`/api/saving/partner/${partnerId}`);
  return response.data;
};

// Get saving account report
export const getSavingAccountReport = async (month = null) => {
  const params = month ? `?month=${month}` : '';
  const response = await Api.get(`/api/saving/account-report${params}`);
  return response.data;
};

// Preview global saving withdrawal
export const previewGlobalSavingWithdrawal = async (amount) => {
  const response = await Api.get(`/api/saving/preview/withdraw?amount=${amount}`);
  return response.data;
};

// Withdraw from all partners savings
export const withdrawFromAllPartnersSavings = async (amount, description = '') => {
  const response = await Api.post('/api/saving/withdraw', { amount, description });
  return response.data;
};