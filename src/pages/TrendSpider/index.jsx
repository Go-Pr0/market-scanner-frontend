import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../../components/layout/Layout';
import { useRecent } from '../../contexts/RecentContext';
import useTrendSpiderEma from '../../hooks/useTrendSpiderEma';
import './TrendSpider.css';

function TrendSpiderPage() {
  const { addPage } = useRecent();
  const {
    loading,
    error,
    scanResults,
    runScan,
    runScanAndDownloadCsv,
    fetchConfigurations,
    createConfig,
    fetchActiveConfiguration,
    setActiveConfig,
    fetchAvailableSymbols,
    fetchAvailableTimeframes,
    clearError,
    clearResults
  } = useTrendSpiderEma();

  // Form state
  const [formData, setFormData] = useState({
    symbols: [],
    timeframe: '240',
    ema_periods: [50, 200],
    filter_conditions: {},
    sort_by: 'symbol',
    show_only_matching: true,
    batch_size: 4
  });

  // UI state
  const [availableSymbols, setAvailableSymbols] = useState([]);
  const [availableTimeframes, setAvailableTimeframes] = useState({});
  const [configurations, setConfigurations] = useState([]);
  const [activeConfig, setActiveConfigName] = useState('');
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [newConfigName, setNewConfigName] = useState('');
  const [symbolInput, setSymbolInput] = useState('');
  const [emaPeriodInput, setEmaPeriodInput] = useState('');
  const [transitioning, setTransitioning] = useState(false);

  // Track in recent pages
  useEffect(() => {
    addPage({ path: '/trendspider', title: 'EMA Scanner', icon: '📊' });
  }, [addPage]);

  // Load initial data
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const [symbolsData, timeframesData, configsData, activeConfigData] = await Promise.all([
          fetchAvailableSymbols(),
          fetchAvailableTimeframes(),
          fetchConfigurations(),
          fetchActiveConfiguration()
        ]);

        setAvailableSymbols(symbolsData.symbols || []);
        setAvailableTimeframes(timeframesData.timeframes || {});
        setConfigurations(configsData.configurations || []);
        setActiveConfigName(activeConfigData.active_config || '');
      } catch (err) {
        console.error('Failed to load initial data:', err);
      }
    };

    loadInitialData();
  }, [fetchAvailableSymbols, fetchAvailableTimeframes, fetchConfigurations, fetchActiveConfiguration]);

  // Handle form changes
  const handleFormChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Handle symbol input
  const handleAddSymbol = () => {
    if (symbolInput.trim() && !formData.symbols.includes(symbolInput.trim().toUpperCase())) {
      handleFormChange('symbols', [...formData.symbols, symbolInput.trim().toUpperCase()]);
      setSymbolInput('');
    }
  };

  const handleRemoveSymbol = (symbol) => {
    handleFormChange('symbols', formData.symbols.filter(s => s !== symbol));
  };

  // Handle EMA periods
  const handleAddEmaPeriod = () => {
    const period = parseInt(emaPeriodInput, 10);
    if (period > 0 && !formData.ema_periods.includes(period) && formData.ema_periods.length < 5) {
      handleFormChange('ema_periods', [...formData.ema_periods, period].sort((a, b) => a - b));
      setEmaPeriodInput('');
    }
  };

  const handleRemoveEmaPeriod = (period) => {
    handleFormChange('ema_periods', formData.ema_periods.filter(p => p !== period));
    // Remove filter condition for this period
    const newFilterConditions = { ...formData.filter_conditions };
    delete newFilterConditions[period.toString()];
    handleFormChange('filter_conditions', newFilterConditions);
  };

  // Handle filter conditions
  const handleFilterConditionChange = (period, condition) => {
    const newFilterConditions = { ...formData.filter_conditions };
    if (condition === 'none') {
      delete newFilterConditions[period.toString()];
    } else {
      newFilterConditions[period.toString()] = condition;
    }
    handleFormChange('filter_conditions', newFilterConditions);
  };

  // Handle scan execution
  const handleRunScan = async () => {
    setTransitioning(true);
    clearError();
    
    try {
      const scanRequest = {
        ...formData,
        symbols: formData.symbols.length > 0 ? formData.symbols : undefined
      };
      
      await runScan(scanRequest);
    } catch (err) {
      console.error('Scan failed:', err);
    } finally {
      setTransitioning(false);
    }
  };

  // Handle CSV export
  const handleExportCsv = async () => {
    try {
      const scanRequest = {
        ...formData,
        symbols: formData.symbols.length > 0 ? formData.symbols : undefined
      };
      
      await runScanAndDownloadCsv(scanRequest);
    } catch (err) {
      console.error('CSV export failed:', err);
    }
  };

  // Handle configuration save
  const handleSaveConfiguration = async () => {
    if (!newConfigName.trim()) return;

    try {
      const configData = {
        name: newConfigName,
        config: {
          TIMEFRAME: formData.timeframe,
          EMA_PERIODS: formData.ema_periods,
          FILTER_CONDITIONS: formData.filter_conditions,
          SORT_BY: formData.sort_by,
          SHOW_ONLY_MATCHING: formData.show_only_matching,
          BATCH_SIZE: formData.batch_size
        },
        user_config: true
      };

      await createConfig(configData);
      
      // Refresh configurations list
      const configsData = await fetchConfigurations();
      setConfigurations(configsData.configurations || []);
      
      setShowConfigModal(false);
      setNewConfigName('');
    } catch (err) {
      console.error('Failed to save configuration:', err);
    }
  };

  // Format results for display
  const formatNumber = (num) => {
    if (num === null || num === undefined) return '–';
    const abs = Math.abs(num);
    if (abs >= 1_000_000_000) {
      return (num / 1_000_000_000).toFixed(1) + 'B';
    }
    if (abs >= 1_000_000) {
      return (num / 1_000_000).toFixed(1) + 'M';
    }
    if (abs >= 1_000) {
      return (num / 1_000).toFixed(1) + 'K';
    }
    return num.toFixed(2);
  };

  const formatPrice = (value) => {
    if (value === null || value === undefined) return '–';
    const num = Number(value);
    return `$${num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 8 })}`;
  };

  const formatPercent = (pct) => {
    if (pct === null || pct === undefined) return '–';
    return `${pct > 0 ? '+' : ''}${pct.toFixed(2)}%`;
  };

  // Get results to display
  const resultsToDisplay = useMemo(() => {
    if (!scanResults) return [];
    return formData.show_only_matching ? scanResults.matching_results : scanResults.results;
  }, [scanResults, formData.show_only_matching]);

  if (loading && !scanResults) {
    return (
      <Layout className="dashboard">
        <div className="trendspider-container">
          <section className="trendspider-header">
            <div className="header-content">
              <div className="header-text">
                <h1 className="page-title">
                  <span className="text-gradient">EMA Scanner</span>
                </h1>
                <p className="page-subtitle">Loading...</p>
              </div>
            </div>
          </section>
        </div>
      </Layout>
    );
  }

  if (error && !scanResults) {
    return (
      <Layout className="dashboard">
        <div className="trendspider-container">
          <div className="error-section">
            <div className="error-icon">⚠️</div>
            <h2>Unable to Load EMA Scanner</h2>
            <p className="error-message">{error}</p>
            <div className="error-actions">
              <button className="btn btn-primary" onClick={() => window.location.reload()}>
                <span>Retry</span>
                <span>🔄</span>
              </button>
              <Link to="/" className="btn btn-outline">
                <span>Back to Dashboard</span>
                <span>🏠</span>
              </Link>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout className="dashboard">
      <div className="trendspider-container">
        {/* Header */}
        <section className={`trendspider-header fade-block ${transitioning ? 'fade' : ''}`}>
          <div className="header-content">
            <div className="header-text">
              <h1 className="page-title">
                <span className="text-gradient">EMA Scanner</span>
              </h1>
              <p className="page-subtitle">
                {scanResults ? (
                  <>
                    {scanResults.timeframe_label} • {scanResults.successful_scans}/{scanResults.total_symbols_scanned} symbols • 
                    {scanResults.matching_symbols} matching
                  </>
                ) : (
                  'Configure and run EMA scans with advanced filtering'
                )}
              </p>
            </div>
            <div className="header-actions">
              <button 
                className="btn btn-secondary" 
                onClick={() => setShowConfigModal(true)}
                disabled={loading}
              >
                <span>Save Config</span>
                <span>💾</span>
              </button>
              <button 
                className="btn btn-outline" 
                onClick={handleExportCsv}
                disabled={loading || !scanResults}
              >
                <span>Export CSV</span>
                <span>📊</span>
              </button>
            </div>
          </div>
        </section>

        {/* Configuration Form */}
        <section className={`config-section fade-block ${transitioning ? 'fade' : ''}`}>
          <div className="config-grid">
            {/* Timeframe Selection */}
            <div className="config-group">
              <label className="config-label">Timeframe</label>
              <select
                value={formData.timeframe}
                onChange={(e) => handleFormChange('timeframe', e.target.value)}
                className="config-select"
              >
                {Object.entries(availableTimeframes).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>

            {/* Symbols */}
            <div className="config-group">
              <label className="config-label">Symbols (optional)</label>
              <div className="symbol-input-container">
                <input
                  type="text"
                  value={symbolInput}
                  onChange={(e) => setSymbolInput(e.target.value.toUpperCase())}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddSymbol()}
                  placeholder="Add symbol..."
                  className="config-input"
                />
                <button 
                  onClick={handleAddSymbol}
                  className="btn btn-outline btn-small"
                  disabled={!symbolInput.trim()}
                >
                  Add
                </button>
              </div>
              <div className="symbol-tags">
                {formData.symbols.map(symbol => (
                  <span key={symbol} className="symbol-tag">
                    {symbol}
                    <button onClick={() => handleRemoveSymbol(symbol)}>×</button>
                  </span>
                ))}
              </div>
              {formData.symbols.length === 0 && (
                <p className="config-hint">Leave empty to scan all available symbols</p>
              )}
            </div>

            {/* EMA Periods */}
            <div className="config-group">
              <label className="config-label">EMA Periods (max 5)</label>
              <div className="ema-input-container">
                <input
                  type="number"
                  value={emaPeriodInput}
                  onChange={(e) => setEmaPeriodInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddEmaPeriod()}
                  placeholder="Add period..."
                  className="config-input"
                  min="1"
                />
                <button 
                  onClick={handleAddEmaPeriod}
                  className="btn btn-outline btn-small"
                  disabled={!emaPeriodInput || formData.ema_periods.length >= 5}
                >
                  Add
                </button>
              </div>
              <div className="ema-periods">
                {formData.ema_periods.map(period => (
                  <span key={period} className="ema-period-tag">
                    {period}
                    <button onClick={() => handleRemoveEmaPeriod(period)}>×</button>
                  </span>
                ))}
              </div>
            </div>

            {/* Filter Conditions */}
            <div className="config-group">
              <label className="config-label">Filter Conditions</label>
              <div className="filter-conditions">
                {formData.ema_periods.map(period => (
                  <div key={period} className="filter-condition">
                    <span className="filter-label">EMA {period}:</span>
                    <select
                      value={formData.filter_conditions[period.toString()] || 'none'}
                      onChange={(e) => handleFilterConditionChange(period, e.target.value)}
                      className="filter-select"
                    >
                      <option value="none">No filter</option>
                      <option value="above">Price above EMA</option>
                      <option value="below">Price below EMA</option>
                    </select>
                  </div>
                ))}
              </div>
            </div>

            {/* Sort Options */}
            <div className="config-group">
              <label className="config-label">Sort By</label>
              <select
                value={formData.sort_by}
                onChange={(e) => handleFormChange('sort_by', e.target.value)}
                className="config-select"
              >
                <option value="symbol">Symbol</option>
                {formData.ema_periods.map(period => (
                  <option key={period} value={`percent_${period}`}>
                    % from EMA {period}
                  </option>
                ))}
              </select>
            </div>

            {/* Options */}
            <div className="config-group">
              <label className="config-label">Options</label>
              <div className="config-options">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={formData.show_only_matching}
                    onChange={(e) => handleFormChange('show_only_matching', e.target.checked)}
                  />
                  Show only matching results
                </label>
                <div className="batch-size-control">
                  <label>Batch Size:</label>
                  <input
                    type="number"
                    value={formData.batch_size}
                    onChange={(e) => handleFormChange('batch_size', parseInt(e.target.value, 10))}
                    min="1"
                    max="10"
                    className="batch-size-input"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Run Scan Button */}
          <div className="scan-actions">
            <button 
              className="btn btn-primary btn-large"
              onClick={handleRunScan}
              disabled={loading || formData.ema_periods.length === 0}
            >
              <span>{loading ? 'Scanning...' : 'Run EMA Scan'}</span>
              <span>🔍</span>
            </button>
          </div>
        </section>

        {/* Error Display */}
        {error && (
          <section className="error-banner">
            <div className="error-content">
              <span className="error-icon">⚠️</span>
              <span className="error-text">{error}</span>
              <button onClick={clearError} className="error-close">×</button>
            </div>
          </section>
        )}

        {/* Results */}
        {scanResults && (
          <section className={`results-section fade-block ${transitioning ? 'fade' : ''}`}>
            <div className="results-header">
              <h2 className="results-title">
                Scan Results
                <span className="results-count">
                  ({resultsToDisplay.length} {formData.show_only_matching ? 'matching' : 'total'})
                </span>
              </h2>
              <div className="results-info">
                <span>Duration: {scanResults.duration_seconds?.toFixed(1)}s</span>
                <span>•</span>
                <span>Failed: {scanResults.failed_scans}</span>
              </div>
            </div>

            {resultsToDisplay.length === 0 ? (
              <div className="no-results">
                <h3>No results found</h3>
                <p>Try adjusting your filter conditions or EMA periods</p>
              </div>
            ) : (
              <div className="results-table">
                <div className="table-container">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Symbol</th>
                        <th>Price</th>
                        <th>Volume</th>
                        {formData.ema_periods.map(period => (
                          <th key={period}>EMA {period}</th>
                        ))}
                        {formData.ema_periods.map(period => (
                          <th key={period}>% from EMA {period}</th>
                        ))}
                        <th>Candles</th>
                      </tr>
                    </thead>
                    <tbody>
                      {resultsToDisplay.map((result, index) => (
                        <tr key={index} className={`table-row ${result.success ? '' : 'error-row'}`}>
                          <td className="symbol-cell">
                            {result.symbol}
                            {!result.success && <span className="error-indicator">⚠️</span>}
                          </td>
                          <td>{formatPrice(result.price)}</td>
                          <td>{formatNumber(result.volume)}</td>
                          {formData.ema_periods.map(period => (
                            <td key={period}>{formatPrice(result.emas?.[period.toString()])}</td>
                          ))}
                          {formData.ema_periods.map(period => (
                            <td key={period} className={
                              result.percent_from_ema?.[period.toString()] > 0 ? 'positive' : 
                              result.percent_from_ema?.[period.toString()] < 0 ? 'negative' : ''
                            }>
                              {formatPercent(result.percent_from_ema?.[period.toString()])}
                            </td>
                          ))}
                          <td>{result.candles_available}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </section>
        )}

        {/* Configuration Save Modal */}
        {showConfigModal && (
          <div className="modal-overlay" onClick={() => setShowConfigModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3>Save Configuration</h3>
                <button onClick={() => setShowConfigModal(false)} className="modal-close">×</button>
              </div>
              <div className="modal-body">
                <label className="config-label">Configuration Name</label>
                <input
                  type="text"
                  value={newConfigName}
                  onChange={(e) => setNewConfigName(e.target.value)}
                  placeholder="Enter configuration name..."
                  className="config-input"
                />
              </div>
              <div className="modal-actions">
                <button onClick={() => setShowConfigModal(false)} className="btn btn-outline">
                  Cancel
                </button>
                <button 
                  onClick={handleSaveConfiguration}
                  className="btn btn-primary"
                  disabled={!newConfigName.trim()}
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}

export default TrendSpiderPage; 