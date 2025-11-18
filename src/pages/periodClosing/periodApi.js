import Api from '../../config/Api';

// Get all periods
export const getPeriods = async (page = 1, searchQuery = '') => {
  const params = new URLSearchParams();
  if (searchQuery) {
    params.append('search', searchQuery);
  }
  params.append('limit', '10');
  
  const response = await Api.get(`/api/periods/all/${page}${params.toString() ? `?${params.toString()}` : ''}`);
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