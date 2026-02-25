import Api from '../../config/Api';

export const getAccounts = async (page = 1, search = '') => {
  const params = new URLSearchParams();
  if (search) params.append('search', search);
  params.append('limit', '20');
  const qs = params.toString();
  const response = await Api.get(`/api/accounts/all/${page}${qs ? `?${qs}` : ''}`);
  return response.data;
};

export const getAccountLedger = async (accountId, fromDate = null, toDate = null, page = 1, limit = 10) => {
  const params = new URLSearchParams();
  if (fromDate) params.append('from', fromDate);
  if (toDate) params.append('to', toDate);
  params.append('limit', limit.toString());

  const queryString = params.toString();
  const response = await Api.get(
    `/api/accounts/${accountId}/${page}${queryString ? `?${queryString}` : ''}`
  );
  return response.data;
};
