import axios from 'axios';
import { parseError } from './ErrorHandler';

// Base URLs for different services
export const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8082/api';
export const AUTH_SERVICE_URL = process.env.REACT_APP_AUTH_SERVICE_URL || 'http://localhost:8081/api/auth';
export const ANALYSIS_SERVICE_URL = process.env.REACT_APP_ANALYSIS_SERVICE_URL || 'http://localhost:8000/api';
export const AUDIT_SERVICE_URL = process.env.REACT_APP_AUDIT_SERVICE_URL || 'http://localhost:8082/api/audit';

// Create axios instances for different services
export const backendApi = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

export const authApi = axios.create({
  baseURL: AUTH_SERVICE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

export const analysisApi = axios.create({
  baseURL: ANALYSIS_SERVICE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

export const auditApi = axios.create({
  baseURL: AUDIT_SERVICE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// Setup authentication token
export const setAuthToken = (token) => {
  if (token) {
    backendApi.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    authApi.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    analysisApi.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    auditApi.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete backendApi.defaults.headers.common['Authorization'];
    delete authApi.defaults.headers.common['Authorization'];
    delete analysisApi.defaults.headers.common['Authorization'];
    delete auditApi.defaults.headers.common['Authorization'];
  }
};

// Initialize authentication from localStorage
export const initializeAuth = () => {
  const user = JSON.parse(localStorage.getItem('user'));
  if (user && user.token) {
    setAuthToken(user.token);
  }
};

// Setup response interceptors for all API instances
const setupInterceptors = (apiInstance) => {
  apiInstance.interceptors.response.use(
    (response) => response,
    async (error) => {
      const parsedError = parseError(error);
      
      // Handle token expiration
      if (parsedError.status === 401 && !error.config.url.includes('refreshtoken')) {
        // Clear auth data and redirect to login
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
      
      return Promise.reject(parsedError);
    }
  );
};

// Setup interceptors for all instances
setupInterceptors(backendApi);
setupInterceptors(authApi);
setupInterceptors(analysisApi);
setupInterceptors(auditApi);

// Initialize auth on import
initializeAuth();

export default {
  backendApi,
  authApi,
  analysisApi,
  auditApi,
  setAuthToken,
  initializeAuth
}; 