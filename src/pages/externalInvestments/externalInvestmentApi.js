import Api, { handleApiError } from '../../config/Api';

const base = '/api/external-investments';

/**
 * @param {number} page
 * @param {object} [opts]
 * @param {number} [opts.limit]
 * @param {number} [opts.bankAccountId]
 * @param {string} [opts.fromDate] YYYY-MM-DD
 * @param {string} [opts.toDate] YYYY-MM-DD
 * @param {'OPEN'|'CLOSED'} [opts.status]
 */
export const getExternalInvestments = async (page = 1, opts = {}) => {
  try {
    const params = new URLSearchParams();
    if (opts.limit) params.set('limit', String(opts.limit));
    if (opts.bankAccountId) params.set('bankAccountId', String(opts.bankAccountId));
    if (opts.fromDate) params.set('fromDate', `${opts.fromDate}T00:00:00.000Z`);
    if (opts.toDate) params.set('toDate', `${opts.toDate}T23:59:59.999Z`);
    if (opts.status) params.set('status', opts.status);
    const q = params.toString();
    const url = q ? `${base}/all/${page}?${q}` : `${base}/all/${page}`;
    const response = await Api.get(url);
    return response.data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};

export const getExternalInvestmentById = async (id) => {
  try {
    const response = await Api.get(`${base}/${id}`);
    return response.data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};

/** Body: { amount: number, BankId: number } — يطابق الـ controller */
export const withdrawExternalInvestment = async (body) => {
  try {
    const response = await Api.post(`${base}/withdraw`, body);
    return response.data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};

/** Body: { amount: number } — المبلغ المُرجع الكامل (يشمل الربح) */
export const returnExternalInvestment = async (id, body) => {
  try {
    const response = await Api.post(`${base}/return/${id}`, body);
    return response.data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};

export const distributeExternalProfit = async (id) => {
  try {
    const response = await Api.patch(`${base}/distribute/${id}`);
    return response.data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};

export const reverseExternalDistribution = async (id) => {
  try {
    const response = await Api.patch(`${base}/reverse-distribution/${id}`);
    return response.data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};

export const deleteExternalInvestment = async (id) => {
  try {
    const response = await Api.delete(`${base}/${id}`);
    return response.data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};

/** قائمة الحسابات للفلتر/النماذج — صلاحية banks_View مطلوبة */
export const getBanksForExternalInvestments = async () => {
  try {
    const response = await Api.get('/api/bank/all/1?limit=500');
    return response.data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};
