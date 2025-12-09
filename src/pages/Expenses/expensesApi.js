import Api, { handleApiError } from '../../config/Api';

// Get expenses with pagination
export const getExpenses = async (page = 1) => {
  try {
    const response = await Api.get(`/api/expenses/${page}`);
    return response.data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};

// Create new expense
export const createExpense = async (expenseData) => {
  try {
    const response = await Api.post('/api/expenses', expenseData);
    return response.data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};

