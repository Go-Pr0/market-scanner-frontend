import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import './Layout.css';

const FOOTER_HIDDEN_ROUTES = ['/trade-chat', '/trade-setup'];

function Layout({ children, className = '' }) {
  const location = useLocation();
  const showFooter = !FOOTER_HIDDEN_ROUTES.includes(location.pathname);

  // Fade-in on route change
  useEffect(() => {
    // Remove any existing fade-out class from previous page
    document.body.classList.remove('page-fade-out');

    document.body.classList.add('page-fade-in');
    const timer = setTimeout(() => {
      document.body.classList.remove('page-fade-in');
    }, 200);
    return () => clearTimeout(timer);
  }, [location.pathname]);

  return (
    <div className="layout-root">
      {/* Background Pattern */}
      <div className="background-pattern"></div>
      
      {/* Header */}
      <Header />
      
      {/* Main Content */}
      <main className={`main-content ${className}`}>
        <div className="content-wrapper">
          {children}
        </div>
      </main>
      
      {/* Footer - Always at bottom */}
      {showFooter && <Footer />}
    </div>
  );
}

export default Layout; 