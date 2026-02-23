import Api from '../../config/Api';

/**
 * Build query string for dashboard filter.
 * filter can be: 'all' | 'weekly' | 'monthly' | 'yearly' | { from, to } (custom)
 */
const buildFilterParams = (filter) => {
  if (!filter || filter === 'all') return '';
  if (typeof filter === 'object' && filter.from && filter.to) {
    return `?from=${encodeURIComponent(filter.from)}&to=${encodeURIComponent(filter.to)}`;
  }
  return `?filter=${filter}`;
};

export const getClientStats = async (filter = 'all') => {
  const params = buildFilterParams(filter);
  const response = await Api.get(`/api/dashboard/client-stats${params}`);
  return response.data;
};

export const getClientRegistrationGrowth = async (months = 6, period = 'first') => {
  const response = await Api.get(`/api/dashboard/client-registration-growth?months=${months}&period=${period}`);
  return response.data;
};

export const getPartnerStats = async (filter = 'all') => {
  const params = buildFilterParams(filter);
  const response = await Api.get(`/api/dashboard/partner-stats${params}`);
  return response.data;
};

export const getLoanStats = async (filter = 'all') => {
  const params = buildFilterParams(filter);
  const response = await Api.get(`/api/dashboard/loan-stats${params}`);
  return response.data;
};

export const getMonthlyCollection = async () => {
  const response = await Api.get('/api/dashboard/monthly-collection');
  return response.data;
};

export const getUpcomingRepayments = async (limit = 20, days = 7) => {
  const response = await Api.get(`/api/dashboard/Upcoming-Repayments?limit=${limit}&days=${days}`);
  return response.data;
};

export const getLastActions = async (limit = 10, screen) => {
  const params = new URLSearchParams();
  if (limit) params.set('limit', limit);
  if (screen) params.set('screen', screen);
  const query = params.toString();
  const response = await Api.get(`/api/dashboard/Last-Actions${query ? `?${query}` : ''}`);
  return response.data;
};

export const getLastActionsStats = async () => {
  const response = await Api.get('/api/dashboard/last-actions-stats');
  return response.data;
};

export const getLatestClients = async (limit = 5) => {
  const response = await Api.get(`/api/dashboard/latest-clients?limit=${limit}`);
  return response.data;
};

export const getTopCommittedClients = async (limit = 5) => {
  const response = await Api.get(`/api/dashboard/top-committed-clients?limit=${limit}`);
  return response.data;
};

export const getPartnerDetails = async (limit = 10) => {
  const response = await Api.get(`/api/dashboard/partner-details?limit=${limit}`);
  return response.data;
};

export const getPartnerProfitGrowth = async (months = 6, period = 'first') => {
  const response = await Api.get(`/api/dashboard/partner-profit-growth?months=${months}&period=${period}`);
  return response.data;
};

export const getLatestLoans = async (limit = 5) => {
  const response = await Api.get(`/api/dashboard/latest-loans?limit=${limit}`);
  return response.data;
};

export const getLoanDistribution = async () => {
  const response = await Api.get('/api/dashboard/loan-distribution');
  return response.data;
};

export const getRepaymentTrend = async (months = 6, period = 'first') => {
  const response = await Api.get(`/api/dashboard/repayment-trend?months=${months}&period=${period}`);
  return response.data;
};

export const getDailyCollectionTrend = async (days = 7) => {
  const response = await Api.get(`/api/dashboard/daily-collection-trend?days=${days}`);
  return response.data;
};

export const getPendingReviewRepayments = async (limit = 10) => {
  const response = await Api.get(`/api/dashboard/pending-review-repayments?limit=${limit}`);
  return response.data;
};

export const getRepaymentsByMonth = async (year, month) => {
  const response = await Api.get(`/api/dashboard/repayments-by-month?year=${year}&month=${month}`);
  return response.data;
};