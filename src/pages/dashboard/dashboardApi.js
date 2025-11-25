import Api from '../../config/Api';

// Get clients statistics
export const getClientStats = async (filter = 'all') => {
  const params = filter !== 'all' ? `?filter=${filter}` : '';
  const response = await Api.get(`/api/dashboard/client-stats${params}`);
  return response.data;
};

// Get partners statistics
export const getPartnerStats = async (filter = 'all') => {
  const params = filter !== 'all' ? `?filter=${filter}` : '';
  const response = await Api.get(`/api/dashboard/partner-stats${params}`);
  return response.data;
};

// Get loans statistics
export const getLoanStats = async (filter = 'all') => {
  const params = filter !== 'all' ? `?filter=${filter}` : '';
  const response = await Api.get(`/api/dashboard/loan-stats${params}`);
  return response.data;
};

// Get monthly collection statistics
export const getMonthlyCollection = async () => {
  const response = await Api.get('/api/dashboard/monthly-collection');
  return response.data;
};