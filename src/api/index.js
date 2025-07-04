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

// TrendSpider EMA Scanner API endpoints
export const runEmaScan = (scanRequest) =>
  apiClient.post('/trendspider/scan', scanRequest, { timeout: 60000 });

export const runEmaScanCsv = (scanRequest) =>
  apiClient.post('/trendspider/scan/csv', scanRequest, { responseType: 'blob', timeout: 60000 });

export const getConfigurations = (userConfigs = true) => 
  apiClient.get('/trendspider/configurations', { params: { user_configs: userConfigs } });

export const createConfiguration = (configData) => 
  apiClient.post('/trendspider/configurations', configData);

export const getConfiguration = (configName) => 
  apiClient.get(`/trendspider/configurations/${configName}`);

export const updateConfiguration = (configName, configData) => 
  apiClient.put(`/trendspider/configurations/${configName}`, configData);

export const deleteConfiguration = (configName) => 
  apiClient.delete(`/trendspider/configurations/${configName}`);

export const getActiveConfiguration = () => 
  apiClient.get('/trendspider/configurations/active/current');

export const setActiveConfiguration = (configName) => 
  apiClient.post('/trendspider/configurations/active/set', { config_name: configName });

export const getAvailableSymbols = () => 
  apiClient.get('/trendspider/symbols');

export const getAvailableTimeframes = () => 
  apiClient.get('/trendspider/timeframes'); 

// Trade Planning System API endpoints
export const generateTradeQuestions = (answered) =>
  apiClient.post('/api/questions/generate', { answered });

export const advisorChatMessage = (payload) =>
  apiClient.post('/api/chat/advisor', payload); 