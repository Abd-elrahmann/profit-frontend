import Api, { handleApiError } from '../../config/Api';

// Get expenses with pagination
export const getExpenses = async (page = 1) => {
  try {
    const response = await Api.get(`/api/expenses/records/${page}`);
    return response.data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};

// Create new expense
export const createExpense = async (expensesData) => {
  try {
    const response = await Api.post('/api/expenses', expensesData);
    return response.data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};

// Update expense - يستخدم journalId كما هو محدد في الـ backend
export const updateExpense = async (journalId, expensesData) => {
  try {
    const response = await Api.patch(`/api/expenses/${journalId}`, expensesData);
    return response.data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};

// Delete expense - يستخدم journalId كما هو محدد في الـ backend
export const deleteExpense = async (journalId) => {
  try {
    const response = await Api.delete(`/api/expenses/${journalId}`);
    return response.data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};

// Get users list for expenses
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