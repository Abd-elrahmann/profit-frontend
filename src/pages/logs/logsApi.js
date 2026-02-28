import Api, { handleApiError } from '../../config/Api';
export const getLogs = async (page = 1, params = {}) => {
  try {
    const { search, screen, action, from, to, userName, ...otherFilters } = params;
    const queryParams = new URLSearchParams();
    queryParams.append('page', page);
    if (search) queryParams.append('search', search);
    if (screen) queryParams.append('screen', screen);
    if (action) queryParams.append('action', action);
    if (from) queryParams.append('from', from);
    if (to) queryParams.append('to', to);
    if (userName) queryParams.append('userName', userName);
    Object.entries(otherFilters).forEach(([key, value]) => {
      if (value) {
        queryParams.append(key, value);
      }
    });
    const url = `/api/logs/${page}?${queryParams.toString()}`;
    const response = await Api.get(url);
    return response.data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};
export const getAllLogsForExport = async (params = {}) => {
  try {
    const { search, screen, action, from, to, userName, ...otherFilters } = params;
    const queryParams = new URLSearchParams();
    if (search) queryParams.append('search', search);
    if (screen) queryParams.append('screen', screen);
    if (action) queryParams.append('action', action);
    if (from) queryParams.append('from', from);
    if (to) queryParams.append('to', to);
    if (userName) queryParams.append('userName', userName);
    Object.entries(otherFilters).forEach(([key, value]) => {
      if (value) {
        queryParams.append(key, value);
      }
    });
    const firstPageUrl = `/api/logs/1?${queryParams.toString()}`;
    const firstResponse = await Api.get(firstPageUrl);
    const allLogs = [...(firstResponse.data.data || [])];
    const total = firstResponse.data.total || allLogs.length;
    const limit = firstResponse.data.limit || 50;
    const totalPages = Math.ceil(total / limit);
    if (totalPages > 1) {
      for (let page = 2; page <= totalPages; page++) {
        queryParams.set('page', page);
        const pageUrl = `/api/logs/${page}?${queryParams.toString()}`;
        const pageResponse = await Api.get(pageUrl);
        allLogs.push(...(pageResponse.data.data || []));
      }
    }
    return allLogs;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};
export const deleteAllLogs = async () => {
  try {
    const response = await Api.delete('/api/logs/all');
    return response.data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};