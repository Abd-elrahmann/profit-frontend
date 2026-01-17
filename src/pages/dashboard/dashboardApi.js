import Api from '../../config/Api';

export const getClientStats = async (filter = 'all') => {
  const params = filter !== 'all' ? `?filter=${filter}` : '';
  const response = await Api.get(`/api/dashboard/client-stats${params}`);
  return response.data;
};

export const getPartnerStats = async (filter = 'all') => {
  const params = filter !== 'all' ? `?filter=${filter}` : '';
  const response = await Api.get(`/api/dashboard/partner-stats${params}`);
  return response.data;
};

export const getLoanStats = async (filter = 'all') => {
  const params = filter !== 'all' ? `?filter=${filter}` : '';
  const response = await Api.get(`/api/dashboard/loan-stats${params}`);
  return response.data;
};

export const getMonthlyCollection = async () => {
  const response = await Api.get('/api/dashboard/monthly-collection');
  return response.data;
};

export const getUpcomingRepayments = async () => {
  const response = await Api.get('/api/dashboard/Upcoming-Repayments');
  return response.data;
};

export const getLastActions = async () => {
  const response = await Api.get('/api/dashboard/Last-Actions');
  return response.data;
};