import Api, { handleApiError } from '../../config/Api';

// Get all journals with pagination and advanced search
export const getJournals = async (page = 1, params = {}) => {
  try {
    const { search, status, type, sourceType, postedByName, reference, description, dateFrom, dateTo } = params;

    // Build query parameters
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

// Get specific journal by ID
export const getJournalById = async (journalId) => {
  try {
    const response = await Api.get(`/api/journals/${journalId}`);
    return response.data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};

// Create new journal
export const createJournal = async (journalData) => {
  try {
    const response = await Api.post('/api/journals', journalData);
    return response.data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};

// Update journal
export const updateJournal = async (journalId, journalData) => {
  try {
    const response = await Api.put(`/api/journals/${journalId}`, journalData);
    return response.data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};

// Delete journal
export const deleteJournal = async (journalId) => {
  try {
    const response = await Api.delete(`/api/journals/${journalId}`);
    return response.data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};

// Post journal
export const postJournal = async (journalId) => {
  try {
    const response = await Api.post(`/api/journals/${journalId}/post`);
    return response.data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};

// Unpost journal
export const unpostJournal = async (journalId) => {
  try {
    const response = await Api.post(`/api/journals/${journalId}/unpost`);
    return response.data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};

// Get chart of accounts for dropdown
export const getChartOfAccounts = async () => {
  try {
    const response = await Api.get('/api/accounts/tree');
    return response.data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};