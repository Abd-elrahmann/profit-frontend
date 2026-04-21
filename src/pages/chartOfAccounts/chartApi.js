import Api, { handleApiError } from '../../config/Api';
export const getAccountsTree = async () => {
  const response = await Api.get('/api/accounts/tree');
  return response.data;
};

/** بحث في الخادم: المطابقون + كل أبنائهم في الشجرة */
export const searchAccountsTree = async (q) => {
  try {
    const response = await Api.get('/api/accounts/search', {
      params: { q: q.trim() },
    });
    return response.data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};
export const getAccountById = async (accountId) => {
  try {
    const response = await Api.get(`/api/accounts/${accountId}`);
    return response.data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};
export const createAccount = async (accountData) => {
  const response = await Api.post('/api/accounts', accountData);
  return response.data;
};
export const updateAccount = async (accountId, accountData) => {
  const response = await Api.patch(`/api/accounts/${accountId}`, accountData);
  return response.data;
};
export const deleteAccount = async (accountId) => {
  const response = await Api.delete(`/api/accounts/${accountId}`);
  return response.data;
};