import Api from '../../config/Api';

export const getTrialBalance = async ({ from, to } = {}) => {
  const params = new URLSearchParams();
  if (from) params.append('from', from);
  if (to) params.append('to', to);
  const qs = params.toString();
  const response = await Api.get(`/api/accounts/trial-balance${qs ? `?${qs}` : ''}`);
  return response.data;
};
