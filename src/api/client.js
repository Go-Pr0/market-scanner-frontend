import axios from 'axios';

// Centralised Axios instance for all API requests.
// The base URL can be overridden via the environment variable `REACT_APP_API_BASE_URL`
const apiClient = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000',
});

export const setAuthToken = (token) => {
  if (token) {
    apiClient.defaults.headers.common['X-Access-Token'] = token;
  } else {
    delete apiClient.defaults.headers.common['X-Access-Token'];
  }
};

// Attach token from env if available (build-time)
if (process.env.REACT_APP_ACCESS_PASSWORD) {
  apiClient.defaults.headers.common['X-Access-Token'] = process.env.REACT_APP_ACCESS_PASSWORD;
}

// Add response interceptor to handle authentication errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 403) {
      setAuthToken(null);
      localStorage.removeItem('market-scanner-auth');
      window.location.href = '/verify';
    }
    return Promise.reject(error);
  }
);

export default apiClient; 