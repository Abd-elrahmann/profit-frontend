import Api from '../../config/Api';

// Get all periods with filters
export const getPeriods = async (page = 1, filters = {}) => {
  const params = new URLSearchParams();
  
  // Add page parameter
  params.append('page', page.toString());
  
  // Add filter parameters
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

// Get period by ID
export const getPeriodById = async (periodId) => {
  const response = await Api.get(`/api/periods/${periodId}`);
  return response.data;
};

// Close period
export const closePeriod = async (periodId) => {
  const response = await Api.post(`/api/periods/${periodId}/close`);
  return response.data;
};

// Unpost closing (reverse close)
export const unpostClosing = async (periodId) => {
  const response = await Api.patch(`/api/periods/reverse-close/${periodId}`);
  return response.data;
};