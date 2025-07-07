import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

function Footer() {
  const currentYear = new Date().getFullYear();

  const footerLinks = [
    {
      title: 'Tools',
      links: [
        { label: 'Dashboard', path: '/' },
        { label: 'EMA Scanner', path: '/trendspider' },
        { label: 'FDV Scanner', path: '/fully-diluted' },
        { label: 'Trade Assistant', path: '/trade-chat' }
      ]
    },
    {
      title: 'Resources',
      links: [
        { label: 'Documentation', path: '/docs' },
        { label: 'API Reference', path: '/api' },
        { label: 'Support', path: '/support' },
        { label: 'Status', path: '/status' }
      ]
    },
    {
      title: 'Legal',
      links: [
        { label: 'Privacy Policy', path: '/privacy' },
        { label: 'Terms of Service', path: '/terms' },
        { label: 'Disclaimer', path: '/disclaimer' },
        { label: 'Contact', path: '/contact' }
      ]
    }
  ];

  return (
    <footer className="site-footer">
      <div className="footer-container">
        
        {/* Main Footer Content */}
        <div className="footer-main">
          
          {/* Brand Section */}
          <div className="footer-brand">
            <div className="footer-logo">
              <span className="footer-logo-title">Everbloom Trading Portal</span>
            </div>
            <p className="footer-description">
              Professional market analysis and trading tools for informed decision making.
            </p>
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
        </div>

        {/* Footer Bottom */}
        <div className="footer-bottom">
          <div className="footer-bottom-content">
            <p className="copyright">
              © {currentYear} Trading Portal. All rights reserved. 
            </p>
            <p className="copyright">
              Made by: Noah Lampens - GoPro
            </p>
            <div className="footer-stats">
              <span className="stat-item">Real-time Data</span>
              <span className="stat-item">Secure Platform</span>
              <span className="stat-item">Professional Tools</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;