import Api, { handleApiError } from '../../config/Api';

export const getWithdrawingInvestors = async (page = 1) => {
  try {
    const response = await Api.get(`/api/partner-withdraw/all-withdrawing/${page}?limit=10`);
    return response.data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};

export const getWithdrawalDetails = async (partnerId) => {
  try {
    const response = await Api.get(`/api/partner-withdraw/details/${partnerId}`);
    return response.data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};

export const approveWithdrawal = async (scheduleId) => {
  try {
    const response = await Api.post(`/api/partner-withdraw/approve/${scheduleId}`);
    return response.data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};

export const rejectWithdrawal = async (scheduleId) => {
  try {
    const response = await Api.post(`/api/partner-withdraw/reject/${scheduleId}`);
    return response.data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};

export const partialPayWithdrawal = async (scheduleId, paidAmount) => {
  try {
    const response = await Api.post(`/api/partner-withdraw/partial/${scheduleId}`, {
      paidAmount,
    });
    return response.data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};

export const uploadWithdrawalReceipt = async (withdrawalId, formData) => {
  try {
    const response = await Api.post(
      `/api/partner-withdraw/upload-receipt/${withdrawalId}`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};