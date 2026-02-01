import axios from 'axios';
import { toast } from 'react-toastify';
import i18next from 'i18next';

const getBaseURL = () => {
    // return "http://localhost:3000";
    return "http://72.61.101.53:3003";
};

const Api = axios.create({
  baseURL: getBaseURL(),
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

let accessToken = null;

export const setAccessToken = (token) => {
  accessToken = token;
};

export const getAccessToken = () => {
  return accessToken;
};

let isRefreshing = false;
let failedQueue = [];

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
    
    const token = getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => Promise.reject(error),
);

Api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const status = error?.response?.status;
    
    // Don't retry refresh or logout endpoints
    const isAuthEndpoint = originalRequest.url?.includes('/api/auth/refresh') || 
                          originalRequest.url?.includes('/api/auth/logout');
    
    if (status === 401 && !originalRequest._retry && !isAuthEndpoint) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(token => {
            originalRequest.headers['Authorization'] = 'Bearer ' + token;
            return Api(originalRequest);
          })
          .catch(err => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const response = await Api.post('/api/auth/refresh');
        
        if (response.data && response.data.accessToken) {
          const newToken = response.data.accessToken;
          
          setAccessToken(newToken);
          
          window.dispatchEvent(new CustomEvent('tokenRefreshed', { 
            detail: { 
              accessToken: newToken,
              user: response.data.user 
            } 
          }));
          
          processQueue(null, newToken);
          
          originalRequest.headers['Authorization'] = 'Bearer ' + newToken;
          return Api(originalRequest);
        }
      } catch (refreshError) {
          processQueue(refreshError, null);
        
        setAccessToken(null);
        
        window.dispatchEvent(new Event('authFailed'));
        
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
        
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }
    
    // If it's an auth endpoint that failed, redirect to login
    if (status === 401 && isAuthEndpoint) {
      setAccessToken(null);
      window.dispatchEvent(new Event('authFailed'));
      
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
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
