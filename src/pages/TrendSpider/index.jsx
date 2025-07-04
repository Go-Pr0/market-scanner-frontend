import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../../components/layout/Layout';
import { useRecent } from '../../contexts/RecentContext';
import useTrendSpiderEma from '../../hooks/useTrendSpiderEma';
import useLocalConfigs from '../../hooks/useLocalConfigs';
import './TrendSpider.css';

// Static fallback for common TrendSpider timeframes to avoid initial API round-trip
const DEFAULT_TIMEFRAMES = {
  "1": "1 minute",
  "5": "5 minutes",
  "15": "15 minutes",
  "30": "30 minutes",
  "60": "1 hour",
  "120": "2 hours",
  "240": "4 hours",
  "360": "6 hours",
  "720": "12 hours",
  "1440": "1 day"
};

function TrendSpiderPage() {
  const { addPage } = useRecent();
  const {
    loading,
    error,
    scanResults,
    runScan,
    runScanAndDownloadCsv,
    createConfig,
    clearError,
  } = useTrendSpiderEma();

  // Local browser configs
  const { configs: localConfigs, saveConfig: saveLocalConfig, deleteConfig: deleteLocalConfig } = useLocalConfigs();

  // Form state - simplified
  const [timeframe, setTimeframe] = useState('240');
  const [emaConditions, setEmaConditions] = useState([
    {
      id: 1,
      period: 50,
      filter: { type: 'none', x: '', y: '' },
      sortBy: 'symbol'
    }
  ]);

  // UI state
  const [availableTimeframes] = useState(DEFAULT_TIMEFRAMES);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [newConfigName, setNewConfigName] = useState('');
  const [transitioning, setTransitioning] = useState(false);
  const [nextId, setNextId] = useState(2);
  const [showLocalMenu, setShowLocalMenu] = useState(false);

  // Track in recent pages
  useEffect(() => {
    addPage({ path: '/trendspider', title: 'EMA Scanner', icon: '📊' });
  }, [addPage]);

  // Handle EMA condition changes
  const updateEmaCondition = (id, field, value, subfield = null) => {
    setEmaConditions(prev =>
      prev.map(condition => {
        if (condition.id !== id) return condition;
        if (field === 'filter') {
          const newFilter = { ...condition.filter, [subfield]: value };
          return { ...condition, filter: newFilter };
        }
        return { ...condition, [field]: value };
      })
    );
  };

  // Add new EMA condition
  const addEmaCondition = () => {
    const newCondition = {
      id: nextId,
      period: 200,
      filter: { type: 'none', x: '', y: '' },
      sortBy: 'symbol'
    };
    setEmaConditions(prev => [...prev, newCondition]);
    setNextId(prev => prev + 1);
  };

  // Remove EMA condition
  const removeEmaCondition = (id) => {
    if (emaConditions.length > 1) {
      setEmaConditions(prev => prev.filter(condition => condition.id !== id));
    }
  };

  // Handle scan execution
  const handleRunScan = async () => {
    setTransitioning(true);
    clearError();
    
    try {
      const ema_periods = emaConditions.map(c => c.period);
      const filter_conditions = {};
      
      emaConditions.forEach(condition => {
        const str = buildFilterString(condition.filter);
        if (str) filter_conditions[condition.period.toString()] = str;
      });

      // Use the first condition's sort method as primary sort
      const sort_by = emaConditions[0]?.sortBy || 'symbol';
      
      const scanRequest = {
        timeframe,
        ema_periods,
        filter_conditions,
        sort_by,
        show_only_matching: true,
        batch_size: 4
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
      const ema_periods = emaConditions.map(c => c.period);
      const filter_conditions = {};
      
      emaConditions.forEach(condition => {
        const str = buildFilterString(condition.filter);
        if (str) filter_conditions[condition.period.toString()] = str;
      });

      const sort_by = emaConditions[0]?.sortBy || 'symbol';
      
      const scanRequest = {
        timeframe,
        ema_periods,
        filter_conditions,
        sort_by,
        show_only_matching: true,
        batch_size: 4
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
      const filter_conditions = {};
      emaConditions.forEach(condition => {
        const str = buildFilterString(condition.filter);
        if (str) filter_conditions[condition.period.toString()] = str;
      });

      const configData = {
        name: newConfigName,
        config: {
          TIMEFRAME: timeframe,
          EMA_PERIODS: emaConditions.map(c => c.period),
          FILTER_CONDITIONS: filter_conditions,
          SORT_BY: emaConditions[0]?.sortBy || 'symbol',
          SHOW_ONLY_MATCHING: true,
          BATCH_SIZE: 4
        },
        user_config: true
      };

      await createConfig(configData);
      
      setShowConfigModal(false);
      setNewConfigName('');

      // also save to browser cache
      saveLocalConfig(newConfigName, {
        timeframe,
        emaConditions
      });
    } catch (err) {
      console.error('Failed to save configuration:', err);
    }
  };

  // Load local config
  const loadLocalConfig = (payload) => {
    setTimeframe(payload.timeframe);
    setEmaConditions(payload.emaConditions);
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

  // Get results to display (always show only matching)
  const resultsToDisplay = useMemo(() => {
    if (!scanResults) return [];
    return scanResults.matching_results || [];
  }, [scanResults]);

  // Get available sort options based on current EMA periods
  const getSortOptions = () => {
    const options = [
      { value: 'symbol', label: 'Symbol' }
    ];
    
    emaConditions.forEach(condition => {
      options.push({
        value: `percent_${condition.period}`,
        label: `% from EMA ${condition.period}`
      });
    });
    
    return options;
  };

  // build filter string or null if incomplete/invalid
  const buildFilterString = (filterObj) => {
    const { type, x, y } = filterObj;
    if (type === 'none') return null;
    if (type === 'above' || type === 'below') return type;
    if (type === 'near') {
      if (!x && x !== 0) return null;
      return `${type}:${x}`;
    }
    if (type === 'above_by' || type === 'below_by') {
      if (!x && x !== 0) return null;
      return `${type}:${x}`;
    }
    if (type === 'above_range' || type === 'below_range') {
      if ((!x && x !== 0) || (!y && y !== 0)) return null;
      return `${type === 'above_range' ? 'above_by' : 'below_by'}:${x}:${y}`;
    }
    return null;
  };

  if (loading && !scanResults) {
    return (
      <Layout className="dashboard">
        <div className="trendspider-container">
          <section className="trendspider-header">
            <div className="header-content">
              <div className="header-text">
                <h1 className="page-title">
                  <span className="text-gradient">TrendSpider</span>
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
                <span className="text-gradient">TrendSpider</span>
              </h1>
              <p className="page-subtitle">
                {scanResults ? (
                  <>
                    {scanResults.timeframe_label} • {scanResults.successful_scans}/{scanResults.total_symbols_scanned} symbols • 
                    {scanResults.matching_symbols} matching
                  </>
                ) : (
                  'Configure EMA conditions and run advanced technical analysis'
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
              {/* Local config dropdown */}
              <div className="local-config-wrapper" onBlur={()=>setShowLocalMenu(false)} tabIndex={-1}>
                <button className="btn btn-secondary" onClick={()=>setShowLocalMenu(!showLocalMenu)}>
                  <span>Configs</span> <span>📂</span>
                </button>
                {showLocalMenu && (
                  <div className="local-config-menu">
                    {localConfigs.length===0 && <div className="empty">No saved configs</div>}
                    {localConfigs.map(c=> (
                      <div key={c.name} className="config-item">
                        <button className="load" onClick={()=>{loadLocalConfig(c.payload); setShowLocalMenu(false);}}>{c.name}</button>
                        <button className="delete" onClick={()=>deleteLocalConfig(c.name)}>🗑</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Configuration Playground */}
        <section className={`config-playground fade-block ${transitioning ? 'fade' : ''}`}>
          {/* Timeframe Selection at Top */}
          <div className="timeframe-selector">
            <label className="timeframe-label">Timeframe</label>
            <div className="select-custom">
              <select
                value={timeframe}
                onChange={(e) => setTimeframe(e.target.value)}
                className="timeframe-select"
              >
                {Object.entries(availableTimeframes).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* EMA Condition Lines */}
          <div className="ema-conditions">
            {emaConditions.map((condition, index) => (
              <div key={condition.id} className="ema-condition-line">
                <div className="condition-content">
                  {/* EMA Period */}
                  <div className="condition-item">
                    <label className="condition-label">EMA Period</label>
                    <input
                      type="number"
                      value={condition.period}
                      onChange={(e) => updateEmaCondition(condition.id, 'period', parseInt(e.target.value, 10) || 1)}
                      className="condition-input"
                      min="1"
                      max="1000"
                    />
                  </div>

                  {/* Filter Condition */}
                  <div className="condition-item">
                    <label className="condition-label">Filter Condition</label>
                    <div className="select-custom">
                      <select
                        value={condition.filter.type}
                        onChange={(e) => updateEmaCondition(condition.id, 'filter', e.target.value, 'type')}
                        className="condition-select"
                      >
                        <option value="none">No filter</option>
                        <option value="above">Price above</option>
                        <option value="below">Price below</option>
                        <option value="above_by">Above by %</option>
                        <option value="below_by">Below by %</option>
                        <option value="above_range">Above in % zone</option>
                        <option value="below_range">Below in % zone</option>
                        <option value="near">Near EMA</option>
                      </select>
                    </div>

                    {['above_by', 'below_by', 'near', 'above_range', 'below_range'].includes(condition.filter.type) && (
                      <input
                        type="number"
                        className="condition-input small"
                        placeholder="X%"
                        value={condition.filter.x}
                        onChange={(e) => updateEmaCondition(condition.id, 'filter', e.target.value, 'x')}
                      />
                    )}

                    {['above_range', 'below_range'].includes(condition.filter.type) && (
                      <input
                        type="number"
                        className="condition-input small"
                        placeholder="Y%"
                        value={condition.filter.y}
                        onChange={(e) => updateEmaCondition(condition.id, 'filter', e.target.value, 'y')}
                      />
                    )}
                  </div>

                  {/* Sort Method */}
                  <div className="condition-item">
                    <label className="condition-label">Sort By</label>
                    <div className="select-custom">
                      <select
                        value={condition.sortBy}
                        onChange={(e) => updateEmaCondition(condition.id, 'sortBy', e.target.value)}
                        className="condition-select"
                      >
                        {getSortOptions().map(option => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Remove Button */}
                {emaConditions.length > 1 && (
                  <button
                    className="remove-condition-btn"
                    onClick={() => removeEmaCondition(condition.id)}
                    title="Remove this EMA condition"
                  >
                    ×
                  </button>
                )}
              </div>
            ))}

            {/* Add New Condition Button */}
            <button
              className="add-condition-btn"
              onClick={addEmaCondition}
              disabled={emaConditions.length >= 5}
            >
              <span className="add-icon">+</span>
              <span>Add EMA Condition</span>
            </button>
          </div>

          {/* Run Scan Button */}
          <div className="scan-actions">
            <button 
              className="btn btn-primary btn-large scan-btn"
              onClick={handleRunScan}
              disabled={loading || emaConditions.length === 0}
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
                  ({resultsToDisplay.length} matching)
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
                        {emaConditions.map(condition => (
                          <th key={condition.id}>EMA {condition.period}</th>
                        ))}
                        {emaConditions.map(condition => (
                          <th key={condition.id}>% from EMA {condition.period}</th>
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
                          {emaConditions.map(condition => (
                            <td key={condition.id}>{formatPrice(result.emas?.[condition.period.toString()])}</td>
                          ))}
                          {emaConditions.map(condition => (
                            <td key={condition.id} className={
                              result.percent_from_ema?.[condition.period.toString()] > 0 ? 'positive' :
                              result.percent_from_ema?.[condition.period.toString()] < 0 ? 'negative' : ''
                            }>
                              {formatPercent(result.percent_from_ema?.[condition.period.toString()])}
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