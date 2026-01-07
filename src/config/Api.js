import axios from 'axios'
import {toast} from 'react-toastify'
import i18next from 'i18next'

const getBaseURL = () => {
  //return "http://localhost:3000";
  return "http://72.61.101.53:3003";
};

const Api = axios.create({
  baseURL: getBaseURL(),
  headers: {
    'Content-Type': 'application/json',
  },
})

// Check if server changed and clear auth data if needed
const checkServerChange = () => {
  const currentBaseURL = getBaseURL();
  const savedBaseURL = localStorage.getItem('api_baseURL');
  
  if (savedBaseURL && savedBaseURL !== currentBaseURL) {
    // Server changed, clear all auth data
    console.warn('Server changed. Clearing authentication data...');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('profile');
    localStorage.removeItem('rememberedEmail');
    // Clear all cached permissions
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (key.startsWith('cached_permissions_') || key.startsWith('cached_permissions_timestamp_'))) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach(key => localStorage.removeItem(key));
  }
  
  // Save current base URL
  localStorage.setItem('api_baseURL', currentBaseURL);
};

// Check server change on initialization
checkServerChange();

Api.interceptors.request.use(
  (config) => {
    config.headers["Accept-Language"] = i18next.language
    config.headers["page"] = window.location.pathname.split('/').pop();
    const token = localStorage.getItem("token")
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error),
)

Api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    
    if (status === 401) {
      // Clear all auth data
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('profile');
      localStorage.removeItem('rememberedEmail');
      
      // Clear all cached permissions
      const keysToRemove = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (key.startsWith('cached_permissions_') || key.startsWith('cached_permissions_timestamp_'))) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach(key => localStorage.removeItem(key));
      
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    
    return Promise.reject(error);
  }
)

export const handleApiError = (error) => {
  try {
    const status = error?.response?.status
    const responseBody = error?.response?.data
    if (status == 500) {
      return toast.error('Unexpected Error Happen ')
    }
    if (Array.isArray(responseBody)) {
      responseBody.map((e) => toast.error(e.message))
    } else if (Array.isArray(responseBody?.message)) {
      responseBody?.message?.map((e) => toast.error(e))
    } else {
      const errorMes = responseBody?.message || responseBody?.error || responseBody
      console.log('🚀 ~ handleApiError ~ errorMes:', errorMes)
      toast.error(errorMes)
    }
  } catch (error) {
    console.log(error)
  }
}

export default Api
