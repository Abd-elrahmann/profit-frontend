import Api, { handleApiError } from "../../config/Api";

/**
 * Get paginated list of investors with filters
 */
export const getInvestors = async (page = 1, searchQuery = '', status = '', showWithdrawnOnly = false, activeStatus = '') => {
  let queryParams = new URLSearchParams();

  if (searchQuery.trim()) {
    if (/^\d+$/.test(searchQuery.trim())) {
      queryParams.append('nationalId', searchQuery.trim());
    } else {
      queryParams.append('name', searchQuery.trim());
    }
  }

  if (status.trim()) {
    if (status.trim() === 'قديم') {
      queryParams.append('isNewPartner', 'false');
    } else if (status.trim() === 'جديد') {
      queryParams.append('isNewPartner', 'true');
    } else if (status.trim() === 'منسحب') {
      queryParams.append('withdrawingStatus', 'WITHDRAWING,WITHDRAWN');
    }
  }

  if (activeStatus.trim()) {  
    if (activeStatus.trim() === 'نشط') {
      queryParams.append('isActive', 'true');
    } else if (activeStatus.trim() === 'غير نشط') {
      queryParams.append('isActive', 'false');
    }
  }

  if (showWithdrawnOnly) {
    queryParams.append('withdrawingStatus', 'WITHDRAWING,WITHDRAWN');
  }

  queryParams.append('limit', '10');

  const queryString = queryParams.toString();
  const url = `/api/partners/all/${page}${queryString ? `?${queryString}` : ''}`;

  const response = await Api.get(url);
  return response.data;
};

/**
 * Get detailed partner information for export
 */
export const getPartnerDetailsForExport = async (partnerId) => {
  try {
    const response = await Api.get(`/api/partner-report/partner/${partnerId}`);
    return response.data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};

/**
 * Get investor details by ID
 */
export const getInvestorDetails = async (investorId) => {
  const response = await Api.get(`/api/partners/${investorId}`);
  return response.data;
};

/**
 * Get partner transactions with pagination
 */
export const getPartnerTransactions = async (partnerId, page = 1) => {
  const response = await Api.get(`/api/partners/transaction/${partnerId}/${page}`);
  return response.data;
};

/**
 * Create a new partner transaction
 */
export const createPartnerTransaction = async (partnerId, transactionData) => {
  const response = await Api.post(`/api/partners/transaction/${partnerId}`, transactionData);
  return response.data;
};

/**
 * Delete a partner transaction
 */
export const deletePartnerTransaction = async (transactionId) => {
  const response = await Api.delete(`/api/partners/transaction/${transactionId}`);
  return response.data;
};

/**
 * Update investor details
 */
export const updateInvestor = async (investorId, data) => {
  const response = await Api.patch(`/api/partners/${investorId}`, data);
  return response.data;
};

/**
 * Delete an investor
 */
export const deleteInvestor = async (investorId) => {
  const response = await Api.delete(`/api/partners/${investorId}`);
  return response.data;
};

/**
 * Get Mudarabah template
 */
export const getMudarabahTemplate = async () => {
  const response = await Api.get('/api/templates/mudarabah');
  return response.data;
};

/**
 * Get withdrawal preview data
 */
export const getWithdrawalPreview = async (partnerId) => {
  const response = await Api.get(`/api/partner-withdraw/preview/${partnerId}`);
  return response.data;
};

/**
 * Create partner withdrawal
 */
export const createPartnerWithdrawal = async (partnerId, amount) => {
  const response = await Api.post(`/api/partner-withdraw/${partnerId}`, {
    amount: parseFloat(amount)
  });
  return response.data;
};

/**
 * Update partner withdrawal amount
 */
export const updatePartnerWithdrawal = async (partnerId, amount) => {
  const response = await Api.patch(`/api/partner-withdraw/${partnerId}`, {
    amount: parseFloat(amount)
  });
  return response.data;
};
