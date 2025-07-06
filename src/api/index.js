import apiClient from './client';

// Health endpoint - `GET /health`
export const getHealthStatus = () => apiClient.get('/health');

// API status endpoint - `GET /api/status`
export const getApiStatus = () => apiClient.get('/api/status');

// Authentication endpoints
export const registerUser = (userData) =>
  apiClient.post('/api/auth/register', userData);

export const loginUser = (credentials) =>
  apiClient.post('/api/auth/login', credentials);

export const refreshToken = () =>
  apiClient.post('/api/auth/refresh');

export const getCurrentUser = () =>
  apiClient.get('/api/auth/me');

export const updateCurrentUser = (userData) =>
  apiClient.put('/api/auth/me', userData);

export const changePassword = (passwordData) =>
  apiClient.post('/api/auth/change-password', passwordData);

export const checkEmailWhitelist = (email) =>
  apiClient.post('/api/auth/check-email', { email });

export const getWhitelistEmails = () =>
  apiClient.get('/api/auth/whitelist');

export const addEmailToWhitelist = (email) =>
  apiClient.post('/api/auth/whitelist', { email });

export const removeEmailFromWhitelist = (email) =>
  apiClient.delete(`/api/auth/whitelist/${email}`);

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

// New AI Assistant endpoints
export const sendChatMessage = (payload) =>
  apiClient.post('/api/chat/message', payload);

export const getRecentChats = (limit = 50) =>
  apiClient.get('/api/chat/recent', { params: { limit } });

export const getChatHistory = (chatId) =>
  apiClient.get(`/api/chat/${chatId}/history`);

export const deleteChat = (chatId) =>
  apiClient.delete(`/api/chat/${chatId}`);

// Legacy endpoint for backward compatibility
export const advisorChatMessage = (payload) =>
  apiClient.post('/api/chat/advisor', payload); 