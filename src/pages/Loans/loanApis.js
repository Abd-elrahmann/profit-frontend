import Api, { handleApiError } from '../../config/Api';

// Get clients with pagination and search
export const getClients = async (page = 1, search = '') => {
  try {
    const url = search 
      ? `/api/clients/all/${page}?search=${encodeURIComponent(search)}`
      : `/api/clients/all/${page}`;
    const response = await Api.get(url);
    return response.data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};

// Get partners with pagination and search
export const getPartners = async (page = 1, search = '') => {
  try {
    const url = search
      ? `/api/partners/all/${page}?search=${encodeURIComponent(search)}`
      : `/api/partners/all/${page}`;
    const response = await Api.get(url);
    return response.data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};

// Create new loan
export const createLoan = async (loanData) => {
  try {
    const response = await Api.post('/api/loans', loanData);
    return response.data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};

// Update loan
export const updateLoan = async (loanId, loanData) => {
  try {
    const response = await Api.patch(`/api/loans/${loanId}`, loanData);
    return response.data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};

// Activate loan
export const activateLoan = async (loanId) => {
  try {
    const response = await Api.patch(`/api/loans/${loanId}/activate`);
    return response.data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};

// Get all loans with pagination
export const getLoans = async (page = 1, search = '') => {
  try {
    const url = search 
      ? `/api/loans/all/${page}?search=${encodeURIComponent(search)}`
      : `/api/loans/all/${page}`;
    const response = await Api.get(url);
    return response.data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};

// Get loan by ID
export const getLoanById = async (loanId) => {
  try {
    const response = await Api.get(`/api/loans/${loanId}`);
    return response.data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};

// Delete loan
export const deleteLoan = async (loanId) => {
  try {
    const response = await Api.delete(`/api/loans/${loanId}`);
    return response.data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};