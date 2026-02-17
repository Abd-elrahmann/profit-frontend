import Api, { handleApiError } from '../../config/Api';

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

export const createLoan = async (loanData) => {
  try {
    const response = await Api.post('/api/loans', loanData);
    return response.data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};

export const updateLoan = async (loanId, loanData) => {
  try {
    const response = await Api.patch(`/api/loans/${loanId}`, loanData);
    return response.data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};

export const activateLoan = async (loanId) => {
  try {
    const response = await Api.patch(`/api/loans/${loanId}/activate`);
    return response.data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};

export const deactivateLoan = async (loanId) => {
  try {
    const response = await Api.patch(`/api/loans/${loanId}/deactivate`);
    return response.data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};

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

export const deleteLoan = async (loanId) => {
  try {
    const response = await Api.delete(`/api/loans/${loanId}`);
    return response.data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};

export const createSmallLoan = async (smallLoanData) => {
  try {
    const response = await Api.post('/api/small-loans', smallLoanData);
    return response.data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};

export const paySmallLoan = async (loanId, paymentData) => {
  try {
    const response = await Api.post(`/api/small-loans/pay/${loanId}`, paymentData);
    return response.data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};

export const updateSmallLoan = async (loanId, updateData) => {
  try {
    const response = await Api.patch(`/api/small-loans/${loanId}`, updateData);
    return response.data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};

export const getUnpostedSmallLoanJournals = async () => {
  try {
    const response = await Api.get('/api/small-loans/unposted-journals');
    return response.data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};

export const getUnpostedLoanJournals = async () => {
  try {
    const response = await Api.get('/api/loans/get/unposted-journals');
    return response.data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};

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

export const deleteSmallLoan = async (loanId) => {
  try {
    const response = await Api.delete(`/api/small-loans/${loanId}`);
    return response.data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};

export const convertLoanClient = async (fromClientId, toClientId, loanId, kafeelId, paymentAmount, repaymentDay) => {
  try {
    const response = await Api.patch(`/api/loans/convert-client/${loanId}`, {
      fromClientId: String(fromClientId),
      toClientId: String(toClientId),
      kafeelId: kafeelId ? String(kafeelId) : null,
      paymentAmount: paymentAmount ? Number(paymentAmount) : null,
      repaymentDay: repaymentDay || null,
    });
    return response.data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};
  
export const transferPartialLoanAmount = async (fromClientId, toClientId, loanId, amount, kafeelId, paymentAmount, repaymentDay) => {
  try {
    const response = await Api.patch(`/api/loans/convert-partial/${loanId}`, {
      fromClientId: Number(fromClientId),
      toClientId: Number(toClientId),
      kafeelId: kafeelId ? Number(kafeelId) : null,
      amount: Number(amount),
      paymentAmount: paymentAmount ? Number(paymentAmount) : null,
      repaymentDay: repaymentDay || null,
    });
    return response.data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};