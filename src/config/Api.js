
import axios from 'axios';
import { toast } from 'react-toastify';
import i18next from 'i18next';

const getBaseURL = () => {
  //return "http://localhost:3000";
  return "http://72.61.101.53:3003";
};

const Api = axios.create({
  baseURL: getBaseURL(),
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});


let isRefreshing = false;
let failedQueue = [];
let lastRefreshFailTime = 0;

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};

Api.interceptors.request.use(
  (config) => {
    config.headers["Accept-Language"] = i18next.language;
    config.headers["page"] = window.location.pathname.split('/').pop();



    return config;
  },
  (error) => Promise.reject(error),
);

Api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const status = error?.response?.status;

    if (status === 401 && !originalRequest._retry) {
      if (window.location.pathname === '/login') {
        return Promise.reject(error);
      }

      if (originalRequest.url?.includes('/api/auth/refresh')) {
        console.warn('❌ Refresh endpoint failed:', error?.response?.data?.message || error.message);
        lastRefreshFailTime = Date.now();
        window.dispatchEvent(new Event('authFailed'));
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }

      const now = Date.now();
      if (lastRefreshFailTime && (now - lastRefreshFailTime) < 3000) {
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
        return Promise.reject(new Error('Recent refresh failed'));
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          const timeoutId = setTimeout(() => {
            const index = failedQueue.findIndex(p => p.reject === reject);
            if (index > -1) {
              failedQueue.splice(index, 1);
            }
            reject(new Error('Request queue timeout'));
          }, 8000);

          failedQueue.push({
            resolve: (token) => {
              clearTimeout(timeoutId);
              resolve(token);
            },
            reject: (err) => {
              clearTimeout(timeoutId);
              reject(err);
            }
          });
        })
          .then(() => {
            return Api(originalRequest);
          })
          .catch(err => {
            if (err.message === 'Request queue timeout') {
              window.dispatchEvent(new Event('authFailed'));
              if (window.location.pathname !== '/login') {
                window.location.href = '/login';
              }
            }
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const REFRESH_TIMEOUT_MS = 5000;

      try {
        const response = await Promise.race([
          Api.post('/api/auth/refresh'),
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Refresh token timeout')), REFRESH_TIMEOUT_MS)
          ),
        ]);

        if (response.data && response.data.user) {
          window.dispatchEvent(new CustomEvent('tokenRefreshed', {
            detail: {
              user: response.data.user
            }
          }));

          processQueue(null, true);

          return Api(originalRequest);
        }
      } catch (refreshError) {
        lastRefreshFailTime = Date.now();
        processQueue(refreshError, null);

        window.dispatchEvent(new Event('authFailed'));

        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }

        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export const handleApiError = (error) => {
  try {
    const status = error?.response?.status;
    const responseBody = error?.response?.data;

    if (status === 500) {
      return toast.error('Unexpected Error Happen');
    }

    if (Array.isArray(responseBody)) {
      responseBody.map((e) => toast.error(e.message));
    } else if (Array.isArray(responseBody?.message)) {
      responseBody?.message?.map((e) => toast.error(e));
    } else {
      const errorMes = responseBody?.message || responseBody?.error || responseBody;
      console.log('🚀 ~ handleApiError ~ errorMes:', errorMes);
      toast.error(errorMes);
    }
  } catch (error) {
    console.log(error);
  }
};

export default Api;