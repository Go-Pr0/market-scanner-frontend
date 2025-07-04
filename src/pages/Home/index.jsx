import React, { useState, useEffect } from 'react';
import Layout from '../../components/layout/Layout';
import { useRecent } from '../../contexts/RecentContext';
import { Link } from 'react-router-dom';
import './Home.css';
import useMarketAnalysis from '../../hooks/useMarketAnalysis';

function Home() {
  const { recentPages } = useRecent();
  
  const [currentTime, setCurrentTime] = useState(new Date());
  const [marketStatus, setMarketStatus] = useState('Loading...');
  const [highlightCards, setHighlightCards] = useState(false);

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

      const year = timeInNewYork.getFullYear();
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

  const handleStartScanning = () => {
    setHighlightCards(true);
  };

  // Remove highlight after animation completes (1s)
  useEffect(() => {
    if (highlightCards) {
      const timer = setTimeout(() => setHighlightCards(false), 1000);
      return () => clearTimeout(timer);
    }
  }, [highlightCards]);

  // Dashboard cards representing backend endpoints
  const dashboardCards = [
    {
      title: 'EMA CENTERED SCANNER', // TrendSpider EMA scanner - top priority
      subtitle: 'TrendSpider',
      icon: '📊',
      path: '/trendspider',
    },
    {
      title: 'FDV-based Scan', // Fully-diluted endpoint
      subtitle: 'FDV Scan',
      icon: '📈',
      path: '/fully-diluted', // Link to existing page
    },
    {
      title: 'BIAS TRACKER',
      subtitle: 'Bias Tracker',
      icon: '🧭',
      url: 'https://morning-tracker.vercel.app',
      external: true,
    },
    // TODO: Replace these placeholder objects with real endpoint pages when implemented.
    {},
  ];

  const featureCards = [
    // TrendSpider EMA Scanner card – fully implemented
    {
      title: 'TrendSpider',
      description: 'Advanced EMA analysis with configurable periods, filter conditions, and export capabilities. Perfect for technical analysis workflows.',
      icon: '📊',
      path: '/trendspider',
      gradient: 'var(--accent-gradient)',
      features: ['Multiple EMA Periods', 'Advanced Filtering', 'Configuration Management', 'CSV Export']
    },
    // FDV Scanner card – fully implemented
    {
      title: 'FDV Scanner',
      description: 'Analyze coins by Fully-Diluted Valuation. Filter by circulation %, export tickers, and stay ahead of supply unlocks.',
      icon: '📈',
      path: '/fully-diluted',
      gradient: 'var(--primary-gradient)',
      features: ['Threshold Filtering', 'CSV Export', 'Real-time Data']
    },
    // Bias Tracker card - external link
    {
      title: 'Bias Tracker',
      description: 'Track your trading biases and performance with this powerful external tool. Fully integrated for a seamless experience.',
      icon: '🧭',
      url: 'https://morning-tracker.vercel.app',
      external: true,
      gradient: 'var(--info-gradient)',
      features: ['Overall Bias Scores', 'Bias Tracking', 'Track History']
    },
    // Placeholders for upcoming features – empty objects will render as blank outline cards
    {},
  ];

  // Live market overview data (auto-refreshes every 15 min)
  const { data: marketData, loading: marketLoading, error: marketError } = useMarketAnalysis();

  const topGainers = marketData?.top_gainers ?? [];
  const topLosers = marketData?.top_losers ?? [];
  const mostActive = marketData?.most_active ?? [];

  // Helpers
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
  const formatPercent = (pct) => `${pct > 0 ? '+' : ''}${pct.toFixed(2)}%`;

  return (
    <Layout className="dashboard">
      <div className="home-container">
        {/* Hero Section */}
        <section className="hero-section animate-fade-in">
          <div className="hero-content">
            <div className="hero-text">
              <h1 className="hero-title">
                <span className="text-gradient">Everbloom Trading Portal</span>
                <span className="hero-subtitle">Professional</span>
              </h1>
              <p className="hero-description">
                Advanced market analysis platform providing real-time insights, 
                comprehensive data visualization, and powerful trading tools.
              </p>
              <div className="hero-actions">
                <button className="btn btn-primary btn-large" onClick={handleStartScanning}>
                  <span>Start Scanning</span>
                  <span>🚀</span>
                </button>
                <button className="btn btn-outline btn-large">
                  <span>View Demo</span>
                  <span>▶️</span>
                </button>
              </div>
            </div>
            <div className="hero-stats">
              <div className="hero-stat">
                <div className="stat-icon">⏰</div>
                <div className="stat-info">
                  <div className="stat-label">Stock Market Status</div>
                  <div className={`stat-value ${marketStatus.toLowerCase()}`}>
                    {marketStatus}
                  </div>
                </div>
              </div>
              <div className="hero-stat">
                <div className="stat-icon">🕐</div>
                <div className="stat-info">
                  <div className="stat-label">Current Time</div>
                  <div className="stat-value">
                    {currentTime.toLocaleTimeString()}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Dashboard Endpoint Cards */}
        <section className="stats-section animate-slide-up">
          <div className="stats-grid">
            {dashboardCards.map((card, index) => {
              const cardContent = (
                <>
                  <div className="stat-card-header">
                    <div className="stat-card-icon">{card.icon}</div>
                    <div className="stat-card-title">{card.title}</div>
                  </div>
                  <div className="stat-card-content">
                    <div className="stat-card-value">{card.subtitle}</div>
                  </div>
                </>
              );

              // Handle external link
              if (card.external && card.url) {
                return (
                  <a
                    key={index}
                    href={card.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`stat-card glass link-card ${highlightCards ? 'glare' : ''}`}
                  >
                    {cardContent}
                  </a>
                );
              }
              
              // If the card has a path, render it as a clickable link
              if (card.path) {
                return (
                  <Link
                    key={index}
                    to={card.path}
                    className={`stat-card glass link-card ${highlightCards ? 'glare' : ''}`}
                  >
                    {cardContent}
                  </Link>
                );
              }

              // Placeholder for future pages – intentionally left blank
              return (
                <div key={index} className={`stat-card glass placeholder-card ${highlightCards ? 'glare' : ''}`}>
                  {/* TODO: Endpoint card placeholder – replace when new page is ready */}
                </div>
              );
            })}
          </div>
        </section>

        {/* Three-Column Market Data Layout */}
        <section className="market-overview-section">
          <h2 className="section-title">
            <span className="text-gradient">Market Overview</span>
          </h2>
          <div className="market-columns">
            {/* Top Gainers Column */}
            <div className="market-column">
              <div className="column-header">
                <h3 className="column-title">
                  <span className="column-icon">📈</span>
                  Top Gainers
                </h3>
              </div>
              <div className="symbol-cards">
                {/* Loading & error states */}
                {marketLoading && <div className="loading">Loading…</div>}
                {marketError && <div className="error">Failed to load data</div>}

                {!marketLoading && !marketError && topGainers.map((item, index) => (
                  <div key={index} className="symbol-card card animate-slide-up">
                    <div className="symbol-header">
                      <span className="symbol-name">{item.symbol}</span>
                      <span className="symbol-change positive">{formatPercent(item.price_change_percent)}</span>
                    </div>
                    <div className="symbol-price">{formatPrice(item.close_current)}</div>
                    <div className="symbol-indicator positive"></div>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Losers Column */}
            <div className="market-column">
              <div className="column-header">
                <h3 className="column-title">
                  <span className="column-icon">📉</span>
                  Top Losers
                </h3>
              </div>
              <div className="symbol-cards">
                {/* Loading & error states */}
                {marketLoading && <div className="loading">Loading…</div>}
                {marketError && <div className="error">Failed to load data</div>}

                {!marketLoading && !marketError && topLosers.map((item, index) => (
                  <div key={index} className="symbol-card card animate-slide-up">
                    <div className="symbol-header">
                      <span className="symbol-name">{item.symbol}</span>
                      <span className="symbol-change negative">{formatPercent(item.price_change_percent)}</span>
                    </div>
                    <div className="symbol-price">{formatPrice(item.close_current)}</div>
                    <div className="symbol-indicator negative"></div>
                  </div>
                ))}
              </div>
            </div>

            {/* Most Active Column */}
            <div className="market-column">
              <div className="column-header">
                <h3 className="column-title">
                  <span className="column-icon">🔥</span>
                  Most Active
                </h3>
              </div>
              <div className="symbol-cards">
                {/* Loading & error states */}
                {marketLoading && <div className="loading">Loading…</div>}
                {marketError && <div className="error">Failed to load data</div>}

                {!marketLoading && !marketError && mostActive.map((item, index) => (
                  <div key={index} className="symbol-card card animate-slide-up">
                    <div className="symbol-header">
                      <span className="symbol-name">{item.symbol}</span>
                      <span className="symbol-volume">{formatNumber(item.volume_24h)}</span>
                    </div>
                    <div className="symbol-price">{formatPrice(item.close_current)}</div>
                    <div className="symbol-indicator active"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Feature Cards */}
        <section className="features-section">
          <h2 className="section-title">
            <span className="text-gradient">Platform Features</span>
          </h2>
          <div className="features-grid">
            {featureCards.map((feature, index) => {
              // Placeholder for upcoming features
              if (!feature.path && !feature.external) {
                return <div key={index} className="feature-card glass placeholder-card animate-slide-up"></div>;
              }

              const featureContent = (
                <>
                  <div className="feature-header">
                    <div
                      className="feature-icon"
                      style={{ background: feature.gradient }}
                    >
                      {feature.icon}
                    </div>
                    <h3 className="feature-title">{feature.title}</h3>
                  </div>
                  <p className="feature-description">{feature.description}</p>
                  <ul className="feature-list">
                    {feature.features.map((item, itemIndex) => (
                      <li key={itemIndex} className="feature-item">
                        <span className="feature-check">✓</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </>
              );

              // Handle external link
              if (feature.external) {
                return (
                  <div key={index} className="feature-card glass animate-slide-up">
                    {featureContent}
                    <a href={feature.url} target="_blank" rel="noopener noreferrer" className="feature-btn btn btn-secondary">
                      Explore {feature.title}
                    </a>
                  </div>
                );
              }
              
              // Render fully defined card
              return (
                <div key={index} className="feature-card glass animate-slide-up">
                  {featureContent}
                  <Link to={feature.path} className="feature-btn btn btn-secondary">
                    Explore {feature.title}
                  </Link>
                </div>
              );
            })}
          </div>
        </section>

        {/* Recent Activity */}
        {recentPages.length > 0 && (
          <section className="recent-section">
            <h2 className="section-title">
              <span className="text-gradient">Recent Activity</span>
            </h2>
            <div className="recent-grid">
              {recentPages.map((page, index) => (
                <div key={index} className="recent-card card">
                  <div className="recent-icon">{page.icon}</div>
                  <div className="recent-content">
                    <h4 className="recent-title">{page.title}</h4>
                    <p className="recent-time">
                      {new Date(page.visitedAt).toLocaleString()}
                    </p>
                  </div>
                  <button className="recent-btn btn btn-outline btn-small">
                    Revisit
                  </button>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </Layout>
  );
}

export default Home; 