import Api from '../../config/Api';

export const getPeriods = async (page = 1, filters = {}) => {
  const params = new URLSearchParams();
  
  params.append('page', page.toString());
  
  if (filters.name) {
    params.append('name', filters.name);
  }
  
  if (filters.startDate) {
    params.append('startDate', filters.startDate);
  }
  
  if (filters.endDate) {
    params.append('endDate', filters.endDate);
  }
  
  if (filters.isClosed !== undefined) {
    params.append('isClosed', filters.isClosed.toString());
  }
  
  if (filters.limit) {
    params.append('limit', filters.limit.toString());
  }
  
  const queryString = params.toString();
  const response = await Api.get(`/api/periods/all/${page}${queryString ? `?${queryString}` : ''}`);
  return response.data;
};

export const getPeriodById = async (periodId) => {
  const response = await Api.get(`/api/periods/${periodId}`);
  return response.data;
};

export const closePeriod = async (periodId) => {
  const response = await Api.post(`/api/periods/${periodId}/close`);
  return response.data;
};

export const unpostClosing = async (periodId) => {
  const response = await Api.patch(`/api/periods/reverse-close/${periodId}`);
  return response.data;
};
    
export const comparePeriods = async (periodId1, periodId2) => {
  const response = await Api.post('/api/periods/compare', {
    periodId1,
    periodId2,
  });
  return response.data;
};
