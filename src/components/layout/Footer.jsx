import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

function Footer() {
  const currentYear = new Date().getFullYear();

  const footerLinks = [
    {
      title: 'Product',
      links: [
        { label: 'Dashboard', path: '/' },
        { label: 'Market Data', path: '/fully-diluted' },
        { label: 'Analytics', path: '/analytics' },
        { label: 'API Documentation', path: '/docs' }
      ]
    },
    {
      title: 'Company',
      links: [
        { label: 'About Us', path: '/about' },
        { label: 'Contact', path: '/contact' },
        { label: 'Careers', path: '/careers' },
        { label: 'Blog', path: '/blog' }
      ]
    },
    {
      title: 'Support',
      links: [
        { label: 'Help Center', path: '/help' },
        { label: 'Community', path: '/community' },
        { label: 'Status Page', path: '/status' },
        { label: 'Bug Reports', path: '/bugs' }
      ]
    }
  ];

  const socialLinks = [
    { icon: '🐦', label: 'Twitter', url: 'https://twitter.com' },
    { icon: '📘', label: 'Facebook', url: 'https://facebook.com' },
    { icon: '💼', label: 'LinkedIn', url: 'https://linkedin.com' },
    { icon: '🐙', label: 'GitHub', url: 'https://github.com' }
  ];

  return (
    <footer className="site-footer">
      <div className="footer-container">
        {/* Main Footer Content */}
        <div className="footer-main">
          {/* Brand Section */}
          <div className="footer-brand">
            <div className="footer-logo">
              <div className="footer-logo-icon">📊</div>
              <div className="footer-logo-text">
                <span className="footer-logo-title">Market Scanner</span>
                <span className="footer-logo-subtitle">Pro</span>
              </div>
            </div>
            <p className="footer-description">
              Professional market analysis and real-time financial data insights. 
              Empowering traders and investors with cutting-edge tools.
            </p>
            <div className="social-links">
              {socialLinks.map((social, index) => (
                <a
                  key={index}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="social-link"
                  title={social.label}
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Footer Links */}
          <div className="footer-links">
            {footerLinks.map((section, index) => (
              <div key={index} className="footer-section">
                <h3 className="footer-section-title">{section.title}</h3>
                <ul className="footer-section-links">
                  {section.links.map((link, linkIndex) => (
                    <li key={linkIndex}>
                      <Link to={link.path} className="footer-link">
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Newsletter Section */}
          <div className="footer-newsletter">
            <h3 className="newsletter-title">Stay Updated</h3>
            <p className="newsletter-description">
              Get the latest market insights and product updates delivered to your inbox.
            </p>
            <div className="newsletter-form">
              <input
                type="email"
                placeholder="Enter your email"
                className="newsletter-input"
              />
              <button className="newsletter-btn">
                <span>Subscribe</span>
                <span className="newsletter-icon">📧</span>
              </button>
            </div>
            <p className="newsletter-disclaimer">
              We respect your privacy. Unsubscribe at any time.
            </p>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="footer-bottom">
          <div className="footer-bottom-left">
            <p>&copy; {currentYear} Market Scanner Pro. All rights reserved.</p>
            <div className="legal-links">
              <Link to="/privacy" className="legal-link">Privacy Policy</Link>
              <Link to="/terms" className="legal-link">Terms of Service</Link>
              <Link to="/cookies" className="legal-link">Cookie Policy</Link>
            </div>
          </div>
          
          <div className="footer-bottom-right">
            <div className="footer-stats">
              <div className="stat-item">
                <span className="stat-icon">⚡</span>
                <span className="stat-text">99.9% Uptime</span>
              </div>
              <div className="stat-item">
                <span className="stat-icon">🔒</span>
                <span className="stat-text">Bank-Grade Security</span>
              </div>
              <div className="stat-item">
                <span className="stat-icon">🚀</span>
                <span className="stat-text">Real-time Data</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="footer-decoration">
        <div className="decoration-line"></div>
        <div className="decoration-dots">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>
    </footer>
  );
}

export default Footer; 