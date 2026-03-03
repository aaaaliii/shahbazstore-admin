import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'ngrok-skip-browser-warning': 'true',
  },
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    // Only access localStorage on client side
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('adminToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    // Don't set Content-Type for FormData, let axios set it automatically
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle token expiration and HTML responses (ngrok warnings)
api.interceptors.response.use(
  (response) => {
    // Check if response is HTML (ngrok warning page)
    if (typeof response.data === 'string' && response.data.includes('<!DOCTYPE html>')) {
      console.error('API returned HTML instead of JSON. This might be an ngrok warning page.');
      return Promise.reject(new Error('Invalid response: received HTML instead of JSON. Check ngrok configuration.'));
    }
    return response;
  },
  (error) => {
    // Check if error response is HTML
    if (error.response && typeof error.response.data === 'string' && error.response.data.includes('<!DOCTYPE html>')) {
      console.error('API error response is HTML. This might be an ngrok warning page.');
      return Promise.reject(new Error('Invalid response: received HTML instead of JSON. Check ngrok configuration.'));
    }
    
    if (error.response?.status === 401) {
      // Only access localStorage and window on client side
      if (typeof window !== 'undefined') {
        localStorage.removeItem('adminToken');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;

