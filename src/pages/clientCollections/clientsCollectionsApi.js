import Api from '../../config/Api';

// Get all clients with pagination
export const getAllClients = async (page = 1, limit = 20) => {
  const response = await Api.get(`/api/client-report/${page}?limit=${limit}`);
  return response.data;
};

// Get specific client details
export const getClientDetails = async (clientId) => {
  const response = await Api.get(`/api/client-report/client/${clientId}`);
  return response.data;
};