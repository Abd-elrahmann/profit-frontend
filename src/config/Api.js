import axios from 'axios'
import {toast} from 'react-toastify'
import i18next from 'i18next'
const Api = axios.create({
  baseURL: "http://localhost:3000",
  // baseURL: "http://72.61.101.53:3012",
  headers: {
    'Content-Type': 'application/json',
  },
  
})

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

// Response interceptor to handle authentication errors
Api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    
    // If unauthorized or token expired
    if (status === 401) {
      // Clear all auth data
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('profile');
      
      // Redirect to login if not already there
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
