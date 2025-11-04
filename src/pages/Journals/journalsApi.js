import Api, { handleApiError } from '../../config/Api';

// Get all journals with pagination
export const getJournals = async (page = 1, search = '') => {
  try {
    const url = search 
      ? `/api/journals/all/${page}?search=${encodeURIComponent(search)}`
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

// Update journal
export const updateJournal = async (journalId, journalData) => {
  try {
    const response = await Api.patch(`/api/journals/${journalId}`, journalData);
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