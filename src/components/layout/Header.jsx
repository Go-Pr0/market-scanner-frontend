import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import './Header.css';

function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { user, logout } = useAuth();

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { path: '/', label: 'Dashboard' },
    { path: '/trendspider', label: 'EMA Scanner' },
    { path: '/fully-diluted', label: 'FDV Scanner' },
    { url: 'https://morning-tracker.vercel.app', label: 'Bias Tracker', external: true },
    { path: '/trade-chat', label: 'Trade Assistant' },
  ];

  const isActive = (path) => {
    // Special handling for multi-page features
    if (path === '/trade-chat') {
      return location.pathname.startsWith('/trade-chat') || location.pathname.startsWith('/trade-setup');
    }
    return location.pathname === path;
  };

  const handleNav = (e, path) => {
    e.preventDefault();
    if (location.pathname === path) return;
    document.body.classList.add('page-fade-out');
    setTimeout(() => {
      navigate(path);
    }, 200);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className={`site-header ${scrolled ? 'scrolled' : ''}`}>
      <div className="header-container">
        {/* Logo Section */}
        <div className="logo-section">
          <Link to="/" className="logo">
            <div className="logo-text">
              <span className="logo-title">Hello, {user?.full_name || user?.email?.split('@')[0] || 'User'}</span> 
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <div className="nav-center">
          <nav className={`nav-menu ${isMenuOpen ? 'open' : ''}`}>
            {navItems.map((item) => {
              if (item.external) {
                return (
                  <a
                    key={item.label}
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="nav-item"
                  >
                    <span className="nav-label">{item.label}</span>
                  </a>
                );
              }
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`nav-item ${isActive(item.path) ? 'active' : ''}`}
                  onClick={(e) => { handleNav(e, item.path); setIsMenuOpen(false); }}
                >
                  <span className="nav-label">{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Header Controls */}
        <div className="header-controls">
          
          {/* Status Indicator */}
          <div className="status-indicator">
            <div className="status-dot"></div>
            <span className="status-text">Online</span>
          </div>

          {/* Logout Button */}
          <button className="logout-button" onClick={handleLogout} title="Logout">
            <svg className="logout-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M16 17L21 12L16 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M21 12H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>

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
              {navItems.map((item) => {
                if (item.external) {
                  return (
                    <a
                      key={item.label}
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mobile-nav-item"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <span className="nav-label">{item.label}</span>
                    </a>
                  );
                }
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`mobile-nav-item ${isActive(item.path) ? 'active' : ''}`}
                    onClick={(e) => { handleNav(e, item.path); setIsMenuOpen(false); }}
                  >
                    <span className="nav-label">{item.label}</span>
                  </Link>
                );
              })}
              
              {/* Mobile Logout Button */}
              <button
                className="mobile-nav-item logout-mobile"
                onClick={() => { handleLogout(); setIsMenuOpen(false); }}
              >
                <svg className="logout-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M16 17L21 12L16 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M21 12H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span className="nav-label">Logout</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

export default Header; 