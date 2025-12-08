import Api from '../../config/Api';

// Get all clients with pagination and optional status filter
export const getAllClients = async (page = 1, limit = 20, status = null) => {
  let url = `/api/client-report/${page}?limit=${limit}`;
  if (status) {
    url += `&status=${status}`;
  }
  const response = await Api.get(url);
  return response.data;
};

// Get specific client details
export const getClientDetails = async (clientId) => {
  const response = await Api.get(`/api/client-report/client/${clientId}`);
  return response.data;
};

// Update client note
export const updateClientNote = async (clientId, note) => {
  const response = await Api.patch(`/api/client-report/client/${clientId}/note`, { note });
  return response.data;
};