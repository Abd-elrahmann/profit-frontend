import Api, { handleApiError } from '../../config/Api';
export const getExpenses = async (page = 1, filters = {}) => {
  try {
    const params = new URLSearchParams();
    if (filters.types?.length) {
      filters.types.forEach((t) => params.append('type', t));
    }
    if (filters.employeeIds?.length) {
      filters.employeeIds.forEach((id) => params.append('employeeId', String(id)));
    }
    const query = params.toString() ? `?${params.toString()}` : '';
    const response = await Api.get(`/api/expenses/records/${page}${query}`);
    return response.data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};
export const getNextExpenseVoucherNumber = async () => {
  try {
    const response = await Api.get('/api/expenses/next-voucher-number');
    return response.data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};

export const createExpense = async (expensesData, voucherUrl, reference) => {
  try {
    const body = { expenses: expensesData?.expenses ?? expensesData };
    if (voucherUrl) body.voucherUrl = voucherUrl;
    if (reference) body.reference = reference;
    const response = await Api.post('/api/expenses', body);
    return response.data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};
export const updateExpense = async (journalId, expensesData) => {
  try {
    const response = await Api.patch(`/api/expenses/${journalId}`, expensesData);
    return response.data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};
export const deleteExpense = async (journalId) => {
  try {
    const response = await Api.delete(`/api/expenses/${journalId}`);
    return response.data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};
export const getUsersForExpenses = async (searchTerm = '') => {
  try {
    const params = searchTerm ? { name: searchTerm } : {};
    const response = await Api.get('/api/expenses/users/list', { params });
    return response.data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};