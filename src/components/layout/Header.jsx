import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import useHealthStatus from '../../hooks/useHealthStatus';
import useApiStatus from '../../hooks/useApiStatus';
import './Header.css';

function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { data: healthData } = useHealthStatus();
  const { data: apiData } = useApiStatus();

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { path: '/', label: 'Dashboard', icon: '🏠' },
    // TrendSpider EMA Scanner - top priority
    { path: '/trendspider', label: 'EMA Scanner', icon: '📊' },
    // FDV-based scan
    { path: '/fully-diluted', label: 'FDV Scan', icon: '📈' },
    // Placeholder nav items for future pages can be re-added here when implemented.
  ];

  const isActive = (path) => location.pathname === path;

  const getStatusColor = () => {
    if (healthData?.status === 'healthy' && apiData?.status === 'active') {
      return 'var(--success-gradient)';
    }
    return 'var(--danger-gradient)';
  };

  const handleNav = (e, path) => {
    e.preventDefault();
    if (location.pathname === path) return;
    document.body.classList.add('page-fade-out');
    setTimeout(() => {
      navigate(path);
    }, 200);
  };

  return (
    <header className={`site-header ${scrolled ? 'scrolled' : ''}`}>
      <div className="header-container">
        {/* Logo Section */}
        <div className="logo-section">
          <Link to="/" className="logo">
            <div className="logo-icon">📊</div>
            <div className="logo-text">
              <span className="logo-title">Market Scanner</span>
              <span className="logo-subtitle">Pro</span>
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <nav className={`nav-menu ${isMenuOpen ? 'open' : ''}`}>
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`nav-item ${isActive(item.path) ? 'active' : ''}`}
              onClick={(e) => { handleNav(e, item.path); setIsMenuOpen(false); }}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
            </Link>
          ))}
        </nav>

        {/* Header Controls */}
        <div className="header-controls">
          {/* Search Bar */}
          <div className="search-container">
            <input
              type="text"
              placeholder="Search symbols..."
              className="search-input"
            />
            <div className="search-icon">🔍</div>
          </div>

          {/* Status Indicator */}
          <div className="status-indicator">
            <div 
              className="status-dot"
              style={{ background: getStatusColor() }}
              title={`API: ${apiData?.status || 'Unknown'}, Health: ${healthData?.status || 'Unknown'}`}
            ></div>
            <span className="status-text">
              {(healthData?.status === 'healthy' && apiData?.status === 'active') ? 'Online' : 'Offline'}
            </span>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            className="mobile-menu-toggle"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle navigation menu"
          >
            <span className={`hamburger ${isMenuOpen ? 'open' : ''}`}>
              <span></span>
              <span></span>
              <span></span>
            </span>
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <div className="mobile-overlay" onClick={() => setIsMenuOpen(false)}>
          <div className="mobile-menu" onClick={(e) => e.stopPropagation()}>
            <div className="mobile-menu-header">
              <h3>Navigation</h3>
              <button
                className="close-menu"
                onClick={() => setIsMenuOpen(false)}
              >
                ✕
              </button>
            </div>
            <div className="mobile-nav">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`mobile-nav-item ${isActive(item.path) ? 'active' : ''}`}
                  onClick={(e) => { handleNav(e, item.path); setIsMenuOpen(false); }}
                >
                  <span className="nav-icon">{item.icon}</span>
                  <span className="nav-label">{item.label}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

export default Header; 