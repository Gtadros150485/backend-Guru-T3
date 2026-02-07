import axios, {type InternalAxiosRequestConfig } from 'axios';

// Get API URL from environment variable
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || `${API_URL}/api/v1`;

// Create axios instance with base URL
export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor for auth token
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('access_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: unknown) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error: unknown) => {
    // Проверяем, является ли error объектом AxiosError
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      // Handle unauthorized - redirect to login
      localStorage.removeItem('access_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Helper function to get full URL
export const getApiUrl = (path: string) => {
  return `${API_BASE_URL}${path}`;
};

// Environment helpers
export const isDevelopment = import.meta.env.DEV;
export const isProduction = import.meta.env.PROD;
export const apiUrl = API_URL;
export const apiBaseUrl = API_BASE_URL;