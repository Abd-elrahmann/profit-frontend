import Api from '../../config/Api';

// Get accounts tree
export const getAccountsTree = async () => {
  const response = await Api.get('/api/accounts/tree');
  return response.data;
};

// Get account by ID
export const getAccountById = async (accountId) => {
  try {
    const response = await Api.get(`/api/accounts/${accountId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching account:', error);
    throw error;
  }
};

// Create account
export const createAccount = async (accountData) => {
  const response = await Api.post('/api/accounts', accountData);
  return response.data;
};

// Update account
export const updateAccount = async (accountId, accountData) => {
  const response = await Api.put(`/api/accounts/${accountId}`, accountData);
  return response.data;
};

// Delete account
export const deleteAccount = async (accountId) => {
  const response = await Api.delete(`/api/accounts/${accountId}`);
  return response.data;
};