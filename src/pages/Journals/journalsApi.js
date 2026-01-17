import Api, { handleApiError } from '../../config/Api';

export const getJournals = async (page = 1, params = {}) => {
  try {
    const { search, status, type, sourceType, postedByName, reference, description, dateFrom, dateTo } = params;

    const queryParams = new URLSearchParams();

    if (search) queryParams.append('search', search);
    if (status) queryParams.append('status', status);
    if (type) queryParams.append('type', type);
    if (sourceType) queryParams.append('sourceType', sourceType);
    if (postedByName) queryParams.append('postedByName', postedByName);
    if (reference) queryParams.append('reference', reference);
    if (description) queryParams.append('description', description);
    if (dateFrom) queryParams.append('dateFrom', dateFrom);
    if (dateTo) queryParams.append('dateTo', dateTo);

    const queryString = queryParams.toString();
    const url = queryString
      ? `/api/journals/all/${page}?${queryString}`
      : `/api/journals/all/${page}`;

    const response = await Api.get(url);
    return response.data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};

export const getJournalById = async (journalId) => {
  try {
    const response = await Api.get(`/api/journals/${journalId}`);
    return response.data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};

export const createJournal = async (journalData) => {
  try {
    const response = await Api.post('/api/journals', journalData);
    return response.data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};

export const updateJournal = async (journalId, journalData) => {
  try {
    const response = await Api.put(`/api/journals/${journalId}`, journalData);
    return response.data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};

export const deleteJournal = async (journalId) => {
  try {
    const response = await Api.delete(`/api/journals/${journalId}`);
    return response.data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};

export const postJournal = async (journalId) => {
  try {
    const response = await Api.post(`/api/journals/${journalId}/post`);
    return response.data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};

export const unpostJournal = async (journalId) => {
  try {
    const response = await Api.post(`/api/journals/${journalId}/unpost`);
    return response.data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};

export const postMultipleJournals = async (journalIds) => {
  try {
    const response = await Api.post('/api/journals/post-multiple', { ids: journalIds });
    return response.data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};

export const unpostMultipleJournals = async (journalIds) => {
  try {
    const response = await Api.post('/api/journals/unpost-multiple', { ids: journalIds });
    return response.data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};

export const getChartOfAccounts = async () => {
  try {
    const response = await Api.get('/api/accounts/tree');
    return response.data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};

export const checkUnpostedOpeningJournals = async () => {
  try {
    const response = await Api.get('/api/journals/check-opening-journals');
    return response.data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};