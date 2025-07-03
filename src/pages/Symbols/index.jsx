import React, { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import useFullyDilutedSymbols from '../../hooks/useFullyDilutedSymbols';
import Layout from '../../components/layout/Layout';
import { useRecent } from '../../contexts/RecentContext';
import './Symbols.css';

// FDV Scan page – consumes `/api/market/fully-diluted` which returns { coins: [...] }
function SymbolsPage() {
  const { addPage } = useRecent();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('market_cap_rank');
  const [sortOrder, setSortOrder] = useState('asc');
  // Threshold state (0-100, steps of 5). Default 85 %.
  const [threshold, setThreshold] = useState(85);
  const [sliderValue, setSliderValue] = useState(85);
  const [transitioning, setTransitioning] = useState(false);

  // Track in recent pages
  useEffect(() => {
    addPage({ path: '/fully-diluted', title: 'FDV Scan', icon: '📈' });
  }, [addPage]);

  // API data
  const { data: fdvData, loading, error, refresh } = useFullyDilutedSymbols(threshold);

  // Filter and sort
  const filteredCoins = useMemo(() => {
    const coins = fdvData?.coins || [];
    let data = coins.filter((c) =>
      c.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.id.toLowerCase().includes(searchTerm.toLowerCase())
    );

    data.sort((a, b) => {
      const aVal = a[sortBy];
      const bVal = b[sortBy];

      if (typeof aVal === 'string') {
        return sortOrder === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      }
      return sortOrder === 'asc' ? aVal - bVal : bVal - aVal;
    });

    return data;
  }, [fdvData, searchTerm, sortBy, sortOrder]);

  // CSV export helper
  const exportData = () => {
    // Produce TradingView-compatible ticker list
    const content = filteredCoins
      .map((c) => `BYBIT:${c.symbol.toUpperCase()}USDT.P`)
      .join('\n');

    const blob = new Blob([content], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'fdv-tickers.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  // Begin transition and trigger data fetch
  const applyThreshold = () => {
    if (sliderValue === threshold) return;
    setTransitioning(true);
    setThreshold(sliderValue);
  };

  // When new data finished loading, fade back in
  useEffect(() => {
    if (transitioning && !loading) {
      const timer = setTimeout(() => setTransitioning(false), 200);
      return () => clearTimeout(timer);
    }
  }, [loading, transitioning]);

  /* ----------- RENDER ------------ */

  if (loading) {
    return (
      <Layout className="dashboard">
        <div className="symbols-container">
          {/* Keep header visible but hide content while loading */}
          <section className={`symbols-header fade-block ${transitioning ? 'fade' : ''}`}>
            <div className="header-content">
              <div className="header-text">
                <h1 className="page-title">
                  <span className="text-gradient">FDV Scan</span>
                </h1>
              </div>
            </div>
          </section>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout className="dashboard">
        <div className="symbols-container">
          <div className="error-section">
            <div className="error-icon">⚠️</div>
            <h2>Unable to Load FDV Data</h2>
            <p className="error-message">{error}</p>
            <div className="error-actions">
              <button className="btn btn-primary" onClick={refresh}>
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
      <div className="symbols-container">
        {/* Header */}
        <section className={`symbols-header fade-block ${transitioning ? 'fade' : ''}`}>
          <div className="header-content">
            <div className="header-text">
              <h1 className="page-title">
                <span className="text-gradient">FDV Scan</span>
              </h1>
              <p className="page-subtitle">FDV ≥ {threshold}% • {filteredCoins.length} coins</p>
            </div>
            <div className="header-actions">
              <button className="btn btn-secondary" onClick={refresh}>
                <span>Refresh</span>
                <span>🔄</span>
              </button>
              <button className="btn btn-outline" onClick={exportData}>
                <span>Export CSV</span>
                <span>📊</span>
              </button>
            </div>
          </div>
        </section>

        {/* Content area with fade effect */}
        <div className={`fade-block ${transitioning ? 'fade' : ''}`}>

        {/* Controls */}
        <section className="controls-section">
          <div className="controls-grid">
            {/* Search */}
            <div className="search-bar">
              <input
                type="text"
                placeholder="Search by symbol or id..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
              <div className="search-icon">🔍</div>
            </div>

            {/* Threshold Slider */}
            <div className="threshold-control">
              <label htmlFor="thresholdRange" className="threshold-label">
                Threshold: {sliderValue}%
              </label>
              <div className="slider-wrapper">
                <input
                  id="thresholdRange"
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={sliderValue}
                  onChange={(e) => setSliderValue(parseInt(e.target.value, 10))}
                  className="threshold-slider"
                />
                <div
                  className="slider-tooltip"
                  style={{ left: `calc(${sliderValue}% - 3px)` }}
                >
                  {sliderValue}%
                </div>
              </div>
            </div>

            {/* Sort */}
            <div className="sort-controls">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="sort-select"
              >
                <option value="market_cap_rank">Rank</option>
                <option value="symbol">Symbol</option>
                <option value="fd_pct">FD %</option>
              </select>
              <button
                className="sort-order-btn"
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              >
                {sortOrder === 'asc' ? '↑' : '↓'}
              </button>
            </div>
          </div>
          {/* Apply button outside grid for absolute positioning */}
          <button
            className="btn btn-outline apply-btn"
            onClick={applyThreshold}
            disabled={sliderValue === threshold}
          >
            Apply
          </button>
        </section>

        {/* Results */}
        <section className="results-section">
          {filteredCoins.length === 0 ? (
            <div className="no-results">
              <h3>No coins found</h3>
            </div>
          ) : (
            <div className="symbols-table">
              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Symbol</th>
                      <th>ID</th>
                      <th>Circulating Supply</th>
                      <th>Max Supply</th>
                      <th>FD %</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCoins.map((coin) => (
                      <tr key={coin.id} className="table-row">
                        <td>{coin.market_cap_rank}</td>
                        <td className="symbol-cell">{coin.symbol.toUpperCase()}</td>
                        <td>{coin.id}</td>
                        <td>{formatNumber(coin.circulating_supply)}</td>
                        <td>{formatNumber(coin.max_supply)}</td>
                        <td>{(coin.fd_pct * 100).toFixed(2)}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </section>

        </div> {/* end fade-block wrapper */}
      </div>
    </Layout>
  );
}

// Format big numbers with thousands separators
function formatNumber(num) {
  if (typeof num !== 'number') return num;
  return num.toLocaleString(undefined, { maximumFractionDigits: 0 });
}

export default SymbolsPage; 