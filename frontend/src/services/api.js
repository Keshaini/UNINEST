import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api",
});

// Add token to requests
API.interceptors.request.use((config) => {
  let adminToken = localStorage.getItem('adminToken');
  let userToken = localStorage.getItem('token');
  
  if (adminToken === 'null' || adminToken === 'undefined') adminToken = null;
  if (userToken === 'null' || userToken === 'undefined') userToken = null;
  
  const token = adminToken || userToken;

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  } else {
    // If we're fully missing a token but need one, redirect to login might be needed, but we let backend send 401.
  }

  return config;
});

// Handle response errors
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.error('❌ 401 Unauthorized error detected');
      console.error('  - Response:', error.response?.data);
      console.error('  - Request headers:', error.config?.headers);
    }
    return Promise.reject(error);
  }
);

export default API;