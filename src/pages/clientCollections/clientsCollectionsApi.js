import Api from '../../config/Api';
export const getAllClients = async (page = 1, limit = 20, status = null) => {
  let url = `/api/client-report/${page}?limit=${limit}`;
  if (status) {
    url += `&status=${status}`;
  }
  const response = await Api.get(url);
  return response.data;
};