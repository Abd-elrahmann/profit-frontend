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

  getAccountingPeriods: async (companyId = 1, page = 1) => {
    try {
      const response = await Api.get(`/api/periods/all/${companyId}?page=${page}`);
      return response.data.periods || [];
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  },
};