import Api from '../../config/Api';

// Get closed periods available for distribution
export const getClosedPeriods = async () => {
  const response = await Api.get('/api/distribution/closed-periods');
  return response.data;
};

// Post distribution for a period
export const postDistribution = async (periodId) => {
  const response = await Api.post(`/api/distribution/post/${periodId}`);
  return response.data;
};

// Unpost distributions for a period
export const unpostDistribution = async (periodId) => {
  const response = await Api.post(`/api/distribution/unpost/${periodId}`);
  return response.data;
};

// Get period by ID (for viewing details)
export const getPeriodById = async (periodId) => {
  const response = await Api.get(`/api/periods/${periodId}`);
  return response.data;
};