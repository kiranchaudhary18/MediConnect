import axios from 'axios';

// Use environment variables for API URL
const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
// Ensure the baseURL doesn't end with a slash to prevent double slashes
const baseURL = apiUrl.endsWith('/') ? `${apiUrl}api` : `${apiUrl}/api`;

console.log('Using API URL:', baseURL);

const axiosInstance = axios.create({
  baseURL,
  withCredentials: true,
  timeout: 30000, // 30 seconds timeout
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Request interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
axiosInstance.interceptors.response.use(
  (response) => {
    // Only log successful API calls (not including auth endpoints)
    if (!response.config.url.includes('/auth/')) {
      console.log(`API Success: ${response.config.method.toUpperCase()} ${response.config.url}`);
    }
    return response;
  },
  (error) => {
    if (error.response) {
      // Log error status and URL without sensitive data
      console.error(`API Error: ${error.config.method.toUpperCase()} ${error.config.url} - ${error.response.status}`);
    } else if (error.request) {
      console.error('API Error: No response received from server');
    } else {
      console.error('API Error:', error.message);
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;




