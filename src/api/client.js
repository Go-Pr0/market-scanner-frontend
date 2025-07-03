import axios from 'axios';

// Centralised Axios instance for all API requests.
// The base URL can be overridden via the environment variable `REACT_APP_API_BASE_URL`
const apiClient = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000',
  timeout: 10000, // 10 seconds timeout for all requests
});

export default apiClient; 