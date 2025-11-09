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