import Api, { handleApiError } from '../../config/Api';

export const incomeStatementApi = {
  getIncomeStatement: async (params) => {
    try {
      const response = await Api.get('/api/income-statement', { params });
      return response.data;
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  },
};