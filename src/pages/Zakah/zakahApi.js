import Api from '../../config/Api';

// Get zakah by year with pagination
export const getZakahByYear = async (year, page = 1, limit = 10) => {
  const response = await Api.get(`/api/zakat/year/${year}?page=${page}&limit=${limit}`);
  return response.data;
};

// Get partner zakah details
export const getPartnerZakah = async (partnerId) => {
  const response = await Api.get(`/api/zakat/partner/${partnerId}`);
  return response.data;
};