import Api, { handleApiError } from "../../config/Api";

export const getPartnersWithLosses = async () => {
  try {
    const response = await Api.get("/api/partner-loss/partners");
    return response.data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};

export const getPartnerLosses = async (page = 1, limit = 10, name = "") => {
  try {
    const params = { limit };
    if (name?.trim()) params.name = name.trim();
    const response = await Api.get(`/api/partner-loss/${page}`, { params });
    return response.data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};

export const payPartnerLoss = async (id, { amount, BankId }) => {
  try {
    const response = await Api.post(`/api/partner-loss/pay/${id}`, {
      amount: Number(amount),
      BankId: Number(BankId),
    });
    return response.data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};

export const reversePartnerLossPayment = async (id) => {
  try {
    const response = await Api.post(`/api/partner-loss/reverse/${id}`);
    return response.data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};
