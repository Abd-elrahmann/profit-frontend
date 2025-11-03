import Api, { handleApiError } from '../../config/Api';

// Get loan by ID with installments
export const getLoanById = async (loanId) => {
  try {
    const response = await Api.get(`/api/loans/${loanId}`);
    return response.data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};

// Get repayment by ID
export const getRepaymentById = async (repaymentId) => {
  try {
    const response = await Api.get(`/api/repayments/repayment/${repaymentId}`);
    return response.data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};

// Upload payment proof
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

// Upload payment proof
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

// Approve repayment
export const approveRepayment = async (installmentId, amount, reason) => {
  try {
    const response = await Api.patch(`/api/repayments/approve/${installmentId}`, {
      amount,
      reason
    });
    return response.data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};

// Reject repayment
export const rejectRepayment = async (installmentId) => {
  try {
    const response = await Api.patch(`/api/repayments/reject/${installmentId}`);
    return response.data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};

// Postpone repayment
export const postponeRepayment = async (installmentId) => {
  try {
    const response = await Api.patch(`/api/repayments/postpone/${installmentId}`);
    return response.data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};

