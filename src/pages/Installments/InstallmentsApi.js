import Api, { handleApiError } from '../../config/Api';

export const decodePaymentToken = async (token) => {
  try {
    const response = await Api.post('/api/notifications/decode-token', { token });
    return response.data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};

export const getLoanById = async (loanId, page = 1, limit = 10) => {
  try {
    const response = await Api.get(`/api/loans/${loanId}/${page}?limit=${limit}`);
    return response.data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};

export const getRepaymentById = async (repaymentId) => {
  try {
    const response = await Api.get(`/api/repayments/repayment/${repaymentId}`);
    return response.data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};

export const uploadAttachment = async (installmentId, files) => {
  try {
    const formData = new FormData();
    
    files.forEach((file) => {
      formData.append(`file`, file);
    });
    
    const response = await Api.post(`/api/repayments/upload/${installmentId}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};

export const uploadPaymentProof = async (installmentId, file) => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await Api.post(`/api/repayments/PaymentProof/${installmentId}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};

export const approveRepayment = async (installmentId, amount, reason, discount = 0) => {
  try {
    const response = await Api.patch(`/api/repayments/approve/${installmentId}`, {
      paidAmount: amount,
      notes: reason,
      discount: discount
    });
    return response.data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};

export const rejectRepayment = async (installmentId) => {
  try {
    const response = await Api.patch(`/api/repayments/reject/${installmentId}`);
    return response.data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};

export const postponeRepayment = async (installmentId, newDueDate, reason) => {
  try {
    const response = await Api.patch(`/api/repayments/postpone/${installmentId}`, {
      newDueDate,
      reason
    });
    return response.data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};

export const markAsPartialPaid = async (installmentId, paidAmount) => {
  try {
    const response = await Api.patch(`/api/repayments/partial-paid/${installmentId}`, {
      paidAmount
    });
    return response.data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};

export const earlyPayment = async (loanId, discount = 0) => {
  try {
    const response = await Api.patch(`/api/repayments/early-pay/${loanId}`, {
      discount: parseFloat(discount) || 0
    });
    return response.data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};

export const approveMultipleRepayments = async (repaymentIds, reason) => {
  try {
    const response = await Api.post('/api/repayments/approve-many', {
      ids: repaymentIds,
      reason
    });
    return response.data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};

export const rejectMultipleRepayments = async (repaymentIds) => {
  try {
    const response = await Api.post('/api/repayments/reject-many', {
      ids: repaymentIds
    });
    return response.data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};