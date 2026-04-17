import Api from '../../config/Api';
export const getClosedPeriods = async (periodId = null) => {
  const url = periodId 
    ? `/api/distribution/closed-periods?periodId=${periodId}`
    : '/api/distribution/closed-periods';
  const response = await Api.get(url);
  return response.data;
};
export const postDistribution = async (periodId, savingAmount = 0, partnerIds) => {
  const response = await Api.post(`/api/distribution/post/${periodId}`, {
    savingAmount,
    ...(Array.isArray(partnerIds) && partnerIds.length ? { partnerIds } : {}),
  });
  return response.data;
};
export const unpostDistribution = async (periodId) => {
  const response = await Api.post(`/api/distribution/unpost/${periodId}`);
  return response.data;
};