import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import './Verification.css';

function VerificationPage() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Add a small delay to show loading state
    await new Promise(resolve => setTimeout(resolve, 500));

    const success = login(password);
    if (success) {
      navigate('/');
    } else {
      setError('Invalid access code. Please try again.');
      setPassword('');
    }
    setIsLoading(false);
  };

  return (
    <div className="verification-container">
      {/* Background Pattern */}
      <div className="background-pattern"></div>
      
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
            <h1 className="verification-title">Access Required</h1>
            <p className="verification-subtitle">
              Please enter your access code to continue to the dashboard
            </p>
          </div>

          <form onSubmit={handleSubmit} className="verification-form">
            <div className="form-group">
              <label htmlFor="password" className="form-label">
                Access Code
              </label>
              <div className="input-wrapper">
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`form-input ${error ? 'error' : ''}`}
                  placeholder="Enter access code"
                  required
                  disabled={isLoading}
                  autoFocus
                />
                <div className="input-icon">🔐</div>
              </div>
              {error && (
                <div className="error-message animate-fade-in">
                  <span className="error-icon">⚠️</span>
                  {error}
                </div>
              )}
            </div>

            <button
              type="submit"
              className={`btn btn-primary btn-large w-full ${isLoading ? 'loading' : ''}`}
              disabled={isLoading || !password.trim()}
            >
              {isLoading ? (
                <>
                  <span className="loading-spinner animate-spin">⏳</span>
                  <span>Verifying...</span>
                </>
              ) : (
                <>
                  <span>Access Dashboard</span>
                  <span>🚀</span>
                </>
              )}
            </button>
          </form>

          <div className="verification-footer">
            <div className="security-notice">
              <div className="security-icon">🔒</div>
              <div className="security-text">
                <div className="security-title">Secure Access</div>
                <div className="security-subtitle">
                  Your session will be remembered for 24 hours
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="verification-info animate-slide-up">
          <div className="info-card glass">
            <div className="info-header">
              <div className="info-icon">ℹ️</div>
              <div className="info-title">About Market Scanner</div>
            </div>
            <div className="info-content">
              <p>
                Professional market analysis platform providing real-time insights, 
                comprehensive data visualization, and powerful trading tools.
              </p>
              <div className="info-features">
                <div className="feature-item">
                  <span className="feature-icon">📊</span>
                  <span>EMA Technical Analysis</span>
                </div>
                <div className="feature-item">
                  <span className="feature-icon">📈</span>
                  <span>FDV Market Scanning</span>
                </div>
                <div className="feature-item">
                  <span className="feature-icon">🔄</span>
                  <span>Real-time Data Updates</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default VerificationPage; 