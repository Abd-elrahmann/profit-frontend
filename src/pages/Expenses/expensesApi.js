import Api, { handleApiError } from '../../config/Api';

export const getExpenses = async (page = 1) => {
  try {
    const response = await Api.get(`/api/expenses/records/${page}`);
    return response.data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};

export const createExpense = async (expensesData) => {
  try {
    const response = await Api.post('/api/expenses', expensesData);
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