import Api, { handleApiError } from '../../config/Api';

// Get banks with pagination and search
export const getBanks = async (page = 1, search = '') => {
  try {
    const url = search 
      ? `/api/bank/all/${page}?search=${encodeURIComponent(search)}`
      : `/api/bank/all/${page}`;
    const response = await Api.get(url);
    return response.data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};

// Create new bank account
export const createBank = async (bankData) => {
  try {
    const response = await Api.post('/api/bank', bankData);
    return response.data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};

// Update bank account
export const updateBank = async (bankId, bankData) => {
  try {
    const response = await Api.patch(`/api/bank/${bankId}`, bankData);
    return response.data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};

// Delete bank account
export const deleteBank = async (bankId) => {
  try {
    const response = await Api.delete(`/api/bank/${bankId}`);
    return response.data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};

// Get all banks for dropdown (without pagination)
export const getBankById = async (bankId) => {
  try {
    const response = await Api.get(`/api/bank/${bankId}`);
    return response.data;
  } catch (error) {
      handleApiError(error);
      throw error;
    }
  };