import Api from '../../config/Api';
export const getClosedPeriods = async (periodId = null) => {
  const url = periodId 
    ? `/api/distribution/closed-periods?periodId=${periodId}`
    : '/api/distribution/closed-periods';
  const response = await Api.get(url);
  return response.data;
};
export const postDistribution = async (periodId, savingAmount = 0, partnerIds, BankId) => {
  const body = {
    savingAmount,
    ...(Array.isArray(partnerIds) && partnerIds.length ? { partnerIds } : {}),
  };
  if (BankId != null) body.BankId = BankId;
  const response = await Api.post(`/api/distribution/post/${periodId}`, body);
  return response.data;
};
export const unpostDistribution = async (periodId) => {
  const response = await Api.post(`/api/distribution/unpost/${periodId}`);
  return response.data;
};