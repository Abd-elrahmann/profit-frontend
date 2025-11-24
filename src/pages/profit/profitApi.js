import Api from '../../config/Api';

// Get closed periods available for distribution
// If periodId is provided, returns details for that specific period
export const getClosedPeriods = async (periodId = null) => {
  const url = periodId 
    ? `/api/distribution/closed-periods?periodId=${periodId}`
    : '/api/distribution/closed-periods';
  const response = await Api.get(url);
  return response.data;
};

// Post distribution for a period with saving percentage
export const postDistribution = async (periodId, savingPercentage = 0) => {
  const response = await Api.post(`/api/distribution/post/${periodId}`, {
    savingPercentage
  });
  return response.data;
};

// Unpost distributions for a period
export const unpostDistribution = async (periodId) => {
  const response = await Api.post(`/api/distribution/unpost/${periodId}`);
  return response.data;
};