import axios from 'axios';

// Reusable Axios instance with base backend URL
const api = axios.create({
  baseURL: 'http://localhost:5000/api/v1',
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: true // Support HTTP-Only cookies if preferred
});

// Request interceptor to dynamically inject the JWT bearer token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to intercept unauthenticated/unauthorized responses
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // If the token is invalid or expired (401), clean up local storage and redirect if necessary
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Proactively clear window auth state if desired
    }
    return Promise.reject(error);
  }
);

export default api;
