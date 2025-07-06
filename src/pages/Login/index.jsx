import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContextNew';
import { checkEmailWhitelist } from '../../api';
import './Login.css';

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [fullName, setFullName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [emailWhitelisted, setEmailWhitelisted] = useState(null);
  const [checkingEmail, setCheckingEmail] = useState(false);

  const { login, register, isAuthenticated, error, clearError } = useAuth();
  const navigate = useNavigate();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  // Check email whitelist when email changes in register mode
  useEffect(() => {
    if (showRegister && email && email.includes('@')) {
      const checkEmail = async () => {
        setCheckingEmail(true);
        try {
          const response = await checkEmailWhitelist(email);
          setEmailWhitelisted(response.data.is_whitelisted);
        } catch (error) {
          console.error('Error checking email:', error);
          setEmailWhitelisted(false);
        } finally {
          setCheckingEmail(false);
        }
      };

      const timeoutId = setTimeout(checkEmail, 500); // Debounce
      return () => clearTimeout(timeoutId);
    }
  }, [email, showRegister]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearError();

    if (showRegister) {
      // Registration validation
      if (password !== confirmPassword) {
        return;
      }
      if (!emailWhitelisted) {
        return;
      }
      if (password.length < 8) {
        return;
      }

      setIsLoading(true);
      const result = await register({
        email,
        password,
        full_name: fullName || null
      });

      if (result.success) {
        navigate('/', { replace: true });
      }
      setIsLoading(false);
    } else {
      // Login
      setIsLoading(true);
      const result = await login(email, password);

      if (result.success) {
        navigate('/', { replace: true });
      }
      setIsLoading(false);
    }
  };

  const toggleMode = () => {
    setShowRegister(!showRegister);
    clearError();
    setEmailWhitelisted(null);
    setPassword('');
    setConfirmPassword('');
    setFullName('');
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1 className="login-title">
            <span className="text-gradient">Market Scanner</span>
          </h1>
          <p className="login-subtitle">
            {showRegister ? 'Create your account' : 'Sign in to your account'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          {showRegister && (
            <div className="form-group">
              <label htmlFor="fullName">Full Name (Optional)</label>
              <input
                type="text"
                id="fullName"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Enter your full name"
                className="form-input"
              />
            </div>
          )}

          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="form-input"
              required
            />
            {showRegister && email && (
              <div className="email-status">
                {checkingEmail ? (
                  <span className="checking">Checking email...</span>
                ) : emailWhitelisted === true ? (
                  <span className="whitelisted">✓ Email is whitelisted</span>
                ) : emailWhitelisted === false ? (
                  <span className="not-whitelisted">✗ Email is not whitelisted for registration</span>
                ) : null}
              </div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="form-input"
              required
              minLength={showRegister ? 8 : undefined}
            />
            {showRegister && password && password.length < 8 && (
              <span className="password-hint">Password must be at least 8 characters</span>
            )}
          </div>

          {showRegister && (
            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <input
                type="password"
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm your password"
                className="form-input"
                required
              />
              {confirmPassword && password !== confirmPassword && (
                <span className="password-mismatch">Passwords do not match</span>
              )}
            </div>
          )}

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="login-button"
            disabled={
              isLoading || 
              (showRegister && (!emailWhitelisted || password !== confirmPassword || password.length < 8))
            }
          >
            {isLoading ? 'Please wait...' : (showRegister ? 'Create Account' : 'Sign In')}
          </button>
        </form>

        <div className="login-footer">
          <p>
            {showRegister ? 'Already have an account?' : "Don't have an account?"}
            <button
              type="button"
              onClick={toggleMode}
              className="toggle-mode-button"
            >
              {showRegister ? 'Sign In' : 'Register'}
            </button>
          </p>
          
          {showRegister && (
            <div className="whitelist-notice">
              <p>
                <strong>Note:</strong> Registration is limited to whitelisted email addresses.
                Contact an administrator if your email is not whitelisted.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default LoginPage;