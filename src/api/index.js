import apiClient from './client';

// Health endpoint - `GET /health`
export const getHealthStatus = () => apiClient.get('/health');

// API status endpoint - `GET /api/status`
export const getApiStatus = () => apiClient.get('/api/status');

// Market symbols endpoint - `GET /api/market/fully-diluted`
export const getFullyDilutedSymbols = (threshold = 85) =>
  apiClient.get(`/api/market/fully_diluted/${threshold}`);

// Market analysis endpoint - `GET /api/market/analysis`
export const getMarketAnalysis = () => apiClient.get('/api/market/analysis'); 