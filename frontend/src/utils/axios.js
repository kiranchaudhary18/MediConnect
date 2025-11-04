import axios from 'axios'

// Use environment variables for API URL
const baseURL = `${import.meta.env.VITE_API_URL || 'https://mediconnect-sign-up-in2.onrender.com'}/api`;

console.log('Using API URL:', baseURL);

const axiosInstance = axios.create({
  baseURL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Add token to requests
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export default axiosInstance




