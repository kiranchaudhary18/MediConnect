import axios from 'axios'

// Use the deployed backend URL in production, otherwise use the proxy
const baseURL = process.env.NODE_ENV === 'production' 
  ? 'https://mediconnect-sign-up-in2.onrender.com/api' 
  : '/api';

const axiosInstance = axios.create({
  baseURL,
})

// Add token to requests
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export default axiosInstance




