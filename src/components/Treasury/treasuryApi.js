import Api from '../../config/Api';
export const getBankAccountData = async (
  accountType = 'bank',
  month = null,
  year = null,
  page = 1,
  limit = 20,
  accountId = null
) => {
  const params = new URLSearchParams();
  if (year) {
    const formatted = month ? month : year;
    params.append('month', formatted);
  }
  params.append('limit', limit.toString());
  if (accountId != null) {
    params.append('accountId', String(accountId));
  }
  const queryString = params.toString();
  const endpoint = accountType === 'capital' ? 'NewBank' : 'bank';
  const response = await Api.get(
    `/api/accounts/${endpoint}/${page}${queryString ? `?${queryString}` : ''}`
  );
  return response.data;
};
