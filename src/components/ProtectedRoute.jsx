import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

function ProtectedRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuth();

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="loading-content">
          <div className="loading-spinner animate-spin">⏳</div>
          <div className="loading-text">Loading...</div>
        </div>
      </div>
    );
  }

  // Redirect to verification if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/verify" replace />;
  }

  // Render the protected content
  return children;
}

export default ProtectedRoute; 