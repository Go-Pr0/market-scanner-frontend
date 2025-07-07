import React, { useState, useEffect } from 'react';
import Layout from '../../components/layout/Layout';
import { Link } from 'react-router-dom';
import Aurora from '../../components/Aurora';
import './Home.css';
import useMarketAnalysis from '../../hooks/useMarketAnalysis';

function Home() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [marketStatus, setMarketStatus] = useState('Loading...');

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Mock market status
  useEffect(() => {
    const getNyseStatus = () => {
      const now = new Date();
      const timeInNewYork = new Date(now.toLocaleString('en-US', { timeZone: 'America/New_York' }));

      const month = timeInNewYork.getMonth() + 1; // 1-12
      const day = timeInNewYork.getDate();
      const dayOfWeek = timeInNewYork.getDay(); // 0=Sun, 6=Sat
      const hour = timeInNewYork.getHours();
      const minute = timeInNewYork.getMinutes();

      // NYSE Holidays 2024
      const holidays = [
        { month: 1, day: 1 },   // New Year's Day
        { month: 1, day: 15 },  // Martin Luther King, Jr. Day
        { month: 2, day: 19 },  // Washington's Birthday
        { month: 3, day: 29 },  // Good Friday
        { month: 5, day: 27 },  // Memorial Day
        { month: 6, day: 19 },  // Juneteenth
        { month: 7, day: 4 },   // Independence Day
        { month: 9, day: 2 },   // Labor Day
        { month: 11, day: 28 }, // Thanksgiving Day
        { month: 12, day: 25 }, // Christmas Day
      ];

      const isHoliday = holidays.some(h => h.month === month && h.day === day);
      if (isHoliday) {
        return 'Closed';
      }

      // Check for early close days (e.g., day after Thanksgiving)
      // For 2024, the day after Thanksgiving (Nov 29) closes at 1:00 PM ET.
      const isEarlyCloseDay = month === 11 && day === 29;

      // Check if it's a weekend
      if (dayOfWeek === 0 || dayOfWeek === 6) {
        return 'Closed';
      }

      // Check core trading hours (9:30 AM to 4:00 PM ET)
      const isMarketOpen =
        (hour > 9 || (hour === 9 && minute >= 30)) &&
        (hour < 16);

      // Handle early close
      if (isEarlyCloseDay && (hour >= 13)) {
        return 'Closed';
      }
      
      if (isMarketOpen) {
        return 'Open';
      }

      return 'Closed';
    };

    setMarketStatus(getNyseStatus());
  }, [currentTime]);

  // Core trading tools - simplified
  const tradingTools = [
    {
      title: 'EMA Scanner',
      description: 'A scanner based on custom relative EMA positions.',
      path: '/trendspider',
      category: 'Analysis'
    },
    {
      title: 'FDV Scanner',
      description: 'A scanner based on FDV thresholds & metrics.',
      path: '/fully-diluted',
      category: 'Valuation'
    },
    {
      title: 'Bias Tracker',
      description: 'A bias tracker based on the token & the timeframe chosen.',
      url: 'https://morning-tracker.vercel.app',
      external: true,
      category: 'Mentality'
    },
    {
      title: 'Trade Assistant',
      description: 'An assistant to guide you through trading decisions.',
      path: '/trade-chat',
      category: 'AI'
    },
  ];

  // Live market overview data (auto-refreshes every 15 min)
  const { data: marketData, loading: marketLoading, error: marketError } = useMarketAnalysis();

  const topGainers = marketData?.top_gainers ?? [];
  const topLosers = marketData?.top_losers ?? [];
  const mostActive = marketData?.most_active ?? [];

  // Helper functions
  const formatPrice = (value) => {
    if (value === null || value === undefined) return '–';
    const num = Number(value);
    // toPrecision(2) gives exactly two significant digits
    let str = num.toPrecision(2);
    // Convert scientific notation to plain decimal if necessary
    if (str.includes('e')) {
      str = Number(str).toLocaleString('en-US', {
        useGrouping: false,
        minimumFractionDigits: 0,
        maximumFractionDigits: 8, // up to 8 decimals for small prices
      });
    }
    return `$${str}`;
  };

  const formatPercent = (pct) => `${pct > 0 ? '+' : ''}${pct.toFixed(2)}%`;

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

  return (
    <Layout className="dashboard">
      <div className="home-container">
        
        {/* Hero Section - Simplified */}
        <section className="hero-section animate-fade-in">
          <Aurora
            colorStops={["#ff9300", "#7c2a00", "#ad3e00"]}
            blend={0.95}
            amplitude={1.0}
            speed={0.4}
          />
          <div className="hero-content">
            <div className="hero-text">
              <h1 className="hero-title">
                Everbloom Trading Dashboard
              </h1>
              <p className="hero-description">
                Professional market analysis and trading tools for informed decision making.
              </p>
            </div>
          </div>
          
          {/* Market Status Cards - Centered */}
          <div className="status-cards">
            <div className="status-card">
              <span className="status-label">Market Status</span>
              <span className={`status-value ${marketStatus.toLowerCase()}`}>
                {marketStatus}
              </span>
            </div>
            <div className="status-card">
              <span className="status-label">Current Time</span>
              <span className="status-value">
                {currentTime.toLocaleTimeString()}
              </span>
            </div>
          </div>
        </section>

        {/* Trading Tools Grid */}
        <section className="tools-section">
          <h2 className="section-title">Trading Tools</h2>
          <div className="tools-grid">
            {tradingTools.map((tool, index) => {
              const toolContent = (
                <div className="tool-card">
                  <div className="tool-header">
                    <h3 className="tool-title">{tool.title}</h3>
                    <span className="tool-category">{tool.category}</span>
                  </div>
                  <p className="tool-description">{tool.description}</p>
                </div>
              );

              if (tool.external && tool.url) {
                return (
                  <a
                    key={index}
                    href={tool.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="tool-link"
                  >
                    {toolContent}
                  </a>
                );
              }
              
              if (tool.path) {
                return (
                  <Link
                    key={index}
                    to={tool.path}
                    className="tool-link"
                  >
                    {toolContent}
                  </Link>
                );
              }

              return (
                <div key={index} className="tool-card disabled">
                  {toolContent}
                </div>
              );
            })}
          </div>
        </section>

        {/* Market Overview */}
        <section className="market-section">
          <h2 className="section-title">Market Overview</h2>
          <div className="market-grid">
            
            {/* Top Gainers */}
            <div className="market-column">
              <div className="column-header">
                <h3 className="column-title">Top Gainers</h3>
              </div>
              <div className="market-list">
                {/* Loading & error states */}
                {marketLoading && <div className="loading">Loading…</div>}
                {marketError && <div className="error">Failed to load data</div>}

                {!marketLoading && !marketError && topGainers.map((item, index) => (
                  <div key={index} className="market-item">
                    <div className="item-info">
                      <span className="item-symbol">{item.symbol}</span>
                      <span className="item-price">{formatPrice(item.close_current)}</span>
                    </div>
                    <span className="item-change positive">
                      {formatPercent(item.price_change_percent)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Losers */}
            <div className="market-column">
              <div className="column-header">
                <h3 className="column-title">Top Losers</h3>
              </div>
              <div className="market-list">
                {/* Loading & error states */}
                {marketLoading && <div className="loading">Loading…</div>}
                {marketError && <div className="error">Failed to load data</div>}

                {!marketLoading && !marketError && topLosers.map((item, index) => (
                  <div key={index} className="market-item">
                    <div className="item-info">
                      <span className="item-symbol">{item.symbol}</span>
                      <span className="item-price">{formatPrice(item.close_current)}</span>
                    </div>
                    <span className="item-change negative">
                      {formatPercent(item.price_change_percent)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Most Active */}
            <div className="market-column">
              <div className="column-header">
                <h3 className="column-title">Most Active</h3>
              </div>
              <div className="market-list">
                {/* Loading & error states */}
                {marketLoading && <div className="loading">Loading…</div>}
                {marketError && <div className="error">Failed to load data</div>}

                {!marketLoading && !marketError && mostActive.map((item, index) => (
                  <div key={index} className="market-item">
                    <div className="item-info">
                      <span className="item-symbol">{item.symbol}</span>
                      <span className="item-price">{formatPrice(item.close_current)}</span>
                    </div>
                    <span className="item-volume">
                      {formatNumber(item.volume_24h)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Platform Features */}
        <section className="features-section">
          <h2 className="section-title">Platform Features</h2>
          <div className="features-grid">
            
            {/* TrendSpider */}
            <div className="feature-card">
              <div className="feature-header-section">
                <h3 className="feature-title">TrendSpider</h3>
              </div>
              <div className="feature-description-section">
                <p className="feature-description">
                  Advanced EMA analysis with configurable periods, filter conditions, and export capabilities. Perfect for technical analysis workflows.
                </p>
              </div>
              <div className="feature-list-section">
                <ul className="feature-list">
                  <li className="feature-item">
                    <span className="feature-check">✓</span>
                    Multiple EMA Periods
                  </li>
                  <li className="feature-item">
                    <span className="feature-check">✓</span>
                    Advanced Filtering
                  </li>
                  <li className="feature-item">
                    <span className="feature-check">✓</span>
                    Configuration Management
                  </li>
                  <li className="feature-item">
                    <span className="feature-check">✓</span>
                    CSV Export
                  </li>
                </ul>
              </div>
              <div className="feature-button-section">
                <Link to="/trendspider" className="feature-btn">
                  Explore TrendSpider
                </Link>
              </div>
            </div>

            {/* FDV Scanner */}
            <div className="feature-card">
              <div className="feature-header-section">
                <h3 className="feature-title">FDV Scanner</h3>
              </div>
              <div className="feature-description-section">
                <p className="feature-description">
                  Analyze coins by Fully-Diluted Valuation. Filter by circulation %, export tickers, and stay ahead of supply unlocks.
                </p>
              </div>
              <div className="feature-list-section">
                <ul className="feature-list">
                  <li className="feature-item">
                    <span className="feature-check">✓</span>
                    Threshold Filtering
                  </li>
                  <li className="feature-item">
                    <span className="feature-check">✓</span>
                    CSV Export
                  </li>
                  <li className="feature-item">
                    <span className="feature-check">✓</span>
                    Real-time Data
                  </li>
                </ul>
              </div>
              <div className="feature-button-section">
                <Link to="/fully-diluted" className="feature-btn">
                  Explore FDV Scanner
                </Link>
              </div>
            </div>

            {/* Bias Tracker */}
            <div className="feature-card">
              <div className="feature-header-section">
                <h3 className="feature-title">Bias Tracker</h3>
              </div>
              <div className="feature-description-section">
                <p className="feature-description">
                  Track your trading biases and performance with this powerful external tool. Fully integrated for a seamless experience.
                </p>
              </div>
              <div className="feature-list-section">
                <ul className="feature-list">
                  <li className="feature-item">
                    <span className="feature-check">✓</span>
                    Overall Bias Scores
                  </li>
                  <li className="feature-item">
                    <span className="feature-check">✓</span>
                    Bias Tracking
                  </li>
                  <li className="feature-item">
                    <span className="feature-check">✓</span>
                    Track History
                  </li>
                </ul>
              </div>
              <div className="feature-button-section">
                <a 
                  href="https://morning-tracker.vercel.app" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="feature-btn"
                >
                  Explore Bias Tracker
                </a>
              </div>
            </div>

            {/* Trade Assistant */}
            <div className="feature-card">
              <div className="feature-header-section">
                <h3 className="feature-title">Trade Assistant</h3>
              </div>
              <div className="feature-description-section">
                <p className="feature-description">
                  Engage in a conversational chat with an AI to plan your trades, analyze your strategy, and manage your positions.
                </p>
              </div>
              <div className="feature-list-section">
                <ul className="feature-list">
                  <li className="feature-item">
                    <span className="feature-check">✓</span>
                    Pre-Trade Planning
                  </li>
                  <li className="feature-item">
                    <span className="feature-check">✓</span>
                    Trade Management
                  </li>
                  <li className="feature-item">
                    <span className="feature-check">✓</span>
                    Conversational AI
                  </li>
                  <li className="feature-item">
                    <span className="feature-check">✓</span>
                    Strategy Review
                  </li>
                </ul>
              </div>
              <div className="feature-button-section">
                <Link to="/trade-chat" className="feature-btn">
                  Explore Trade Assistant
                </Link>
              </div>
            </div>

          </div>
        </section>

        {/* Quick Actions */}
        <section className="actions-section">
          <h2 className="section-title">Quick Actions</h2>
          <div className="actions-grid">
            <Link to="/trendspider" className="action-card">
              <h3 className="action-title">Start Analysis</h3>
              <p className="action-description">Begin technical analysis with EMA scanner</p>
            </Link>
            <Link to="/fully-diluted" className="action-card">
              <h3 className="action-title">Check Valuations</h3>
              <p className="action-description">Review FDV metrics and circulation data</p>
            </Link>
            <a 
              href="https://morning-tracker.vercel.app" 
              target="_blank" 
              rel="noopener noreferrer"
              className="action-card"
            >
              <h3 className="action-title">Track Performance</h3>
              <p className="action-description">Monitor trading biases and results</p>
            </a>
            <Link to="/trade-chat" className="action-card">
              <h3 className="action-title">Get Assistance</h3>
              <p className="action-description">Chat with AI trading assistant</p>
            </Link>
          </div>
        </section>

      </div>
    </Layout>
  );
}

export default Home;