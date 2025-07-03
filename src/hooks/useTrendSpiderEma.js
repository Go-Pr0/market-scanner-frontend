import { useState, useCallback } from 'react';
import { 
  runEmaScan, 
  runEmaScanCsv,
  getConfigurations,
  createConfiguration,
  getConfiguration,
  updateConfiguration,
  deleteConfiguration,
  getActiveConfiguration,
  setActiveConfiguration,
  getAvailableSymbols,
  getAvailableTimeframes
} from '../api';

/**
 * Custom hook for TrendSpider EMA scanner functionality
 */
export default function useTrendSpiderEma() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [scanResults, setScanResults] = useState(null);

  // Run EMA scan
  const runScan = useCallback(async (scanRequest) => {
    setLoading(true);
    setError(null);
    try {
      const response = await runEmaScan(scanRequest);
      setScanResults(response.data);
      return response.data;
    } catch (err) {
      const message = err?.response?.data?.detail || err.message || 'Failed to run EMA scan';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Run EMA scan and download CSV
  const runScanAndDownloadCsv = useCallback(async (scanRequest) => {
    setLoading(true);
    setError(null);
    try {
      const response = await runEmaScanCsv(scanRequest);
      
      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'ema-scan-results.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      return response.data;
    } catch (err) {
      const message = err?.response?.data?.detail || err.message || 'Failed to export CSV';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Configuration management
  const fetchConfigurations = useCallback(async (userConfigs = true) => {
    try {
      const response = await getConfigurations(userConfigs);
      return response.data;
    } catch (err) {
      const message = err?.response?.data?.detail || err.message || 'Failed to fetch configurations';
      setError(message);
      throw err;
    }
  }, []);

  const createConfig = useCallback(async (configData) => {
    try {
      const response = await createConfiguration(configData);
      return response.data;
    } catch (err) {
      const message = err?.response?.data?.detail || err.message || 'Failed to create configuration';
      setError(message);
      throw err;
    }
  }, []);

  const fetchConfiguration = useCallback(async (configName) => {
    try {
      const response = await getConfiguration(configName);
      return response.data;
    } catch (err) {
      const message = err?.response?.data?.detail || err.message || 'Failed to fetch configuration';
      setError(message);
      throw err;
    }
  }, []);

  const updateConfig = useCallback(async (configName, configData) => {
    try {
      const response = await updateConfiguration(configName, configData);
      return response.data;
    } catch (err) {
      const message = err?.response?.data?.detail || err.message || 'Failed to update configuration';
      setError(message);
      throw err;
    }
  }, []);

  const deleteConfig = useCallback(async (configName) => {
    try {
      const response = await deleteConfiguration(configName);
      return response.data;
    } catch (err) {
      const message = err?.response?.data?.detail || err.message || 'Failed to delete configuration';
      setError(message);
      throw err;
    }
  }, []);

  const fetchActiveConfiguration = useCallback(async () => {
    try {
      const response = await getActiveConfiguration();
      return response.data;
    } catch (err) {
      const message = err?.response?.data?.detail || err.message || 'Failed to fetch active configuration';
      setError(message);
      throw err;
    }
  }, []);

  const setActiveConfig = useCallback(async (configName) => {
    try {
      const response = await setActiveConfiguration(configName);
      return response.data;
    } catch (err) {
      const message = err?.response?.data?.detail || err.message || 'Failed to set active configuration';
      setError(message);
      throw err;
    }
  }, []);

  const fetchAvailableSymbols = useCallback(async () => {
    try {
      const response = await getAvailableSymbols();
      return response.data;
    } catch (err) {
      const message = err?.response?.data?.detail || err.message || 'Failed to fetch available symbols';
      setError(message);
      throw err;
    }
  }, []);

  const fetchAvailableTimeframes = useCallback(async () => {
    try {
      const response = await getAvailableTimeframes();
      return response.data;
    } catch (err) {
      const message = err?.response?.data?.detail || err.message || 'Failed to fetch available timeframes';
      setError(message);
      throw err;
    }
  }, []);

  return {
    loading,
    error,
    scanResults,
    runScan,
    runScanAndDownloadCsv,
    fetchConfigurations,
    createConfig,
    fetchConfiguration,
    updateConfig,
    deleteConfig,
    fetchActiveConfiguration,
    setActiveConfig,
    fetchAvailableSymbols,
    fetchAvailableTimeframes,
    clearError: () => setError(null),
    clearResults: () => setScanResults(null)
  };
} 