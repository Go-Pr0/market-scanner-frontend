import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import './Verification.css';

function VerificationPage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  // Redirect to login page since we now use JWT authentication
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/', { replace: true });
    } else {
      navigate('/login', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  return (
    <div className="verification-container">
      <div className="verification-content">
        <div className="verification-card glass animate-fade-in">
          <div className="verification-header">
            <div className="logo-section">
              <div className="logo-icon">📊</div>
              <div className="logo-text">
                <span className="logo-title text-gradient">Market Scanner</span>
                <span className="logo-subtitle">Professional</span>
              </div>
            </div>
            <h1 className="verification-title">Redirecting...</h1>
            <p className="verification-subtitle">
              Redirecting to login page...
            </p>
          </div>
          
          <div className="loading-spinner animate-spin">⏳</div>
        </div>
      </div>
    </div>
  );
}

export default VerificationPage; 