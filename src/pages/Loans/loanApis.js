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

// Deactivate loan
export const deactivateLoan = async (loanId) => {
  try {
    const response = await Api.patch(`/api/loans/${loanId}/deactivate`);
    return response.data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};

// Get all loans with pagination and limit
export const getLoans = async (page = 1, search = '', limit = 15, status = null) => {
  try {
    const params = new URLSearchParams();
    params.append('limit', limit);
    if (search) params.append('clientName', search);
    if (status) params.append('status', status);
    const query = params.toString();
    const url = `/api/loans/all/${page}${query ? `?${query}` : ''}`;
    const response = await Api.get(url);
    return response.data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};

// Get loan by ID (supports optional pagination for repayments)
export const getLoanById = async (loanId, page, limit) => {
  try {
    const params = new URLSearchParams();
    if (page) params.append('page', page);
    if (limit) params.append('limit', limit);
    const query = params.toString();
    const url = query ? `/api/loans/${loanId}?${query}` : `/api/loans/${loanId}`;

    const response = await Api.get(url);
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

// Small Loans API functions

// Create small loan
export const createSmallLoan = async (smallLoanData) => {
  try {
    const response = await Api.post('/api/small-loans', smallLoanData);
    return response.data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};

// Pay small loan
export const paySmallLoan = async (loanId, paymentData) => {
  try {
    const response = await Api.post(`/api/small-loans/pay/${loanId}`, paymentData);
    return response.data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};

// Update small loan
export const updateSmallLoan = async (loanId, updateData) => {
  try {
    const response = await Api.patch(`/api/small-loans/${loanId}`, updateData);
    return response.data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};

// Get small loans with pagination
export const getSmallLoans = async (page = 1, search = '', limit = 20) => {
  try {
    const params = new URLSearchParams();
    params.append('limit', limit);
    if (search) params.append('clientName', search);
    const query = params.toString();
    const url = `/api/small-loans/${page}${query ? `?${query}` : ''}`;
    const response = await Api.get(url);
    return response.data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};

// Delete small loan
export const deleteSmallLoan = async (loanId) => {
  try {
    const response = await Api.delete(`/api/small-loans/${loanId}`);
    return response.data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};

// Convert loan client
export const convertLoanClient = async (fromClientId, toClientId, loanId, kafeelId) => {
  try {
    const response = await Api.patch(`/api/loans/convert-client/${loanId}`, {
      fromClientId: String(fromClientId),
      toClientId: String(toClientId),
      kafeelId: kafeelId ? String(kafeelId) : null,
    });
    return response.data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};

// Transfer partial loan amount to another client
export const transferPartialLoanAmount = async (fromClientId, toClientId, loanId, amount, kafeelId) => {
  try {
    const response = await Api.patch(`/api/loans/convert-partial/${loanId}`, {
      fromClientId: Number(fromClientId),
      toClientId: Number(toClientId),
      kafeelId: kafeelId ? Number(kafeelId) : null,
      amount: Number(amount),
    });
    return response.data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};