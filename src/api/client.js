import axios from 'axios';

// Centralised Axios instance for all API requests.
// The base URL can be overridden via the environment variable `REACT_APP_API_BASE_URL`
const apiClient = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Function to set JWT auth token
export const setAuthToken = (token) => {
  if (token) {
    apiClient.defaults.headers.Authorization = `Bearer ${token}`;
  } else {
    delete apiClient.defaults.headers.Authorization;
  }
};

// Function to get stored token
export const getStoredToken = () => {
  try {
    const storageKey = process.env.REACT_APP_TOKEN_STORAGE_KEY || 'market-scanner-auth';
    const authData = localStorage.getItem(storageKey);
    if (authData) {
      const parsed = JSON.parse(authData);
      return parsed.access_token;
    }
  } catch (error) {
    console.error('Error parsing stored auth:', error);
  }
  return null;
};

// Set token on app load if available
const storedToken = getStoredToken();
if (storedToken) {
  setAuthToken(storedToken);
}

// Add response interceptor to handle authentication errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear auth token and redirect to login
      setAuthToken(null);
      const storageKey = process.env.REACT_APP_TOKEN_STORAGE_KEY || 'market-scanner-auth';
      localStorage.removeItem(storageKey);
      
      // Only redirect if auto logout is enabled
      const autoLogout = process.env.REACT_APP_AUTO_LOGOUT_ON_TOKEN_EXPIRE !== 'false';
      if (autoLogout && window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient; 